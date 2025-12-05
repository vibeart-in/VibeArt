"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Stage, Layer, Group, Shape, Text } from "react-konva";
import Konva from "konva";
import { ZoomIn, ZoomOut } from "lucide-react";
import DraggableImage from "./DraggableImage";
import Toolbar from "./Toolbar";
import { ImageCardLoading } from "../ui/ImageCardLoading";
import { conversationData } from "@/src/types/BaseType";

interface EditorCanvasProps {
  turns: conversationData[];
  isGenerating: boolean;
  onEditImage: (imageUrl: string) => void;
  onDeleteTurn: (turnId: string) => void;
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
  type: 'input' | 'output' | 'placeholder';
  turnId: string;
  prompt?: string;
}

const Grid = React.memo(() => {
  const GRID_SIZE = 50;
  const GRID_WIDTH = 10000; // Large enough for "infinite" feel
  const GRID_HEIGHT = 10000;

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
            context.fillStyle = "#333333"; 
            context.fill();
          }}
          listening={false}
       />
    </Group>
  );
});

export default function EditorCanvas({ turns, isGenerating, onEditImage, onDeleteTurn }: EditorCanvasProps) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const stageRef = useRef<Konva.Stage>(null);
  const [stageState, setStageState] = useState({ scale: 1, x: 0, y: 0 });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 });
  
  // Initialize size
  useEffect(() => {
    setSize({ width: window.innerWidth, height: window.innerHeight });
    const handleResize = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- Layout Logic ---
  const [localTransforms, setLocalTransforms] = useState<Record<string, Partial<ImageNode>>>({});

  const nodes = useMemo(() => {
    const calculatedNodes: ImageNode[] = [];
    const GAP_X = 200; // Increased horizontal gap
    const GAP_Y = 800; // Increased vertical gap
    const IMAGE_SIZE = 400;
    const START_X = 0;
    const START_Y = 100;
    
    let currentX = START_X;
    let currentY = START_Y;

    turns.forEach((turn, index) => {
       // Determine if this turn is a continuation of the previous one
       let isContinuation = false;
       if (index > 0) {
           const prevTurn = turns[index - 1];
           const prevOutputUrl = prevTurn.output_images?.[0]?.imageUrl;
           const currInputUrl = turn.input_images?.[0]?.imageUrl;
           
           if (prevOutputUrl && currInputUrl) {
               // Compare filenames (ignoring query params and bucket paths)
               // This handles the case where the image is re-uploaded to a different bucket
               const prevFilename = prevOutputUrl.split('?')[0].split('/').pop();
               const currFilename = currInputUrl.split('?')[0].split('/').pop();
               
               console.log(`Turn ${index} Check:`, {
                   prevFilename,
                   currFilename,
                   match: prevFilename === currFilename
               });

               if (prevFilename && currFilename && prevFilename === currFilename) {
                   isContinuation = true;
               }
           }
       }
       
       if (isContinuation) {
           // Continuation: The Input for this turn is the same as the Previous Output.
           // We do NOT render the Input node again to avoid duplication.
           // We just position the Output node to the right of the previous Output.
           // Previous Output was at: currentX + GAP_X/2
           // New Output should be at: (currentX + GAP_X/2) + IMAGE_SIZE + GAP_X
           // So we shift currentX by IMAGE_SIZE + GAP_X
           currentX += IMAGE_SIZE + GAP_X;
       } else {
           // New line or First item
           if (index > 0) {
               currentY += GAP_Y;
           }
           currentX = START_X;
       }

       // Input Images (Left)
       // Only render input if it's NOT a continuation
       if (!isContinuation) {
           const inputs = turn.input_images || [];
           inputs.forEach((img, imgIndex) => {
              const xPos = currentX - IMAGE_SIZE - GAP_X / 2 - (imgIndex * (IMAGE_SIZE + 20));
              
              calculatedNodes.push({
                 id: `input-${turn.id}-${imgIndex}`,
                 src: img.imageUrl,
                 x: xPos,
                 y: currentY,
                 rotation: 0,
                 scaleX: 1,
                 scaleY: 1,
                 width: IMAGE_SIZE,
                 height: IMAGE_SIZE,
                 type: 'input',
                 turnId: turn.id,
                 prompt: turn.userPrompt
              });
           });
       }

       // Output Images (Right)
       const outputs = turn.output_images || [];
       outputs.forEach((img, imgIndex) => {
          const xPos = currentX + GAP_X / 2 + (imgIndex * (IMAGE_SIZE + 20));
          
          calculatedNodes.push({
             id: `output-${turn.id}-${imgIndex}`,
             src: img.imageUrl,
             x: xPos,
             y: currentY,
             rotation: 0,
             scaleX: 1,
             scaleY: 1,
             width: IMAGE_SIZE,
             height: IMAGE_SIZE,
             type: 'output',
             turnId: turn.id,
             prompt: turn.userPrompt
          });
       });
       
       // Placeholder logic
       const isTurnGenerating = turn.job_status === 'pending' || turn.job_status === 'processing' || turn.job_status === 'starting' || turn.job_status === 'QUEUED' || turn.job_status === 'RUNNING';
       
       if ((isGenerating && index === turns.length - 1) || (isTurnGenerating && outputs.length === 0)) {
          const xPos = currentX + GAP_X / 2;
          calculatedNodes.push({
             id: `placeholder-${turn.id}`,
             src: '',
             x: xPos,
             y: currentY,
             rotation: 0,
             scaleX: 1,
             scaleY: 1,
             width: IMAGE_SIZE,
             height: IMAGE_SIZE,
             type: 'placeholder',
             turnId: turn.id,
             prompt: "Generating..."
          });
       }
    });

    // Apply local transforms
    return calculatedNodes.map(node => ({
        ...node,
        ...(localTransforms[node.id] || {})
    }));

  }, [turns, isGenerating, localTransforms]);

  // Auto-scroll to latest turn
  useEffect(() => {
     if (turns.length > 0) {
        const lastTurnIndex = turns.length - 1;
        const GAP_Y = 600;
        const targetY = 100 + (lastTurnIndex * GAP_Y);
        
        const newY = -targetY * stageState.scale + size.height / 2;
        const newX = size.width / 2; 

        setStageState(prev => ({
            ...prev,
            x: newX,
            y: newY
        }));
     }
  }, [turns.length, isGenerating, size.height, size.width]);


  // --- Interactions ---

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

  const updateToolbar = () => {
    if (!selectedId) return;
    const node = stageRef.current?.findOne(`.image-${selectedId}`);
    if (node) {
      const box = node.getClientRect();
      setToolbarPosition({
        top: box.y,
        left: box.x + box.width + 20,
      });
    }
  };

  useEffect(() => {
    if (selectedId) updateToolbar();
  }, [selectedId, stageState]);

  const handleNodeChange = (id: string, newAttrs: any) => {
      setLocalTransforms(prev => ({
          ...prev,
          [id]: { ...(prev[id] || {}), ...newAttrs }
      }));
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#0a0a0a]">
      {/* Zoom Controls */}
      <div className="absolute bottom-8 right-8 z-50 flex flex-col gap-2">
         <button 
            className="rounded-full bg-[#1a1a1a] p-3 text-white shadow-xl hover:bg-[#2a2a2a]"
            onClick={() => setStageState(s => ({ ...s, scale: s.scale * 1.2 }))}
         >
            <ZoomIn size={20} />
         </button>
         <button 
            className="rounded-full bg-[#1a1a1a] p-3 text-white shadow-xl hover:bg-[#2a2a2a]"
            onClick={() => setStageState(s => ({ ...s, scale: s.scale / 1.2 }))}
         >
            <ZoomOut size={20} />
         </button>
      </div>

      <Stage
        width={size.width}
        height={size.height}
        onWheel={handleWheel}
        draggable
        x={stageState.x}
        y={stageState.y}
        scaleX={stageState.scale}
        scaleY={stageState.scale}
        onDragEnd={(e) => {
            setStageState(prev => ({
                ...prev,
                x: e.target.x(),
                y: e.target.y()
            }));
        }}
        onMouseDown={(e) => {
            if (e.target === e.target.getStage()) {
                setSelectedId(null);
            }
        }}
        ref={stageRef}
      >
        <Layer>
          <Grid />
          {nodes.map((node) => {
            if (node.type === 'placeholder') return null; // Rendered as HTML overlay

            return (
            <Group key={node.id}>
                {/* Prompt Text Above Image */}
                {node.prompt && (
                    <Text
                        x={node.x}
                        y={node.y - 40}
                        text={node.prompt}
                        fontSize={16}
                        fill="white"
                        width={node.width || 400}
                        align="center"
                        fontFamily="Inter, sans-serif"
                        opacity={0.7}
                    />
                )}
                
                <DraggableImage
                    id={node.id}
                    imageSrc={node.src}
                    x={node.x}
                    y={node.y}
                    width={node.width}
                    height={node.height}
                    rotation={node.rotation}
                    scaleX={node.scaleX}
                    scaleY={node.scaleY}
                    isSelected={selectedId === node.id}
                    onSelect={() => setSelectedId(node.id)}
                    onChange={(attrs) => handleNodeChange(node.id, attrs)}
                    onDragEnd={() => {}}
                    onTransformEnd={() => {}}
                />
            </Group>
            );
          })}
        </Layer>
      </Stage>

      {/* HTML Overlays for Placeholders */}
      {nodes.filter(n => n.type === 'placeholder').map(node => (
          <div
            key={node.id}
            className="absolute z-10 pointer-events-none"
            style={{
                left: node.x * stageState.scale + stageState.x,
                top: node.y * stageState.scale + stageState.y,
                width: (node.width || 400) * stageState.scale,
                height: (node.height || 400) * stageState.scale,
            }}
          >
             <div style={{ transform: `scale(${stageState.scale})`, transformOrigin: 'top left', width: node.width || 400, height: node.height || 400 }}>
                <ImageCardLoading 
                    width={node.width || 400} 
                    loadingText="Generating..." 
                    variant="cool"
                />
             </div>
          </div>
      ))}

      {selectedId && (
        <Toolbar
          position={toolbarPosition}
          onFlipX={() => {
              const current = localTransforms[selectedId] || {};
              // Get current scaleX from nodes or local
              const node = nodes.find(n => n.id === selectedId);
              const currentScaleX = current.scaleX ?? node?.scaleX ?? 1;
              
              handleNodeChange(selectedId, { scaleX: -currentScaleX });
          }}
          onRotate={() => {
              const current = localTransforms[selectedId] || {};
              const node = nodes.find(n => n.id === selectedId);
              const currentRot = current.rotation ?? node?.rotation ?? 0;
              
              handleNodeChange(selectedId, { rotation: currentRot + 90 });
          }}
          onRemoveBg={() => {
              console.log("Remove BG triggered for", selectedId);
              // Implement API call here if needed
          }}
          onPromptEdit={() => {
              const node = nodes.find(n => n.id === selectedId);
              if (node) {
                  onEditImage(node.src);
              }
          }}
          onDelete={() => {
              const node = nodes.find(n => n.id === selectedId);
              console.log("Delete clicked. SelectedId:", selectedId, "Node:", node);
              if (node) {
                  console.log("Calling onDeleteTurn with:", node.turnId);
                  onDeleteTurn(node.turnId);
                  setSelectedId(null); // Deselect after delete
              }
          }}
        />
      )}
    </div>
  );
}
