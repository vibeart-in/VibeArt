"use client";

import { Position, NodeProps, Node, useReactFlow } from "@xyflow/react";
import NodeLayout from "../NodeLayout";
import React, { useState, useEffect } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { useSyncUpstreamData } from "@/src/utils/xyflow";
import { ModernCardLoader } from "@/src/components/ui/ModernCardLoader";
import { useGenerateAppImage } from "@/src/hooks/useGenerateAppImage";
import { createClient } from "@/src/lib/supabase/client";
import { NodeParam } from "@/src/types/BaseType";
import { useCanvas } from "../../providers/CanvasProvider";

export type AnimeToRealNodeData = {
  imageUrl?: string;
  inputImageUrls?: string[];
  width?: number;
  height?: number;
  activeJobId?: string;
  status?: string;
  appId?: string;
  [key: string]: unknown;
};

export type AnimeToRealNodeType = Node<AnimeToRealNodeData, "animeToReal">;

const BASE_WIDTH = 320;

const AnimeToRealNode = React.memo(({ id, data, selected }: NodeProps<AnimeToRealNodeType>) => {
  const { updateNodeData, updateNode } = useReactFlow();
  const [appId, setAppId] = useState<string | null>(data.appId || null);
  const [isLoadingApp, setIsLoadingApp] = useState(!data.appId);
  const { project } = useCanvas();

  useSyncUpstreamData(id, data);

  const { mutate: generateImage, isPending } = useGenerateAppImage();

  // Fetch the Anime to Real app ID from database
  useEffect(() => {
    if (appId) return;

    const fetchAppId = async () => {
      try {
        const supabase = createClient();
        const { data: apps, error } = await supabase
          .from("ai_apps")
          .select("id")
          .ilike("app_name", "%anime%real%")
          .limit(1);

        if (error) throw error;

        if (apps && apps.length > 0) {
          const fetchedAppId = apps[0].id;
          setAppId(fetchedAppId);
          updateNodeData(id, { appId: fetchedAppId });
        } else {
          console.error("Anime to Real app not found in database");
        }
      } catch (error) {
        console.error("Error fetching anime to real app:", error);
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

  const handleConvert = () => {
    if (!inputImageUrl || !appId || isGenerating) return;

    // Create parameters for the anime to real app
    const parameters: NodeParam[] = [
      {
        nodeId: id,
        fieldName: "image",
        fieldValue: inputImageUrl,
        description: "Anime image to convert",
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
          console.error("Conversion failed:", error);
          updateNodeData(id, { status: "error" });
        },
      }
    );
  };

  return (
    <NodeLayout
      selected={selected}
      title="Anime to Real"
      subtitle="AI Conversion"
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
            alt="Realistic Image"
            className="h-full w-full rounded-3xl object-cover"
            draggable={false}
          />
        ) : inputImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={inputImageUrl}
            alt="Anime Input"
            className="h-full w-full rounded-3xl object-cover opacity-60"
            draggable={false}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-purple-900/20 to-pink-900/20">
            <Sparkles size={48} className="mb-3 text-purple-400/50" />
            <p className="text-sm font-medium text-white/40">Connect anime image</p>
          </div>
        )}

        {/* Overlay gradient */}
        {(data.imageUrl || inputImageUrl) && (
          <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-b from-transparent via-transparent to-black/30" />
        )}

        {isGenerating && <ModernCardLoader text="Converting" />}
      </div>

      {/* Input image preview badge */}
      {inputImageUrl && !data.imageUrl && (
        <div className="absolute bottom-3 left-3 overflow-hidden rounded-xl border border-white/20 bg-black/40 shadow-lg backdrop-blur-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={inputImageUrl} alt="Anime Input" className="size-12 object-cover" />
        </div>
      )}

      {/* Convert button */}
      {inputImageUrl && !data.imageUrl && (
        <button
          className={`absolute bottom-3 right-3 flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 text-sm font-bold text-white shadow-lg transition-all hover:scale-105 hover:from-purple-600 hover:to-pink-600 hover:shadow-xl active:scale-95 disabled:opacity-50 ${
            selected || isGenerating ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
          onClick={handleConvert}
          disabled={isGenerating || isLoadingApp || !appId}
        >
          {isGenerating ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Converting...</span>
            </>
          ) : (
            <>
              <Sparkles size={16} />
              <span>Convert to Real</span>
            </>
          )}
        </button>
      )}

      {/* Result indicator */}
      {data.imageUrl && (
        <div className="absolute bottom-3 right-3 rounded-full border border-purple-500/30 bg-purple-500/20 px-3 py-1.5 text-xs font-medium text-purple-300 backdrop-blur-sm">
          ✓ Converted
        </div>
      )}
    </NodeLayout>
  );
});

export default AnimeToRealNode;
