// app/api/image/generate/route.ts
import { createClient } from "@/src/lib/supabase/server";
import { NextResponse, after } from "next/server";
import Replicate from "replicate";

// --- Environment Variable Checks ---
if (!process.env.REPLICATE_API_TOKEN) throw new Error("REPLICATE_API_TOKEN is not set");
if (!process.env.WEBHOOK_HOST) throw new Error("WEBHOOK_HOST is not set");
if (!process.env.RUNNING_HUB_API_KEY) throw new Error("RUNNING_HUB_API_KEY is not set");

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
    const {
      parameters,
      conversationId: initialConversationId,
      modelIdentifier,
      modelCredit,
      modelProvider,
      conversationType,
    } = body;

    // --- Credit Check (consider moving into RPC to reduce roundtrips) ---
    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_credits, bonus_credits")
      .eq("user_id", user.id)
      .single();

    if (!profile || profile.subscription_credits + profile.bonus_credits < modelCredit) {
      return NextResponse.json({ error: "Insufficient credits." }, { status: 402 });
    }

    // STEP 1: Create job + message (no external calls here)
    const prompt =
      parameters?.prompt ??
      (Array.isArray(parameters) ? parameters[0]?.fieldValue : undefined) ??
      "";

    const inputImageArray = Array.isArray(parameters?.image_input || parameters?.input_image)
      ? parameters?.image_input || parameters?.input_image
      : parameters?.image_input || parameters?.input_image
      ? [parameters?.image_input || parameters?.input_image]
      : [];

    const { data, error } = await supabase.rpc("create_job_and_message", {
      p_user_id: user.id,
      p_prompt: prompt,
      p_model: modelIdentifier,
      p_parameters: parameters,
      p_credit_cost: modelCredit,
      p_initial_conversation_id: initialConversationId,
      p_conversation_type: conversationType,
      p_input_image_urls: inputImageArray,
    });

    if (error) throw error;

    const { conversation_id: currentConversationId, job_id: newJobId } = data[0];

    // Return immediately so the client gets conversationId fast.
    const res = NextResponse.json({ conversationId: currentConversationId }, { status: 200 });

    // Schedule provider-triggering work AFTER the response has been sent.
    after(async () => {
      try {
        if (modelProvider === "running_hub") {
          const webhookUrl = `${WEBHOOK_HOST}/api/webhooks/runninghub?jobId=${newJobId}`;

          const rhRes = await fetch("https://www.runninghub.ai/task/openapi/ai-app/run", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            // Consider adding timeouts/retries if needed
            body: JSON.stringify({
              webappId: modelIdentifier,
              apiKey: process.env.RUNNING_HUB_API_KEY,
              webhookUrl,
              nodeInfoList: parameters,
            }),
          });

          if (rhRes.ok) {
            const runningHubData = await rhRes.json();
            const taskId = runningHubData?.data?.taskId;

            // Optional: update jobs with provider task id/status;
            // Or skip and let the webhook finalize all updates.
            if (taskId) {
              await supabase
                .from("jobs")
                .update({
                  prediction_id: taskId,
                  job_status: runningHubData?.data?.taskStatus || "RUNNING",
                })
                .eq("id", newJobId);
            }
          } else {
            const errText = await rhRes.text();
            console.error(`[RunningHub Error]: ${rhRes.status} ${errText}`);
          }
        } else {
          // Replicate path
          const webhookUrl = `${WEBHOOK_HOST}/api/webhooks?jobId=${newJobId}`;

          // Prefer webhooks to drive state; do not block the route on this call.
          const prediction = await replicate.predictions.create({
            model: modelIdentifier,
            input: parameters,
            webhook: webhookUrl,
            webhook_events_filter: ["completed"], // optionally include "start"
          });

          // Optional: update with prediction id/status now; otherwise rely on webhook.
          await supabase
            .from("jobs")
            .update({ prediction_id: prediction.id, job_status: prediction.status })
            .eq("id", newJobId);
        }
      } catch (e) {
        console.error("[Background provider trigger failed]", e);
        // Consider marking job as errored or retrying via a queue here.
      }
    });

    return res;
  } catch (error: any) {
    console.error(`[Image Generation Error]: ${error.message}`);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again later." },
      { status: 500 }
    );
  }
}
