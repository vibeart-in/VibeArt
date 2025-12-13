import {
  Handle,
  Position,
  NodeProps,
  Node,
  useViewport,
  NodeResizeControl,
  NodeToolbar,
} from "@xyflow/react";
import NodeLayout from "../NodeLayout";
import React, { useState, useRef, useCallback } from "react";
import { MoreHorizontal, Download, Pencil, Sparkles, ChevronDown, Plug } from "lucide-react";

// Define the data shape
type ImageNodeData = {
  label?: string;
  imageUrl?: string;
  inputImageUrls?: string[];
  prompt?: string;
  model?: string;
  category?: string;
  width?: number;
  height?: number;
  [key: string]: unknown;
};

// Define the specific Node type
export type OutputImageNodeType = Node<ImageNodeData, "outputImage">;

export default function OutputImage({ data, selected }: NodeProps<OutputImageNodeType>) {
  const { zoom } = useViewport();
  const { width = 2, height = 3 } = data;
  const [isHovered, setIsHovered] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 300);
  }, []);

  return (
    <>
      <NodeToolbar isVisible={selected || isHovered} position={Position.Bottom} offset={30}>
        <div
          className="flex items-center gap-1 rounded-2xl border border-[#1D1D1D] bg-[#151515] px-2 py-1.5 shadow-xl"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Left Section: Controls */}
          <div className="flex items-center gap-1 pr-2">
            <button className="flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium text-gray-400 transition-colors hover:bg-white/10 hover:text-white">
              <Plug className="size-3.5" />
              <ChevronDown className="size-3 opacity-50" />
            </button>
            <button className="flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium text-gray-400 transition-colors hover:bg-white/10 hover:text-white">
              <span>
                {width}:{height}
              </span>
              <ChevronDown className="size-3 opacity-50" />
            </button>
          </div>

          {/* Separator */}
          <div className="h-4 w-[1px] bg-[#333]"></div>

          {/* Right Section: Actions */}
          <div className="flex items-center gap-0.5 pl-2">
            <button className="rounded-full p-1.5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white">
              <Sparkles className="size-3.5" />
            </button>
            <button className="rounded-full p-1.5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white">
              <Download className="size-3.5" />
            </button>
            <button className="rounded-full p-1.5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white">
              <Pencil className="size-3.5" />
            </button>
            <button className="rounded-full p-1.5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white">
              <MoreHorizontal className="size-3.5" />
            </button>
          </div>
        </div>
      </NodeToolbar>
      <NodeLayout
        selected={selected}
        title={data.category || "Image generation"}
        subtitle={data.model}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="h-[400px] w-[320px] cursor-default rounded-[28px]"
        handles={[
          { type: "target", position: Position.Left },
          { type: "source", position: Position.Right },
        ]}
      >
        {selected && (
          <NodeResizeControl
            position="bottom-right"
            minWidth={100}
            minHeight={100}
            keepAspectRatio
            style={{
              background: "transparent",
              border: "none",
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{
                position: "absolute",
                bottom: -6,
                right: -6,
              }}
            >
              <path
                d="M 3 17 A 14 14 0 0 0 17 3"
                stroke="#c0c0bf80"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
          </NodeResizeControl>
        )}

        {/* Background Image */}
        <div className="relative h-full w-full rounded-[28px] bg-[#1D1D1D]">
          {data.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={data.imageUrl}
              alt={data.prompt || "Generated Image"}
              className="h-full w-full rounded-[28px] object-cover"
              draggable={false}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              {/* Empty state with "Try" prompt */}
            </div>
          )}

          {/* Overlay Gradient - visible when image exists */}
          {data.imageUrl && (
            <div className="pointer-events-none absolute inset-0 rounded-[28px] bg-gradient-to-b from-black/20 via-transparent to-black/60" />
          )}
        </div>

        {/* Footer / Prompt - Visible when image exists or on hover */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          {!data.imageUrl ? (
            // Before generation: Show "Try [prompt]" text
            <p className="text-[15px] font-light leading-relaxed text-white/70">
              Try "{data.prompt || "Enter a prompt"}"
            </p>
          ) : (
            // After generation: Show input images and prompt
            <>
              {data.inputImageUrls && data.inputImageUrls.length > 0 && (
                <div className="scrollbar-hide mb-3 flex items-center gap-2 overflow-x-auto pb-1">
                  {data.inputImageUrls.map((url, index) => (
                    <div
                      key={index}
                      className="relative shrink-0 overflow-hidden rounded-xl border border-white/20 bg-black/20 shadow-sm backdrop-blur-sm transition-transform hover:scale-105"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt={`Input reference ${index + 1}`}
                        className="size-16 object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
              <p className="line-clamp-3 text-[15px] font-light leading-relaxed text-white/90 drop-shadow-sm">
                {data.prompt}
              </p>
            </>
          )}
        </div>

        {/* Generate Button - Bottom Right (yellow circle with up arrow) */}
        <button
          className="absolute bottom-5 right-5 flex size-12 items-center justify-center rounded-full bg-[#DFFF00] text-black shadow-lg transition-all hover:scale-110 hover:shadow-xl"
          onClick={() => {
            // TODO: Implement image generation
            console.log("Generate image with prompt:", data.prompt);
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
        </button>
      </NodeLayout>
    </>
  );
}
