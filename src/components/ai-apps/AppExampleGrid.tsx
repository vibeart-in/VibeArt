"use client";
import Masonry from "react-masonry-css";
import Image from "next/image";
import { useState } from "react";
import { motion } from "motion/react";
import ImageCard from "../ui/imageCard/ImageCard";

type AppExampleGridProps = {
  images: string[]; // array of URLs
};

const AppExampleGrid = ({ images }: AppExampleGridProps) => {
  const [showAll, setShowAll] = useState(false);

  const breakpointColumnsObj = {
    default: 2,
    1500: 2,
    1100: 2,
    700: 1,
  };

  const displayedImages = showAll ? images : images.slice(0, 4);

  return (
    <div className="relative w-full">
      {/* Animated wrapper */}
      <motion.div
        layout
        initial={{ height: 0 }}
        animate={{
          height: showAll ? "500px" : "300px",
        }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className={`relative w-full rounded-2xl pr-2 ${
          showAll ? "overflow-y-auto" : "overflow-hidden"
        }`}
      >
        <Masonry
          breakpointCols={breakpointColumnsObj}
          className="my-masonry-grid"
          columnClassName="my-masonry-grid_column"
        >
          {displayedImages.map((url, idx) => (
            <motion.div
              key={idx}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <ImageCard
                mediaUrl={url}
                prompt=""
                // alt={`example-${idx}`}
                width={300}
                height={300}
              />
            </motion.div>
          ))}
        </Masonry>

        {/* Blur overlay only when collapsed */}
        {!showAll && (
          <div className="pointer-events-none absolute bottom-0 left-0 h-16 w-full bg-gradient-to-t from-black via-black/70 to-transparent backdrop-blur-sm" />
        )}
      </motion.div>

      {/* Toggle button */}
      <div className="mt-3 flex justify-center">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAll((prev) => !prev)}
          className="rounded-full border border-white/20 bg-black/40 px-4 py-1.5 text-sm transition hover:bg-black/60"
        >
          {showAll ? "Show less" : "View more"}
        </motion.button>
      </div>
    </div>
  );
};

export default AppExampleGrid;
