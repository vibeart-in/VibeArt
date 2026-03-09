"use client";

import { Node, NodeProps, Position, useReactFlow } from "@xyflow/react";
import { Film, Loader2, RefreshCw, Scissors, Image as ImageIcon } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { uploadImageAction } from "@/src/actions/canvas/image/upload-image";
import { useUpstreamData } from "@/src/utils/xyflow";

import { useCanvas } from "../../providers/CanvasProvider";
import NodeLayout from "../NodeLayout";

export type FrameExtractorNodeData = {
  label?: string;
  url?: string;
  imageId?: string;
  width?: number;
  height?: number;
  [key: string]: unknown;
};

export type FrameExtractorNodeType = Node<FrameExtractorNodeData, "frameExtractor">;

const BASE_WIDTH = 500;

const FrameExtractorNode = React.memo(
  ({ id, data, selected }: NodeProps<FrameExtractorNodeType>) => {
    const { updateNode } = useReactFlow();
    const { project } = useCanvas();
    const { videos } = useUpstreamData("target");

    const [isExtracting, setIsExtracting] = useState(false);
    const [extractMode, setExtractMode] = useState<"first" | "last" | "custom">("custom");
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [videoAspectRatio, setVideoAspectRatio] = useState<number | null>(null);

    const videoRef = useRef<HTMLVideoElement>(null);
    const upstreamVideoUrl = videos && videos.length > 0 ? videos[0] : null;

    // Dynamically calculate aspect ratio: Extracted Image > Video Metadata > Default (16:9)
    const currentAspectRatio =
      data.width && data.height ? data.width / data.height : videoAspectRatio || 16 / 9;

    const nodeHeight = BASE_WIDTH / currentAspectRatio;

    const handleLoadedMetadata = () => {
      if (videoRef.current) {
        const vidDuration = videoRef.current.duration;
        const width = videoRef.current.videoWidth;
        const height = videoRef.current.videoHeight;

        setDuration(vidDuration);
        setVideoAspectRatio(width / height);

        if (extractMode === "first") {
          videoRef.current.currentTime = 0;
        } else if (extractMode === "last") {
          videoRef.current.currentTime = Math.max(0, vidDuration - 0.1);
        }
      }
    };

    const handleSeeked = () => {
      if (videoRef.current) {
        setCurrentTime(videoRef.current.currentTime);
      }
    };

    useEffect(() => {
      if (videoRef.current) {
        if (extractMode === "first") {
          videoRef.current.currentTime = 0;
          setCurrentTime(0);
        } else if (extractMode === "last") {
          const targetTime = Math.max(0, duration - 0.1);
          videoRef.current.currentTime = targetTime;
          setCurrentTime(targetTime);
        }
      }
    }, [extractMode, duration]);

    const extractFrame = async () => {
      if (!videoRef.current) return;
      try {
        setIsExtracting(true);
        const canvas = document.createElement("canvas");
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Could not get 2D context");

        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

        const blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, "image/jpeg", 0.95),
        );
        if (!blob) throw new Error("Could not create blob");

        const file = new File([blob], `frame_${Date.now()}.jpg`, { type: "image/jpeg" });
        const formData = new FormData();
        formData.append("file", file);
        formData.append("width", canvas.width.toString());
        formData.append("height", canvas.height.toString());
        if (project?.id) formData.append("canvasId", project.id);

        const result = await uploadImageAction(formData);

        if (!result.success || !result.data) throw new Error(result.error);

        updateNode(id, {
          data: {
            ...data,
            url: result.data.url,
            imageId: result.data.imageId,
            width: result.data.width,
            height: result.data.height,
          },
        });

        toast.success("Frame extracted successfully!");
      } catch (error) {
        toast.error("Failed to extract frame");
        console.error(error);
      } finally {
        setIsExtracting(false);
      }
    };

    const resetExtraction = () => {
      updateNode(id, {
        data: {
          ...data,
          url: undefined,
          imageId: undefined,
        },
      });
    };

    return (
      <NodeLayout
        id={id}
        selected={selected}
        title={data.label || "Extract Frame"}
        subtitle="Frame Extractor"
        handles={[
          { type: "target", position: Position.Left },
          { type: "source", position: Position.Right },
        ]}
        style={{
          width: `${BASE_WIDTH}px`,
          height: `${nodeHeight}px`,
          borderRadius: "28px",
          transition: "height 0.3s ease-in-out", // Smooth resize when aspect ratio is discovered
        }}
        toolbarHidden={true}
        resizeHidden={false}
      >
        <div className="group relative size-full overflow-hidden rounded-[28px] border border-white/10 bg-neutral-900 shadow-2xl">
          {data.url ? (
            <>
              {/* Extracted Frame View */}
              <img
                src={data.url}
                alt="Extracted Frame"
                className="size-full object-cover"
                draggable={false}
                crossOrigin="anonymous"
              />

              {/* Hover Overlay Controls */}
              <div className="absolute inset-0 bg-black/0 transition-all duration-300 group-hover:bg-black/30" />

              <div className="absolute right-3 top-3 z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <button
                  onClick={resetExtraction}
                  className="flex size-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md transition-all hover:scale-105 hover:bg-red-500/80 hover:shadow-lg"
                  title="Discard and select new frame"
                >
                  <RefreshCw size={16} />
                </button>
              </div>

              {/* Dimensions Badge */}
              {data.width && data.height && (
                <div className="pointer-events-none absolute bottom-3 right-3 z-10 flex justify-center">
                  <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-black/60 px-2.5 py-1 font-mono text-xs font-medium text-white/80 backdrop-blur-md">
                    <ImageIcon size={12} className="text-white/50" />
                    {data.width} × {data.height}
                  </span>
                </div>
              )}
            </>
          ) : upstreamVideoUrl ? (
            <>
              {/* Video Player View */}
              <video
                ref={videoRef}
                src={upstreamVideoUrl}
                className="size-full bg-black object-contain"
                onLoadedMetadata={handleLoadedMetadata}
                onSeeked={handleSeeked}
                crossOrigin="anonymous"
                playsInline
              />

              {isExtracting ? (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-black/70 backdrop-blur-sm">
                  <Loader2 className="size-8 animate-spin text-accent" />
                  <span className="text-sm font-medium text-white/90">Extracting Frame...</span>
                </div>
              ) : (
                <div className="absolute inset-x-0 bottom-0 flex flex-col justify-end gap-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 pt-16 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  {/* Timeline Slider */}
                  <div className="flex flex-col gap-1.5 px-1">
                    <input
                      type="range"
                      min={0}
                      max={duration || 100}
                      step={0.01}
                      value={currentTime}
                      onChange={(e) => {
                        if (videoRef.current) {
                          const val = parseFloat(e.target.value);
                          videoRef.current.currentTime = val;
                          setCurrentTime(val);
                          setExtractMode("custom"); // Auto-switch to custom when dragging
                        }
                      }}
                      className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/20 accent-accent hover:accent-accent focus:outline-none"
                    />
                    <div className="flex justify-between font-mono text-[10px] text-white/50">
                      <span>{currentTime.toFixed(2)}s</span>
                      <span>{duration.toFixed(2)}s</span>
                    </div>
                  </div>

                  {/* Buttons Row */}
                  <div className="flex w-full items-center gap-2">
                    {(["first", "custom", "last"] as const).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setExtractMode(mode)}
                        className={`flex-1 rounded-full px-2 py-2 text-xs font-semibold capitalize backdrop-blur-md transition-all ${
                          extractMode === mode
                            ? "bg-white text-black shadow-sm"
                            : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                    <button
                      onClick={extractFrame}
                      className="flex flex-[1.2] items-center justify-center gap-1.5 rounded-full bg-accent px-3 py-2 text-xs font-semibold text-black shadow-lg transition-all hover:brightness-110 active:scale-[0.98]"
                    >
                      <Scissors size={14} />
                      <span className="truncate">Extract Frame</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Empty State */
            <div className="flex size-full flex-col items-center justify-center gap-3 bg-neutral-900/50 text-neutral-500">
              <div className="rounded-2xl border border-white/5 bg-neutral-800 p-4 shadow-inner">
                <Film size={28} className="text-neutral-400" />
              </div>
              <span className="text-sm font-medium">Connect a video source to begin</span>
            </div>
          )}
        </div>
      </NodeLayout>
    );
  },
);

FrameExtractorNode.displayName = "FrameExtractorNode";

export default FrameExtractorNode;
