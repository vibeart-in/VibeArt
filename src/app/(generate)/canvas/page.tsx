"use client";
import { useState, useCallback } from "react";
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
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import OutputImageNode from "@/src/components/canvas/OutputImageNode";
import InputImageNode from "@/src/components/canvas/InputImageNode";
import PromptNode from "@/src/components/canvas/PromptNode";
import { Node } from "@xyflow/react";
import { Button } from "@/src/components/ui/button";
import { edgeTypes } from "@/src/components/canvas/edges";

const nodeTypes = {
  outputImage: OutputImageNode,
  inputImage: InputImageNode,
  prompt: PromptNode,
};

const initialNodes: Node[] = [
  // --- INPUTS ---
  {
    id: "n0",
    type: "inputImage",
    position: { x: 100, y: 50 },
    data: {
      label: "Base Image",
      imageUrl:
        "https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/6f3cf097-fc07-45a6-bc88-53807c3ee694/original=true,quality=90/112379934.jpeg",
    },
  },
  {
    id: "n1",
    type: "inputImage",
    position: { x: 100, y: 250 },
    data: {
      label: "Reference Style Image",
      imageUrl:
        "https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/bb7fb349-12aa-45e6-a554-5422569af6e1/original=true,quality=90/112364963.jpeg",
    },
  },
  {
    id: "n2",
    type: "inputImage",
    position: { x: 100, y: 450 },
    data: {
      label: "Mask / Overlay",
      imageUrl:
        "https://cdnb.artstation.com/p/assets/images/images/094/305/119/large/christophe-young-90b.webp?1765050018",
    },
  },

  // --- OUTPUT STAGES ---
  {
    id: "n3",
    type: "outputImage",
    style: { width: 300, height: 300 },
    position: { x: 450, y: 50 },
    data: {
      width: 1080,
      height: 1080,
      category: "Stage 1 — Composition",
      model: "Internal Engine",
      prompt: "Combine base with mask",
      inputImageUrls: [
        "https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/6f3cf097-fc07-45a6-bc88-53807c3ee694/original=true,quality=90/112379934.jpeg",
        "https://cdnb.artstation.com/p/assets/images/images/094/305/119/large/christophe-young-90b.webp?1765050018",
        "https://cdna.artstation.com/p/assets/images/images/094/305/900/large/bleeding-sun-wm.jpg?1765051969",
      ],
      imageUrl:
        "https://cdnb.artstation.com/p/assets/images/images/094/200/391/4k/gu-junyi-2.webp?1764749786",
    },
  },

  {
    id: "n4",
    type: "outputImage",
    style: { width: 300, height: 427 },
    position: { x: 450, y: 250 },
    data: {
      width: 1920,
      height: 2735,
      category: "Stage 2 — Style Transfer",
      model: "SDXL Style Merge",
      prompt: "Apply style reference",
      imageUrl:
        "https://cdna.artstation.com/p/assets/images/images/094/305/900/large/bleeding-sun-wm.jpg?1765051969",
    },
  },

  {
    id: "n5",
    type: "outputImage",
    style: { width: 300, height: 375 },
    position: { x: 450, y: 450 },
    data: {
      width: 1080,
      height: 1350,
      category: "Stage 3 — Variant A",
      model: "MJ v7",
      prompt: "Variant A high contrast",
      imageUrl:
        "https://cdna.artstation.com/p/assets/images/images/094/316/118/large/reinaldo-indrajaya-divebound-post.webp?1765102264",
    },
  },

  {
    id: "n6",
    type: "outputImage",
    style: { width: 300, height: 427 },
    position: { x: 450, y: 650 },
    data: {
      width: 1920,
      height: 2735,
      category: "Stage 3 — Variant B",
      model: "MJ v7",
      prompt: "Variant B cinematic lighting",
      imageUrl:
        "https://cdna.artstation.com/p/assets/images/images/094/124/388/large/02-1.webp?1764556788",
    },
  },

  {
    id: "n7",
    type: "outputImage",
    style: { width: 300, height: 300 },
    position: { x: 800, y: 350 },
    data: {
      width: 2288,
      height: 3000,
      category: "Final Result",
      model: "Upscale & Merge",
      prompt: "4K merge of best variants",
      imageUrl:
        "https://cdnb.artstation.com/p/assets/images/images/093/869/577/4k/igor-sid-klbr-01.webp?1763760335",
    },
  },
  {
    id: "n7",
    type: "outputImage",
    style: { width: 384, height: 192 },
    position: { x: 800, y: 350 },
    data: {
      width: 3840,
      height: 1920,
      category: "landscape Result",
      model: "Upscale & Merge",
      prompt: "4K merge of best variants",
      imageUrl:
        "https://cdna.artstation.com/p/assets/images/images/094/316/808/4k/leo-yuanli-witchesden-mainshot.jpg?1765104981",
    },
  },
  {
    id: "n_prompt_1",
    type: "prompt",
    position: { x: 100, y: 650 },
    style: { width: 300, height: 200 },
    data: {
      prompt: "A futuristic city with flying cars and neon lights, cyberpunk style",
    },
  },
];

const initialEdges = [
  // // Base image → first stage
  { id: "e0-3", source: "n0", target: "n3", type: "animated" },
  { id: "e2-3", source: "n2", target: "n3", type: "animated" },
  // // Style reference → style transfer
  // { id: "e1-4", source: "n1", target: "n4" },
  // // Stages feeding into variants
  // { id: "e3-5", source: "n3", target: "n5" },
  // { id: "e4-5", source: "n4", target: "n5" },
  // { id: "e3-6", source: "n3", target: "n6" },
  // { id: "e4-6", source: "n4", target: "n6" },
  // // Both variants go into final merge
  // { id: "e5-7", source: "n5", target: "n7" },
  // { id: "e6-7", source: "n6", target: "n7" },
];

export default function Page() {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  const onNodesChange = useCallback(
    (changes) => setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    [],
  );
  const onEdgesChange = useCallback(
    (changes) => setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    [],
  );
  const onConnect = useCallback(
    (params) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    [],
  );

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        nodeTypes={nodeTypes}
        colorMode="dark"
        proOptions={{ hideAttribution: true }}
        snapToGrid={true}
        snapGrid={[42, 42]}
        minZoom={0.1}
        maxZoom={10}
        defaultEdgeOptions={{
          //   type: "smoothstep",
          //   animated: true,
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
      >
        <Controls />
        <Panel position={"center-right"}>
          <Button>Button</Button>
        </Panel>
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1.5}
          color="#555"
          bgColor="#000"
        />
      </ReactFlow>
    </div>
  );
}
