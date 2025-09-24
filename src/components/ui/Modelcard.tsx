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
      className="relative w-[170px] h-[210px] rounded-[18px] border-2 border-white/30 overflow-hidden cursor-pointer"
      initial="initial"
      whileHover="hover"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <motion.div
        className="absolute top-0 left-0 w-full h-full"
        variants={imageVariants}
      >
        <Image
          src={model.cover_image}
          alt={model.model_name}
          className="object-cover"
          fill
        />
      </motion.div>

      <div className="absolute inset-0 flex flex-col justify-between">
        <div className="flex justify-between p-2">
          {/* <div className="bg-black/80 rounded-[7px] py-1 px-2">
            <p className="text-white font-semibold text-[8px] leading-[10px] capitalize">
              {model.model_type}
            </p>
          </div> */}
          <div className="bg-black/80 rounded-[7px] py-1 px-2">
            <p className="text-white font-semibold text-[8px] leading-[10px] uppercase">
              {model.base_model}
            </p>
          </div>
        </div>
        <div className="w-full backdrop-blur-[2px] bg-gradient-to-t from-black/75 to-transparent p-2 flex flex-col justify-end">
          <p className="font-quicksand text-white font-medium text-[11px] leading-[14px]">
            {model.model_name}
          </p>
          {/* <div className="flex justify-between items-center mt-2">
            <div className="bg-white/50 rounded-[7px] py-0.5 px-2">
              <p className="font-quicksand text-white font-semibold text-[8px] leading-[10px]">
                V1
              </p>
            </div>
            <div className="flex items-center space-x-1">
              <IconHeart className="w-[10px]" />
              <p className="font-quicksand text-white font-medium text-[8px] leading-[10px]">
                Favorite
              </p>
            </div>
          </div> */}
          <AnimatePresence>
            {isHovered && (
              <motion.button
                onClick={() => onSelect(model)}
                className="text-[12px] bg-accent/80 text-black font-semibold rounded-full p-1 mt-2 hover:bg-accent/90"
                variants={buttonVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                Use
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default ModelCard;
