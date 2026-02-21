"use client";

import { Position, NodeProps, Node } from "@xyflow/react";
import React from "react";
import { AiApp } from "@/src/constants/aiApps";

import NodeLayout from "@/src/components/canvas/NodeLayout";

export type AiAppNodeData = {
  imageUrl?: string;
  inputImageUrls?: string[];
  width?: number;
  height?: number;
  activeJobId?: string;
  status?: string;
  appData?: AiApp;
  outputImages?: any[];
  processedImagesHash?: string;
  parameterValues?: Record<string, any>;
  outputNodeIds?: string[]; // Track created output nodes for regeneration
  mainNodeId?: string; // Track which node is the main one (connected to AI app)
  hasGenerated?: boolean; // Track if generation has occurred
  [key: string]: unknown;
};

export type HeroAiAppNodeType = Node<AiAppNodeData, "aiApp">;

const BASE_WIDTH = 40;

const HeroAiAppNode = React.memo(({ id, data, selected }: NodeProps<HeroAiAppNodeType>) => {
  return (
    <NodeLayout
      selected={selected}
      title={"Anime to real app"}
      minWidth={BASE_WIDTH}
      minHeight={50}
      keepAspectRatio={true}
      className="flex h-auto w-full cursor-default flex-col rounded-3xl bg-[#1D1D1D] transition-colors duration-200"
      handles={[
        { type: "target", position: Position.Left },
        { type: "source", position: Position.Right },
      ]}
      toolbarHidden={true}
      resizeHidden={true}
    >
      <div className="relative flex h-auto flex-1 flex-col overflow-hidden rounded-3xl bg-[#141414]">
        {/* Full-bleed cover image/video */}
        <div className="relative w-full overflow-hidden">
          <video
            src={
              "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/ai_apps/360_orbit/cover.mp4"
            }
            className="h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
          />

          {/* Bottom gradient overlay — tall & blurred for smooth transition */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/60 to-transparent" />
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-16 backdrop-blur-md"
            style={{
              maskImage: "linear-gradient(to top, black 40%, transparent)",
              WebkitMaskImage: "linear-gradient(to top, black 40%, transparent)",
            }}
          />

          {/* Title + badges overlaid at the bottom */}
          <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2.5 p-5 pb-4">
            <h3 className="text-lg font-extrabold leading-tight tracking-tight text-white drop-shadow-lg">
              360° camera orbit
            </h3>
          </div>
        </div>

        {/* Input Image Section — dashed placeholder */}
        <div className="flex min-h-0 flex-1 flex-col gap-4 px-5 pb-5 pt-3">
          <div className="flex items-center gap-3">
            {/* Dashed border placeholder box */}
            <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-white/15">
              <img
                src="https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/canvas/3c40da91-b7c5-4d89-ae86-91180214e50e/4165c358-8eaf-4729-b3c0-6c7597ad0edd/26fc53c5-bbb6-453e-8d2c-44687ab2e7cb/0.jpeg"
                alt="Input"
                className="h-full w-full object-cover"
              />
            </div>
            {/* Text */}
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold text-white/80">Connected input image</span>
            </div>
          </div>
        </div>
      </div>
    </NodeLayout>
  );
});

HeroAiAppNode.displayName = "HeroAiAppNode";

export default HeroAiAppNode;
