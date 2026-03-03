"use client";
import { NodeProps, Node, useReactFlow } from "@xyflow/react";
import React, { memo } from "react";

import NodeLayout from "../NodeLayout";

type GroupData = {
  label?: string;
  borderColor?: string;
  bgColor?: string;
  [key: string]: unknown;
};

export type GroupNodeType = Node<GroupData, "group">;

const DEFAULT_BORDER = "#6366f1"; // indigo-500
const DEFAULT_BG = "rgba(99,102,241,0.08)";

/** Renders a rounded dashed border using SVG so the corners are actually curved,
 *  not just the rectangular path with a dashed stroke. */
function RoundedDashedBorder({ color }: { color: string }) {
  return (
    <svg
      className="pointer-events-none absolute inset-0 size-full overflow-visible"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        borderRadius: "20px",
      }}
    >
      <rect
        x="1"
        y="1"
        width="calc(100% - 2px)"
        height="calc(100% - 2px)"
        rx="24"
        ry="24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeDasharray="8 6"
        strokeLinecap="round"
        style={{ width: "calc(100% - 2px)", height: "calc(100% - 2px)" }}
      />
    </svg>
  );
}

const GroupNode = memo(({ id, data, selected }: NodeProps<GroupNodeType>) => {
  const { updateNodeData } = useReactFlow();
  const borderColor = (data.borderColor as string) || DEFAULT_BORDER;
  const bgColor = (data.bgColor as string) || DEFAULT_BG;

  return (
    <NodeLayout
      id={id}
      selected={selected}
      title={data.label || "Group"}
      className="size-full backdrop-blur-sm transition-all duration-200"
      style={{
        borderRadius: "1.5rem",
        background: bgColor,
        position: "relative",
        overflow: "visible",
      }}
      minWidth={200}
      minHeight={200}
      resizeHidden={false}
      toolbarType="group"
      handles={[]}
    >
      {/* SVG border — truly rounded dashed corners */}
      <RoundedDashedBorder color={borderColor} />

      <div className="pointer-events-none relative size-full">
        <input
          value={data.label || ""}
          onChange={(e) => updateNodeData(id, { label: e.target.value })}
          placeholder="Group"
          className="nodrag pointer-events-auto absolute left-4 top-4 border-none bg-transparent text-xs font-bold uppercase tracking-tighter outline-none"
          style={{ color: borderColor }}
        />
      </div>
    </NodeLayout>
  );
});

GroupNode.displayName = "GroupNode";
export default GroupNode;
