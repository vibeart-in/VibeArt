"use client";
import { FireIcon } from "@phosphor-icons/react";
import { motion, Variants } from "motion/react";
import Image from "next/image";
import React, { useState } from "react";

import { PresetData } from "@/src/types/BaseType";

const cardVariants: Variants = {
  initial: { scale: 1 },
  hover: { scale: 1.03, transition: { type: "spring", stiffness: 240, damping: 18 } },
};

const coverVariants: Variants = {
  initial: { scale: 1 },
  hover: { scale: 1.06, transition: { type: "spring", stiffness: 240, damping: 18 } },
};

type PresetCardProps = {
  preset: PresetData;
  onSelect: (preset: PresetData) => void;
};

const PresetCard = ({ preset, onSelect }: PresetCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="relative h-[200px] w-[150px] cursor-pointer overflow-hidden rounded-3xl border border-white/30 bg-black/20 shadow-md transition-all hover:shadow-lg"
      initial="initial"
      whileHover="hover"
      variants={cardVariants}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      style={{ willChange: "transform" }}
    >
      {/* Cover */}
      {preset.cover && (
        <motion.div
          className="absolute inset-0"
          variants={coverVariants}
          style={{ willChange: "transform" }}
        >
          {preset.cover?.endsWith(".mp4") ? (
            <video
              src={preset.cover}
              className="size-full object-cover"
              autoPlay
              muted
              loop
              playsInline
            />
          ) : (
            <Image src={preset.cover} alt={preset.name} fill className="object-cover" />
          )}
        </motion.div>
      )}

      {/* Overlay */}
      <div className="absolute inset-0 flex flex-col justify-between bg-black/20 backdrop-blur-0 transition-all hover:backdrop-blur-0">
        <div className="relative flex size-full flex-col items-center justify-end gap-2 px-3 py-2">
          <motion.p
            className="text-center font-bold leading-8 text-accent"
            // style={{
            //   fontSize: preset.name.length > 20 ? "16px" : "16px",
            //   textShadow: `
            //     -1px -1px 0 #000,
            //     1px -1px 0 #000,
            //     -1px  1px 0 #000,
            //     1px  1px 0 #000
            //   `,
            //   willChange: "transform, opacity",
            // }}
          >
            {preset.name}
          </motion.p>

          {/* Description & Buttons container */}
          <div className="relative flex h-[48px] w-full items-center justify-center">
            <motion.div
              animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 8 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="absolute flex gap-2"
              style={{
                pointerEvents: isHovered ? "auto" : "none",
                willChange: "opacity, transform",
              }}
            >
              <button
                onClick={() => onSelect(preset)}
                className="rounded-xl border border-accent bg-[linear-gradient(90deg,rgba(217,232,37,0.5)_0%,rgba(227,210,186,0.5)_100%)] px-6 py-1 font-satoshi text-sm font-semibold text-accent shadow-sm transition-transform hover:scale-105"
              >
                Use
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PresetCard;
