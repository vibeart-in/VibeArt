"use client";

import { Node, NodeProps, Position, useReactFlow } from "@xyflow/react";
import NodeLayout from "../NodeLayout";
import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useUpstreamData } from "@/src/utils/xyflow";
import {
  Crop,
  RotateCcw,
  Check,
  ChevronDown,
  Scaling,
  Scan,
  MoreHorizontal,
} from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

export type CropNodeData = {
  imageUrl?: string;
  croppedImageUrl?: string;
  width?: number;
  height?: number;
  crop?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  [key: string]: unknown;
};

export type CropNodeType = Node<CropNodeData, "crop">;

const BASE_WIDTH = 400;
const MIN_CROP_SIZE = 50;

type AspectRatio = "Free" | "1:1" | "4:3" | "16:9" | "9:16" | "3:4";

export default function CropNode({
  id,
  data,
  selected,
}: NodeProps<CropNodeType>) {
  const { updateNodeData, updateNode } = useReactFlow();
  const { images } = useUpstreamData("target");
  const upstreamImage = images[0];

  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("Free");
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  
  // Local state for crop to ensure smooth dragging 
  // (updating node data on every mouse move might be too slow/jittery)
  const [localCrop, setLocalCrop] = useState(data.crop || { x: 0, y: 0, width: 100, height: 100 });

  // Sync upstream image
  useEffect(() => {
    if (upstreamImage && upstreamImage !== data.imageUrl) {
      updateNodeData(id, { 
        imageUrl: upstreamImage, 
        croppedImageUrl: undefined,
        crop: undefined 
      });
      // Reset crop when image changes
      setLocalCrop({ x: 0, y: 0, width: 100, height: 100 });
      setImageSize(null);
    }
  }, [upstreamImage, data.imageUrl, id, updateNodeData]);

  // Handle Image Load to set initial crop
  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    setImageSize({ width: naturalWidth, height: naturalHeight });
    
    // Initialize crop to full image if data.crop doesn't exist
    if (!data.crop) {
      const initialCrop = {
          x: 0,
          y: 0,
          width: naturalWidth,
          height: naturalHeight
      };
      setLocalCrop(initialCrop);
      updateNodeData(id, { crop: initialCrop });
    }
  };

  // Node Dimensions
  const nodeHeight = useMemo(() => {
      if (data.croppedImageUrl && data.crop) {
          // Use cropped aspect ratio
          const ratio = data.crop.height / data.crop.width;
          return BASE_WIDTH * ratio + 180;
      }
      if (imageSize) {
          const displayWidth = BASE_WIDTH;
          const ratio = imageSize.height / imageSize.width;
          return displayWidth * ratio + 180; // + Control footer height
      }
      return 400;
  }, [imageSize, data.croppedImageUrl, data.crop]);

  useEffect(() => {
    updateNode(id, { width: BASE_WIDTH, height: nodeHeight });
  }, [nodeHeight, id, updateNode]);


  // Helper to force a save by triggering a negligible dimension change
  const triggerSave = useCallback(() => {
      // Toggle a tiny amount to width to trigger onNodesChange -> save()
      updateNode(id, { width: BASE_WIDTH + Math.random() * 0.01 });
  }, [id, updateNode]);

  // --- Cropping Logic ---

  const getScale = () => {
      if (!imageSize || !containerRef.current) return 1;
      return containerRef.current.clientWidth / imageSize.width;
  };

  const handlePointerDown = (e: React.PointerEvent, handle?: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setResizeHandle(handle || null);
  };

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!isDragging || !dragStart || !imageSize) return;

    const scale = getScale();
    const deltaX = (e.clientX - dragStart.x) / scale;
    const deltaY = (e.clientY - dragStart.y) / scale;

    setLocalCrop((prev) => {
      let newCrop = { ...prev };

      if (resizeHandle) {
        // PRE-CALCULATE NEW DIMENSIONS based on handle direction
        // This is "Free" resizing logic first
        if (resizeHandle.includes("e")) newCrop.width = Math.max(MIN_CROP_SIZE, prev.width + deltaX);
        if (resizeHandle.includes("s")) newCrop.height = Math.max(MIN_CROP_SIZE, prev.height + deltaY);
        
        if (resizeHandle.includes("w")) {
            const newWidth = Math.max(MIN_CROP_SIZE, prev.width - deltaX);
            newCrop.x += prev.width - newWidth;
            newCrop.width = newWidth;
        }
        if (resizeHandle.includes("n")) {
            const newHeight = Math.max(MIN_CROP_SIZE, prev.height - deltaY);
            newCrop.y += prev.height - newHeight;
            newCrop.height = newHeight;
        }

        // CORRECT FOR ASPECT RATIO
        if (aspectRatio !== "Free") {
            const [w, h] = aspectRatio.split(":").map(Number);
            const targetRatio = w / h;

            if (resizeHandle === 'e' || resizeHandle === 'w') {
                 // Width Changed -> Adjust Height
                 newCrop.height = newCrop.width / targetRatio;
            } 
            else if (resizeHandle === 'n' || resizeHandle === 's') {
                 // Height Changed -> Adjust Width
                 newCrop.width = newCrop.height * targetRatio;
            } 
            else {
                 // Corner Resizing
                 if (resizeHandle === 'se') {
                     newCrop.height = newCrop.width / targetRatio;
                 }
                 else if (resizeHandle === 'sw') {
                     newCrop.height = newCrop.width / targetRatio;
                 }
                 else if (resizeHandle === 'ne') {
                     const bottom = prev.y + prev.height;
                     const newHeight = newCrop.width / targetRatio;
                     newCrop.y = bottom - newHeight;
                     newCrop.height = newHeight;
                 }
                 else if (resizeHandle === 'nw') {
                      const bottom = prev.y + prev.height;
                      const newHeight = newCrop.width / targetRatio;
                      newCrop.y = bottom - newHeight;
                      newCrop.height = newHeight;
                 }
            }
        }

      } else {
        // MOVING
        newCrop.x += deltaX;
        newCrop.y += deltaY;
      }

      // Constrain to image bounds
      if (aspectRatio !== "Free" && resizeHandle) {
         const [w, h] = aspectRatio.split(":").map(Number);
         const targetRatio = w / h;
         
         // Helper to recalc Height/Y from Width
         const recalcFromWidth = () => {
             newCrop.height = newCrop.width / targetRatio;
             // Adjust Y if anchoring tells us we are growing/shrinking from top 
             // (i.e. bottom is fixed)
             if (resizeHandle.includes('n') || resizeHandle === 'ne' || resizeHandle === 'nw') {
                  // Bottom Anchor: y = bottom - newHeight
                  const bottom = prev.y + prev.height;
                  newCrop.y = bottom - newCrop.height;
             }
         };

         // Helper to recalc Width/X from Height
         const recalcFromHeight = () => {
             newCrop.width = newCrop.height * targetRatio;
             // Adjust X if anchoring tells us we are growing/shrinking from left
             // (i.e. right is fixed)
             if (resizeHandle.includes('w') || resizeHandle === 'nw' || resizeHandle === 'sw') {
                  // Right Anchor: x = right - newWidth
                  const right = prev.x + prev.width;
                  newCrop.x = right - newCrop.width;
             }
         };

         // 1. Check Width/X Bounds
         let initialWidthCheck = false;
         if (newCrop.x < 0) {
             newCrop.width += newCrop.x;
             newCrop.x = 0;
             initialWidthCheck = true;
         }
         if (newCrop.x + newCrop.width > imageSize.width) {
             newCrop.width = imageSize.width - newCrop.x;
             initialWidthCheck = true;
         }
         
         if (initialWidthCheck) recalcFromWidth();

         // 2. Check Height/Y Bounds
         let initialHeightCheck = false;
         if (newCrop.y < 0) {
             newCrop.height += newCrop.y;
             newCrop.y = 0;
             initialHeightCheck = true;
         }
         if (newCrop.y + newCrop.height > imageSize.height) {
             newCrop.height = imageSize.height - newCrop.y;
             initialHeightCheck = true;
         }

         if (initialHeightCheck) recalcFromHeight();
         
      } else {
          // Free Resizing / Moving
          newCrop.x = Math.max(0, Math.min(newCrop.x, imageSize.width - newCrop.width));
          newCrop.y = Math.max(0, Math.min(newCrop.y, imageSize.height - newCrop.height));
    
          // Re-verify size after position clamp
          if (newCrop.x + newCrop.width > imageSize.width) newCrop.width = imageSize.width - newCrop.x;
          if (newCrop.y + newCrop.height > imageSize.height) newCrop.height = imageSize.height - newCrop.y;
      }
      
      return newCrop;
    });

    setDragStart({ x: e.clientX, y: e.clientY });
  }, [isDragging, dragStart, imageSize, resizeHandle, aspectRatio]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
    setDragStart(null);
    setResizeHandle(null);
    // Sync to node data on release
    updateNodeData(id, { crop: localCrop });
    triggerSave();
  }, [id, localCrop, updateNodeData, triggerSave]);

  useEffect(() => {
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [handlePointerMove, handlePointerUp]);


  // --- Actions ---

  const handleCrop = async () => {
    if (!imageSize || !data.imageUrl) return;

    // Create canvas to crop
    const canvas = document.createElement("canvas");
    canvas.width = localCrop.width;
    canvas.height = localCrop.height;
    const ctx = canvas.getContext("2d");
    
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = data.imageUrl;

    await new Promise((resolve) => {
        img.onload = resolve;
    });

    if (ctx) {
        ctx.drawImage(
            img,
            localCrop.x,
            localCrop.y,
            localCrop.width,
            localCrop.height,
            0,
            0,
            localCrop.width,
            localCrop.height
        );
        
        const croppedDataUrl = canvas.toDataURL("image/png");
        updateNodeData(id, { croppedImageUrl: croppedDataUrl });
        triggerSave();
    }
  };

  const handleReset = () => {
      if (!imageSize) return;
      
      const fullCrop = {
          x: 0, y: 0, width: imageSize.width, height: imageSize.height
      };
      setLocalCrop(fullCrop);
      updateNodeData(id, { crop: fullCrop, croppedImageUrl: undefined });
      triggerSave();
  };

  const setPresetAspectRatio = (ratio: AspectRatio) => {
      setAspectRatio(ratio);
      if (ratio === "Free" || !imageSize) return;

      const [w, h] = ratio.split(":").map(Number);
      const targetRatio = w / h;
      
      let newWidth = localCrop.width;
      let newHeight = newWidth / targetRatio;

      if (newHeight > imageSize.height) {
          newHeight = imageSize.height;
          newWidth = newHeight * targetRatio;
      }

      const newCrop = {
          ...localCrop,
          width: newWidth,
          height: newHeight,
      };

      setLocalCrop(newCrop);
      updateNodeData(id, { crop: newCrop }); 
      triggerSave();
  };

  // Rendering Helpers
  const scale = getScale();
  
  return (
    <NodeLayout
      selected={selected}
      title="Image Crop"
      id={id}
      handles={[
        { type: "target", position: Position.Left, id: "target" },
        { type: "source", position: Position.Right, id: "source" },
      ]}
      className="group flex flex-col"
      style={{
        width: `${BASE_WIDTH}px`,
        height: `${nodeHeight}px`,
      }}
    >
      <div className="flex h-full w-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0A0A0A] shadow-2xl">
        
        {/* Main Crop Area */}
        <div 
          ref={containerRef}
          className="relative w-full flex-1 overflow-hidden bg-black"
          style={{ minHeight: "200px" }}
        >
          {data.imageUrl ? (
            <>
              {/* 1. BLURRED BACKGROUND (The "not selected" part) */}
              <img
                src={data.imageUrl}
                alt="Source"
                className="absolute inset-0 h-full w-full object-contain opacity-50 blur-sm brightness-50 grayscale-[30%]"
                style={{
                    transform: `scale(${imageSize ? 1 : 1})`, // Just to ensure it renders
                }} 
              />

              {data.croppedImageUrl ? (
                   // Show Result State
                   <div className="absolute inset-0 flex items-center justify-center bg-black">
                       <img src={data.croppedImageUrl} className="h-full w-full object-contain" />
                       <button 
                        onClick={() => updateNodeData(id, { croppedImageUrl: undefined })}
                        className="absolute right-4 top-4 rounded-full bg-black/50 p-2 text-white hover:bg-black/80"
                       >
                           <RotateCcw size={16} />
                       </button>
                   </div>
              ) : (
                // Cropping State
                <div 
                    className="relative mx-auto"
                    style={{
                        width: '100%',
                        height: imageSize ? `${imageSize.height * scale}px` : '100%',
                    }}
                >
                    {/* Invisible Reference Image for sizing the container correctly */}
                    <img
                        ref={imageRef}
                        src={data.imageUrl}
                        onLoad={onImageLoad}
                        className="invisible absolute left-0 top-0 w-full"
                        alt="reference"
                    />

                    {/* 2. SHARP FOREGROUND (Clipped inside Crop Box) */}
                    {/* The Crop Box Window */}
                    <div
                        className="absolute border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]"
                        style={{
                            left: `${localCrop.x * scale}px`,
                            top: `${localCrop.y * scale}px`,
                            width: `${localCrop.width * scale}px`,
                            height: `${localCrop.height * scale}px`,
                            cursor: isDragging ? "grabbing" : "grab",
                        }}
                        onPointerDown={(e) => handlePointerDown(e)}
                    >
                        {/* The Sharp Image Inside - Positioned negatively to match */}
                        <div className="absolute overflow-hidden inset-0">
                             <img
                                src={data.imageUrl}
                                alt="Sharp"
                                className="absolute max-w-none"
                                style={{
                                    width: `${imageSize?.width ? imageSize.width * scale : 100}px`,
                                    height: `${imageSize?.height ? imageSize.height * scale : 100}px`,
                                    left: `-${localCrop.x * scale}px`,
                                    top: `-${localCrop.y * scale}px`,
                                }}
                                draggable={false}
                            />
                        </div>

                        {/* Grid Lines (Rule of Thirds) */}
                        {isDragging && (
                            <div className="pointer-events-none absolute inset-0 flex flex-col justify-evenly">
                                <div className="h-px w-full bg-white/30 shadow-sm" />
                                <div className="h-px w-full bg-white/30 shadow-sm" />
                            </div>
                        )}
                        {isDragging && (
                            <div className="pointer-events-none absolute inset-0 flex justify-evenly">
                                <div className="h-full w-px bg-white/30 shadow-sm" />
                                <div className="h-full w-px bg-white/30 shadow-sm" />
                            </div>
                        )}
                        
                        {/* Resize Handles */}
                        {/* Sides - Only for Free aspect ratio */}
                        {aspectRatio === "Free" && (
                            <>
                                <div 
                                    className="absolute -top-1.5 left-1/2 h-4 w-4 -translate-x-1/2 cursor-n-resize active:scale-125"
                                    onPointerDown={(e) => handlePointerDown(e, "n")} 
                                >
                                   <div className="h-1.5 w-6 -translate-x-1 rounded-full bg-white shadow-sm" />
                                </div>
                                <div 
                                     className="absolute -bottom-1.5 left-1/2 h-4 w-4 -translate-x-1/2 cursor-s-resize active:scale-125"
                                     onPointerDown={(e) => handlePointerDown(e, "s")} 
                                >
                                    <div className="h-1.5 w-6 -translate-x-1 rounded-full bg-white shadow-sm" />
                                </div>
                                <div 
                                     className="absolute -left-1.5 top-1/2 h-4 w-4 -translate-y-1/2 cursor-w-resize active:scale-125"
                                     onPointerDown={(e) => handlePointerDown(e, "w")} 
                                >
                                     <div className="h-6 w-1.5 -translate-y-1 rounded-full bg-white shadow-sm" />
                                </div>
                                 <div 
                                     className="absolute -right-1.5 top-1/2 h-4 w-4 -translate-y-1/2 cursor-e-resize active:scale-125"
                                     onPointerDown={(e) => handlePointerDown(e, "e")} 
                                >
                                     <div className="h-6 w-1.5 -translate-y-1 rounded-full bg-white shadow-sm" />
                                </div>
                            </>
                        )}


                        {/* Corners */}
                        <div 
                            className="absolute -left-1.5 -top-1.5 h-4 w-4 border-l-4 border-t-4 border-white active:scale-125"
                            onPointerDown={(e) => handlePointerDown(e, "nw")} 
                            style={{ cursor: "nw-resize" }}
                        />
                        <div 
                            className="absolute -right-1.5 -top-1.5 h-4 w-4 border-r-4 border-t-4 border-white active:scale-125"
                            onPointerDown={(e) => handlePointerDown(e, "ne")}
                            style={{ cursor: "ne-resize" }}
                        />
                         <div 
                            className="absolute -bottom-1.5 -left-1.5 h-4 w-4 border-b-4 border-l-4 border-white active:scale-125"
                            onPointerDown={(e) => handlePointerDown(e, "sw")} 
                            style={{ cursor: "sw-resize" }}
                        />
                        <div 
                            className="absolute -bottom-1.5 -right-1.5 h-4 w-4 border-b-4 border-r-4 border-white active:scale-125"
                            onPointerDown={(e) => handlePointerDown(e, "se")} 
                            style={{ cursor: "se-resize" }}
                        />
                    </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-4 text-neutral-500">
              <div className="rounded-full bg-neutral-800 p-6">
                <Crop size={40} className="opacity-50" />
              </div>
              <p className="font-medium text-neutral-400">Connect an image</p>
            </div>
          )}
        </div>

        {/* Controls Footer */}
        <div className="flex flex-col gap-4 border-t border-white/5 bg-[#111] p-4 text-white">
            
            {/* Top Row: Preset & Reset */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                            <button className="flex items-center gap-2 rounded-lg bg-neutral-800 px-3 py-1.5 text-xs font-medium hover:bg-neutral-700">
                                <span className={imageSize ? "text-white" : "text-neutral-500"}>
                                    Aspect ratio {aspectRatio !== "Free" ? `(${aspectRatio})` : ""}
                                </span>
                                <ChevronDown size={12} className="opacity-50" />
                            </button>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Portal>
                            <DropdownMenu.Content className="z-50 min-w-[120px] rounded-xl border border-white/10 bg-[#0A0A0A] p-1 shadow-xl">
                                {["Free", "1:1", "4:3", "16:9", "9:16"].map((ratio) => (
                                    <DropdownMenu.Item
                                        key={ratio}
                                        onClick={() => setPresetAspectRatio(ratio as AspectRatio)}
                                        className="flex cursor-pointer items-center justify-between rounded-lg px-2 py-1.5 text-xs hover:bg-white/10"
                                    >
                                        {ratio}
                                        {aspectRatio === ratio && <Check size={12} />}
                                    </DropdownMenu.Item>
                                ))}
                            </DropdownMenu.Content>
                        </DropdownMenu.Portal>
                    </DropdownMenu.Root>
                </div>

                <button 
                    onClick={handleReset}
                    className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white"
                >
                    <RotateCcw size={12} />
                    Reset
                </button>
            </div>

            {/* Bottom Row: Dimensions & Action */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 rounded-md bg-black/50 px-2 py-1">
                        <span className="text-[10px] font-bold text-neutral-500">W</span>
                        <input 
                            type="number" 
                            className="w-10 bg-transparent text-xs font-mono text-white outline-none"
                            value={Math.round(localCrop.width)}
                            onChange={(e) => {
                                const val = Number(e.target.value);
                                setLocalCrop(p => ({ ...p, width: val }));
                            }}
                            onBlur={() => {
                                updateNodeData(id, { crop: localCrop });
                                triggerSave();
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    updateNodeData(id, { crop: localCrop });
                                    triggerSave();
                                    (e.target as HTMLInputElement).blur();
                                }
                            }}
                        />
                    </div>
                     <div className="flex items-center gap-2 rounded-md bg-black/50 px-2 py-1">
                        <span className="text-[10px] font-bold text-neutral-500">H</span>
                        <input 
                            type="number" 
                            className="w-10 bg-transparent text-xs font-mono text-white outline-none"
                            value={Math.round(localCrop.height)}
                             onChange={(e) => {
                                const val = Number(e.target.value);
                                setLocalCrop(p => ({ ...p, height: val }));
                            }}
                            onBlur={() => {
                                updateNodeData(id, { crop: localCrop });
                                triggerSave();
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    updateNodeData(id, { crop: localCrop });
                                    triggerSave();
                                    (e.target as HTMLInputElement).blur();
                                }
                            }}
                        />
                    </div>
                </div>

                <button 
                    onClick={handleCrop}
                    className="flex items-center gap-2 rounded-lg bg-[#D9E92B] px-4 py-1.5 text-xs font-bold text-black transition-transform active:scale-95 disabled:opacity-50"
                    disabled={!data.imageUrl}
                >
                    Crop
                </button>
            </div>
        </div>

      </div>
    </NodeLayout>
  );
}
