"use client";

import { Position, NodeProps, Node, useReactFlow } from "@xyflow/react";
import NodeLayout from "../NodeLayout";
import React, { useState, useEffect } from "react";
import { Sparkles, Loader2, Play, TriangleAlert } from "lucide-react";
import { useSyncUpstreamData } from "@/src/utils/xyflow";
import { ModernCardLoader } from "@/src/components/ui/ModernCardLoader";
import { NodeParam } from "@/src/types/BaseType";
import { useCanvas } from "../../providers/CanvasProvider";
import { useGenerateCanvasImage } from "@/src/hooks/useGenerateCanvasImage";
import { AiApp, AiAppParameter } from "@/src/constants/aiApps";
import { Switch } from "@/src/components/ui/switch";
import AnimatedCounter from "@/src/components/ui/AnimatedCounter";
import { getIconForParam } from "@/src/utils/server/utils";
import { Label } from "@/src/components/ui/label";
import { AppParameterRenderer } from "@/src/components/ai-apps/AppFormComponents";

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
  [key: string]: unknown;
};

export type AiAppNodeType = Node<AiAppNodeData, "aiApp">;

const BASE_WIDTH = 320;
const GRID_GAP = 50;
const OUTPUT_NODE_WIDTH = 300;

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

import { useAiAppDetails } from "@/src/hooks/useAiAppDetails";

const AiAppNode = React.memo(({ id, data, selected }: NodeProps<AiAppNodeType>) => {
  const { updateNode, updateNodeData, addNodes, addEdges, getNode } = useReactFlow();
  const { project } = useCanvas();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useSyncUpstreamData(id, data);
  
  // Fetch full app details if missing (e.g. only ID/Name provided)
  const { data: fetchedAppData, isLoading: isFetchingApp } = useAiAppDetails(
    data.appData && !data.appData.parameters ? data.appData.id : undefined
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

    const imagesSignature = JSON.stringify(data.outputImages.map((img: any) => img.id));

    if (data.processedImagesHash === imagesSignature) {
        return;
    }

    const images = data.outputImages as any[];
    
    let mainImage = images[0];
    let maxArea = 0;
    
    images.forEach(img => {
        const area = (img.width || 0) * (img.height || 0);
        if (area > maxArea) {
            maxArea = area;
            mainImage = img;
        }
    });

    const updates: Partial<AiAppNodeData> = {
        processedImagesHash: imagesSignature,
    };

    if (
        data.imageUrl !== mainImage.image_url || 
        data.width !== mainImage.width || 
        data.height !== mainImage.height
    ) {
        updates.imageUrl = mainImage.image_url;
        updates.width = mainImage.width; 
        updates.height = mainImage.height;
    }

    const remainingImages = images.filter(img => img.id !== mainImage.id);
    
    if (remainingImages.length > 0) {
        const currentNode = getNode(id);
        const currentX = currentNode?.position.x ?? 0;
        const currentY = currentNode?.position.y ?? 0;
        const currentWidth = currentNode?.measured?.width ?? BASE_WIDTH;
        
        const newNodes: any[] = [];
        const newEdges: any[] = [];
        const startX = currentX + currentWidth + 100;
        
        remainingImages.forEach((img, index) => {
            const newNodeId = crypto.randomUUID();
            const colIndex = index % 4;
            const rowIndex = Math.floor(index / 4);
            const xOffset = colIndex * (OUTPUT_NODE_WIDTH + GRID_GAP);
            const yOffset = rowIndex * (400 + GRID_GAP);

            const xPos = startX + xOffset;
            const yPos = currentY + yOffset;

            newNodes.push({
                id: newNodeId,
                type: "outputImage", 
                position: { x: xPos, y: yPos },
                data: {
                    imageUrl: img.image_url,
                    width: img.width,
                    height: img.height
                },
            });

            newEdges.push({
                id: `e-${id}-${newNodeId}`,
                source: id,
                target: newNodeId,
                type: 'active',
                style: { stroke: "#4b5563", strokeWidth: 2 },
            });
        });

        addNodes(newNodes);
        addEdges(newEdges);
    }
    
    updateNodeData(id, updates);
  }, [data.outputImages, data.processedImagesHash, data.imageUrl, id, updateNodeData, addNodes, addEdges, getNode]);

  const appData = data.appData;
  
  useEffect(() => {
    if (appData && !data.parameterValues) {
        const params = parseParameters(appData);
        const initialValues: Record<string, any> = {};
        params.forEach(p => {
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
            [key]: value
        } 
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

      appParams.forEach(p => {
          if (p.fieldName === 'image') return;
          if (p.fieldName === 'doodle' && isPoseTransfer) return;
          if ((p.fieldName === 'prompt' || p.fieldName === 'text' || p.fieldName === 'select') && !currentValues[p.description]) {
             if (!p.fieldValue) missingFields.push(p.description);
          }
      });

      if (isPoseTransfer && !secondImageUrl) {
          missingFields.push("Doodle/Pose Image");
      }

      if (missingFields.length > 0) {
          setValidationError(`Please fill in: ${missingFields.join(', ')}`);
          return;
      }
      setValidationError(null);

      let imageIndex = 0;
      const parameters: NodeParam[] = appParams.map(p => {
        if (p.fieldName === "image") {
          const value = data.inputImageUrls?.[imageIndex] || "";
          imageIndex++;
          return {
            nodeId: p.nodeId,
            fieldName: p.fieldName,
            fieldValue: value,
            description: p.description
          };
        }
        
        return {
          nodeId: p.nodeId,
          fieldName: p.fieldName,
          fieldValue: currentValues[p.description] || p.fieldValue || "",
          description: p.description
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
        }
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
        className="flex h-full w-full cursor-default flex-col rounded-3xl bg-[#1D1D1D] p-4"
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
            className="flex h-full w-full cursor-default flex-col rounded-3xl bg-[#1D1D1D]"
        >
             <div className="relative h-full w-full flex-1 overflow-hidden rounded-3xl">
                <ModernCardLoader text="Loading App Details..." />
             </div>
        </NodeLayout>
      );
  }

  const isVideoCover = appData.cover_image?.endsWith(".mp4");
  const durationVal = Number(appData.duration || 0);

  return (
    <NodeLayout
      selected={selected}
      title={appData.app_name}
      subtitle={appData?.description ? (appData.description.slice(0, 30) + (appData.description.length > 30 ? "..." : "")) : ""}
      minWidth={BASE_WIDTH}
      minHeight={nodeHeight}
      keepAspectRatio={!data.imageUrl}
      className={`flex h-auto w-full cursor-default flex-col rounded-3xl transition-colors duration-200 ${
        inputImageUrl || data.imageUrl ? "bg-[#1D1D1D]" : "bg-[#141414] border border-zinc-800"
      }`}
      handles={[
        { type: "target", position: Position.Left },
        { type: "source", position: Position.Right },
      ]}
    >
      <div className="relative flex-1 overflow-hidden rounded-3xl flex flex-col h-auto">
        {data.imageUrl ? (
             <div className="relative h-full w-full">
                <img
                    src={data.imageUrl}
                    alt="Result"
                    className="h-full w-full rounded-3xl object-contain bg-[#111]"
                    draggable={false}
                />
                <div className="absolute bottom-3 right-3 rounded-full border border-green-500/30 bg-green-500/20 px-3 py-1.5 text-xs font-medium text-green-300 backdrop-blur-sm">
                    ✓ Complete
                </div>
             </div>
        ) : (
             <div className="relative h-auto w-full flex flex-col bg-[#141414] overflow-hidden">
                 {/* Modern Header Section */}
                 <div className="relative w-full h-[240px] shrink-0 overflow-hidden">
                    {isVideoCover ? (
                      <video
                        src={appData.cover_image}
                        className="h-full w-full object-cover"
                        autoPlay muted loop playsInline
                      />
                    ) : (
                      <img
                        src={appData.cover_image}
                        alt="Cover"
                        className="h-full w-full object-cover"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/10 to-transparent" />
                    
                    <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col gap-3">
                        <h3 className="text-3xl font-bold text-white tracking-tight leading-tight">
                            {appData.app_name}
                        </h3>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5 rounded-full bg-[#1A1A1A]/80 border border-zinc-800 px-3.5 py-1 backdrop-blur-md">
                               <span className="text-xs font-semibold text-zinc-300">{appData.cost} credit</span>
                            </div>
                            <div className="flex items-center gap-1.5 rounded-full bg-[#1A1A1A]/80 border border-zinc-800 px-3.5 py-1 backdrop-blur-md">
                               <span className="text-xs font-semibold text-zinc-300">
                                   {durationVal >= 60 ? `${Math.floor(durationVal / 60)} mins` : `${durationVal}s`}
                               </span>
                            </div>
                        </div>
                    </div>
                 </div>
                 
                 {/* Scrollable Content */}
                 <div className="flex flex-1 flex-col p-5 gap-4 min-h-0 pb-5">
                      {/* Image Input Section */}
                      {parseParameters(appData).some(p => p.fieldName === 'image') && (
                        <div className="flex flex-col gap-4">
                            {parseParameters(appData)
                                .filter(p => p.fieldName === 'image')
                                .map((param, index) => {
                                    const inputImage = data.inputImageUrls?.[index];
                                    return (
                                        <div key={param.description || index} className="flex flex-col gap-2">
                                            <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">{param.description}</Label>
                                            
                                            {inputImage ? (
                                                <div className="relative group w-full h-40 shrink-0 rounded-2xl overflow-hidden border border-zinc-800 bg-[#111] shadow-xl">
                                                    <img 
                                                        src={inputImage} 
                                                        alt={param.description} 
                                                        className="w-full h-full object-contain" 
                                                    />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <span className="text-[10px] font-bold text-white uppercase tracking-wider bg-black/60 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md">Connected</span>
                                                    </div>
                                                    <div className="absolute bottom-3 left-3 rounded-full bg-green-500/20 border border-green-500/30 px-2.5 py-1 text-[10px] font-bold text-green-400 backdrop-blur-md">
                                                        Ready
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="group relative flex h-20 shrink-0 items-center gap-4 rounded-2xl border-2 border-dashed border-zinc-800 bg-[#1A1A1A]/30 px-5 transition-all hover:bg-zinc-800/40 hover:border-zinc-700">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-500 shadow-xl group-hover:scale-105 group-hover:bg-zinc-700 group-hover:text-zinc-300 transition-all">
                                                        <Sparkles size={18} className="opacity-50" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                         <p className="text-xs font-bold text-zinc-400 group-hover:text-zinc-200 transition-colors">Connect {param.description}</p>
                                                         <p className="text-[10px] text-zinc-600">Connect image node</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            }
                        </div>
                      )}

                    {/* Dynamic Parameters */}
                    <div className="flex flex-col gap-4">
                        <AppParameterRenderer
                            values={parseParameters(appData).map(param => ({
                                ...param,
                                fieldValue: data.parameterValues?.[param.description] ?? param.fieldValue ?? ""
                            }))}
                            handleChange={handleParamChange}
                            mode="canvas"
                        />
                    </div>
                 </div>

                 {validationError && (
                      <div className="px-6 pb-2">
                        <div className="flex items-center gap-2 rounded-xl bg-red-500/10 p-3 text-xs text-red-400 border border-red-500/20">
                            <TriangleAlert size={14} className="shrink-0" />
                            <span className="leading-tight">{validationError}</span>
                        </div>
                      </div>
                  )}

                  {/* Bottom Action Bar */}
                  <div className="p-6 pt-0 flex items-center gap-3">
                    <div className="flex-1 flex items-center gap-2 overflow-x-auto custom-scrollbar no-scrollbar">
                         {/* Parameters are now handled in the main scrollable area */}
                    </div>

                    <button
                      className={`flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-[#CCFF00] px-8 h-11 text-sm font-bold text-black shadow-[0_0_20px_rgba(204,255,0,0.2)] transition-all hover:scale-[1.05] hover:bg-[#DDFF33] active:scale-95 disabled:opacity-50 disabled:grayscale`}
                      onClick={handleGenerate}
                      disabled={isGenerating || (parseParameters(appData).some(p => p.fieldName === 'image') && !inputImageUrl)}
                    >
                      {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <span>Generate</span>}
                    </button>
                  </div>
             </div>
        )}
        {isGenerating && <ModernCardLoader text="Generating..." />}
      </div>
    </NodeLayout>
  );
});

export default AiAppNode;
