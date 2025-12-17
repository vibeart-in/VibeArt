import React from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  useReactFlow,
  type EdgeProps,
} from "@xyflow/react";
import { X } from "lucide-react";
import { IconSquareRoundedX, IconSquareRoundedXFilled } from "@tabler/icons-react";

export default function ActiveEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  selected,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const { setEdges } = useReactFlow();

  const onEdgeDelete = React.useCallback(() => {
    setEdges((edges) => edges.filter((e) => e.id !== id));
  }, [id, setEdges]);

  const onKeyDown: React.KeyboardEventHandler<HTMLButtonElement> = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onEdgeDelete();
    }
  };

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={style}
        className={`transition-[stroke,filter,stroke-width] duration-300 ease-in-out ${
          selected ? "[filter:drop-shadow(0_0_3px_rgba(239,68,68,1))]" : "hover:stroke-gray-400"
        }`}
      />

      <EdgeLabelRenderer>
        <div
          className={`nodrag nopan pointer-events-none absolute transition-opacity duration-200 ${
            selected ? "opacity-100 delay-75" : "pointer-events-none opacity-0"
          }`}
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
          }}
        >
          <button
            aria-label="Delete edge"
            title="Delete edge"
            disabled={!selected}
            className={
              "pointer-events-auto flex items-center justify-center rounded-full text-red-400 transition-transform hover:scale-110 hover:text-red-600"
            }
            onClick={onEdgeDelete}
            onKeyDown={onKeyDown}
          >
            <IconSquareRoundedX />
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
