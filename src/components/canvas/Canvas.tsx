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
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "../ui/context-menu";
import {
  Search,
  Upload,
  Layers,
  Type,
  Image as ImageIcon,
  Video,
  Sparkles,
  Maximize,
  LayoutTemplate,
  Palette,
  Camera,
  Crop,
} from "lucide-react";
import { NodeDropzoneProvider } from "../providers/NodeDropZone";
import { DevTools } from "../devtools";
import { toJpeg, toPng } from "html-to-image";
import { uploadImageAction } from "@/src/actions/canvas/image/upload-image";
import { getNodesBounds, getViewportForBounds } from "@xyflow/react";
import { useCanvasJobOrchestrator } from "@/src/hooks/useCanvasJobOrchestrator";

function CanvasInner({ children, ...props }: ReactFlowProps) {
  const { project, setIsDraggingEdge } = useCanvas();
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
    if (saveState.isSaving || !project?.user_id || !project?.id) {
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
    if (!project?.id || nodes.length === 0) return;

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
        <ContextMenu>
          <ContextMenuTrigger className="block h-full w-full">
            <ReactFlow
              deleteKeyCode={["Backspace", "Delete"]}
              edges={edges}
              edgeTypes={edgeTypes}
              fitView
              // isValidConnection={isValidConnection}
              nodes={nodes}
              nodeTypes={nodeTypes}
              onConnect={handleConnect}
              onConnectStart={handleConnectStart}
              onConnectEnd={handleConnectEnd}
              onEdgesChange={handleEdgesChange}
              onNodesChange={handleNodesChange}
              // panOnScroll
              selectionOnDrag={true}
              colorMode="dark"
              proOptions={{ hideAttribution: true }}
              // snapToGrid={true}
              // snapGrid={[42, 42]}
              minZoom={0.1}
              maxZoom={10}
              // defaultEdgeOptions={{
              //   style: {
              //     stroke: "#4b5563",
              //     strokeWidth: 2,
              //   },
              //   markerEnd: {
              //     type: MarkerType.ArrowClosed,
              //     color: "#4b5563",
              //   },
              // }}
              // connectionLineStyle={{
              //   stroke: "#DFFF00",
              //   strokeWidth: 4,
              // }}
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
          </ContextMenuTrigger>
          <ContextMenuContent className="w-64 border-zinc-800 bg-zinc-900 text-zinc-400">
            <div className="mb-1 flex items-center border-b border-zinc-800 px-2 py-1.5">
              <Search size={14} className="mr-2 text-zinc-500" />
              <input
                className="h-auto w-full border-none bg-transparent p-0 text-sm text-zinc-300 placeholder-zinc-500 outline-none focus:ring-0"
                placeholder="Search"
                onKeyDown={(e) => e.stopPropagation()}
              />
            </div>

            <ContextMenuItem className="focus:bg-zinc-800 focus:text-zinc-100">
              <Upload size={14} className="mr-2" />
              Upload
            </ContextMenuItem>
            <ContextMenuItem className="focus:bg-zinc-800 focus:text-zinc-100">
              <Layers size={14} className="mr-2" />
              Media
            </ContextMenuItem>

            <ContextMenuSeparator className="bg-zinc-800" />

            <ContextMenuLabel className="ml-0 pl-2 text-xs font-normal text-zinc-500">
              NODES
            </ContextMenuLabel>

            <ContextMenuItem
              className="focus:bg-zinc-800 focus:text-zinc-100"
              onClick={() => addNode("prompt")}
            >
              <div className="mr-2 flex h-5 w-5 items-center justify-center rounded bg-emerald-900/50 text-emerald-500">
                <Type size={12} />
              </div>
              Text
            </ContextMenuItem>

            <ContextMenuItem
              className="focus:bg-zinc-800 focus:text-zinc-100"
              onClick={() => addNode("outputImage")}
            >
              <div className="mr-2 flex h-5 w-5 items-center justify-center rounded bg-indigo-900/50 text-indigo-500">
                <ImageIcon size={12} />
              </div>
              Image Generator
            </ContextMenuItem>

            <ContextMenuItem className="focus:bg-zinc-800 focus:text-zinc-100">
              <div className="mr-2 flex h-5 w-5 items-center justify-center rounded bg-purple-900/50 text-purple-500">
                <Video size={12} />
              </div>
              Video Generator
            </ContextMenuItem>

            <ContextMenuItem className="focus:bg-zinc-800 focus:text-zinc-100">
              <div className="mr-2 flex h-5 w-5 items-center justify-center rounded bg-teal-900/50 text-teal-500">
                <Sparkles size={12} />
              </div>
              Assistant
            </ContextMenuItem>

            <ContextMenuItem
              className="focus:bg-zinc-800 focus:text-zinc-100"
              onClick={() =>
                addNode("outputImage", {
                  data: {
                    label: "Upscaled Image",
                    imageUrl:
                      "https://cdn.midjourney.com/815a059b-16c0-4e1f-a2bd-7a9e9f355b53/0_3.png",
                    inputImageUrls: [
                      "https://cdn.midjourney.com/26408988-4b2b-46ab-a06e-3f5770c55a72/0_2.png",
                      "https://cdn.midjourney.com/4625e122-d77e-4fa7-ab9c-f48e1ca53e45/0_0.png",
                    ],
                    prompt:
                      "high quality, 8k, photorealistic, intricate detail, multicolored neon lights, cyberpunk city street at night, rain, reflection, sci-fi",
                    model: "SVD-XT",
                    category: "Image Generation",
                    width: 816,
                    height: 1456,
                  },
                })
              }
            >
              <div className="mr-2 flex h-5 w-5 items-center justify-center rounded bg-blue-900/50 text-blue-500">
                <Maximize size={12} />
              </div>
              Image Upscaler
            </ContextMenuItem>

            <ContextMenuItem
              className="focus:bg-zinc-800 focus:text-zinc-100"
              onClick={() => addNode("presets")}
            >
              <div className="mr-2 flex h-5 w-5 items-center justify-center rounded bg-pink-900/50 text-pink-500">
                <LayoutTemplate size={12} />
              </div>
              Presets
            </ContextMenuItem>

            <ContextMenuItem
              className="focus:bg-zinc-800 focus:text-zinc-100"
              onClick={() => addNode("style")}
            >
              <div className="mr-2 flex h-5 w-5 items-center justify-center rounded bg-orange-900/50 text-orange-500">
                <Palette size={12} />
              </div>
              Style
            </ContextMenuItem>

            <ContextMenuItem
              className="focus:bg-zinc-800 focus:text-zinc-100"
              onClick={() => addNode("checkpoint")}
            >
              <div className="mr-2 flex h-5 w-5 items-center justify-center rounded bg-blue-900/50 text-blue-500">
                <Palette size={12} />
              </div>
              Checkpoint
            </ContextMenuItem>

            <ContextMenuItem
              className="focus:bg-zinc-800 focus:text-zinc-100"
              onClick={() => addNode("lora")}
            >
              <div className="mr-2 flex h-5 w-5 items-center justify-center rounded bg-violet-900/50 text-violet-500">
                <Palette size={12} />
              </div>
              LoRA
            </ContextMenuItem>

            <ContextMenuSeparator className="bg-zinc-800" />

            <ContextMenuLabel className="ml-0 pl-2 text-xs font-normal text-zinc-500">
              UTILITIES
            </ContextMenuLabel>

            <ContextMenuItem
              className="focus:bg-zinc-800 focus:text-zinc-100"
              onClick={() => addNode("colorCorrection")}
            >
              <div className="mr-2 flex h-5 w-5 items-center justify-center rounded bg-amber-900/50 text-amber-500">
                <Palette size={12} />
              </div>
              Color Correction
            </ContextMenuItem>

            <ContextMenuItem
              className="focus:bg-zinc-800 focus:text-zinc-100"
              onClick={() => addNode("crop")}
            >
              <div className="mr-2 flex h-5 w-5 items-center justify-center rounded bg-neutral-800/50 text-neutral-400">
                <Crop size={12} />
              </div>
              Crop
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </NodeDropzoneProvider>
    </NodeOperationsProvider>
  );
}

export default function Canvas(props: ReactFlowProps) {
  return (
    <ReactFlowProvider>
      <CanvasInner {...props} />
    </ReactFlowProvider>
  );
}
