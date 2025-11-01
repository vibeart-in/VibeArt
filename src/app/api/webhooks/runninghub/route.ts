//api/webhook/runninghub/route.ts
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Queue } from "bullmq";
import IORedis from "ioredis";
import { NextResponse } from "next/server";

const redisConnection = new IORedis(process.env.REDIS_URL!);
const mediaQueue = new Queue("media-processing", { connection: redisConnection });

const getSupabaseAdmin = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error("Missing Supabase admin credentials.");
  }
  return createClient(supabaseUrl, supabaseServiceRoleKey);
};

export async function POST(req: Request) {
  // <<< Change 1: Declare variables here to make them available in the catch block
  let jobId: string | null = null;
  const supabaseAdmin: SupabaseClient = getSupabaseAdmin();

  try {
    // <<< Change 2: Assign to the outer scope variables
    const { searchParams } = new URL(req.url);
    jobId = searchParams.get("jobId"); // Assign to the outer `jobId`

    if (!jobId) {
      // This will be caught by the general check below, but good to have early exit
      return NextResponse.json({ error: "Missing jobId" }, { status: 400 });
    }

    const webhookOutput = await req.json();
    console.log("webhookOutput:", webhookOutput);

    // Safer parsing: check if eventData is a string before parsing
    const eventData =
      typeof webhookOutput.eventData === "string"
        ? JSON.parse(webhookOutput.eventData)
        : webhookOutput.eventData;

    if (!eventData || !eventData.data) {
      throw new Error("Invalid or missing eventData structure in webhook payload.");
    }

    const taskCostTime = eventData.data[0]?.taskCostTime;
    const outputUrls = eventData.data.map((item: { fileUrl: string }) => item.fileUrl);

    console.log("taskCostTime:", taskCostTime);
    console.log("fileUrls:", outputUrls);

    console.log(`[RunningHub Webhook] Received for jobId: ${jobId}`);

    // Get the job from our database
    const { data: currentJob, error: jobFetchError } = await supabaseAdmin
      .from("jobs")
      .select("job_status, user_id")
      .eq("id", jobId)
      .single();

    if (jobFetchError) {
      console.error(`Job lookup failed for ${jobId}:`, jobFetchError.message || jobFetchError);
      return NextResponse.json({ detail: "Job not found" }, { status: 404 });
    }

    if (currentJob && ["succeeded", "failed"].includes(currentJob.job_status)) {
      console.log(`Job ${jobId} already processed. Ignoring duplicate webhook.`);
      return NextResponse.json({ detail: "Webhook already processed." }, { status: 200 });
    }

    // Handle explicit failure from the service
    if (eventData.msg !== "success") {
      await handleFailedPrediction(jobId, eventData.msg, supabaseAdmin);
      return NextResponse.json({ detail: "Processed failed prediction." }, { status: 200 });
    }

    // Handle success
    if (eventData.msg === "success") {
      await mediaQueue.add(
        "process",
        { jobId, userId: currentJob.user_id, outputUrls },
        { attempts: 3, backoff: { type: "exponential", delay: 500 } },
      );
      // await handleSuccessfulPrediction(jobId, fileUrls, supabaseAdmin, userId);
    }

    return NextResponse.json({ detail: "Webhook processed successfully" }, { status: 200 });
  } catch (error: any) {
    const errorMessage = error.message || "An unknown error occurred.";
    console.error(`[RunningHub Webhook Error]: ${errorMessage}`);

    // <<< Change 3: Call handleFailedPrediction if we have a jobId
    if (jobId && supabaseAdmin) {
      console.log(`Attempting to mark job ${jobId} as failed due to an unexpected error.`);
      // We don't await this inside the catch block to avoid unhandled promise rejections
      // if this call itself fails. We prioritize returning the 500 error.
      handleFailedPrediction(
        jobId,
        `Webhook processing error: ${errorMessage}`,
        supabaseAdmin,
      ).catch((failError) => {
        // Log a critical error if even the failure handling fails
        console.error(`CRITICAL: Failed to handle failure for job ${jobId}:`, failError.message);
      });
    } else {
      console.error(
        "Cannot mark job as failed because jobId was not available at the time of error.",
      );
    }

    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

async function handleFailedPrediction(
  jobId: string,
  errorMessage: string,
  supabaseAdmin: SupabaseClient,
) {
  // Update job status in the database
  await supabaseAdmin
    .from("jobs")
    .update({ job_status: "failed", error_message: errorMessage })
    .eq("id", jobId);

  console.log(`Marked job ${jobId} as failed.`);

  // Call the database function to refund credits
  const { error: refundError } = await supabaseAdmin.rpc("refund_job_credits", {
    p_job_id: jobId,
  });

  if (refundError) {
    console.error(`CRITICAL: Failed to refund credits for job ${jobId}:`, refundError.message);
    // Here you should add monitoring/alerting
  } else {
    console.log(`Successfully refunded credits for failed job ${jobId}.`);
  }
}
