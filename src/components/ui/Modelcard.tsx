"use client";
import { ClockIcon, FireIcon } from "@phosphor-icons/react";
import { IconDiamondFilled, IconStarFilled } from "@tabler/icons-react";
import { motion, AnimatePresence, Variants } from "motion/react";
import Image from "next/image";
import React, { useState } from "react";

import { ModelData } from "@/src/types/BaseType";

const cardVariants: Variants = {
  initial: { scale: 1 },
  hover: { scale: 1.03, transition: { type: "spring", stiffness: 240, damping: 18 } },
};

const coverVariants: Variants = {
  initial: { scale: 1 },
  hover: { scale: 1.06, transition: { type: "spring", stiffness: 240, damping: 18 } },
};

type ModelCardProps = {
  model: ModelData;
  onSelect: (model: ModelData) => void;
  onMoreInfo?: (model: ModelData) => void;
};

function getTimeColor(estimated_time?: number) {
  const t = estimated_time ?? 0;
  if (t <= 30)
    return { text: "text-green-300", border: "border-green-300", bg: "bg-[rgba(6,30,12,0.6)]" };
  if (t <= 60)
    return { text: "text-blue-300", border: "border-blue-300", bg: "bg-[rgba(8,12,26,0.6)]" };
  if (t <= 300)
    return { text: "text-yellow-300", border: "border-yellow-300", bg: "bg-[rgba(26,26,26,0.6)]" };
  return { text: "text-red-300", border: "border-red-300", bg: "bg-[rgba(26,6,6,0.6)]" };
}

function getCostColor(cost?: number) {
  const c = cost ?? 0;
  if (c <= 5) return { text: "text-green-300", border: "border-green-300" };
  if (c <= 20) return { text: "text-yellow-300", border: "border-yellow-300" };
  return { text: "text-red-300", border: "border-red-300" };
}

const ModelCard = ({ model, onSelect, onMoreInfo }: ModelCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const timeColor = getTimeColor(model.estimated_time);
  const costColor = getCostColor(model.cost);

  return (
    <motion.div
      className="relative size-[210px] cursor-pointer overflow-hidden rounded-3xl border border-white/30 bg-black/20 shadow-md transition-all hover:shadow-lg"
      initial="initial"
      whileHover="hover"
      variants={cardVariants}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      style={{ willChange: "transform" }}
    >
      {/* Cover */}
      <motion.div
        className="absolute inset-0"
        variants={coverVariants}
        style={{ willChange: "transform" }}
      >
        {model.cover_image?.endsWith(".mp4") ? (
          <video
            src={model.cover_image}
            className="size-full object-cover"
            autoPlay
            muted
            loop
            playsInline
          />
        ) : (
          <Image src={model.cover_image} alt={model.model_name} fill className="object-cover" />
        )}
      </motion.div>

      {model.is_popular && (
        <div className="absolute right-2 top-2 z-20 flex items-center rounded-lg bg-rose-500/80 px-2 py-1 text-xs font-bold text-black shadow-md backdrop-blur-sm">
          <FireIcon size={14} />
          Popular
        </div>
      )}

      {/* Overlay */}
      <div className="absolute inset-0 flex flex-col justify-between bg-black/20 backdrop-blur-0 transition-all hover:backdrop-blur-0">
        <div className="relative flex size-full flex-col items-center justify-center gap-2 px-3 py-2">
          <motion.p
            className="text-center font-satoshi font-bold leading-8 text-accent"
            // style={{
            //   fontSize: model.model_name.length > 20 ? "20px" : "22px",
            //   textShadow: `
            //     -1px -1px 0 #000,
            //     1px -1px 0 #000,
            //     -1px  1px 0 #000,
            //     1px  1px 0 #000
            //   `,
            //   willChange: "transform, opacity",
            // }}
          >
            {model.model_name}
          </motion.p>

          {/* Description & Buttons container */}
          <div className="relative flex h-[48px] w-full items-center justify-center">
            {/* <motion.p
              animate={{ opacity: isHovered ? 0 : 1, y: isHovered ? -8 : 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="absolute px-2 text-center text-sm text-white/90"
              style={{ willChange: "opacity, transform" }}
            >
              {model?.description
                ? `${model.description.substring(0, 40)}${model.description.length > 60 ? "..." : ""}`
                : "No description"}
            </motion.p> */}
            <motion.div
              animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 8 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="absolute flex gap-2"
              style={{
                pointerEvents: isHovered ? "auto" : "none",
                willChange: "opacity, transform",
              }}
            >
              {/* <button
                onClick={() => onMoreInfo?.(model)}
                className="font-satoshi rounded-xl border border-white/30 bg-black/50 px-4 py-1 text-sm font-medium text-white/90 transition-transform hover:scale-105"
              >
                More info
              </button> */}
              <button
                onClick={() => onSelect(model)}
                className="rounded-xl border border-accent bg-[linear-gradient(90deg,rgba(217,232,37,0.5)_0%,rgba(227,210,186,0.5)_100%)] px-6 py-1 font-satoshi text-sm font-semibold text-accent shadow-sm transition-transform hover:scale-105"
              >
                Use
              </button>
            </motion.div>
          </div>
        </div>

        {/* Bottom tags */}
        <div className="absolute bottom-3 left-3 z-10 flex gap-2">
          <div
            className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs ${timeColor.bg} ${timeColor.border}`}
          >
            <ClockIcon className={`size-3 ${timeColor.text}`} />
            <span className={`${timeColor.text} select-none`}>{model.estimated_time} s</span>
          </div>
          <div
            className={`inline-flex items-center gap-1 rounded-lg bg-[rgba(6,6,6,0.65)] px-2 py-1 text-xs ${costColor.border}`}
          >
            <IconDiamondFilled className={`size-3 ${costColor.text}`} />
            <span className={`${costColor.text} select-none`}>{model.cost} credit</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ModelCard;
