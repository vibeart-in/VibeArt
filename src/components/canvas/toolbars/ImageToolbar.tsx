"use client";

import { Palette, Sparkles, ChevronDown } from "lucide-react";
import { Position, NodeToolbar as FlowNodeToolbar } from "@xyflow/react";

interface ImageToolbarProps {
  selected: boolean;
  isHovered: boolean;
  handleMouseEnter: () => void;
  handleMouseLeave: () => void;
}

export default function ImageToolbar({
  selected,
  isHovered,
  handleMouseEnter,
  handleMouseLeave,
}: ImageToolbarProps) {
  return (
    <FlowNodeToolbar
      className={selected ? "opacity-100" : "opacity-50 hover:opacity-100"}
      isVisible={selected || isHovered}
      position={Position.Bottom}
      offset={20}
    >
      <div
        className="flex items-center gap-2 rounded-full border border-[#1D1D1D] bg-[#121212] p-1.5 shadow-2xl"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Palette Section */}
        <button className="flex h-9 items-center gap-2 rounded-full bg-[#1A1A1A] px-3 text-gray-300 transition-colors hover:bg-white/10 hover:text-white">
          <Palette className="size-4" />
          <ChevronDown className="size-3 opacity-50" />
        </button>

        {/* Aspect Ratio Section */}
        <button className="flex h-9 items-center gap-2 rounded-full bg-[#1A1A1A] px-3 text-sm font-medium text-gray-300 transition-colors hover:bg-white/10 hover:text-white">
          <span>1:1</span>
          <ChevronDown className="size-3 opacity-50" />
        </button>

        {/* Model Section */}
        <button className="flex h-9 items-center gap-2 rounded-full bg-[#1A1A1A] pl-1 pr-3 text-sm font-medium text-gray-300 transition-colors hover:bg-white/10 hover:text-white">
          <div
            className="size-6 overflow-hidden rounded-md bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://cdn.pixabay.com/photo/2024/05/26/10/15/bird-8788491_1280.jpg')",
            }}
          ></div>
          <span>Nano Banana</span>
          <ChevronDown className="size-3 opacity-50" />
        </button>

        {/* Action Section */}
        <button className="flex size-9 items-center justify-center rounded-full bg-[#1A1A1A] text-gray-300 transition-colors hover:bg-white/10 hover:text-white">
          <Sparkles className="size-4" />
        </button>
      </div>
    </FlowNodeToolbar>
  );
}
