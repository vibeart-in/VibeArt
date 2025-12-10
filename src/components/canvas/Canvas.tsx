"use client";

import {
  Edge,
  MarkerType,
  Node,
  ReactFlow,
  ReactFlowProps,
  useReactFlow,
  ReactFlowProvider,
  OnConnect,
  OnConnectStart,
  OnConnectEnd,
  OnEdgesChange,
  OnNodesChange,
  applyNodeChanges,
  applyEdgeChanges,
} from "@xyflow/react";
import { useCallback, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import "@xyflow/react/dist/style.css";
import { edgeTypes } from "./edges/EdgeTypes";
import CustomControls from "./Controls";
import { useCanvas } from "../providers/CanvasProvider";
import { nodeTypes } from "./nodes/Nodetypes";
import { NodeOperationsProvider } from "../providers/NodeProvider";
import { randomUUID } from "crypto";
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
} from "lucide-react";
import { NodeDropzoneProvider } from "../providers/NodeDropZone";

function CanvasInner({ children, ...props }: ReactFlowProps) {
  const { project } = useCanvas();
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

  const [nodes, setNodes] = useState<Node[]>(initialNodes ?? content?.nodes ?? []);
  const [edges, setEdges] = useState<Edge[]>(initialEdges ?? content?.edges ?? []);
  const [copiedNodes, setCopiedNodes] = useState<Node[]>([]);
  const [saveState, setSaveState] = useState<{
    isSaving: boolean;
    lastSaved: Date | null;
  }>({ isSaving: false, lastSaved: null });

  const { getEdges, toObject, screenToFlowPosition, getNodes, getNode, updateNode } =
    useReactFlow();

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
    } catch (error) {
      console.error("Error saving project", error);
    } finally {
      setSaveState((prev) => ({ ...prev, isSaving: false }));
    }
  }, 1000);

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

      setNodes((nds: Node[]) => nds.concat(newNode));
      save();
      return newNode.id;
    },
    [save],
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
      const newEdge: Edge = {
        id: crypto.randomUUID(),
        type: "animated",
        ...connection,
      };
      setEdges((eds: Edge[]) => eds.concat(newEdge));
      save();
      onConnect?.(connection);
    },
    [save, onConnect],
  );

  const handleConnectStart = useCallback<OnConnectStart>(() => {
    // Delete any drop nodes when starting to drag a node
    setNodes((nds: Node[]) => nds.filter((n: Node) => n.type !== "drop"));
    setEdges((eds: Edge[]) => eds.filter((e: Edge) => e.type !== "temporary"));
    save();
  }, [save]);

  const handleConnectEnd = useCallback<OnConnectEnd>(
    (event, connectionState) => {
      // when a connection is dropped on the pane it's not valid

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
    [addNode, screenToFlowPosition],
  );

  const handleEdgesChange = useCallback<OnEdgesChange>(
    (changes) => {
      setEdges((current) => {
        const updated = applyEdgeChanges(changes, current);
        save();
        onEdgesChange?.(changes);
        return updated;
      });
    },
    [save, onEdgesChange],
  );

  const handleNodesChange = useCallback<OnNodesChange>(
    (changes) => {
      setNodes((current) => {
        const updated = applyNodeChanges(changes, current);
        save();
        onNodesChange?.(changes);
        return updated;
      });
    },
    [save, onNodesChange],
  );

  return (
    <NodeOperationsProvider addNode={addNode} duplicateNode={duplicateNode}>
      {/* <NodeDropzoneProvider> */}
      {/* <ContextMenu> */}
      {/* <ContextMenuTrigger className="block h-full w-full"> */}
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
        snapToGrid={true}
        snapGrid={[42, 42]}
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
        // {...rest}
      >
        <CustomControls nodes={nodes} setNodes={setNodes} minZoom={0.25} maxZoom={3} />

        {children}
      </ReactFlow>
      {/* </ContextMenuTrigger>
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

          <ContextMenuItem className="focus:bg-zinc-800 focus:text-zinc-100">
            <div className="mr-2 flex h-5 w-5 items-center justify-center rounded bg-blue-900/50 text-blue-500">
              <Maximize size={12} />
            </div>
            Image Upscaler
          </ContextMenuItem>

          <ContextMenuSeparator className="bg-zinc-800" />

          <ContextMenuLabel className="ml-0 pl-2 text-xs font-normal text-zinc-500">
            UTILITIES
          </ContextMenuLabel>
        </ContextMenuContent>
      </ContextMenu> */}
      {/* </NodeDropzoneProvider> */}
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
