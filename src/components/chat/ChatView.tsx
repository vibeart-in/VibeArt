"use client";
import React from "react";

import { conversationData, MessageGroupType } from "@/src/types/BaseType";

import MessageGroup from "./MessageGroup";

interface ChatViewProps {
  messageGroups: conversationData[];
  conversationId: string;
}

export default function ChatView({ messageGroups, conversationId }: ChatViewProps) {
  return (
    <div className="flex size-full flex-col-reverse items-center gap-12 overflow-y-auto px-4 pb-48 pt-32">
      {messageGroups.map((group, index) => (
        <MessageGroup key={index} message={group} conversationId={conversationId} />
      ))}
    </div>
  );
}
