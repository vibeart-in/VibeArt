// src/components/messages/MessageGroup.tsx
"use client";

import { conversationData } from "@/src/types/BaseType";

import MessageTurn from "./MessageTurn";

interface MessageGroupProps {
  message: conversationData;
}

export default function MessageGroup({ message }: MessageGroupProps) {
  return (
    <div className="ml-32">
      <MessageTurn message={message} isEdit={false} />
    </div>
  );
}
