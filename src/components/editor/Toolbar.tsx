import React, { useRef, useState } from "react";
import {
  FlipHorizontal,
  RotateCw,
  Crop,
  Image as ImageIcon,
  Trash2,
  Wand2,
  Sparkles,
  X,
  Check
} from "lucide-react";

interface ToolbarProps {
  position: { top: number; left: number };
  onFlipX: () => void;
  onRotate: () => void;
  onCrop: () => void;
  onReplace: (file: File) => void;
  onDelete: () => void;
  onRemoveBg: () => void;
  onPromptEdit: (prompt: string) => void;
}

export default function Toolbar({
  position,
  onFlipX,
  onRotate,
  onCrop,
  onReplace,
  onDelete,
  onRemoveBg,
  onPromptEdit,
}: ToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [prompt, setPrompt] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onReplace(e.target.files[0]);
    }
  };

  return (
    <div
      className="absolute flex flex-col items-center gap-2 rounded-xl bg-[#1a1a1a] p-2 shadow-xl ring-1 ring-white/10 backdrop-blur-sm"
      style={{
        top: position.top,
        left: position.left,
        transform: "translate(0, 0)", // Position exactly where specified (to the right)
        zIndex: 50,
      }}
    >
      {!isEditing ? (
        <>
          <TooltipButton onClick={onFlipX} icon={<FlipHorizontal size={20} />} label="Flip Horizontal" />
          <TooltipButton onClick={onRotate} icon={<RotateCw size={20} />} label="Rotate 90°" />
          <TooltipButton onClick={onCrop} icon={<Crop size={20} />} label="Crop" />
          
          <div className="my-1 h-px w-8 bg-white/10" />
          
          <TooltipButton 
            onClick={() => setIsEditing(true)} 
            icon={<Sparkles size={20} className="text-yellow-400" />} 
            label="AI Edit" 
          />
          <TooltipButton onClick={onRemoveBg} icon={<Wand2 size={20} />} label="Remove Background" />

          <div className="my-1 h-px w-8 bg-white/10" />
          
          <TooltipButton 
            onClick={() => fileInputRef.current?.click()} 
            icon={<ImageIcon size={20} />} 
            label="Replace Image" 
          />
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
          
          <div className="my-1 h-px w-8 bg-white/10" />
          
          <TooltipButton 
            onClick={onDelete} 
            icon={<Trash2 size={20} />} 
            label="Remove Image" 
            variant="danger"
          />
        </>
      ) : (
        <div className="flex flex-col gap-2 p-1 w-64 bg-[#1a1a1a] rounded-lg">
           <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
             <span>Describe changes</span>
             <button onClick={() => setIsEditing(false)}><X size={14} /></button>
           </div>
           <textarea
             className="w-full rounded bg-black/50 border border-white/10 p-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-yellow-500/50"
             placeholder="E.g. Make it cyberpunk..."
             rows={3}
             value={prompt}
             onChange={(e) => setPrompt(e.target.value)}
             autoFocus
           />
           <button 
             onClick={() => {
               if (prompt.trim()) {
                 onPromptEdit(prompt);
                 setIsEditing(false);
                 setPrompt("");
               }
             }}
             className="flex items-center justify-center gap-2 rounded bg-yellow-500 py-1.5 text-xs font-medium text-black hover:bg-yellow-400 transition-colors"
           >
             <Sparkles size={14} />
             Generate
           </button>
        </div>
      )}
    </div>
  );
}

function TooltipButton({
  onClick,
  icon,
  label,
  variant = "default",
}: {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  variant?: "default" | "danger";
}) {
  return (
    <button
      onClick={onClick}
      className={`group relative rounded-lg p-2 transition-colors ${
        variant === "danger"
          ? "text-red-400 hover:bg-red-500/10"
          : "text-gray-400 hover:bg-white/10 hover:text-white"
      }`}
      title={label}
    >
      {icon}
      {/* Tooltip to the right for vertical toolbar */}
      <span className="pointer-events-none absolute left-full top-1/2 ml-2 -translate-y-1/2 whitespace-nowrap rounded bg-black px-2 py-1 text-xs text-white opacity-0 ring-1 ring-white/10 transition-opacity group-hover:opacity-100 z-50">
        {label}
      </span>
    </button>
  );
}
