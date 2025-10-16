// src/components/ai-apps/AppGenerationGrid.tsx (Corrected)

"use client";
import { motion } from "framer-motion"; // Note: motion/react is deprecated, use framer-motion
import Masonry from "react-masonry-css";

// Import the correct type from the hook
import { GenerationAppWithSignedUrls } from "@/src/hooks/useAppGenerations";

import AppGenerationCard from "./AppGenerationCard";

const AppGenerationGrid = ({ generations }: { generations: GenerationAppWithSignedUrls[] }) => {
  const breakpointColumnsObj = {
    default: 3,
    1500: 2,
    1100: 2,
    700: 1,
  };

  console.log("GENNN", generations);

  return (
    <div className="relative w-full">
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="my-masonry-grid"
        columnClassName="my-masonry-grid_column"
      >
        {generations.map((gen) => (
          <motion.div
            key={gen.id}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Pass the correct props to the card component */}
            <AppGenerationCard
              status={gen.status}
              parameters={gen.parameters}
              inputImages={gen.inputImageUrls}
              outputImages={gen.outputImageUrls}
            />
          </motion.div>
        ))}
      </Masonry>
    </div>
  );
};

export default AppGenerationGrid;
