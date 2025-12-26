"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Node, NodeProps, Position, useReactFlow } from "@xyflow/react";
import { Crop, RotateCcw, ChevronDown, Loader2 } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

import NodeLayout from "../NodeLayout";
import { useUpstreamData } from "@/src/utils/xyflow";
import { uploadCanvasToSupabase } from "@/src/utils/canvasUpload";
import { useCanvas } from "../../providers/CanvasProvider";

// --- Types ---
export type CropNodeData = {
  imageUrl?: string;
  croppedImageUrl?: string;
  crop?: { x: number; y: number; width: number; height: number };
  aspectRatio?: AspectRatio;
};

export type CropNodeType = Node<CropNodeData, "crop">;
type AspectRatio = "Free" | "1:1" | "4:3" | "16:9" | "9:16" | "3:4";

const BASE_WIDTH = 400;
const MIN_CROP_SIZE = 40;

// Helper to safely parse aspect ratio strings without using eval
const parseAspectRatio = (ratioStr?: string): number | null => {
  if (!ratioStr || ratioStr === "Free") return null;
  const [w, h] = ratioStr.split(":").map(Number);
  if (!w || !h || isNaN(w) || isNaN(h)) return null;
  return w / h;
};

const CropNode = ({ id, data, selected }: NodeProps<CropNodeType>) => {
  const { updateNodeData, updateNode } = useReactFlow();
  const { images } = useUpstreamData("target");
  const upstreamImage = images[0];
  const { project } = useCanvas();

  // --- State ---
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);
  const [localCrop, setLocalCrop] = useState(data.crop || { x: 0, y: 0, width: 100, height: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragType, setDragType] = useState<{
    type: string;
    startX: number;
    startY: number;
    startCrop: typeof localCrop;
  } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [containerWidth, setContainerWidth] = useState(BASE_WIDTH - 32);

  const containerRef = useRef<HTMLDivElement>(null);

  // --- Scaling Logic ---
  // How many image pixels per 1 CSS pixel
  const scale = imageSize && containerWidth ? containerWidth / imageSize.width : 1;

  // Sync upstream image changes
  useEffect(() => {
    // Only update if actually different to avoid loops
    if (upstreamImage && upstreamImage !== data.imageUrl) {
      updateNodeData(id, {
        imageUrl: upstreamImage,
        croppedImageUrl: undefined,
        crop: undefined,
      });
      setImageSize(null);
    }
  }, [upstreamImage, data.imageUrl, id, updateNodeData]);

  // Update container width for scaling calculations
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        setContainerWidth(entries[0].contentRect.width);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const { naturalWidth, naturalHeight } = e.currentTarget;
      setImageSize({ width: naturalWidth, height: naturalHeight });

      // Initialize crop if not present or just size update
      if (!data.crop) {
        const initialCrop = { x: 0, y: 0, width: naturalWidth, height: naturalHeight };
        setLocalCrop(initialCrop);
        updateNodeData(id, { crop: initialCrop });
      } else {
        setLocalCrop(data.crop);
      }
    },
    [data.crop, id, updateNodeData],
  );

  // --- Drag & Resize Logic ---
  const handlePointerDown = (e: React.PointerEvent, type: string = "move") => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setDragType({
      type,
      startX: e.clientX,
      startY: e.clientY,
      startCrop: { ...localCrop }, // Snapshot state at start
    });
  };

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!isDragging || !dragType || !imageSize) return;

      const deltaX = (e.clientX - dragType.startX) / scale;
      const deltaY = (e.clientY - dragType.startY) / scale;

      setLocalCrop((prev) => {
        // Calculate based on start state to avoid drift
        let n = { ...dragType.startCrop };
        const ratio = parseAspectRatio(data.aspectRatio);

        if (dragType.type === "move") {
          n.x = Math.max(0, Math.min(n.x + deltaX, imageSize.width - n.width));
          n.y = Math.max(0, Math.min(n.y + deltaY, imageSize.height - n.height));
        } else {
          // Resizing Logic
          if (dragType.type.includes("e")) n.width = Math.max(MIN_CROP_SIZE, n.width + deltaX);
          if (dragType.type.includes("s")) n.height = Math.max(MIN_CROP_SIZE, n.height + deltaY);

          if (dragType.type.includes("w")) {
            const wChange = Math.min(n.width - MIN_CROP_SIZE, deltaX);
            n.x += wChange;
            n.width -= wChange;
          }
          if (dragType.type.includes("n")) {
            const hChange = Math.min(n.height - MIN_CROP_SIZE, deltaY);
            n.y += hChange;
            n.height -= hChange;
          }

          // Apply Aspect Ratio Constraints
          if (ratio) {
            // Determine if we are primarily adjusting width or height based on handle
            // If dragging E/W, width is primary. If S/N, height is primary.
            // Diagonal (SE, NE, etc) -> usually width driven or check which delta is larger?
            // Standard behavior: width drives height usually unless strictly resizing height.
            const isWidthDriver = dragType.type.includes("e") || dragType.type.includes("w");

            if (isWidthDriver) {
              n.height = n.width / ratio;
            } else {
              n.width = n.height * ratio;
            }
          }

          // Global Bounds Clamping
          if (n.x < 0) n.x = 0;
          if (n.y < 0) n.y = 0;

          if (n.x + n.width > imageSize.width) n.width = imageSize.width - n.x;
          if (n.y + n.height > imageSize.height) n.height = imageSize.height - n.y;

          // Re-verify ratio after clamping
          if (ratio) {
            const currentR = n.width / n.height;
            if (Math.abs(currentR - ratio) > 0.01) {
              // Clamp caused ratio drift, force fit inside bounds
              if (n.width / ratio <= n.height) {
                n.height = n.width / ratio; // adjust height to match width
              } else {
                n.width = n.height * ratio; // adjust width to match height
              }
            }
          }
        }
        return n;
      });
    },
    [isDragging, dragType, imageSize, scale, data.aspectRatio],
  );

  const handlePointerUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      setDragType(null);
      // Sync final state to flow
      updateNodeData(id, { crop: localCrop });
    }
  }, [id, localCrop, updateNodeData, isDragging]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);
    }
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [isDragging, handlePointerMove, handlePointerUp]);

  // --- Actions ---
  const handleCrop = async () => {
    if (!imageSize || !data.imageUrl) return;
    setIsUploading(true);

    try {
      const CropCanvas = document.createElement("canvas");
      CropCanvas.width = localCrop.width;
      CropCanvas.height = localCrop.height;
      const ctx = CropCanvas.getContext("2d");
      if (!ctx) throw new Error("Context failed");

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = data.imageUrl;

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      ctx.drawImage(
        img,
        localCrop.x,
        localCrop.y,
        localCrop.width,
        localCrop.height,
        0,
        0,
        localCrop.width,
        localCrop.height,
      );

      // Unique filename to prevent caching issues on repeat crops
      const filename = `crop_${id}`;
      const publicUrl = await uploadCanvasToSupabase(CropCanvas, project?.id || "", filename);
      updateNodeData(id, { croppedImageUrl: `${publicUrl}?t=${Date.now()}` });
    } catch (err) {
      console.error(err);
      // alert("Upload failed"); // Better to use a toast or status indicator
    } finally {
      setIsUploading(false);
    }
  };

  const setPresetRatio = (ratio: AspectRatio) => {
    updateNodeData(id, { aspectRatio: ratio });
    const targetR = parseAspectRatio(ratio);

    if (!targetR || !imageSize) return;

    setLocalCrop((prev) => {
      let nw = prev.width;
      let nh = nw / targetR;

      if (nh > imageSize.height) {
        nh = imageSize.height;
        nw = nh * targetR;
      }
      return { ...prev, width: nw, height: nh };
    });
  };

  // --- Dynamic Node Height ---
  const nodeHeight = useMemo(() => {
    const HEADER_FOOTER = 170; // Fixed offset for header/footer
    const contentWidth = BASE_WIDTH - 32;

    // Use cropped result aspect if available
    if (data.croppedImageUrl && data.crop && data.crop.width > 0) {
      const ratio = data.crop.height / data.crop.width;
      return contentWidth * ratio + HEADER_FOOTER;
    }

    // Use original image aspect
    if (imageSize && imageSize.width > 0) {
      return contentWidth * (imageSize.height / imageSize.width) + HEADER_FOOTER;
    }

    return 400; // Default
  }, [imageSize, data.croppedImageUrl, data.crop]);

  // Update React Flow node dimensions when height changes
  useEffect(() => {
    updateNode(id, {
      width: BASE_WIDTH,
      height: nodeHeight,
    });
  }, [nodeHeight, id, updateNode]);

  return (
    <NodeLayout
      selected={selected}
      title="Image Crop"
      id={id}
      className="flex h-full w-full cursor-default flex-col rounded-3xl bg-[#1D1D1D]"
      handles={[
        { type: "target", position: Position.Left, id: "target" },
        { type: "source", position: Position.Right, id: "source" },
      ]}
      style={{ width: BASE_WIDTH }}
      toolbarHidden={true}
      resizeHidden={true}
    >
      <div className="flex h-full w-full flex-col overflow-hidden rounded-3xl bg-[#0d0d0d]">
        {/* Workspace */}
        <div className="relative flex-1 bg-black/20 p-4" ref={containerRef}>
          {data.imageUrl ? (
            <div className="relative h-full w-full">
              {!data.croppedImageUrl ? (
                <>
                  {/* Reference Image (Reference/Bg) - blurred */}
                  <img
                    src={data.imageUrl}
                    onLoad={onImageLoad}
                    draggable={false}
                    className="pointer-events-none w-full select-none opacity-50 blur-[2px] grayscale"
                    alt="bg"
                  />
                  {/* Crop Window / Handles */}
                  <div
                    className="absolute border-2 border-[#D9E92B]"
                    style={{
                      left: localCrop.x * scale,
                      top: localCrop.y * scale,
                      width: localCrop.width * scale,
                      height: localCrop.height * scale,
                      cursor: isDragging ? "grabbing" : "grab",
                    }}
                    onPointerDown={(e) => handlePointerDown(e)}
                  >
                    {/* Sharp Preview inside crop area */}
                    <div className="absolute inset-0 overflow-hidden">
                      <img
                        src={data.imageUrl}
                        draggable={false}
                        className="absolute max-w-none select-none"
                        style={{
                          width: containerWidth,
                          left: -localCrop.x * scale,
                          top: -localCrop.y * scale,
                        }}
                        alt="sharp"
                      />
                    </div>

                    {/* Corner Handles */}
                    {["nw", "ne", "sw", "se"].map((handle) => (
                      <div
                        key={handle}
                        className={`absolute z-10 h-4 w-4 rounded-md border border-black bg-white ${
                          handle === "nw"
                            ? "-left-2 -top-2 cursor-nw-resize"
                            : handle === "ne"
                              ? "-right-2 -top-2 cursor-ne-resize"
                              : handle === "sw"
                                ? "-bottom-2 -left-2 cursor-sw-resize"
                                : "-bottom-2 -right-2 cursor-se-resize"
                        }`}
                        onPointerDown={(e) => handlePointerDown(e, handle)}
                      />
                    ))}
                  </div>
                </>
              ) : (
                /* Final Cropped Preview */
                <div className="relative h-full w-full overflow-hidden rounded-lg">
                  <img
                    src={data.croppedImageUrl}
                    className="h-full w-full object-cover"
                    alt="result"
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-neutral-500">
              <Crop size={32} className="mb-2 opacity-20" />
              <p className="text-xs">Waiting for image...</p>
            </div>
          )}
        </div>

        {/* Footer Controls */}
        <div className="flex flex-col gap-4 bg-[#0d0d0d] p-4">
          {/* First Row: Aspect Ratio & Reset */}
          <div className="flex items-center justify-between">
            <DropdownMenu.Root>
              <DropdownMenu.Trigger className="flex items-center gap-2 rounded-xl bg-[#141414] px-4 py-2 text-sm text-white transition-colors hover:bg-white/5">
                Aspect ratio <ChevronDown size={18} className="text-neutral-400" />
              </DropdownMenu.Trigger>
              <DropdownMenu.Content className="z-50 min-w-[120px] rounded-xl border border-white/10 bg-[#1D1D1D] p-1 text-white shadow-xl">
                {["Free", "1:1", "4:3", "16:9", "9:16", "3:4"].map((r) => (
                  <DropdownMenu.Item
                    key={r}
                    onClick={() => setPresetRatio(r as AspectRatio)}
                    className="cursor-pointer rounded-lg px-3 py-2 text-sm outline-none hover:bg-white/10"
                  >
                    {r}
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.Content>
            </DropdownMenu.Root>

            <button
              onClick={() => {
                updateNodeData(id, {
                  croppedImageUrl: undefined,
                  aspectRatio: "Free",
                });
                if (imageSize) {
                  setLocalCrop({ x: 0, y: 0, width: imageSize.width, height: imageSize.height });
                }
              }}
              className="flex items-center gap-2 text-sm text-white transition-opacity hover:opacity-80"
            >
              <RotateCcw size={16} /> Reset
            </button>
          </div>

          {/* Second Row: Dimensions & Apply Button */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {/* Width Label */}
              <div className="flex items-center gap-3 rounded-xl bg-[#141414] px-3 py-2 text-sm">
                <span className="font-bold text-white">W</span>
                <span className="text-neutral-400">{Math.round(localCrop.width)}</span>
              </div>
              {/* Height Label */}
              <div className="flex items-center gap-3 rounded-xl bg-[#141414] px-3 py-2 text-sm">
                <span className="font-bold text-white">H</span>
                <span className="text-neutral-400">{Math.round(localCrop.height)}</span>
              </div>
            </div>

            <button
              onClick={handleCrop}
              disabled={!data.imageUrl || isUploading}
              className="rounded-2xl bg-accent px-8 py-2 text-sm font-bold text-black transition-all hover:brightness-110 active:scale-95 disabled:opacity-30"
            >
              {isUploading ? <Loader2 size={18} className="animate-spin" /> : "Crop"}
            </button>
          </div>
        </div>
      </div>
    </NodeLayout>
  );
};

export default React.memo(CropNode);
