"use client";

import { IconPhotoFilled } from "@tabler/icons-react";
import { Node, NodeProps, Position, useReactFlow } from "@xyflow/react";
import { Loader2, UploadCloud } from "lucide-react";
import React, { useCallback, useState } from "react";
import { toast } from "sonner";

import { uploadImageAction } from "@/src/actions/canvas/image/upload-image";
import NodeLayout from "@/src/components/canvas/NodeLayout";

import HeroNodeLayout from "./HeroNodeLayout";

export type InputImageNodeData = {
  label?: string;
  url?: string;
  imageId?: string;
  width?: number;
  height?: number;
  [key: string]: unknown;
};

export type HeroInputImageNodeType = Node<InputImageNodeData, "heroInputImage">;

const BASE_WIDTH = 160;

const HeroInputImage = React.memo(({ id, data, selected }: NodeProps<HeroInputImageNodeType>) => {
  const aspectRatio = data.width && data.height ? data.height / data.width : 1;
  const nodeHeight = BASE_WIDTH * aspectRatio;

  return (
    <HeroNodeLayout
      selected={selected}
      title={data.label || "Input Image"}
      subtitle="Input Image"
      handles={[{ type: "source", position: Position.Right }]}
      style={{
        width: `${BASE_WIDTH}px`,
        height: `${nodeHeight}px`,
        borderRadius: "16px",
      }}
      toolbarHidden={true}
    >
      <div className="relative size-full overflow-hidden rounded-2xl border border-white/5 bg-gray-900 shadow-xl">
        {data.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={data.url}
            alt="Node Input"
            className="size-full object-cover"
            draggable={false}
          />
        ) : (
          <label
            htmlFor={`upload-${id}`}
            className="flex size-full cursor-pointer flex-col items-center justify-center gap-2 text-gray-500 hover:text-gray-300"
          >
            <UploadCloud size={32} />
            <span className="text-xs font-medium">Click to Upload</span>
          </label>
        )}
      </div>

      {/* Dimensions Badge */}
      {data.width && data.height && (
        <div className="pointer-events-none absolute bottom-2 right-2 z-10 flex justify-center">
          <span className="rounded-full border border-white/10 bg-black/50 px-2 py-1 font-mono text-[10px] font-medium text-white/50 backdrop-blur-md">
            {data.width}x{data.height}
          </span>
        </div>
      )}

      {data.url && (
        <label
          htmlFor={`upload-${id}`}
          className="absolute bottom-0 left-2 z-10 flex cursor-pointer items-center gap-2 rounded-full bg-black/50 px-2 py-1 opacity-0 backdrop-blur-md transition-all duration-300 hover:bg-black/50 group-hover:opacity-100"
        >
          <IconPhotoFilled size={12} className="text-white" />
          <span className="text-[10px] text-white">Replace</span>
        </label>
      )}
    </HeroNodeLayout>
  );
});

HeroInputImage.displayName = "HeroInputImage";

export default HeroInputImage;
