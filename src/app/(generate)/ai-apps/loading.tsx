import React from "react";

export default function Loading() {
  return (
    <div className="relative mx-auto h-screen w-full max-w-[90vw] bg-black">
      {/* Static Header - kept visible for better UX */}
      <div className="pt-20">
        <h1 className="font-satoshi text-[60px] font-medium text-accent">Creative Hub</h1>
        <p className="w-[70vw] text-xl font-medium text-white">
          Create professional-grade content in one click — from 4K images and viral video effects to
          polished commercials, motion graphics, and even interior renders. No editing, no hassle —
          just instant results.
        </p>
      </div>

      {/* Filter Tags Skeleton */}
      <div className="my-4 flex flex-wrap gap-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-8 w-20 animate-pulse rounded-full bg-gray-800/50" />
        ))}
      </div>

      {/* Grid Skeleton */}
      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className={`relative w-full animate-pulse overflow-hidden rounded-2xl bg-gray-800 sm:rounded-3xl lg:rounded-[40px] ${
              // Randomize heights to simulate masonry feel
              i % 3 === 0 ? "aspect-[3/4]" : i % 2 === 0 ? "aspect-square" : "aspect-[4/5]"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
