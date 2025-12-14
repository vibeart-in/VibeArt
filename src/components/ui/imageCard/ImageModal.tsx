"use client";

import {
  IconArrowLeft,
  IconCheck,
  IconCopy,
  IconDownload,
  IconEdit,
  IconShare,
  IconTrash,
  IconVideo,
  IconWand,
  IconWindowMaximize,
} from "@tabler/icons-react";
import { ArrowRight } from "lucide-react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "motion/react";
import { deleteImage } from "@/src/actions/deleteImage";
import { useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState, KeyboardEvent, MouseEvent } from "react";
import { toast } from "sonner";

import { VideoOptions } from "./ImageCard";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "../hover-card";
import ModalPortal from "./ModalPortal";

// Export a helper that parent can call to prefetch this module's chunk (useful when using dynamic import)
export const prefetchImageModal = () => import("./ImageModal");

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
  imageId?: string;
  conversationId?: string;
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
  imageId,
  conversationId,
}: MediaModalProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  // --- Render gating: prevents building the heavy DOM when modal is closed.
  // shouldRender is true once the modal should exist in the DOM (either open now,
  // or briefly during exit animation). We set a small delay on close to allow exit animation.
  const [shouldRender, setShouldRender] = useState<boolean>(isOpen);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
    } else {
      // small delay to allow AnimatePresence exit animation; adjust if you change exit timings
      const t = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // --- Only actually mount the media (video/img) when we want to allocate resources.
  // allowMediaRender will become true when modal opens, or if user triggers a hover prefetch.
  const [allowMediaRender, setAllowMediaRender] = useState<boolean>(isOpen);

  useEffect(() => {
    if (isOpen) setAllowMediaRender(true);
  }, [isOpen]);

  // Optional: parent can call prefetchImageModal() or the card can call import("./ImageModal") on hover.
  // We also allow pointer enter on the modal root to trigger media rendering (useful if you keep modal mounted).
  const handlePrefetchTrigger = useCallback(() => {
    setAllowMediaRender(true);
  }, []);

  // --- Loading / zoom / copied state
  const [isModalMediaLoading, setIsModalMediaLoading] = useState(true);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Motion values
  const originX = useMotionValue(0.5);
  const originY = useMotionValue(0.5);
  const scale = useSpring(1, { stiffness: 300, damping: 30 });

  useEffect(() => {
    scale.set(isZoomed ? 2.5 : 1);
  }, [isZoomed, scale]);

  // Animation frame batching for pointer moves
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

  const handleDelete = useCallback(async () => {
    if (!imageId) return;
    
    const loadingToast = toast.loading("Deleting image...");
    
    try {
      const result = await deleteImage(imageId);
      
      if (!result.success) {
        throw new Error(result.error || "Failed to delete");
      }

      toast.success("Image deleted successfully", { id: loadingToast });
      closeModal();
      
      if (conversationId) {
        await queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
      } else {
        router.refresh();
      }
    } catch (error: any) {
      console.error("Failed to delete:", error);
      toast.error(error.message || "Failed to delete", { id: loadingToast });
    }
  }, [imageId, conversationId, router, closeModal, queryClient]);

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

  // Fix: name clash in above de-structured code right now scheduleOriginUpdate exists.
  // (No change needed - keeping code consistent.)

  const onModalToggleZoom = useCallback(() => setIsZoomed((z) => !z), []);

  const handleCopyPrompt = useCallback(() => {
    toast.success("Prompt copied", {
      description: "Use it wisely!",
    });
    navigator.clipboard.writeText(prompt);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  }, [prompt]);

  const modalTitleId = `${cardContainerId}-title`;

  // --- Video/Image refs & cleanup
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const blobUrlRef = useRef<string | null>(null);

  // On close, release video/image resources
  useEffect(() => {
    if (!isOpen) {
      // cleanup video element if present
      const v = videoRef.current;
      if (v) {
        try {
          v.pause();
          // remove src to release memory
          v.removeAttribute("src");
          // call load to reset the playback
          v.load();
        } catch (err) {
          // ignore
        }
      }
      if (blobUrlRef.current) {
        try {
          URL.revokeObjectURL(blobUrlRef.current);
        } catch (err) {
          // ignore
        }
        blobUrlRef.current = null;
      }
    }
  }, [isOpen]);

  const handleDownload = useCallback(async () => {
    try {
      const response = await fetch(mediaUrl);
      if (!response.ok) throw new Error("Network response was not ok.");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      blobUrlRef.current = url;

      // --- Derive file name from prompt ---
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
        if (blobUrlRef.current === url) blobUrlRef.current = null;
      }, 1500);
    } catch (error) {
      console.error("Failed to download media:", error);
    }
  }, [mediaUrl, prompt]);

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Image Generated with VibeArt",
          text: prompt,
          url: window.location.href,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      navigator.clipboard.writeText(mediaUrl);
      alert("Link copied to clipboard!");
    }
  }, [prompt, mediaUrl]);

  const handleEdit = useCallback(() => {
    router.push(`/edit?imageUrl=${encodeURIComponent(mediaUrl)}`);
  }, [router, mediaUrl]);

  // If we shouldn't render the DOM (fast-return) do it now, avoiding all heavy JSX.
  if (!shouldRender) return null;

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
            onMouseEnter={handlePrefetchTrigger} // if user hovers the modal container, ensure media will render
          >
            <div className="relative flex size-full flex-col" onClick={(e) => e.stopPropagation()}>
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
                  <IconArrowLeft size={35} className="custom-box" />
                  <span className="font-medium">Go Back</span>
                </button>
                <div className="gap- flex items-center text-white/80 md:gap-4">
                  <button type="button" aria-label="Download image" onClick={handleDownload}>
                    <IconDownload
                      className="cursor-pointer transition-colors hover:text-accent"
                      size={28}
                    />
                  </button>
                  <button type="button" aria-label="Delete image" onClick={handleDelete}>
                    <IconTrash
                      className="cursor-pointer transition-colors hover:text-red-400"
                      size={28}
                    />
                  </button>
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-[20px] border bg-background px-5 py-2 transition-colors hover:text-accent"
                    aria-label="Share image"
                    onClick={handleShare}
                  >
                    <IconShare size={25} />
                    <span>Share</span>
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
                            className="size-16 rounded-full border-4 border-white/20"
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
                    className="relative size-full max-h-[80vh] cursor-zoom-in overflow-hidden rounded-[24px] bg-black/30"
                    style={{ originX, originY, scale }}
                    onMouseMove={onModalPointerMove}
                    onClick={() => {
                      // toggle zoom only when media is present
                      if (allowMediaRender) onModalToggleZoom();
                    }}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        if (allowMediaRender) onModalToggleZoom();
                      }
                    }}
                  >
                    {/** Only create the actual media element when allowed.
                     *  This prevents browsers from creating video/image decoders & memory
                     *  when the modal is not open or the user hasn't triggered media rendering.
                     */}
                    {allowMediaRender ? (
                      isMediaVideo ? (
                        <video
                          ref={videoRef}
                          src={mediaUrl}
                          className="size-full max-h-[80vh] select-none object-contain transition-opacity duration-300"
                          style={{ opacity: isModalMediaLoading ? 0 : 1 }}
                          onLoadedData={handleModalMediaLoad}
                          onError={handleModalMediaLoad}
                          // apply modal options
                          autoPlay={videoOptions?.autoPlay ?? true}
                          muted={videoOptions?.muted ?? false}
                          loop={videoOptions?.loop ?? false}
                          controls={videoOptions?.controls ?? true}
                          playsInline={videoOptions?.playsInline ?? true}
                        />
                      ) : (
                        <Image
                          src={mediaUrl}
                          alt={altText}
                          width={width}
                          height={height}
                          sizes="(max-width: 1200px) 90vw, 70vw"
                          className="size-full max-h-[80vh] select-none object-contain transition-opacity duration-300"
                          style={{ opacity: isModalMediaLoading ? 0 : 1 }}
                          draggable={false}
                          onLoad={handleModalMediaLoad}
                          onError={handleModalMediaLoad}
                          unoptimized
                        />
                      )
                    ) : (
                      // Simple lightweight preview (thumbnail) while not rendering heavy media.
                      // If you have a dedicated thumbnail url, use it here instead.
                      <div
                        className="flex h-full items-center justify-center"
                        style={{ minWidth: 200, minHeight: 200 }}
                      >
                        <div className="text-white/60">Preview unavailable — click to load</div>
                      </div>
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
                    Prompt
                    <ArrowRight className="custom-box" size={35} />
                  </span>
                  <HoverCard>
                    <HoverCardTrigger
                      asChild
                      onClick={handleCopyPrompt}
                      className="cursor-pointer text-nowrap text-base"
                    >
                      <span>{prompt.length > 80 ? `${prompt.slice(0, 80)}...` : prompt}</span>
                    </HoverCardTrigger>
                    <HoverCardContent onClick={handleCopyPrompt} className="cursor-pointer">
                      <div className="flex flex-col gap-2">
                        <p className="text-xs text-white/60">
                          {isCopied ? (
                            <span className="flex items-center gap-2">
                              <IconCheck className="text-green-600" size={20} /> Copied to
                              clipboard!
                            </span>
                          ) : (
                            <span className="flex items-center gap-2">
                              <IconCopy size={20} /> Click to copy
                            </span>
                          )}
                        </p>
                        <p>{prompt}</p>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                </div>
                <div className="flex items-center gap-2">
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
                          window.dispatchEvent(
                            new CustomEvent("app:image-edit", { detail: mediaData }),
                          );
                        } else {
                          // Otherwise navigate and include the image URL in the query
                          const encoded = encodeURIComponent(mediaUrl);
                          // Use router.push if you have next/router or next/navigation; fallback to location.href
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
                      className="flex items-center gap-1.5 rounded-2xl bg-[#111111] px-6 py-1.5 text-lg text-white transition hover:bg-accent/40 hover:text-accent"
                    >
                      <Icon className="size-5" aria-hidden="true" />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </motion.footer>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </ModalPortal>
  );
};

export default React.memo(MediaModal);
