"use client";

import { IconDownload, IconTrash, IconWand } from "@tabler/icons-react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import Image from "next/image";
import React, { useCallback, useMemo, useState, useRef } from "react";

import { ImagePlaceholder } from "./ImagePlaceholder";

const overlayVariants: Variants = {
  rest: { opacity: 0, y: 20, transition: { duration: 0.2 } },
  hover: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

const cardScaleWhileHover = { scale: 1.02 };

export interface VideoOptions {
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  playsInline?: boolean;
  controls?: boolean;
}

export interface MediaCardViewProps {
  mediaUrl: string;
  thumbnailUrl?: string | null;
  altText: string;
  width: number;
  height: number;
  onOpen: () => void;
  cardContainerId: string;
  isMediaVideo: boolean;
  videoOptions?: VideoOptions;
}

export const MediaCardView = ({
  mediaUrl,
  thumbnailUrl,
  altText,
  width,
  height,
  onOpen,
  cardContainerId,
  isMediaVideo,
  videoOptions = {},
}: MediaCardViewProps) => {
  const [isPlaceholderVisible, setIsPlaceholderVisible] = useState(true);
  const [isThumbnailLoaded, setIsThumbnailLoaded] = useState(false);
  const [isFullLoaded, setIsFullLoaded] = useState(false);

  // Ref to hold the timer ID to clear it on unmount or pointer leave
  const preloadTimer = useRef<NodeJS.Timeout | null>(null);

  const handleThumbnailLoad = useCallback(() => {
    setIsThumbnailLoaded(true);
    setIsPlaceholderVisible(false);
  }, []);

  const handleFullLoad = useCallback(() => {
    setIsFullLoaded(true);
    // CRITICAL: also hide placeholder when full media is ready
    setIsPlaceholderVisible(false);
  }, []);

  // OPTIMIZATION 3: Delay media preloading to prevent animation interference.
  const preloadModalMedia = useCallback(() => {
    if (isMediaVideo) return;

    // Clear any existing timer
    if (preloadTimer.current) {
      clearTimeout(preloadTimer.current);
    }

    // Set a new timer
    preloadTimer.current = setTimeout(() => {
      const img = new window.Image();
      img.src = mediaUrl;
    }, 100); // 100ms delay gives the animation time to start smoothly
  }, [mediaUrl, isMediaVideo]);

  const handlePointerLeave = useCallback(() => {
    // Clean up the timer if the user leaves the card before it fires
    if (preloadTimer.current) {
      clearTimeout(preloadTimer.current);
    }
  }, []);

  const cardVideoOptions = {
    autoPlay: true,
    muted: true,
    loop: true,
    playsInline: true,
    controls: false,
    ...videoOptions,
  } as VideoOptions & { preload?: string };

  const aspect = `${width} / ${height}`;

  // If using blob:/data: URLs, Next/Image can fail on some versions — use <img>
  const isBlobLike = useMemo(
    () => mediaUrl.startsWith("blob:") || mediaUrl.startsWith("data:"),
    [mediaUrl],
  );

  return (
    <motion.div
      className="relative w-full cursor-pointer overflow-hidden rounded-[28px] will-change-transform" // OPTIMIZATION 2: Added will-change
      whileHover={cardScaleWhileHover}
      transition={{ duration: 0.25 }}
      onClick={onOpen}
      onPointerEnter={preloadModalMedia}
      onPointerLeave={handlePointerLeave}
      layoutId={cardContainerId}
      initial="rest"
      animate="rest"
      // style={{ aspectRatio: aspect }}
    >
      <div className="relative size-full overflow-hidden bg-black/50">
        <AnimatePresence>
          {isPlaceholderVisible && (
            <div className="min-w-[500px]">
              <ImagePlaceholder
                key={`placeholder-${cardContainerId}`}
                mediaUrl={mediaUrl}
                width={width}
                height={height}
              />
            </div>
          )}
        </AnimatePresence>

        {thumbnailUrl && (
          <img
            src={thumbnailUrl}
            alt={altText + " thumbnail"}
            className="absolute inset-0 size-full object-cover transition-opacity duration-300"
            style={{ opacity: isThumbnailLoaded && !isFullLoaded ? 1 : 0 }}
            onLoad={handleThumbnailLoad}
            onError={handleThumbnailLoad}
            loading="eager"
            decoding="async"
            draggable={false}
          />
        )}

        {isMediaVideo ? (
          <video
            src={mediaUrl}
            // className="absolute inset-0 h-full w-full object-cover transition-opacity duration-300"
            style={{ opacity: isFullLoaded ? 1 : 0 }}
            onLoadedData={handleFullLoad}
            onError={handleFullLoad}
            poster={thumbnailUrl ?? undefined}
            preload="metadata"
            {...cardVideoOptions}
          />
        ) : isBlobLike ? (
          <img
            src={mediaUrl}
            alt={altText}
            className="absolute inset-0 size-full object-cover transition-opacity duration-300"
            style={{ opacity: isFullLoaded ? 1 : 0 }}
            onLoad={handleFullLoad}
            onError={handleFullLoad}
            draggable={false}
          />
        ) : (
          <Image
            src={mediaUrl}
            alt={altText}
            width={width}
            height={height}
            className="inset-0 size-full object-cover transition-opacity duration-300"
            style={{ opacity: isFullLoaded ? 1 : 0 }}
            onLoad={handleFullLoad}
            onError={handleFullLoad}
            priority
            draggable={false}
          />
        )}
      </div>

      <div className="pointer-events-none absolute inset-0 rounded-[28px] border-2 border-white/10" />

      <motion.div
        // OPTIMIZATION 1: Removed `backdrop-blur-[2px]` which is very performance-intensive.
        // OPTIMIZATION 2: Added `will-change-[opacity,transform]`
        className="absolute bottom-0 left-0 flex h-[80px] w-full items-end bg-gradient-to-t from-black/75 to-transparent p-5 will-change-[opacity,transform]"
        variants={overlayVariants}
        initial="rest"
        whileHover="hover"
        animate="rest"
      >
        <div className="flex w-full items-center justify-between">
          <button
            type="button"
            className="flex items-center gap-2 rounded-full bg-white/30 px-4 py-2 text-base font-semibold text-white backdrop-blur-sm" // NOTE: Kept blur on the button as it's smaller and less costly.
            onClick={(e) => e.stopPropagation()}
            aria-label="Edit image"
            title="Edit"
          >
            <IconWand />
            <span>Edit</span>
          </button>
          <div className="flex items-center gap-4 text-xl text-white/80">
            <button
              type="button"
              aria-label="Download image"
              title="Download"
              onClick={(e) => e.stopPropagation()}
            >
              <IconDownload className="cursor-pointer transition-colors hover:text-white" />
            </button>
            <button
              type="button"
              aria-label="Delete image"
              title="Delete"
              onClick={(e) => e.stopPropagation()}
            >
              <IconTrash className="cursor-pointer transition-colors hover:text-white" />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
