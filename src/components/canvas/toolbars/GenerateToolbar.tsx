"use client";

import { Sparkles, ChevronDown, Settings, Palette } from "lucide-react";
import { Position, NodeToolbar as FlowNodeToolbar } from "@xyflow/react";
import { useModelsByUsecase } from "@/src/hooks/useModelsByUsecase";
import { ConversationType } from "@/src/types/BaseType";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { useState, useEffect } from "react";

interface GenerateToolbarProps {
  selected: boolean;
  isHovered: boolean;
  handleMouseEnter: () => void;
  handleMouseLeave: () => void;
  onGenerate?: () => void;
}

export default function GenerateToolbar({
  selected,
  isHovered,
  handleMouseEnter,
  handleMouseLeave,
  onGenerate,
}: GenerateToolbarProps) {
  const { data: models } = useModelsByUsecase(ConversationType.GENERATE);
  const [selectedModel, setSelectedModel] = useState<string>("");

  useEffect(() => {
    if (models && models.length > 0 && !selectedModel) {
      setSelectedModel(models[0].model_name);
    }
  }, [models, selectedModel]);

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
        <Select value={selectedModel} onValueChange={setSelectedModel}>
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
      </div>
    </FlowNodeToolbar>
  );
}
