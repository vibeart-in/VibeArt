import { Position, NodeProps, Node, useReactFlow } from "@xyflow/react";
import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { ArrowUp, Loader2, Copy, Check } from "lucide-react";
import { useSyncUpstreamData, useUpstreamData } from "@/src/utils/xyflow";
import { useAtom } from "jotai";
import { selectedModelAtom } from "@/src/store/nodeAtoms";
import NodeLayout from "@/src/components/canvas/NodeLayout";

const VIDEO_EXTENSIONS = [".mp4", ".webm", ".ogg", ".mov", ".m4v", ".avi"];

function isVideoUrl(url: string): boolean {
  try {
    const pathname = new URL(url, "https://placeholder.com").pathname.toLowerCase();
    return VIDEO_EXTENSIONS.some((ext) => pathname.endsWith(ext));
  } catch {
    // Fallback: check the raw string
    const lower = url.toLowerCase();
    return VIDEO_EXTENSIONS.some((ext) => lower.includes(ext));
  }
}

export type HeroOutputImageNodeData = {
  imageUrl?: string;
  prompt?: string;
  stylePrompt?: string;
  inputImageUrls?: string[];
  width?: number;
  height?: number;
  nodeWidth?: number;
  nodeHeight?: number;
  outputImages?: { width: number; height: number; url: string }[];
  category?: string;
  model?: string;
  conversationId?: string;
  [key: string]: unknown;
};

export type HeroOutputImageNodeType = Node<HeroOutputImageNodeData, "heroOutputImage">;

const DEFAULT_BASE_WIDTH = 170;

const HeroOutputImage = React.memo(
  ({
    id,
    data,
    selected,
    width: nodeFlowWidth,
    height: nodeFlowHeight,
  }: NodeProps<HeroOutputImageNodeType>) => {
    // Use the node's actual React Flow width if available, otherwise fall back to data.nodeWidth or default
    const BASE_WIDTH = data.nodeWidth || DEFAULT_BASE_WIDTH;
    const { updateNodeData, updateNode } = useReactFlow();

    useSyncUpstreamData(id, data);
    const { stylePrompt } = useUpstreamData("target");

    useEffect(() => {
      if (stylePrompt !== data.stylePrompt) {
        updateNodeData(id, { stylePrompt });
      }
    }, [stylePrompt, data.stylePrompt, id, updateNodeData]);

    const [currentPlaceholder, setCurrentPlaceholder] = useState(0);
    const [prompt, setPrompt] = useState(data.prompt || "");
    const [isCopied, setIsCopied] = useState(false);

    const mediaIsVideo = useMemo(
      () => (data.imageUrl ? isVideoUrl(data.imageUrl) : false),
      [data.imageUrl],
    );
    const videoRef = useRef<HTMLVideoElement>(null);

    // Ensure video autoplays when src changes
    const handleVideoLoaded = useCallback(() => {
      videoRef.current?.play().catch(() => {
        /* autoplay blocked, silently ignore */
      });
    }, []);

    // Sync prop to state
    useEffect(() => {
      if (data.prompt !== prompt) {
        setPrompt(data.prompt || "");
      }
    }, [data.prompt]);

    // Debounce prompt updates
    useEffect(() => {
      const timer = setTimeout(() => {
        if (prompt !== data.prompt) {
          updateNodeData(id, { prompt });
        }
      }, 400);
      return () => clearTimeout(timer);
    }, [prompt, id, updateNodeData, data.prompt]);

    const [selectedModel] = useAtom(selectedModelAtom(id));

    // Sync atom to data.model
    useEffect(() => {
      if (selectedModel && selectedModel.model_name !== data.model) {
        updateNodeData(id, { model: selectedModel.model_name });
      }
    }, [selectedModel, data.model, updateNodeData, id]);

    // --- RESIZE & ASPECT RATIO LOGIC START ---

    // 1. Determine dimensions strictly from Output if available, ignoring 'data.width' if it's an input param
    const aspectRatio = useMemo(() => {
      const outputImg = data.outputImages?.[0];

      // Priority 1: Generated Image Dimensions
      if (outputImg?.width && outputImg?.height) {
        return outputImg.height / outputImg.width;
      }

      // Priority 2: Use explicit width/height from data if available
      if (data.height && data.width) {
        return data.height / data.width;
      }

      // Priority 3: Default behavior
      // We assume standard portrait if we have an image but no metadata, or 1:1
      if (data.imageUrl) {
        return 1.0;
      }

      // Priority 4: Default Placeholder Aspect Ratio (Vertical for text area space)
      return 1.2;
    }, [data.outputImages, data.imageUrl, data.width, data.height]);

    const targetHeight = BASE_WIDTH * aspectRatio;

    // 2. Enforce Node Size
    useEffect(() => {
      // If explicit nodeWidth/nodeHeight are provided, enforce those dimensions directly
      if (data.nodeWidth) {
        const desiredWidth = data.nodeWidth;
        const desiredHeight = data.nodeHeight || desiredWidth * aspectRatio;

        // Only update if current React Flow dimensions differ
        if (
          !nodeFlowWidth ||
          !nodeFlowHeight ||
          Math.abs(nodeFlowWidth - desiredWidth) > 1 ||
          Math.abs(nodeFlowHeight - desiredHeight) > 1
        ) {
          updateNode(id, {
            width: desiredWidth,
            height: desiredHeight,
          });
        }
        return;
      }

      // Default: enforce BASE_WIDTH with aspect-ratio-derived height
      const currentWidth = data.width;
      const currentHeight = data.height;

      const isSizeMismatch =
        !currentWidth ||
        !currentHeight ||
        Math.abs(currentWidth - BASE_WIDTH) > 1 ||
        Math.abs(currentHeight - targetHeight) > 1;

      if (isSizeMismatch) {
        if (data.imageUrl || !currentWidth) {
          updateNode(id, {
            width: BASE_WIDTH,
            height: targetHeight,
          });
        }
      }
    }, [
      aspectRatio,
      targetHeight,
      data.width,
      data.height,
      data.imageUrl,
      data.nodeWidth,
      data.nodeHeight,
      nodeFlowWidth,
      nodeFlowHeight,
      id,
      updateNode,
      BASE_WIDTH,
    ]);

    // --- RESIZE LOGIC END ---

    const inputImages = data.inputImageUrls || [];

    const isGenerating = !!data.activeJobId;

    return (
      <NodeLayout
        id={id}
        selected={selected}
        title={data.category || "Image generation"}
        subtitle={data?.model}
        minWidth={BASE_WIDTH}
        minHeight={targetHeight}
        keepAspectRatio={true}
        className="flex h-full w-full cursor-default flex-col rounded-2xl bg-[#1D1D1D]"
        handles={[
          { type: "target", position: Position.Left },
          { type: "source", position: Position.Right },
        ]}
        toolbarType="generate"
        initialModel={data.model}
        toolbarHidden={true}
      >
        {/* 
         We ensure this container has a minimum height so placeholders show up 
         immediately, even if the NodeLayout hasn't fully expanded yet.
      */}
        <div className="relative h-full w-full flex-1 overflow-hidden rounded-2xl">
          {data.imageUrl &&
            (mediaIsVideo ? (
              <video
                ref={videoRef}
                src={data.imageUrl}
                autoPlay
                loop
                muted
                playsInline
                onLoadedMetadata={handleVideoLoaded}
                className="h-full w-full rounded-2xl object-cover"
                draggable={false}
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={data.imageUrl}
                alt={data.prompt || "Generated Image"}
                className="h-full w-full rounded-2xl object-cover"
                draggable={false}
              />
            ))}

          {data.imageUrl && (
            <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-b from-transparent via-transparent to-black/30" />
          )}
        </div>

        <div
          className={`absolute bottom-0 left-0 right-0 p-3 transition-opacity duration-300 ${
            selected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
        >
          {inputImages.length > 0 && (
            <div className="scrollbar-hide relative z-10 mb-3 flex items-center gap-2 overflow-x-auto pb-1">
              {inputImages.map((url, index) => (
                <div
                  key={index}
                  className="relative shrink-0 overflow-hidden rounded-sm border border-white/20 bg-black/20 shadow-sm backdrop-blur-sm transition-transform hover:scale-105"
                >
                  {isVideoUrl(url) ? (
                    <video
                      src={url}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="size-8 object-cover"
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={url} alt={`Input ${index + 1}`} className="size-8 object-cover" />
                  )}
                </div>
              ))}
            </div>
          )}

          {data.imageUrl && (
            <div className="group/prompt relative">
              <p className="line-clamp-3 text-xs font-light leading-relaxed text-white/90">
                {data.prompt}
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (data.prompt) {
                    navigator.clipboard.writeText(data.prompt);
                    setIsCopied(true);
                    setTimeout(() => setIsCopied(false), 2000);
                  }
                }}
                className="absolute -top-1 right-10 opacity-0 transition-opacity group-hover/prompt:opacity-100"
              >
                <div className="rounded-md bg-black/40 p-1.5 backdrop-blur-sm transition-colors hover:bg-black/60">
                  {isCopied ? (
                    <Check className="size-3 text-green-400" />
                  ) : (
                    <Copy className="size-3 text-white/70" />
                  )}
                </div>
              </button>
            </div>
          )}
        </div>
      </NodeLayout>
    );
  },
);

HeroOutputImage.displayName = "HeroOutputImage";

export default HeroOutputImage;
