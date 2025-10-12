"use client";

import { useQuery } from "@tanstack/react-query";

import { createClient } from "@/src/lib/supabase/client";
import { NodeParam } from "@/src/types/BaseType";

// Define the final shape of our data after processing
export type GenerationWithSignedUrls = {
  id: string;
  status?: "pending" | "succeeded"; // <-- ADD THIS STATUS
  parameters: NodeParam[];
  outputImageUrls: string[];
  inputImageUrl: string | null;
};

// Define the shape of data coming directly from the DB
type GenerationWithPaths = {
  id: string;
  parameters: NodeParam[];
  job_output_images: {
    images: {
      image_url: string;
    } | null;
  }[];
};

/**
 * Custom hook to fetch and subscribe to an AI App's generation history.
 * @param appId The UUID of the AI App.
 */
export function useAppGenerations(appId: string) {
  const supabase = createClient();
  const queryKey = ["appGenerations", appId];

  const fetchAndProcessGenerations = async (): Promise<GenerationWithSignedUrls[]> => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return []; // Return empty if no user is logged in

    // 1. Fetch the raw generation data (with image paths)
    const { data: generations, error } = await supabase
      .from("jobs")
      .select(
        `
        id,
        parameters,
        job_output_images!inner (
          images!inner (
            image_url
          )
        )
      `,
      )
      .eq("user_id", user.id)
      .eq("ai_app_id", appId)
      .eq("job_status", "succeeded")
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      throw new Error(error.message);
    }
    if (!generations) return [];

    // 2. Process the data to generate signed URLs for all images
    const processedGenerations = await Promise.all(
      (generations as GenerationWithPaths[]).map(async (gen) => {
        // --- Process Input Image from 'parameters' ---
        const inputImageParam = gen.parameters.find((p) => p.fieldName === "image");
        let inputSignedUrl: string | null = null;
        if (inputImageParam && inputImageParam.fieldValue) {
          const path = inputImageParam.fieldValue;
          const [bucketName, ...filePathParts] = path.split("/");
          const filePathInBucket = filePathParts.join("/");
          const { data } = await supabase.storage
            .from(bucketName)
            .createSignedUrl(filePathInBucket, 3600); // 1 hour expiry
          inputSignedUrl = data?.signedUrl || null;
        }

        // --- Process Output Images ---
        const outputImagePaths = gen.job_output_images
          .map((joi) => joi.images?.image_url)
          .filter((url): url is string => !!url);

        // const outputSignedUrls = await Promise.all(
        //   outputImagePaths.map(async (path) => {
        //     const [bucketName, ...filePathParts] = path.split("/");
        //     const filePathInBucket = filePathParts.join("/");
        //     const { data } = await supabase.storage
        //       .from(bucketName)
        //       .createSignedUrl(filePathInBucket, 3600);
        //     return data?.signedUrl || "";
        //   })
        // );

        return {
          id: gen.id,
          parameters: gen.parameters,
          outputImageUrls: outputImagePaths,
          inputImageUrl: inputSignedUrl,
        };
      }),
    );

    return processedGenerations;
  };

  return useQuery({
    queryKey,
    queryFn: fetchAndProcessGenerations,
    staleTime: 5 * 60 * 1000,
    enabled: !!appId,
  });
}
