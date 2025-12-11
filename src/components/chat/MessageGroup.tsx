// src/components/messages/MessageGroup.tsx
"use client";

import { conversationData } from "@/src/types/BaseType";

import MessageTurn from "./MessageTurn";

interface MessageGroupProps {
  message: conversationData;
  conversationId: string;
}

export default function MessageGroup({ message, conversationId }: MessageGroupProps) {
  return (
    <div className="md:ml-32">
      <MessageTurn message={message} isEdit={false} conversationId={conversationId} />
    </div>
  );
}
