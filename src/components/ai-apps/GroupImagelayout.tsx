import React, { useEffect, useState } from "react";

import type { conversationImageObject } from "@/src/types/BaseType";
import { ImageCardLoading } from "../ui/ImageCardLoading";
import ImageCard from "../ui/imageCard/ImageCard";

type Props = {
  images: conversationImageObject[];
  title: string;
  status?: string;
  maxThumbnails?: number;
  autoRatio?: boolean;
};

const GroupImageLayout = ({
  images = [],
  title,
  status,
  maxThumbnails = 4,
  autoRatio = false,
}: Props) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  useEffect(() => {
    setSelectedIndex(0);
  }, [images.length, images[0]?.id]);

  // Loading
  if (status === "pending" || status === "running") {
    return (
      <div className="flex min-w-0 flex-1 flex-col items-center gap-3">
        <p className="text-center text-sm text-neutral-400">{title}</p>
        <ImageCardLoading width={250} ratio="3:4" />
      </div>
    );
  }

  // Empty
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

  const primary = images[selectedIndex];
  const thumbnails = images.filter((_, idx) => idx !== selectedIndex).slice(0, maxThumbnails);

  return (
    <div className="relative flex min-w-0 flex-1 flex-col items-center gap-3">
      <p className="text-center text-sm text-neutral-400">{title}</p>

      {/* Primary image wrapper — responsive width, keeps aspect ratio and does not overflow */}
      <div className="relative w-full">
        <div
          className="overflow-hidden rounded-[20px]"
          style={{ boxShadow: "0 8px 30px rgba(0,0,0,0.6)" }}
        >
          {/* ImageCard should be responsive — ensure ImageCard renders an img that fits its container */}
          <div className="w-full">
            <ImageCard
              mediaUrl={primary.imageUrl}
              thumbnailUrl={primary.thumbnailUrl}
              width={primary.width || 420}
              height={primary.height || 520}
              prompt={title}
              autoRatio={autoRatio}
            />
          </div>
        </div>

        {/* Thumbnails:
            - On small screens (default) they sit below the primary image (static).
            - On sm+ screens they float bottom-left (absolute).
            - Thumbnails row is horizontally scrollable if overflow.
        */}
        <div
          className={`mt-3 sm:mt-0 ${thumbnails.length > 0 ? "" : "hidden"} z-20 w-full sm:absolute sm:bottom-3 sm:right-3 sm:w-auto`}
        >
          <div
            className="scrollbar-hide flex gap-2 overflow-x-auto rounded-lg bg-neutral-900/70 p-2 backdrop-blur-sm"
            // allow horizontal scroll when too many thumbnails
          >
            {images.map((img, idx) => {
              if (idx === selectedIndex) return null; // hide primary from thumbnails to keep layout compact
              // Only render the limited thumbnails (respect maxThumbnails)
              if (!thumbnails.some((t) => t.id === img.id)) return null;

              const key = `${img.id}-${idx}`;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedIndex(idx)}
                  className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border border-neutral-800 transition-transform duration-150 ease-in-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 sm:h-14 sm:w-14"
                  aria-label={`Make this image primary`}
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
              );
            })}
          </div>
        </div>
      </div>

      {/* More count indicator (if thumbnails are truncated) */}
      {images.length - 1 > maxThumbnails && (
        <div className="flex w-full max-w-[420px] justify-end px-2">
          <div className="text-xs text-neutral-500">+{images.length - 1 - maxThumbnails} more</div>
        </div>
      )}
    </div>
  );
};

export default GroupImageLayout;
