"use client";

import { IconPhotoFilled } from "@tabler/icons-react";
import { Node, NodeProps, Position, useReactFlow } from "@xyflow/react";
import { FileVideo, Loader2, UploadCloud, Volume2, VolumeX } from "lucide-react";
import React, { useCallback, useState } from "react";
import { toast } from "sonner";

import { uploadImageAction } from "@/src/actions/canvas/image/upload-image";

import { useCanvas } from "../../providers/CanvasProvider";
import NodeLayout from "../NodeLayout";

export type InputImageNodeData = {
  label?: string;
  url?: string;
  imageId?: string;
  width?: number;
  height?: number;
  [key: string]: unknown;
};

export type InputImageNodeType = Node<InputImageNodeData, "inputImage">;

const BASE_WIDTH = 500;

const isVideoUrl = (url: string) => /\.(mp4|webm|ogg|mov)$/i.test(url);

const InputImage = React.memo(({ id, data, selected }: NodeProps<InputImageNodeType>) => {
  // console.log("INPUTIMAGE", data);
  const { updateNode } = useReactFlow();
  const { project } = useCanvas();

  const [isUploading, setIsUploading] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const aspectRatio = data.width && data.height ? data.height / data.width : 1;
  const nodeHeight = BASE_WIDTH * aspectRatio;

  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      let width = 0;
      let height = 0;

      if (file.type.startsWith("video/")) {
        const video = document.createElement("video");
        video.src = URL.createObjectURL(file);
        await new Promise((resolve) => {
          video.onloadedmetadata = () => {
            width = video.videoWidth;
            height = video.videoHeight;
            resolve(null);
          };
          video.onerror = () => resolve(null);
        });
      }

      try {
        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        if (width) formData.append("width", width.toString());
        if (height) formData.append("height", height.toString());
        if (project?.id) formData.append("canvasId", project.id);

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
      toolbarHidden={true}
    >
      <input
        type="file"
        id={`upload-${id}`}
        className="hidden"
        accept="image/*,video/*"
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
          isVideoUrl(data.url) ? (
            <video
              src={data.url}
              className="size-full object-cover"
              autoPlay
              muted={isMuted}
              loop
              playsInline
              draggable={false}
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={data.url}
              alt="Node Input"
              className="size-full object-cover"
              draggable={false}
            />
          )
        ) : (
          <label
            htmlFor={`upload-${id}`}
            className="flex size-full cursor-pointer flex-col items-center justify-center gap-2 text-gray-500 hover:text-gray-300"
          >
            <UploadCloud size={32} />
            <span className="text-xs font-medium">Click to Upload</span>
          </label>
        )}

        {data.url && isVideoUrl(data.url) && (
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="absolute left-2 top-2 z-20 flex size-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md transition-all hover:bg-black/70"
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
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
          {isVideoUrl(data.url) ? (
            <FileVideo size={12} className="text-white" />
          ) : (
            <IconPhotoFilled size={12} className="text-white" />
          )}
          <span className="text-[10px] text-white">Replace</span>
        </label>
      )}
    </NodeLayout>
  );
});

InputImage.displayName = "InputImage";

export default InputImage;
