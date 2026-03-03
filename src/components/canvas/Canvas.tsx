"use client";

import {
  Edge,
  Node,
  ReactFlow,
  ReactFlowProps,
  useReactFlow,
  ReactFlowProvider,
  OnConnect,
  OnConnectStart,
  OnConnectEnd,
  OnEdgesChange,
  useNodesState,
  useEdgesState,
  OnNodesChange,
  MarkerType,
} from "@xyflow/react";
import { getNodesBounds, getViewportForBounds } from "@xyflow/react";
import { toJpeg } from "html-to-image";
import { useCallback, useRef, useState, useMemo, useEffect } from "react";
import { useDebouncedCallback } from "use-debounce";
import { toast } from "sonner";

import "@xyflow/react/dist/style.css";
import { uploadImageAction } from "@/src/actions/canvas/image/upload-image";
import { updateProjectAction } from "@/src/actions/canvas/update";
import { useCanvasJobOrchestrator } from "@/src/hooks/useCanvasJobOrchestrator";
import { useSmartGrouping } from "@/src/hooks/useSmartGrouping";

import CustomControls from "./Controls";
import { DevTools } from "../devtools";
import { CanvasContextMenu } from "./CanvasContextMenu";
import { edgeTypes } from "./edges/EdgeTypes";
import { useCanvas } from "../providers/CanvasProvider";
import { nodeTypes } from "./nodes/Nodetypes";
import { NodeDropzoneProvider } from "../providers/NodeDropZone";
import { NodeOperationsProvider } from "../providers/NodeProvider";

function CanvasInner({ children, readOnly, ...props }: ReactFlowProps & { readOnly?: boolean }) {
  const { project, setIsDraggingEdge } = useCanvas();
  const {
    onConnect,
    onConnectStart,
    onConnectEnd,
    onEdgesChange,
    onNodesChange,
    onNodeDragStart,
    nodes: initialNodes,
    edges: initialEdges,
    ...rest
  } = props ?? {};

  const content = project?.content as { nodes: Node[]; edges: Edge[] };

  const [nodes, setNodes, onNodesChangeInternal] = useNodesState(
    initialNodes ?? content?.nodes ?? [],
  );
  const [edges, setEdges, onEdgesChangeInternal] = useEdgesState(
    initialEdges ?? content?.edges ?? [],
  );

  const { onNodeDrag, onNodeDragStop, groupSelection } = useSmartGrouping(setNodes, setEdges);

  // Replaced unused 'copiedNodes' state with a clipboardRef to avoid stale closures
  const clipboardRef = useRef<{ nodes: Node[]; edges: Edge[] }>({ nodes: [], edges: [] });
  const mousePosRef = useRef({ x: 0, y: 0 });

  const [saveState, setSaveState] = useState<{
    isSaving: boolean;
    lastSaved: Date | null;
  }>({ isSaving: false, lastSaved: null });

  const significantChangesRef = useRef(0);
  const CHANGE_THRESHOLD = 3;

  const { getEdges, toObject, screenToFlowPosition, getNodes, getNode, updateNode } =
    useReactFlow();

  useCanvasJobOrchestrator(project?.id ?? "");

  // Track global mouse position for pasting at cursor
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePosRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const save = useDebouncedCallback(async () => {
    if (readOnly || saveState.isSaving || !project?.user_id || !project?.id) {
      return;
    }

    try {
      setSaveState((prev) => ({ ...prev, isSaving: true }));

      const response = await updateProjectAction(project.id, {
        content: toObject(),
      });

      if ("error" in response) {
        throw new Error(response.error);
      }

      setSaveState((prev) => ({ ...prev, lastSaved: new Date() }));
      // saveThumbnail();
    } catch (error) {
      console.error("Error saving project", error);
    } finally {
      setSaveState((prev) => ({ ...prev, isSaving: false }));
    }
  }, 5000);

  const saveThumbnail = useDebouncedCallback(async () => {
    if (readOnly || !project?.id || nodes.length === 0) return;

    try {
      const nodesBounds = getNodesBounds(nodes);
      const imageWidth = 1920;
      const imageHeight = 1080;

      const transform = getViewportForBounds(nodesBounds, imageWidth, imageHeight, 0.5, 2, 0);
      const viewport = document.querySelector(".react-flow__viewport") as HTMLElement;

      if (!viewport) return;

      const dataUrl = await toJpeg(viewport, {
        backgroundColor: "#111",
        width: imageWidth,
        height: imageHeight,
        quality: 0.6,
        skipFonts: true,
        style: {
          width: imageWidth.toString(),
          height: imageHeight.toString(),
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.zoom})`,
        },
      });

      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], "thumbnail.jpg", { type: "image/jpeg" });

      const formData = new FormData();
      formData.append("file", file);
      if (project?.id) {
        formData.append("canvasId", project.id);
        formData.append("customFileName", "thumbnail.jpg");
      }

      const uploadRes = await uploadImageAction(formData);
      if (uploadRes.success && uploadRes.data) {
        await updateProjectAction(project.id, {
          cover: uploadRes.data.imageId,
        });
      }
      significantChangesRef.current = 0;
    } catch (e) {
      console.error("Failed to generate thumbnail", e);
    }
  }, 5000);

  const trackChange = useCallback(
    (count = 1) => {
      significantChangesRef.current += count;
      if (significantChangesRef.current >= CHANGE_THRESHOLD) {
        saveThumbnail();
      }
    },
    [saveThumbnail],
  );

  const addNode = useCallback(
    (type: string, options?: Record<string, unknown>) => {
      const { data: nodeData, ...rest } = options ?? {};
      const newNode: Node = {
        id: crypto.randomUUID(),
        type,
        data: {
          ...(nodeData ? nodeData : {}),
        },
        position: { x: 0, y: 0 },
        origin: [0, 0.5],
        ...rest,
      };

      setNodes((nds) => nds.concat(newNode));

      trackChange(1);
      save();
      return newNode.id;
    },
    [save, trackChange],
  );

  // --- NEW: Copy logic ---
  const handleCopy = useCallback(() => {
    const selectedNodes = getNodes().filter((n) => n.selected);
    if (selectedNodes.length === 0) return;

    const selectedIds = new Set(selectedNodes.map((n) => n.id));
    const selectedEdges = getEdges().filter(
      (e) => selectedIds.has(e.source) && selectedIds.has(e.target),
    );

    clipboardRef.current = { nodes: selectedNodes, edges: selectedEdges };
    toast.success(`Copied ${selectedNodes.length} node(s)`);
  }, [getNodes, getEdges]);

  // --- NEW: Paste at cursor logic ---
  const handlePaste = useCallback(() => {
    const { nodes: clipNodes, edges: clipEdges } = clipboardRef.current;
    if (clipNodes.length === 0) return;

    const clipNodeIds = new Set(clipNodes.map((n) => n.id));
    // Determine top-level copied nodes to calculate accurate bounding box constraints
    const topLevelNodes = clipNodes.filter((n) => !n.parentId || !clipNodeIds.has(n.parentId));

    const minX = Math.min(...topLevelNodes.map((n) => n.position.x));
    const minY = Math.min(...topLevelNodes.map((n) => n.position.y));

    // Convert exact mouse window coordinates to flow coordinates
    const projectedPosition = screenToFlowPosition({
      x: mousePosRef.current.x,
      y: mousePosRef.current.y,
    });

    const newIds = new Map<string, string>();
    const newNodes = clipNodes.map((node) => {
      const newId = crypto.randomUUID();
      newIds.set(node.id, newId);

      const parentId =
        node.parentId && clipNodeIds.has(node.parentId)
          ? newIds.get(node.parentId) // Wait until we map parent IDs correctly
          : undefined;

      // Only move top-level nodes to cursor. Children maintain relative positions.
      const newPosition = parentId
        ? { ...node.position }
        : {
            x: projectedPosition.x + (node.position.x - minX),
            y: projectedPosition.y + (node.position.y - minY),
          };

      return {
        ...node,
        id: newId,
        position: newPosition,
        parentId,
        selected: true,
      };
    });

    // Fix forward references in parentIds if children were processed before parents
    newNodes.forEach((node, index) => {
      const originalNode = clipNodes[index];
      if (originalNode.parentId && clipNodeIds.has(originalNode.parentId)) {
        node.parentId = newIds.get(originalNode.parentId);
      }
    });

    const newEdges = clipEdges.map((edge) => ({
      ...edge,
      id: crypto.randomUUID(),
      source: newIds.get(edge.source)!,
      target: newIds.get(edge.target)!,
      selected: true,
    }));

    setNodes((nds) => nds.map((n) => ({ ...n, selected: false })).concat(newNodes));
    setEdges((eds) => eds.map((e) => ({ ...e, selected: false })).concat(newEdges));

    toast.success(`Pasted ${newNodes.length} node(s)`);
    trackChange(newNodes.length);
    save();
  }, [screenToFlowPosition, setNodes, setEdges, trackChange, save]);

  const handleConnect = useCallback<OnConnect>(
    (connection) => {
      const sourceNode = getNode(connection.source);
      let edgeColor = "#404040"; // Default color

      if (sourceNode?.type === "presets") edgeColor = "#ef4444";
      else if (sourceNode?.type === "style") edgeColor = "#22c55e";
      else if (sourceNode?.type === "lora") edgeColor = "#8b5cf6";
      else if (sourceNode?.type === "checkpoint") edgeColor = "#3b82f6";

      const newEdge: Edge = {
        id: crypto.randomUUID(),
        type: "active",
        ...connection,
        style: { stroke: edgeColor, strokeWidth: 2 },
      };
      setEdges((eds: Edge[]) => eds.concat(newEdge));
      save();
      onConnect?.(connection);
    },
    [save, onConnect, getNode],
  );

  const handleConnectStart = useCallback<OnConnectStart>(() => {
    setNodes((nds: Node[]) => nds.filter((n: Node) => n.type !== "drop"));
    setEdges((eds: Edge[]) => eds.filter((e: Edge) => e.type !== "temporary"));
    setIsDraggingEdge(true);
    save();
  }, [save, setIsDraggingEdge]);

  const handleConnectEnd = useCallback<OnConnectEnd>(
    (event, connectionState) => {
      setIsDraggingEdge(false);

      if (!connectionState.isValid) {
        const { clientX, clientY } = "changedTouches" in event ? event.changedTouches[0] : event;
        const sourceId = connectionState.fromNode?.id;
        const isSourceHandle = connectionState.fromHandle?.type === "source";

        if (!sourceId) return;

        const newNodeId = addNode("drop", {
          position: screenToFlowPosition({ x: clientX, y: clientY }),
          data: { isSource: !isSourceHandle },
        });

        setEdges((eds: Edge[]) =>
          eds.concat({
            id: crypto.randomUUID(),
            source: isSourceHandle ? sourceId : newNodeId,
            target: isSourceHandle ? newNodeId : sourceId,
            type: "temporary",
          }),
        );
      }
    },
    [addNode, screenToFlowPosition, setIsDraggingEdge],
  );

  const handleEdgesChange = useCallback<OnEdgesChange>(
    (changes) => {
      onEdgesChangeInternal(changes);
      save();
      onEdgesChange?.(changes);
    },
    [save, onEdgesChange, onEdgesChangeInternal],
  );

  const handleNodesChange = useCallback<OnNodesChange>(
    (changes) => {
      onNodesChangeInternal(changes);
      save();
      onNodesChange?.(changes);
    },
    [save, onNodesChange, onNodesChangeInternal],
  );

  // --- NEW: Alt + Drag Duplication Interceptor ---
  const handleNodeDragStartCustom = useCallback(
    (event: React.MouseEvent, node: Node, nodesToDrag: Node[]) => {
      if (event.altKey) {
        // Create exact copies left behind unselected (user drags current ones away)
        const draggedIds = new Set(nodesToDrag.map((n) => n.id));
        const duplicatedIds = new Map(nodesToDrag.map((n) => [n.id, crypto.randomUUID()]));

        const duplicatedNodes = nodesToDrag.map((n) => {
          const parentId =
            n.parentId && draggedIds.has(n.parentId) ? duplicatedIds.get(n.parentId) : n.parentId; // Keeps as child if only child is duplicated

          return {
            ...n,
            id: duplicatedIds.get(n.id)!,
            parentId,
            selected: false,
          };
        });

        const duplicatedEdges = getEdges()
          .filter((e) => draggedIds.has(e.source) || draggedIds.has(e.target))
          .map((e) => ({
            ...e,
            id: crypto.randomUUID(),
            source: duplicatedIds.get(e.source) || e.source,
            target: duplicatedIds.get(e.target) || e.target,
            selected: false,
          }));

        setNodes((nds) => nds.concat(duplicatedNodes));
        setEdges((eds) => eds.concat(duplicatedEdges));

        toast.success(`Duplicated ${nodesToDrag.length} node(s)`);
        trackChange(duplicatedNodes.length);
        save();
      }

      onNodeDragStart?.(event, node, nodesToDrag);
    },
    [getEdges, setNodes, setEdges, trackChange, save, onNodeDragStart],
  );

  // Keyboard listeners for Copy/Paste
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        readOnly
      )
        return;

      if ((e.ctrlKey || e.metaKey) && e.key === "c") {
        e.preventDefault();
        handleCopy();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "v") {
        e.preventDefault();
        handlePaste();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleCopy, handlePaste]);

  return (
    <NodeOperationsProvider addNode={addNode}>
      <NodeDropzoneProvider>
        <CanvasContextMenu addNode={addNode} onGroupSelection={groupSelection}>
          <ReactFlow
            deleteKeyCode={["Backspace", "Delete"]}
            edges={edges}
            edgeTypes={edgeTypes}
            fitView
            nodes={nodes}
            nodeTypes={nodeTypes}
            onConnect={handleConnect}
            onConnectStart={handleConnectStart}
            onConnectEnd={handleConnectEnd}
            onEdgesChange={handleEdgesChange}
            onNodesChange={handleNodesChange}
            onNodeDragStart={handleNodeDragStartCustom}
            onNodeDrag={onNodeDrag}
            onNodeDragStop={onNodeDragStop}
            // panOnScroll
            selectionOnDrag={false}
            selectionKeyCode={["Control", "Meta"]}
            multiSelectionKeyCode={["Control", "Meta"]}
            nodesDraggable={!readOnly}
            nodesConnectable={!readOnly}
            elementsSelectable={!readOnly}
            colorMode="dark"
            proOptions={{ hideAttribution: true }}
            minZoom={0.1}
            maxZoom={10}
            connectionRadius={100}
            defaultEdgeOptions={{
              style: { stroke: "#404040", strokeWidth: 2 },
              markerEnd: { type: MarkerType.ArrowClosed, color: "#404040" },
            }}
            connectionLineStyle={{ stroke: "#DFFF00", strokeWidth: 4 }}
            connectionLineContainerStyle={{ zIndex: 0 }}
          >
            <CustomControls
              nodes={nodes}
              setNodes={setNodes}
              minZoom={0.25}
              maxZoom={3}
              isSaving={saveState.isSaving}
              lastSaved={saveState.lastSaved}
            />
            {/* <DevTools position="bottom-left" /> */}
            {children}
          </ReactFlow>
        </CanvasContextMenu>
      </NodeDropzoneProvider>
    </NodeOperationsProvider>
  );
}

export default function Canvas({ readOnly, ...props }: ReactFlowProps & { readOnly?: boolean }) {
  return (
    <ReactFlowProvider>
      <CanvasInner readOnly={readOnly} {...props} />
    </ReactFlowProvider>
  );
}
