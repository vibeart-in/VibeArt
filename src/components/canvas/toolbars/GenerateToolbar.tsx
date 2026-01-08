"use client";

import { Sparkles, ChevronDown, Settings, Palette, Download } from "lucide-react";
import { Position, NodeToolbar as FlowNodeToolbar, useNodesData } from "@xyflow/react";
import { useModelsByUsecase } from "@/src/hooks/useModelsByUsecase";
import { ConversationType } from "@/src/types/BaseType";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { useEffect, useMemo } from "react";
import { useAtom } from "jotai";
import { selectedModelAtom } from "@/src/store/nodeAtoms";

interface GenerateToolbarProps {
  id?: string;
  selected: boolean;
  isHovered: boolean;
  handleMouseEnter: () => void;
  handleMouseLeave: () => void;
  onGenerate?: () => void;
  initialModel?: string;
}

export default function GenerateToolbar({
  id,
  selected,
  isHovered,
  handleMouseEnter,
  handleMouseLeave,
  onGenerate,
  initialModel,
}: GenerateToolbarProps) {
  const { data: generateModels } = useModelsByUsecase(ConversationType.GENERATE);
  const { data: advanceModels } = useModelsByUsecase(ConversationType.ADVANCE);
  
  const nodesData = useNodesData(id || "");

  const models = useMemo(() => {
    const nodeType = nodesData?.type;
    if (nodeType === "outputImageAdvanced") {
      return advanceModels || [];
    }
    return generateModels || [];
  }, [generateModels, advanceModels, nodesData?.type]);

  const [selectedModel, setSelectedModel] = useAtom(selectedModelAtom(id || ""));

  const imageUrl = (nodesData?.data as any)?.imageUrl;

  useEffect(() => {
    if (models && models.length > 0 && !selectedModel) {
      if (initialModel) {
        const found = models.find((m) => m.model_name === initialModel);
        if (found) {
          setSelectedModel(found);
          return;
        }
      }
      setSelectedModel(models[0]);
    }
  }, [models, selectedModel, setSelectedModel, initialModel]);

  const handleDownload = async () => {
    if (!imageUrl) return;
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `generated-image-${Date.now()}.png`;
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
        {/* Palette Section */}
        <button className="flex h-9 items-center gap-2 rounded-full bg-[#1A1A1A] px-3 text-gray-300 transition-colors hover:bg-white/10 hover:text-white">
          <Palette className="size-4" />
          <ChevronDown className="size-3 opacity-50" />
        </button>

        {/* Model Section */}
        <Select
          value={selectedModel?.model_name || ""}
          onValueChange={(val) => {
            const found = models?.find((m) => m.model_name === val);
            if (found) setSelectedModel(found);
          }}
        >
          <SelectTrigger className="flex h-9 items-center gap-2 rounded-full border-0 bg-[#1A1A1A] pl-1 pr-3 text-sm font-medium text-gray-300 transition-colors hover:bg-white/10 hover:text-white">
            <SelectValue placeholder="Select model" />
            <ChevronDown className="size-3 opacity-50" />
          </SelectTrigger>
          <SelectContent>
            {models?.map((model) => (
              <SelectItem key={model.id} value={model.model_name}>
                <div className="flex items-center gap-2">
                  <div
                    className="size-7 overflow-hidden rounded-sm bg-cover bg-center"
                    style={{
                      backgroundImage: `url('${model.cover_image}')`,
                    }}
                  ></div>
                  <span className="text-base">{model.model_name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Action Section */}
        <button className="flex size-9 items-center justify-center rounded-full bg-[#1A1A1A] text-gray-300 transition-colors hover:bg-white/10 hover:text-white">
          <Sparkles className="size-4" />
        </button>

        {/* Download Button */}
        {imageUrl && (
          <button
            onClick={handleDownload}
            className="flex size-9 items-center justify-center rounded-full bg-[#1A1A1A] text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
            title="Download Generated Image"
          >
            <Download className="size-4" />
          </button>
        )}
      </div>
    </FlowNodeToolbar>
  );
}
