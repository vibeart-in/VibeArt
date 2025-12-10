import {
  Handle,
  Position,
  NodeProps,
  Node,
  useViewport,
  NodeResizeControl,
  NodeToolbar,
} from "@xyflow/react";
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
    <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
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

      <NodeToolbar isVisible={selected || isHovered} position={Position.Bottom} offset={30}>
        <div
          className="flex items-center gap-1 rounded-2xl border border-[#2e2e2e] bg-[#151515] px-2 py-1.5 shadow-xl"
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
      <div
        className={`group relative cursor-default rounded-[28px] transition-all duration-300 ${
          selected ? "ring-2 ring-[#e2e2e2]/50" : "hover:ring-2 hover:ring-[#e2e2e2]/30"
        }`}
        style={{
          width: "100%",
          height: "100%",
        }}
      >
        {/* Input Handle - Target */}
        <Handle
          type="target"
          position={Position.Left}
          className={`!bg-[#DFFF00] transition-opacity duration-300 ${
            selected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
          style={{
            width: `${16 / zoom}px`,
            height: `${16 / zoom}px`,
            left: `${-20 / zoom}px`,
            borderWidth: `${3 / zoom}px`,
            borderColor: "#1a1a1a",
          }}
        />

        {/* Background Image */}
        <div className="relative h-full w-full rounded-[28px] bg-gray-900">
          {data.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={data.imageUrl}
              alt={data.prompt || "Generated Image"}
              className="h-full w-full rounded-[28px] object-cover"
              draggable={false}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-gray-500">
              No Image
            </div>
          )}

          {/* Overlay Gradient - darker at bottom for text, darker at top for header */}
          <div
            className={`pointer-events-none absolute inset-0 rounded-[28px] bg-gradient-to-b from-transparent via-transparent to-black/80 transition-opacity duration-300 ${
              selected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            }`}
          />
        </div>

        {/* Header Info - Always Visible */}
        <div
          className="absolute bottom-full left-0 right-0 flex items-center justify-between px-1 font-medium text-white/90"
          style={{
            marginBottom: `${8 / zoom}px`,
          }}
        >
          <span
            className="max-w-[60%] truncate font-light"
            style={{
              fontSize: `${12 / zoom}px`,
            }}
          >
            {data.category || "Image generation"}
          </span>
          <span
            className="max-w-[35%] truncate font-extralight opacity-80"
            style={{
              fontSize: `${10 / zoom}px`,
            }}
          >
            {data.model}
          </span>
        </div>

        {/* Footer / Prompt - Visible on Hover/Selected */}
        <div
          className={`absolute bottom-0 left-0 right-0 p-5 transition-opacity duration-300 ${
            selected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
        >
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
          <p className="line-clamp-3 text-[13px] font-light leading-relaxed text-white/90 drop-shadow-sm">
            {data.prompt}
          </p>
        </div>

        {/* Output Handle - Visible on Hover/Selected */}
        <Handle
          type="source"
          position={Position.Right}
          className={`!bg-[#DFFF00] transition-opacity duration-300 ${
            selected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
          style={{
            width: `${16 / zoom}px`,
            height: `${16 / zoom}px`,
            right: `${-20 / zoom}px`,
            borderWidth: `${3 / zoom}px`,
            borderColor: "#1a1a1a",
          }}
        />
      </div>
    </div>
  );
}
