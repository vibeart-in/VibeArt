"use client";

import { IconExclamationCircle } from "@tabler/icons-react";
import { useMemo } from "react";

import ChatView from "@/src/components/chat/ChatView";
import InputBox from "@/src/components/inputBox/InputBox";
import { useConversationMessages } from "@/src/hooks/useConversationMessages";
import { conversationData } from "@/src/types/BaseType";

import MessageSkeleton from "./MessageSkeleton";

export default function ConversationClient({ conversationId }: { conversationId: string }) {
  const { data: messages, isLoading, isError } = useConversationMessages(conversationId);

  // console.log("MESSAGE GROUPS", messageGroups);
  console.log("MESSAGES", messages);
  // Loading state
  if (isLoading) {
    return (
      <div className="flex size-full flex-col items-center justify-center gap-12 overflow-y-auto bg-background px-4 pb-4 pt-32 text-white">
        <MessageSkeleton />
        <MessageSkeleton />
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-background text-white">
        <div className="flex size-64 flex-col items-center justify-center rounded-2xl bg-red-900/20 p-4 text-center">
          <IconExclamationCircle className="size-8 text-red-500" />
          <p className="mt-2 font-semibold text-red-500">
            Conversation failed: <br></br>Please try again or create new one.
          </p>
        </div>
      </div>
    );
  }

  return (
    <section className="relative flex h-screen flex-col bg-background text-white">
      {messages && <ChatView messageGroups={messages} conversationId={conversationId} />}
      <footer className="absolute bottom-4 z-10 w-full px-2">
        <div className="relative mx-auto flex w-full max-w-full flex-col items-center justify-center text-center">
          <InputBox conversationId={conversationId} />
        </div>
      </footer>
    </section>
  );
}
