"use client";

import { Node, NodeProps, Position, useReactFlow } from "@xyflow/react";
import NodeLayout from "../NodeLayout";
import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useUpstreamData } from "@/src/utils/xyflow";
import { ImageIcon, Sun, Contrast, Eye, Droplets, Palette, CircleDot, Sparkles, ChevronDown, RotateCcw, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import FilterSlider from "./FilterSlider";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { uploadCanvasToSupabase } from "@/src/utils/canvasUpload";

export type ColorCorrectionNodeData = {
  imageUrl?: string;
  processedImageUrl?: string;
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

const PRESETS = [
  { name: "Vivid", filters: { ...DEFAULT_FILTERS, brightness: 110, contrast: 120, saturation: 140 } },
  { name: "Warm", filters: { ...DEFAULT_FILTERS, sepia: 30, saturation: 110 } },
  { name: "Cool", filters: { ...DEFAULT_FILTERS, hue: 180, saturation: 80 } },
  { name: "Vintage", filters: { ...DEFAULT_FILTERS, sepia: 50, contrast: 90, brightness: 90 } },
  { name: "B&W", filters: { ...DEFAULT_FILTERS, grayscale: 100, contrast: 120 } },
  { name: "Dreamy", filters: { ...DEFAULT_FILTERS, brightness: 110, blur: 1, saturation: 80 } },
];

const BASE_WIDTH = 380;
const EMPTY_HEIGHT = 300;

export default function ColorCorrectionNode({
  id,
  data,
  selected,
}: NodeProps<ColorCorrectionNodeType>) {
  const { updateNodeData, updateNode } = useReactFlow();
  const [isProcessing, setIsProcessing] = useState(false);

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

  // Calculate node dimensions
  const nodeHeight = useMemo(() => {
    if (data.width && data.height) {
      const ratio = data.height / data.width;
      return BASE_WIDTH * ratio + 240; // Add space for controls
    }
    return EMPTY_HEIGHT + 240; // Add space for controls
  }, [data.width, data.height]);

  // Update React Flow node dimensions
  useEffect(() => {
    updateNode(id, {
      width: BASE_WIDTH,
      height: nodeHeight,
    });
  }, [nodeHeight, id, updateNode]);

  const filters = data.filters || DEFAULT_FILTERS;

  const handleFilterChange = (newFilters: typeof DEFAULT_FILTERS) => {
    updateNodeData(id, { filters: newFilters });
  };

  const handleChange = (key: keyof typeof DEFAULT_FILTERS, value: number) => {
    handleFilterChange({ ...filters, [key]: value });
  };

  const handleReset = () => {
    handleFilterChange(DEFAULT_FILTERS);
  };

  const hasChanges = JSON.stringify(filters) !== JSON.stringify(DEFAULT_FILTERS);

  // Generate CSS filter string
  const filterStyle = useMemo(() => {
    return {
      filter: `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturation}%) hue-rotate(${filters.hue}deg) blur(${filters.blur}px) grayscale(${filters.grayscale}%) sepia(${filters.sepia}%) opacity(${filters.opacity}%)`,
    };
  }, [filters]);

  // Generate processed image for downstream consumption
  useEffect(() => {
    if (!data.imageUrl) {
      if (data.processedImageUrl) {
        updateNodeData(id, { processedImageUrl: undefined });
      }
      return;
    }

    const timer = setTimeout(() => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = data.imageUrl!;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          // Use the same filter string as the CSS
          ctx.filter = `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturation}%) hue-rotate(${filters.hue}deg) blur(${filters.blur}px) grayscale(${filters.grayscale}%) sepia(${filters.sepia}%) opacity(${filters.opacity}%)`;
          ctx.drawImage(img, 0, 0);

          setIsProcessing(true);
          uploadCanvasToSupabase(canvas, `corrected_${Date.now()}.jpg`)
            .then((publicUrl) => {
              if (publicUrl !== data.processedImageUrl) {
                updateNodeData(id, { processedImageUrl: publicUrl });
              }
            })
            .catch((err) => {
              console.error("Failed to upload corrected image:", err);
            })
            .finally(() => {
              setIsProcessing(false);
            });
        }
      };
    }, 1500); // 1.5s Debounce to prevent excessive uploads during slider movement

    return () => clearTimeout(timer);
  }, [id, data.imageUrl, filters, updateNodeData]);

  const lightFilters = [
    { key: "brightness" as const, label: "Brightness", icon: Sun, min: 0, max: 200 },
    { key: "contrast" as const, label: "Contrast", icon: Contrast, min: 0, max: 200 },
    { key: "opacity" as const, label: "Opacity", icon: Eye, min: 0, max: 100 },
  ];

  const colorFilters = [
    { key: "saturation" as const, label: "Saturation", icon: Droplets, min: 0, max: 200 },
    { key: "hue" as const, label: "Hue", icon: Palette, min: 0, max: 360, unit: "°", default: 0 },
  ];

  const effectFilters = [
    { key: "blur" as const, label: "Blur", icon: CircleDot, min: 0, max: 20, unit: "px", default: 0 },
    { key: "grayscale" as const, label: "Grayscale", icon: Contrast, min: 0, max: 100, default: 0 },
    { key: "sepia" as const, label: "Sepia", icon: Sparkles, min: 0, max: 100, default: 0 },
  ];

  return (
    <NodeLayout
      selected={selected}
      title="Color correction"
      subtitle=""
      handles={[
        { type: "target", position: Position.Left },
        { type: "source", position: Position.Right },
      ]}
      className="group flex h-full w-full cursor-default flex-col"
      style={{
        width: `${BASE_WIDTH}px`,
        height: `${nodeHeight}px`,
      }}
    >
      <div className="flex h-full w-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#0A0A0A] via-black to-[#0A0A0A] shadow-2xl">
        {/* Image Section */}
        <div className="relative flex-shrink-0" style={{ height: data.width && data.height ? `${BASE_WIDTH * (data.height / data.width)}px` : `${EMPTY_HEIGHT}px` }}>
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
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40" />
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

        {/* Controls Section */}
        <div className="flex flex-col border-t border-white/10 bg-black/40 backdrop-blur-xl">
          {/* Header with Adjustments and Presets */}
          <div className="flex items-center justify-between px-4 py-1">
            <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-[#D9E92B]">Adjustments</h3>
                {isProcessing && <Loader2 className="h-3 w-3 animate-spin text-gray-500" />}
            </div>
            <div className="flex items-center gap-2">
              {/* Presets Dropdown */}
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-300 transition-all hover:bg-white/10 hover:text-white">
                    <span>Presets</span>
                    <ChevronDown className="size-3 opacity-50" />
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    className="z-50 min-w-[140px] rounded-xl border border-[#1D1D1D] bg-[#0A0A0A] p-1.5 shadow-2xl animate-in fade-in zoom-in-95"
                    sideOffset={8}
                  >
                    {PRESETS.map((preset) => (
                      <DropdownMenu.Item
                        key={preset.name}
                        onClick={() => handleFilterChange(preset.filters)}
                        className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm text-gray-300 transition-colors hover:bg-white/10 hover:text-white focus:outline-none"
                      >
                        {preset.name}
                      </DropdownMenu.Item>
                    ))}
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="light" className="w-full">
            <div className="px-3">
              <TabsList className="grid w-full grid-cols-3 bg-white/5 p-1">
                <TabsTrigger
                  value="light"
                  className="rounded-lg text-xs text-gray-400 data-[state=active]:bg-white/10 data-[state=active]:text-white"
                >
                  Light
                </TabsTrigger>
                <TabsTrigger
                  value="color"
                  className="rounded-lg text-xs text-gray-400 data-[state=active]:bg-white/10 data-[state=active]:text-white"
                >
                  Color
                </TabsTrigger>
                <TabsTrigger
                  value="effects"
                  className="rounded-lg text-xs text-gray-400 data-[state=active]:bg-white/10 data-[state=active]:text-white"
                >
                  Effects
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="light" className="mt-0 space-y-3 px-4 py-4">
              {lightFilters.map((filter) => (
                <FilterSlider
                  key={filter.key}
                  label={filter.label}
                  icon={filter.icon}
                  value={filters[filter.key]}
                  onChange={(v) => handleChange(filter.key, v)}
                  min={filter.min}
                  max={filter.max}
                  defaultValue={DEFAULT_FILTERS[filter.key]}
                  unit="%"
                />
              ))}
            </TabsContent>

            <TabsContent value="color" className="mt-0 space-y-3 px-4 py-4">
              {colorFilters.map((filter) => (
                <FilterSlider
                  key={filter.key}
                  label={filter.label}
                  icon={filter.icon}
                  value={filters[filter.key]}
                  onChange={(v) => handleChange(filter.key, v)}
                  min={filter.min}
                  max={filter.max}
                  defaultValue={filter.default ?? DEFAULT_FILTERS[filter.key]}
                  unit={filter.unit ?? "%"}
                />
              ))}
            </TabsContent>

            <TabsContent value="effects" className="mt-0 space-y-3 px-4 py-4">
              {effectFilters.map((filter) => (
                <FilterSlider
                  key={filter.key}
                  label={filter.label}
                  icon={filter.icon}
                  value={filters[filter.key]}
                  onChange={(v) => handleChange(filter.key, v)}
                  min={filter.min}
                  max={filter.max}
                  defaultValue={filter.default ?? DEFAULT_FILTERS[filter.key]}
                  unit={filter.unit ?? "%"}
                />
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </NodeLayout>
  );
}
