import { Handle, Position, NodeProps, Node, useViewport } from "@xyflow/react";
import React from "react";
import { MoreHorizontal, Download, Pencil, Sparkles, ChevronDown, Plug } from "lucide-react";

// Define the data shape
type ImageNodeData = {
  label?: string;
  imageUrl?: string;
  prompt?: string;
  model?: string;
  category?: string;
  [key: string]: unknown;
};

// Define the specific Node type
export type OutputImageNodeType = Node<ImageNodeData, "outputImage">;

export default function OutputImageNode({ data, selected }: NodeProps<OutputImageNodeType>) {
  const { zoom } = useViewport();

  return (
    <div
      className={`group relative rounded-[28px] transition-all duration-300 ${
        selected ? "ring-2 ring-[#e2e2e2]/50" : "hover:ring-2 hover:ring-[#e2e2e2]/30"
      }`}
      style={{
        width: "300px", // Fixed width for consistency
        height: "auto",
      }}
    >
      {/* Menu Bar - Visible on Selected/Hover */}
      <div
        className="absolute left-1/2"
        style={{
          bottom: `calc(100% + ${20 / zoom}px)`,
          transform: `translateX(-50%) scale(${1 / zoom})`,
          transformOrigin: "bottom center",
          zIndex: 10,
        }}
      >
        <div
          className={`flex items-center gap-1 rounded-full border border-[#2e2e2e] bg-[#151515] px-2 py-1.5 shadow-xl transition-all duration-300 ${
            selected
              ? "translate-y-0 opacity-100"
              : "pointer-events-none translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
          }`}
        >
          {/* Left Section: Controls */}
          <div className="flex items-center gap-1 pr-2">
            <button className="flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium text-gray-400 transition-colors hover:bg-white/10 hover:text-white">
              <Plug className="size-3.5" />
              <ChevronDown className="size-3 opacity-50" />
            </button>
            <button className="flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium text-gray-400 transition-colors hover:bg-white/10 hover:text-white">
              <span>2:3</span>
              <ChevronDown className="size-3 opacity-50" />
            </button>
            <button className="flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium text-gray-400 transition-colors hover:bg-white/10 hover:text-white">
              <span>{data.model || "Model"}</span>
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
      </div>

      {/* Input Handle - Target */}
      <Handle
        type="target"
        position={Position.Left}
        className={`!-left-4 !h-4 !w-4 !border-[3px] !border-[#1a1a1a] !bg-[#DFFF00] transition-opacity duration-300 ${
          selected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
      />

      {/* Background Image */}
      <div className="relative aspect-[2/3] w-full rounded-[28px] bg-gray-900">
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
        <p className="line-clamp-3 text-[13px] font-light leading-relaxed text-white/90 drop-shadow-sm">
          {data.prompt}
        </p>
      </div>

      {/* Output Handle - Visible on Hover/Selected */}
      <Handle
        type="source"
        position={Position.Right}
        className={`!-right-4 !h-4 !w-4 !border-[3px] !border-[#1a1a1a] !bg-[#DFFF00] transition-opacity duration-300 ${
          selected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
      />
    </div>
  );
}
