// /api/webhook/runninghub/route.ts
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import path from "path";
import sharp from "sharp";

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

    const fileUrls = eventData.data.map((item: { fileUrl: string }) => item.fileUrl);

    console.log("taskCostTime:", taskCostTime);
    console.log("fileUrls:", fileUrls);

    if (!jobId) {
      return NextResponse.json({ error: "Missing jobId" }, { status: 400 });
    }

    console.log(`[RunningHub Webhook] Received for jobId: ${jobId}`);

    // Get the job from our database to find the RunningHub taskId (stored as prediction_id)
    const { data: currentJob, error: jobFetchError } = await supabaseAdmin
      .from("jobs")
      .select("job_status, user_id")
      .eq("id", jobId)
      .single();

    if (jobFetchError) {
      console.error(`Job lookup failed for ${jobId}:`, jobFetchError.message || jobFetchError);
      // If job not found, respond 404 (do not proceed)
      return NextResponse.json({ detail: "Job not found" }, { status: 404 });
    }

    if (currentJob && ["succeeded", "failed"].includes(currentJob.job_status)) {
      console.log(`Job ${jobId} already processed. Ignoring duplicate webhook.`);
      return NextResponse.json({ detail: "Webhook already processed." }, { status: 200 });
    }
    if (eventData.msg !== "success") {
      await handleFailedPrediction(jobId, eventData.msg, supabaseAdmin);
      return NextResponse.json({ detail: "Processed failed prediction." }, { status: 200 });
    }

    if (eventData.msg === "success") {
      const userId: string = currentJob.user_id;
      await handleSuccessfulPrediction(jobId, fileUrls, supabaseAdmin, userId);
    }

    return NextResponse.json({ detail: "Webhook processed successfully" }, { status: 200 });
  } catch (error: any) {
    console.error(`[RunningHub Webhook Error]: ${error.message}`);
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

async function processAndStoreMedia(
  mediaUrl: string,
  index: number,
  userId: string,
  jobId: string,
  supabaseAdmin: SupabaseClient,
): Promise<{ imageUrl: string; thumbnailUrl: string }> {
  // Derive a base file name
  const urlPath = new URL(mediaUrl).pathname;
  const ext = path.extname(urlPath) || ".webp";
  const baseFileName = `${index}${ext}`;

  // Define structured paths for original and thumbnail
  const originalFilePath = `${userId}/${jobId}/${baseFileName}`;
  const thumbnailFilePath = `${userId}/${jobId}/thumbnail/${baseFileName}`;

  try {
    // 1. Download the remote file into a buffer
    const response = await fetch(mediaUrl);
    if (!response.ok) throw new Error(`Download failed: ${response.statusText}`);
    const imageBuffer = Buffer.from(await response.arrayBuffer());
    const contentType = response.headers.get("content-type") || "image/webp";

    // 2. Generate thumbnail buffer using sharp
    const thumbnailBuffer = await sharp(imageBuffer)
      .resize({ width: 256 }) // Resize to 256px width, auto height
      .webp({ quality: 80 }) // Convert to WebP for efficiency
      .toBuffer();

    // 3. Upload both files in parallel
    const [originalUploadResult, thumbnailUploadResult] = await Promise.all([
      supabaseAdmin.storage.from("generated-media").upload(originalFilePath, imageBuffer, {
        contentType,
        upsert: true,
      }),
      supabaseAdmin.storage.from("generated-media").upload(thumbnailFilePath, thumbnailBuffer, {
        contentType: "image/webp",
        upsert: true,
      }),
    ]);

    if (originalUploadResult.error) throw originalUploadResult.error;
    if (thumbnailUploadResult.error) throw thumbnailUploadResult.error;

    // 4. Return the public paths of the uploaded files
    return {
      imageUrl: originalUploadResult.data.path,
      thumbnailUrl: thumbnailUploadResult.data.path,
    };
  } catch (error: any) {
    console.error(`❌ Failed to process file ${index} for job ${jobId}. URL: ${mediaUrl}`, error);
    throw error;
  }
}

async function handleSuccessfulPrediction(
  jobId: string,
  fileUrls: string[],
  supabaseAdmin: SupabaseClient,
  userId: string,
) {
  if (fileUrls.length === 0) {
    console.warn(`Job ${jobId} succeeded but had no output. Marking as failed.`);
    throw new Error("Prediction succeeded but returned no output images.");
  }

  // Create an array of promises, each processing and storing one media file
  const processingPromises = fileUrls.map((url, index) =>
    processAndStoreMedia(url, index, userId, jobId, supabaseAdmin),
  );

  // Await all promises to complete
  const imageRecords = await Promise.all(processingPromises);

  // Call the updated database function with the structured data
  const { error } = await supabaseAdmin.rpc("process_successful_job", {
    p_job_id: jobId,
    p_images_data: imageRecords, // <-- Pass the array of objects
  });

  if (error) {
    throw new Error(`Database transaction failed for job ${jobId}: ${error.message}`);
  }

  console.log(
    `Successfully processed and stored ${imageRecords.length} image(s) and thumbnail(s) for job ${jobId}.`,
  );
}
