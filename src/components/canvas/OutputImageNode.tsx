import { Handle, Position, NodeProps, Node, useViewport } from "@xyflow/react";
import React, { useState, useCallback } from "react";
import { MoreHorizontal, Download, Pencil, Sparkles, ChevronDown, Plug, Wand2, Loader2 } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";

// Define the data shape
type ImageNodeData = {
  label?: string;
  imageUrl?: string;
  prompt?: string;
  model?: string;
  category?: string;
  isGenerating?: boolean;
  onGenerate?: (prompt: string) => void;
  onEdit?: (prompt?: string) => void;
  onPromptUpdate?: (prompt: string) => void;
  inputImages?: string[];
  availableModels?: any[];
  onModelChange?: (model: any) => void;
  selectedModel?: any;
  [key: string]: unknown;
};

// Define the specific Node type
export type OutputImageNodeType = Node<ImageNodeData, "outputImage">;

export default function OutputImageNode({ data, selected }: NodeProps<OutputImageNodeType>) {
  const { zoom } = useViewport();
  const [prompt, setPrompt] = useState(data.prompt || "");
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Sync prompt with data.prompt when it changes (e.g., when node is created with a prompt)
  React.useEffect(() => {
    if (data.prompt !== undefined) {
      setPrompt(data.prompt);
    }
  }, [data.prompt]);

  const handleGenerate = useCallback((e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    if (prompt.trim()) {
      if (isEditMode && data.onEdit) {
        // If in edit mode, pass the prompt to onEdit
        // This will create a new node with the edited prompt
        data.onEdit(prompt);
        setIsEditMode(false);
      } else if (data.onGenerate) {
        // Normal generation for empty nodes
        data.onGenerate(prompt);
      }
    }
  }, [data, prompt, isEditMode]);

  const handleEdit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (data.imageUrl) {
      // Toggle edit mode to show input box
      setIsEditMode(!isEditMode);
    }
  }, [data.imageUrl, isEditMode]);

  // Prevent drag when interacting with inputs
  const onInputMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  return (
    <div
      className={`group relative rounded-[28px] transition-all duration-300 ${
        selected ? "ring-2 ring-[#e2e2e2]/50" : "hover:ring-2 hover:ring-[#e2e2e2]/30"
      }`}
      style={{
        width: "300px", // Fixed width for consistency
        height: "auto",
        minHeight: "200px",
        backgroundColor: "#0C0C0C", // Dark background for the card
      }}
    >
      {/* Menu Bar - Visible on Selected/Hover */}
      <div
        className="absolute left-1/2"
        style={{
          bottom: `calc(100% + ${20 / zoom}px)`,
          transform: `translateX(-50%) scale(${1 / zoom})`,
          transformOrigin: "bottom center",
          zIndex: 10,
        }}
      >
        <div
          className={`flex items-center gap-1 rounded-full border border-[#2e2e2e] bg-[#151515] px-2 py-1.5 shadow-xl transition-all duration-300 ${
            selected
              ? "translate-y-0 opacity-100"
              : "pointer-events-none translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
          }`}
        >
          {/* Left Section: Controls */}
          <div className="flex items-center gap-1 pr-2">
            <button className="flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium text-gray-400 transition-colors hover:bg-white/10 hover:text-white">
              <Plug className="size-3.5" />
              <ChevronDown className="size-3 opacity-50" />
            </button>
            <button className="flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium text-gray-400 transition-colors hover:bg-white/10 hover:text-white">
              <span>2:3</span>
              <ChevronDown className="size-3 opacity-50" />
            </button>
            
            {/* Model Selector */}
            <div className="relative">
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsModelDropdownOpen(!isModelDropdownOpen);
                    }}
                    className="flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
                >
                    <span className="max-w-[80px] truncate">{data.model || "Model"}</span>
                    <ChevronDown className={`size-3 opacity-50 transition-transform ${isModelDropdownOpen ? "rotate-180" : ""}`} />
                </button>
                
                {/* Dropdown Menu */}
                {isModelDropdownOpen && data.availableModels && data.availableModels.length > 0 && (
                    <div className="absolute left-0 top-full mt-2 max-h-48 w-48 overflow-y-auto rounded-xl border border-[#2e2e2e] bg-[#151515] p-1 shadow-xl z-50">
                        {data.availableModels.map((model: any) => (
                            <button
                                key={model.id}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (data.onModelChange) data.onModelChange(model);
                                    setIsModelDropdownOpen(false);
                                }}
                                className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs transition-colors ${
                                    data.model === model.model_name 
                                    ? "bg-[#DFFF00]/10 text-[#DFFF00]" 
                                    : "text-gray-400 hover:bg-white/10 hover:text-white"
                                }`}
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={model.cover_image} alt="" className="h-4 w-4 rounded-full object-cover" />
                                <span className="truncate">{model.model_name}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
          </div>

          {/* Separator */}
          <div className="h-4 w-[1px] bg-[#333]"></div>

          {/* Right Section: Actions */}
          <div className="flex items-center gap-0.5 pl-2">
            <button className="rounded-full p-1.5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white">
              <Sparkles className="size-3.5" />
            </button>
            <button className="rounded-full p-1.5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white">
              <Download className="size-3.5" />
            </button>
            <button 
                onClick={handleEdit}
                className="rounded-full p-1.5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
            >
              <Pencil className="size-3.5" />
            </button>
            <button className="rounded-full p-1.5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white">
              <MoreHorizontal className="size-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Input Handle - Target */}
      <Handle
        type="target"
        position={Position.Left}
        className={`!-left-4 !h-4 !w-4 !border-[3px] !border-[#1a1a1a] !bg-[#DFFF00] transition-opacity duration-300 ${
          selected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
      />

      {/* Main Content Area */}
      <div className="relative flex w-full flex-col overflow-hidden rounded-[28px] bg-gray-900">
        {data.imageUrl ? (
          // Generated Image State
          <>
             {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={data.imageUrl}
              alt={data.prompt || "Generated Image"}
              className="aspect-[2/3] w-full object-cover"
              draggable={false}
            />
            {/* Overlay Gradient */}
            <div
              className={`pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80 transition-opacity duration-300 ${
                selected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              }`}
            />
             {/* Prompt Overlay */}
            <div
                className={`absolute bottom-0 left-0 right-0 p-5 transition-opacity duration-300 ${
                selected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                }`}
            >
                <p className="line-clamp-3 text-[13px] font-light leading-relaxed text-white/90 drop-shadow-sm">
                {data.prompt}
                </p>
            </div>
          </>
        ) : (
          // Empty / Placeholder State
          <div className="flex aspect-[2/3] w-full flex-col items-center justify-center p-4">
             {data.isGenerating ? (
                 <div className="flex flex-col items-center gap-3">
                     <Loader2 className="animate-spin text-[#DFFF00]" size={32} />
                     <span className="text-xs text-white/50">Generating...</span>
                 </div>
             ) : (
                <div className="flex flex-col items-center gap-2 text-gray-500">
                    <Wand2 size={32} className="opacity-50" />
                    <span className="text-xs">Ready to generate</span>
                </div>
             )}
          </div>
        )}
        
        {/* Input Preview - Small Square at Bottom Right */}
        {data.inputImages && data.inputImages.length > 0 && (
            <div className="absolute bottom-4 right-4 z-20 flex gap-1 transition-opacity duration-300">
                {data.inputImages.map((img, index) => (
                    <div key={index} className="group/preview relative">
                        <div className="h-8 w-8 overflow-hidden rounded-md border border-white/20 bg-black/50 shadow-lg transition-all duration-300 hover:scale-150 hover:border-[#DFFF00]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                                src={img} 
                                alt={`Input ${index + 1}`} 
                                className="h-full w-full object-cover" 
                            />
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
      

      {/* Header Info - Always Visible */}
      <div
        className="absolute bottom-full left-0 right-0 flex items-center justify-between px-1 font-medium text-white/90"
        style={{
          marginBottom: `${8 / zoom}px`,
        }}
      >
        <span
          className="max-w-[60%] truncate font-light"
          style={{
            fontSize: `${12 / zoom}px`,
          }}
        >
          {data.category || "Image generation"}
        </span>
        <span
          className="max-w-[35%] truncate font-extralight opacity-80"
          style={{
            fontSize: `${10 / zoom}px`,
          }}
        >
          {data.model}
        </span>
      </div>

      {/* Output Handle - Visible on Hover/Selected */}
      <Handle
        type="source"
        position={Position.Right}
        className={`!-right-4 !h-4 !w-4 !border-[3px] !border-[#1a1a1a] !bg-[#DFFF00] transition-opacity duration-300 ${
          selected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
      />

      {/* Input Box Below Card - Visible when Selected AND (no image OR edit mode) */}
      {(!data.imageUrl || isEditMode) && (
        <div
          className="absolute left-1/2"
          style={{
            top: `calc(100% + ${20 / zoom}px)`,
            transform: `translateX(-50%) scale(${1 / zoom})`,
            transformOrigin: "top center",
            zIndex: 10,
            width: "300px",
          }}
        >
          <div
            className={`flex w-full flex-col gap-3 rounded-2xl border border-[#2e2e2e] bg-[#151515] p-3 shadow-xl transition-all duration-300 ${
              selected
                ? "translate-y-0 opacity-100"
                : "pointer-events-none -translate-y-2 opacity-0"
            }`}
          >
            <div className="flex items-center gap-2 rounded-xl bg-white/5 p-1 ring-1 ring-white/10 transition-all focus-within:bg-white/10 focus-within:ring-[#DFFF00]/50">
              <Input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onMouseDown={onInputMouseDown}
                placeholder={isEditMode ? "Enter variation prompt..." : "Describe image..."}
                className="h-8 border-none bg-transparent text-xs text-white placeholder:text-white/30 focus-visible:ring-0"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    handleGenerate(e);
                  }
                }}
              />
            </div>
            <Button 
              onClick={handleGenerate}
              disabled={!prompt.trim()}
              className="h-8 w-full flex items-center justify-center rounded-lg bg-[#DFFF00] text-xs font-medium text-black hover:bg-[#DFFF00]/90"
              onMouseDown={onInputMouseDown}
            >
              <Wand2 size={12} className="mr-2" />
              {isEditMode ? "Create Variation" : "Generate"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
