"use client";

import { useReactFlow } from "@xyflow/react";
import { FileIcon, ImageIcon, VideoIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { useNodeOperations } from "./NodeProvider";
import { useCanvas } from "./CanvasProvider";
import { cn } from "@/src/lib/utils";
import { uploadImageAction } from "@/src/actions/canvas/image/upload-image";

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
      if (acceptedFiles.length === 0) return;
      const toastId = toast.loading(`Processing ${acceptedFiles.length} file(s)...`);

      try {
        // 1. Get Viewport Center
        const viewport = getViewport();
        const centerX = -viewport.x / viewport.zoom + window.innerWidth / 2 / viewport.zoom;
        const centerY = -viewport.y / viewport.zoom + window.innerHeight / 2 / viewport.zoom;

        // 2. Upload Files using the Server Action
        const promises = acceptedFiles.map(async (file) => {
          const formData = new FormData();
          formData.append("file", file);

          const result = await uploadImageAction(formData);

          return {
            originalFile: file,
            result: result,
          };
        });

        const uploads = await Promise.all(promises);

        // 3. Create Nodes
        let successCount = 0;
        uploads.forEach(({ originalFile, result }, index) => {
          if (!result.success || !result.data) {
            toast.error(`Failed to upload ${originalFile.name}: ${result.error}`);
            return;
          }

          successCount++;
          // UPDATED: We now get 'url' (public) instead of 'displayUrl' (signed)
          const { imageId, url, width, height } = result.data;

          let nodeType = "file";
          if (originalFile.type.startsWith("image/")) {
            nodeType = "inputImage";
          } else if (originalFile.type.startsWith("video/")) {
            nodeType = "inputVideo";
          }

          addNode(nodeType, {
            data: {
              label: originalFile.name,
              url: url,
              imageId: imageId,
              width: width,
              height: height,
            },
            position: {
              x: centerX + index * 40,
              y: centerY + index * 40,
            },
          });
        });

        if (successCount === acceptedFiles.length) {
          toast.success(`Successfully added ${successCount} node(s)`, { id: toastId });
        } else if (successCount > 0) {
          toast.warning(`Added ${successCount}/${acceptedFiles.length} node(s)`, { id: toastId });
        } else {
          toast.error("Failed to add nodes", { id: toastId });
        }
      } catch (error) {
        console.error("Dropzone error:", error);
        toast.error("An unexpected error occurred", { id: toastId });
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
