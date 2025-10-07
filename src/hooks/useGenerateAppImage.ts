// src/hooks/useGenerateAppImage.ts

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { NodeParam } from "@/src/types/BaseType";
import { GenerationWithSignedUrls } from "./useAppGenerations"; // Import the updated type

interface GenerateAppImagePayload {
  appId: string;
  parameters: NodeParam[];
  // We need the preview URL of the input image for the optimistic update
  inputImagePreviewUrl?: string | null;
}

interface GenerateAppImageResponse {
  jobId: string;
}

async function generateAppImage(
  payload: GenerateAppImagePayload,
): Promise<GenerateAppImageResponse> {
  // We don't send the preview URL to the API, so we can omit it here.
  const { inputImagePreviewUrl, ...apiPayload } = payload;

  const response = await fetch("/api/generate/app", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(apiPayload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to generate image from AI App");
  }
  return response.json();
}

// Define the context type for the mutation
interface MutationContext {
  previousGenerations: GenerationWithSignedUrls[] | undefined;
  queryKey: string[];
}

/**
 * Tanstack Query hook for generating AI App images with optimistic updates.
 */
export function useGenerateAppImage() {
  const queryClient = useQueryClient();

  return useMutation<GenerateAppImageResponse, Error, GenerateAppImagePayload, MutationContext>({
    mutationFn: generateAppImage,

    // --- OPTIMISTIC UPDATE LOGIC ---
    onMutate: async (newGeneration) => {
      const queryKey = ["appGenerations", newGeneration.appId];

      // 1. Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey });

      // 2. Snapshot the previous value
      const previousGenerations = queryClient.getQueryData<GenerationWithSignedUrls[]>(queryKey);

      // 3. Create our optimistic "pending" generation object
      const optimisticGeneration: GenerationWithSignedUrls = {
        id: `temp-${Date.now()}`, // A temporary unique ID
        status: "pending",
        parameters: newGeneration.parameters,
        inputImageUrl: newGeneration.inputImagePreviewUrl || null,
        outputImageUrls: [], // No output images yet
      };

      // 4. Optimistically update to the new value
      queryClient.setQueryData<GenerationWithSignedUrls[]>(
        queryKey,
        (old = []) => [optimisticGeneration, ...old], // Add the new pending item to the top of the list
      );

      // Smooth scroll to the history section immediately
      document.getElementById("appGenerationHistory")?.scrollIntoView({ behavior: "smooth" });

      // 5. Return a context object with the snapshotted value
      return { previousGenerations, queryKey };
    },

    // If the mutation fails, roll back to the previous state
    onError: (err, newGeneration, context) => {
      console.error("Mutation failed:", err);
      if (context?.previousGenerations) {
        queryClient.setQueryData(context.queryKey, context.previousGenerations);
      }
      // You would show an error toast here
    },
  });
}
