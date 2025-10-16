// app/api/generate/app/route.ts

import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/src/lib/supabase/server";

// Assuming NodeParam is available at this path or define it here
type NodeParam = {
  nodeId: string;
  fieldName: string;
  fieldValue: string;
  description?: string;
  fieldData?: string;
};

// --- Environment Variables ---
const RUNNING_HUB_API_ENDPOINT = "https://www.runninghub.ai/task/openapi/ai-app/run";
const RUNNING_HUB_API_KEY = process.env.RUNNING_HUB_API_KEY;
// For local development, this might be `http://localhost:3000`. For Vercel, it's auto-set.
const WEBHOOK_HOST = process.env.WEBHOOK_HOST || process.env.NEXT_PUBLIC_VERCEL_URL;

export async function POST(req: NextRequest) {
  const supabase = await createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const {
      appId,
      parameters,
      inputMediaStoreUrls,
    }: { appId: string; parameters: NodeParam[]; inputMediaStoreUrls: string[] | null } =
      await req.json();

    if (!appId || !parameters) {
      return NextResponse.json({ message: "Missing appId or parameters" }, { status: 400 });
    }

    // 1. Fetch AI App details (cost, webappId, base parameters)
    const { data: aiApp, error: aiAppError } = await supabase
      .from("ai_apps")
      .select("id, webappId, parameters, cost, app_name, instance_type")
      .eq("id", appId)
      .single();

    if (aiAppError || !aiApp) {
      console.error("AI App not found or database error:", aiAppError);
      return NextResponse.json({ message: "AI App not found" }, { status: 404 });
    }
    console.log(inputMediaStoreUrls);

    // 2. Handle input images: Store permanent paths and generate signed URLs for RunningHub
    const inputImagesToLink: string[] = []; // Collect image IDs to link to message

    // Store input image in public.images table
    inputMediaStoreUrls?.map(async (inputMediaStoreUrl: string) => {
      const { data: newImage, error: imageInsertError } = await supabase
        .from("images")
        .insert({
          user_id: user.id,
          image_url: inputMediaStoreUrl,
          is_public: false,
        })
        .select("id")
        .single();

      if (imageInsertError || !newImage) {
        console.error("Error inserting input image:", imageInsertError);
        return NextResponse.json({ message: "Failed to store input image" }, { status: 500 });
      }
      inputImagesToLink.push(newImage.id);
    });

    // 3. Find or create a conversation for this user and app
    const { data: conversation, error: convError } = await supabase
      .from("conversations")
      .select("id")
      .eq("user_id", user.id)
      .eq("ai_app_id", appId)
      .maybeSingle();

    if (convError) {
      console.error("Error fetching conversation:", convError);
      return NextResponse.json({ message: "Database error" }, { status: 500 });
    }

    let conversationId: string;
    if (!conversation) {
      const { data: newConversation, error: newConvError } = await supabase
        .from("conversations")
        .insert({
          user_id: user.id,
          ai_app_id: appId,
          title: `${aiApp.app_name}`, // Or use aiApp.app_name if available
          conversation_type: "ai-apps", // Assuming 'generate' is the correct enum value
        })
        .select("id")
        .single();

      if (newConvError || !newConversation) {
        console.error("Error creating conversation:", newConvError);
        return NextResponse.json({ message: "Failed to create conversation" }, { status: 500 });
      }
      conversationId = newConversation.id;
    } else {
      conversationId = conversation.id;
    }

    // 4. Create the message (representing user's request)

    const { data: newMessage, error: messageError } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        positive_prompt: aiApp.app_name,
        sequence_number: 1,
      })
      .select("id")
      .single();

    if (messageError || !newMessage) {
      console.error("Error creating message:", messageError);
      return NextResponse.json({ message: "Failed to create message" }, { status: 500 });
    }
    const messageId = newMessage.id;

    // 5. Link input images to message (if images were provided)
    if (inputImagesToLink.length > 0) {
      // Prepare batch insert
      const links = inputImagesToLink.map((imageId) => ({
        message_id: messageId,
        image_id: imageId,
      }));
      const { error: linkError } = await supabase.from("message_input_images").insert(links);
      if (linkError) {
        console.error("Error linking input images to message:", linkError);
        // This is non-critical for job execution but important for history, log it.
      }
    }

    // 6. Create the job entry
    console.log("clientParameters2222", parameters);

    const { data: newJob, error: jobError } = await supabase
      .from("jobs")
      .insert({
        user_id: user.id,
        conversation_id: conversationId,
        ai_app_id: appId,
        parameters: parameters, // Store the full merged parameters in DB
        credit_cost: aiApp.cost,
        job_status: "pending", // Initial status
      })
      .select("id")
      .single();

    if (jobError || !newJob) {
      console.error("Error creating job:", jobError);
      return NextResponse.json({ message: "Failed to create job" }, { status: 500 });
    }
    const newJobId = newJob.id;

    // 7. Update the message with the triggered_job_id
    const { error: updateMessageError } = await supabase
      .from("messages")
      .update({ triggered_job_id: newJobId })
      .eq("id", messageId);

    if (updateMessageError) {
      console.error("Error updating message with job ID:", updateMessageError);
      // This is not critical enough to prevent the job, but log it.
    }

    // 8. Call the external AI service (RunningHub)
    if (!RUNNING_HUB_API_KEY) {
      console.error("RUNNING_HUB_API_KEY is not set.");
      // Mark job as failed and return an error to user
      await supabase
        .from("jobs")
        .update({
          job_status: "failed",
          error_message: "Server config error: Missing API Key",
        })
        .eq("id", newJobId);
      return NextResponse.json(
        { message: "Server configuration error: Missing API Key" },
        { status: 500 },
      );
    }
    if (!WEBHOOK_HOST) {
      console.error("WEBHOOK_HOST is not set.");
      await supabase
        .from("jobs")
        .update({
          job_status: "failed",
          error_message: "Server config error: Missing Webhook Host",
        })
        .eq("id", newJobId);
      return NextResponse.json(
        { message: "Server configuration error: Missing Webhook Host" },
        { status: 500 },
      );
    }

    const webhookUrl = `${WEBHOOK_HOST}/api/webhooks/runninghub?jobId=${newJobId}`;

    const runningHubBody = {
      webappId: aiApp.webappId,
      apiKey: RUNNING_HUB_API_KEY,
      webhookUrl,
      nodeInfoList: parameters,
      instanceType: aiApp.instance_type,
    };

    const rhRes = await fetch(RUNNING_HUB_API_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(runningHubBody),
      // Consider adding a timeout for the external API call
    });

    if (!rhRes.ok) {
      const rhErrorData = await rhRes.json();
      console.error("RunningHub API Error:", rhErrorData);
      // Mark job as failed and include the error message
      await supabase
        .from("jobs")
        .update({
          job_status: "failed",
          error_message: rhErrorData.message || "External AI service failed",
        })
        .eq("id", newJobId);
      return NextResponse.json(
        {
          message: `External AI service error: ${rhErrorData.message || "Unknown error"}`,
        },
        { status: rhRes.status },
      );
    }

    const rhSuccessData = await rhRes.json();
    // RunningHub's response might contain a prediction_id or similar, store it.
    // Also, update job_status to 'running' or 'submitted' now that it's sent.
    await supabase
      .from("jobs")
      .update({
        prediction_id: rhSuccessData.predictionId || null,
        job_status: "running", // Or 'submitted'
      })
      .eq("id", newJobId);

    return NextResponse.json({ jobId: newJobId }, { status: 200 });
  } catch (error: any) {
    console.error("Unhandled API error:", error);
    return NextResponse.json(
      { message: error.message || "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
