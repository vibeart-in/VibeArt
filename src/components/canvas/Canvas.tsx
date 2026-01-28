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
import { useCallback, useRef, useState, useMemo } from "react";
import { useDebouncedCallback } from "use-debounce";
import "@xyflow/react/dist/style.css";
import { edgeTypes } from "./edges/EdgeTypes";
import CustomControls from "./Controls";
import { useCanvas } from "../providers/CanvasProvider";
import { nodeTypes } from "./nodes/Nodetypes";
import { NodeOperationsProvider } from "../providers/NodeProvider";
import { updateProjectAction } from "@/src/actions/canvas/update";
import { NodeDropzoneProvider } from "../providers/NodeDropZone";
import { DevTools } from "../devtools";
import { toJpeg, toPng } from "html-to-image";
import { uploadImageAction } from "@/src/actions/canvas/image/upload-image";
import { getNodesBounds, getViewportForBounds } from "@xyflow/react";
import { useCanvasJobOrchestrator } from "@/src/hooks/useCanvasJobOrchestrator";
import { CanvasContextMenu } from "./CanvasContextMenu";

function CanvasInner({ children, ...props }: ReactFlowProps) {
  const { project, setIsDraggingEdge, isReadOnly } = useCanvas();
  const {
    onConnect,
    onConnectStart,
    onConnectEnd,
    onEdgesChange,
    onNodesChange,
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
  const [copiedNodes, setCopiedNodes] = useState<Node[]>([]);
  const [saveState, setSaveState] = useState<{
    isSaving: boolean;
    lastSaved: Date | null;
  }>({ isSaving: false, lastSaved: null });

  const significantChangesRef = useRef(0);
  const CHANGE_THRESHOLD = 3;

  const { getEdges, toObject, screenToFlowPosition, getNodes, getNode, updateNode } =
    useReactFlow();

  useCanvasJobOrchestrator(project?.id ?? "");

  const save = useDebouncedCallback(async () => {
    if (isReadOnly || saveState.isSaving || !project?.user_id || !project?.id) {
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
    if (isReadOnly || !project?.id || nodes.length === 0) return;

    try {
      const nodesBounds = getNodesBounds(nodes);
      // 1. Reduce resolution (1280x720 is plenty for a thumbnail)
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

      console.log("NEW THUMBNAIL");
      console.log(
        "%c ",
        `
        font-size: 1px;
        padding: 300px 400px;
        background: url(${dataUrl}) no-repeat;
        background-size: contain;
        `,
      );
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      // 3. Change filename to .jpg
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
      console.log("Thumbnail updated after significant changes");
    } catch (e) {
      console.error("Failed to generate thumbnail", e);
    }
  }, 5000);

  // 4. Create a helper to track changes
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

      trackChange(1); // Increment counter
      save();
      return newNode.id;
    },
    [save, trackChange],
  );

  const duplicateNode = useCallback(
    (id: string) => {
      const node = getNode(id);

      if (!(node && node.type)) {
        return;
      }

      const { id: oldId, ...rest } = node;

      const newId = addNode(node.type, {
        ...rest,
        position: {
          x: node.position.x + 200,
          y: node.position.y + 200,
        },
        selected: true,
      });

      setTimeout(() => {
        updateNode(id, { selected: false });
        updateNode(newId, { selected: true });
      }, 0);
    },
    [addNode, getNode, updateNode],
  );

  const handleConnect = useCallback<OnConnect>(
    (connection) => {
      const sourceNode = getNode(connection.source);
      const targetNode = getNode(connection.target);

      let edgeColor = "#4b5563"; // Default color

      if (sourceNode?.type === "presets") {
        edgeColor = "#ef4444"; // Red
      } else if (sourceNode?.type === "style") {
        edgeColor = "#22c55e"; // Green
      } else if (sourceNode?.type === "lora") {
        edgeColor = "#8b5cf6"; // Violet
      } else if (sourceNode?.type === "checkpoint") {
        edgeColor = "#3b82f6"; // Blue
      }

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
    // Delete any drop nodes when starting to drag a node
    setNodes((nds: Node[]) => nds.filter((n: Node) => n.type !== "drop"));
    setEdges((eds: Edge[]) => eds.filter((e: Edge) => e.type !== "temporary"));
    setIsDraggingEdge(true);
    save();
  }, [save, setIsDraggingEdge]);

  const handleConnectEnd = useCallback<OnConnectEnd>(
    (event, connectionState) => {
      // when a connection is dropped on the pane it's not valid
      setIsDraggingEdge(false);

      if (!connectionState.isValid) {
        // we need to remove the wrapper bounds, in order to get the correct position
        const { clientX, clientY } = "changedTouches" in event ? event.changedTouches[0] : event;

        const sourceId = connectionState.fromNode?.id;
        const isSourceHandle = connectionState.fromHandle?.type === "source";

        if (!sourceId) {
          return;
        }

        const newNodeId = addNode("drop", {
          position: screenToFlowPosition({ x: clientX, y: clientY }),
          data: {
            isSource: !isSourceHandle,
          },
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

      // Filter for 'add' or 'remove' events
      const structuralChanges = changes.filter(
        (c) => c.type === "add" || c.type === "remove",
      ).length;

      if (structuralChanges > 0) {
        trackChange(structuralChanges);
      }

      save(); // JSON data still saves normally (1s debounce)
      onNodesChange?.(changes);
    },
    [save, trackChange, onNodesChange, onNodesChangeInternal],
  );

  const nodeOpsValue = useMemo(() => ({ addNode, duplicateNode }), [addNode, duplicateNode]);

  return (
    <NodeOperationsProvider addNode={addNode} duplicateNode={duplicateNode}>
      <NodeDropzoneProvider>
        <CanvasContextMenu addNode={addNode} isReadOnly={isReadOnly}>
          <ReactFlow
            deleteKeyCode={isReadOnly ? [] : ["Backspace", "Delete"]}
            edges={edges}
            edgeTypes={edgeTypes}
            fitView
            // isValidConnection={isValidConnection}
            nodes={nodes}
            nodeTypes={nodeTypes}
            onConnect={isReadOnly ? undefined : handleConnect}
            onConnectStart={isReadOnly ? undefined : handleConnectStart}
            onConnectEnd={isReadOnly ? undefined : handleConnectEnd}
            onEdgesChange={isReadOnly ? undefined : handleEdgesChange}
            onNodesChange={isReadOnly ? undefined : handleNodesChange}
            nodesDraggable={!isReadOnly}
            nodesConnectable={!isReadOnly}
            nodesFocusable={!isReadOnly}
            edgesFocusable={!isReadOnly}
            elementsSelectable={true}
            // panOnScroll
            selectionOnDrag={!isReadOnly}
            colorMode="dark"
            proOptions={{ hideAttribution: true }}
            // snapToGrid={true}
            // snapGrid={[42, 42]}
            minZoom={0.1}
            maxZoom={10}
            defaultEdgeOptions={{
              style: {
                stroke: "#4b5563",
                strokeWidth: 2,
              },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: "#4b5563",
              },
            }}
            connectionLineStyle={{
              stroke: "#DFFF00",
              strokeWidth: 4,
            }}
            connectionLineContainerStyle={{ zIndex: 0 }}
            // {...rest}
          >
            <CustomControls
              nodes={nodes}
              setNodes={setNodes}
              minZoom={0.25}
              maxZoom={3}
              isSaving={saveState.isSaving}
              lastSaved={saveState.lastSaved}
            />
            <DevTools position="bottom-left" />
            {children}
          </ReactFlow>
        </CanvasContextMenu>
      </NodeDropzoneProvider>
    </NodeOperationsProvider>
  );
}

function checkIntersection(n1: Node, n2: Node) {
  const n1w = n1.measured?.width ?? n1.width ?? 0;
  const n1h = n1.measured?.height ?? n1.height ?? 0;
  const n2w = n2.measured?.width ?? n2.width ?? 0;
  const n2h = n2.measured?.height ?? n2.height ?? 0;

  const n1x = n1.position.x;
  const n1y = n1.position.y;
  const n2x = n2.position.x;
  const n2y = n2.position.y;

  return n1x + n1w > n2x && n1x < n2x + n2w && n1y + n1h > n2y && n1y < n2y + n2h;
}

export default function Canvas(props: ReactFlowProps) {
  return (
    <ReactFlowProvider>
      <CanvasInner {...props} />
    </ReactFlowProvider>
  );
}
