"use client";
import { useQuery } from "@tanstack/react-query";
import { conversationData, conversationImageObject } from "../types/BaseType"; // Make sure to import ImageObject
import { createClient } from "../lib/supabase/client";
import { getSignedUrls } from "../utils/client/getSignedUrls";

//

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

  // Process all images in parallel
  return Promise.all(
    images.map(async (image) => {
      // Process both URLs for a single image in parallel
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

export function useConversationMessages(conversationId: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["messages", conversationId],
    queryFn: async (): Promise<conversationData[]> => {
      if (!conversationId) return [];

      const { data: rawMessages, error } = await supabase.rpc("get_conversation_messages", {
        p_conversation_id: conversationId,
      });

      if (error) throw new Error(error.message);
      if (!rawMessages) return [];

      // Map over each message and process its input and output images
      const processedMessages = await Promise.all(
        (rawMessages as any[]).map(async (message) => {
          // Process both sets of images for a message in parallel
          const [processedInputImages, processedOutputImages] = await Promise.all([
            processImageUrls(message.input_images, "uploaded-images"), // Assuming input images are in 'uploaded-images'
            processImageUrls(message.output_images, "generated-media"),
          ]);

          return {
            ...message,
            input_images: processedInputImages,
            output_images: processedOutputImages,
          };
        }),
      );

      return processedMessages as conversationData[];
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!conversationId,
  });
}
