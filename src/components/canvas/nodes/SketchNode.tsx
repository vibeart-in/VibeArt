"use client";

import { Node, NodeProps, Position, useReactFlow } from "@xyflow/react";
import NodeLayout from "../NodeLayout";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useUpstreamData } from "@/src/utils/xyflow";
import { 
  Loader2, 
  Trash2,
  Brush,
  Eraser,
  Undo,
  Redo
} from "lucide-react";
import * as Popover from "@radix-ui/react-popover";
import { Slider } from "../../ui/slider";
import { uploadCanvasToSupabase } from "@/src/utils/canvasUpload";
import { cn } from "@/src/lib/utils";
import { useCanvas } from "../../providers/CanvasProvider";


// Point structure for vector paths
type Point = { x: number; y: number };
type Path = {
  points: Point[];
  color: string;
  width: number;
  isEraser: boolean;
};

export type SketchNodeData = {
  imageUrl?: string;
  processedImageUrl?: string;
  width?: number;
  height?: number;
  paths?: Path[]; // Store custom paths
  backgroundColor?: string; // Persist bg color
  [key: string]: unknown;
}; 

export type SketchNodeType = Node<SketchNodeData, "sketch">;

const SUGGESTED_COLORS = [
  "#FFFFFF", "#000000", "#FF5733", "#33FF57", "#3357FF", "#F1C40F", "#9B59B6", "#E67E22"
];

const MAX_SIZE = 600;

export default function SketchNode({
  id,
  data,
  selected,
}: NodeProps<SketchNodeType>) {
  const { updateNodeData, updateNode } = useReactFlow();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { project } = useCanvas();
  
  // Tools state
  const [isEraser, setIsEraser] = useState(false);
  const [color, setColor] = useState("#FFFFFF");
  const [brushSize, setBrushSize] = useState(5);
  const [eraserSize, setEraserSize] = useState(20);
  const [isUploading, setIsUploading] = useState(false);
  
  // Initialize Background Color from data or default
  const [backgroundColor, setBackgroundColor] = useState(data.backgroundColor || "#1A1A1A");

  // Helper to update bg color with persistence
  const handleSetBackgroundColor = (c: string) => {
      setBackgroundColor(c);
      updateNodeData(id, { backgroundColor: c });
  };

  // Drawing state
  const [paths, setPaths] = useState<Path[]>([]);
  const [currentPath, setCurrentPath] = useState<Path | null>(null);
  const [redoStack, setRedoStack] = useState<Path[][]>([]);
  const isDrawing = useRef(false);

  // Sync upstream
  const { images } = useUpstreamData("target");
  const upstreamImage = images[0];

  // Dimensions
  const [dims, setDims] = useState({ 
      w: data.width || 400, 
      h: data.height || 400 
  });

  // --- Dimension Logic ---
  useEffect(() => {
    // Helper to compare URLs ignoring query params (e.g. timestamp/tokens)
    const areUrlsEqual = (u1?: string, u2?: string) => {
        if (!u1 || !u2) return false;
        return u1.split('?')[0] === u2.split('?')[0];
    };

    if (upstreamImage && !areUrlsEqual(upstreamImage, data.imageUrl)) {
        // Only reset if we are genuinely switching images
        // If data.imageUrl is undefined (first time), we accept the new image
        // BUT if paths exist in data, we should tread carefully.
        // On strict reload, data.imageUrl should match upstreamImage.
        
        // If data.imageUrl IS defined but different:
        // Then it's a real switch. Reset paths.
        if (data.imageUrl) {
             setPaths([]);
             setRedoStack([]);
        } 
        
        // Load new image dims
        const img = new Image();
        img.src = upstreamImage;
        img.onload = () => {
            let { width, height } = img;
            if (width > MAX_SIZE || height > MAX_SIZE) {
                const ratio = width / height;
                if (width > height) {
                    width = MAX_SIZE;
                    height = Math.round(MAX_SIZE / ratio);
                } else {
                    height = MAX_SIZE;
                    width = Math.round(MAX_SIZE * ratio);
                }
            }
            setDims({ w: width, h: height });
            
            // If we didn't reset paths (because it was first load), we should preserve them?
            // Actually, if it's first load (data.imageUrl undefined), we might be reloading.
            // In that case, we want to KEEP data.paths if they exist.
            // So we ONLY overwrite paths: [] if we actually reset them locally.
            
            // Logic: 
            // 1. If switching images (data.imageUrl defined & diff), clear paths.
            // 2. If first load (data.imageUrl empty), preserve existing data.paths if any.
            
            const shouldClearPaths = data.imageUrl && !areUrlsEqual(upstreamImage, data.imageUrl);
            
            const updatePayload: any = { imageUrl: upstreamImage, width, height };
            if (shouldClearPaths) {
                updatePayload.paths = [];
            }
            
            updateNodeData(id, updatePayload);
        };
    }
  }, [upstreamImage, data.imageUrl, id, updateNodeData]);

  // Sync dimensions to React Flow node size
  useEffect(() => {
    updateNode(id, { width: dims.w, height: dims.h + 120 });
  }, [dims.w, dims.h, id, updateNode]);

  const loadedPaths = useRef(false);

  // --- Initialization ---
  useEffect(() => {
    // Sync local state if data changes externally (e.g. persistence load)
    if (data.backgroundColor && data.backgroundColor !== backgroundColor) {
        setBackgroundColor(data.backgroundColor);
    }
    
    // Only load paths once from data to avoid overwriting local changes
    // But wait until data.paths is actually defined (it might be async)
    if (!loadedPaths.current && data.paths && Array.isArray(data.paths)) {
        setPaths(data.paths as Path[]);
        loadedPaths.current = true;
    }
  }, [data.paths, data.backgroundColor]); // Watch persistence

  // --- Drawing Logic ---
  
  // Helper to draw a single path
  const drawPath = (ctx: CanvasRenderingContext2D, path: Path) => {
    if (path.points.length < 2) return;
    
    ctx.beginPath();
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.lineWidth = path.width;
    ctx.strokeStyle = path.color;
    // Eraser is global composite op, but we can simulate by drawing destination-out
    // However, simplest custom manual eraser is drawing "transparent" or background color?
    // No, standard canvas eraser uses composite operation.
    if (path.isEraser) {
        ctx.globalCompositeOperation = "destination-out";
    } else {
        ctx.globalCompositeOperation = "source-over";
    }

    ctx.moveTo(path.points[0].x, path.points[0].y);
    for (let i = 1; i < path.points.length; i++) {
        ctx.lineTo(path.points[i].x, path.points[i].y);
    }
    ctx.stroke();
    ctx.globalCompositeOperation = "source-over"; // Reset
  };

  // Redraw everything
  const redraw = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      paths.forEach(p => drawPath(ctx, p));
      if (currentPath) drawPath(ctx, currentPath);
  }, [paths, currentPath]);

  // Trigger redraw when paths change or dimensions update (canvas clears on resize)
  useEffect(() => {
      redraw();
  }, [redraw, dims]);


  // --- Pointer Handlers ---
  const onPointerDown = (e: React.PointerEvent) => {
      isDrawing.current = true;
      e.currentTarget.setPointerCapture(e.pointerId);
      
      const pt = { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY };
      
      setCurrentPath({
          points: [pt],
          color: color,
          width: isEraser ? eraserSize : brushSize,
          isEraser: isEraser
      });
  };

  const onPointerMove = (e: React.PointerEvent) => {
      if (!isDrawing.current || !currentPath) return;
      
      const pt = { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY };
      
      setCurrentPath(prev => {
          if (!prev) return null;
          return {
              ...prev,
              points: [...prev.points, pt]
          };
      });
  };

  const onPointerUp = (e: React.PointerEvent) => {
      if (!isDrawing.current || !currentPath) return;
      isDrawing.current = false;
      e.currentTarget.releasePointerCapture(e.pointerId);

      // Commit path
      const newPaths = [...paths, currentPath];
      setPaths(newPaths);
      setCurrentPath(null);
      setRedoStack([]); 

      // SAVE PATHS LOCALLY FOR PERSISTENCE (Recover on reload)
      // We do NOT upload to Supabase here anymore.
      updateNodeData(id, { paths: newPaths });
  };

  // --- Export Logic ---
  const handleSave = async () => {
      // Trigger manual save
      await exportAndSave(paths);
  };

  const exportAndSave = async (currentPaths: Path[]) => {
      setIsUploading(true);
      try {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = dims.w;
        tempCanvas.height = dims.h;
        const ctx = tempCanvas.getContext("2d");
        if (!ctx) return;

        // 1. Fill Background
        if (data.imageUrl) {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.src = data.imageUrl;
            await new Promise((resolve, reject) => {
                img.onload = () => {
                    ctx.drawImage(img, 0, 0, dims.w, dims.h);
                    resolve(null);
                };
                img.onerror = reject;
            });
        } else {
             ctx.fillStyle = backgroundColor;
             ctx.fillRect(0, 0, dims.w, dims.h);
        }

        // 2. Draw Strokes
        ctx.drawImage(canvas, 0, 0);

        // 3. Upload
        const filename = `sketch_${id}`;
        const url = await uploadCanvasToSupabase(tempCanvas, project?.id || "",filename);
              
        // 4. Save to Node Persistence
        updateNodeData(id, { 
            processedImageUrl: `${url}?t=${Date.now()}`,
            paths: currentPaths 
        });

      } catch (e) {
          console.error("Export failed", e);
      } finally {
          setIsUploading(false);
      }
  };


  // --- Toolbar Handlers ---
  const handleUndo = () => {
      if (paths.length === 0) return;
      const last = paths[paths.length - 1];
      const newPaths = paths.slice(0, -1);
      setPaths(newPaths);
      setRedoStack([...redoStack, [last]]);
      redraw();
      updateNodeData(id, { paths: newPaths }); // Persist undo
  };

  const handleRedo = () => {
      if (redoStack.length === 0) return;
      const lastGroup = redoStack[redoStack.length - 1];
      const newPaths = [...paths, ...lastGroup];
      setPaths(newPaths);
      setRedoStack(redoStack.slice(0, -1));
      redraw();
      updateNodeData(id, { paths: newPaths }); // Persist redo
  };

  const currentSize = isEraser ? eraserSize : brushSize;
  const setSize = isEraser ? setEraserSize : setBrushSize;

  return (
    <NodeLayout
      selected={selected}
      title="Painter"
      subtitle="Sketch"
      handles={[
        { type: "target", position: Position.Left, id: "target" },
        { type: "source", position: Position.Right, id: "source" },
      ]}
      className="flex flex-col  bg-[#111] border border-white/10 rounded-2xl shadow-xl"
      minWidth={dims.w} // If resizing, this ensures min width is respected
      minHeight={dims.h + 120} // Increased footer space
      style={{ width: dims.w }}
    >
      {/* Canvas Wrapper */}
      <div className="p-2" style={{ width: dims.w, height: dims.h }}> 
          <div 
            className="relative bg-[#0A0A0A] overflow-hidden rounded-xl nodrag nopan cursor-crosshair w-full h-full"
            onMouseDown={e => e.stopPropagation()}
            onTouchStart={e => e.stopPropagation()}
          >
                 {/* Background Layer (Visual Only) */}
                 {data.imageUrl ? (
                     // eslint-disable-next-line @next/next/no-img-element
                     <img 
                        src={data.imageUrl} 
                        alt="background" 
                        className="absolute inset-0 w-full h-full object-contain pointer-events-none" 
                     />
                 ) : (
                     <div className="absolute inset-0 w-full h-full pointer-events-none" style={{ backgroundColor }} />
                 )}

                 {/* Native Canvas */}
                 <canvas
                    ref={canvasRef}
                    width={dims.w}
                    height={dims.h}
                    className="absolute inset-0 z-10 touch-none outline-none"
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                    onPointerLeave={onPointerUp}
                 />
          </div>
      </div>

      {/* Footer Toolbar */}
      <div className="flex flex-col gap-4 p-4 bg-[#141414] border-t border-white/5 z-20 rounded-b-2xl">
         {/* Row 1: Tools + Save Actions */}
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-[#1A1A1A] p-1 rounded-lg border border-white/5">
                    <button
                        onClick={() => setIsEraser(false)}
                        className={cn("p-2 rounded-md transition-all", !isEraser ? "bg-[#2A2A2A] text-white" : "text-gray-500 hover:text-gray-300")}
                    >
                        <Brush size={16} />
                    </button>
                    <button
                        onClick={() => setIsEraser(true)}
                        className={cn("p-2 rounded-md transition-all", isEraser ? "bg-[#2A2A2A] text-white" : "text-gray-500 hover:text-gray-300")}
                    >
                        <Eraser size={16} />
                    </button>
                </div>
                
                 <div className="flex items-center gap-1">
                     <button 
                        onClick={handleUndo}
                        disabled={paths.length === 0}
                        className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-50"
                    >
                        <Undo size={16} />
                    </button>
                    <button 
                        onClick={handleRedo}
                        disabled={redoStack.length === 0}
                        className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-50"
                    >
                        <Redo size={16} />
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-3">
                 <button 
                    onClick={() => {
                         setPaths([]);
                         setRedoStack([]);
                         redraw();
                         exportAndSave([]); // Clear downstream
                         updateNodeData(id, { paths: [] });
                    }}
                    className="text-xs font-medium text-gray-400 hover:text-white underline decoration-gray-600 underline-offset-4"
                >
                    Clear
                </button>
                
                <button
                  onClick={handleSave}
                  disabled={isUploading}
                  className="rounded-xl bg-accent px-4 py-1.5 text-sm font-bold text-black transition-all hover:brightness-110 active:scale-95 disabled:opacity-50"
                >
                  {isUploading ? <Loader2 size={16} className="animate-spin" /> : "Save"}
                </button>
            </div>
        </div>

        {/* Row 2: Properties */}
        <div className="flex items-center gap-4">
             {/* Color */}
             <Popover.Root>
                <Popover.Trigger asChild>
                    <button 
                        className="size-8 rounded-md border border-white/20 shadow-sm transition-transform active:scale-95"
                        style={{ backgroundColor: color }} 
                    />
                </Popover.Trigger>
                <Popover.Content className="z-50 w-64 rounded-xl border border-white/10 bg-[#1D1D1D] p-3 shadow-xl mb-2" side="top" align="start">
                    <div className="grid grid-cols-4 gap-2">
                        {SUGGESTED_COLORS.map(c => (
                            <button
                                key={c}
                                className="size-8 rounded-full border border-white/10"
                                style={{ backgroundColor: c }}
                                onClick={() => { setColor(c); setIsEraser(false); }}
                            />
                        ))}
                    </div>
                </Popover.Content>
            </Popover.Root>

            <div className="flex items-center gap-2 flex-1">
                <span className="text-xs text-gray-500 font-medium w-6">Size</span>
                 <Slider
                    value={[currentSize]}
                    onValueChange={(vals) => setSize(vals[0])}
                    min={1}
                    max={100}
                    step={1}
                    className="flex-1"
                />
            </div>

             {/* Bg Color */}
             <Popover.Root>
                <Popover.Trigger asChild>
                    <button 
                        className="size-5 rounded-md border border-white/20 active:scale-95"
                        style={{ backgroundColor: backgroundColor }}
                    />
                </Popover.Trigger>
                <Popover.Content className="z-50 w-64 rounded-xl border border-white/10 bg-[#1D1D1D] p-3 shadow-xl mb-2" side="top" align="end">
                    <div className="grid grid-cols-4 gap-2">
                            {SUGGESTED_COLORS.map(c => (
                            <button
                                key={c}
                                className="size-8 rounded-full border border-white/10"
                                style={{ backgroundColor: c }}
                                onClick={() => handleSetBackgroundColor(c)} // UPDATED to use persistence helper
                            />
                        ))}
                    </div>
                </Popover.Content>
            </Popover.Root>
        </div>
      </div>

       {isUploading && (
        <div className="absolute top-3 right-3 z-50 bg-black/50 p-1 rounded-full backdrop-blur-md">
            <Loader2 size={14} className="animate-spin text-[#D9E92B]" />
        </div>
      )}
    </NodeLayout>
  );
}
