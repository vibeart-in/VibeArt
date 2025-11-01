// app/ShowcaseClient.tsx
"use client";

import { useEffect } from "react";
import { useInView } from "react-intersection-observer";

import { useInfiniteShowcase } from "@/src/hooks/useShowcaseImages";

import { ShowcaseSection } from "./ShowcaseSection";

interface ShowcaseClientProps {
  models: string[];
}

export const ShowcaseClient = ({ models }: ShowcaseClientProps) => {
  const { data, error, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteShowcase(models);

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  // react-query statuses are "loading" | "error" | "success"
  if (status === "pending") {
    return <p className="text-center text-white">Loading showcase...</p>;
  }

  if (status === "error") {
    return <p className="text-center text-white">Error: {error?.message ?? "Unknown"}</p>;
  }

  console.log(data);

  return (
    <>
      {/* @ts-ignore */}
      {data?.pages?.map((modelData, i) => (
        // modelData.name should be unique — fallback to index if not
        <ShowcaseSection key={modelData?.name ?? `model-${i}`} modelData={modelData} />
      ))}

      {/* Trigger element */}
      <div ref={ref} className="h-10">
        {isFetchingNextPage && <p className="text-center text-white">Loading more...</p>}
        {!hasNextPage && <p className="text-center text-gray-400">You've seen it all!</p>}
      </div>
    </>
  );
};
