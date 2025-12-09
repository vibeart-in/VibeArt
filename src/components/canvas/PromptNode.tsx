import React, { useCallback, useEffect, useRef, useState } from "react";
import { Handle, Position, NodeProps, Node, useViewport, NodeResizeControl } from "@xyflow/react";

type PromptNodeData = {
  label?: string;
  prompt?: string;
  onChange?: (value: string) => void; // optional callback to bubble changes
  [key: string]: unknown;
};

export type PromptNodeType = Node<PromptNodeData, "prompt">;

const MIN_WIDTH = 280;
const MIN_HEIGHT = 200;
const DEBOUNCE_MS = 300;

export default function PromptNode({ data, selected }: NodeProps<PromptNodeType>) {
  const { zoom } = useViewport();
  const [prompt, setPrompt] = useState<string>(data.prompt ?? "");
  const hoverTimeout = useRef<number | null>(null);
  const changeDebounce = useRef<number | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  // keep internal prompt in sync with external data.prompt
  useEffect(() => {
    setPrompt(data.prompt ?? "");
  }, [data.prompt]);

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeout.current) window.clearTimeout(hoverTimeout.current);
      if (changeDebounce.current) window.clearTimeout(changeDebounce.current);
    };
  }, []);

  // mouse handlers to control hover state with a small delay on leave
  const handleMouseEnter = useCallback(() => {
    if (hoverTimeout.current) {
      window.clearTimeout(hoverTimeout.current);
      hoverTimeout.current = null;
    }
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (hoverTimeout.current) window.clearTimeout(hoverTimeout.current);
    // small delay before hiding so user can move pointer slightly
    hoverTimeout.current = window.setTimeout(() => {
      setIsHovered(false);
      hoverTimeout.current = null;
    }, 250);
  }, []);

  // local change handler with debounce to forward changes up (if callback provided)
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const v = e.target.value;
      setPrompt(v);

      if (changeDebounce.current) {
        window.clearTimeout(changeDebounce.current);
      }
      changeDebounce.current = window.setTimeout(() => {
        if (typeof data.onChange === "function") data.onChange(v);
        changeDebounce.current = null;
      }, DEBOUNCE_MS);
    },
    [data],
  );

  // size handles based on zoom so they remain usable at different zoom levels
  const handleSize = Math.max(10, 16 / Math.max(0.2, zoom));

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`group relative flex flex-col rounded-2xl border bg-[#1a1a1a] shadow-2xl transition-all duration-200 ${selected ? "ring-2 ring-white/20" : "hover:ring-1 hover:ring-white/10"}`}
      style={{
        minWidth: MIN_WIDTH,
        minHeight: MIN_HEIGHT,
        width: "100%",
        height: "100%",
      }}
      aria-label={data.label ?? "Prompt node"}
    >
      {/* Resize control shown only when selected */}
      {selected && (
        <NodeResizeControl
          position="bottom-right"
          minWidth={MIN_WIDTH}
          minHeight={MIN_HEIGHT}
          style={{ background: "transparent", border: "none" }}
        >
          {/* small visual indicator for resize */}
          <svg
            width="18"
            height="18"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ position: "absolute", bottom: 6, right: 6, zIndex: 20 }}
            aria-hidden
          >
            <path d="M4 16 L16 4" stroke="#444" strokeWidth="2" strokeLinecap="round" />
            <path d="M10 16 L16 10" stroke="#444" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </NodeResizeControl>
      )}

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(74,222,128,0.35)]" />
          <span className="text-sm font-medium text-white/90">{data.label ?? "Prompt"}</span>
        </div>
      </div>

      {/* Main content */}
      <div className="relative flex-1 px-6 pb-4">
        <textarea
          value={prompt}
          onChange={handleChange}
          placeholder=""
          onPointerDownCapture={(e) => e.stopPropagation()}
          className="scrollbar-hide h-full w-full resize-none bg-transparent text-[16px] leading-relaxed text-white/80 outline-none placeholder:text-neutral-500"
          aria-label="Prompt editor"
        />
      </div>

      {/* Target handle (left) */}
      <Handle
        type="target"
        position={Position.Left}
        style={{
          left: -6,
          width: handleSize,
          height: handleSize,
          borderWidth: Math.max(1, 2 / Math.max(0.2, zoom)),
          borderStyle: "solid",
          borderColor: "#1a1a1a",
          background: "#4ade80",
        }}
        className={`transition-opacity duration-200 ${selected || isHovered ? "opacity-100" : "opacity-0"}`}
        aria-hidden
      />

      {/* Source handle (right) */}
      <Handle
        type="source"
        position={Position.Right}
        style={{
          right: -6,
          width: handleSize,
          height: handleSize,
          borderWidth: Math.max(1, 2 / Math.max(0.2, zoom)),
          borderStyle: "solid",
          borderColor: "#1a1a1a",
          background: "#4ade80",
        }}
        className={`transition-opacity duration-200 ${selected || isHovered ? "opacity-100" : "opacity-0"}`}
        aria-hidden
      />
    </div>
  );
}
