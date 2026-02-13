import { useCallback, useState } from 'react';
import { 
  Node, 
  Edge, 
  useReactFlow, 
  XYPosition, 
  useStoreApi 
} from '@xyflow/react';

export const useSmartGrouping = (
  setNodes: (nds: Node[] | ((nds: Node[]) => Node[])) => void,
  setEdges: (eds: Edge[] | ((eds: Edge[]) => Edge[])) => void,
) => {
  const { 
    getNodes, 
    getEdges, 
    getIntersectingNodes, 
    getNode, 
    toObject 
  } = useReactFlow();
  const store = useStoreApi();
  const [lastTargetId, setLastTargetId] = useState<string | null>(null);

  // Helper to calculate absolute position recursively
  const getAbsolutePosition = useCallback((nodeId: string, currentNodes: Node[]): XYPosition => {
    let node = currentNodes.find((n) => n.id === nodeId);
    let x = 0;
    let y = 0;

    while (node) {
      x += node.position.x;
      y += node.position.y;
      
      const parentId: string | undefined = node.parentId;
      if (parentId) {
        node = currentNodes.find((n) => n.id === parentId);
      } else {
        node = undefined;
      }
    }
    return { x, y };
  }, []);

  const onNodeDragStart = useCallback((_: React.MouseEvent, node: Node) => {
    // Safety: Clear 'extent: parent' if it exists to allow dragging out
    if (node.extent === 'parent') {
      setNodes((nds) => nds.map((n) => {
        if (n.id === node.id) {
          return { ...n, extent: undefined };
        }
        return n;
      }));
    }
  }, [setNodes]);

  // Helper to check if a point is within a node's bounds, considering origin
  const isPointInNode = useCallback((point: XYPosition, targetNode: Node, allNodes: Node[]) => {
    const absPos = getAbsolutePosition(targetNode.id, allNodes);
    const width = targetNode.measured?.width ?? targetNode.width ?? 0;
    const height = targetNode.measured?.height ?? targetNode.height ?? 0;
    const origin = targetNode.origin ?? [0, 0];
    
    const topLeft = {
      x: absPos.x - origin[0] * width,
      y: absPos.y - origin[1] * height
    };

    return (
      point.x >= topLeft.x &&
      point.x <= topLeft.x + width &&
      point.y >= topLeft.y &&
      point.y <= topLeft.y + height
    );
  }, [getAbsolutePosition]);

  const getCenterPoint = useCallback((node: Node, absPos: XYPosition) => {
    const width = node.measured?.width ?? node.width ?? 0;
    const height = node.measured?.height ?? node.height ?? 0;
    const origin = node.origin ?? [0, 0];
    
    return {
      x: absPos.x - origin[0] * width + width / 2,
      y: absPos.y - origin[1] * height + height / 2,
    };
  }, []);

  const sortNodesHierarchically = useCallback((nds: Node[]) => {
    const getDepth = (n: Node): number => {
      let depth = 0;
      let curr = n;
      const visited = new Set<string>();
      while (curr.parentId && !visited.has(curr.id)) {
        visited.add(curr.id);
        depth++;
        const parentId: string = curr.parentId; // Guaranteed truthy by while
        const parent = nds.find(pn => pn.id === parentId);
        if (!parent) break;
        curr = parent;
      }
      return depth;
    };

    return [...nds].sort((a, b) => {
      const depthA = getDepth(a);
      const depthB = getDepth(b);
      if (depthA !== depthB) return depthA - depthB;
      if (a.type === 'group' && b.type !== 'group') return -1;
      if (a.type !== 'group' && b.type === 'group') return 1;
      return 0;
    });
  }, []);

  const onNodeDrag = useCallback((_: React.MouseEvent, node: Node) => {
    const nodes = getNodes();
    const absPos = getAbsolutePosition(node.id, nodes);
    const center = getCenterPoint(node, absPos);
    
    // Find groups that contain the dragged node center
    const targetGroup = [...nodes].reverse().find(n => 
      n.type === 'group' && n.id !== node.id && isPointInNode(center, n, nodes)
    );
    const targetId = targetGroup?.id || null;

    if (targetId !== lastTargetId) {
      setLastTargetId(targetId);
      setNodes((nds) => nds.map((n) => {
        if (n.type === 'group') {
          return {
            ...n,
            data: {
              ...n.data,
              isHighlighted: n.id === targetId
            }
          };
        }
        return n;
      }));
    }
  }, [getNodes, getAbsolutePosition, isPointInNode, setNodes, lastTargetId]);

  const onNodeDragStop = useCallback((_: React.MouseEvent, node: Node) => {
    const nodes = getNodes();
    const absoluteNodePos = getAbsolutePosition(node.id, nodes);
    const center = getCenterPoint(node, absoluteNodePos);

    // Find overlapping group (center point check)
    const targetGroup = [...nodes].reverse().find(n => 
      n.type === 'group' && n.id !== node.id && isPointInNode(center, n, nodes)
    );

    // Helper for hierarchical sorting
    const getSortOrder = (nds: Node[]) => {
      const getDepth = (n: Node): number => {
        let depth = 0;
        let curr = n;
        while (curr.parentId) {
          depth++;
          const parent = nds.find(pn => pn.id === curr.parentId);
          if (!parent) break;
          curr = parent;
        }
        return depth;
      };

      return [...nds].sort((a, b) => {
        const depthA = getDepth(a);
        const depthB = getDepth(b);
        if (depthA !== depthB) return depthA - depthB;
        if (a.type === 'group' && b.type !== 'group') return -1;
        if (a.type !== 'group' && b.type === 'group') return 1;
        return 0;
      });
    };

    // Clear highlights and update parenting atomicly
    setNodes((nds) => {
      const updatedNodes = nds.map((n) => {
        if (n.type === 'group') {
          return { ...n, data: { ...n.data, isHighlighted: false } };
        }
        if (n.id === node.id) {
          if (targetGroup && n.parentId !== targetGroup.id) {
            const groupAbsPos = getAbsolutePosition(targetGroup.id, nds);
            return {
              ...n,
              parentId: targetGroup.id,
              position: {
                x: absoluteNodePos.x - groupAbsPos.x,
                y: absoluteNodePos.y - groupAbsPos.y,
              },
              extent: undefined,
            };
          } else if (!targetGroup && n.parentId) {
            return {
              ...n,
              parentId: undefined,
              position: absoluteNodePos,
              extent: undefined,
            };
          }
        }
        return n;
      });

      return sortNodesHierarchically(updatedNodes);
    });
    
    setLastTargetId(null);
  }, [getNodes, getAbsolutePosition, isPointInNode, getCenterPoint, setNodes]);

  const groupSelection = useCallback(() => {
    const nodes = getNodes();
    const selectedNodes = nodes.filter(n => n.selected);
    if (selectedNodes.length === 0) return;

    // Calculate bounding box of selected nodes
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    selectedNodes.forEach(n => {
      const pos = getAbsolutePosition(n.id, nodes);
      const w = n.measured?.width ?? n.width ?? 200;
      const h = n.measured?.height ?? n.height ?? 200;
      
      minX = Math.min(minX, pos.x);
      minY = Math.min(minY, pos.y);
      maxX = Math.max(maxX, pos.x + w);
      maxY = Math.max(maxY, pos.y + h);
    });

    const padding = 50;
    const groupPos = { x: minX - padding, y: minY - padding };
    const groupWidth = (maxX - minX) + (padding * 2);
    const groupHeight = (maxY - minY) + (padding * 2);

    const groupId = `group-${crypto.randomUUID()}`;
    const newGroup: Node = {
      id: groupId,
      type: 'group',
      position: groupPos,
      data: { label: 'New Group' },
      width: groupWidth,
      height: groupHeight,
      zIndex: -1,
      style: { width: groupWidth, height: groupHeight },
    };

    // Update nodes: add new group and reparent selected nodes
    setNodes((nds) => {
      const updatedNodes = nds.map(n => {
        if (n.selected) {
          const pos = getAbsolutePosition(n.id, nds);
          return {
            ...n,
            parentId: groupId,
            position: {
              x: pos.x - groupPos.x,
              y: pos.y - groupPos.y
            },
            extent: undefined,
            selected: false
          };
        }
        return n;
      });
      
      return sortNodesHierarchically([newGroup, ...updatedNodes]);
    });
  }, [getNodes, getAbsolutePosition, setNodes]);

  const copySelection = useCallback(() => {
    const nodes = getNodes();
    const edges = getEdges();
    const selectedNodes = nodes.filter((n) => n.selected);
    if (selectedNodes.length === 0) return;

    // Include children of selected groups recursively
    const nodesToCopy = new Set<Node>(selectedNodes);
    const groups = selectedNodes.filter(n => n.type === 'group');
    
    const addChildren = (parentId: string) => {
      const children = nodes.filter(n => n.parentId === parentId);
      children.forEach(child => {
        nodesToCopy.add(child);
        if (child.type === 'group') addChildren(child.id);
      });
    };
    groups.forEach(g => addChildren(g.id));

    const finalNodes = Array.from(nodesToCopy);
    const nodeIds = new Set(finalNodes.map(n => n.id));
    
    // Copy edges where at least one node is in the selection
    const finalEdges = edges.filter(e => nodeIds.has(e.source) || nodeIds.has(e.target));

    const clipboardData = {
      nodes: finalNodes,
      edges: finalEdges,
    };
    
    localStorage.setItem('vibeart-clipboard', JSON.stringify(clipboardData));
  }, [getNodes, getEdges]);

  const pasteSelection = useCallback(() => {
    const clipboardStr = localStorage.getItem('vibeart-clipboard');
    if (!clipboardStr) return;
    
    const clipboardData = JSON.parse(clipboardStr) as { nodes: Node[], edges: Edge[] };
    if (!clipboardData.nodes || clipboardData.nodes.length === 0) return;

    const idMap = new Map<string, string>();
    clipboardData.nodes.forEach(n => idMap.set(n.id, crypto.randomUUID()));

    const newNodes: Node[] = clipboardData.nodes.map(n => {
      const newId = idMap.get(n.id)!;
      const isParentInSelection = n.parentId && idMap.has(n.parentId);
      
      let position = { ...n.position };
      if (!isParentInSelection) {
        position.x += 50;
        position.y += 50;
      }

      const finalParentId = isParentInSelection ? idMap.get(n.parentId!) : n.parentId;

      return {
        ...n,
        id: newId,
        parentId: finalParentId,
        position,
        selected: true,
      };
    });

    const newEdges: Edge[] = clipboardData.edges.map(e => ({
      ...e,
      id: crypto.randomUUID(),
      source: idMap.has(e.source) ? idMap.get(e.source)! : e.source,
      target: idMap.has(e.target) ? idMap.get(e.target)! : e.target,
    }));

    setNodes((nds) => {
      const deselected = nds.map(n => ({ ...n, selected: false }));
      return sortNodesHierarchically(deselected.concat(newNodes));
    });
    setEdges((eds) => eds.concat(newEdges));
  }, [setNodes, setEdges, sortNodesHierarchically]);

  return {
    onNodeDragStart,
    onNodeDrag,
    onNodeDragStop,
    groupSelection,
    copySelection,
    pasteSelection,
  };
};
