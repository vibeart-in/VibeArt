import { IconSparkles } from "@tabler/icons-react";

const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse rounded-lg bg-[#111111] ${className || ""}`} />
);

const MASONRY_SKELETON_HEIGHTS = ["h-48", "h-80", "h-64", "h-72", "h-56"];

export default function Loading() {
  return (
    <div className="relative flex w-full flex-col items-center overflow-hidden overflow-y-scroll bg-black">
      <div className="z-10 my-8 mt-56 flex flex-col items-center justify-center">
        <h1 className="mb-6 flex items-center gap-2 text-2xl font-semibold text-white/50">
          <IconSparkles /> Generate images from text and references
        </h1>
        <div className="w-full max-w-2xl">
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
      </div>

      <div className="mt-32 w-full px-4 pb-20 md:px-8 lg:px-32">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-center justify-between">
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-10 w-24 rounded-xl" />
          </div>
          <div className="columns-2 gap-4 space-y-4 md:columns-3 lg:columns-5">
            {Array.from({ length: 15 }).map((_, index) => (
              <div key={index} className="break-inside-avoid">
                <Skeleton
                  className={`w-full ${
                    MASONRY_SKELETON_HEIGHTS[index % MASONRY_SKELETON_HEIGHTS.length]
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
