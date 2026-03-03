"use client";

import { IconWindowMaximize } from "@tabler/icons-react";
import {
  Position,
  NodeToolbar as FlowNodeToolbar,
  useNodesData,
  useReactFlow,
} from "@xyflow/react";
import { Download } from "lucide-react";

import { Slider } from "@/src/components/ui/slider";
import { Switch } from "@/src/components/ui/switch";


interface UpscaleToolbarProps {
  id?: string;
  selected: boolean;
  isHovered: boolean;
  handleMouseEnter: () => void;
  handleMouseLeave: () => void;
}

export default function UpscaleToolbar({
  id,
  selected,
  isHovered,
  handleMouseEnter,
  handleMouseLeave,
}: UpscaleToolbarProps) {
  const { updateNodeData } = useReactFlow();
  const nodesData = useNodesData(id || "");
  const imageUrl = (nodesData?.data as any)?.imageUrl;
  const scale = (nodesData?.data as any)?.scale ?? 4;
  const faceEnhance = (nodesData?.data as any)?.face_enhance ?? false;

  const handleScaleChange = (values: number[]) => {
    if (id) {
      updateNodeData(id, { scale: values[0] });
    }
  };

  const handleFaceEnhanceChange = (checked: boolean) => {
    if (id) {
      updateNodeData(id, { face_enhance: checked });
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
      link.download = `upscaled-image-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

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
          <IconWindowMaximize className="size-4" />
        </button>

        {/* Scale Slider Section */}
        <div className="flex h-9 items-center gap-3 rounded-full bg-[#1A1A1A] px-4 text-sm">
          <span className="text-xs text-gray-400">Scale</span>
          <div className="w-24">
            <Slider value={[scale]} min={0} max={10} step={1} onValueChange={handleScaleChange} />
          </div>
          <span className="min-w-[24px] font-mono text-xs text-accent">{scale}x</span>
        </div>

        {/* Face Enhance Switch */}
        <div className="flex h-9 items-center gap-2 rounded-full bg-[#1A1A1A] px-3">
          <span className="text-xs text-gray-400">Face Enhance</span>
          <div className="h-7">
            <Switch
              checked={faceEnhance}
              onCheckedChange={handleFaceEnhanceChange}
              title="Face"
              className="h-7 px-2"
            />
          </div>
        </div>

        {/* Download Button */}
        {imageUrl && (
          <button
            onClick={handleDownload}
            className="flex size-9 items-center justify-center rounded-full bg-[#1A1A1A] text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
            title="Download Upscaled Image"
          >
            <Download className="size-4" />
          </button>
        )}
      </div>
    </FlowNodeToolbar>
  );
}
