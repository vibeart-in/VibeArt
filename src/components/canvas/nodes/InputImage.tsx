"use client";

import { uploadImageAction } from "@/src/actions/canvas/image/upload-image";
import { IconPhotoFilled } from "@tabler/icons-react";
import { Node, NodeProps, Position, useReactFlow, useViewport } from "@xyflow/react";
import { Loader2, UploadCloud } from "lucide-react";
import NodeLayout from "../NodeLayout";
import React, { useCallback, useState } from "react";
import { toast } from "sonner";

type InputImageNodeData = {
  label?: string;
  url?: string;
  imageId?: string;
  width?: number;
  height?: number;
  [key: string]: unknown;
};

export type InputImageNodeType = Node<InputImageNodeData, "inputImage">;

const BASE_WIDTH = 300;

export default function InputImage({ id, data, selected }: NodeProps<InputImageNodeType>) {
  const { zoom } = useViewport();
  const { updateNode } = useReactFlow();

  const [isUploading, setIsUploading] = useState(false);

  const aspectRatio = data.width && data.height ? data.height / data.width : 1;
  const nodeHeight = BASE_WIDTH * aspectRatio;

  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      try {
        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        const result = await uploadImageAction(formData);

        if (!result.success || !result.data) throw new Error(result.error);

        updateNode(id, {
          data: {
            ...data,
            label: file.name,
            url: result.data.url,
            imageId: result.data.imageId,
            width: result.data.width,
            height: result.data.height,
          },
        });

        toast.success("Image uploaded");
      } catch (error) {
        toast.error("Upload failed");
      } finally {
        setIsUploading(false);
      }
    },
    [updateNode, id, data],
  );

  return (
    <NodeLayout
      selected={selected}
      title={data.label || "Input Image"}
      subtitle="Input Image"
      handles={[{ type: "source", position: Position.Right }]}
      style={{
        width: `${BASE_WIDTH}px`,
        height: `${nodeHeight}px`,
        borderRadius: "28px",
      }}
    >
      <input
        type="file"
        id={`upload-${id}`}
        className="hidden"
        accept="image/*"
        onChange={handleFileUpload}
        disabled={isUploading}
      />

      <div className="relative size-full overflow-hidden rounded-[28px] border border-white/5 bg-gray-900 shadow-xl">
        {isUploading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <Loader2 className="animate-spin text-white" />
          </div>
        )}

        {data.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={data.url}
            alt="Node Input"
            className="h-full w-full object-cover"
            draggable={false}
          />
        ) : (
          <label
            htmlFor={`upload-${id}`}
            className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-2 text-gray-500 hover:text-gray-300"
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

      {data.url && !isUploading && (
        <label
          htmlFor={`upload-${id}`}
          className="absolute bottom-0 left-2 z-10 flex cursor-pointer items-center gap-2 rounded-full bg-black/50 px-2 py-1 opacity-0 backdrop-blur-md transition-all duration-300 hover:bg-black/50 group-hover:opacity-100"
        >
          <IconPhotoFilled size={12} className="text-white" />
          <span className="text-[10px] text-white">Replace</span>
        </label>
      )}
    </NodeLayout>
  );
}
