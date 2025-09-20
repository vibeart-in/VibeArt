import { createClient } from "@/src/lib/supabase/server";
import { NextResponse } from "next/server";

// This is the Supabase RPC function name that will handle the atomic update.
// You will need to create this function in your Supabase SQL editor.
const HANDLE_JOB_COMPLETION_RPC = "handle_job_completion";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get("jobId");

    if (!jobId) {
      return NextResponse.json({ error: "Missing jobId" }, { status: 400 });
    }

    console.log(`[RunningHub Webhook] Received for jobId: ${jobId}`);

    // It's good practice to verify the request is from RunningHub if they provide a signature.
    // The docs don't specify one, so we proceed with caution.

    // Get the job from our database to find the RunningHub taskId (stored as prediction_id)
    const { data: job, error: jobError } =  await supabase
      .from("jobs")
      .select("prediction_id")
      .eq("id", jobId)
      .single();

    if (jobError || !job) {
      throw new Error(`Job with ID ${jobId} not found.`);
    }
    console.log(`[RunningHub Webhook] Job found in database:`, job);
    const taskId = job.prediction_id;

    // Now, call the RunningHub API to get the actual output
    const outputsResponse = await fetch(
      "https://www.runninghub.ai/task/openapi/outputs",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiKey: process.env.RUNNING_HUB_API_KEY!,
          taskId: taskId,
        }),
      }
    );

    if (!outputsResponse.ok) {
      throw new Error(
        `Failed to fetch outputs from RunningHub for taskId ${taskId}. Status: ${outputsResponse.status}`
      );
    }

    const result = await outputsResponse.json();

    let finalStatus: "succeeded" | "failed";
    let output: any;

    // Based on the API docs, code 0 is success
    if (result.code === 0 && result.data && Array.isArray(result.data)) {
      finalStatus = "succeeded";
      // Assuming the first item in the data array contains the image URL
      const imageUrl = result.data[0]?.fileUrl;
      if (!imageUrl) {
        throw new Error(
          `RunningHub output succeeded but fileUrl was missing. Payload: ${JSON.stringify(
            result
          )}`
        );
      }
      output = [imageUrl]; // Store as an array to match Replicate's format
    } else {
      finalStatus = "failed";
      // Capture the failure reason
      output = result.data?.failedReason || result.msg || "Unknown error";
      console.error(
        `[RunningHub Webhook] Task failed for jobId ${jobId}:`,
        output
      );
    }

    // // Use a Supabase RPC function to atomically update the job, message, and user credits.
    // const { error: rpcError } = await supabase.rpc(HANDLE_JOB_COMPLETION_RPC, {
    //   job_id: jobId,
    //   job_status: finalStatus,
    //   job_output: output,
    // });

    // if (rpcError) {
    //   throw new Error(
    //     `Failed to call RPC ${HANDLE_JOB_COMPLETION_RPC}: ${rpcError.message}`
    //   );
    // }

    return NextResponse.json({ message: "Webhook processed" }, { status: 200 });
  } catch (error: any) {
    console.error(`[RunningHub Webhook Error]: ${error.message}`);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}