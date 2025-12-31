"use client";

import { Position, NodeProps, Node, useReactFlow } from "@xyflow/react";
import NodeLayout from "../NodeLayout";
import React, { useState, useEffect } from "react";
import { Sparkles, Loader2, Play } from "lucide-react";
import { useSyncUpstreamData } from "@/src/utils/xyflow";
import { ModernCardLoader } from "@/src/components/ui/ModernCardLoader";
import { NodeParam } from "@/src/types/BaseType";
import { useCanvas } from "../../providers/CanvasProvider";
import { useGenerateCanvasImage } from "@/src/hooks/useGenerateCanvasImage";
import { AiApp, AiAppParameter } from "@/src/constants/aiApps";

export type AiAppNodeData = {
  imageUrl?: string;
  inputImageUrls?: string[];
  width?: number;
  height?: number;
  activeJobId?: string;
  status?: string;
  appData?: AiApp;
  outputImages?: any[];
<<<<<<< HEAD
  processedImagesHash?: string;
=======
>>>>>>> 590dbbd623a1630ddd38940930897e723a851fdb
  [key: string]: unknown;
};

export type AiAppNodeType = Node<AiAppNodeData, "aiApp">;

const BASE_WIDTH = 320;
<<<<<<< HEAD
const GRID_GAP = 50;
const OUTPUT_NODE_WIDTH = 300;
=======
>>>>>>> 590dbbd623a1630ddd38940930897e723a851fdb

const AiAppNode = React.memo(({ id, data, selected }: NodeProps<AiAppNodeType>) => {
  const { updateNode, updateNodeData, addNodes, addEdges, getNode } = useReactFlow();
  const { project } = useCanvas();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isLoading, setIsLoading] = useState(false);
<<<<<<< HEAD
=======
  const processedImagesRef = React.useRef<string>("");
>>>>>>> 590dbbd623a1630ddd38940930897e723a851fdb

  useSyncUpstreamData(id, data);

  const generateMutation = useGenerateCanvasImage(project?.id || "");

  // Handle Multi-Image Output Logic
  useEffect(() => {
<<<<<<< HEAD
    if (!data.outputImages || data.outputImages.length === 0) {
      return;
    }

    const imagesSignature = JSON.stringify(data.outputImages.map((img: any) => img.id));

    // Check against persisted hash to prevent duplicate spawning on reload
    if (data.processedImagesHash === imagesSignature) {
        return;
    }
=======
    // Only proceed if we have output images and haven't processed this exact set yet
    const imagesSignature = JSON.stringify(data.outputImages?.map((img: any) => img.id) || []);
    if (
      !data.outputImages || 
      data.outputImages.length === 0 || 
      processedImagesRef.current === imagesSignature
    ) {
      return;
    }

    processedImagesRef.current = imagesSignature;
>>>>>>> 590dbbd623a1630ddd38940930897e723a851fdb

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

<<<<<<< HEAD
    // 2. Prepare updates for current node
    const updates: Partial<AiAppNodeData> = {
        processedImagesHash: imagesSignature, // Mark as processed
    };

    // Update main image if changed
    if (data.imageUrl !== mainImage.image_url) {
        updates.imageUrl = mainImage.image_url;
        // IMPORTANT: Update dimensions to match image so node resizes correctly
        updates.width = mainImage.width; 
        updates.height = mainImage.height;
=======
    // 2. Update current node with main image
    if (data.imageUrl !== mainImage.image_url) {
        // We delay this slightly to ensure render cycle consistency 
        // or just fire it. 
        updateNodeData(id, { imageUrl: mainImage.image_url });
>>>>>>> 590dbbd623a1630ddd38940930897e723a851fdb
    }

    // 3. Spawn nodes for remaining images
    const remainingImages = images.filter(img => img.id !== mainImage.id);
    
    if (remainingImages.length > 0) {
        // Get current node position for relative placement
        const currentNode = getNode(id);
        const currentX = currentNode?.position.x ?? 0;
        const currentY = currentNode?.position.y ?? 0;
<<<<<<< HEAD
        const currentWidth = currentNode?.measured?.width ?? BASE_WIDTH;
        
        const newNodes: any[] = [];
        const newEdges: any[] = [];
        const startX = currentX + currentWidth + 100; // Start to the right
        
        // Calculate dynamic row height based on max aspect ratio of images
        let maxAspectRatio = 0;
        remainingImages.forEach(img => {
            const ratio = (img.height || 1) / (img.width || 1);
            if (ratio > maxAspectRatio) maxAspectRatio = ratio;
        });
        
        // Safe row height: Width * MaxRatio + Gap
        const rowHeight = (OUTPUT_NODE_WIDTH * maxAspectRatio) + GRID_GAP;
        
        remainingImages.forEach((img, index) => {
            const newNodeId = crypto.randomUUID();
            
            // Grid Layout Logic (4 per row)
            const colIndex = index % 4;
            const rowIndex = Math.floor(index / 4);
            
            // Calculate offsets
            const xOffset = colIndex * (OUTPUT_NODE_WIDTH + GRID_GAP);
            const yOffset = rowIndex * rowHeight; 
            
            const xPos = startX + xOffset;
            const yPos = currentY + yOffset;
=======
        const currentWidth = currentNode?.measured?.width ?? BASE_WIDTH; // approximation if measured not ready

        const newNodes: any[] = [];
        const newEdges: any[] = [];
        
        remainingImages.forEach((img, index) => {
            const newNodeId = crypto.randomUUID();
            // Position to the right, stacked vertically
            // x: currentX + width + padding
            // y: currentY + (index * vertical_spacing)
            // But let's stagger them a bit more nicely
            
            const xPos = currentX + currentWidth + 50;
            const yPos = currentY + (index * 400); 
>>>>>>> 590dbbd623a1630ddd38940930897e723a851fdb

            // Create Output Node
            newNodes.push({
                id: newNodeId,
                type: "outputImage", 
                position: { x: xPos, y: yPos },
                data: {
                    imageUrl: img.image_url,
<<<<<<< HEAD
                    width: img.width, // Pass actual dimensions
                    height: img.height
=======
                    width: 300, 
                    height: 300 * ((img.height || 1) / (img.width || 1))
>>>>>>> 590dbbd623a1630ddd38940930897e723a851fdb
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
<<<<<<< HEAD
    
    // Apply all updates to current node
    updateNodeData(id, updates);

  }, [data.outputImages, data.processedImagesHash, data.imageUrl, id, updateNodeData, addNodes, addEdges, getNode]);
=======

  }, [data.outputImages, id, updateNodeData, addNodes, addEdges, getNode]);
>>>>>>> 590dbbd623a1630ddd38940930897e723a851fdb

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
  const appData = data.appData;

  const handleGenerate = () => {
    if (!inputImageUrl || !appData || isGenerating) return;

    try {
      const appParams: AiAppParameter[] = JSON.parse(appData.parameters);
      
      // Find the parameter that expects an image
      // We look for 'image' in fieldName or description to be safe, but fieldName 'image' is standard
      const imageParam = appParams.find(p => p.fieldName === "image");
      
      if (!imageParam) {
        console.error("No image parameter found for this app");
        return;
      }

      // Create parameters for the app
      // We start with the parsed params and update the image value
      const parameters: NodeParam[] = appParams.map(p => {
        if (p.nodeId === imageParam.nodeId) {
          return {
            nodeId: p.nodeId,
            fieldName: p.fieldName,
            fieldValue: inputImageUrl,
            description: p.description
          };
        }
        return {
          nodeId: p.nodeId,
          fieldName: p.fieldName,
          fieldValue: p.fieldValue,
          description: p.description
        };
      });

      generateMutation.mutate(
        {
          canvasId: project?.id || "",
          parameters,
          modelName: appData.app_name,
          modelIdentifier: appData.webappId,
          modelCredit: appData.cost,
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

  if (!appData) {
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

  // Check if cover image is a video (mp4)
  const isVideoCover = appData.cover_image?.endsWith(".mp4");

  return (
    <NodeLayout
      selected={selected}
      title={appData.app_name}
      subtitle={appData.description.slice(0, 30) + (appData.description.length > 30 ? "..." : "")}
      minWidth={BASE_WIDTH}
      minHeight={nodeHeight}
      keepAspectRatio={true}
      className={`flex h-full w-full cursor-default flex-col rounded-3xl transition-colors duration-200 ${
        inputImageUrl || data.imageUrl ? "bg-[#1D1D1D]" : "bg-[#141414] border border-zinc-800"
      }`}
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
            alt="Result"
            className="h-full w-full rounded-3xl object-cover"
            draggable={false}
          />
        ) : (inputImageUrl && inputImageUrl !== "") ? (
          // Input Connected State
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={inputImageUrl}
            alt="Input"
            className="h-full w-full rounded-3xl object-cover opacity-60"
            draggable={false}
          />
        ) : (
          // Initial State - Modern Design without full background image
          <div className="relative h-full w-full flex flex-col bg-[#141414]">
             {/* Header Section */}
             <div className="flex w-full shrink-0 items-start gap-4 border-b border-zinc-800 bg-[#1A1A1A] p-4">
                 {/* Cover Image */}
                 <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-zinc-700 shadow-sm">
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
                    <h3 className="line-clamp-2 text-sm font-semibold text-zinc-100 leading-tight" title={appData.app_name}>
                        {appData.app_name}
                    </h3>
                    <div className="mt-2 flex flex-wrap gap-1.5">
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
             
             {/* Dropzone Area */}
             <div className="flex flex-1 flex-col p-4">
               <div className="group relative flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-zinc-700 bg-zinc-900/30 transition-all duration-300 hover:border-zinc-500 hover:bg-zinc-800/50">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 text-zinc-500 shadow-inner group-hover:scale-110 group-hover:bg-zinc-700 group-hover:text-zinc-300 transition-all">
                      <Sparkles size={18} className="opacity-70 text-zinc-400" />
                  </div>
                  <p className="mt-3 text-xs font-medium text-zinc-400 group-hover:text-zinc-200">
                    Connect Input Image
                  </p>
                  <p className="mt-1 text-[10px] text-zinc-600">
                    Drag output from previous node
                  </p>
               </div>
             </div>
          </div>
        )}

        {/* Overlay gradient for populated states */}
        {(data.imageUrl || inputImageUrl) && (
          <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-b from-transparent via-transparent to-black/30" />
        )}

        {isGenerating && <ModernCardLoader text="Generating..." />}
      </div>

      {/* Input image preview badge - Only when input exists and no result yet */}
      {inputImageUrl && !data.imageUrl && (
        <div className="absolute bottom-3 left-3 overflow-hidden rounded-xl border border-white/20 bg-black/40 shadow-lg backdrop-blur-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={inputImageUrl} alt="Input" className="size-12 object-cover" />
        </div>
      )}

      {/* Generate button */}
      {inputImageUrl && !data.imageUrl && (
        <button
          className={`absolute bottom-3 right-3 flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-2 text-sm font-bold text-white shadow-lg transition-all hover:scale-105 hover:from-indigo-600 hover:to-purple-600 hover:shadow-xl active:scale-95 disabled:opacity-50 ${
            selected || isGenerating ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
          onClick={handleGenerate}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Running...</span>
            </>
          ) : (
            <>
              <Play size={16} fill="currentColor" />
              <span>Generate</span>
            </>
          )}
        </button>
      )}

      {/* Result indicator */}
      {data.imageUrl && (
        <div className="absolute bottom-3 right-3 rounded-full border border-green-500/30 bg-green-500/20 px-3 py-1.5 text-xs font-medium text-green-300 backdrop-blur-sm">
          ✓ Complete
        </div>
      )}
    </NodeLayout>
  );
});

export default AiAppNode;
