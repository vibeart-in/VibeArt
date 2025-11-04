import React, { useEffect, useState } from "react";
import type { conversationImageObject } from "@/src/types/BaseType";
import ImageCard from "../ui/imageCard/ImageCard";
import { ImageCardLoading } from "../ui/ImageCardLoading";

type Props = {
  images: conversationImageObject[];
  title: string;
  status?: string;
  /** how many thumbnails to show before showing a +N pill (default 4) */
  maxVisibleThumbnails?: number;
  /** whether to hide the selected (primary) from the thumbnails (default true) */
  hidePrimaryFromThumbnails?: boolean;
  autoRatio?: boolean;
};

const GroupImageLayout = ({
  images = [],
  title,
  status,
  maxVisibleThumbnails = 2,
  hidePrimaryFromThumbnails = true,
  autoRatio = false,
}: Props) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [expanded, setExpanded] = useState<boolean>(false);

  useEffect(() => {
    setSelectedIndex(0);
    setExpanded(false);
  }, [images.length, images[0]?.id]);

  // Loading state
  if (status === "pending" || status === "running") {
    return (
      <div className="flex min-w-0 flex-1 flex-col items-center gap-3">
        <p className="text-center text-sm text-neutral-400">{title}</p>
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
        <div className="relative w-full max-w-[420px]">
          <div className="flex aspect-[4/5] w-full items-center justify-center rounded-2xl border-2 border-dashed border-neutral-700 bg-neutral-900/50">
            <p className="text-sm text-neutral-500">{message}</p>
          </div>
        </div>
      </div>
    );
  }

  const totalThumbs = images.length - (hidePrimaryFromThumbnails ? 1 : 0);
  // thumbnails array (exclude primary if hidePrimaryFromThumbnails)
  const allThumbnails = images
    .map((img, idx) => ({ img, idx }))
    .filter(({ idx }) => !(hidePrimaryFromThumbnails && idx === selectedIndex));

  // what to show inline before hitting +N
  const inlineThumbnails = allThumbnails.slice(0, maxVisibleThumbnails);

  const primary = images[selectedIndex];

  function onThumbClick(idx: number) {
    setSelectedIndex(idx);
    setExpanded(false); // collapse expanded view after choosing
  }

  return (
    <div className="relative flex min-w-0 flex-1 flex-col items-center gap-3">
      <p className="text-center text-sm text-neutral-400">{title}</p>

      {/* Primary image */}
      <div className="relative w-full max-w-[520px]">
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

        {/* Inline thumbnail row (mobile: under primary; sm+: float bottom-left) */}
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
                  onClick={() => onThumbClick(idx)}
                  className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border border-neutral-800 transition-transform duration-150 ease-in-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 sm:h-14 sm:w-14"
                  aria-label={`Make image ${idx + 1} primary`}
                >
                  <img
                    src={img.thumbnailUrl || img.imageUrl}
                    alt={`${title} thumbnail ${idx + 1}`}
                    className="h-full w-full object-cover"
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
                  onClick={() => setExpanded(true)}
                  className="flex h-12 w-12 items-center justify-center rounded-lg border border-neutral-800 bg-gradient-to-b from-black/40 to-black/20 px-2 text-sm font-medium text-neutral-200 sm:h-14 sm:w-14"
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

      {/* Expanded grid view for all thumbnails */}
      {expanded && allThumbnails.length > 0 && (
        <div className="w-full max-w-[520px]">
          <div className="mb-1 mt-3 flex items-center justify-between">
            <div className="text-xs text-neutral-400">
              Showing all {allThumbnails.length} image{allThumbnails.length > 1 ? "s" : ""}
            </div>
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="text-xs text-neutral-300 underline"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
            {allThumbnails.map(({ img, idx }) => (
              <button
                key={img.id ?? `${idx}-exp`}
                type="button"
                onClick={() => onThumbClick(idx)}
                className={`relative h-20 w-full overflow-hidden rounded-md border transition-transform duration-150 ease-in-out hover:scale-105 focus:outline-none ${
                  idx === selectedIndex ? "ring-2 ring-indigo-500" : "border-neutral-800"
                }`}
                aria-label={`Select image ${idx + 1}`}
              >
                <img
                  src={img.thumbnailUrl || img.imageUrl}
                  alt={`${title} thumbnail ${idx + 1}`}
                  className="h-full w-full object-cover"
                  draggable={false}
                />
                <div className="absolute right-1 top-1 rounded-sm bg-black/60 px-1 text-[10px] text-neutral-200">
                  {idx + 1}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupImageLayout;
