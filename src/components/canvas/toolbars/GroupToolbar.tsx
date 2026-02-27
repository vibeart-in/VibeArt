"use client";

import { Position, NodeToolbar as FlowNodeToolbar } from "@xyflow/react";
import { useReactFlow } from "@xyflow/react";
import { Palette } from "lucide-react";
import { useRef, useState } from "react";

const GROUP_COLORS = [
  { label: "Indigo",  border: "#6366f1", bg: "rgba(99,102,241,0.10)"  },
  { label: "Blue",    border: "#3b82f6", bg: "rgba(59,130,246,0.10)"  },
  { label: "Cyan",    border: "#06b6d4", bg: "rgba(6,182,212,0.10)"   },
  { label: "Emerald", border: "#10b981", bg: "rgba(16,185,129,0.10)"  },
  { label: "Amber",   border: "#f59e0b", bg: "rgba(245,158,11,0.10)"  },
  { label: "Rose",    border: "#f43f5e", bg: "rgba(244,63,94,0.10)"   },
  { label: "Pink",    border: "#ec4899", bg: "rgba(236,72,153,0.10)"  },
  { label: "Violet",  border: "#8b5cf6", bg: "rgba(139,92,246,0.10)"  },
  { label: "Zinc",    border: "#71717a", bg: "rgba(113,113,122,0.15)" },
];

interface GroupToolbarProps {
  id?: string;
  selected: boolean;
  isHovered: boolean;
  handleMouseEnter: () => void;
  handleMouseLeave: () => void;
}

export default function GroupToolbar({
  id,
  selected,
  isHovered,
  handleMouseEnter,
  handleMouseLeave,
}: GroupToolbarProps) {
  const { updateNodeData } = useReactFlow();
  const [open, setOpen] = useState(false);
  const [activeColor, setActiveColor] = useState<string | null>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);

  const applyColor = (border: string, bg: string) => {
    if (!id) return;
    updateNodeData(id, { borderColor: border, bgColor: bg });
    setActiveColor(border);
    setOpen(false);
  };

  return (
    <FlowNodeToolbar
      className={selected ? "opacity-100" : "opacity-50 hover:opacity-100"}
      isVisible={selected || isHovered}
      position={Position.Bottom}
      offset={16}
    >
      <div
        className="flex items-center gap-2 rounded-full border border-[#1D1D1D] bg-[#121212] p-1.5 shadow-2xl"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Trigger button */}
        <div className="relative">
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex h-9 items-center gap-2.5 rounded-full bg-[#1A1A1A] px-4 text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
          >
            {/* Active colour dot */}
            <span
              className="size-3.5 rounded-full border border-white/20 flex-shrink-0"
              style={{ backgroundColor: activeColor || "#6366f1" }}
            />
            <Palette className="size-4" />
            <span className="text-sm font-medium">Color</span>
          </button>

          {/* Popover */}
          {open && (
            <div
              className="absolute bottom-full left-1/2 mb-3 -translate-x-1/2 w-56 rounded-2xl border border-white/10 bg-[#161616] shadow-2xl"
              style={{ padding: "16px" }}
            >
              {/* Header */}
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-white/30 select-none">
                Group Color
              </p>

              {/* Swatches grid */}
              <div className="grid grid-cols-3 gap-2.5">
                {GROUP_COLORS.map((c) => (
                  <button
                    key={c.label}
                    title={c.label}
                    onClick={() => applyColor(c.border, c.bg)}
                    className="group/swatch flex flex-col items-center gap-1.5 rounded-xl p-2 transition-colors hover:bg-white/5"
                  >
                    <span
                      className="size-8 rounded-full ring-2 ring-offset-1 ring-offset-[#161616] transition-transform group-hover/swatch:scale-110"
                      style={{ backgroundColor: c.border, ringColor: c.border }}
                    />
                    <span className="text-[10px] text-white/40 group-hover/swatch:text-white/70 transition-colors">
                      {c.label}
                    </span>
                  </button>
                ))}
              </div>

              {/* Divider */}
              <div className="my-3 h-px bg-white/10" />

              {/* Custom colour */}
              <button
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#1A1A1A] py-2 text-xs font-medium text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
                onClick={() => colorInputRef.current?.click()}
              >
                <span className="text-base leading-none">+</span>
                Custom color
              </button>
              <input
                ref={colorInputRef}
                type="color"
                className="sr-only"
                onChange={(e) => {
                  const hex = e.target.value;
                  const r = parseInt(hex.slice(1, 3), 16);
                  const g = parseInt(hex.slice(3, 5), 16);
                  const b = parseInt(hex.slice(5, 7), 16);
                  applyColor(hex, `rgba(${r},${g},${b},0.12)`);
                }}
              />
            </div>
          )}
        </div>
      </div>
    </FlowNodeToolbar>
  );
}
