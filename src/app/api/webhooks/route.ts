// /webhook/route.ts

import { NextResponse } from "next/server";
import { Prediction, validateWebhook } from "replicate";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const getSupabaseAdmin = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error("Missing Supabase admin credentials.");
  }
  return createClient(supabaseUrl, supabaseServiceRoleKey);
};

export async function POST(request: Request) {
  const secret = process.env.REPLICATE_WEBHOOK_SIGNING_SECRET;
  if (!secret) {
    console.error("REPLICATE_WEBHOOK_SIGNING_SECRET is not set.");
    return NextResponse.json({ detail: "Server configuration error." }, { status: 500 });
  }

  const url = new URL(request.url);
  const jobId = url.searchParams.get("jobId");

  if (!jobId) {
    return NextResponse.json({ detail: "Missing 'jobId' URL parameter." }, { status: 400 });
  }

  try {
    const valid = await validateWebhook(request.clone(), secret);
    if (!valid) {
      return NextResponse.json({ detail: "Invalid webhook signature." }, { status: 401 });
    }

    const prediction: Prediction = await request.json();
    const supabaseAdmin = getSupabaseAdmin();

    console.log(prediction);
    console.log(`Received webhook for job ${jobId} with status: ${prediction.status}`);

    const { data: currentJob } = await supabaseAdmin
      .from("jobs")
      .select("job_status")
      .eq("id", jobId)
      .single();

    if (currentJob && ["succeeded", "failed"].includes(currentJob.job_status)) {
      console.log(`Job ${jobId} already processed. Ignoring duplicate webhook.`);
      return NextResponse.json({ detail: "Webhook already processed." }, { status: 200 });
    }

    if (prediction.status === "failed") {
      const errorMessage = prediction.error ? String(prediction.error) : "Unknown error";
      await handleFailedPrediction(jobId, errorMessage, supabaseAdmin);
      return NextResponse.json({ detail: "Processed failed prediction." }, { status: 200 });
    }

    if (prediction.status === "succeeded") {
      await handleSuccessfulPrediction(jobId, prediction, supabaseAdmin);
    }

    return NextResponse.json({ detail: "Webhook processed successfully" }, { status: 200 });
  } catch (error: any) {
    console.error(`Error processing webhook for job ${jobId}:`, error.message);
    const supabaseAdmin = getSupabaseAdmin();
    await handleFailedPrediction(jobId, error.message, supabaseAdmin);
    return NextResponse.json({ detail: error.message }, { status: 500 });
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

async function handleSuccessfulPrediction(
  jobId: string,
  prediction: Prediction,
  supabaseAdmin: SupabaseClient,
) {
  // --- NORMALIZATION STEP ---
  // This is the key fix. We ensure imageUrls is always an array.
  let imageUrls: string[] = [];
  if (Array.isArray(prediction.output)) {
    // Handle models that return an array of strings
    imageUrls = prediction.output;
  } else if (typeof prediction.output === "string") {
    // Handle models that return a single string
    imageUrls = [prediction.output];
  }

  // --- EDGE CASE HANDLING ---
  // If after normalization, there are no images, the job has failed.
  if (imageUrls.length === 0) {
    console.warn(`Job ${jobId} succeeded but had no output. Marking as failed.`);
    // Re-use the failure logic. This will also trigger a refund if configured.
    throw new Error("Prediction succeeded but returned no output images.");
  }

  // The rest of the function can now proceed with the guarantee that imageUrls is an array.
  // The retry and streaming logic from before remains the same.

  const downloadAndStoreImage = async (imageUrl: string, index: number): Promise<string> => {
    const filename = `${prediction.id}-${index}.png`; // Using .png as a standard, Supabase handles content-type
    try {
      // Your retry helper function should be defined here or imported

      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error(`Download failed: ${response.statusText}`);
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
      console.error(`Failed to process image ${index} for job ${jobId}. URL: ${imageUrl}`, error);
      throw error;
    }
  };

  // This part is now safe because imageUrls is GUARANTEED to be an array.
  const downloadPromises = imageUrls.map((url: string, index: number) =>
    downloadAndStoreImage(url, index),
  );

  const supabaseImageUrls = await Promise.all(downloadPromises);

  const { error } = await supabaseAdmin.rpc("process_successful_job", {
    p_job_id: jobId,
    p_image_urls: supabaseImageUrls,
  });

  if (error) {
    throw new Error(`Database transaction failed for job ${jobId}: ${error.message}`);
  }

  console.log(
    `Successfully processed and stored ${supabaseImageUrls.length} image(s) for job ${jobId}.`,
  );
}
