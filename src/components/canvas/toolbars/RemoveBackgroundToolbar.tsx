"use client";

import { Download } from "lucide-react";
import {
  Position,
  NodeToolbar as FlowNodeToolbar,
  useNodesData,
  useReactFlow,
} from "@xyflow/react";
import { Slider } from "@/src/components/ui/slider";
import { Switch } from "@/src/components/ui/switch";
import { Sparkles } from "lucide-react";
import { QualityLevel } from "../nodes/RemoveBackgroundNode";

interface RemoveBackgroundToolbarProps {
  id?: string;
  selected: boolean;
  isHovered: boolean;
  handleMouseEnter: () => void;
  handleMouseLeave: () => void;
}

export default function RemoveBackgroundToolbar({
  id,
  selected,
  isHovered,
  handleMouseEnter,
  handleMouseLeave,
}: RemoveBackgroundToolbarProps) {
  const { updateNodeData } = useReactFlow();
  const nodesData = useNodesData(id || "");
  const imageUrl = (nodesData?.data as any)?.imageUrl;
  const qualityLevel: QualityLevel = (nodesData?.data as any)?.qualityLevel ?? "medium";

  // Level 1 (cheap) parameters
  const threshold = (nodesData?.data as any)?.threshold ?? 0;
  const reverse = (nodesData?.data as any)?.reverse ?? false;

  // Level 3 (best) parameters
  const preserveAlpha = (nodesData?.data as any)?.preserve_alpha ?? true;

  const handleQualityChange = (level: QualityLevel) => {
    if (id) {
      updateNodeData(id, { qualityLevel: level });
    }
  };

  const handleThresholdChange = (values: number[]) => {
    if (id) {
      updateNodeData(id, { threshold: values[0] });
    }
  };

  const handleReverseChange = (checked: boolean) => {
    if (id) {
      updateNodeData(id, { reverse: checked });
    }
  };

  const handlePreserveAlphaChange = (checked: boolean) => {
    if (id) {
      updateNodeData(id, { preserve_alpha: checked });
    }
  };

  const handleDownload = async () => {
    if (!imageUrl) return;
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `background-removed-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const qualityLevels: { value: QualityLevel; label: string; credits: number }[] = [
    { value: "cheap", label: "Low", credits: 1 },
    { value: "medium", label: "Med", credits: 2 },
    { value: "best", label: "Best", credits: 3 },
  ];

  return (
    <FlowNodeToolbar
      className={selected ? "opacity-100" : "opacity-50 hover:opacity-100"}
      isVisible={selected || isHovered}
      position={Position.Bottom}
      offset={20}
    >
      <div
        className="flex items-center gap-2 rounded-full border border-[#1D1D1D] bg-[#121212] p-1.5 shadow-2xl"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Model Icon */}
        <button className="flex h-9 items-center gap-2 rounded-full bg-[#1A1A1A] px-3 text-gray-300 transition-colors hover:bg-white/10 hover:text-white">
          <Sparkles className="size-4" />
        </button>

        {/* Quality Level Selector */}
        <div className="flex h-9 items-center gap-1 rounded-full bg-[#1A1A1A] px-2">
          {qualityLevels.map((level) => (
            <button
              key={level.value}
              onClick={() => handleQualityChange(level.value)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                qualityLevel === level.value
                  ? "bg-accent text-black"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              {level.label}
              <span className="ml-1 opacity-60">({level.credits}c)</span>
            </button>
          ))}
        </div>

        {/* Level 1 (Cheap) - Threshold Slider */}
        {qualityLevel === "cheap" && (
          <>
            <div className="flex h-9 items-center gap-3 rounded-full bg-[#1A1A1A] px-4 text-sm">
              <span className="text-xs text-gray-400">Threshold</span>
              <div className="w-24">
                <Slider
                  value={[threshold]}
                  min={0}
                  max={1}
                  step={0.1}
                  onValueChange={handleThresholdChange}
                />
              </div>
              <span className="min-w-[32px] font-mono text-xs text-accent">
                {threshold.toFixed(1)}
              </span>
            </div>

            {/* Reverse Switch */}
            <div className="flex h-9 items-center gap-2 rounded-full bg-[#1A1A1A] px-3">
              <span className="text-xs text-gray-400">Reverse</span>
              <div className="h-7">
                <Switch
                  checked={reverse}
                  onCheckedChange={handleReverseChange}
                  title="Reverse"
                  className="h-7 px-2"
                />
              </div>
            </div>
          </>
        )}

        {/* Level 3 (Best) - Preserve Alpha */}
        {qualityLevel === "best" && (
          <div className="flex h-9 items-center gap-2 rounded-full bg-[#1A1A1A] px-3">
            <span className="text-xs text-gray-400">Preserve Alpha</span>
            <div className="h-7">
              <Switch
                checked={preserveAlpha}
                onCheckedChange={handlePreserveAlphaChange}
                title="Preserve Alpha"
                className="h-7 px-2"
              />
            </div>
          </div>
        )}

        {/* Download Button */}
        {imageUrl && (
          <button
            onClick={handleDownload}
            className="flex size-9 items-center justify-center rounded-full bg-[#1A1A1A] text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
            title="Download Image"
          >
            <Download className="size-4" />
          </button>
        )}
      </div>
    </FlowNodeToolbar>
  );
}
