"use client";

import React, { useCallback, useEffect, useRef, useState, KeyboardEvent, MouseEvent } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useMotionValue, useSpring } from "motion/react";
import {
  IconArrowLeft,
  IconDownload,
  IconHeart,
  IconShare,
  IconThumbDown,
  IconTrash,
  IconWand,
} from "@tabler/icons-react";
import { ArrowRight } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "../hover-card";
import ModalPortal from "./ModalPortal";
import { ImagePlaceholder } from "./ImagePlaceholder";
import { VideoOptions } from "./ImageCard";

interface MediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  prompt: string;
  width: number;
  height: number;
  altText: string;
  cardContainerId: string;
  mediaUrl: string;
  isMediaVideo: boolean;
  videoOptions?: VideoOptions;
}

export const MediaModal = ({
  isOpen,
  onClose,
  prompt,
  width,
  height,
  altText,
  cardContainerId,
  mediaUrl,
  isMediaVideo,
  videoOptions = {},
}: MediaModalProps) => {
  const [isModalMediaLoading, setIsModalMediaLoading] = useState(true);
  const [isZoomed, setIsZoomed] = useState(false);
  const originX = useMotionValue(0.5);
  const originY = useMotionValue(0.5);
  const scale = useSpring(1, { stiffness: 300, damping: 30 });

  const modalVideoOptions = {
    autoPlay: true,
    muted: false,
    loop: false,
    controls: true,
    ...videoOptions,
  };

  useEffect(() => {
    scale.set(isZoomed ? 2.5 : 1);
  }, [isZoomed, scale]);

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
    [originX, originY],
  );

  useEffect(() => {
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const closeModal = useCallback(() => {
    setIsZoomed(false);
    onClose();
  }, [onClose]);

  const handleModalMediaLoad = useCallback(() => {
    setIsModalMediaLoading(false);
  }, []);

  // Accessibility refs
  const modalRootRef = useRef<HTMLDivElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const lastActiveElRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      lastActiveElRef.current = document.activeElement as HTMLElement | null;
      document.body.style.overflow = "hidden";
      setIsModalMediaLoading(true);
      setIsZoomed(false);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      const id = requestAnimationFrame(() => closeBtnRef.current?.focus());
      return () => cancelAnimationFrame(id);
    } else {
      lastActiveElRef.current?.focus?.();
    }
  }, [isOpen]);

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
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
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
    [closeModal],
  );

  const handleModalBackdropClick = useCallback(
    (e: MouseEvent) => {
      if (e.target === e.currentTarget) closeModal();
    },
    [closeModal],
  );

  const onModalPointerMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (!isZoomed) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
      scheduleOriginUpdate(x, y);
    },
    [isZoomed, scheduleOriginUpdate],
  );

  const onModalToggleZoom = useCallback(() => setIsZoomed((z) => !z), []);

  const modalTitleId = `${cardContainerId}-title`;

  return (
    <ModalPortal>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex h-screen w-screen flex-col p-4 md:p-8"
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
              className="relative flex h-full w-full flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <motion.header
                className="flex w-full items-center justify-between text-white"
                initial={{ y: -40, opacity: 0 }}
                animate={{ y: 0, opacity: 1, transition: { delay: 0.1 } }}
              >
                <button
                  ref={closeBtnRef}
                  type="button"
                  onClick={closeModal}
                  className="flex items-center gap-2 rounded-2xl p-2 transition-colors hover:bg-white/10"
                  aria-label="Close"
                >
                  <IconArrowLeft size={25} className="custom-box" />
                  <span className="font-medium">Go Back</span>
                </button>
                <div className="flex items-center gap-6 text-white/80 md:gap-4">
                  <button type="button" aria-label="Download image">
                    <IconDownload
                      className="cursor-pointer transition-colors hover:text-white"
                      size={28}
                    />
                  </button>
                  <button type="button" aria-label="Delete image">
                    <IconTrash
                      className="cursor-pointer transition-colors hover:text-red-400"
                      size={28}
                    />
                  </button>
                </div>
              </motion.header>

              <h2 id={modalTitleId} className="sr-only">
                Image preview
              </h2>

              {/* Image Viewer */}
              <div
                className="my-4 flex min-h-0 flex-1 items-center justify-center"
                onClick={handleModalBackdropClick}
              >
                <motion.div
                  className="relative h-full max-h-[80vh] w-auto max-w-[90vw]"
                  layoutId={cardContainerId}
                  onClick={(e) => e.stopPropagation()}
                >
                  <AnimatePresence>
                    {isModalMediaLoading && (
                      <div className="absolute inset-0 z-10 overflow-hidden rounded-[24px]">
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-lg">
                          <motion.div
                            className="h-16 w-16 rounded-full border-4 border-white/20"
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
                        </div>
                      </div>
                    )}
                  </AnimatePresence>

                  <motion.figure
                    className="relative h-full max-h-[80vh] w-full overflow-hidden rounded-[24px] bg-black/30"
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
                    {isMediaVideo ? (
                      <video
                        src={mediaUrl}
                        className="h-full max-h-[80vh] w-full select-none object-contain transition-opacity duration-300"
                        style={{ opacity: isModalMediaLoading ? 0 : 1 }}
                        onLoadedData={handleModalMediaLoad}
                        onError={handleModalMediaLoad}
                        {...modalVideoOptions}
                      />
                    ) : (
                      <Image
                        src={mediaUrl}
                        alt={altText}
                        width={width}
                        height={height}
                        sizes="(max-width: 1200px) 90vw, 70vw"
                        className="h-full max-h-[80vh] w-full select-none object-contain transition-opacity duration-300"
                        style={{ opacity: isModalMediaLoading ? 0 : 1 }}
                        draggable={false}
                        onLoad={handleModalMediaLoad}
                        onError={handleModalMediaLoad}
                      />
                    )}
                  </motion.figure>

                  <div className="pointer-events-none absolute inset-0 z-10 rounded-[24px] border-2 border-white/30" />
                </motion.div>
              </div>

              {/* Footer */}
              <motion.footer
                className="flex w-full items-end justify-between text-white"
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1, transition: { delay: 0.1 } }}
              >
                <div className="flex max-w-prose items-center gap-4">
                  <span className="flex items-center gap-2 text-nowrap font-semibold text-white/80">
                    Generate
                    <ArrowRight className="custom-box" size={25} />
                  </span>
                  <HoverCard>
                    <HoverCardTrigger className="cursor-pointer text-nowrap text-sm">
                      {prompt.length > 80 ? `${prompt.slice(0, 80)}...` : prompt}
                    </HoverCardTrigger>
                    <HoverCardContent>{prompt}</HoverCardContent>
                  </HoverCard>
                </div>
                <div className="flex items-center gap-3 text-lg font-semibold">
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-2xl border-2 border-white/20 bg-[#1E1E1E]/50 px-5 py-2 text-accent backdrop-blur-sm transition-colors hover:text-white/80"
                    aria-label="Edit image"
                  >
                    <IconWand size={25} />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-2xl border-2 border-white/20 bg-[#1E1E1E]/50 px-5 py-2 backdrop-blur-sm transition-colors hover:text-accent"
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
    </ModalPortal>
  );
};
