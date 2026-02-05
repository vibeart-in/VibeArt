"use client";

import {
  ReactFlow,
  Background,
  ReactFlowProvider,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
} from "@xyflow/react";
import React, { useEffect, useState } from "react";

import "@xyflow/react/dist/style.css";
import { initialNodes, initialEdges, nodeTypes, edgeTypes } from "./HeroData";
import { MobileHero } from "./MobileHero";

export const Hero = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);

      // Responsive positioning logic
      let scale = 1;
      if (width < 1000) scale = 0.5;
      else if (width < 1200) scale = 0.7;
      else if (width < 1500) scale = 0.85;

      const titleNode = initialNodes.find((n) => n.id === "title");
      const centerX = titleNode?.position.x || 500;

      const newNodes = initialNodes.map((node) => {
        const newX = centerX + (node.position.x - centerX) * scale;
        return {
          ...node,
          position: {
            x: newX,
            y: node.position.y,
          },
        };
      });

      setNodes(newNodes);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setNodes]);

  if (isMobile) {
    return <MobileHero />;
  }

  return (
    <section className="relative h-screen w-full overflow-hidden bg-[#050505]">
      <ReactFlowProvider>
        <div className="absolute inset-0 z-10">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            panOnScroll={false}
            zoomOnScroll={false}
            zoomOnPinch={false}
            zoomOnDoubleClick={false}
            preventScrolling={false}
            panOnDrag={false}
            nodesDraggable={true}
            onNodeDragStop={(e, node) => {
              console.log("Position:", node.position);
            }}
            nodeExtent={[
              [-1500, -1000],
              [3000, 2000],
            ]}
            translateExtent={[
              [-2000, -1500],
              [4000, 2500],
            ]}
            autoPanOnNodeDrag={false}
            minZoom={0.2}
            maxZoom={1}
            proOptions={{ hideAttribution: true }}
            className="bg-[#050505]"
          >
            <Background variant={BackgroundVariant.Dots} gap={30} size={1} color="#222" />
          </ReactFlow>
        </div>

        {/* Bottom Fade */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-40 bg-gradient-to-t from-black via-black/50 to-transparent" />
      </ReactFlowProvider>
    </section>
  );
};
