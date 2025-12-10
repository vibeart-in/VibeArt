"use client";

import { useReactFlow } from "@xyflow/react";
import { FileIcon, ImageIcon, VideoIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useDropzone } from "react-dropzone";
import { useNodeOperations } from "./NodeProvider";
import { useCanvas } from "./CanvasProvider";
import { uploadImage } from "@/src/utils/server/UploadImage";
import { cn } from "@/src/lib/utils";

type NodeDropzoneProviderProps = {
  children: ReactNode;
};

export const NodeDropzoneProvider = ({ children }: NodeDropzoneProviderProps) => {
  const { getViewport } = useReactFlow();
  const { addNode } = useNodeOperations();
  const project = useCanvas();
  const dropzone = useDropzone({
    noClick: true,
    autoFocus: false,
    noKeyboard: true,
    disabled: !project,
    onDrop: async (acceptedFiles) => {
      const uploads = await Promise.all(
        acceptedFiles.map(async (file) => {
          const { displayUrl } = await uploadImage({ file });
          return {
            name: file.name,
            data: { url: displayUrl, type: file.type },
          };
        }),
      );

      // Get the current viewport
      const viewport = getViewport();

      // Calculate the center of the current viewport
      const centerX = -viewport.x / viewport.zoom + window.innerWidth / 2 / viewport.zoom;
      const centerY = -viewport.y / viewport.zoom + window.innerHeight / 2 / viewport.zoom;

      for (const { data, name } of uploads) {
        let nodeType = "file";

        if (data.type.startsWith("image/")) {
          nodeType = "inputImage";
        } else if (data.type.startsWith("video/")) {
          nodeType = "inputVideo";
        } else if (data.type.startsWith("audio/")) {
          nodeType = "inputAudio";
        }

        addNode(nodeType, {
          data: {
            imageUrl: data.url,
            content: {
              type: data.type,
              name,
            },
          },
          position: {
            x: centerX,
            y: centerY,
          },
        });
      }
    },
  });

  return (
    <div {...dropzone.getRootProps()} className="size-full">
      <input {...dropzone.getInputProps()} className="pointer-events-none hidden select-none" />
      <div
        className={cn(
          "absolute inset-0 z-[999999] flex flex-col items-center justify-center gap-6 bg-background/70 text-foreground backdrop-blur-xl transition-all",
          dropzone.isDragActive
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        )}
      >
        <div className="relative isolate flex items-center -space-x-4">
          <div className="flex aspect-square translate-y-2 -rotate-12 items-center justify-center rounded-md bg-background p-3 shadow-xl">
            <FileIcon className="text-muted-foreground" size={24} />
          </div>
          <div className="z-10 flex aspect-square items-center justify-center rounded-md bg-background p-3 shadow-xl">
            <ImageIcon className="text-muted-foreground" size={24} />
          </div>
          <div className="flex aspect-square translate-y-2 rotate-12 items-center justify-center rounded-md bg-background p-3 shadow-xl">
            <VideoIcon className="text-muted-foreground" size={24} />
          </div>
        </div>
        <p className="text-xl font-medium tracking-tight">Drop files to create nodes</p>
      </div>
      {children}
    </div>
  );
};
