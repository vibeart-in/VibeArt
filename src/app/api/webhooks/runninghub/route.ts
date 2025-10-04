// /api/webhook/runninghub/route.ts
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const getSupabaseAdmin = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error("Missing Supabase admin credentials.");
  }
  return createClient(supabaseUrl, supabaseServiceRoleKey);
};

export async function POST(req: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get("jobId");
    const webhookOutput = await req.json();

    console.log("webhookOutput:", webhookOutput);
    const eventData = JSON.parse(webhookOutput.eventData);

    const taskCostTime = eventData.data[0].taskCostTime;

    const fileUrls = eventData.data.map(
      (item: { fileUrl: string }) => item.fileUrl
    );

    console.log("taskCostTime:", taskCostTime);
    console.log("fileUrls:", fileUrls);

    if (!jobId) {
      return NextResponse.json({ error: "Missing jobId" }, { status: 400 });
    }

    console.log(`[RunningHub Webhook] Received for jobId: ${jobId}`);

    // Get the job from our database to find the RunningHub taskId (stored as prediction_id)
    const { data: currentJob, error: jobError } = await supabaseAdmin
      .from("jobs")
      .select("job_status")
      .eq("id", jobId)
      .single();

    if (jobError || !currentJob) {
      throw new Error(`Job with ID ${jobId} not found.`);
    }

    if (currentJob && ["succeeded", "failed"].includes(currentJob.job_status)) {
      console.log(
        `Job ${jobId} already processed. Ignoring duplicate webhook.`
      );
      return NextResponse.json(
        { detail: "Webhook already processed." },
        { status: 200 }
      );
    }
    if (eventData.msg !== "success") {
      await handleFailedPrediction(jobId, eventData.msg, supabaseAdmin);
      return NextResponse.json(
        { detail: "Processed failed prediction." },
        { status: 200 }
      );
    }

    if (eventData.msg === "success") {
      await handleSuccessfulPrediction(jobId, fileUrls, supabaseAdmin);
    }

    return NextResponse.json(
      { detail: "Webhook processed successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error(`[RunningHub Webhook Error]: ${error.message}`);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

async function handleFailedPrediction(
  jobId: string,
  errorMessage: string,
  supabaseAdmin: SupabaseClient
) {
  // Update job status in the database
  await supabaseAdmin
    .from("jobs")
    .update({ job_status: "failed", error_message: errorMessage })
    .eq("id", jobId);

  // Call the database function to refund credits
  const { error: refundError } = await supabaseAdmin.rpc("refund_job_credits", {
    p_job_id: jobId,
  });
  if (refundError) {
    console.error(
      `CRITICAL: Failed to refund credits for job ${jobId}:`,
      refundError.message
    );
    // Here you should add monitoring/alerting
  } else {
    console.log(`Successfully refunded credits for failed job ${jobId}.`);
  }
}

async function handleSuccessfulPrediction(
  jobId: string,
  fileUrl: string[],
  supabaseAdmin: SupabaseClient
) {

  if (fileUrl.length === 0) {
    console.warn(
      `Job ${jobId} succeeded but had no output. Marking as failed.`
    );
    throw new Error("Prediction succeeded but returned no output images.");
  }

  const downloadAndStoreImage = async (
    imageUrl: string,
    index: number
  ): Promise<string> => {
    const filename = `${jobId}-${index}.png`;
    try {
      const response = await fetch(imageUrl);
      if (!response.ok)
        throw new Error(`Download failed: ${response.statusText}`);
      if (!response.body) throw new Error("Response body is null.");

      const { error: uploadError } = await supabaseAdmin.storage
        .from("generated-images")
        .upload(filename, response.body, { upsert: true, duplex: "half" });

      if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

      const {
        data: { publicUrl },
      } = supabaseAdmin.storage.from("generated-images").getPublicUrl(filename);
      return publicUrl;
    } catch (error: any) {
      console.error(
        `Failed to process image ${index} for job ${jobId}. URL: ${imageUrl}`,
        error
      );
      throw error;
    }
  };

  // This part is now safe because imageUrls is GUARANTEED to be an array.
  const downloadPromises = fileUrl.map((url: string, index: number) =>
    downloadAndStoreImage(url, index)
  );

  const supabaseImageUrls = await Promise.all(downloadPromises);

  await supabaseAdmin.functions.invoke("fetch-and-upload")

  const { error } = await supabaseAdmin.rpc("process_successful_job", {
    p_job_id: jobId,
    p_image_urls: supabaseImageUrls,
  });

  if (error) {
    throw new Error(
      `Database transaction failed for job ${jobId}: ${error.message}`
    );
  }

  console.log(
    `Successfully processed and stored ${supabaseImageUrls.length} image(s) for job ${jobId}.`
  );
}
