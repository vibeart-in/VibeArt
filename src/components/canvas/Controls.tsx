"use client";
import React, { useState, useEffect } from "react";
import { useReactFlow, useViewport, Node as XYNode } from "@xyflow/react";
import { Plus, Minus, Maximize, Lock, Unlock } from "lucide-react";

type Props = {
  nodes?: XYNode[];
  setNodes?: React.Dispatch<React.SetStateAction<XYNode[]>>;
  minZoom?: number;
  maxZoom?: number;
};

export default function CustomControls({
  nodes,
  setNodes,
  minZoom = 0.2,
  maxZoom = 4,
  isSaving,
  lastSaved,
}: Props & {
  isSaving?: boolean;
  lastSaved?: Date | null;
}) {
  const rf = useReactFlow();
  const { zoom } = useViewport();

  const [nodesLocked, setNodesLocked] = useState(false);

  useEffect(() => {
    if (!nodes || nodes.length === 0) {
      setNodesLocked(false);
      return;
    }
    const allLocked = nodes.every((n) => n.draggable === false);
    setNodesLocked(allLocked);
  }, [nodes]);

  const toggleLock = () => {
    if (!nodes || !setNodes) return;
    const newLocked = !nodesLocked;
    setNodes((prev) =>
      prev.map((n) => ({
        ...n,
        draggable: !newLocked,
        selectable: !newLocked,
      })),
    );
    setNodesLocked(newLocked);
  };

  const zoomIn = () => rf.zoomIn?.({ duration: 120 });
  const zoomOut = () => rf.zoomOut?.({ duration: 120 });
  const fitView = () => rf.fitView?.({ padding: 0.1, duration: 200 });

  const atMaxZoom = typeof zoom === "number" && zoom >= maxZoom - 1e-6;
  const atMinZoom = typeof zoom === "number" && zoom <= minZoom + 1e-6;

  const buttonClass =
    "flex h-8 w-8 items-center justify-center rounded-xl text-white/90 transition hover:bg-accent/30 hover:text-accent active:scale-95 disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div className="pointer-events-auto absolute bottom-4 right-4 z-50 flex flex-col items-end gap-3">
      {/* Saving Indicator */}
      <div className="flex items-center gap-2 rounded-full border border-white/5 bg-neutral-900/50 px-3 py-1.5 text-xs text-white/50 backdrop-blur-md">
        {isSaving ? (
          <>
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-yellow-500" />
            <span>Saving...</span>
          </>
        ) : lastSaved ? (
          <>
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>
              Saved {lastSaved.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </>
        ) : (
          <span>Ready</span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div
          className="flex items-center gap-1 rounded-[20px] border border-white/5 bg-neutral-900/50 px-3 py-2 shadow-xl backdrop-blur-md"
          style={{ minWidth: 140 }}
        >
          <button
            onClick={zoomIn}
            title="Zoom in"
            aria-label="Zoom in"
            disabled={atMaxZoom}
            className={buttonClass}
          >
            <Plus className="h-4 w-4" />
          </button>
          <div className="flex items-center rounded-lg border border-white/5 bg-white/5 px-2 py-1 text-sm">
            <span className="text-xs font-medium text-white/70">
              {Math.round((zoom || 1) * 100)}%
            </span>
          </div>
          <button
            onClick={zoomOut}
            title="Zoom out"
            aria-label="Zoom out"
            disabled={atMinZoom}
            className={buttonClass}
          >
            <Minus className="h-4 w-4" />
          </button>

          <button onClick={fitView} title="Fit View" aria-label="Fit view" className={buttonClass}>
            <Maximize className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center justify-center rounded-[20px] border border-white/5 bg-neutral-900/50 p-2 shadow-xl backdrop-blur-sm">
          <button
            onClick={toggleLock}
            title={
              nodes && setNodes
                ? nodesLocked
                  ? "Unlock nodes"
                  : "Lock nodes"
                : "Lock nodes (pass nodes & setNodes to enable)"
            }
            aria-label="Lock nodes"
            disabled={!nodes || !setNodes}
            className={buttonClass}
          >
            {nodesLocked ? <Lock className="h-4 w-4 shadow-sm" /> : <Unlock className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
