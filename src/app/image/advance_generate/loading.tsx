import { IconSparkles } from "@tabler/icons-react";

const Skeleton = ({ className }: { className?: string }) => (
  <div
    className={`bg-[#111111] animate-pulse rounded-lg ${className || ""}`}
  />
);

const MASONRY_SKELETON_HEIGHTS = ["h-48", "h-80", "h-64", "h-72", "h-56"];

const PillarSkeleton = () => (
    <div className="flex items-center gap-3 p-2 rounded-2xl bg-white/5">
        <Skeleton className="w-5 h-5 rounded-full" />
        <div className="flex flex-col gap-1.5">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-3 w-40" />
        </div>
    </div>
);


export default function Loading() {
  return (
    <div className="relative w-full h-screen flex flex-col bg-black overflow-y-scroll items-center">
      <div className="z-10 my-8 mt-56 flex flex-col justify-center items-center px-4 text-center">
        <h1 className="flex items-center gap-2 font-semibold text-2xl mb-2 text-white/50">
          <IconSparkles /> Unlock the power of community-trained models
        </h1>

        <div className="w-full max-w-6xl mt-6">
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>

        <div className="mt-4 flex gap-6 items-start justify-center w-full max-w-3xl">
          <PillarSkeleton />
          <PillarSkeleton />
          <PillarSkeleton />
        </div>
      </div>

      <div className="w-full px-4 md:px-8 lg:px-32 pb-20 mt-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-10 w-24 rounded-xl" />
          </div>

          <div className="columns-2 md:columns-3 lg:columns-5 gap-4 space-y-4">
            {Array.from({ length: 15 }).map((_, index) => (
              <div key={index} className="break-inside-avoid">
                <Skeleton
                  className={`w-full ${
                    MASONRY_SKELETON_HEIGHTS[
                      index % MASONRY_SKELETON_HEIGHTS.length
                    ]
                  }`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}