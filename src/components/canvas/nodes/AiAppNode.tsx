"use client";

import { Position, NodeProps, Node, useReactFlow } from "@xyflow/react";
import { Sparkles, Loader2, Play, TriangleAlert, RefreshCw } from "lucide-react";
import React, { useState, useEffect } from "react";

import {
  AppSectionLabel,
  AppParamTextarea,
  AppParamSelect,
} from "@/src/components/ai-apps/AppFormComponents";
import { Label } from "@/src/components/ui/label";
import { ModernCardLoader } from "@/src/components/ui/ModernCardLoader";
import { AiApp, AiAppParameter } from "@/src/constants/aiApps";
import { useAiAppDetails } from "@/src/hooks/useAiAppDetails";
import { useGenerateCanvasImage } from "@/src/hooks/useGenerateCanvasImage";
import { NodeParam } from "@/src/types/BaseType";
import { useSyncUpstreamData } from "@/src/utils/xyflow";

import { useCanvas } from "../../providers/CanvasProvider";
import NodeLayout from "../NodeLayout";

export type AiAppNodeData = {
  imageUrl?: string;
  inputImageUrls?: string[];
  width?: number;
  height?: number;
  activeJobId?: string;
  status?: string;
  appData?: AiApp;
  outputImages?: any[];
  processedImagesHash?: string;
  parameterValues?: Record<string, any>;
  outputNodeIds?: string[]; // Track created output nodes for regeneration
  mainNodeId?: string; // Track which node is the main one (connected to AI app)
  hasGenerated?: boolean; // Track if generation has occurred
  [key: string]: unknown;
};

export type AiAppNodeType = Node<AiAppNodeData, "aiApp">;

const BASE_WIDTH = 320;
const GRID_GAP = 100; // Increased gap between output nodes
const OUTPUT_NODE_WIDTH = 350; // Estimated max width for output nodes

// Helper to parse parameters safely
const parseParameters = (appData: AiApp): AiAppParameter[] => {
  if (!appData.parameters) return [];
  try {
    if (typeof appData.parameters === "string") {
      return JSON.parse(appData.parameters);
    } else if (Array.isArray(appData.parameters)) {
      return appData.parameters;
    }
    return [];
  } catch (e) {
    console.error("Failed to parse parameters", e);
    return [];
  }
};

// Helper to detect if output is a video
const isVideoOutput = (imageUrl: string): boolean => {
  if (!imageUrl) return false;
  const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.mkv', '.m4v'];
  const lowerUrl = imageUrl.toLowerCase();
  return videoExtensions.some(ext => lowerUrl.includes(ext));
};

const AiAppNode = React.memo(({ id, data, selected }: NodeProps<AiAppNodeType>) => {
  const { updateNode, updateNodeData, addNodes, addEdges, getNode } = useReactFlow();
  const { project } = useCanvas();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useSyncUpstreamData(id, data);

  // Fetch full app details if missing (e.g. only ID/Name provided)
  const { data: fetchedAppData, isLoading: isFetchingApp } = useAiAppDetails(
    data.appData && !data.appData.parameters ? data.appData.id : undefined,
  );

  // Sync fetched data to node
  useEffect(() => {
    if (fetchedAppData) {
      updateNodeData(id, { appData: fetchedAppData });
    }
  }, [fetchedAppData, id, updateNodeData]);

  const generateMutation = useGenerateCanvasImage(project?.id || "");

  // Handle Multi-Image Output Logic
  useEffect(() => {
    if (!data.outputImages || data.outputImages.length === 0) {
      return;
    }

    // Extract actual image objects from the nested structure
    // API returns: [{ images: {...} }, { images: {...} }]
    // We need: [{...}, {...}]
    const images = (data.outputImages as any[])
      .map((item: any) => item.images || item)
      .filter(Boolean);

    if (images.length === 0) {
      return;
    }

    const imagesSignature = JSON.stringify(images.map((img: any) => img.id));

    if (data.processedImagesHash === imagesSignature) {
      return;
    }

    const currentNode = getNode(id);
    const currentX = currentNode?.position.x ?? 0;
    const currentY = currentNode?.position.y ?? 0;
    const currentWidth = currentNode?.measured?.width ?? BASE_WIDTH;

    // Check if this is a regeneration (output nodes already exist)
    const isRegeneration = data.outputNodeIds && data.outputNodeIds.length > 0;

    if (isRegeneration) {
      // REGENERATION: Update existing output nodes with new images
      // Re-identify the main image (it might have changed)
      let mainImage = images[0];
      let maxArea = 0;
      let mainImageIndex = 0;

      images.forEach((img, index) => {
        const area = (img.width || 0) * (img.height || 0);
        if (area > maxArea) {
          maxArea = area;
          mainImage = img;
          mainImageIndex = index;
        }
      });

      console.log('🔄 Regeneration - Main Image:', {
        index: mainImageIndex,
        dimensions: `${mainImage.width}×${mainImage.height}`,
        area: maxArea,
      });

      const existingNodeIds = data.outputNodeIds || [];
      const mainNodeId = data.mainNodeId;
      
      // Always update the main node (which is connected to AI app) with the largest image
      if (mainNodeId) {
        updateNodeData(mainNodeId, {
          imageUrl: mainImage.image_url,
          width: mainImage.width,
          height: mainImage.height,
        });
      }
      
      // Update other nodes with other images
      const otherImages = images.filter((_, index) => index !== mainImageIndex);
      let otherNodeIndex = 0;
      
      existingNodeIds.forEach((nodeId) => {
        // Skip the main node, we already updated it
        if (nodeId === mainNodeId) return;
        
        // Update this node with the next other image
        if (otherImages[otherNodeIndex]) {
          updateNodeData(nodeId, {
            imageUrl: otherImages[otherNodeIndex].image_url,
            width: otherImages[otherNodeIndex].width,
            height: otherImages[otherNodeIndex].height,
          });
          otherNodeIndex++;
        }
      });

      // Update processed hash
      updateNodeData(id, {
        processedImagesHash: imagesSignature,
      });
    } else {
      // FIRST GENERATION: Create new output nodes for ALL images
      // Find the main image (largest area)
      let mainImage = images[0];
      let maxArea = 0;
      let mainImageIndex = 0;

      images.forEach((img, index) => {
        const area = (img.width || 0) * (img.height || 0);
        if (area > maxArea) {
          maxArea = area;
          mainImage = img;
          mainImageIndex = index;
        }
      });

      console.log('🎯 Main Image Identified:', {
        index: mainImageIndex,
        dimensions: `${mainImage.width}×${mainImage.height}`,
        area: maxArea,
        url: mainImage.image_url,
        totalImages: images.length
      });

      // Separate main image from others
      const otherImages = images.filter((_, index) => index !== mainImageIndex);

      const newNodes: any[] = [];
      const newEdges: any[] = [];
      const outputNodeIds: string[] = [];
      const startX = currentX + currentWidth + 100;

      // 1. Create the MAIN output node first
      const mainNodeId = crypto.randomUUID();
      outputNodeIds[mainImageIndex] = mainNodeId;

      // Determine node type based on output format
      const isVideo = isVideoOutput(mainImage.image_url);
      
      newNodes.push({
        id: mainNodeId,
        type: isVideo ? "generateVideo" : "outputImage",
        position: { x: startX, y: currentY },
        data: {
          imageUrl: mainImage.image_url,
          videoUrl: isVideo ? mainImage.image_url : undefined,
          width: mainImage.width,
          height: mainImage.height,
        },
      });

      // Connect AI app node to main image
      newEdges.push({
        id: `e-${id}-${mainNodeId}`,
        source: id,
        target: mainNodeId,
        type: "active",
        style: { stroke: "#4b5563", strokeWidth: 2 },
      });

      // 2. Create OTHER output nodes in a grid layout
      // Position them to the right of the main image
      const otherStartX = startX + OUTPUT_NODE_WIDTH + 200; // More space after main image

      otherImages.forEach((img, relativeIndex) => {
        const newNodeId = crypto.randomUUID();
        
        // Find the original index to maintain order
        let originalIndex = 0;
        for (let i = 0, count = 0; i < images.length; i++) {
          if (i === mainImageIndex) continue;
          if (count === relativeIndex) {
            originalIndex = i;
            break;
          }
          count++;
        }
        outputNodeIds[originalIndex] = newNodeId;

        const colIndex = relativeIndex % 4;
        const rowIndex = Math.floor(relativeIndex / 4);
        const xOffset = colIndex * (OUTPUT_NODE_WIDTH + GRID_GAP);
        const yOffset = rowIndex * (450 + GRID_GAP); // Increased row height for better spacing

        // Determine node type for other outputs
        const isOtherVideo = isVideoOutput(img.image_url);
        
        newNodes.push({
          id: newNodeId,
          type: isOtherVideo ? "generateVideo" : "outputImage",
          position: { x: otherStartX + xOffset, y: currentY + yOffset },
          data: {
            imageUrl: img.image_url,
            videoUrl: isOtherVideo ? img.image_url : undefined,
            width: img.width,
            height: img.height,
          },
        });

        // Connect OTHER images to MAIN image (not to AI app node)
        newEdges.push({
          id: `e-${mainNodeId}-${newNodeId}`,
          source: mainNodeId,
          target: newNodeId,
          type: "active",
          style: { stroke: "#4b5563", strokeWidth: 2 },
        });
      });

      addNodes(newNodes);
      addEdges(newEdges);

      // Update AI app node with tracking data (but NOT with imageUrl)
      updateNodeData(id, {
        processedImagesHash: imagesSignature,
        outputNodeIds: outputNodeIds,
        mainNodeId: mainNodeId, // Store which node is the main one
        hasGenerated: true,
      });
    }
  }, [
    data.outputImages,
    data.processedImagesHash,
    data.outputNodeIds,
    id,
    updateNodeData,
    addNodes,
    addEdges,
    getNode,
  ]);

  const appData = data.appData;

  useEffect(() => {
    if (appData && !data.parameterValues) {
      const params = parseParameters(appData);
      const initialValues: Record<string, any> = {};
      params.forEach((p) => {
        if (p.fieldValue) initialValues[p.description] = p.fieldValue;
      });
      if (Object.keys(initialValues).length > 0) {
        updateNodeData(id, { parameterValues: initialValues });
      }
    }
  }, [appData, data.parameterValues, id, updateNodeData]);

  const handleParamChange = (key: string, value: any) => {
    const currentValues = data.parameterValues || {};
    updateNodeData(id, {
      parameterValues: {
        ...currentValues,
        [key]: value,
      },
    });
  };

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

  const inputImageUrl = data.inputImageUrls?.[0];
  const secondImageUrl = data.inputImageUrls?.[1];
  const isGenerating = !!data.activeJobId;

  const handleGenerate = () => {
    if (!inputImageUrl || !appData || isGenerating) return;

    try {
      const appParams = parseParameters(appData);
      const isPoseTransfer = appData.app_name.includes("Pose transfer");

      const missingFields: string[] = [];
      const currentValues = data.parameterValues || {};

      appParams.forEach((p) => {
        if (p.fieldName === "image") return;
        if (p.fieldName === "doodle" && isPoseTransfer) return;
        if (
          (p.fieldName === "prompt" || p.fieldName === "text" || p.fieldName === "select") &&
          !currentValues[p.description]
        ) {
          if (!p.fieldValue) missingFields.push(p.description);
        }
      });

      if (isPoseTransfer && !secondImageUrl) {
        missingFields.push("Doodle/Pose Image");
      }

      if (missingFields.length > 0) {
        setValidationError(`Please fill in: ${missingFields.join(", ")}`);
        return;
      }
      setValidationError(null);

      const parameters: NodeParam[] = appParams.map((p) => {
        if (p.fieldName === "image") {
          return {
            nodeId: p.nodeId,
            fieldName: p.fieldName,
            fieldValue: inputImageUrl,
            description: p.description,
          };
        }

        if (p.fieldName === "doodle" && isPoseTransfer) {
          return {
            nodeId: p.nodeId,
            fieldName: p.fieldName,
            fieldValue: secondImageUrl || "",
            description: p.description,
          };
        }

        return {
          nodeId: p.nodeId,
          fieldName: p.fieldName,
          fieldValue: currentValues[p.description] || p.fieldValue || "",
          description: p.description,
        };
      });

      generateMutation.mutate(
        {
          canvasId: project?.id || "",
          parameters,
          modelName: appData.app_name,
          modelIdentifier: appData.webappId || "",
          modelCredit: appData.cost ?? null,
          modelProvider: "running_hub",
        },
        {
          onSuccess: (res) => {
            updateNodeData(id, { activeJobId: res.jobId, status: "starting" });
          },
        },
      );
    } catch (e) {
      console.error("Failed to parse app parameters or generate", e);
    }
  };

  if (!appData && !isFetchingApp) {
    return (
      <NodeLayout
        selected={selected}
        title="AI App"
        minWidth={BASE_WIDTH}
        minHeight={nodeHeight}
        className="flex size-full cursor-default flex-col rounded-3xl bg-[#1D1D1D] p-4"
      >
        <div className="flex h-full items-center justify-center text-sm text-zinc-500">
          No app data
        </div>
      </NodeLayout>
    );
  }

  const isPartialData = appData && !appData.parameters;

  if (isFetchingApp || !appData || isPartialData) {
    return (
      <NodeLayout
        selected={selected}
        title={appData?.app_name || "Loading App..."}
        minWidth={BASE_WIDTH}
        minHeight={nodeHeight}
        className="flex size-full cursor-default flex-col rounded-3xl bg-[#1D1D1D]"
      >
        <div className="relative size-full flex-1 overflow-hidden rounded-3xl">
          <ModernCardLoader text="Loading App Details..." />
        </div>
      </NodeLayout>
    );
  }

  const isVideoCover = appData.cover_image?.endsWith(".mp4");
  const isPoseTransfer = appData.app_name.includes("Pose transfer");
  const durationVal = Number(appData.duration || 0);

  return (
    <NodeLayout
      selected={selected}
      title={appData.app_name}
      subtitle={
        appData?.description
          ? appData.description.slice(0, 30) + (appData.description.length > 30 ? "..." : "")
          : ""
      }
      minWidth={BASE_WIDTH}
      minHeight={nodeHeight}
      keepAspectRatio={true}
      className={`flex h-auto w-full cursor-default flex-col rounded-3xl transition-colors duration-200 ${
        inputImageUrl ? "bg-[#1D1D1D]" : "border border-zinc-800 bg-[#141414]"
      }`}
      handles={[
        { type: "target", position: Position.Left },
        { type: "source", position: Position.Right },
      ]}
      toolbarHidden={true}
    >
      <div className="relative flex h-auto flex-1 flex-col overflow-hidden rounded-3xl">
        <div className="relative flex h-auto w-full flex-col overflow-hidden bg-[#141414]">
          {/* Modern Header Section */}
          <div className="relative h-[240px] w-full shrink-0 overflow-hidden">
            {isVideoCover ? (
              <video
                src={appData.cover_image}
                className="size-full object-cover"
                autoPlay
                muted
                loop
                playsInline
              />
            ) : (
              <img src={appData.cover_image} alt="Cover" className="size-full object-cover" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/10 to-transparent" />

            <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-6">
              <h3 className="text-3xl font-bold leading-tight tracking-tight text-white">
                {appData.app_name}
              </h3>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 rounded-full border border-zinc-800 bg-[#1A1A1A]/80 px-3.5 py-1 backdrop-blur-md">
                  <span className="text-xs font-semibold text-zinc-300">
                    {appData.cost} credit
                  </span>
                </div>
                <div className="flex items-center gap-1.5 rounded-full border border-zinc-800 bg-[#1A1A1A]/80 px-3.5 py-1 backdrop-blur-md">
                  <span className="text-xs font-semibold text-zinc-300">
                    {durationVal >= 60
                      ? `${Math.floor(durationVal / 60)} mins`
                      : `${durationVal}s`}
                  </span>
                </div>
                {/* Generation Status Badge */}
                {data.hasGenerated && (
                  <div className="flex items-center gap-1.5 rounded-full border border-green-500/30 bg-green-500/20 px-3.5 py-1 backdrop-blur-md">
                    <span className="text-xs font-semibold text-green-300">
                      ✓ Generated
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex min-h-0 flex-1 flex-col gap-4 p-5">
            {/* Image Input Section */}
            {parseParameters(appData).some((p) => p.fieldName === "image") &&
              (isPoseTransfer ? (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <Label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                      Model Image
                    </Label>
                    {inputImageUrl ? (
                      <div className="group relative h-40 w-full shrink-0 overflow-hidden rounded-2xl border border-zinc-800 bg-[#111] shadow-xl">
                        <img
                          src={inputImageUrl}
                          alt="Model"
                          className="size-full object-contain"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                          <span className="rounded-full border border-white/10 bg-black/60 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
                            Model Connected
                          </span>
                        </div>
                        <div className="absolute bottom-3 left-3 rounded-full border border-green-500/30 bg-green-500/20 px-2.5 py-1 text-[10px] font-bold text-green-400 backdrop-blur-md">
                          Ready
                        </div>
                      </div>
                    ) : (
                      <div className="group relative flex h-20 shrink-0 items-center gap-4 rounded-2xl border-2 border-dashed border-zinc-800 bg-[#1A1A1A]/30 px-5 transition-all hover:border-zinc-700 hover:bg-zinc-800/40">
                        <div className="flex size-10 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-500 shadow-xl transition-all group-hover:scale-105 group-hover:bg-zinc-700 group-hover:text-zinc-300">
                          <Sparkles size={18} className="opacity-50" />
                        </div>
                        <div className="flex flex-col">
                          <p className="text-xs font-bold text-zinc-400 transition-colors group-hover:text-zinc-200">
                            Connect Model
                          </p>
                          <p className="text-[10px] text-zinc-600">Connect model image node</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                      Doodle / Pose
                    </Label>
                    {secondImageUrl ? (
                      <div className="group relative h-40 w-full shrink-0 overflow-hidden rounded-2xl border border-zinc-800 bg-[#111] shadow-xl">
                        <img
                          src={secondImageUrl}
                          alt="Doodle"
                          className="size-full object-contain"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                          <span className="rounded-full border border-white/10 bg-black/60 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
                            Pose Connected
                          </span>
                        </div>
                        <div className="absolute bottom-3 left-3 rounded-full border border-green-500/30 bg-green-500/20 px-2.5 py-1 text-[10px] font-bold text-green-400 backdrop-blur-md">
                          Ready
                        </div>
                      </div>
                    ) : (
                      <div className="group relative flex h-20 shrink-0 items-center gap-4 rounded-2xl border-2 border-dashed border-zinc-800 bg-[#1A1A1A]/30 px-5 transition-all hover:border-zinc-700 hover:bg-zinc-800/40">
                        <div className="flex size-10 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-500 shadow-xl transition-all group-hover:scale-105 group-hover:bg-zinc-700 group-hover:text-zinc-300">
                          <Play size={18} className="opacity-50" />
                        </div>
                        <div className="flex flex-col">
                          <p className="text-xs font-bold text-zinc-400 transition-colors group-hover:text-zinc-200">
                            Connect Pose
                          </p>
                          <p className="text-[10px] text-zinc-600">Connect pose image node</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : inputImageUrl ? (
                <div className="group relative h-44 w-full shrink-0 overflow-hidden rounded-2xl border border-zinc-800 bg-[#111] shadow-2xl">
                  <img src={inputImageUrl} alt="Input" className="size-full object-contain" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                    <span className="rounded-full border border-white/10 bg-black/60 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white backdrop-blur-md">
                      Connected Input
                    </span>
                  </div>
                  <div className="absolute bottom-3 right-3 rounded-full border border-[#CCFF00]/20 bg-[#CCFF00]/10 px-3 py-1 text-[10px] font-bold text-[#CCFF00] backdrop-blur-md">
                    Active Input
                  </div>
                </div>
              ) : (
                <div className="group relative flex h-28 shrink-0 items-center gap-5 rounded-2xl border-2 border-dashed border-zinc-800 bg-[#1A1A1A]/30 px-6 transition-all duration-300 hover:border-zinc-600 hover:bg-[#1A1A1A]/50 hover:shadow-lg">
                  <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-zinc-800 bg-[#141414] text-zinc-500 shadow-2xl transition-all group-hover:scale-105 group-hover:border-zinc-700 group-hover:bg-[#1D1D1D] group-hover:text-zinc-300">
                    <Sparkles
                      size={24}
                      className="opacity-40 transition-opacity group-hover:opacity-100"
                    />
                  </div>
                  <div className="flex flex-col">
                    <p className="text-[15px] font-bold text-zinc-300 transition-colors group-hover:text-white">
                      Connect input image
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-zinc-500">
                      Connect an image node to
                      <br />
                      enable generation
                    </p>
                  </div>
                </div>
              ))}

            {/* Dynamic Parameters */}
            <div className="flex flex-col gap-4">
              {parseParameters(appData).map((param) => {
                const key = param.description;
                const currentValue = data.parameterValues?.[key] ?? param.fieldValue ?? "";
                if (
                  param.fieldName === "image" ||
                  param.fieldName === "video" ||
                  (isPoseTransfer && param.fieldName === "doodle")
                )
                  return null;
                if (
                  ["aspect_ratio", "size", "select", "model_selected"].includes(
                    param.fieldName,
                  ) ||
                  param.description === "Portrait or landscape mode"
                )
                  return null;

                return (
                  <div key={key} className="flex flex-col gap-2.5">
                    <AppSectionLabel text={param.description} />
                    <AppParamTextarea
                      value={currentValue}
                      onChange={(val) => handleParamChange(key, val)}
                      placeholder={`Type your ${param.description.toLowerCase()}...`}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {validationError && (
            <div className="px-6 pb-2">
              <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
                <TriangleAlert size={14} className="shrink-0" />
                <span className="leading-tight">{validationError}</span>
              </div>
            </div>
          )}

          {/* Bottom Action Bar */}
          <div className="flex items-center gap-3 p-6 pt-0">
            <div className="custom-scrollbar no-scrollbar flex flex-1 items-center gap-2 overflow-x-auto">
              {parseParameters(appData)
                .filter(
                  (p) =>
                    ["aspect_ratio", "size", "select", "model_selected"].includes(p.fieldName) ||
                    p.description === "Portrait or landscape mode",
                )
                .map((param) => {
                  const key = param.description;
                  const currentValue = data.parameterValues?.[key] ?? param.fieldValue ?? "";
                  let options: string[] = [];
                  try {
                    if (param.fieldData) {
                      const parsed = JSON.parse(param.fieldData);
                      options = parsed[0] || [];
                    } else if (param.description === "Portrait or landscape mode") {
                      options = ["1", "2"];
                    }
                  } catch (e) {
                    /* ignore */
                  }

                  return (
                    <AppParamSelect
                      key={key}
                      value={currentValue}
                      onValueChange={(val) => handleParamChange(key, val)}
                      placeholder={param.description}
                      options={
                        param.description === "Portrait or landscape mode" && options.length === 2
                          ? [
                              { label: "Vertical", value: "1" },
                              { label: "Landscape", value: "2" },
                            ]
                          : options.map((opt) => ({ label: opt, value: opt }))
                      }
                    />
                  );
                })}
            </div>

            <button
              className={`flex h-11 shrink-0 items-center justify-center gap-2 rounded-2xl bg-[#CCFF00] px-8 text-sm font-bold text-black shadow-[0_0_20px_rgba(204,255,0,0.2)] transition-all hover:scale-[1.05] hover:bg-[#DDFF33] active:scale-95 disabled:opacity-50 disabled:grayscale`}
              onClick={handleGenerate}
              disabled={
                isGenerating ||
                (parseParameters(appData).some((p) => p.fieldName === "image") && !inputImageUrl)
              }
            >
              {isGenerating ? (
                <Loader2 size={18} className="animate-spin" />
              ) : data.hasGenerated ? (
                <>
                  <RefreshCw size={16} />
                  <span>Regenerate</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Generate</span>
                </>
              )}
            </button>
          </div>
        </div>
        {isGenerating && <ModernCardLoader text="Generating..." />}
      </div>
    </NodeLayout>
  );
});

AiAppNode.displayName = "AiAppNode";

export default AiAppNode;