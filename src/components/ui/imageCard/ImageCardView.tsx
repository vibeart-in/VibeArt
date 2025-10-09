"use client";

import React, { useCallback, useMemo, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, type Variants } from "motion/react";
import { IconDownload, IconTrash, IconWand } from "@tabler/icons-react";
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

  const handleThumbnailLoad = useCallback(() => {
    setIsThumbnailLoaded(true);
    setIsPlaceholderVisible(false);
  }, []);

  const handleFullLoad = useCallback(() => {
    setIsFullLoaded(true);
    // CRITICAL: also hide placeholder when full media is ready
    setIsPlaceholderVisible(false);
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
  } as VideoOptions & { preload?: string };

  const aspect = `${width} / ${height}`;

  // If using blob:/data: URLs, Next/Image can fail on some versions — use <img>
  const isBlobLike = useMemo(
    () => mediaUrl.startsWith("blob:") || mediaUrl.startsWith("data:"),
    [mediaUrl],
  );

  return (
    <motion.div
      className="relative w-full cursor-pointer overflow-hidden rounded-[28px]"
      whileHover={cardScaleWhileHover}
      transition={{ duration: 0.25 }}
      onClick={onOpen}
      onPointerEnter={preloadModalMedia}
      layoutId={cardContainerId}
      initial="rest"
      animate="rest"
      // style={{ aspectRatio: aspect }}
    >
      <div className="relative h-full w-full overflow-hidden bg-black/50">
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
            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-300"
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
            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-300"
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
            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-300"
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
            className="inset-0 h-full w-full object-cover transition-opacity duration-300"
            style={{ opacity: isFullLoaded ? 1 : 0 }}
            // Use Next/Image's completion callback for reliable load detection
            onLoad={handleFullLoad}
            onError={handleFullLoad}
            unoptimized
            priority
            draggable={false}
          />
        )}
      </div>

      <div className="pointer-events-none absolute inset-0 rounded-[28px] border-2 border-white/30" />

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
