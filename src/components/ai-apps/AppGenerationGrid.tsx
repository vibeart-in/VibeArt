// src/components/ai-apps/AppGenerationGrid.tsx

"use client";
import Masonry from "react-masonry-css";
import { motion } from "motion/react";
// Import the type from the hook for consistency
import { GenerationWithSignedUrls } from "@/src/hooks/useAppGenerations";
import AppGenerationCard from "./AppGenerationCard";

const AppGenerationGrid = ({
  generations, // Renamed for clarity
}: {
  generations: GenerationWithSignedUrls[];
}) => {
  const breakpointColumnsObj = {
    default: 3,
    1500: 2,
    1100: 2,
    700: 1,
  };

  return (
    <div className="relative w-full">
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="my-masonry-grid"
        columnClassName="my-masonry-grid_column"
      >
        {generations.map((gen) => (
          <motion.div
            key={gen.id} // Use the stable generation ID as the key
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <AppGenerationCard
              parameters={gen.parameters}
              inputImageUrl={gen.inputImageUrl}
              status={gen.status}
              // Pass the first output image URL. Ensure it exists.
              outputImageUrl={gen.outputImageUrls[0] || null}
            />
          </motion.div>
        ))}
      </Masonry>
    </div>
  );
};

export default AppGenerationGrid;
