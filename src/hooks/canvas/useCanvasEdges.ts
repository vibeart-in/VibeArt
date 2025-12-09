import { useCallback, useEffect, useMemo } from "react";
import { Node, Edge, addEdge as addReactFlowEdge, useReactFlow } from "@xyflow/react";
import { isInputNode } from "@/src/types/canvas/nodeTypes";

interface UseCanvasEdgesOptions {
  nodes: Node[];
  edges: Edge[];
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
}

export function useCanvasEdges({
  nodes,
  edges,
  setNodes,
  setEdges,
}: UseCanvasEdgesOptions) {
  const { getNodes, getEdges } = useReactFlow();

  // ============================================================================
  // Edge Operations
  // ============================================================================

  const addEdge = useCallback((connection: any) => {
    setEdges((eds) => addReactFlowEdge({ ...connection }, eds));
  }, [setEdges]);

  const copyEdgesToNewNode = useCallback((sourceNodeId: string, targetNodeId: string) => {
    const currentEdges = getEdges();
    
    // Find edges connected to source node
    const originalInputEdges = currentEdges.filter(e => e.target === sourceNodeId);
    
    // Create new edges for target node
    const newEdges = originalInputEdges.map(e => ({
      id: `e-${e.source}-${targetNodeId}`,
      source: e.source,
      target: targetNodeId,
    }));

    // Also create edge from source to target
    const parentEdge = {
      id: `e-${sourceNodeId}-${targetNodeId}`,
      source: sourceNodeId,
      target: targetNodeId,
    };

    setEdges((eds) => [...eds, parentEdge, ...newEdges]);
  }, [getEdges, setEdges]);

  // ============================================================================
  // Input Image Tracking
  // ============================================================================

  // Create stable dependency strings to avoid infinite loops
  const inputState = useMemo(() => {
    return nodes
      .filter(isInputNode)
      .map(n => `${n.id}:${n.data.imageUrl || n.data.videoUrl}`)
      .join('|');
  }, [nodes]);

  const edgeState = useMemo(() => {
    return edges.map(e => `${e.source}->${e.target}`).join('|');
  }, [edges]);

  // Update input images for output nodes based on connections
  useEffect(() => {
    setNodes((nds) => nds.map(node => {
      if (node.type === 'outputImage' || node.type === 'outputVideo') {
        const inputEdges = edges.filter((e) => e.target === node.id);
        const inputNodes = nds.filter((n) => inputEdges.some((e) => e.source === n.id));
        
        const inputImages = inputNodes
          .map(n => n.data.imageUrl || n.data.videoUrl)
          .filter(Boolean) as string[];
        
        // Only update if changed to avoid loops
        if (JSON.stringify(node.data.inputImages) !== JSON.stringify(inputImages)) {
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
  }, [inputState, edgeState, setNodes, edges]);

  // ============================================================================
  // Helper Functions
  // ============================================================================

  const getInputImagesForNode = useCallback((nodeId: string): string[] => {
    const currentNodes = getNodes();
    const currentEdges = getEdges();
    
    const inputEdges = currentEdges.filter((e) => e.target === nodeId);
    const inputNodes = currentNodes.filter((n) => inputEdges.some((e) => e.source === n.id));
    
    return inputNodes
      .map(n => n.data.permanentPath || n.data.imageUrl || n.data.videoUrl)
      .filter(Boolean) as string[];
  }, [getNodes, getEdges]);

  const deleteNodeEdges = useCallback((nodeId: string) => {
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
  }, [setEdges]);

  return {
    addEdge,
    copyEdgesToNewNode,
    getInputImagesForNode,
    deleteNodeEdges,
  };
}
