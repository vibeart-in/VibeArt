import React from "react";
import { 
  RotateCw, 
  Wand2, 
  Sparkles, 
  Trash2, 
  FlipHorizontal,
  Crop
} from "lucide-react";

interface ToolbarProps {
  position: { top: number; left: number };
  onFlipX: () => void;
  onRotate: () => void;
  onRemoveBg: () => void;
  onPromptEdit: () => void;
  onDelete: () => void;
}

interface TooltipButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  danger?: boolean;
}

const TooltipButton = ({ onClick, icon, label, danger }: TooltipButtonProps) => (
  <button
    onClick={(e) => {
      e.stopPropagation();
      onClick();
    }}
    className={`group relative flex items-center justify-center rounded-lg p-2 transition-all hover:scale-105 active:scale-95 ${
      danger 
        ? "bg-red-500/10 text-red-500 hover:bg-red-500/20" 
        : "bg-white/5 text-white hover:bg-white/10"
    }`}
  >
    {icon}
    <span className="absolute left-full ml-2 hidden whitespace-nowrap rounded bg-black/90 px-2 py-1 text-xs text-white shadow-xl group-hover:block z-50">
      {label}
    </span>
  </button>
);

export default function Toolbar({
  position,
  onFlipX,
  onRotate,
  onRemoveBg,
  onPromptEdit,
  onDelete,
}: ToolbarProps) {
  return (
    <div
      className="absolute z-50 flex flex-col gap-2 rounded-xl border border-white/10 bg-[#1a1a1a]/90 p-2 shadow-2xl backdrop-blur-md"
      style={{
        top: position.top,
        left: position.left,
      }}
    >
      <TooltipButton onClick={onPromptEdit} icon={<Sparkles size={20} className="text-yellow-400" />} label="Edit in Generator" />
      
      <div className="my-1 h-px w-full bg-white/10" />
      
      <TooltipButton onClick={onRotate} icon={<RotateCw size={20} />} label="Rotate 90°" />
      <TooltipButton onClick={onFlipX} icon={<FlipHorizontal size={20} />} label="Flip Horizontal" />
      <TooltipButton onClick={onRemoveBg} icon={<Wand2 size={20} />} label="Remove Background" />
      
      <div className="my-1 h-px w-full bg-white/10" />
      
      <TooltipButton onClick={onDelete} icon={<Trash2 size={20} />} label="Delete" danger />
    </div>
  );
}
