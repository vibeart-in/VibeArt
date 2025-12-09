import { Handle, Position, NodeProps, useViewport } from "@xyflow/react";
import React from "react";
import { ImageInputNodeType } from "@/src/types/canvas/nodeTypes";

export default function ImageInputNode({ data, selected }: NodeProps<ImageInputNodeType>) {
  const { zoom } = useViewport();

  return (
    <div
      className={`group relative rounded-[28px] transition-all duration-300 ${
        selected ? "ring-2 ring-[#e2e2e2]/50" : "hover:ring-2 hover:ring-[#e2e2e2]/30"
      }`}
      style={{
        width: "300px",
        height: "auto",
      }}
    >
      {/* Background Image */}
      <div className="relative aspect-[2/3] w-full rounded-[28px] bg-gray-900">
        {data.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={data.imageUrl}
            alt="Input Image"
            className="h-full w-full rounded-[28px] object-cover"
            draggable={false}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-500">
            No Image
          </div>
        )}

        {/* Overlay Gradient */}
        <div
          className={`pointer-events-none absolute inset-0 rounded-[28px] transition-opacity duration-300 ${
            selected ? "bg-black/10" : "bg-transparent group-hover:bg-black/10"
          }`}
        />
      </div>

      {/* Header Info - Input Label */}
      <div
        className="absolute left-0 right-0 top-4 flex items-center justify-center px-4 font-medium text-white/90"
        style={{
          fontSize: `${14 / zoom}px`,
        }}
      >
        <span className="drop-shadow-md">Input Image</span>
      </div>

      {/* Source Handle (Output) */}
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
