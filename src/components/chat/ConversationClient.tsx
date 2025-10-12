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

  const messageGroups = useMemo(() => {
    if (!messages || messages.length === 0) return [];

    const groups: {
      input_images: { id: string; imageUrl: string }[];
      turns: conversationData[];
    }[] = [];
    let currentGroup: (typeof groups)[0] | null = null;

    const getImageKey = (images: { id: string; imageUrl: string }[] | undefined) => {
      if (!images || images.length === 0) return "";
      return images
        .map((img) => img.id)
        .sort()
        .join(",");
    };

    for (const message of messages) {
      const imageKey = getImageKey(message.input_images);
      const currentKey = currentGroup ? getImageKey(currentGroup.input_images) : null;

      const bothHaveImages =
        (message.input_images?.length ?? 0) > 0 && (currentGroup?.input_images?.length ?? 0) > 0;

      const canMerge = currentGroup && bothHaveImages && imageKey === currentKey;

      if (canMerge) {
        // Merge consecutive messages with same non-empty input images
        currentGroup?.turns.push(message);
      } else {
        // Start a new group
        if (currentGroup) groups.push(currentGroup);
        currentGroup = {
          input_images: message.input_images,
          turns: [message],
        };
      }
    }

    if (currentGroup) groups.push(currentGroup);

    return groups;
  }, [messages]);

  // console.log("MESSAGE GROUPS", messageGroups);
  // console.log("MESSAGES", messages);
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

  // Main content
  return (
    <section className="relative flex h-screen flex-col bg-background text-white">
      <ChatView messageGroups={messageGroups} />
      <footer className="absolute bottom-4 z-10 w-full px-2">
        <div className="relative mx-auto flex w-full max-w-full flex-col items-center justify-center text-center">
          <InputBox conversationId={conversationId} />
        </div>
      </footer>
    </section>
  );
}
