"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";

import { getGalleryImages } from "@/src/actions/gallery/actions";

import ImageGallery from "./GalleryGrid";

interface ImageCardProps {
  id: string;
  media_url: string;
  thumbnail_url: string | null;
  prompt?: string; // Prompt is not in the DB schema, so it's optional
  width: number | null;
  height: number | null;
}

export default function ImageGalleryWrapper({ userId }: { userId: string }) {
  const { data, error, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useInfiniteQuery({
    // The queryKey includes the userId to ensure data is refetched if the user changes
    queryKey: ["images", userId],
    // The queryFn now calls the server action
    queryFn: ({ pageParam }) => getGalleryImages({ pageParam: pageParam as number }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      // If the last fetched page had fewer than 10 items, we've reached the end
      if (lastPage.length < 10) {
        return undefined;
      }
      // Otherwise, the next page starts at the current total number of images
      return allPages.flat().length;
    },
  });

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage, isFetchingNextPage]);

  if (status === "pending") {
    return <p className="text-center">Loading images...</p>;
  }

  if (status === "error") {
    return <p className="text-center text-red-500">Error: {error.message}</p>;
  }

  // Flatten the pages array into a single array of images
  const allImages = data.pages.flat() as ImageCardProps[];

  return (
    <div className="mx-auto mt-12 max-w-[90vw] overflow-hidden px-0 py-10 md:max-w-[80vw] md:px-4">
      {/* Page Header */}
      <div className="mb-8 text-center">
        <h1 className="font-satoshi text-4xl font-bold text-accent sm:text-7xl">
          Generation History
        </h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          Browse all of your past AI-generated images in one place.
        </p>
      </div>

      {/* Gallery */}
      <ImageGallery images={allImages || []} />

      {/* Infinite Scroll Trigger */}
      <div ref={ref} className="mt-6 text-center text-sm text-muted-foreground">
        {isFetchingNextPage && <p>Loading more...</p>}
        {!hasNextPage && allImages.length > 0 && <p>You've reached the end.</p>}
      </div>
    </div>
  );
}
