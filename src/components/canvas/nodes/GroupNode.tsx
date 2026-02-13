"use client";
import { NodeProps, Node } from "@xyflow/react";
import React, { memo } from "react";

import NodeLayout from "../NodeLayout";

type GroupData = {
  label?: string;
  [key: string]: unknown;
};

export type GroupNodeType = Node<GroupData, "group">;

const GroupNode = memo(({ id, data, selected }: NodeProps<GroupNodeType>) => {
  return (
    <NodeLayout
      id={id}
      selected={selected}
      title={data.label || "Group"}
      className={`size-full rounded-2xl border-2 border-dashed transition-all duration-200 ${
        data.isHighlighted 
          ? "border-blue-500 bg-blue-500/10" 
          : "border-zinc-700 bg-white/5 hover:border-zinc-500 hover:bg-white/10"
      } backdrop-blur-sm`}
      minWidth={200}
      minHeight={200}
      resizeHidden={false}
      toolbarType="default"
      handles={[]}
    >
      <div className="size-full p-8 relative pointer-events-none">
        <div className="absolute top-4 left-4 text-xs font-bold text-zinc-500 uppercase tracking-tighter opacity-50 select-none">
            {data.label || "Group"}
        </div>
      </div>
    </NodeLayout>
  );
});
export default GroupNode;
