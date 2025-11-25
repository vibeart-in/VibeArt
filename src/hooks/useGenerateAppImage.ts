// src/hooks/useGenerateAppImage.ts

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { conversationImageObject, NodeParam } from "@/src/types/BaseType";

import { GenerationAppWithSignedUrls } from "./useAppGenerations";

interface GenerateAppImagePayload {
  appId: string;
  parameters: NodeParam[];
  inputImagePreviewUrls?: string[] | null;
  inputMediaStoreUrls?: string[] | null;
}

interface GenerateAppImageResponse {
  jobId: string;
}

// inside useGenerateAppImage.ts (or top of file)

function toConversationImages(urls?: string[] | null): conversationImageObject[] {
  // Adapt the object shape here to match your conversationImageObject type!
  // Common shapes: { url: string }, { displayUrl: string }, { signedUrl?: string, displayUrl?: string }, etc.
  // Replace `displayUrl` with the correct property name.
  return (urls ?? []).map(
    (u) =>
      ({
        // Example fields — **change to match your real type**
        imageUrl: u,
        thumbnailUrl: null, // optional placeholder if your type has signedUrl
        id: 1,
        width: 200,
        height: 200,
      }) as unknown as conversationImageObject,
  );
}

async function generateAppImage(
  payload: GenerateAppImagePayload,
): Promise<GenerateAppImageResponse> {
  // We don't send the preview URL to the API, so we can omit it here.
  const { inputImagePreviewUrls, ...apiPayload } = payload;

  console.log("Sending API Payload:", apiPayload);

  const response = await fetch("/api/app", {
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
  previousGenerations: GenerationAppWithSignedUrls[] | undefined;
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

      await queryClient.cancelQueries({ queryKey });

      const previousGenerations = queryClient.getQueryData<GenerationAppWithSignedUrls[]>(queryKey);

      // Convert preview URL strings -> conversationImageObject[]
      const previewObjects = toConversationImages(newGeneration.inputImagePreviewUrls);

      console.log("previewObjects", previewObjects);

      const optimisticGeneration: GenerationAppWithSignedUrls = {
        id: `temp-${Date.now()}`,
        status: "pending",
        parameters: newGeneration.parameters,
        inputImageUrls: previewObjects, // now correctly typed
        outputImageUrls: [],
      };

      queryClient.setQueryData<GenerationAppWithSignedUrls[]>(queryKey, (old = []) => [
        optimisticGeneration,
        ...old,
      ]);

      document.getElementById("appGenerationHistory")?.scrollIntoView({ behavior: "smooth" });

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
