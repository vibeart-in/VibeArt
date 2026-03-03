"use client";

import {
  IconDownload,
  IconEdit,
  IconTrash,
  IconVideo,
  IconWindowMaximize,
} from "@tabler/icons-react";
import { motion, type Variants } from "framer-motion";
import React, { useCallback, useEffect, useRef, useState } from "react";

import { useResizeObserver } from "@/src/hooks/useResizeObserver";

import { ImagePlaceholder } from "./ImagePlaceholder";

// Parent variants now expose both `rest` and `hover` so child variants will receive the state.
const parentVariants: Variants = {
  rest: { scale: 1 },
  hover: { scale: 1.02 },
};

const overlayVariants: Variants = {
  rest: { opacity: 0, y: 20, transition: { duration: 0.2 } },
  hover: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

export interface VideoOptions {
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  playsInline?: boolean;
  controls?: boolean;
}

export interface MediaCardViewProps {
  prompt: string;
  mediaUrl: string;
  thumbnailUrl?: string | null;
  altText: string;
  width: number;
  height: number;
  onOpen: () => void;
  cardContainerId: string;
  isMediaVideo: boolean;
  videoOptions?: VideoOptions;
  /**
   * If true the card will compute and use the actual media aspect ratio
   * (from thumbnail/full image or video metadata) instead of the provided width/height.
   */
  autoRatio?: boolean;
}

export const MediaCardView = ({
  prompt,
  mediaUrl,
  thumbnailUrl,
  altText,
  width,
  height,
  onOpen,
  cardContainerId,
  isMediaVideo,
  videoOptions = {},
  autoRatio = false,
}: MediaCardViewProps) => {
  const [isPlaceholderVisible, setIsPlaceholderVisible] = useState(true);
  const [isThumbnailLoaded, setIsThumbnailLoaded] = useState(false);
  const [isFullLoaded, setIsFullLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);

  // calculated aspect string like "1920 / 1080" when discovered
  const [calculatedAspect, setCalculatedAspect] = useState<string | null>(
    autoRatio ? null : `${width} / ${height}`,
  );

  // timers/cache
  const preloadTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const preloadCache = useRef<Record<string, boolean>>({});

  // DOM refs so we can check `.complete` for cached images and to force re-checks
  const thumbnailRef = useRef<HTMLImageElement | null>(null);
  const fullRef = useRef<HTMLImageElement | HTMLVideoElement | null>(null);

  const { ref: containerRef, width: containerWidth } = useResizeObserver();
  const showText = containerWidth > 350; // Set your desired breakpoint

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (preloadTimer.current) {
        clearTimeout(preloadTimer.current);
        preloadTimer.current = null;
      }
    };
  }, []);

  // Helper: set aspect from numeric w/h
  const setRatioFromNumbers = useCallback(
    (w?: number, h?: number) => {
      if (!autoRatio) return;
      if (!w || !h || w <= 0 || h <= 0) return;
      // normalize to avoid huge integers (optional)
      setCalculatedAspect(`${Math.round(w)} / ${Math.round(h)}`);
    },
    [autoRatio],
  );

  // Check an element (img/video) and set ratio if possible
  const setRatioFromElement = useCallback(
    (el: HTMLImageElement | HTMLVideoElement | null) => {
      if (!el || !autoRatio) return;
      if (el instanceof HTMLImageElement) {
        if (el.naturalWidth && el.naturalHeight) {
          setRatioFromNumbers(el.naturalWidth, el.naturalHeight);
        }
      } else if (el instanceof HTMLVideoElement) {
        if ((el as HTMLVideoElement).videoWidth && (el as HTMLVideoElement).videoHeight) {
          setRatioFromNumbers(
            (el as HTMLVideoElement).videoWidth,
            (el as HTMLVideoElement).videoHeight,
          );
        }
      }
    },
    [autoRatio, setRatioFromNumbers],
  );

  // Handlers --- keep them stable with useCallback
  const handleThumbnailLoad = useCallback(() => {
    setIsThumbnailLoaded(true);
    // hide placeholder once a thumbnail is ready (but full media may still be loading)
    setIsPlaceholderVisible(false);
    // use thumbnail intrinsic size as first hint
    setRatioFromElement(thumbnailRef.current);
    // helpful debug when testing
    // console.log("Thumbnail loaded");
  }, [setRatioFromElement]);

  const handleFullLoad = useCallback(() => {
    setIsFullLoaded(true);
    setIsPlaceholderVisible(false);
    // Use full element (image/video) to set final accurate ratio
    setRatioFromElement(fullRef.current);
    // console.log("Full loaded");
  }, [setRatioFromElement]);

  const handleFullError = useCallback(() => {
    setLoadError(true);
    setIsPlaceholderVisible(false);
    // console.log("Error loading media");
  }, []);

  // Debounced preload with a tiny cache so we don't spam requests on jittering pointer
  const preloadModalMedia = useCallback(() => {
    if (isMediaVideo) return; // don't preload large video blobs here
    if (!mediaUrl) return;

    if (preloadCache.current[mediaUrl]) return;

    if (preloadTimer.current) {
      clearTimeout(preloadTimer.current);
    }

    preloadTimer.current = setTimeout(() => {
      try {
        const img = new window.Image();
        img.onload = () => {
          preloadCache.current[mediaUrl] = true;
        };
        img.onerror = () => {
          preloadCache.current[mediaUrl] = false;
        };
        img.src = mediaUrl;
      } catch (e) {
        // defensive
      } finally {
        preloadTimer.current = null;
      }
    }, 120);
  }, [mediaUrl, isMediaVideo]);

  const handlePointerLeave = useCallback(() => {
    if (preloadTimer.current) {
      clearTimeout(preloadTimer.current);
      preloadTimer.current = null;
    }
  }, []);

  // Use correct HTML video attributes typing
  const cardVideoProps: React.VideoHTMLAttributes<HTMLVideoElement> = {
    autoPlay: true,
    muted: true,
    loop: true,
    playsInline: true,
    controls: false,
    preload: "metadata",
    ...videoOptions,
  };

  // keyboard accessibility for the clickable card
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onOpen();
      }
    },
    [onOpen],
  );

  const handleDownload = useCallback(async () => {
    try {
      const response = await fetch(mediaUrl);
      if (!response.ok) throw new Error("Network response was not ok.");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // derive file name
      const baseName = prompt && prompt.trim().length > 0 ? prompt : "vibeart_image";
      const sanitizedBase = baseName
        .replace(/[^a-zA-Z0-9_\-]+/g, "_")
        .replace(/_+/g, "_")
        .slice(0, 50);

      const contentType = response.headers.get("content-type") || "";
      let ext = "jpg";
      if (contentType.includes("png")) ext = "png";
      else if (contentType.includes("webp")) ext = "webp";
      else if (contentType.includes("gif")) ext = "gif";
      else if (contentType.includes("mp4")) ext = "mp4";
      else if (contentType.includes("webm")) ext = "webm";
      else if (contentType.includes("mov")) ext = "mov";

      const fileName = `${sanitizedBase}.${ext}`;

      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();

      setTimeout(() => {
        try {
          window.URL.revokeObjectURL(url);
        } catch {
          /* ignore */
        }
        if (a.parentNode) a.parentNode.removeChild(a);
      }, 1500);
    } catch (error) {
      console.error("Failed to download media:", error);
    }
  }, [mediaUrl, prompt]);

  // --- IMPORTANT: react to mediaUrl/thumbnailUrl changes ---
  useEffect(() => {
    // reset state when resources change
    setIsPlaceholderVisible(true);
    setIsThumbnailLoaded(false);
    setIsFullLoaded(false);
    setLoadError(false);

    // reset calculated aspect when switching media (if autoRatio)
    if (autoRatio) {
      setCalculatedAspect(null);
    } else {
      setCalculatedAspect(`${width} / ${height}`);
    }

    // clear any pending preload timer
    if (preloadTimer.current) {
      clearTimeout(preloadTimer.current);
      preloadTimer.current = null;
    }

    // If thumbnail or full image are already cached the DOM `complete` flag will be true.
    // We check and manually trigger our handlers so we don't stay stuck on the placeholder.
    const t = thumbnailRef.current as HTMLImageElement | null;
    if (t && t.complete) {
      // microtask to let React attach listeners
      Promise.resolve().then(() => handleThumbnailLoad());
    }

    const f = fullRef.current as HTMLImageElement | HTMLVideoElement | null;
    // For images the `complete` flag exists; for videos check readyState
    if (f) {
      if (f instanceof HTMLImageElement && f.complete) {
        Promise.resolve().then(() => handleFullLoad());
      } else if (f instanceof HTMLVideoElement && (f as HTMLVideoElement).readyState > 0) {
        Promise.resolve().then(() => handleFullLoad());
      }
    }

    // also reset the small preload cache for this item so user interactions work predictably
    if (mediaUrl) preloadCache.current[mediaUrl] = false;
  }, [mediaUrl, thumbnailUrl, handleThumbnailLoad, handleFullLoad, autoRatio, width, height]);

  // computed style: prefer calculatedAspect when present.
  const computedAspectStyle: React.CSSProperties = {};
  if (calculatedAspect) {
    computedAspectStyle.aspectRatio = calculatedAspect;
  } else if (!autoRatio) {
    computedAspectStyle.aspectRatio = `${width} / ${height}`;
  } // if autoRatio && !calculatedAspect -> leave undefined to allow min-h fallback

  return (
    <motion.div
      ref={containerRef}
      role="button"
      tabIndex={0}
      // note: added min-h fallback so card doesn't collapse while waiting for ratio
      className="md: relative min-h-[90px] w-full min-w-[100px] cursor-pointer overflow-hidden rounded-[12px] will-change-transform md:rounded-[28px]"
      variants={parentVariants}
      initial="rest"
      animate="rest"
      whileHover="hover"
      transition={{ duration: 0.25 }}
      onClick={onOpen}
      onPointerEnter={preloadModalMedia}
      onPointerLeave={handlePointerLeave}
      onKeyDown={onKeyDown}
      layoutId={cardContainerId}
      style={computedAspectStyle}
      aria-label={altText}
    >
      <div className="relative size-full overflow-hidden bg-black/50">
        <div
          className="-z-10 sm:size-full lg:min-w-[500px]"
          style={{ opacity: isPlaceholderVisible ? 1 : 0 }}
        >
          <ImagePlaceholder
            key={`placeholder-${cardContainerId}`}
            mediaUrl={mediaUrl}
            width={width}
            height={height}
          />
        </div>

        {thumbnailUrl && (
          <img
            key={`thumb-${thumbnailUrl}-${mediaUrl}`}
            ref={thumbnailRef}
            src={thumbnailUrl}
            alt={altText}
            className="absolute inset-0 size-full object-cover transition-opacity duration-300"
            style={{ opacity: isThumbnailLoaded && !isFullLoaded ? 1 : 0 }}
            onLoad={handleThumbnailLoad}
            onError={handleThumbnailLoad}
            loading="lazy"
            decoding="async"
            draggable={false}
            aria-hidden={!isThumbnailLoaded}
          />
        )}

        {loadError ? (
          // Render a lightweight fallback UI when the media fails to load
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white">
            <div className="flex flex-col items-center gap-2">
              <IconTrash aria-hidden="true" />
              <span className="text-sm">Failed to load media</span>
            </div>
          </div>
        ) : isMediaVideo ? (
          <video
            // using style opacity so we can fade in once loaded
            style={{ opacity: isFullLoaded ? 1 : 0 }}
            onLoadedData={handleFullLoad}
            onLoadedMetadata={(e) => {
              // set ratio as soon as metadata available
              setRatioFromElement(e.currentTarget);
            }}
            onError={handleFullError}
            poster={thumbnailUrl ?? undefined}
            src={mediaUrl}
            {...cardVideoProps}
            ref={(el) => {
              // keep ref to the video element for readyState checks and sizing
              fullRef.current = el;
            }}
            className="z-5 absolute inset-0 size-full object-cover transition-opacity duration-300"
          />
        ) : (
          <img
            key={`full-${mediaUrl}`}
            ref={(el) => {
              fullRef.current = el;
            }}
            src={mediaUrl}
            alt={altText}
            // IMPORTANT: when autoRatio is true we DON'T pass width/height attributes
            {...(!autoRatio ? { width, height } : {})}
            className="z-5 absolute inset-0 size-full object-cover transition-opacity duration-300"
            style={{ opacity: isFullLoaded ? 1 : 0 }}
            onLoad={handleFullLoad}
            onError={handleFullError}
            draggable={false}
            loading="lazy"
            decoding="async"
          />
        )}
      </div>

      <div className="pointer-events-none absolute inset-0 rounded-[12px] border-2 border-white/10 md:rounded-[28px]" />

      <motion.div
        className="absolute bottom-0 left-0 hidden w-full bg-gradient-to-t from-black/75 to-transparent p-3 will-change-[opacity,transform] sm:p-4 md:block"
        variants={overlayVariants}
        initial="rest"
        whileHover="hover"
        animate="rest"
      >
        <div className="pointer-events-auto flex flex-wrap items-center justify-between gap-2 sm:gap-3">
          {/* --- Left side buttons (Edit / Upscale / Video) --- */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              {
                label: "Edit",
                icon: IconEdit,
                onClick: () => {
                  const mediaData = {
                    permanentPath: mediaUrl,
                    displayUrl: mediaUrl,
                    uploaderId: 0,
                  };
                  const currentPath = window.location.pathname;

                  if (currentPath.startsWith("/edit/")) {
                    // If already on edit page, emit a custom event so the page can handle the file immediately
                    window.dispatchEvent(new CustomEvent("app:image-edit", { detail: mediaData }));
                  } else {
                    const encoded = encodeURIComponent(mediaUrl);
                    if ((window as any).nextRouterPush) {
                      (window as any).nextRouterPush(`/edit?image-url=${encoded}`);
                    } else {
                      window.location.href = `${window.location.origin}/edit?image-url=${encoded}`;
                    }
                  }
                },
              },
              {
                label: "Upscale",
                icon: IconWindowMaximize,
                onClick: () => {
                  const encoded = encodeURIComponent(mediaUrl);
                  window.location.href = `${window.origin}/ai-apps/108fa3df-6a1a-460b-aecb-cd1f025d4534?image-url=${encoded}`;
                },
              },
              {
                label: "Video",
                icon: IconVideo,
                onClick: () => {
                  const encoded = encodeURIComponent(mediaUrl);
                  window.location.href = `${window.origin}/video?image-url=${encoded}`;
                },
              },
            ].map(({ label, icon: Icon, onClick }) => (
              <button
                key={label}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClick();
                }}
                title={label}
                className="flex items-center gap-1.5 rounded-xl bg-white/20 px-3 py-2 text-xs font-medium text-white backdrop-blur-sm transition hover:bg-accent/30 hover:text-accent"
              >
                <Icon className="size-4 shrink-0" aria-hidden="true" />
                {showText && <span>{label}</span>}
              </button>
            ))}
          </div>

          {/* --- Right side icons (Download / Delete) --- */}
          <div className="flex items-center gap-2 text-white/80">
            <button
              type="button"
              aria-label="Download image"
              title="Download"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleDownload?.();
              }}
              className="transition-colors hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            >
              <IconDownload className="size-6" aria-hidden="true" />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
