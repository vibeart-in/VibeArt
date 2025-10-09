"use client";
import Image from "next/image";
import React, { useState } from "react";
import { motion, AnimatePresence, Variants } from "motion/react";
import { ModelData } from "@/src/types/BaseType";

const imageVariants: Variants = {
  initial: { scale: 1 },
  hover: { scale: 1.05 },
};

const buttonVariants: Variants = {
  initial: { opacity: 0, y: 15, transition: { duration: 0.2 } },
  animate: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 25 },
  },
  exit: {
    opacity: 0,
    y: 15,
    transition: { duration: 0.2 },
  },
};

type ModelCardProps = {
  model: ModelData;
  onSelect: (model: ModelData) => void;
};

const ModelCard = ({ model, onSelect }: ModelCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <motion.div
      className="relative h-[210px] w-[210px] cursor-pointer overflow-hidden rounded-3xl border-2 border-white/30"
      initial="initial"
      whileHover="hover"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <motion.div className="absolute left-0 top-0 h-full w-full" variants={imageVariants}>
        {model.cover_image.endsWith(".mp4") ? (
          <video src={model.cover_image} className="object-cover" autoPlay muted loop playsInline />
        ) : (
          <Image src={model.cover_image} alt={model.model_name} className="object-cover" fill />
        )}
      </motion.div>

      <div className="absolute inset-0 flex flex-col justify-between bg-black/20 backdrop-blur-[2px] hover:backdrop-blur-0">
        <div className="flex h-full w-full flex-col items-center justify-center gap-4 px-2">
          <p className="text-center font-gothic text-2xl font-medium text-white hover:text-accent">
            {model.model_name}
          </p>
          <p className="text-center text-white">
            {model?.description.substring(0, 50)}
            {model?.description.length > 30 ? "..." : ""}
          </p>
          <AnimatePresence>
            <button
              onClick={() => onSelect(model)}
              className="mt-2 rounded-full bg-accent/80 p-1 text-[12px] font-semibold text-black hover:bg-accent/90"
            >
              Use
            </button>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default ModelCard;
