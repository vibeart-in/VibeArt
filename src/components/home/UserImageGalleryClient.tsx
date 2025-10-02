// src/components/home/UserImageGalleryClient.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import ImageGallery from "@/src/components/home/ImageGrid"; // Your ImageGrid component
import { createClient } from "@/src/lib/supabase/client"; // Client-side Supabase client
import { ImageCardType } from "@/src/types/BaseType";


// Define a unique query key for Tanstack Query
const USER_IMAGES_QUERY_KEY = ["userImages"];

interface UserImageGalleryClientProps {
  initialImages: ImageCardType[]; // Use the updated ImageCardType
  userId: string;
}

export default function UserImageGalleryClient({
  initialImages,
  userId,
}: UserImageGalleryClientProps) {
  const supabase = createClient();

  const fetchUserGeneratedImages = async (): Promise<ImageCardType[]> => {
    const { data, error } = await supabase.rpc("get_user_generated_images", {
      p_user_id: userId,
    });

    if (error) {
      console.error("Error fetching user images:", error);
      throw new Error("Could not fetch user images.");
    }
    // Supabase RPC returns data directly if successful, casting to the expected array type.
    return data as unknown as ImageCardType[];
  };

  const {
    data: images,
    isLoading,
    isError,
    error,
  } = useQuery<ImageCardType[], Error>({
    queryKey: [...USER_IMAGES_QUERY_KEY, userId],
    queryFn: fetchUserGeneratedImages,
    initialData: initialImages, // Hydrate cache with server-fetched data
    staleTime: 1000 * 60 * 5, // Data is fresh for 5 minutes
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchInterval: false, // Or set a number (ms) for polling
  });

  if (isLoading) {
    return (
      <div className="p-2 mt-16 text-center text-neutral-400">
        <p>Loading your images...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-2 mt-16 text-center text-red-400">
        <p>Error loading images: {error?.message}</p>
      </div>
    );
  }

  if (!images || images.length === 0) {
    return (
      <div className="p-2 mt-16 text-center text-neutral-400">
        <p>You haven t generated any images yet.</p>
      </div>
    );
  }

  return (
    <div className="p-2 mx-12 mt-16">
      <p className="p-2 ml-3 mb-2 flex font-medium">Library</p>
      <ImageGallery images={images} />
    </div>
  );
}
