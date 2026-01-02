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
import AppParameterRenderer from "@/src/components/ai-apps/AppParameterRenderer";

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
  // We check for 'parameters' as a sign of full data
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

    // Check against persisted hash to prevent duplicate spawning on reload
    if (data.processedImagesHash === imagesSignature) {
        return;
    }

    const images = data.outputImages as any[];
    
    // 1. Find the "Main" image (largest resolution: width * height)
    let mainImage = images[0];
    let maxArea = 0;
    
    // Calculate areas and find max
    images.forEach(img => {
        const area = (img.width || 0) * (img.height || 0);
        if (area > maxArea) {
            maxArea = area;
            mainImage = img;
        }
    });

    // 2. Prepare updates for current node
    const updates: Partial<AiAppNodeData> = {
        processedImagesHash: imagesSignature, // Mark as processed
    };

    // Update main image logic - Check for URL OR dimension changes
    if (
        data.imageUrl !== mainImage.image_url || 
        data.width !== mainImage.width || 
        data.height !== mainImage.height
    ) {
        updates.imageUrl = mainImage.image_url;
        // IMPORTANT: Update dimensions to match image so node resizes correctly
        updates.width = mainImage.width; 
        updates.height = mainImage.height;
    }

    // 3. Spawn nodes for remaining images
    const remainingImages = images.filter(img => img.id !== mainImage.id);
    
    if (remainingImages.length > 0) {
        // Get current node position for relative placement
        const currentNode = getNode(id);
        const currentX = currentNode?.position.x ?? 0;
        const currentY = currentNode?.position.y ?? 0;
        const currentWidth = currentNode?.measured?.width ?? BASE_WIDTH;
        
        const newNodes: any[] = [];
        const newEdges: any[] = [];
        const startX = currentX + currentWidth + 100; // Start to the right
        
        remainingImages.forEach((img, index) => {
            const newNodeId = crypto.randomUUID();
            
            // Grid Layout Logic (4 per row)
            const colIndex = index % 4;
            const rowIndex = Math.floor(index / 4);
            
            // Calculate offsets
            // We use fixed spacing. Adjust output node height estimate if needed.
            // Assuming output nodes will be approx 300-400px high.
            const xOffset = colIndex * (OUTPUT_NODE_WIDTH + GRID_GAP);
            const yOffset = rowIndex * (400 + GRID_GAP); // Generous vertical spacing
            

            const xPos = startX + xOffset;
            const yPos = currentY + yOffset;

            // Create Output Node
            newNodes.push({
                id: newNodeId,
                type: "outputImage", 
                position: { x: xPos, y: yPos },
                data: {
                    imageUrl: img.image_url,
                    width: img.width, // Pass actual dimensions
                    height: img.height
                },
            });

            // Connect to current node
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
    
    // Apply all updates to current node
    updateNodeData(id, updates);

  }, [data.outputImages, data.processedImagesHash, data.imageUrl, id, updateNodeData, addNodes, addEdges, getNode]);

  const appData = data.appData;
  
  // Initialize parameter values if needed
  useEffect(() => {
    if (appData && !data.parameterValues) {
        const params = parseParameters(appData);
        const initialValues: Record<string, any> = {};
        params.forEach(p => {
            // Use existing value or default if available (not defined in type yet, but good practice)
           // For now just empty or from field value if static
           if (p.fieldValue) initialValues[p.description] = p.fieldValue;
        });
        // Avoid infinite loop if empty, only update if keys differ significantly or empty
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
  // const appData = data.appData; // Moved up
  const handleGenerate = () => {
    if (!inputImageUrl || !appData || isGenerating) return;

    try {
      const appParams = parseParameters(appData);
      
      // Validation: Check required fields
      const missingFields: string[] = [];
      const currentValues = data.parameterValues || {};

      appParams.forEach(p => {
          if (p.fieldName === 'image') return; // Handled by input connection
          // Simple validation: if it's a text field or select and empty
          if ((p.fieldName === 'prompt' || p.fieldName === 'text' || p.fieldName === 'select') && !currentValues[p.description]) {
             if (!p.fieldValue) missingFields.push(p.description);
          }
      });

      if (missingFields.length > 0) {
          setValidationError(`Please fill in: ${missingFields.join(', ')}`);
          return;
      }
      setValidationError(null);

      // Create parameters for the app
      const parameters: NodeParam[] = appParams.map(p => {
        // Image param comes from connection
        if (p.fieldName === "image") {
          return {
            nodeId: p.nodeId,
            fieldName: p.fieldName,
            fieldValue: inputImageUrl,
            description: p.description
          };
        }
        
        // Other params come from state or default
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

  // Check if we have only partial data (missing parameters)
  const isPartialData = appData && !appData.parameters;

  // If fetching, or if we only have partial data, show loading
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

  // Check if cover image is a video (mp4)
  const isVideoCover = appData.cover_image?.endsWith(".mp4");

  return (
    <NodeLayout
      selected={selected}
      title={appData.app_name}
      subtitle={appData?.description ? (appData.description.slice(0, 30) + (appData.description.length > 30 ? "..." : "")) : ""}
      minWidth={BASE_WIDTH}
      minHeight={nodeHeight}
      keepAspectRatio={!data.imageUrl} // Only keep aspect ratio strictly if showing result or if defined? Actually let's allow dynamic height for forms
      className={`flex h-full w-full cursor-default flex-col rounded-3xl transition-colors duration-200 ${
        inputImageUrl || data.imageUrl ? "bg-[#1D1D1D]" : "bg-[#141414] border border-zinc-800"
      }`}
      handles={[
        { type: "target", position: Position.Left },
        { type: "source", position: Position.Right },
      ]}
    >
      <div className="relative flex-1 overflow-hidden rounded-3xl flex flex-col h-full">
        {data.imageUrl ? (
             // Result State - Full Height Image
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
             // Input / Form State
             <div className="relative h-full w-full flex flex-col bg-[#141414] overflow-hidden">
                 {/* Header Section */}
                 <div className="flex w-full shrink-0 items-start gap-3 border-b border-zinc-800 bg-[#1A1A1A] p-3">
                     {/* Cover Image */}
                     <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-zinc-700 shadow-sm">
                        {isVideoCover ? (
                          <video
                            src={appData.cover_image}
                            className="h-full w-full object-cover"
                            autoPlay
                            muted
                            loop
                            playsInline
                          />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={appData.cover_image}
                            alt="Cover"
                            className="h-full w-full object-cover"
                          />
                        )}
                     </div>
                     
                     <div className="flex min-w-0 flex-1 flex-col justify-center">
                        <h3 className="line-clamp-2 text-xs font-semibold text-zinc-100 leading-tight" title={appData.app_name}>
                            {appData.app_name}
                        </h3>
                        <div className="mt-1.5 flex flex-wrap gap-1">
                            <div className="flex items-center gap-1 rounded bg-zinc-800 px-1.5 py-0.5" title="Cost">
                               <span className="text-[10px] font-medium text-zinc-400">{appData.cost}</span>
                               <span className="text-[9px] text-zinc-600">cr</span>
                            </div>
                            <div className="flex items-center gap-1 rounded bg-zinc-800 px-1.5 py-0.5" title="Duration">
                               <span className="text-[10px] font-medium text-zinc-400">{appData.duration}s</span>
                            </div>
                        </div>
                     </div>
                 </div>
                 
                 {/* Scrollable Content */}
                 <div className="flex flex-1 flex-col p-3 gap-3 overflow-y-auto min-h-0 custom-scrollbar pb-14">
                     {/* Image Input Section */}
                     {parseParameters(appData).some(p => p.fieldName === 'image') && (
                        inputImageUrl ? (
                            <div className="relative w-full h-24 shrink-0 rounded-lg overflow-hidden border border-zinc-700/50">
                                <img src={inputImageUrl} alt="Input" className="w-full h-full object-cover opacity-80" />
                                <div className="absolute inset-0 bg-black/20" />
                                <div className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-1 text-[10px] font-medium text-white backdrop-blur-sm">
                                    Connected Input
                                </div>
                            </div>
                        ) : (
                            <div className="group relative flex h-24 shrink-0 flex-col items-center justify-center rounded-lg border border-dashed border-zinc-700 bg-zinc-900/30 transition-all duration-300 hover:border-zinc-500 hover:bg-zinc-800/50">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-zinc-500 shadow-inner group-hover:scale-110 group-hover:bg-zinc-700 group-hover:text-zinc-300 transition-all">
                                    <Sparkles size={14} className="opacity-70 text-zinc-400" />
                                </div>
                                <p className="mt-2 text-[10px] font-medium text-zinc-400 group-hover:text-zinc-200">
                                    Connect Input Image
                                </p>
                                <p className="mt-1 text-[10px] text-zinc-600">
                                    Drag output from previous node
                                </p>
                            </div>
                        )
                     )}

                    {/* Dynamic Parameters */}
                    <div className="flex flex-col gap-1.5">
                        <AppParameterRenderer
                            values={parseParameters(appData).map(p => ({
                                ...p,
                                fieldValue: data.parameterValues?.[p.description] ?? p.fieldValue ?? ""
                            }))}
                            handleChange={handleParamChange}
                            mode="canvas"
                            inputImageUrl={inputImageUrl}
                        />
                    </div>
                 </div>

                 {/* Error Message */}
                  {validationError && (
                      <div className="px-4 pb-2">
                        <div className="flex items-center gap-2 rounded-lg bg-red-500/10 p-2 text-xs text-red-400 border border-red-500/20">
                            <TriangleAlert size={14} className="shrink-0" />
                            <span className="leading-tight">{validationError}</span>
                        </div>
                      </div>
                  )}

                 {/* Generate Button Wrapper */}
                 <div className="p-3 pt-0">
                    <button
                      className={`flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 py-2 text-xs font-bold text-white shadow-lg transition-all hover:scale-[1.02] hover:from-indigo-600 hover:to-purple-600 active:scale-95 disabled:opacity-50 disabled:grayscale`}
                      onClick={handleGenerate}
                      disabled={isGenerating || (parseParameters(appData).some(p => p.fieldName === 'image') && !inputImageUrl)}
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          <span>Generating...</span>
                        </>
                      ) : (
                        <>
                          <Play size={14} fill="currentColor" />
                          <span>Generate</span>
                        </>
                      )}
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
