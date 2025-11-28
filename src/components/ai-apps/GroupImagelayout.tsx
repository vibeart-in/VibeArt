import React, { useEffect, useState } from "react";
import type { conversationImageObject } from "@/src/types/BaseType";
import ImageCard from "../ui/imageCard/ImageCard";
import { ImageCardLoading } from "../ui/ImageCardLoading";
type Props = {
  images: conversationImageObject[];
  title: string;
  status?: string;
  maxVisibleThumbnails?: number;
  hidePrimaryFromThumbnails?: boolean;
  autoRatio?: boolean;
  selectedIndex?: number;
  onThumbClick?: (idx: number) => void;
  onExpandToggle?: () => void;
  expanded?: boolean;
  containerClassName?: string;
};
const GroupImageLayout = ({
  images = [],
  title,
  status,
  maxVisibleThumbnails = 2,
  hidePrimaryFromThumbnails = true,
  autoRatio = false,
  selectedIndex: externalSelectedIndex,
  onThumbClick: externalOnThumbClick,
  onExpandToggle,
  expanded = false,
  containerClassName = "",
}: Props) => {
  const [internalSelectedIndex, setInternalSelectedIndex] = useState<number>(0);
  // Use external state if provided, otherwise use internal state
  const selectedIndex =
    externalSelectedIndex !== undefined ? externalSelectedIndex : internalSelectedIndex;
  const onThumbClick = externalOnThumbClick || setInternalSelectedIndex;
  useEffect(() => {
    setInternalSelectedIndex(0);
  }, [images.length, images[0]?.id]);
  // Loading state
  if (status === "pending" || status === "running") {
    return (
      <div className="flex min-w-0 flex-1 flex-col items-center gap-3">
        <p className="text-center text-sm text-neutral-400">{title}</p>
        <p className="text-center text-sm font-medium uppercase tracking-wider text-neutral-300">
          {title}
        </p>
        <ImageCardLoading width={320} />
      </div>
    );
  }
  // Empty state
  if (!images || images.length === 0) {
    const message = title === "Input" ? "No Image Input" : "Image Failed";
    return (
      <div className="flex min-w-0 flex-1 flex-col items-center gap-3">
        <p className="text-center text-sm text-neutral-400">{title}</p>
        <p className="text-center text-sm font-medium uppercase tracking-wider text-neutral-300">
          {title}
        </p>
        <div className="relative w-full max-w-[420px]">
          <div className="flex aspect-[4/5] w-full items-center justify-center rounded-2xl border-2 border-dashed border-neutral-700 bg-neutral-900/50">
            <p className="text-sm text-neutral-500">{message}</p>
          </div>
        </div>
      </div>
    );
  }
  const totalThumbs = images.length - (hidePrimaryFromThumbnails ? 1 : 0);
  const allThumbnails = images
    .map((img, idx) => ({ img, idx }))
    .filter(({ idx }) => !(hidePrimaryFromThumbnails && idx === selectedIndex));
  const inlineThumbnails = allThumbnails.slice(0, maxVisibleThumbnails);
  const primary = images[selectedIndex];
  function handleThumbClick(idx: number) {
    onThumbClick(idx);
  }
  return (
    <div className="relative flex min-w-0 flex-1 flex-col items-center gap-3">
      <p className="text-center text-sm font-medium uppercase tracking-wider text-neutral-300">
        {title}
      </p>
      {/* Primary image */}
      <div className={`relative w-full max-w-[520px] ${containerClassName}`}>
        <div
          className="overflow-hidden rounded-[20px]"
          style={{ boxShadow: "0 8px 30px rgba(0,0,0,0.6)" }}
        >
          <ImageCard
            mediaUrl={primary.imageUrl}
            width={primary.width || 520}
            height={primary.height || 650}
            prompt={title}
            autoRatio={autoRatio}
          />
        </div>
        {/* Inline thumbnail row */}
        <div className={`z-20 mt-3 w-full sm:absolute sm:bottom-4 sm:right-4 sm:mt-0 sm:w-auto`}>
          <div className="flex items-center gap-2">
            <div
              className="scrollbar-hide flex gap-2 overflow-x-auto rounded-lg bg-neutral-900/70 p-2 backdrop-blur-sm"
              style={{ WebkitOverflowScrolling: "touch" }}
              role="list"
            >
              {inlineThumbnails.map(({ img, idx }) => (
                <button
                  key={img.id ?? `${idx}`}
                  type="button"
                  onClick={() => handleThumbClick(idx)}
                  className="relative size-12 flex-shrink-0 overflow-hidden rounded-xl border border-neutral-800 transition-transform duration-150 ease-in-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 sm:size-14"
                  aria-label={`Make image ${idx + 1} primary`}
                >
                  <img
                    src={img.thumbnailUrl || img.imageUrl}
                    alt={`${title} thumbnail ${idx + 1}`}
                    className="size-full object-cover"
                    draggable={false}
                  />
                  <div className="absolute right-1 top-1 rounded-sm bg-black/60 px-1 text-[10px] text-neutral-200">
                    {idx + 1}
                  </div>
                </button>
              ))}
              {/* +N pill if there are more */}
              {allThumbnails.length > inlineThumbnails.length && !expanded && (
                <button
                  type="button"
                  onClick={onExpandToggle}
                  className="flex size-12 items-center justify-center rounded-lg border border-neutral-800 bg-gradient-to-b from-black/40 to-black/20 px-2 text-sm font-medium text-neutral-200 sm:size-14"
                  aria-label="Show all thumbnails"
                  title={`Show ${allThumbnails.length} thumbnails`}
                >
                  +{allThumbnails.length - inlineThumbnails.length}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default GroupImageLayout;
