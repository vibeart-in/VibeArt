import { NextResponse, after } from "next/server";
import Replicate from "replicate";
import { createClient } from "@/src/lib/supabase/server";

// --- Environment Variable Checks ---
if (!process.env.REPLICATE_API_TOKEN) throw new Error("REPLICATE_API_TOKEN is not set");
if (!process.env.WEBHOOK_HOST) throw new Error("WEBHOOK_HOST is not set");
if (!process.env.RUNNING_HUB_API_KEY) throw new Error("RUNNING_HUB_API_KEY is not set");

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });
const WEBHOOK_HOST = process.env.WEBHOOK_HOST;

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    // 1. Auth Check
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      canvasId, // Required for Canvas flow
      parameters, // JSON object for AI input
      modelName, // e.g. "Flux Pro"
      modelIdentifier, // e.g. "replicate/flux-1.1-pro"
      modelCredit, // Cost of the operation
      modelProvider, // "replicate" or "running_hub"
    } = body;

    console.log("REQUEST", body);

    if (!canvasId) {
      return NextResponse.json({ error: "canvasId is required" }, { status: 400 });
    }

    // 2. Credit Check
    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_credits, bonus_credits")
      .eq("user_id", user.id)
      .single();

    const totalCredits = (profile?.subscription_credits || 0) + (profile?.bonus_credits || 0);
    if (!profile || totalCredits < modelCredit) {
      return NextResponse.json({ error: "Insufficient credits." }, { status: 402 });
    }

    // 3. Initialize Job in DB
    // This uses the RPC we created that links to jobs.canvas_id
    const { data, error: rpcError } = await supabase.rpc("create_canvas_job", {
      p_user_id: user.id,
      p_canvas_id: canvasId,
      p_credit_cost: Number(modelCredit),
      p_model_name: String(modelName),
      p_parameters: parameters ?? {},
    });

    if (rpcError) throw rpcError;

    // The RPC returns { job_id: uuid }
    const newJobId = data[0].job_id;

    // 4. Return immediately to the UI
    const res = NextResponse.json({ jobId: newJobId }, { status: 200 });

    // 5. Trigger AI Provider in the background
    after(async () => {
      try {
        if (modelProvider === "running_hub") {
          const webhookUrl = `${WEBHOOK_HOST}/webhook/runninghub?jobId=${newJobId}`;

          const rhRes = await fetch("https://www.runninghub.ai/task/openapi/ai-app/run", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              webappId: modelIdentifier,
              apiKey: process.env.RUNNING_HUB_API_KEY,
              webhookUrl,
              nodeInfoList: parameters,
            }),
          });

          if (rhRes.ok) {
            const rhData = await rhRes.json();
            const taskId = rhData?.data?.taskId;
            if (taskId) {
              await supabase
                .from("jobs")
                .update({
                  prediction_id: taskId,
                  job_status: rhData?.data?.taskStatus || "RUNNING",
                })
                .eq("id", newJobId);
            }
          }
        } else {
          // Replicate Path
          const webhookUrl = `${WEBHOOK_HOST}/webhook/replicate?jobId=${newJobId}`;

          const prediction = await replicate.predictions.create({
            model: modelIdentifier,
            input: parameters,
            webhook: webhookUrl,
            webhook_events_filter: ["completed"],
          });

          await supabase
            .from("jobs")
            .update({
              prediction_id: prediction.id,
              job_status: prediction.status,
            })
            .eq("id", newJobId);
        }
      } catch (e) {
        console.error(`[Canvas Background Trigger Failed for job ${newJobId}]`, e);
        await supabase
          .from("jobs")
          .update({
            job_status: "failed",
            error_message: "Provider Trigger Failed",
          })
          .eq("id", newJobId);
      }
    });

    return res;
  } catch (error: any) {
    console.error(`[Canvas Generation Error]: ${error.message}`);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
