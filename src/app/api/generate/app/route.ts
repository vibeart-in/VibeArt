// app/api/generate/app/route.ts

import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/src/lib/supabase/server";
import { NodeParam } from "@/src/types/BaseType";

const RUNNING_HUB_API_ENDPOINT = "https://www.runninghub.ai/task/openapi/ai-app/run";
const RUNNING_HUB_API_KEY = process.env.RUNNING_HUB_API_KEY;
const WEBHOOK_HOST = process.env.WEBHOOK_HOST;

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
      parameters: clientParameters,
      inputMediaStoreUrls,
    }: { appId: string; parameters: NodeParam[]; inputMediaStoreUrls: string[] } = await req.json();

    if (!appId || !clientParameters) {
      return NextResponse.json({ message: "Missing appId or parameters" }, { status: 400 });
    }

    // 1. Fetch AI App details (cost, webappId, base parameters)
    const { data: aiApp, error: aiAppError } = await supabase
      .from("ai_apps")
      .select("id, webappId, cost, app_name, instance_type")
      .eq("id", appId)
      .single();

    if (aiAppError || !aiApp) {
      console.error("AI App not found or database error:", aiAppError);
      return NextResponse.json({ message: "AI App not found" }, { status: 404 });
    }

    const parametersForRunningHub = structuredClone(clientParameters);
    const inputImagesForDB: { image_url: string; is_public: boolean }[] = inputMediaStoreUrls.map(
      (url) => ({
        image_url: url,
        is_public: false,
      }),
    );

    // 3. Call the RPC function to handle all database operations in one go
    const { data: newJobId, error: rpcError } = await supabase.rpc(
      "create_app_job_and_conversation",
      {
        user_id_param: user.id,
        app_id_param: appId,
        app_name_param: aiApp.app_name,
        app_cost_param: aiApp.cost,
        client_parameters_param: clientParameters, // Store original params in DB
        input_images_param: inputImagesForDB,
      },
    );

    if (rpcError || !newJobId) {
      console.error("Error in RPC function create_job_and_conversation:", rpcError);
      return NextResponse.json({ message: "Failed to create job via RPC" }, { status: 500 });
    }

    // 4. Call the external AI service (RunningHub)
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

    const webhookUrl = `${WEBHOOK_HOST}/webhook/runninghub?jobId=${newJobId}`;

    const runningHubBody = {
      webappId: aiApp.webappId,
      apiKey: RUNNING_HUB_API_KEY,
      webhookUrl,
      nodeInfoList: parametersForRunningHub,
      instanceType: aiApp.instance_type,
    };

    console.log("RH", runningHubBody);

    const rhRes = await fetch(RUNNING_HUB_API_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(runningHubBody),
    });

    if (!rhRes.ok) {
      const rhErrorData = await rhRes.json();
      console.error("RunningHub API Error:", rhErrorData);
      // Mark job as failed
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

    // Update job status to 'running'
    await supabase
      .from("jobs")
      .update({
        prediction_id: rhSuccessData.predictionId || null,
        job_status: "running",
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
