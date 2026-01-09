import { Position, NodeProps, Node, useReactFlow } from "@xyflow/react";
import NodeLayout from "../NodeLayout";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { ArrowUp, Loader2, RefreshCw } from "lucide-react";
import { useSyncUpstreamData } from "@/src/utils/xyflow";
import { ModernCardLoader } from "@/src/components/ui/ModernCardLoader";
import { useGenerateCanvasImage } from "@/src/hooks/useGenerateCanvasImage";
import { useCanvas } from "../../providers/CanvasProvider";

export type UpscaleNodeData = {
  imageUrl?: string;
  inputImageUrls?: string[];
  width?: number;
  height?: number;
  outputImages?: { width: number; height: number; url: string }[];
  scale?: number;
  face_enhance?: boolean;
  activeJobId?: string;
  status?: string;
  [key: string]: unknown;
};

export type UpscaleNodeType = Node<UpscaleNodeData, "upscale">;

const BASE_WIDTH = 450;
const INITIAL_SCALE = 4;
const INITIAL_FACE_ENHANCE = false;

const UpscaleNode = React.memo(({ id, data, selected }: NodeProps<UpscaleNodeType>) => {
  const { updateNodeData, updateNode } = useReactFlow();

  // Sync upstream data (images)
  useSyncUpstreamData(id, data);

  const { project } = useCanvas();
  const generateMutation = useGenerateCanvasImage(project?.id || "");

  // Sync external data changes to local state (e.g. Undo/Redo)
  // No local state for scale/faceEnhance anymore, they are directly from data

  const inputImages = data.inputImageUrls || [];
  // Use either the explicitly set imageUrl (from prev generation) or the first input image from upstream
  const displayImage = data.imageUrl || (inputImages.length > 0 ? inputImages[0] : undefined);

  // --- RESIZE LOGIC ---
  const aspectRatio = useMemo(() => {
    // Priority 1: Output image dimensions (after upscaling)
    const outputImg = data.outputImages?.[0];
    if (outputImg?.width && outputImg?.height) {
      return outputImg.height / outputImg.width;
    }

    // Priority 2: Stored width/height (from previous generations or input)
    if (data.width && data.height) {
      return data.height / data.width;
    }

    // Default 1:1 if we don't have any dimensions
    return 1.0;
  }, [data.outputImages, data.width, data.height]);

  const targetHeight = BASE_WIDTH * aspectRatio;

  useEffect(() => {
    const currentWidth = data.width;
    const currentHeight = data.height;

    // Only update if mismatch is significant
    if (
      !currentWidth ||
      Math.abs(currentWidth - BASE_WIDTH) > 1 ||
      !currentHeight ||
      Math.abs(currentHeight - targetHeight) > 1
    ) {
      // Only resize if we have context to do so (like an image) or just one time setup
      if (displayImage || !currentWidth) {
        updateNode(id, {
          width: BASE_WIDTH,
          height: targetHeight,
        });
      }
    }
  }, [aspectRatio, targetHeight, data.width, data.height, displayImage, id, updateNode]);

  const handleGenerate = useCallback(() => {
    if (!displayImage || !project?.id) return;

    const parameters = {
      image: displayImage,
      scale: data.scale ?? INITIAL_SCALE,
      face_enhance: data.face_enhance ?? INITIAL_FACE_ENHANCE,
    } as any;

    generateMutation.mutate(
      {
        canvasId: project.id,
        parameters,
        modelName: "real-esrgan",
        modelIdentifier: "nightmareai/real-esrgan",
        modelCredit: 1,
        modelProvider: "replicate",
      },
      {
        onSuccess: (res) => {
          updateNodeData(id, { activeJobId: res.jobId, status: "starting" });
        },
      },
    );
  }, [
    displayImage,
    project?.id,
    data.scale,
    data.face_enhance,
    generateMutation,
    updateNodeData,
    id,
  ]);

  const isGenerating = !!data.activeJobId;

  return (
    <NodeLayout
      id={id}
      selected={selected}
      title="Upscale"
      subtitle="Real-ESRGAN"
      minWidth={BASE_WIDTH}
      minHeight={BASE_WIDTH * aspectRatio}
      className="flex h-full w-full cursor-default flex-col rounded-3xl bg-[#1D1D1D]"
      handles={[
        { type: "target", position: Position.Left },
        { type: "source", position: Position.Right },
      ]}
      toolbarType="upscale"
      keepAspectRatio={true}
    >
      <div className="relative h-full w-full flex-1 overflow-hidden rounded-3xl">
        {/* Dimensions Badge */}
        {data?.outputImages?.[0]?.width && data?.outputImages?.[0]?.height && (
          <div className="pointer-events-none absolute bottom-2 left-2 z-10 flex justify-center">
            <span className="rounded-full border border-white/10 bg-black/50 px-2 py-1 font-mono text-[10px] font-medium text-white/50 backdrop-blur-md">
              {data.outputImages[0].width}x{data.outputImages[0].height}
            </span>
          </div>
        )}

        {displayImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={displayImage}
            alt="Upscale Input/Output"
            className="h-full w-full rounded-3xl object-cover"
            draggable={false}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#0A0A0A] via-black to-[#0A0A0A]">
            <div className="flex flex-col items-center gap-4 text-gray-500">
              <div className="rounded-full bg-white/5 p-6">
                <svg className="size-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-400">No Image Connected</p>
                <p className="mt-1 text-xs text-gray-600">Connect an image node to start</p>
              </div>
            </div>
          </div>
        )}

        {displayImage && (
          <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-b from-transparent via-transparent to-black/30" />
        )}

        {isGenerating && <ModernCardLoader text="Upscaling..." />}

        {/* Generate Button */}
        <button
          className={`absolute bottom-3 right-3 z-20 flex size-9 items-center justify-center rounded-full bg-accent text-black shadow-lg transition-all hover:scale-110 hover:shadow-xl ${
            (selected || isGenerating) && displayImage ? "opacity-100" : "opacity-0"
          }`}
          onClick={handleGenerate}
          disabled={isGenerating || !displayImage}
        >
          {isGenerating ? (
            <Loader2 size={18} className="animate-spin" />
          ) : data.outputImages && data.outputImages.length > 0 ? (
            <RefreshCw size={18} strokeWidth={3} />
          ) : (
            <ArrowUp size={18} strokeWidth={3} />
          )}
        </button>
      </div>
    </NodeLayout>
  );
});

UpscaleNode.displayName = "UpscaleNode";

export default UpscaleNode;
