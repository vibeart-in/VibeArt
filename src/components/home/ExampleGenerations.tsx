"use client";

import {
  useExampleGenerations,
  useExampleGenerationsType,
} from "@/src/hooks/useExampleGenerations";

import ImageGallery from "./ImageGrid";

const ExampleGenerations = ({ limit, showcaseFor }: useExampleGenerationsType) => {
  const { data: images, error, isLoading } = useExampleGenerations({ limit, showcaseFor });

  if (isLoading) return <p className="text-center text-white">Loading examples...</p>;
  if (error) return <p className="text-center text-white">Failed to load images.</p>;

  return (
    <div className="z-20 mt-32 px-4 pb-20 md:px-8 lg:px-32">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="z-10 text-3xl font-bold text-white">Examples</h2>
          <button className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white backdrop-blur-sm transition-all hover:bg-white/10">
            View All
          </button>
        </div>
        <ImageGallery columnCount={4} images={images ?? []} />
      </div>
    </div>
  );
};

export default ExampleGenerations;
