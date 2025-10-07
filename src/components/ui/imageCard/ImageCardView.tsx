"use client";

import React, { useCallback, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, type Variants } from "motion/react";
import { IconDownload, IconTrash, IconWand } from "@tabler/icons-react";
import { ImagePlaceholder } from "./ImagePlaceholder";
import { VideoOptions } from "./ImageCard";

const overlayVariants: Variants = {
  rest: { opacity: 0, y: 20, transition: { duration: 0.2 } },
  hover: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

const cardScaleWhileHover = { scale: 1.02 };

interface MediaCardViewProps {
  mediaUrl: string;
  altText: string;
  width: number;
  height: number;
  sizes: string;
  onOpen: () => void;
  cardContainerId: string;
  isMediaVideo: boolean;
  videoOptions?: VideoOptions;
}

export const MediaCardView = ({
  mediaUrl,
  altText,
  width,
  height,
  sizes,
  onOpen,
  cardContainerId,
  isMediaVideo,
  videoOptions = {},
}: MediaCardViewProps) => {
  const [isMediaLoading, setIsMediaLoading] = useState(true);

  const handleMediaLoad = useCallback(() => {
    setIsMediaLoading(false);
  }, []);

  const preloadModalMedia = useCallback(() => {
    if (isMediaVideo) return;
    const img = new window.Image();
    img.src = mediaUrl;
  }, [mediaUrl, isMediaVideo]);

  const cardVideoOptions = {
    autoPlay: true,
    muted: true,
    loop: true,
    playsInline: true,
    controls: false,
    ...videoOptions,
  };

  return (
    <motion.div
      className="relative w-full cursor-pointer overflow-hidden rounded-3xl"
      whileHover={cardScaleWhileHover}
      transition={{ duration: 0.25 }}
      onClick={onOpen}
      onPointerEnter={preloadModalMedia}
      layoutId={cardContainerId}
      initial="rest"
      animate="rest"
    >
      <div className="relative w-full overflow-hidden bg-black/50">
        <AnimatePresence>
          {isMediaLoading && <ImagePlaceholder mediaUrl={mediaUrl} width={width} height={height} />}
        </AnimatePresence>

        {isMediaVideo ? (
          <video
            src={mediaUrl}
            className="h-auto w-full object-cover transition-opacity duration-300"
            style={{ opacity: isMediaLoading ? 0 : 1 }}
            onLoadedData={handleMediaLoad}
            onError={handleMediaLoad}
            {...cardVideoOptions}
          />
        ) : (
          <Image
            src={mediaUrl}
            alt={altText}
            width={width}
            height={height}
            sizes={sizes}
            className="h-auto w-full object-cover transition-opacity duration-300"
            style={{ opacity: isMediaLoading ? 0 : 1 }}
            onLoad={handleMediaLoad}
            onError={handleMediaLoad}
          />
        )}
      </div>

      <div className="pointer-events-none absolute inset-0 rounded-3xl border-2 border-white/30" />

      <motion.div
        className="absolute bottom-0 left-0 flex h-[80px] w-full items-end bg-gradient-to-t from-black/75 to-transparent p-5 backdrop-blur-[2px]"
        variants={overlayVariants}
        initial="rest"
        whileHover="hover"
        animate="rest"
      >
        <div className="flex w-full items-center justify-between">
          <button
            type="button"
            className="flex items-center gap-2 rounded-full bg-white/30 px-4 py-2 text-base font-semibold text-white backdrop-blur-sm"
            onClick={(e) => e.stopPropagation()}
            aria-label="Edit image"
            title="Edit"
          >
            <IconWand />
            <span>Edit</span>
          </button>
          <div className="flex items-center gap-4 text-xl text-white/80">
            <button type="button" aria-label="Download image" title="Download">
              <IconDownload className="cursor-pointer transition-colors hover:text-white" />
            </button>
            <button type="button" aria-label="Delete image" title="Delete">
              <IconTrash className="cursor-pointer transition-colors hover:text-white" />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
