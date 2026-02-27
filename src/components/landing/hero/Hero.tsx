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
import { CanvasProvider } from "../../providers/CanvasProvider";

export const Hero = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setIsMobile(width < 768);

      const newNodes = initialNodes.map((node) => {
        let x = node.position.x;
        let y = node.position.y;

        // Center Title Node
        if (node.id === "title") {
          x = width / 2 - 400; // 400 is half of 800px width
          y = height * 0.1; // 10% from top
        }

        // Center & Bottom Align Hero Image Node
        if (node.id === "heroImage") {
          // Assuming image is roughly 60vh wide or similar, centering it loosely
          // The node has h-[70vh]. Positioning `y` at 30% height puts bottom at 100%
          x = width / 2 - (height * 0.8 * 0.8) / 2; // Approximate width based on aspect ratio
          y = height * 0.3; // Starts at 30%, ends at 100% (70vh height)
        }

        // Pin output video node to the right edge of the screen
        if (node.id === "b8be99c6-b189-41d2-a2b0-76621b999759") {
          const nodeWidth = 300; // matches node's width property
          const margin = 100; // gap from the right edge
          x = width - nodeWidth - margin;
          y = height * 0.15; // keep it near the top vertically
        }

        // Pin aiApp node just to the left of the output video node
        if (node.id === "e9fe739a-3318-4985-a8aa-b163da339715") {
          const outputNodeWidth = 300; // same as output node width above
          const outputMargin = 100; // same right margin as output node
          const aiAppNodeWidth = 200; // matches node's width property
          const gap = 60; // space between aiApp and output node
          x = width - outputMargin - outputNodeWidth - gap - aiAppNodeWidth;
          y = height * 0.7; // vertically centered-ish on screen
        }

        return {
          ...node,
          position: { x, y },
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
      <CanvasProvider project={null}>
        <ReactFlowProvider>
          <div className="absolute inset-0 z-10">
            <ReactFlow
              nodes={nodes}
              onNodesChange={onNodesChange}
              edges={edges}
              onEdgesChange={onEdgesChange}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              defaultEdgeOptions={{
                style: {
                  stroke: "#4c4c4c",
                  strokeWidth: 2,
                  strokeDasharray: "none",
                },
              }}
              panOnScroll={false}
              zoomOnScroll={false}
              zoomOnPinch={false}
              zoomOnDoubleClick={false}
              preventScrolling={false}
              panOnDrag={false}
              nodesDraggable={true}
              nodeExtent={[
                [-1000, -1000],
                [3000, 2000],
              ]}
              translateExtent={[
                [-1000, -1000],
                [3000, 2000],
              ]}
              autoPanOnNodeDrag={false}
              minZoom={1}
              maxZoom={1}
              proOptions={{ hideAttribution: true }}
              className="bg-[#050505]"
            >
              <Background
                variant={BackgroundVariant.Dots}
                gap={24}
                size={1.5}
                color="#333"
                bgColor="#000"
              />
            </ReactFlow>
          </div>
        </ReactFlowProvider>
      </CanvasProvider>
    </section>
  );
};
