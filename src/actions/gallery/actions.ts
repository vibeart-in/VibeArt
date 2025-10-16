"use server";

import { createClient } from "@/src/lib/supabase/server";

// Define the structure of the image object based on your database schema
interface DbImage {
  id: string;
  user_id: string;
  image_url: string;
  is_public: boolean;
  created_at: string;
  thumbnail_url: string | null;
  width: number | null;
  height: number | null;
}

const BUCKET_NAME = "generated-media";
// Signed URLs will be valid for 1 hour
const URL_EXPIRATION_IN_SECONDS = 3600;

/**
 * Fetches images for the current user, filtering for those with thumbnails,
 * and creates signed URLs for secure access.
 * @param pageParam - The starting index for pagination.
 * @returns An array of image objects with signed URLs.
 */
export const getGalleryImages = async ({ pageParam = 0 }: { pageParam: number }) => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User is not authenticated.");
  }

  // 1. Fetch images from the database, filtering for the current user
  //    and ensuring a thumbnail exists.
  const { data: images, error } = await supabase
    .from("images")
    .select("*")
    .eq("user_id", user.id)
    .not("thumbnail_url", "is", null) // Ignore images without a thumbnail
    .order("created_at", { ascending: false })
    .range(pageParam, pageParam + 9); // Fetch 10 items per page

  if (error) {
    console.error("Error fetching images:", error);
    throw new Error(error.message);
  }

  if (!images || images.length === 0) {
    return [];
  }

  console.log("Fetched images:", images);

  // 2. Generate signed URLs for both the image and its thumbnail
  const signedUrlPromises = images.map(async (image: DbImage) => {
    // The path to the file in the bucket is extracted from the full URL
    // const imageUrlPath = new URL(image.image_url).pathname.split("/").pop()!;
    // const thumbnailUrlPath = new URL(image.thumbnail_url!).pathname.split("/").pop()!;

    const [imageUrlResponse, thumbnailUrlResponse] = await Promise.all([
      supabase.storage
        .from(BUCKET_NAME)
        .createSignedUrl(image.image_url, URL_EXPIRATION_IN_SECONDS),
      supabase.storage
        .from(BUCKET_NAME)
        .createSignedUrl(image.thumbnail_url || "", URL_EXPIRATION_IN_SECONDS),
    ]);
    console.log("Signed URL responses:", { imageUrlResponse, thumbnailUrlResponse });
    return {
      ...image,
      media_url: imageUrlResponse.data?.signedUrl || image.image_url,
      thumbnail_url: thumbnailUrlResponse.data?.signedUrl || image.thumbnail_url,
    };
  });

  return Promise.all(signedUrlPromises);
};
