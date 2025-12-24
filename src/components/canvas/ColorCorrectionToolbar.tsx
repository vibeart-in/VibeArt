"use client";

import {
  RotateCcw,
  Sun,
  Contrast,
  Droplets,
  Palette,
  CircleDot,
  Eye,
  Sparkles,
  ChevronDown,
  Check,
} from "lucide-react";
import { Position, NodeToolbar as FlowNodeToolbar } from "@xyflow/react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import FilterSlider from "./nodes/FilterSlider";

interface ColorCorrectionToolbarProps {
  id: string;
  selected: boolean;
  isHovered: boolean;
  handleMouseEnter: () => void;
  handleMouseLeave: () => void;
  filters: {
    brightness: number;
    contrast: number;
    saturation: number;
    hue: number;
    blur: number;
    grayscale: number;
    sepia: number;
    opacity: number;
  };
  onFilterChange: (filters: any) => void;
  onReset: () => void;
  hasChanges: boolean;
}

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

export default function ColorCorrectionToolbar({
  id,
  selected,
  isHovered,
  handleMouseEnter,
  handleMouseLeave,
  filters,
  onFilterChange,
  onReset,
  hasChanges,
}: ColorCorrectionToolbarProps) {
  const handleChange = (key: keyof typeof DEFAULT_FILTERS, value: number) => {
    onFilterChange({ ...filters, [key]: value });
  };

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
    <FlowNodeToolbar
      className={selected ? "opacity-100" : "opacity-50 hover:opacity-100"}
      isVisible={selected || isHovered}
      position={Position.Bottom}
      offset={20}
    >
      <div
        className="flex items-center mt-[70px] gap-2 rounded-2xl border border-[#1D1D1D] bg-[#121212] p-2 shadow-2xl backdrop-blur-xl"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Adjustments Dropdown */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="flex h-9 items-center gap-2 rounded-xl bg-[#1A1A1A] px-3 text-sm font-medium text-gray-300 transition-all hover:bg-white/10 hover:text-white">
              <Palette className="size-4" />
              <span>Adjustments</span>
              <ChevronDown className="size-3 opacity-50" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="z-50 w-[320px] rounded-2xl border border-[#1D1D1D] bg-[#0A0A0A] shadow-2xl animate-in fade-in zoom-in-95"
              sideOffset={8}
              align="start"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <h3 className="text-sm font-semibold text-[#D9E92B]">Adjustments</h3>
                {hasChanges && (
                  <button
                    onClick={onReset}
                    className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Reset
                  </button>
                )}
              </div>

              {/* Tabs */}
              <Tabs defaultValue="light" className="w-full">
                <div className="px-3 pt-3">
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

                <TabsContent value="light" className="mt-0 space-y-4 px-4 py-4">
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

                <TabsContent value="color" className="mt-0 space-y-4 px-4 py-4">
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

                <TabsContent value="effects" className="mt-0 space-y-4 px-4 py-4">
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
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        {/* Presets Dropdown */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="flex h-9 items-center gap-2 rounded-xl bg-[#1A1A1A] px-3 text-sm font-medium text-gray-300 transition-all hover:bg-white/10 hover:text-white">
              <Sparkles className="size-4" />
              <span>Presets</span>
              <ChevronDown className="size-3 opacity-50" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="z-50 min-w-[160px] rounded-xl border border-[#1D1D1D] bg-[#0A0A0A] p-1.5 shadow-2xl animate-in fade-in zoom-in-95"
              sideOffset={8}
            >
              {PRESETS.map((preset) => (
                <DropdownMenu.Item
                  key={preset.name}
                  onClick={() => onFilterChange(preset.filters)}
                  className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm text-gray-300 transition-colors hover:bg-white/10 hover:text-white focus:outline-none"
                >
                  {preset.name}
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        {/* Reset Button (when changes exist) */}
        {hasChanges && (
          <button
            onClick={onReset}
            className="flex size-9 items-center justify-center rounded-xl bg-[#1A1A1A] text-gray-300 transition-all hover:bg-red-500/20 hover:text-red-400"
          >
            <RotateCcw className="size-4" />
          </button>
        )}
      </div>
    </FlowNodeToolbar>
  );
}
