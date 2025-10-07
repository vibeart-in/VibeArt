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
      className="relative h-[210px] w-[170px] cursor-pointer overflow-hidden rounded-[18px] border-2 border-white/30"
      initial="initial"
      whileHover="hover"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <motion.div className="absolute left-0 top-0 h-full w-full" variants={imageVariants}>
        <Image src={model.cover_image} alt={model.model_name} className="object-cover" fill />
      </motion.div>

      <div className="absolute inset-0 flex flex-col justify-between">
        <div className="flex justify-between p-2">
          <div className="rounded-[7px] bg-black/80 px-2 py-1">
            <p className="text-[8px] font-semibold uppercase leading-[10px] text-white">
              {model.base_model}
            </p>
          </div>
        </div>
        <div className="flex w-full flex-col justify-end bg-gradient-to-t from-black/75 to-transparent p-2 backdrop-blur-[2px]">
          <p className="font-quicksand text-[11px] font-medium leading-[14px] text-white">
            {model.model_name}
          </p>
          <AnimatePresence>
            {isHovered && (
              <motion.button
                onClick={() => onSelect(model)}
                className="mt-2 rounded-full bg-accent/80 p-1 text-[12px] font-semibold text-black hover:bg-accent/90"
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
