import { IconWindowMaximize } from "@tabler/icons-react";
import { Handle, Position, NodeProps, useReactFlow } from "@xyflow/react";
import {
  Image as ImageIcon,
  Video,
  X,
  Type,
  Upload,
  Palette,
  LayoutTemplate,
  Crop,
  Brush,
  Eraser,
} from "lucide-react";
import React, { memo, useState } from "react";

const DropNode = memo(({ id, data }: NodeProps) => {
  const { setNodes, setEdges } = useReactFlow();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const handleSelect = (type: string) => {
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id
          ? {
              ...node,
              type,
              data: {
                ...node.data,
                title: type === "outputImage" ? "Image Generator" : undefined,
              },
            }
          : node,
      ),
    );

    setEdges((edges) =>
      edges.map((edge) =>
        edge.source === id || edge.target === id
          ? edge.type === "temporary"
            ? { ...edge, type: "active" }
            : edge
          : edge,
      ),
    );
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
    setEdges((edges) => edges.filter((edge) => edge.source !== id && edge.target !== id));
  };

  const isSource = !!data?.isSource;

  const categories = {
    generation: [
      {
        type: "outputImage",
        label: "Image Generator",
        icon: <ImageIcon size={12} />,
        color: "indigo",
      },
      {
        type: "generateVideo",
        label: "Video Generator",
        icon: <Video size={12} />,
        color: "purple",
      },
    ],

    tools: [
      {
        type: "colorCorrection",
        label: "Color Correction",
        icon: <Palette size={12} />,
        color: "amber",
      },
      { type: "crop", label: "Crop", icon: <Crop size={12} />, color: "neutral" },
      { type: "sketch", label: "Painter", icon: <Brush size={12} />, color: "pink" },
      { type: "upscale", label: "Upscale", icon: <IconWindowMaximize size={12} />, color: "cyan" },
      {
        type: "removeBackground",
        label: "Remove Background",
        icon: <Eraser size={12} />,
        color: "rose",
      },
    ],
  };

  return (
    <div className="relative min-w-[14rem] rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900 to-zinc-950 p-1.5 text-zinc-300 shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
      {/* Close Button */}
      <button
        onClick={handleClose}
        className="absolute -right-7 -top-7 z-20 flex size-8 items-center justify-center rounded-xl bg-zinc-800/80 text-zinc-300 ring-1 ring-zinc-700 transition-all hover:bg-red-500 hover:text-white hover:ring-red-400/60"
      >
        <X size={13} strokeWidth={2.2} />
      </button>

      {/* Hidden Handle */}
      <Handle
        type={isSource ? "source" : "target"}
        position={isSource ? Position.Right : Position.Left}
        style={{ opacity: 0, width: 1, height: 1 }}
      />

      {/* Options */}
      <div className="max-h-[400px] space-y-1 overflow-y-auto">
        {/* Generation Category */}
        <CategorySection title="Generation" items={categories.generation} onSelect={handleSelect} />

        {/* Tools Category */}
        <CategorySection title="Tools" items={categories.tools} onSelect={handleSelect} />
      </div>
    </div>
  );
});

DropNode.displayName = "DropNode";

export default DropNode;

/* ---------- Category Section ---------- */

interface CategoryItem {
  type: string;
  label: string;
  icon: React.ReactNode;
  color: string;
}

function CategorySection({
  title,
  items,
  onSelect,
}: {
  title: string;
  items: CategoryItem[];
  onSelect: (type: string) => void;
}) {
  return (
    <div className="space-y-0.5">
      <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
        {title}
      </div>
      {items.map((item) => (
        <Option
          key={item.type}
          icon={item.icon}
          label={item.label}
          color={item.color}
          onClick={() => onSelect(item.type)}
        />
      ))}
    </div>
  );
}

/* ---------- Option Row ---------- */

function Option({
  icon,
  label,
  color,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  color: string;
  onClick: () => void;
}) {
  const colorMap: Record<string, string> = {
    emerald: "bg-emerald-900/50 text-emerald-500",
    indigo: "bg-indigo-900/50 text-indigo-500",
    blue: "bg-blue-900/50 text-blue-500",
    purple: "bg-purple-900/50 text-purple-500",
    violet: "bg-violet-900/50 text-violet-500",
    orange: "bg-orange-900/50 text-orange-500",
    pink: "bg-pink-900/50 text-pink-500",
    amber: "bg-amber-900/50 text-amber-500",
    neutral: "bg-neutral-800/50 text-neutral-400",
    cyan: "bg-cyan-900/50 text-cyan-500",
    rose: "bg-rose-900/50 text-rose-400",
    zinc: "bg-zinc-800/50 text-zinc-400",
  };

  return (
    <div
      onClick={onClick}
      className="group relative flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-xs transition-all hover:bg-zinc-800 hover:text-zinc-100"
    >
      <div
        className={`flex size-5 items-center justify-center rounded ${colorMap[color] || colorMap.zinc}`}
      >
        {icon}
      </div>

      <span className="font-medium">{label}</span>

      {/* Hover glow */}
      <div className="pointer-events-none absolute inset-0 rounded-md opacity-0 ring-1 ring-white/10 transition group-hover:opacity-100" />
    </div>
  );
}
