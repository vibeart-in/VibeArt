"use client";
import React from "react";
import { MessageGroupType } from "@/src/types/BaseType";
import MessageGroup from "./MessageGroup";

interface ChatViewProps {
  messageGroups: MessageGroupType[];
}

export default function ChatView({ messageGroups }: ChatViewProps) {
  return (
    <div
      // ref={scrollContainerRef}
      className="flex h-full w-full flex-col-reverse items-center gap-12 overflow-y-auto px-4 pb-48 pt-32"
    >
      {messageGroups.map((group) => (
        <MessageGroup key={group.id} group={group} />
      ))}
    </div>
  );
}
