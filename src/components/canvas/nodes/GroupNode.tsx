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
      className="size-full rounded-2xl border border-zinc-700 bg-white/5 backdrop-blur-sm transition-colors duration-200"
      minWidth={200}
      minHeight={200}
      toolbarType="default"
      handles={[]}
    >
      <div className="size-full p-4" />
    </NodeLayout>
  );
});
GroupNode.displayName = "GroupNode";
export default GroupNode;
