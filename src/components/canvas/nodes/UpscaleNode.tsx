import { Position, NodeProps, Node, useReactFlow } from "@xyflow/react";
import NodeLayout from "../NodeLayout";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { ArrowUp, Loader2 } from "lucide-react";
import { useSyncUpstreamData } from "@/src/utils/xyflow";
import { ModernCardLoader } from "@/src/components/ui/ModernCardLoader";
import { useGenerateCanvasImage } from "@/src/hooks/useGenerateCanvasImage";
import { useCanvas } from "../../providers/CanvasProvider";
import { Slider } from "@/src/components/ui/slider";
import { Switch } from "@/src/components/ui/switch";

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

  const [scale, setScale] = useState(data.scale ?? INITIAL_SCALE);
  const [faceEnhance, setFaceEnhance] = useState(data.face_enhance ?? INITIAL_FACE_ENHANCE);

  // Sync external data changes to local state (e.g. Undo/Redo)
  useEffect(() => {
    if (data.scale !== undefined && data.scale !== scale) {
      setScale(data.scale);
    }
  }, [data.scale]);

  useEffect(() => {
    if (data.face_enhance !== undefined && data.face_enhance !== faceEnhance) {
      setFaceEnhance(data.face_enhance);
    }
  }, [data.face_enhance]);

  // Push local state changes to data (Scale is debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (scale !== data.scale) {
        updateNodeData(id, { scale });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [scale, data.scale, updateNodeData, id]);

  useEffect(() => {
    if (faceEnhance !== data.face_enhance) {
      updateNodeData(id, { face_enhance: faceEnhance });
    }
  }, [faceEnhance, data.face_enhance, updateNodeData, id]);

  const inputImages = data.inputImageUrls || [];
  // Use either the explicitly set imageUrl (from prev generation) or the first input image from upstream
  const displayImage = data.imageUrl || (inputImages.length > 0 ? inputImages[0] : undefined);

  // --- RESIZE LOGIC (Simplified from OutputImage) ---
  const aspectRatio = useMemo(() => {
    // If we have an output image with dimensions, use that
    const outputImg = data.outputImages?.[0];
    if (outputImg?.width && outputImg?.height) {
      return outputImg.height / outputImg.width;
    }
    // Default 1:1 if we have an image but don't know dimensions, or just generic box
    return 1.0;
  }, [data.outputImages]);

  const targetHeight = BASE_WIDTH * aspectRatio + 200; // + control space

  useEffect(() => {
    const currentWidth = data.width;
    const currentHeight = data.height;

    // Only update if mismatch is significant
    if (
      !currentWidth ||
      Math.abs(currentWidth - BASE_WIDTH) > 1 ||
      !currentHeight ||
      Math.abs(currentHeight - targetHeight) > 10
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
      scale: scale,
      face_enhance: faceEnhance,
    };

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
  }, [displayImage, project?.id, scale, faceEnhance, generateMutation, updateNodeData, id]);

  const isGenerating = !!data.activeJobId;

  return (
    <NodeLayout
      id={id}
      selected={selected}
      title="Upscale"
      subtitle="Real-ESRGAN"
      minWidth={BASE_WIDTH}
      minHeight={targetHeight}
      className="flex h-full w-full cursor-default flex-col rounded-3xl bg-[#1D1D1D]"
      handles={[
        { type: "target", position: Position.Left },
        { type: "source", position: Position.Right },
      ]}
    >
      <div
        className="relative flex-1 overflow-hidden rounded-3xl bg-black/20"
        style={{ minHeight: "300px" }}
      >
        {displayImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={displayImage}
            alt="Upscale Input/Output"
            className="h-full w-full object-contain"
            draggable={false}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-500">
            Connect an image to upscale
          </div>
        )}

        {isGenerating && <ModernCardLoader text="Upscaling..." />}
      </div>

      {/* Controls */}
      <div className="space-y-4 rounded-b-3xl bg-[#1D1D1D] p-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-white">
            <span>Scale</span>
            <span className="font-mono text-accent">{scale}x</span>
          </div>
          <Slider
            value={[scale]}
            min={0}
            max={10}
            step={1}
            onValueChange={(vals) => setScale(vals[0])}
            className="py-2"
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-white">Face Enhance</span>
          <div className="h-8">
            <Switch
              checked={faceEnhance}
              onCheckedChange={setFaceEnhance}
              title="Face Enhance"
              className="h-8"
            />
          </div>
        </div>
      </div>

      <button
        className={`absolute bottom-3 right-3 flex size-8 items-center justify-center rounded-full bg-accent text-black shadow-lg transition-all hover:scale-110 hover:shadow-xl ${
          (selected || isGenerating) && displayImage ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleGenerate}
        disabled={isGenerating || !displayImage}
      >
        {isGenerating ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <ArrowUp size={18} strokeWidth={3} />
        )}
      </button>
    </NodeLayout>
  );
});

UpscaleNode.displayName = "UpscaleNode";

export default UpscaleNode;
