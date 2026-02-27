"use client";
import { NodeProps, Node } from "@xyflow/react";
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
const DEFAULT_BG     = "rgba(99,102,241,0.08)";

/** Renders a rounded dashed border using SVG so the corners are actually curved,
 *  not just the rectangular path with a dashed stroke. */
function RoundedDashedBorder({ color }: { color: string }) {
  return (
    <svg
      className="pointer-events-none absolute inset-0 size-full overflow-visible"
      style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", borderRadius:"20px" }}
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
  const borderColor = (data.borderColor as string) || DEFAULT_BORDER;
  const bgColor     = (data.bgColor     as string) || DEFAULT_BG;

  return (
    <NodeLayout
      id={id}
      selected={selected}
      title={data.label || "Group"}
      className="size-full transition-all duration-200 backdrop-blur-sm"
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

      <div className="size-full relative pointer-events-none">
        <div
          className="absolute top-4 left-4 text-xs font-bold uppercase tracking-tighter opacity-50 select-none"
          style={{ color: borderColor }}
        >
          {/* {data.label || ""} */}
        </div>
      </div>
    </NodeLayout>
  );
});

GroupNode.displayName = "GroupNode";
export default GroupNode;
