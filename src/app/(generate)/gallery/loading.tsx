import React from "react";

export default function Loading() {
  return (
    <div className="mx-auto mt-12 max-w-[80vw] overflow-hidden px-4 py-10">
      {/* Page Header - Static for better UX */}
      <div className="mb-8 text-center">
        <h1 className="font-satoshi text-4xl font-bold text-accent sm:text-7xl">
          Generation History
        </h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          Browse all of your past AI-generated images in one place.
        </p>
      </div>

      {/* Gallery Skeleton - Masonry Style */}
      <div className="flex gap-4">
        {/* We simulate columns since we can't easily use the masonry lib in a skeleton without data */}
        {/* Creating a simple responsive grid that looks somewhat like masonry */}
        <div className="grid w-full grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className={`relative w-full animate-pulse overflow-hidden rounded-xl bg-gray-800/50 ${
                // Randomize heights to simulate masonry feel
                i % 3 === 0 ? "aspect-[3/4]" : i % 2 === 0 ? "aspect-square" : "aspect-[4/5]"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
