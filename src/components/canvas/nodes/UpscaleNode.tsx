"use client";

import { Position, NodeProps, Node, useReactFlow } from "@xyflow/react";
import NodeLayout from "../NodeLayout";
import React, { useState, useEffect } from "react";
import { Maximize, Loader2 } from "lucide-react";
import { useSyncUpstreamData } from "@/src/utils/xyflow";
import { ModernCardLoader } from "@/src/components/ui/ModernCardLoader";
import { useGenerateAppImage } from "@/src/hooks/useGenerateAppImage";
import { createClient } from "@/src/lib/supabase/client";
import { NodeParam } from "@/src/types/BaseType";
import { useCanvas } from "../../providers/CanvasProvider";

export type UpscaleNodeData = {
  imageUrl?: string;
  inputImageUrls?: string[];
  width?: number;
  height?: number;
  activeJobId?: string;
  status?: string;
  appId?: string;
  [key: string]: unknown;
};

export type UpscaleNodeType = Node<UpscaleNodeData, "upscale">;

const BASE_WIDTH = 320;

const UpscaleNode = React.memo(({ id, data, selected }: NodeProps<UpscaleNodeType>) => {
  const { updateNodeData, updateNode } = useReactFlow();
  const [appId, setAppId] = useState<string | null>(data.appId || null);
  const [isLoadingApp, setIsLoadingApp] = useState(!data.appId);
  const { project } = useCanvas();

  useSyncUpstreamData(id, data);

  const { mutate: generateImage, isPending } = useGenerateAppImage();

  // Fetch the Image Upscaler app ID from database
  useEffect(() => {
    if (appId) return;

    const fetchAppId = async () => {
      try {
        const supabase = createClient();
        const { data: apps, error } = await supabase
          .from("ai_apps")
          .select("id")
          .ilike("app_name", "%upscal%")
          .limit(1);

        if (error) throw error;

        if (apps && apps.length > 0) {
          const fetchedAppId = apps[0].id;
          setAppId(fetchedAppId);
          updateNodeData(id, { appId: fetchedAppId });
        } else {
          console.error("Image Upscaler app not found in database");
        }
      } catch (error) {
        console.error("Error fetching upscaler app:", error);
      } finally {
        setIsLoadingApp(false);
      }
    };

    fetchAppId();
  }, [appId, id, updateNodeData]);

  // Update node dimensions based on image aspect ratio
  useEffect(() => {
    if (data.width && data.height) {
      const ratio = data.height / data.width;
      updateNode(id, {
        width: BASE_WIDTH,
        height: BASE_WIDTH * ratio,
      });
    }
  }, [data.width, data.height, id, updateNode]);

  const aspectRatio = data.width && data.height ? data.height / data.width : 1;
  const nodeHeight = BASE_WIDTH * aspectRatio;

  // Extract first image from inputImageUrls array (synced by useSyncUpstreamData)
  const inputImageUrl = data.inputImageUrls?.[0];
  const isGenerating = !!data.activeJobId;

  const handleUpscale = () => {
    if (!inputImageUrl || !appId || isGenerating) return;

    // Create parameters for the upscaler app
    const parameters: NodeParam[] = [
      {
        nodeId: id,
        fieldName: "image",
        fieldValue: inputImageUrl,
        description: "Input image to upscale",
      },
    ];

    generateImage(
      {
        appId,
        parameters,
        inputMediaStoreUrls: [inputImageUrl], // Required for database storage
        inputImagePreviewUrls: [inputImageUrl], // Required for optimistic UI updates
        canvasId: project?.id, // Required for job orchestration tracking
      },
      {
        onSuccess: (res) => {
          updateNodeData(id, { activeJobId: res.jobId, status: "starting" });
        },
        onError: (error) => {
          console.error("Upscale failed:", error);
          updateNodeData(id, { status: "error" });
        },
      }
    );
  };

  return (
    <NodeLayout
      selected={selected}
      title="Image Upscaler"
      subtitle="AI Enhancement"
      minWidth={BASE_WIDTH}
      minHeight={nodeHeight}
      keepAspectRatio={true}
      className="flex h-full w-full cursor-default flex-col rounded-3xl bg-[#1D1D1D]"
      handles={[
        { type: "target", position: Position.Left },
        { type: "source", position: Position.Right },
      ]}
    >
      <div className="relative h-full w-full flex-1 overflow-hidden rounded-3xl">
        {data.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={data.imageUrl}
            alt="Upscaled Image"
            className="h-full w-full rounded-3xl object-cover"
            draggable={false}
          />
        ) : inputImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={inputImageUrl}
            alt="Input Image"
            className="h-full w-full rounded-3xl object-cover opacity-60"
            draggable={false}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-blue-900/20 to-purple-900/20">
            <Maximize size={48} className="mb-3 text-blue-400/50" />
            <p className="text-sm font-medium text-white/40">Connect an image to upscale</p>
          </div>
        )}

        {/* Overlay gradient */}
        {(data.imageUrl || inputImageUrl) && (
          <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-b from-transparent via-transparent to-black/30" />
        )}

        {isGenerating && <ModernCardLoader text="Upscaling" />}
      </div>

      {/* Input image preview badge */}
      {inputImageUrl && !data.imageUrl && (
        <div className="absolute bottom-3 left-3 overflow-hidden rounded-xl border border-white/20 bg-black/40 shadow-lg backdrop-blur-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={inputImageUrl} alt="Input" className="size-12 object-cover" />
        </div>
      )}

      {/* Upscale button */}
      {inputImageUrl && !data.imageUrl && (
        <button
          className={`absolute bottom-3 right-3 flex items-center gap-2 rounded-full bg-blue-500 px-4 py-2 text-sm font-bold text-white shadow-lg transition-all hover:scale-105 hover:bg-blue-600 hover:shadow-xl active:scale-95 disabled:opacity-50 ${
            selected || isGenerating ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
          onClick={handleUpscale}
          disabled={isGenerating || isLoadingApp || !appId}
        >
          {isGenerating ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Upscaling...</span>
            </>
          ) : (
            <>
              <Maximize size={16} />
              <span>Upscale</span>
            </>
          )}
        </button>
      )}

      {/* Result indicator */}
      {data.imageUrl && (
        <div className="absolute bottom-3 right-3 rounded-full border border-green-500/30 bg-green-500/20 px-3 py-1.5 text-xs font-medium text-green-300 backdrop-blur-sm">
          ✓ Upscaled
        </div>
      )}
    </NodeLayout>
  );
});

export default UpscaleNode;
