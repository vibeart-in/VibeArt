// src/components/ai-apps/AppGenerationHistory.tsx

"use client";

import { useAppGenerations } from "@/src/hooks/useAppGenerations";
import AppGenerationGrid from "./AppGenerationGrid";
import Masonry from "react-masonry-css";

// A simple loading skeleton to match the grid layout
const SkeletonBlock = ({ width, height }: { width: string; height: string }) => (
  <div className={`animate-pulse rounded-xl bg-[#1a1a1a]`} style={{ width, height }} />
);

const HistoryLoadingSkeleton = () => {
  const breakpointColumnsObj = {
    default: 3,
    1500: 2,
    1100: 2,
    700: 1,
  };

  return (
    <Masonry
      breakpointCols={breakpointColumnsObj}
      className="my-masonry-grid"
      columnClassName="my-masonry-grid_column"
    >
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex h-fit w-full flex-col gap-4 rounded-[40px] bg-[#111111] p-6">
          {/* Header skeleton (e.g., title + small tag) */}
          <div className="flex items-center justify-between">
            <SkeletonBlock width="40%" height="20px" />
            <SkeletonBlock width="20%" height="20px" />
          </div>

          {/* Image area skeletons */}
          <div className="flex gap-3">
            <SkeletonBlock width="50%" height="180px" />
            <SkeletonBlock width="50%" height="180px" />
          </div>

          {/* Text content skeletons */}
          <div className="mt-3 flex flex-col gap-2">
            <SkeletonBlock width="80%" height="16px" />
            <SkeletonBlock width="60%" height="16px" />
          </div>
        </div>
      ))}
    </Masonry>
  );
};

export default function AppGenerationHistory({ appId }: { appId: string }) {
  const { data: generations, isLoading, isError, error } = useAppGenerations(appId);

  return (
    <div className="mt-6">
      <h3 className="mb-4 font-gothic text-2xl font-medium text-white">Your Recent Generations</h3>

      {isLoading && <HistoryLoadingSkeleton />}

      {isError && (
        <p className="text-red-400">Could not load your generation history: {error?.message}</p>
      )}

      {!isLoading && !isError && generations && generations.length === 0 && (
        <div className="mt-6 rounded-2xl border border-dashed border-neutral-700 p-8 text-center">
          <h3 className="text-lg font-semibold text-neutral-300">No Generations Yet</h3>
          <p className="text-neutral-500">Your past creations using this app will appear here.</p>
        </div>
      )}

      {!isLoading && !isError && generations && generations.length > 0 && (
        <AppGenerationGrid generations={generations} />
      )}
    </div>
  );
}
