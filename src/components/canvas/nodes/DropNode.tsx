import React, { memo } from "react";
import { Handle, Position, NodeProps, useReactFlow } from "@xyflow/react";
import { Image as ImageIcon, Video, Sparkles, X } from "lucide-react";

const DropNode = memo(({ id, data }: NodeProps) => {
  const { setNodes, setEdges } = useReactFlow();

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

  return (
    <div className="relative min-w-[13rem] rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900 to-zinc-950 p-1.5 text-zinc-300 shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
      {/* Close Button */}
      <button
        onClick={handleClose}
        className="absolute -right-7 -top-7 z-20 flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-800/80 text-zinc-300 ring-1 ring-zinc-700 transition-all hover:bg-red-500 hover:text-white hover:ring-red-400/60"
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
      <div className="space-y-0.5">
        <Option
          icon={<ImageIcon size={14} />}
          label="Image Generator"
          color="indigo"
          onClick={() => handleSelect("outputImage")}
        />
        <Option
          icon={<Video size={14} />}
          label="Video Generator"
          color="purple"
          onClick={() => handleSelect("video")}
        />
        <Option
          icon={<Sparkles size={14} />}
          label="Assistant"
          color="teal"
          onClick={() => handleSelect("assistant")}
        />
      </div>
    </div>
  );
});

export default DropNode;

/* ---------- Option Row ---------- */

function Option({
  icon,
  label,
  color,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  color: "indigo" | "purple" | "teal";
  onClick: () => void;
}) {
  const colorMap = {
    indigo: "bg-indigo-900/50 text-indigo-400",
    purple: "bg-purple-900/50 text-purple-400",
    teal: "bg-teal-900/50 text-teal-400",
  };

  return (
    <div
      onClick={onClick}
      className="group relative flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-sm transition-all hover:bg-zinc-800 hover:text-zinc-100"
    >
      <div className={`flex h-6 w-6 items-center justify-center rounded ${colorMap[color]}`}>
        {icon}
      </div>

      <span className="font-medium">{label}</span>

      {/* Hover glow */}
      <div className="pointer-events-none absolute inset-0 rounded-md opacity-0 ring-1 ring-white/10 transition group-hover:opacity-100" />
    </div>
  );
}
