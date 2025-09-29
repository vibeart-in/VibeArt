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
      className="w-full flex flex-col-reverse items-center h-full overflow-y-auto gap-12 pb-48 pt-32 px-4"
    >
      {messageGroups.map((group) => (
        <MessageGroup key={group.id} group={group} />
      ))}
    </div>
  );
}
