// src/components/ai-apps/AppGenerationHistory.tsx

"use client";

import { useAppGenerations } from "@/src/hooks/useAppGenerations";
import AppGenerationGrid from "./AppGenerationGrid";
import Masonry from "react-masonry-css";

// A simple loading skeleton to match the grid layout
const SkeletonBlock = ({
  width,
  height,
}: {
  width: string;
  height: string;
}) => (
  <div
    className={`bg-[#1a1a1a] rounded-xl animate-pulse`}
    style={{ width, height }}
  />
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
        <div
          key={i}
          className="flex flex-col gap-4 p-6 w-full h-fit bg-[#111111] rounded-[40px]"
        >
          {/* Header skeleton (e.g., title + small tag) */}
          <div className="flex justify-between items-center">
            <SkeletonBlock width="40%" height="20px" />
            <SkeletonBlock width="20%" height="20px" />
          </div>

          {/* Image area skeletons */}
          <div className="flex gap-3">
            <SkeletonBlock width="50%" height="180px" />
            <SkeletonBlock width="50%" height="180px" />
          </div>

          {/* Text content skeletons */}
          <div className="flex flex-col gap-2 mt-3">
            <SkeletonBlock width="80%" height="16px" />
            <SkeletonBlock width="60%" height="16px" />
          </div>
        </div>
      ))}
    </Masonry>
  );
};

export default function AppGenerationHistory({ appId }: { appId: string }) {
  const {
    data: generations,
    isLoading,
    isError,
    error,
  } = useAppGenerations(appId);

  return (
    <div className="mt-6">
      <h3 className="text-2xl font-gothic font-medium text-white mb-4">
        Your Recent Generations
      </h3>

      {isLoading && <HistoryLoadingSkeleton />}

      {isError && (
        <p className="text-red-400">
          Could not load your generation history: {error?.message}
        </p>
      )}

      {!isLoading && !isError && generations && generations.length === 0 && (
        <div className="mt-6 text-center border border-dashed border-neutral-700 p-8 rounded-2xl">
          <h3 className="font-semibold text-lg text-neutral-300">
            No Generations Yet
          </h3>
          <p className="text-neutral-500">
            Your past creations using this app will appear here.
          </p>
        </div>
      )}

      {!isLoading && !isError && generations && generations.length > 0 && (
        <AppGenerationGrid generations={generations} />
      )}
    </div>
  );
}
