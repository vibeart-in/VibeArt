"use client";

import { Node, NodeProps, Position, useReactFlow } from "@xyflow/react";
import NodeLayout from "../NodeLayout";
import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useUpstreamData } from "@/src/utils/xyflow";
import { ImageIcon } from "lucide-react";
import ColorCorrectionToolbar from "../ColorCorrectionToolbar";

export type ColorCorrectionNodeData = {
  imageUrl?: string;
  width?: number;
  height?: number;
  filters?: {
    brightness: number;
    contrast: number;
    saturation: number;
    hue: number;
    blur: number;
    grayscale: number;
    sepia: number;
    opacity: number;
  };
  [key: string]: unknown;
};

export type ColorCorrectionNodeType = Node<ColorCorrectionNodeData, "colorCorrection">;

const DEFAULT_FILTERS = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  hue: 0,
  blur: 0,
  grayscale: 0,
  sepia: 0,
  opacity: 100,
};

const BASE_WIDTH = 320;
const EMPTY_HEIGHT = 300;

export default function ColorCorrectionNode({
  id,
  data,
  selected,
}: NodeProps<ColorCorrectionNodeType>) {
  const { updateNodeData, updateNode } = useReactFlow();
  const [isHovered, setIsHovered] = useState(false);

  // Get image and dimensions from upstream connections
  const { images, dimensions } = useUpstreamData("target");
  const upstreamImage = images[0];

  // Sync upstream image and dimensions to node data
  useEffect(() => {
    const updates: Partial<ColorCorrectionNodeData> = {};
    let hasUpdates = false;

    if (upstreamImage && upstreamImage !== data.imageUrl) {
      updates.imageUrl = upstreamImage;
      hasUpdates = true;
    }

    if (dimensions) {
      if (dimensions.width !== data.width) {
        updates.width = dimensions.width;
        hasUpdates = true;
      }
      if (dimensions.height !== data.height) {
        updates.height = dimensions.height;
        hasUpdates = true;
      }
    }

    if (hasUpdates) {
      updateNodeData(id, updates);
    }
  }, [upstreamImage, dimensions, data.imageUrl, data.width, data.height, id, updateNodeData]);

  // Update React Flow node dimensions based on image size
  useEffect(() => {
    if (data.width && data.height) {
      const ratio = data.height / data.width;
      updateNode(id, {
        width: BASE_WIDTH,
        height: BASE_WIDTH * ratio,
      });
    } else {
      // Empty state: fixed dimensions
      updateNode(id, {
        width: BASE_WIDTH,
        height: EMPTY_HEIGHT,
      });
    }
  }, [data.width, data.height, id, updateNode]);

  const filters = data.filters || DEFAULT_FILTERS;

  const handleFilterChange = (newFilters: typeof DEFAULT_FILTERS) => {
    updateNodeData(id, { filters: newFilters });
  };

  const handleReset = () => {
    handleFilterChange(DEFAULT_FILTERS);
  };

  const hasChanges = JSON.stringify(filters) !== JSON.stringify(DEFAULT_FILTERS);

  // Generate CSS filter string
  const filterStyle = useMemo(() => {
    return {
      filter: `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturation}%) hue-rotate(${filters.hue}deg) blur(${filters.blur}px) grayscale(${filters.grayscale}%) sepia(${filters.sepia}%)`,
      opacity: filters.opacity / 100,
    };
  }, [filters]);

  return (
    <>
      <NodeLayout
        selected={selected}
        title="Color Correction"
        subtitle="Utilities"
        handles={[
          { type: "target", position: Position.Left },
          { type: "source", position: Position.Right },
        ]}
        className="group flex h-full w-full cursor-default flex-col"
        style={{
          width: `${BASE_WIDTH}px`,
          height: data.width && data.height ? `${BASE_WIDTH * (data.height / data.width)}px` : `${EMPTY_HEIGHT}px`,
        }}
      >
        <div
          className="relative h-full w-full overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-gray-900 to-black shadow-xl"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {data.imageUrl ? (
            <>
              <motion.img
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                src={data.imageUrl}
                alt="Color Correction"
                className="h-full w-full object-cover"
                style={filterStyle}
                draggable={false}
              />
              {/* Subtle overlay gradient */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
              
              {/* Filter indicator badge */}
              {hasChanges && (
                <div className="absolute right-3 top-3 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 backdrop-blur-md">
                  <span className="text-xs font-medium text-amber-200">Filtered</span>
                </div>
              )}
            </>
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-4 text-gray-500">
              <div className="rounded-full bg-white/5 p-6">
                <ImageIcon size={48} strokeWidth={1.5} />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-400">No Image Connected</p>
                <p className="mt-1 text-xs text-gray-600">Connect an image node to start</p>
              </div>
            </div>
          )}
        </div>
      </NodeLayout>

      {/* Integrated Toolbar */}
      
      <ColorCorrectionToolbar
        id={id}
        selected={selected}
        isHovered={isHovered}
        handleMouseEnter={() => setIsHovered(true)}
        handleMouseLeave={() => setIsHovered(false)}
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleReset}
        hasChanges={hasChanges}
      />
    </>
  );
}
