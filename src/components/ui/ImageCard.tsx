"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  KeyboardEvent,
  MouseEvent,
} from "react";
import Image from "next/image";
import {
  motion,
  AnimatePresence,
  type Variants,
  useMotionValue,
  useSpring,
} from "motion/react";
import {
  IconArrowLeft,
  IconDownload,
  IconHeart,
  IconShare,
  IconThumbDown,
  IconTrash,
  IconWand,
} from "@tabler/icons-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./hover-card";
import { ArrowRight } from "lucide-react";

export interface ImageCardProps {
  imageUrl: string;
  prompt: string;
  width: number;
  height: number;
  // Optional enhancements; backward compatible
  blurDataURL?: string;
  sizes?: string;
}

const DEFAULT_SIZES =
  "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw";

const overlayVariants: Variants = {
  rest: { opacity: 0, y: 20, transition: { duration: 0.2 } },
  hover: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

const cardScaleWhileHover = { scale: 1.02 };

const ImageCard = ({
  imageUrl,
  prompt,
  width,
  height,
  blurDataURL,
  sizes = DEFAULT_SIZES,
}: ImageCardProps) => {
  // Separate loading states for card and modal to avoid coupling
  const [isCardImageLoading, setIsCardImageLoading] = useState(true);
  const [isModalImageLoading, setIsModalImageLoading] = useState(true);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Zoom controls for modal image (transform-based)
  const [isZoomed, setIsZoomed] = useState(false);
  const originX = useMotionValue(0.5);
  const originY = useMotionValue(0.5);
  const scale = useSpring(1, { stiffness: 300, damping: 30 });

  useEffect(() => {
    scale.set(isZoomed ? 2.5 : 1);
  }, [isZoomed, scale]);

  // rAF batching for pointer move -> origin updates
  const rafRef = useRef<number | null>(null);
  const pendingRef = useRef<{ x: number; y: number } | null>(null);

  const scheduleOriginUpdate = useCallback(
    (x: number, y: number) => {
      pendingRef.current = { x, y };
      if (rafRef.current == null) {
        rafRef.current = requestAnimationFrame(() => {
          const p = pendingRef.current;
          if (p) {
            originX.set(p.x);
            originY.set(p.y);
            pendingRef.current = null;
          }
          rafRef.current = null;
        });
      }
    },
    [originX, originY]
  );

  useEffect(() => {
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const openModal = useCallback(() => {
    setIsModalOpen(true);
    setIsZoomed(false);
    setIsModalImageLoading(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsZoomed(false);
    setIsModalOpen(false);
  }, []);

  // Accessibility: focus trap, restore focus, Escape close
  const modalRootRef = useRef<HTMLDivElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const lastActiveElRef = useRef<HTMLElement | null>(null);

  // Disable background scroll when modal open
  useEffect(() => {
    if (isModalOpen) {
      lastActiveElRef.current = document.activeElement as HTMLElement | null;
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalOpen]);

  // Move focus in, restore on close
  useEffect(() => {
    if (isModalOpen) {
      // Defer to next tick so elements exist
      const id = requestAnimationFrame(() => {
        closeBtnRef.current?.focus();
      });
      return () => cancelAnimationFrame(id);
    } else {
      // Restore focus to the last active element
      lastActiveElRef.current?.focus?.();
    }
  }, [isModalOpen]);

  const handleModalKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        closeModal();
        return;
      }

      if (e.key === "Tab") {
        const root = modalRootRef.current;
        if (!root) return;
        const focusables = root.querySelectorAll<HTMLElement>(
          [
            "a[href]",
            "button:not([disabled])",
            "textarea:not([disabled])",
            "input:not([disabled])",
            "select:not([disabled])",
            "[tabindex]:not([tabindex='-1'])",
          ].join(",")
        );
        if (!focusables.length) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const current = document.activeElement as HTMLElement | null;

        if (!e.shiftKey && current === last) {
          e.preventDefault();
          first.focus();
        } else if (e.shiftKey && current === first) {
          e.preventDefault();
          last.focus();
        }
      }
    },
    [closeModal]
  );

  const handleModalBackdropClick = useCallback(
    (e: MouseEvent) => {
      if (e.target === e.currentTarget) {
        closeModal();
      }
    },
    [closeModal]
  );

  const handleCardImageLoad = useCallback(() => {
    setIsCardImageLoading(false);
  }, []);

  const handleModalImageLoad = useCallback(() => {
    setIsModalImageLoading(false);
  }, []);

  const onModalPointerMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (!isZoomed) return;
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width; // 0..1
      const y = (e.clientY - rect.top) / rect.height; // 0..1
      scheduleOriginUpdate(
        Math.max(0, Math.min(1, x)),
        Math.max(0, Math.min(1, y))
      );
    },
    [isZoomed, scheduleOriginUpdate]
  );

  const onModalToggleZoom = useCallback(() => {
    setIsZoomed((z) => !z);
  }, []);

  const altText = useMemo(
    () => (prompt?.trim() ? prompt : "Generated image"),
    [prompt]
  );

  // Determine whether to enable blur placeholder
  const imagePlaceholderProps = useMemo(() => {
    if (blurDataURL) {
      return { placeholder: "blur" as const, blurDataURL };
    }
    return {};
  }, [blurDataURL]);

  const cardContainerId = `card-container-${encodeURIComponent(imageUrl)}`;
  const modalTitleId = `${cardContainerId}-title`;

  return (
    <>
      {/* Card */}
      <motion.div
        className="relative w-full rounded-3xl overflow-hidden cursor-pointer"
        whileHover={cardScaleWhileHover}
        transition={{ duration: 0.25 }}
        onClick={openModal}
        layoutId={cardContainerId}
        initial="rest"
        animate="rest"
      >
        <div
          className={`relative w-full ${
            isCardImageLoading ? "h-[300px]" : "h-auto"
          }`}
        >
          {/* Lightweight skeleton */}
          <AnimatePresence>
            {isCardImageLoading && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-md z-10 rounded-[24px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <motion.div
                  className="w-10 h-10 rounded-full border-4 border-white/20"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <Image
            src={imageUrl}
            alt={altText}
            width={width}
            height={height}
            sizes={sizes}
            className="w-full h-auto"
            onLoad={handleCardImageLoad}
            onError={() => setIsCardImageLoading(false)}
            {...imagePlaceholderProps}
          />

          <div className="absolute inset-0 rounded-3xl border-2 border-white/30 pointer-events-none z-10" />
        </div>

        {/* Hover overlay: always mounted, animated via variants */}
        <motion.div
          className="absolute bottom-0 left-0 w-full h-[80px] p-5 flex items-end bg-gradient-to-t from-black/75 to-transparent backdrop-blur-[2px]"
          variants={overlayVariants}
          initial="rest"
          whileHover="hover"
          animate="rest"
        >
          <div className="w-full flex justify-between items-center">
            <button
              type="button"
              className="flex items-center gap-2 py-2 px-4 bg-white/30 rounded-full text-white font-semibold text-base backdrop-blur-sm"
              onClick={(e) => e.stopPropagation()}
              aria-label="Edit image"
              title="Edit"
            >
              <IconWand />
              <span>Edit</span>
            </button>
            <div className="flex items-center gap-4 text-white/80 text-xl">
              <button
                type="button"
                aria-label="Download image"
                title="Download"
              >
                <IconDownload className="hover:text-white cursor-pointer transition-colors" />
              </button>
              <button type="button" aria-label="Like image" title="Like">
                <IconHeart className="hover:text-white cursor-pointer transition-colors" />
              </button>
              <button type="button" aria-label="Dislike image" title="Dislike">
                <IconThumbDown className="hover:text-white cursor-pointer transition-colors" />
              </button>
              <button type="button" aria-label="Delete image" title="Delete">
                <IconTrash className="hover:text-white cursor-pointer transition-colors" />
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed h-screen w-screen inset-0 z-50 flex flex-col p-4 md:p-8"
            style={{
              background: "rgba(9, 9, 9, 0.7)",
              backdropFilter: "blur(10px)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleModalBackdropClick}
            onKeyDown={handleModalKeyDown}
            role="dialog"
            aria-modal="true"
            aria-labelledby={modalTitleId}
            ref={modalRootRef}
          >
            <div
              className="relative w-full h-full flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top Bar */}
              <motion.header
                className="flex justify-between items-center text-white w-full"
                initial={{ y: -40, opacity: 0 }}
                animate={{ y: 0, opacity: 1, transition: { delay: 0.1 } }}
              >
                <button
                  ref={closeBtnRef}
                  type="button"
                  onClick={closeModal}
                  className="flex items-center gap-2 p-2 rounded-2xl hover:bg-white/10 transition-colors"
                  aria-label="Close"
                >
                  <IconArrowLeft size={25} className="custom-box" />
                  <span className="font-medium">Go Back</span>
                </button>
                <div className="flex items-center gap-6 md:gap-4 text-white/80">
                  <button type="button" aria-label="Download image">
                    <IconDownload
                      className="cursor-pointer hover:text-white transition-colors"
                      size={28}
                    />
                  </button>
                  <button type="button" aria-label="Dislike image">
                    <IconThumbDown
                      className="cursor-pointer hover:text-white transition-colors"
                      size={28}
                    />
                  </button>
                  <button type="button" aria-label="Like image">
                    <IconHeart
                      className="cursor-pointer hover:text-white transition-colors"
                      size={28}
                    />
                  </button>
                  <button type="button" aria-label="Delete image">
                    <IconTrash
                      className="cursor-pointer hover:text-red-400 transition-colors"
                      size={28}
                    />
                  </button>
                </div>
              </motion.header>

              {/* Hidden title for aria-labelledby */}
              <h2 id={modalTitleId} className="sr-only">
                Image preview
              </h2>

              {/* Image area */}
              <div
                className="flex-1 flex items-center justify-center my-4 min-h-0"
                onClick={handleModalBackdropClick}
              >
                <motion.div
                  className="relative max-w-[90vw] max-h-[80vh] w-auto h-auto"
                  layoutId={cardContainerId}
                  onClick={(e) => e.stopPropagation()}
                >
                  <AnimatePresence>
                    {isModalImageLoading && (
                      <motion.div
                        className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-md z-10 rounded-[24px]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <motion.div
                          className="w-10 h-10 rounded-full border-4 border-white/20"
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.5, 0.2, 0.5],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Zoom container: transform-based */}
                  <motion.figure
                    className="relative w-full h-full max-h-[80vh] overflow-hidden rounded-[24px] bg-black/30"
                    style={{ originX, originY, scale }}
                    onMouseMove={onModalPointerMove}
                    onClick={onModalToggleZoom}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onModalToggleZoom();
                      }
                    }}
                  >
                    <Image
                      src={imageUrl}
                      alt={altText}
                      width={width}
                      height={height}
                      sizes="(max-width: 1200px) 90vw, 70vw"
                      className="w-full h-full max-h-[80vh] object-contain select-none"
                      draggable={false}
                      onLoad={handleModalImageLoad}
                      onError={() => setIsModalImageLoading(false)}
                      {...imagePlaceholderProps}
                    />
                  </motion.figure>

                  <div className="absolute inset-0 rounded-[24px] border-2 border-white/30 pointer-events-none z-10" />
                </motion.div>
              </div>

              {/* Footer */}
              <motion.footer
                className="flex justify-between items-end text-white w-full"
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1, transition: { delay: 0.1 } }}
              >
                <div className="max-w-prose flex items-center gap-4">
                  <span className="flex gap-2 items-center font-semibold text-white/80 text-nowrap">
                    Generate
                    <ArrowRight className="custom-box" size={25} />
                  </span>
                  <HoverCard>
                    <HoverCardTrigger className="cursor-pointer text-sm text-nowrap">
                      {prompt.length > 80
                        ? `${prompt.slice(0, 80)}...`
                        : prompt}
                    </HoverCardTrigger>
                    <HoverCardContent>{prompt}</HoverCardContent>
                  </HoverCard>
                </div>
                <div className="flex items-center gap-3 text-lg font-semibold">
                  <button
                    type="button"
                    className="flex items-center gap-2 py-2 px-5 border-2 border-white/20 text-accent bg-[#1E1E1E]/50 rounded-2xl transition-colors backdrop-blur-sm hover:text-white/80"
                    aria-label="Edit image"
                  >
                    <IconWand size={25} />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    className="flex items-center gap-2 py-2 px-5 border-2 border-white/20 bg-[#1E1E1E]/50 rounded-2xl transition-colors backdrop-blur-sm hover:text-accent"
                    aria-label="Share image"
                  >
                    <IconShare size={25} />
                    <span>Share</span>
                  </button>
                </div>
              </motion.footer>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ImageCard;
