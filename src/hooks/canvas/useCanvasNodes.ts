import { useCallback, useEffect, useMemo } from "react";
import { Node, useReactFlow } from "@xyflow/react";
import { createImageInputNode, createImageOutputNode, createVariationNode } from "@/src/utils/canvas/nodeFactory";
import { CANVAS_LAYOUT, NODE_CATEGORIES } from "@/src/constants/canvas";
import { isInputNode, ImageOutputNodeData } from "@/src/types/canvas/nodeTypes";

interface UseCanvasNodesOptions {
  nodes: Node[];
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  edges: any[];
  availableModels: any[];
  onGenerate: (nodeId: string, prompt: string) => void;
  onModelChange: (nodeId: string, model: any) => void;
  onPromptUpdate: (nodeId: string, prompt: string) => void;
}

export function useCanvasNodes({
  nodes,
  setNodes,
  edges,
  availableModels,
  onGenerate,
  onModelChange,
  onPromptUpdate,
}: UseCanvasNodesOptions) {
  const { getNodes } = useReactFlow();

  // ============================================================================
  // Layout Helpers
  // ============================================================================

  const getNextInputPosition = useCallback((currentNodes: Node[]) => {
    const inputNodes = currentNodes.filter(isInputNode);
    
    if (inputNodes.length === 0) {
      return { x: CANVAS_LAYOUT.INPUT_X, y: 50 };
    }

    const maxY = Math.max(...inputNodes.map(n => n.position.y));
    return { 
      x: CANVAS_LAYOUT.INPUT_X, 
      y: maxY + CANVAS_LAYOUT.NODE_HEIGHT + CANVAS_LAYOUT.GAP_Y 
    };
  }, []);

  const findSmartPosition = useCallback(() => {
    const existingNodes = getNodes();
    
    if (existingNodes.length === 0) {
      return { x: 500, y: 300 };
    }

    const lastNode = existingNodes[existingNodes.length - 1];
    
    // Try right
    const rightPos = { 
      x: lastNode.position.x + CANVAS_LAYOUT.NODE_WIDTH + CANVAS_LAYOUT.GAP_X, 
      y: lastNode.position.y 
    };
    
    const rightOverlap = existingNodes.some(n => 
      Math.abs(n.position.x - rightPos.x) < 100 && 
      Math.abs(n.position.y - rightPos.y) < 100
    );

    if (!rightOverlap) return rightPos;

    // Try bottom
    return { 
      x: lastNode.position.x, 
      y: lastNode.position.y + CANVAS_LAYOUT.NODE_HEIGHT + CANVAS_LAYOUT.GAP_Y 
    };
  }, [getNodes]);

  // ============================================================================
  // Node Operations
  // ============================================================================

  const handleDeleteNode = useCallback((id: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== id));
  }, [setNodes]);

  const handleAddEmptyNode = useCallback(() => {
    const position = findSmartPosition();
    
    const newNode = createImageOutputNode({
      position,
      category: NODE_CATEGORIES.DRAFT,
      model: "Flux Schnell",
      onDelete: () => handleDeleteNode(newNode.id),
      onGenerate: (prompt: string) => onGenerate(newNode.id, prompt),
      onPromptUpdate: (prompt: string) => onPromptUpdate(newNode.id, prompt),
    });

    setNodes((nds) => [...nds, newNode]);
    return newNode.id;
  }, [findSmartPosition, handleDeleteNode, onGenerate, onPromptUpdate, setNodes]);

  const handleEdit = useCallback((nodeId: string, editedPrompt?: string) => {
    const currentNodes = getNodes();
    const sourceNode = currentNodes.find(n => n.id === nodeId);
    
    if (!sourceNode) return null;

    const newPosition = { 
      x: sourceNode.position.x, 
      y: sourceNode.position.y + CANVAS_LAYOUT.NODE_HEIGHT + CANVAS_LAYOUT.GAP_Y 
    };

    const promptToUse = editedPrompt || (sourceNode.data as ImageOutputNodeData).prompt || "";
    
    const newNode = createVariationNode(sourceNode, newPosition, promptToUse);
    
    // Update handlers
    newNode.data = {
      ...newNode.data,
      onDelete: () => handleDeleteNode(newNode.id),
      onGenerate: (prompt: string) => onGenerate(newNode.id, prompt),
      onPromptUpdate: (prompt: string) => onPromptUpdate(newNode.id, prompt),
      onModelChange: (model: any) => onModelChange(newNode.id, model),
    };

    setNodes((nds) => [...nds, newNode]);
    
    return { nodeId: newNode.id, prompt: promptToUse };
  }, [getNodes, handleDeleteNode, onGenerate, onPromptUpdate, onModelChange, setNodes]);

  const addInputNode = useCallback((imageUrl: string, label: string, permanentPath?: string) => {
    setNodes((currentNodes) => {
      const position = getNextInputPosition(currentNodes);
      
      const newNode = createImageInputNode({
        position,
        imageUrl,
        label,
        permanentPath,
        onDelete: () => handleDeleteNode(newNode.id),
      });

      return [...currentNodes, newNode];
    });
  }, [getNextInputPosition, handleDeleteNode, setNodes]);

  // ============================================================================
  // Update Handlers with Available Models
  // ============================================================================

  useEffect(() => {
    if (availableModels && availableModels.length > 0) {
      setNodes((nds) => nds.map(n => {
        if (n.type === 'outputImage') {
          const currentModel = n.data.selectedModel || availableModels[0];
          
          if (n.data.availableModels !== availableModels || !n.data.selectedModel) {
            return {
              ...n,
              data: {
                ...n.data,
                availableModels,
                selectedModel: currentModel,
                model: currentModel.model_name,
                onModelChange: (model: any) => onModelChange(n.id, model),
              }
            };
          }
        }
        return n;
      }));
    }
  }, [availableModels, onModelChange]);

  // ============================================================================
  // Ensure Handlers are Present
  // ============================================================================

  useEffect(() => {
    setNodes((nds) => nds.map(n => {
      if (n.type === 'outputImage') {
        const needsUpdate = !n.data.onGenerate || !n.data.onEdit || !n.data.onPromptUpdate;
        
        if (needsUpdate) {
          return {
            ...n,
            data: {
              ...n.data,
              onGenerate: (prompt: string) => onGenerate(n.id, prompt),
              onEdit: (prompt?: string) => handleEdit(n.id, prompt),
              onPromptUpdate: (prompt: string) => onPromptUpdate(n.id, prompt),
              onModelChange: n.data.onModelChange || ((model: any) => onModelChange(n.id, model)),
            }
          };
        }
      }
      return n;
    }));
  }, [onGenerate, handleEdit, onPromptUpdate, onModelChange]);

  return {
    handleAddEmptyNode,
    handleDeleteNode,
    handleEdit,
    addInputNode,
    getNextInputPosition,
    findSmartPosition,
  };
}
