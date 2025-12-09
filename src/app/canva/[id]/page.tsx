"use client";

import { useState, useCallback, useRef, DragEvent, useEffect, useMemo } from "react";
import {
  ReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Background,
  Controls,
  BackgroundVariant,
  MarkerType,
  Panel,
  Node,
  Edge,
  Connection,
  useReactFlow,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  OnConnect,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { v4 as uuidv4 } from "uuid";
import { Plus, Upload, Wand2, Loader2, Send } from "lucide-react";

import OutputImageNode from "@/src/components/canvas/OutputImageNode";
import InputImageNode from "@/src/components/canvas/InputImageNode";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { createClient } from "@/src/lib/supabase/client";
import { uploadImage } from "@/src/utils/server/UploadImage";
import { useGenerateImage } from "@/src/hooks/useGenerateImage";
import { useConversationMessages } from "@/src/hooks/useConversationMessages";
import { useModelsByUsecase } from "@/src/hooks/useModelsByUsecase";
import { ConversationType } from "@/src/types/BaseType";

const nodeTypes = {
  outputImage: OutputImageNode,
  inputImage: InputImageNode,
};

const supabase = createClient();

// Constants for layout
const INPUT_X = 50;
const NODE_WIDTH = 300;
const NODE_HEIGHT = 450; // Approx height for 2:3 aspect ratio + padding
const GAP_Y = 50;
const GAP_X = 100;

const DEFAULT_MODELS = [
    {
        id: "flux-schnell",
        model_name: "Flux Schnell",
        identifier: "black-forest-labs/flux-schnell",
        provider: "replicate",
        cost: 1,
        cover_image: "https://replicate.delivery/yhqm/Kk81U4w2XqI5O0c9B9W9x9x9/out-0.png" 
    },
    {
        id: "flux-dev",
        model_name: "Flux Dev",
        identifier: "black-forest-labs/flux-dev",
        provider: "replicate",
        cost: 2,
        cover_image: "https://replicate.delivery/yhqm/Kk81U4w2XqI5O0c9B9W9x9x9/out-0.png"
    },
    {
        id: "sdxl",
        model_name: "SDXL",
        identifier: "stability-ai/sdxl",
        provider: "replicate",
        cost: 1,
        cover_image: "https://replicate.delivery/pbxt/Kk81U4w2XqI5O0c9B9W9x9x9/out-0.png"
    }
];

function CanvasContent({ params }: { params: { id: string } }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition, getNodes, getEdges } = useReactFlow();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Hook for generation
  const mutation = useGenerateImage(ConversationType.GENERATE, params.id);
  
  // Hook for messages (real-time updates)
  const { data: messages } = useConversationMessages(params.id);

  // Hook for models
  const { data: fetchedModels } = useModelsByUsecase(ConversationType.GENERATE);

  // Merge fetched models with defaults, ensuring no duplicates by identifier
  // We prioritize fetched models (from DB) over defaults
  const availableModels = useMemo(() => {
      const modelMap = new Map();

      // 1. Add Defaults first
      DEFAULT_MODELS.forEach(m => modelMap.set(m.identifier, m));

      // 2. Add/Overwrite with Fetched Models
      if (fetchedModels) {
          fetchedModels.forEach(m => {
              // Handle potential field mismatch (identifier vs model_identifier)
              const id = m.identifier || (m as any).model_identifier;
              if (id) {
                  modelMap.set(id, m);
              } else {
                  // If no identifier, just add it with a random key or name
                  modelMap.set(m.model_name || Math.random().toString(), m);
              }
          });
      }

      const combined = Array.from(modelMap.values());
      return combined;
  }, [fetchedModels]);

  // --- Sync Nodes with Messages ---
  useEffect(() => {
      if (!messages) return;

      setNodes((currentNodes) => {
          let hasChanges = false;
          const newNodes = currentNodes.map(node => {
              if (node.type !== 'outputImage') return node;

              // Find the latest message for this node
              // We use the nodeId stored in parameters to link them
              const matchingMessage = messages.find(m => {
                  const params = m.parameters as any;
                  return params?.nodeId === node.id;
              });

              if (!matchingMessage) return node;

              // Update node state based on message status
              if (matchingMessage.job_status === 'succeeded') {
                  const imageUrl = matchingMessage.output_images?.[0]?.imageUrl;
                  if (imageUrl && node.data.imageUrl !== imageUrl) {
                      hasChanges = true;
                      return {
                          ...node,
                          data: {
                              ...node.data, // This preserves all callbacks
                              isGenerating: false,
                              imageUrl,
                              prompt: matchingMessage.userPrompt,
                              category: "Generated",
                              // Explicitly preserve callbacks to ensure they're not lost
                              onGenerate: node.data.onGenerate,
                              onEdit: node.data.onEdit,
                              onPromptUpdate: node.data.onPromptUpdate,
                              onModelChange: node.data.onModelChange,
                          }
                      };
                  }
              } else if (matchingMessage.job_status === 'failed') {
                  if (node.data.isGenerating) {
                      hasChanges = true;
                      return {
                          ...node,
                          data: {
                              ...node.data,
                              isGenerating: false,
                              // Maybe show error in a toast or node status
                          }
                      };
                  }
              }

              return node;
          });

          return hasChanges ? newNodes : currentNodes;
      });
  }, [messages, setNodes]);

  // Update nodes with available models when they load
  useEffect(() => {
      if (availableModels && availableModels.length > 0) {
          setNodes((nds) => nds.map(n => {
              if (n.type === 'outputImage') {
                  // If no model selected, pick the first one
                  const currentModel = n.data.selectedModel || availableModels[0];
                  // Only update if models list changed or not set
                  if (n.data.availableModels !== availableModels || !n.data.selectedModel || !n.data.onEdit || !n.data.onPromptUpdate) {
                      return {
                          ...n,
                          data: {
                              ...n.data,
                              availableModels,
                              selectedModel: currentModel,
                              model: currentModel.model_name, // Display name
                              onModelChange: (model: any) => handleModelChange(n.id, model),
                              onEdit: (prompt?: string) => handleEdit(n.id, prompt),
                              onPromptUpdate: (prompt: string) => handlePromptUpdate(n.id, prompt)
                          }
                      };
                  }
              }
              return n;
          }));
      }
  }, [availableModels, setNodes]);

  const handleModelChange = (nodeId: string, model: any) => {
      setNodes((nds) => nds.map(n => 
          n.id === nodeId 
          ? { ...n, data: { ...n.data, selectedModel: model, model: model.model_name } } 
          : n
      ));
  };

  // --- Update Input Images for Nodes ---
  // We create stable dependency strings to avoid infinite loops when updating nodes
  const inputState = useMemo(() => {
      return nodes
        .filter(n => n.type === 'inputImage')
        .map(n => `${n.id}:${n.data.imageUrl}`)
        .join('|');
  }, [nodes]);

  const edgeState = useMemo(() => {
      return edges.map(e => `${e.source}->${e.target}`).join('|');
  }, [edges]);

  useEffect(() => {
      setNodes((nds) => nds.map(node => {
          if (node.type === 'outputImage') {
              const inputEdges = edges.filter((e) => e.target === node.id);
              const inputNodes = nds.filter((n) => inputEdges.some((e) => e.source === n.id));
              const inputImages = inputNodes.map(n => n.data.imageUrl).filter(Boolean) as string[];
              
              // Only update if changed to avoid loops
              if (JSON.stringify(node.data.inputImages) !== JSON.stringify(inputImages)) {
                  console.log(`Updating inputImages for node ${node.id}`, inputImages);
                  return {
                      ...node,
                      data: {
                          ...node.data,
                          inputImages
                      }
                  };
              }
          }
          return node;
      }));
  }, [inputState, edgeState, setNodes, edges]); // Depend on stable strings

  // --- Layout Helper ---
  const getNextInputPosition = (currentNodes: Node[]) => {
      const inputNodes = currentNodes.filter(n => n.type === 'inputImage');
      
      if (inputNodes.length === 0) {
          return { x: INPUT_X, y: 50 };
      }

      // Find the bottom-most input node
      const maxY = Math.max(...inputNodes.map(n => n.position.y));
      return { x: INPUT_X, y: maxY + NODE_HEIGHT + GAP_Y }; 
  };

  // --- Smart Placement for New Empty Nodes ---
  const findSmartPosition = () => {
      const existingNodes = getNodes();
      
      // If no nodes, start at center-ish
      if (existingNodes.length === 0) return { x: 500, y: 300 };

      // Find the "last added" output node or just last node
      const lastNode = existingNodes[existingNodes.length - 1];
      
      // Try Right
      const rightPos = { x: lastNode.position.x + NODE_WIDTH + GAP_X, y: lastNode.position.y };
      // Simple collision check
      const rightOverlap = existingNodes.some(n => 
          Math.abs(n.position.x - rightPos.x) < 100 && 
          Math.abs(n.position.y - rightPos.y) < 100
      );

      if (!rightOverlap) return rightPos;

      // Try Bottom
      const bottomPos = { x: lastNode.position.x, y: lastNode.position.y + NODE_HEIGHT + GAP_Y };
      return bottomPos;
  };

  // --- Actions ---

  const handleGenerate = async (nodeId: string, prompt: string) => {
    if (!prompt.trim()) return;

    // Get fresh state from ReactFlow
    const currentNodes = getNodes();
    const currentEdges = getEdges();

    const node = currentNodes.find(n => n.id === nodeId);
    if (!node) {
        console.error("Node not found:", nodeId);
        return;
    }

    // Use selected model or fallback
    const selectedModel = node.data.selectedModel as any;
    
    // Default to Flux if no model selected
    const modelName = selectedModel?.model_name || "Flux Schnell";
    const modelIdentifier = selectedModel?.identifier || "black-forest-labs/flux-schnell";
    const modelProvider = selectedModel?.provider || "replicate";
    const modelCredit = selectedModel?.cost || 1;

    // 1. Find connected inputs
    const inputEdges = currentEdges.filter((e) => e.target === nodeId);
    const inputNodes = currentNodes.filter((n) => inputEdges.some((e) => e.source === n.id));
    
    const inputImageUrls = inputNodes.map(n => n.data.permanentPath || n.data.imageUrl).filter(Boolean) as string[];

    console.log("Generating for node:", nodeId, "Model:", modelName);
    
    // Update node to loading state
    setNodes((nds) =>
      nds.map((n) =>
        n.id === nodeId
          ? { 
              ...n, 
              data: { 
                  ...n.data, 
                  isGenerating: true, 
                  prompt,
                  model: modelName
              } 
            }
          : n
      )
    );

    // Ensure conversation exists to avoid FK violation
    const { data: conversation } = await supabase
        .from('conversations')
        .select('id')
        .eq('id', params.id)
        .single();

    if (!conversation) {
        // Create conversation if it doesn't exist
        const { error: createError } = await supabase
            .from('conversations')
            .insert({ 
                id: params.id, 
                conversation_type: ConversationType.GENERATE,
                user_id: (await supabase.auth.getUser()).data.user?.id 
            });
        
        if (createError) {
            console.error("Failed to create conversation", createError);
            // Fallback: let the API try (might fail with 500 if strict FK)
        }
    }

    // Format parameters for replicate provider
    // We include nodeId to track which node this generation belongs to
    const finalParameters = {
      prompt: prompt.trim(),
      nodeId: nodeId, 
      ...(inputImageUrls.length > 0 && { image: inputImageUrls[0] }),
      // Add prompt_strength if using image input (standard for img2img)
      ...(inputImageUrls.length > 0 && { prompt_strength: 0.8 }),
      // Add Flux specific parameters
      go_fast: true,
      megapixels: "1",
      num_outputs: 1,
      aspect_ratio: "3:2",
      output_format: "webp",
      output_quality: 80,
    };

    mutation.mutate(
        {
            parameters: finalParameters,
            conversationId: params.id,
            modelName: modelName, 
            modelIdentifier: modelIdentifier,
            modelCredit: modelCredit,
            modelProvider: modelProvider,
            conversationType: ConversationType.GENERATE,
            inputImagePermanentPaths: inputImageUrls
        },
        {
            onSuccess: () => {
                // No need to poll manually, useConversationMessages will pick it up
                console.log("Generation started for node", nodeId);
            },
            onError: (err) => {
                console.error("Generation failed", err);
                setNodes((nds) => nds.map((n) => n.id === nodeId ? { ...n, data: { ...n.data, isGenerating: false } } : n));
                alert(`Generation failed: ${err.message}`);
            }
        }
    );
  };

  const handlePromptUpdate = (nodeId: string, newPrompt: string) => {
    setNodes((nds) => nds.map(n => 
      n.id === nodeId 
        ? { ...n, data: { ...n.data, prompt: newPrompt } } 
        : n
    ));
  };

  const handleAddEmptyNode = () => {
    const id = uuidv4();
    const position = findSmartPosition();
    
    const newNode: Node = {
      id,
      type: "outputImage",
      position,
      data: {
        label: "New Generation",
        category: "Draft",
        model: "Flux Schnell",
        onDelete: () => handleDeleteNode(id),
        onGenerate: (prompt: string) => handleGenerate(id, prompt),
        onPromptUpdate: (prompt: string) => handlePromptUpdate(id, prompt),
      },
    };
    setNodes((nds) => [...nds, newNode]);
    setSelectedNodeId(id); 
  };

  const handleDeleteNode = (id: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== id));
    setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
    if (selectedNodeId === id) setSelectedNodeId(null);
  };

  // --- Branching Logic ---
  const handleEdit = (nodeId: string, editedPrompt?: string) => {
      const currentNodes = getNodes();
      const currentEdges = getEdges();
      
      const sourceNode = currentNodes.find(n => n.id === nodeId);
      if (!sourceNode) return;

      const newId = uuidv4();
      const newPosition = { 
          x: sourceNode.position.x, 
          y: sourceNode.position.y + NODE_HEIGHT + GAP_Y 
      };

      // Use the edited prompt if provided, otherwise use the source node's prompt
      const promptToUse = editedPrompt || sourceNode.data.prompt || "";

      const newNode: Node = {
          id: newId,
          type: "outputImage",
          position: newPosition,
          data: {
              label: "Variation",
              category: "Edit",
              model: sourceNode.data.model || "Flux Schnell",
              prompt: promptToUse, // Use the edited prompt
              selectedModel: sourceNode.data.selectedModel,
              onDelete: () => handleDeleteNode(newId),
              onGenerate: (prompt: string) => handleGenerate(newId, prompt),
          }
      };

      setNodes((nds) => [...nds, newNode]);
      
      const newEdge = {
          id: `e-${nodeId}-${newId}`,
          source: nodeId,
          target: newId,
      };

      const originalInputEdges = currentEdges.filter(e => e.target === nodeId);
      const inputEdges = originalInputEdges.map(e => ({
          id: `e-${e.source}-${newId}`,
          source: e.source,
          target: newId,
      }));

      setEdges((eds) => [...eds, newEdge, ...inputEdges]);
      setSelectedNodeId(newId);

      // Automatically trigger generation on the new node if there's a prompt
      if (promptToUse.trim()) {
          // Small delay to ensure the node is created and selected first
          setTimeout(() => {
              handleGenerate(newId, promptToUse);
          }, 100);
      }
  };

  const handleRemoveBg = (nodeId: string) => {
      const sourceNode = nodes.find(n => n.id === nodeId);
      if (!sourceNode) return;

      const newId = uuidv4();
      const newPosition = { 
          x: sourceNode.position.x + NODE_WIDTH + GAP_X, 
          y: sourceNode.position.y 
      };

      const newNode: Node = {
          id: newId,
          type: "outputImage",
          position: newPosition,
          data: {
              label: "No Background",
              category: "Remove BG",
              model: "RMBG-1.4",
              onDelete: () => handleDeleteNode(newId),
              onGenerate: (prompt: string) => handleGenerate(newId, prompt), // Or auto-generate?
          }
      };

      setNodes((nds) => [...nds, newNode]);
      
      setEdges((eds) => addEdge({
          id: `e-${nodeId}-${newId}`,
          source: nodeId,
          target: newId,
      }, eds));
      
      setSelectedNodeId(newId);
  };

  // Update existing nodes with handlers if they are missing (e.g. initial load or refresh)
  useEffect(() => {
      setNodes((nds) => nds.map(n => {
          if (n.type === 'outputImage') {
              // Check if any handlers are missing and add them all
              const needsUpdate = !n.data.onGenerate || !n.data.onEdit || !n.data.onPromptUpdate;
              
              if (needsUpdate) {
                  return {
                      ...n,
                      data: {
                          ...n.data,
                          onGenerate: (prompt: string) => handleGenerate(n.id, prompt),
                          onEdit: (prompt?: string) => handleEdit(n.id, prompt),
                          onPromptUpdate: (prompt: string) => handlePromptUpdate(n.id, prompt),
                          onModelChange: n.data.onModelChange || ((model: any) => handleModelChange(n.id, model)),
                      }
                  };
              }
          }
          return n;
      }));
  }, [setNodes]);

  const onConnect: OnConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params }, eds)),
    [setEdges],
  );

  // --- Drag & Drop & Upload ---

  const processFile = async (file: File) => {
      const id = uuidv4();
      const reader = new FileReader();
      reader.onload = async (e) => {
          const imageUrl = e.target?.result as string;
          setNodes((currentNodes) => {
              const position = getNextInputPosition(currentNodes);
              const newNode: Node = {
                  id,
                  type: "inputImage",
                  position, 
                  data: { 
                      imageUrl, 
                      label: file.name,
                      onDelete: () => handleDeleteNode(id)
                  },
              };
              return [...currentNodes, newNode];
          });

          try {
              const { permanentPath, displayUrl } = await uploadImage({ file });
               setNodes((nds) => nds.map(n => 
                  n.id === id 
                  ? { ...n, data: { ...n.data, permanentPath, imageUrl: displayUrl } } 
                  : n
               ));
          } catch (err) {
              console.error("Upload failed", err);
          }
      };
      reader.readAsDataURL(file);
  };

  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();
      if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
          const files = Array.from(event.dataTransfer.files);
          files.forEach((file) => {
              processFile(file);
          });
      }
    },
    [setNodes] 
  );

  const handleUploadClick = () => fileInputRef.current?.click();
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
          const files = Array.from(e.target.files);
          files.forEach(file => processFile(file));
      }
  };

  const onNodeClick = (_: React.MouseEvent, node: Node) => {
      setSelectedNodeId(node.id);
  };

  const onPaneClick = () => {
      setSelectedNodeId(null);
  };

  return (
    <div className="h-screen w-screen bg-black" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onDragOver={onDragOver}
        onDrop={onDrop}
        nodeTypes={nodeTypes}
        fitView
        colorMode="dark"
        proOptions={{ hideAttribution: true }}
        snapToGrid={true}
        snapGrid={[20, 20]}
        defaultEdgeOptions={{
          style: { stroke: "#4b5563", strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#4b5563" },
        }}
        // connectionLineStyle={{ stroke: "#DFFF00", strokeWidth: 3 }}
      >
        <Controls className="bg-[#1a1a1a] border-white/10 fill-white text-white" />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} color="#333" bgColor="#000" />
        
        {/* Left Center Toolbar */}
        <Panel position="top-left" className=" flex flex-col gap-4
        ">
            <div className="flex flex-col gap-4 rounded-full bg-[#1a1a1a]/80 p-3 backdrop-blur-md border border-white/10 shadow-2xl">
                <Button onClick={handleAddEmptyNode} variant="ghost" className="size-12 rounded-full p-0 text-white hover:bg-white/10 hover:scale-110 transition-all" title="Add Generator Node">
                    <Plus size={24} style={{display:"inline"}} />
                </Button>
                <div className="h-px w-full bg-white/10" />
                <Button onClick={handleUploadClick} variant="ghost" className="size-12 rounded-full p-0 text-white hover:bg-white/10 hover:scale-110 transition-all" title="Upload Image">
                    <Upload size={24} style={{display:"inline"}} />
                </Button>
            </div>
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileChange} 
            />
        </Panel>

      </ReactFlow>
    </div>
  );
}

export default function Page({ params }: { params: { id: string } }) {
  return (
    <ReactFlowProvider>
      <CanvasContent params={params} />
    </ReactFlowProvider>
  );
}
