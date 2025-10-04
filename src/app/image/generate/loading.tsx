import { IconSparkles } from "@tabler/icons-react";

const Skeleton = ({ className }: { className?: string }) => (
  <div
    className={`bg-[#111111] animate-pulse rounded-lg ${className || ""}`}
  />
);

const MASONRY_SKELETON_HEIGHTS = ["h-48", "h-80", "h-64", "h-72", "h-56"];

export default function Loading() {
  return (
    <div className="relative w-full overflow-hidden flex flex-col bg-black overflow-y-scroll items-center">
      <div className="z-10 my-8 mt-56 flex flex-col justify-center items-center">
        <h1 className="flex items-center gap-2 font-semibold text-2xl mb-6 text-white/50">
          <IconSparkles /> Generate images from text and references
        </h1>
        <div className="w-full max-w-2xl">
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
      </div>

      <div className="w-full px-4 md:px-8 lg:px-32 pb-20 mt-32">
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
