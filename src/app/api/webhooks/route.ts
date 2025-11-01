// // /webhook/route.ts

// import { NextResponse } from "next/server";
// import { Prediction, validateWebhook } from "replicate";
// import { createClient, SupabaseClient } from "@supabase/supabase-js";
// import path from "path";
// import sharp from "sharp";

// const getSupabaseAdmin = () => {
//   const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
//   const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
//   if (!supabaseUrl || !supabaseServiceRoleKey) {
//     throw new Error("Missing Supabase admin credentials.");
//   }
//   return createClient(supabaseUrl, supabaseServiceRoleKey);
// };

// export async function POST(request: Request) {
//   const secret = process.env.REPLICATE_WEBHOOK_SIGNING_SECRET;
//   if (!secret) {
//     console.error("REPLICATE_WEBHOOK_SIGNING_SECRET is not set.");
//     return NextResponse.json({ detail: "Server configuration error." }, { status: 500 });
//   }

//   const url = new URL(request.url);
//   const jobId = url.searchParams.get("jobId");

//   if (!jobId) {
//     return NextResponse.json({ detail: "Missing 'jobId' URL parameter." }, { status: 400 });
//   }

//   try {
//     const valid = await validateWebhook(request.clone(), secret);
//     if (!valid) {
//       return NextResponse.json({ detail: "Invalid webhook signature." }, { status: 401 });
//     }

//     const prediction: Prediction = await request.json();
//     const supabaseAdmin = getSupabaseAdmin();

//     console.log(prediction);
//     console.log(`Received webhook for job ${jobId} with status: ${prediction.status}`);

//     // Fetch the job record including user_id so we never expose user_id in the webhook
//     const { data: currentJob, error: jobFetchError } = await supabaseAdmin
//       .from("jobs")
//       .select("job_status, user_id")
//       .eq("id", jobId)
//       .single();

//     if (jobFetchError) {
//       console.error(`Job lookup failed for ${jobId}:`, jobFetchError.message || jobFetchError);
//       // If job not found, respond 404 (do not proceed)
//       return NextResponse.json({ detail: "Job not found" }, { status: 404 });
//     }

//     if (currentJob && ["succeeded", "failed"].includes(currentJob.job_status)) {
//       console.log(`Job ${jobId} already processed. Ignoring duplicate webhook.`);
//       return NextResponse.json({ detail: "Webhook already processed." }, { status: 200 });
//     }

//     if (prediction.status === "failed") {
//       const errorMessage = prediction.error ? String(prediction.error) : "Unknown error";
//       await handleFailedPrediction(jobId, errorMessage, supabaseAdmin);
//       return NextResponse.json({ detail: "Processed failed prediction." }, { status: 200 });
//     }

//     if (prediction.status === "succeeded") {
//       let imageUrls: string[] = [];
//       if (Array.isArray(prediction.output)) {
//         imageUrls = prediction.output;
//       } else if (typeof prediction.output === "string") {
//         imageUrls = [prediction.output];
//       }

//       // Pass the user_id from the DB (NOT from the webhook)
//       const userId: string = currentJob.user_id;
//       await handleSuccessfulPrediction(jobId, imageUrls, supabaseAdmin, userId);
//     }

//     return NextResponse.json({ detail: "Webhook processed successfully" }, { status: 200 });
//   } catch (error: any) {
//     console.error(`Error processing webhook for job ${jobId}:`, error?.message || error);
//     const supabaseAdmin = getSupabaseAdmin();
//     await handleFailedPrediction(jobId, error?.message ?? "internal error", supabaseAdmin);
//     return NextResponse.json({ detail: error?.message ?? "internal error" }, { status: 500 });
//   }
// }

// async function handleFailedPrediction(
//   jobId: string,
//   errorMessage: string,
//   supabaseAdmin: SupabaseClient,
// ) {
//   await supabaseAdmin
//     .from("jobs")
//     .update({ job_status: "failed", error_message: errorMessage })
//     .eq("id", jobId);

//   const { error: refundError } = await supabaseAdmin.rpc("refund_job_credits", {
//     p_job_id: jobId,
//   });
//   if (refundError) {
//     console.error(`CRITICAL: Failed to refund credits for job ${jobId}:`, refundError.message);
//   } else {
//     console.log(`Successfully refunded credits for failed job ${jobId}.`);
//   }
// }

// async function processAndStoreMedia(
//   mediaUrl: string,
//   index: number,
//   userId: string,
//   jobId: string,
//   supabaseAdmin: SupabaseClient,
// ): Promise<{ imageUrl: string; thumbnailUrl: string }> {
//   // Derive a base file name
//   const urlPath = new URL(mediaUrl).pathname;
//   const ext = path.extname(urlPath) || ".webp";
//   const baseFileName = `${index}${ext}`;

//   // Define structured paths for original and thumbnail
//   const originalFilePath = `${userId}/${jobId}/${baseFileName}`;
//   const thumbnailFilePath = `${userId}/${jobId}/thumbnail/${baseFileName}`;

//   try {
//     // 1. Download the remote file into a buffer
//     const response = await fetch(mediaUrl);
//     if (!response.ok) throw new Error(`Download failed: ${response.statusText}`);
//     const imageBuffer = Buffer.from(await response.arrayBuffer());
//     const contentType = response.headers.get("content-type") || "image/webp";

//     // 2. Generate thumbnail buffer using sharp
//     const thumbnailBuffer = await sharp(imageBuffer)
//       .resize({ width: 256 }) // Resize to 256px width, auto height
//       .webp({ quality: 80 }) // Convert to WebP for efficiency
//       .toBuffer();

//     // 3. Upload both files in parallel
//     const [originalUploadResult, thumbnailUploadResult] = await Promise.all([
//       supabaseAdmin.storage.from("generated-media").upload(originalFilePath, imageBuffer, {
//         contentType,
//         upsert: true,
//       }),
//       supabaseAdmin.storage.from("generated-media").upload(thumbnailFilePath, thumbnailBuffer, {
//         contentType: "image/webp",
//         upsert: true,
//       }),
//     ]);

//     if (originalUploadResult.error) throw originalUploadResult.error;
//     if (thumbnailUploadResult.error) throw thumbnailUploadResult.error;

//     // 4. Return the public paths of the uploaded files
//     return {
//       imageUrl: originalUploadResult.data.path,
//       thumbnailUrl: thumbnailUploadResult.data.path,
//     };
//   } catch (error: any) {
//     console.error(`❌ Failed to process file ${index} for job ${jobId}. URL: ${mediaUrl}`, error);
//     throw error;
//   }
// }

// async function handleSuccessfulPrediction(
//   jobId: string,
//   fileUrls: string[],
//   supabaseAdmin: SupabaseClient,
//   userId: string,
// ) {
//   if (fileUrls.length === 0) {
//     console.warn(`Job ${jobId} succeeded but had no output. Marking as failed.`);
//     throw new Error("Prediction succeeded but returned no output images.");
//   }

//   // Create an array of promises, each processing and storing one media file
//   const processingPromises = fileUrls.map((url, index) =>
//     processAndStoreMedia(url, index, userId, jobId, supabaseAdmin),
//   );

//   // Await all promises to complete
//   const imageRecords = await Promise.all(processingPromises);

//   // Call the updated database function with the structured data
//   const { error } = await supabaseAdmin.rpc("process_successful_job", {
//     p_job_id: jobId,
//     p_images_data: imageRecords, // <-- Pass the array of objects
//   });

//   if (error) {
//     throw new Error(`Database transaction failed for job ${jobId}: ${error.message}`);
//   }

//   console.log(
//     `Successfully processed and stored ${imageRecords.length} image(s) and thumbnail(s) for job ${jobId}.`,
//   );
// }

//api/webhook/replicate/route.ts
import { createClient } from "@supabase/supabase-js";
import { Queue } from "bullmq";
import IORedis from "ioredis";
import { NextResponse } from "next/server";
import { Prediction, validateWebhook } from "replicate";

import { Database } from "@/supabase/database.types";

const getSupabaseAdmin = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient<Database>(supabaseUrl, supabaseServiceRoleKey);
};

const redisConnection = new IORedis(process.env.REDIS_URL!);
const mediaQueue = new Queue("media-processing", { connection: redisConnection });

export async function POST(request: Request) {
  const secret = process.env.REPLICATE_WEBHOOK_SIGNING_SECRET!;
  const url = new URL(request.url);
  const jobId = url.searchParams.get("jobId")!;
  if (!jobId) return NextResponse.json({ detail: "Missing jobId" }, { status: 400 });

  try {
    const valid = await validateWebhook(request.clone(), secret);
    if (!valid) return NextResponse.json({ detail: "Invalid webhook signature." }, { status: 401 });

    const prediction: Prediction = await request.json();
    const supabaseAdmin = getSupabaseAdmin();

    // Fetch job to confirm existence + user_id
    const { data: currentJob, error: jobFetchError } = await supabaseAdmin
      .from("jobs")
      .select("user_id, job_status")
      .eq("id", jobId)
      .single();

    if (jobFetchError) {
      console.error("Job not found", jobFetchError);
      return NextResponse.json({ detail: "Job not found" }, { status: 404 });
    }

    // Prevent double processing
    if (["success", "failed"].includes(currentJob.job_status)) {
      return NextResponse.json({ detail: "Already processed." }, { status: 200 });
    }

    if (prediction.status === "failed") {
      // existing behavior: refund and mark failed
      await supabaseAdmin
        .from("jobs")
        .update({
          job_status: "failed",
          error_message: (prediction.error as string) ?? "replicate failed",
        })
        .eq("id", jobId);
      await supabaseAdmin.rpc("refund_job_credits", { p_job_id: jobId });
      return NextResponse.json({ detail: "Replicate failed, job marked failed." }, { status: 200 });
    }

    // SUCCESS: persist replicate output and enqueue processing
    let outputUrls: string[] = [];
    if (Array.isArray(prediction.output)) outputUrls = prediction.output as string[];
    else if (typeof prediction.output === "string") outputUrls = [prediction.output];

    // store raw output urls and set status => queued_for_processing
    const { error: updateErr } = await supabaseAdmin
      .from("jobs")
      .update({
        job_status: "processing",
        raw_output: outputUrls,
      })
      .eq("id", jobId);
    if (updateErr) console.warn("Failed to persist replicate outputs:", updateErr);

    // Enqueue job to worker queue (payload includes jobId and userId)
    await mediaQueue.add(
      "process",
      { jobId, userId: currentJob.user_id, outputUrls },
      { attempts: 3, backoff: { type: "exponential", delay: 500 } },
    );

    // Ack quickly
    return NextResponse.json({ detail: "Enqueued processing" }, { status: 200 });
  } catch (err: any) {
    console.error("Webhook processing error:", err);
    // Optionally mark job failed
    try {
      const supabaseAdmin = getSupabaseAdmin();
      await supabaseAdmin
        .from("jobs")
        .update({ job_status: "failed", error_message: err.message ?? String(err) })
        .eq("id", jobId);
      await supabaseAdmin.rpc("refund_job_credits", { p_job_id: jobId });
    } catch (e) {}
    return NextResponse.json({ detail: "error" }, { status: 500 });
  }
}
