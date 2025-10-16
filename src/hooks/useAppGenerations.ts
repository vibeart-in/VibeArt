"use client";

import { useQuery } from "@tanstack/react-query";

import { createClient } from "@/src/lib/supabase/client";
import { conversationImageObject, NodeParam } from "@/src/types/BaseType";

import { getSignedUrls } from "../utils/client/getSignedUrls";

// ============================================================================
// 1. TYPE DEFINITIONS
// ============================================================================

// The final shape of our data after all client-side processing is complete.
// This is what the component will receive.
export type GenerationAppWithSignedUrls = {
  id: string;
  status: string; // The RPC function provides the job status
  parameters: NodeParam[];
  outputImageUrls: conversationImageObject[];
  inputImageUrls: conversationImageObject[];
};

// The shape of the raw data returned directly from our RPC database function.
// Note that the image URLs here are storage paths, not public URLs.
type AppGenerationFromRPC = {
  id: string;
  status: string;
  parameters: NodeParam[];
  outputImageUrls: conversationImageObject[]; // Contains paths like 'public/image.png'
  inputImageUrls: conversationImageObject[]; // Contains paths like 'public/image.png'
};

// ============================================================================
// 2. HELPER UTILITIES
// ============================================================================

/**
 * A simple utility to create a signed URL for a single image path.
 * Returns an empty string if the path is invalid.
 * @param path The full storage path of the image (e.g., "user-id/image.png").
 * @param bucketName The name of the Supabase storage bucket.
 */
const getSignedUrlForPath = async (path: string, bucketName: string): Promise<string> => {
  if (!path) return "";
  const supabase = createClient();
  const { data, error } = await supabase.storage.from(bucketName).createSignedUrl(path, 60 * 5); // 5-minute expiry

  if (error) {
    console.error(`Error creating signed URL for ${path}:`, error);
    return ""; // Return empty string or a placeholder on error
  }
  return data.signedUrl;
};

/**
 * Processes an array of image objects from the DB, creating signed URLs for both
 * the full image and its thumbnail.
 * @param images - The array of image objects with `imageUrl` and `thumbnailUrl` paths.
 * @param bucketName - The private bucket where these images are stored.
 * @returns A new array of image objects with publicly accessible, temporary URLs.
 */
const processImageUrls = async (
  images: conversationImageObject[],
  bucketName: string,
): Promise<conversationImageObject[]> => {
  if (!images || images.length === 0) {
    return [];
  }

  // Create signed URLs for all images in parallel for max efficiency
  return Promise.all(
    images.map(async (image) => {
      // Split the path to isolate the file path from the bucket name if present
      // const imagePath = image.imageUrl.split("/").slice(1).join("/");
      // const thumbPath = image.thumbnailUrl ? image.thumbnailUrl.split("/").slice(1).join("/") : "";

      // Get signed URLs for the full image and thumbnail in parallel
      const [signedImageUrl, signedThumbnailUrl] = await Promise.all([
        getSignedUrls(image.imageUrl, bucketName),
        getSignedUrls(image.thumbnailUrl ?? "", bucketName),
      ]);

      return {
        ...image,
        imageUrl: signedImageUrl,
        thumbnailUrl: signedThumbnailUrl,
      };
    }),
  );
};

// ============================================================================
// 3. THE MAIN REACT QUERY HOOK
// ============================================================================

/**
 * Custom hook to fetch and subscribe to an AI App's generation history.
 * It uses an efficient RPC call and then generates signed URLs on the client.
 * @param appId The UUID of the AI App.
 */
export function useAppGenerations(appId: string) {
  const supabase = createClient();
  const queryKey = ["appGenerations", appId];

  const fetchAndProcessGenerations = async (): Promise<GenerationAppWithSignedUrls[]> => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return []; // Return empty if no user is logged in

    // 1. Fetch the raw data with a single, efficient RPC call
    const { data: rawGenerations, error } = await supabase.rpc("get_job_history_for_app", {
      app_id_param: appId,
      user_id_param: user.id,
    });

    if (error) {
      console.error("Failed to fetch app generations:", error);
      throw new Error(error.message);
    }
    if (!rawGenerations) return [];

    console.log("rawGenerations", rawGenerations);

    // 2. Process the raw data to generate signed URLs for all images
    const processedGenerations = await Promise.all(
      (rawGenerations as AppGenerationFromRPC[]).map(async (gen) => {
        // Process input and output images in parallel for each generation
        const [signedOutputUrls, signedInputUrls] = await Promise.all([
          processImageUrls(gen.outputImageUrls, "generated-media"), // Assuming outputs are in 'generated-media'
          processImageUrls(gen.inputImageUrls, "uploaded-images"), // Assuming inputs are in 'uploaded-images'
        ]);

        return {
          id: gen.id,
          status: gen.status,
          parameters: gen.parameters,
          outputImageUrls: signedOutputUrls,
          inputImageUrls: signedInputUrls,
        };
      }),
    );

    return processedGenerations;
  };

  return useQuery({
    queryKey,
    queryFn: fetchAndProcessGenerations,
    staleTime: 5 * 60 * 1000, // Data is considered fresh for 5 minutes
    enabled: !!appId, // The query will only run if appId is not null/undefined
  });
}
