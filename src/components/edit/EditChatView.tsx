"use client";
import React from "react";

import { MessageGroupType } from "@/src/types/BaseType";

import EditMessageGroup from "./EditMessageGroup";

interface ChatViewProps {
  messageGroups: MessageGroupType[];
}

export default function EditChatView({ messageGroups }: ChatViewProps) {
  return (
    <div className="flex size-full flex-col-reverse items-center gap-12 overflow-y-auto px-4 pb-48 pt-32">
      {messageGroups.map((group, index) => (
        <EditMessageGroup key={index} group={group} />
      ))}
    </div>
  );
}
