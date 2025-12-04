"use client";

import React, { useState, useRef, useEffect } from "react";
import { Stage, Layer, Group, Shape } from "react-konva";
import Konva from "konva";
import DraggableImage from "./DraggableImage";
import Toolbar from "./Toolbar";
import { Undo2, Redo2, Upload, History, Layers, Plus } from "lucide-react";
import { useGenerateImage } from "@/src/hooks/useGenerateImage";
import { ConversationType } from "@/src/types/BaseType";

interface EditorCanvasProps {
  initialImageSrc: string;
}

interface ImageNode {
  id: string;
  src: string;
  x: number;
  y: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  width?: number;
  height?: number;
  parentId?: string;
  transformationType?: 'upload' | 'flip' | 'rotate' | 'crop' | 'remove-bg' | 'generate';
  isLoading?: boolean;
}

const Grid = React.memo(() => {
  const GRID_SIZE = 50;
  const GRID_WIDTH = 5000;
  const GRID_HEIGHT = 5000;

  return (
    <Group>
       <Shape
          sceneFunc={(context, shape) => {
            context.beginPath();
            for (let i = -GRID_WIDTH / 2; i < GRID_WIDTH / 2; i += GRID_SIZE) {
              for (let j = -GRID_HEIGHT / 2; j < GRID_HEIGHT / 2; j += GRID_SIZE) {
                 context.moveTo(i, j);
                 context.arc(i, j, 1, 0, Math.PI * 2, true);
              }
            }
            context.fillStyle = "#333333"; // Darker dots for dark mode
            context.fill();
          }}
          listening={false}
       />
    </Group>
  );
});

export default function EditorCanvas({ initialImageSrc }: EditorCanvasProps) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  
  useEffect(() => {
    setSize({ width: window.innerWidth, height: window.innerHeight });
    
    const handleResize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- State Management (Persistence) ---
  const [nodes, setNodes] = useState<ImageNode[]>([]);
  const [history, setHistory] = useState<ImageNode[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('editor-history');
      let loadedNodes: ImageNode[] = [];
      
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            loadedNodes = parsed;
            setNodes(parsed);
            setHistory([parsed]);
            setHistoryIndex(0);
          }
        } catch (e) {
          console.error("Failed to parse history", e);
        }
      }
      
      // Handle initialImageSrc (from URL)
      // If we have an initial image, and it's NOT already in our loaded nodes, add it.
      if (initialImageSrc) {
         // Check if this src is already present to avoid duplicates on refresh
         // Note: initialImageSrc might be a blob URL or signed URL that changes, so exact match might fail.
         // But for now, let's assume if the user clicks "Edit", they want to see it.
         // A simple heuristic: If loadedNodes is empty, definitely add it.
         // If loadedNodes has items, we might want to append it as a new root?
         
         const alreadyExists = loadedNodes.some(n => n.src === initialImageSrc);
         
         if (!alreadyExists) {
            const initialNode: ImageNode = {
               id: `root-${Date.now()}`,
               src: initialImageSrc,
               x: window.innerWidth / 2 - 200, // Center X (approx)
               y: window.innerHeight / 2 - 200, // Center Y (approx)
               rotation: 0,
               scaleX: 1,
               scaleY: 1,
               transformationType: 'upload',
            };
            
            // If we had loaded nodes, append. If not, start fresh.
            const newNodes = [...loadedNodes, initialNode];
            setNodes(newNodes);
            setHistory([newNodes]);
            setHistoryIndex(0);
         }
      }
    }
  }, [initialImageSrc]);

  // Save to localStorage whenever nodes change
  useEffect(() => {
    if (nodes.length > 0) {
      localStorage.setItem('editor-history', JSON.stringify(nodes));
    }
  }, [nodes]);

  // History helpers
  const pushToHistory = (newNodes: ImageNode[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newNodes);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setNodes(newNodes);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setNodes(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setNodes(history[historyIndex + 1]);
    }
  };

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showHistorySidebar, setShowHistorySidebar] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [stageState, setStageState] = useState({
    scale: 1,
    x: 0,
    y: 0,
  });
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 });

  const stageRef = useRef<Konva.Stage>(null);

  // --- AI Integration ---
  const generateMutation = useGenerateImage(ConversationType.GENERATE, undefined);

  // --- Layout Logic ---

  // Helper to convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Add new root image (Vertical Stack)
  const addRootImage = async (file: File) => {
    const base64 = await fileToBase64(file);
    const rootNodes = nodes.filter(n => !n.parentId);
    let maxY = window.innerHeight / 2 - 200; // Default center-ish
    
    // If we have existing roots, place below the last one
    if (rootNodes.length > 0) {
       // Find the lowest root
       const lastRoot = rootNodes.reduce((prev, current) => (prev.y > current.y) ? prev : current);
       maxY = lastRoot.y + (lastRoot.height || 400) + 50; // Vertical Gap
    } else {
       // First image, center it
       maxY = window.innerHeight / 2 - 200;
    }

    const newNode: ImageNode = {
      id: `root-${Date.now()}`,
      src: base64,
      x: window.innerWidth / 2 - 200, // Center X
      y: maxY,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      transformationType: 'upload',
    };
    
    pushToHistory([...nodes, newNode]);
    setSelectedId(newNode.id);
  };

  // Add transformation node (Horizontal Chain)
  const addTransformationNode = (parentId: string, newSrc: string, type: ImageNode['transformationType'], extraAttrs: Partial<ImageNode> = {}, explicitId?: string) => {
    const HORIZONTAL_GAP = 50;
    const parent = nodes.find(n => n.id === parentId);
    if (!parent) return;

    // Calculate parent's visual width
    // Use stored width or default to 400 if not yet loaded
    const parentWidth = (parent.width || 400) * Math.abs(parent.scaleX);
    
    const newNode: ImageNode = {
      id: explicitId || `node-${Date.now()}`,
      src: newSrc,
      x: parent.x + parentWidth + HORIZONTAL_GAP,
      y: parent.y,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      parentId,
      transformationType: type,
      ...extraAttrs
    };

    pushToHistory([...nodes, newNode]);
    setSelectedId(newNode.id);
  };

  // Update toolbar position
  const updateToolbar = () => {
     if (!selectedId) return;
     // Find the node by name. DraggableImage sets name={`image-${id}`}
     const node = stageRef.current?.findOne(`.image-${selectedId}`);
     if (node) {
       const box = node.getClientRect();
       setToolbarPosition({
         top: box.y,
         left: box.x + box.width + 20, // Right side
       });
     }
  };

  // Handle node updates (drag/transform)
  const handleNodeChange = (id: string, newAttrs: Partial<ImageNode>) => {
    const newNodes = nodes.map(n => n.id === id ? { ...n, ...newAttrs } : n);
    setNodes(newNodes);
  };

  const handleDragEnd = () => {
    pushToHistory(nodes);
  };

  // Zoom logic
  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;

    const scaleBy = 1.1;
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();

    if (!pointer) return;

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;

    setStageState({
      scale: newScale,
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    });
  };

  const checkDeselect = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      setSelectedId(null);
    }
  };

  useEffect(() => {
    if (selectedId) {
      updateToolbar();
    }
  }, [selectedId, nodes, stageState]);

  if (size.width === 0) return null;

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#0a0a0a]">
      {/* Top Left Controls */}
      <div className="absolute left-4 top-4 z-50 flex gap-2">
         <button 
           onClick={undo} 
           disabled={historyIndex <= 0}
           className="rounded bg-[#1a1a1a] p-2 text-white shadow ring-1 ring-white/10 disabled:opacity-50 hover:bg-[#2a2a2a]"
           title="Undo"
         >
           <Undo2 size={20} />
         </button>
         <button 
           onClick={redo} 
           disabled={historyIndex >= history.length - 1}
           className="rounded bg-[#1a1a1a] p-2 text-white shadow ring-1 ring-white/10 disabled:opacity-50 hover:bg-[#2a2a2a]"
           title="Redo"
         >
           <Redo2 size={20} />
         </button>
         <div className="h-full w-px bg-white/10 mx-2" />
         <button 
           onClick={() => fileInputRef.current?.click()}
           className="flex items-center gap-2 rounded bg-yellow-500 px-4 py-2 text-black font-medium shadow hover:bg-yellow-400"
         >
           <Plus size={18} />
           <span>Add Image</span>
         </button>
         <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                addRootImage(e.target.files[0]);
              }
            }}
         />
      </div>

      {/* Top Right Sidebar Toggle */}
      <div className="absolute right-4 top-4 z-50">
        <button
          onClick={() => setShowHistorySidebar(!showHistorySidebar)}
          className={`rounded p-2 shadow ring-1 ring-white/10 ${showHistorySidebar ? 'bg-yellow-500 text-black' : 'bg-[#1a1a1a] text-white'}`}
          title="Toggle Layers"
        >
          <Layers size={20} />
        </button>
      </div>

      {/* Sidebar */}
      {showHistorySidebar && (
        <div className="absolute right-4 top-16 z-40 h-[calc(100vh-100px)] w-64 overflow-y-auto rounded-xl bg-[#1a1a1a] p-4 shadow-xl ring-1 ring-white/10">
           <h3 className="mb-4 flex items-center gap-2 font-semibold text-white">
             <History size={18} />
             Layers
           </h3>
           <div className="flex flex-col gap-2">
             {nodes.map((node, index) => (
               <div 
                 key={node.id}
                 onClick={() => setSelectedId(node.id)}
                 className={`flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors ${
                   selectedId === node.id ? 'bg-yellow-500/20 ring-1 ring-yellow-500' : 'hover:bg-white/5'
                 }`}
               >
                 <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded bg-black">
                    <img src={node.src} alt="" className="h-full w-full object-cover" />
                 </div>
                 <div className="flex flex-col overflow-hidden">
                    <span className="truncate text-sm font-medium text-white">
                      {node.transformationType === 'upload' ? 'Original' : 
                       node.transformationType === 'generate' ? 'Generated' :
                       node.transformationType}
                    </span>
                    <span className="text-xs text-gray-500">ID: {node.id.slice(-4)}</span>
                 </div>
               </div>
             ))}
             {nodes.length === 0 && (
               <p className="text-center text-sm text-gray-500">No images</p>
             )}
           </div>
        </div>
      )}

      <Stage
        width={size.width}
        height={size.height}
        onWheel={handleWheel}
        onMouseDown={checkDeselect}
        onTouchStart={checkDeselect}
        draggable
        ref={stageRef}
        scaleX={stageState.scale}
        scaleY={stageState.scale}
        x={stageState.x}
        y={stageState.y}
        onDragMove={() => selectedId && updateToolbar()}
      >
        <Layer>
          <Grid />
          {nodes.map((node) => (
            <React.Fragment key={node.id}>
              <DraggableImage
                id={node.id}
                imageSrc={node.src}
                isSelected={selectedId === node.id}
                onSelect={() => setSelectedId(node.id)}
                onChange={(newAttrs) => handleNodeChange(node.id, newAttrs)}
                onDragEnd={handleDragEnd}
                onTransformEnd={handleDragEnd}
                x={node.x}
                y={node.y}
                rotation={node.rotation}
                scaleX={node.scaleX}
                scaleY={node.scaleY}
              />
              {node.isLoading && (
                <Group x={node.x + (node.width || 0) / 2} y={node.y + (node.height || 0) / 2}>
                   <Shape
                      sceneFunc={(context, shape) => {
                        context.beginPath();
                        context.arc(0, 0, 20, 0, Math.PI * 2, false);
                        context.fillStyle = 'rgba(0,0,0,0.7)';
                        context.fill();
                        context.font = '12px Arial';
                        context.fillStyle = 'white';
                        context.fillText('Loading...', -25, 4);
                      }}
                   />
                </Group>
              )}
            </React.Fragment>
          ))}
        </Layer>
      </Stage>

      {selectedId && (
        <Toolbar
          position={toolbarPosition}
          onFlipX={() => {
             const parent = nodes.find(n => n.id === selectedId);
             if (parent) {
               addTransformationNode(selectedId, parent.src, 'flip', { scaleX: -parent.scaleX });
             }
          }}
          onRotate={() => {
             const parent = nodes.find(n => n.id === selectedId);
             if (parent) {
               addTransformationNode(selectedId, parent.src, 'rotate', { rotation: parent.rotation + 90 });
             }
          }}
          onCrop={() => console.log("Crop triggered")}
          onReplace={(file) => {
             addRootImage(file);
          }}
          onDelete={() => {
            const newNodes = nodes.filter(n => n.id !== selectedId);
            pushToHistory(newNodes);
            setSelectedId(null);
          }}
          onRemoveBg={() => {
             const parent = nodes.find(n => n.id === selectedId);
             if (parent) {
                addTransformationNode(selectedId, parent.src, 'remove-bg');
             }
          }}
          onPromptEdit={(prompt) => {
             if (prompt && selectedId) {
                const parent = nodes.find(n => n.id === selectedId);
                if (!parent) return;

                // Create a placeholder node with a stable ID
                const placeholderId = `node-${Date.now()}`;
                addTransformationNode(selectedId, "https://placehold.co/600x400?text=Generating...", 'generate', { isLoading: true }, placeholderId);
                
                // Call API
                generateMutation.mutate({
                  modelName: "flux-schnell", // Default model
                  modelIdentifier: "flux-schnell",
                  modelCredit: 1,
                  modelProvider: "replicate",
                  conversationType: ConversationType.GENERATE,
                  inputImagePermanentPaths: [parent.src], // Pass parent image
                  parameters: { prompt } as any,
                }, {
                  onSuccess: (data) => {
                    // Update the specific placeholder node
                    setNodes(prev => prev.map(n => {
                      if (n.id === placeholderId) {
                         const newSrc = data.output_images?.[0]?.imageUrl || "https://placehold.co/600x400?text=Error";
                         return { ...n, src: newSrc, isLoading: false };
                      }
                      return n;
                    }));
                  },
                  onError: () => {
                     setNodes(prev => prev.map(n => {
                       if (n.id === placeholderId) {
                          return { ...n, src: "https://placehold.co/600x400?text=Failed", isLoading: false };
                       }
                       return n;
                     }));
                  }
                });
             }
          }}
        />
      )}
    </div>
  );
}
