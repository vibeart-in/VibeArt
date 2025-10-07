// src/hooks/useConversationMessages.ts

"use client";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/src/lib/supabase/client";
import { Json } from "@/supabase/database.types";

// Type for the raw image object received from the RPC
type RawImageObject = {
  id: string;
  imageUrl: string;
};

// Type for the processed image object that the hook will return
type ProcessedImageObject = {
  id: string;
  signedUrl: string;
};

// Define the shape of the final, processed message
export type ProcessedMessage = {
  credit_cost: number | null;
  error_message: string | null;
  id: string;
  job_status: string;
  jobId: string;
  parameters: Json | null;
  userPrompt: string;
  // These fields are now arrays of objects with signed URLs
  input_images: ProcessedImageObject[];
  output_images: ProcessedImageObject[];
};

export function useConversationMessages(conversationId: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["messages", conversationId],
    queryFn: async (): Promise<ProcessedMessage[]> => {
      // 1. Fetch the raw message data from the RPC
      const { data: rawMessages, error } = await supabase.rpc("get_conversation_messages", {
        p_conversation_id: conversationId,
      });

      if (error) throw new Error(error.message);
      if (!rawMessages) return [];

      // Helper function to process an array of image objects into objects with signed URLs
      const getSignedUrlsForImageObjects = async (
        imageObjects: unknown, // Use 'unknown' for initial type safety
      ): Promise<ProcessedImageObject[]> => {
        // Type guard to ensure we have a valid array of image objects
        if (
          !Array.isArray(imageObjects) ||
          imageObjects.length === 0 ||
          typeof imageObjects[0]?.imageUrl !== "string"
        ) {
          return [];
        }

        const typedImageObjects = imageObjects as RawImageObject[];

        const urlPromises = typedImageObjects.map(async (imageObj) => {
          const path = imageObj.imageUrl;
          const [bucketName, ...filePathParts] = path.split("/");

          if (!bucketName || filePathParts.length === 0) {
            console.warn(`Invalid storage path format: ${path}`);
            return null; // Skip invalid paths
          }

          const filePathInBucket = filePathParts.join("/");
          const { data, error: urlError } = await supabase.storage
            .from(bucketName)
            .createSignedUrl(filePathInBucket, 3600); // 1 hour expiry

          if (urlError) {
            console.error(`Failed to create signed URL for ${path}:`, urlError.message);
            return null; // Return null on error for this specific image
          }

          // Return a new object with the original id and the new signedUrl
          return {
            id: imageObj.id,
            signedUrl: data?.signedUrl,
          };
        });

        // Wait for all URL promises to resolve
        const settledUrls = await Promise.all(urlPromises);

        // Filter out any nulls and ensure signedUrl is not null/undefined
        return settledUrls.filter(
          (result): result is ProcessedImageObject => result !== null && !!result.signedUrl,
        );
      };

      // 2. Process all messages to transform image paths into signed URLs
      const processedMessages = await Promise.all(
        rawMessages.map(async (message) => {
          // Generate signed URLs for both input and output images concurrently
          const [processedInputImages, processedOutputImages] = await Promise.all([
            getSignedUrlsForImageObjects(message.input_images),
            getSignedUrlsForImageObjects(message.output_images),
          ]);

          return {
            ...message,
            input_images: processedInputImages,
            output_images: processedOutputImages,
          };
        }),
      );

      return processedMessages as ProcessedMessage[];
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!conversationId,
  });
}
