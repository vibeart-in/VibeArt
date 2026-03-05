import { Node, Edge, useReactFlow, XYPosition, useStoreApi } from "@xyflow/react";
import { useCallback, useState } from "react";

export const useSmartGrouping = (
  setNodes: (nds: Node[] | ((nds: Node[]) => Node[])) => void,
  setEdges: (eds: Edge[] | ((eds: Edge[]) => Edge[])) => void,
  takeSnapshot?: () => void,
) => {
  const { getNodes, getEdges, getIntersectingNodes, getNode, toObject } = useReactFlow();
  const store = useStoreApi();
  const [lastTargetId, setLastTargetId] = useState<string | null>(null);

  // Helper to calculate absolute anchor position recursively (the point [node.position.x, node.position.y])
  const getAbsoluteAnchor = useCallback((nodeId: string, currentNodes: Node[]): XYPosition => {
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

  // Helper to calculate the absolute visual top-left of a node recursively
  const getAbsoluteTopLeft = useCallback((nodeId: string, currentNodes: Node[]): XYPosition => {
    const node = currentNodes.find((n) => n.id === nodeId);
    const absAnchor = { x: 0, y: 0 };
    const totalOffset = { x: 0, y: 0 };

    // Traverse up to find the root and accumulate anchor positions
    // But we also need to subtract origin offsets at each level
    let curr = node;
    while (curr) {
      absAnchor.x += curr.position.x;
      absAnchor.y += curr.position.y;

      const width = curr.measured?.width ?? curr.width ?? 0;
      const height = curr.measured?.height ?? curr.height ?? 0;
      const origin = curr.origin ?? [0, 0];

      // The anchor is at position. Top-left is anchor - (origin * size)
      // This offset is specific to the node's own coordinate space
      totalOffset.x += origin[0] * width;
      totalOffset.y += origin[1] * height;

      curr = curr.parentId ? currentNodes.find((n) => n.id === curr!.parentId) : undefined;
    }

    return {
      x: absAnchor.x - totalOffset.x,
      y: absAnchor.y - totalOffset.y,
    };
  }, []);

  const getAbsolutePosition = getAbsoluteAnchor; // Alias for backward compatibility if needed

  const onNodeDragStart = useCallback(
    (_: React.MouseEvent, node: Node) => {
      // Safety: Clear 'extent: parent' if it exists to allow dragging out
      if (node.extent === "parent") {
        setNodes((nds) =>
          nds.map((n) => {
            if (n.id === node.id) {
              return { ...n, extent: undefined };
            }
            return n;
          }),
        );
      }
    },
    [setNodes],
  );

  // Helper to check if a point is within a node's bounds, considering origin
  const isPointInNode = useCallback(
    (point: XYPosition, targetNode: Node, allNodes: Node[]) => {
      const absPos = getAbsolutePosition(targetNode.id, allNodes);
      const width = targetNode.measured?.width ?? targetNode.width ?? 0;
      const height = targetNode.measured?.height ?? targetNode.height ?? 0;
      const origin = targetNode.origin ?? [0, 0];

      const topLeft = {
        x: absPos.x - origin[0] * width,
        y: absPos.y - origin[1] * height,
      };

      return (
        point.x >= topLeft.x &&
        point.x <= topLeft.x + width &&
        point.y >= topLeft.y &&
        point.y <= topLeft.y + height
      );
    },
    [getAbsolutePosition],
  );

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
      while (curr.parentId) {
        depth++;
        const parent = nds.find((pn) => pn.id === curr.parentId);
        if (!parent) break;
        curr = parent;
      }
      return depth;
    };

    return [...nds].sort((a, b) => {
      const depthA = getDepth(a);
      const depthB = getDepth(b);
      if (depthA !== depthB) return depthA - depthB;
      if (a.type === "group" && b.type !== "group") return -1;
      if (a.type !== "group" && b.type === "group") return 1;
      return 0;
    });
  }, []);

  const onNodeDrag = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const nodes = getNodes();
      // For the dragged node, use its current position instead of store position
      const currentNodes = nodes.map((n) => (n.id === node.id ? node : n));
      const absPos = getAbsolutePosition(node.id, currentNodes);

      let targetId: string | null = null;

      if (node.type === "group") {
        // Absorption mode: check if this group contains any OTHER nodes
        const nodesToAbsorb = currentNodes.filter(
          (n) =>
            n.id !== node.id &&
            n.parentId !== node.id && // Not already a child
            n.type !== "group" && // Don't absorb other groups automatically for now
            isPointInNode(
              getCenterPoint(n, getAbsolutePosition(n.id, currentNodes)),
              node,
              currentNodes,
            ),
        );

        if (nodesToAbsorb.length > 0) {
          targetId = node.id;
        }
      } else {
        // Classic mode: check if this node's center is in a group
        const center = getCenterPoint(node, absPos);
        const targetGroup = [...nodes]
          .reverse()
          .find((n) => n.type === "group" && n.id !== node.id && isPointInNode(center, n, nodes));
        targetId = targetGroup?.id || null;
      }

      if (targetId !== lastTargetId) {
        setLastTargetId(targetId);
        setNodes((nds) =>
          nds.map((n) => {
            if (n.type === "group") {
              return {
                ...n,
                data: {
                  ...n.data,
                  isHighlighted: n.id === targetId,
                },
              };
            }
            return n;
          }),
        );
      }
    },
    [getNodes, getAbsolutePosition, isPointInNode, getCenterPoint, setNodes, lastTargetId],
  );

  const onNodeDragStop = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const nodes = getNodes();
      const currentNodes = nodes.map((n) => (n.id === node.id ? node : n));
      const absPos = getAbsoluteAnchor(node.id, currentNodes);

      setNodes((nds) => {
        let updatedNodes = nds.map((n) => {
          // Clear all highlights
          if (n.type === "group") {
            return { ...n, data: { ...n.data, isHighlighted: false } };
          }
          return n;
        });

        if (node.type === "group") {
          // Absorption: reparent all nodes whose centers are within this group
          const groupAbsPos = absPos;
          const groupTopLeft = getAbsoluteTopLeft(node.id, currentNodes);

          const nodesToAbsorb = currentNodes.filter(
            (n) =>
              n.id !== node.id &&
              n.parentId !== node.id &&
              n.type !== "group" &&
              isPointInNode(
                getCenterPoint(n, getAbsoluteAnchor(n.id, currentNodes)),
                node,
                currentNodes,
              ),
          );

          updatedNodes = updatedNodes.map((n) => {
            const match = nodesToAbsorb.find((target) => target.id === n.id);
            if (match) {
              const childAbsAnchor = getAbsoluteAnchor(n.id, currentNodes);
              return {
                ...n,
                parentId: node.id,
                position: {
                  x: childAbsAnchor.x - groupTopLeft.x,
                  y: childAbsAnchor.y - groupTopLeft.y,
                },
                extent: undefined,
              };
            }
            return n;
          });
        } else {
          // Classic: single node reparenting
          const center = getCenterPoint(node, absPos);
          const targetGroup = [...nodes]
            .reverse()
            .find((n) => n.type === "group" && n.id !== node.id && isPointInNode(center, n, nodes));

          updatedNodes = updatedNodes.map((n) => {
            if (n.id === node.id) {
              if (targetGroup && n.parentId !== targetGroup.id) {
                const groupTopLeft = getAbsoluteTopLeft(targetGroup.id, nds);
                const childAbsAnchor = getAbsoluteAnchor(node.id, currentNodes);

                return {
                  ...n,
                  parentId: targetGroup.id,
                  position: {
                    x: childAbsAnchor.x - groupTopLeft.x,
                    y: childAbsAnchor.y - groupTopLeft.y,
                  },
                  extent: undefined,
                };
              } else if (!targetGroup && n.parentId) {
                const childAbsAnchor = getAbsoluteAnchor(node.id, currentNodes);
                return {
                  ...n,
                  parentId: undefined,
                  position: childAbsAnchor,
                  extent: undefined,
                };
              }
            }
            return n;
          });
        }

        return sortNodesHierarchically(updatedNodes);
      });

      setLastTargetId(null);
    },
    [
      getNodes,
      getAbsoluteAnchor,
      getAbsoluteTopLeft,
      isPointInNode,
      getCenterPoint,
      setNodes,
      sortNodesHierarchically,
    ],
  );

  const groupSelection = useCallback(() => {
    const nodes = getNodes();
    const selectedNodes = nodes.filter((n) => n.selected);
    if (selectedNodes.length === 0) return;

    // Calculate bounding box of selected nodes
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;

    selectedNodes.forEach((n) => {
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
    const groupWidth = maxX - minX + padding * 2;
    const groupHeight = maxY - minY + padding * 2;

    const groupId = `group-${crypto.randomUUID()}`;
    const newGroup: Node = {
      id: groupId,
      type: "group",
      position: groupPos,
      data: { label: "New Group" },
      width: groupWidth,
      height: groupHeight,
      zIndex: -1,
      style: { width: groupWidth, height: groupHeight },
    };

    // Update nodes: add new group and reparent selected nodes
    takeSnapshot?.();
    setNodes((nds) => {
      const updatedNodes = nds.map((n) => {
        if (n.selected) {
          const pos = getAbsolutePosition(n.id, nds);
          return {
            ...n,
            parentId: groupId,
            position: {
              x: pos.x - groupPos.x,
              y: pos.y - groupPos.y,
            },
            extent: undefined,
            selected: false,
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
    const groups = selectedNodes.filter((n) => n.type === "group");

    const addChildren = (parentId: string) => {
      const children = nodes.filter((n) => n.parentId === parentId);
      children.forEach((child) => {
        nodesToCopy.add(child);
        if (child.type === "group") addChildren(child.id);
      });
    };
    groups.forEach((g) => addChildren(g.id));

    const finalNodes = Array.from(nodesToCopy);
    const nodeIds = new Set(finalNodes.map((n) => n.id));

    // Copy edges that connect nodes within the selection
    const finalEdges = edges.filter((e) => nodeIds.has(e.source) && nodeIds.has(e.target));

    const clipboardData = {
      nodes: finalNodes,
      edges: finalEdges,
    };

    localStorage.setItem("vibeart-clipboard", JSON.stringify(clipboardData));
  }, [getNodes, getEdges]);

  const pasteSelection = useCallback(() => {
    const clipboardStr = localStorage.getItem("vibeart-clipboard");
    if (!clipboardStr) return;

    const clipboardData = JSON.parse(clipboardStr) as { nodes: Node[]; edges: Edge[] };
    if (!clipboardData.nodes || clipboardData.nodes.length === 0) return;

    const idMap = new Map<string, string>();
    clipboardData.nodes.forEach((n) => idMap.set(n.id, crypto.randomUUID()));

    const newNodes: Node[] = clipboardData.nodes.map((n) => {
      const newId = idMap.get(n.id)!;
      const isParentInSelection = n.parentId && idMap.has(n.parentId);

      const position = { ...n.position };
      if (!isParentInSelection) {
        position.x += 50;
        position.y += 50;
      }

      const finalParentId = isParentInSelection ? idMap.get(n.parentId!) : n.parentId;

      // Remap internal references for AiAppNode (and potentially others)
      const newData = { ...n.data };

      // Remap mainNodeId if it exists and is part of the selection
      if (newData.mainNodeId && typeof newData.mainNodeId === "string") {
        const newMainId = idMap.get(newData.mainNodeId);
        if (newMainId) {
          newData.mainNodeId = newMainId;
          // Also clear activeJobId and status for the new copy to prevent it from picking up old state
          newData.activeJobId = undefined;
          newData.status = undefined;
          newData.hasGenerated = false;
        }
      }

      // Remap outputNodeIds if they exist
      if (Array.isArray(newData.outputNodeIds)) {
        newData.outputNodeIds = newData.outputNodeIds
          .map((oldId: string) => idMap.get(oldId))
          .filter((newId): newId is string => !!newId);
      }

      return {
        ...n,
        id: newId,
        parentId: finalParentId,
        position,
        data: newData,
        selected: true,
      };
    });

    const newEdges: Edge[] = clipboardData.edges.map((e) => ({
      ...e,
      id: crypto.randomUUID(),
      source: idMap.get(e.source)!,
      target: idMap.get(e.target)!,
    }));

    setNodes((nds) => [...nds.map((n) => ({ ...n, selected: false })), ...newNodes]);
    setEdges((eds) => [...eds, ...newEdges]);
  }, [setNodes, setEdges]);

  return {
    onNodeDragStart,
    onNodeDrag,
    onNodeDragStop,
    groupSelection,
    copySelection,
    pasteSelection,
  };
};
