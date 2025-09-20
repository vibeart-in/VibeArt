// /api/image/generate/route.ts
import { createClient } from "@/src/lib/supabase/server";
import { NextResponse } from "next/server";
import Replicate from "replicate";

// --- Environment Variable Checks ---
if (!process.env.REPLICATE_API_TOKEN)
  throw new Error("REPLICATE_API_TOKEN is not set");
if (!process.env.WEBHOOK_HOST) throw new Error("WEBHOOK_HOST is not set");
if (!process.env.RUNNING_HUB_API_KEY)
  throw new Error("RUNNING_HUB_API_KEY is not set");

// --- Client Initialization ---
const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });
const WEBHOOK_HOST = process.env.WEBHOOK_HOST;

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    console.log(body);
    const {
      parameters,
      conversationId: initialConversationId,
      modelIdentifier,
      modelCredit,
      modelProvider,
    } = body;

    // --- Credit Check ---
    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_credits, bonus_credits")
      .eq("user_id", user.id)
      .single();

    if (
      !profile ||
      profile.subscription_credits + profile.bonus_credits < modelCredit
    ) {
      return NextResponse.json(
        { error: "Insufficient credits." },
        { status: 402 }
      );
    }

    // STEP 1: Create job and message records without deducting credits.
    const { data, error } = await supabase.rpc("create_job_and_message", {
      p_user_id: user.id,
      p_prompt: parameters?.prompt || "",
      p_model: modelIdentifier,
      p_parameters: parameters,
      p_credit_cost: modelCredit,
      p_initial_conversation_id: initialConversationId,
    });

    if (error) throw error;

    const { conversation_id: currentConversationId, job_id: newJobId } =
      data[0];

    // --- Provider-specific Logic ---
    if (modelProvider === "running_hub") {
      // Define the webhook URL that RunningHub will call upon completion.
      // We include our internal job ID to easily map the notification back to our system.
      const webhookUrl = `${WEBHOOK_HOST}/api/webhooks/runninghub?jobId=${newJobId}`;

      // STEP 2: Trigger the prediction with RunningHub.
      const runningHubResponse = await fetch(
        "https://www.runninghub.ai/task/openapi/ai-app/run",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            webappId: modelIdentifier,
            apiKey: process.env.RUNNING_HUB_API_KEY,
            webhookUrl: webhookUrl, // <-- ADD THIS LINE
            nodeInfoList: [
              {
                nodeId: "3", // As per the provided example, adjust if needed
                fieldName: "prompt",
                fieldValue: parameters?.prompt || "",
                description: null,
              },
            ],
          }),
        }
      );

      if (!runningHubResponse.ok) {
        const errorBody = await runningHubResponse.text();
        throw new Error(
          `RunningHub API request failed with status ${runningHubResponse.status}: ${errorBody}`
        );
      }

      const runningHubData = await runningHubResponse.json();
      const taskId = runningHubData?.data?.taskId;

      if (!taskId) {
        throw new Error(
          `Could not find taskId in RunningHub response: ${JSON.stringify(
            runningHubData
          )}`
        );
      }

      // STEP 3: Update our job record with the RunningHub task ID and initial status.
      await supabase
        .from("jobs")
        .update({
          prediction_id: taskId, // This is the RunningHub taskId
          job_status: runningHubData?.data?.taskStatus || "RUNNING",
        })
        .eq("id", newJobId);
    } else {
      // STEP 2: Trigger the prediction with Replicate.
      const webhookUrl = `${WEBHOOK_HOST}/api/webhooks?jobId=${newJobId}`;

      const prediction = await replicate.predictions.create({
        model: modelIdentifier,
        input: parameters,
        webhook: webhookUrl,
        webhook_events_filter: ["completed"],
      });

      // STEP 3: Update our job record with the Replicate prediction ID.
      await supabase
        .from("jobs")
        .update({
          prediction_id: prediction.id,
          job_status: prediction.status,
        })
        .eq("id", newJobId);
    }

    // --- Common Success Response ---
    return NextResponse.json(
      { conversationId: currentConversationId },
      { status: 200 }
    );
  } catch (error: any) {
    console.error(`[Image Generation Error]: ${error.message}`);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again later." },
      { status: 500 }
    );
  }
}
