"use client";
import { motion, Variants } from "motion/react";
import Image from "next/image";
import React, { useState, useEffect } from "react";

import { MidjourneyStyleData } from "@/src/types/BaseType";

const cardVariants: Variants = {
  initial: { scale: 1 },
  hover: { scale: 1.03, transition: { type: "spring", stiffness: 240, damping: 18 } },
};

const coverVariants: Variants = {
  initial: { scale: 1 },
  hover: { scale: 1.06, transition: { type: "spring", stiffness: 240, damping: 18 } },
};

type StyleCardProps = {
  style: MidjourneyStyleData;
  onSelect: (style: MidjourneyStyleData) => void;
};

const StyleCard = ({ style, onSelect }: StyleCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  const shouldShowButton = isMobile || isHovered;

  return (
    <motion.div
      className="relative aspect-[16/9] w-full cursor-pointer overflow-hidden rounded-2xl border border-white/30 bg-black/20 shadow-lg transition-all hover:shadow-xl"
      initial="initial"
      whileHover="hover"
      variants={cardVariants}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      style={{ willChange: "transform" }}
    >
      {/* Cover Image */}
      {style.cover && (
        <motion.div
          className="absolute inset-0"
          variants={coverVariants}
          style={{ willChange: "transform" }}
        >
          <Image
            src={style.cover}
            alt={style.name}
            fill
            unoptimized
            className="object-cover"
          />
        </motion.div>
      )}

      {/* Overlay */}
      <div className="absolute inset-0 flex flex-col justify-between bg-black/20 backdrop-blur-0 transition-all hover:backdrop-blur-0">
        <div className="relative flex size-full flex-col items-center justify-end gap-2 px-4 py-3">
          <motion.p className="text-center font-bold leading-6 text-accent">
            {style.name}
          </motion.p>

          {/* Button container */}
          <div className="relative flex h-[48px] w-full items-center justify-center">
            <motion.div
              animate={{
                opacity: shouldShowButton ? 1 : 0,
                y: shouldShowButton ? 0 : 8,
              }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="absolute flex gap-2"
              style={{
                pointerEvents: shouldShowButton ? "auto" : "none",
                willChange: "opacity, transform",
              }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(style);
                }}
                className="rounded-xl border border-accent bg-[linear-gradient(90deg,rgba(217,232,37,0.5)_0%,rgba(227,210,186,0.5)_100%)] px-6 py-1 font-satoshi text-sm font-semibold text-accent shadow-sm transition-transform hover:scale-105 active:scale-95"
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

export default StyleCard;
