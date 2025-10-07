// src/components/InfiniteImageScroll.jsx
"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { cn } from "@/src/lib/utils";

export const InfiniteImageScroll = ({
  images,
  orientation = "horizontal",
  direction = "left",
  speed = "normal",
  pauseOnHover = true,
  className,
}: {
  images: string[];
  orientation?: "horizontal" | "vertical";
  direction?: "left" | "right" | "up" | "down";
  speed?: "fast" | "normal" | "slow";
  pauseOnHover?: boolean;
  className?: string;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [start, setStart] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    addAnimation();
  }, []);

  function addAnimation() {
    if (containerRef.current && scrollerRef.current) {
      const scrollerContent = Array.from(scrollerRef.current.children);
      scrollerContent.forEach((item) => {
        const duplicatedItem = item.cloneNode(true);
        (duplicatedItem as HTMLElement).setAttribute("aria-hidden", "true");
        scrollerRef.current!.appendChild(duplicatedItem);
      });

      getDirection();
      getSpeed();
      setStart(true);
    }
  }

  const getDirection = () => {
    if (containerRef.current) {
      if (direction === "left" || direction === "up") {
        containerRef.current.style.setProperty("--animation-direction", "forwards");
      } else {
        containerRef.current.style.setProperty("--animation-direction", "reverse");
      }
    }
  };

  const getSpeed = () => {
    if (containerRef.current) {
      if (speed === "fast") {
        containerRef.current.style.setProperty("--animation-duration", "20s");
      } else if (speed === "normal") {
        containerRef.current.style.setProperty("--animation-duration", "40s");
      } else {
        containerRef.current.style.setProperty("--animation-duration", "80s");
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "scroller relative z-20 overflow-hidden",
        // Apply the correct mask based on orientation
        {
          "[mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]":
            orientation === "horizontal",
          "[mask-image:linear-gradient(to_bottom,transparent,white_20%,white_80%,transparent)]":
            orientation === "vertical",
        },
        className,
      )}
    >
      <div
        ref={scrollerRef}
        className={cn(
          "flex w-max min-w-full shrink-0 flex-nowrap gap-12 py-4",
          // Apply animation and layout based on orientation
          {
            "flex-row": orientation === "horizontal",
            "flex-col": orientation === "vertical",
          },
          // Apply animation only when mounted and started
          mounted &&
            start && {
              "animate-scroll-x": orientation === "horizontal",
              "animate-scroll-y": orientation === "vertical",
            },
          // Conditionally apply start and pause-on-hover classes
          !mounted && "opacity-0", // Hide until component is mounted to avoid hydration mismatch
          pauseOnHover && "hover:[animation-play-state:paused]",
        )}
      >
        {images.map((src, idx) => (
          <div
            className="relative w-[250px] flex-shrink-0 rounded-2xl"
            style={{
              // For vertical scroll, ensure images have consistent width
              width: orientation === "vertical" ? "100%" : "250px",
            }}
            key={`image-${idx}`}
          >
            <Image
              width={250}
              height={350}
              className="h-full w-full rounded-2xl object-cover"
              src={src}
              alt={`Scrolling image ${idx + 1}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
