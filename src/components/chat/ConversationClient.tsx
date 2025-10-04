"use client";

import ChatView from "@/src/components/chat/ChatView";
import InputBox from "@/src/components/inputBox/InputBox";
import { useConversationMessages } from "@/src/hooks/useConversationMessages";
import { Loader2 } from "lucide-react";
import { MessageGroupType, MessageType } from "@/src/types/BaseType";
import { useMemo } from "react";

export default function ConversationClient({
  conversationId,
}: {
  conversationId: string;
}) {
  const { data: messages, isLoading, isError } =
    useConversationMessages(conversationId);

  // The core grouping logic
  const messageGroups = useMemo(() => {
    if (!messages || messages.length === 0) {
      return [];
    }

    // The raw messages are newest-first, so we reverse to process chronologically
    const chronologicalMessages = [...messages];

    const groups: MessageGroupType[] = [];
    let currentGroup: MessageGroupType | null = null;

    // Helper to create a unique key from image IDs
    const getImageKey = (
      images: { id: string; imageUrl: string }[] | undefined
    ) => {
      if (!images || images.length === 0) return "no-images";
      // Sort IDs to ensure ['a','b'] and ['b','a'] produce the same key
      return images
        .map((img) => img.id)
        .sort()
        .join(",");
    };

    chronologicalMessages.forEach((message) => {
      // Format the message with proper type casting
      const formattedMessage: MessageType = {
        id: message.id,
        userPrompt: message.userPrompt,
        output_images: Array.isArray(message.output_images)
          ? (message.output_images as { id: string; imageUrl: string }[])
          : [],
        jobId: message.jobId,
        input_images: Array.isArray(message.input_images)
          ? (message.input_images as { id: string; imageUrl: string }[])
          : [],
        job_status: message.job_status as
          | "pending"
          | "starting"
          | "processing"
          | "succeeded"
          | "failed"
          | null,
        parameters: message.parameters,
        credit_cost: message.credit_cost,
        error_message: message.error_message,
      };

      const messageImageKey = getImageKey(formattedMessage.input_images);
      const currentGroupImageKey = currentGroup
        ? getImageKey(currentGroup.input_images)
        : null;

      if (currentGroup && messageImageKey === currentGroupImageKey) {
        // This message belongs to the current group
        currentGroup.turns.push(formattedMessage);
      } else {
        // This message starts a new group
        if (currentGroup) {
          groups.push(currentGroup);
        }
        currentGroup = {
          // Use the image key as a unique group ID
          id: `${message.id}-${messageImageKey}`,
          input_images: formattedMessage.input_images,
          turns: [formattedMessage],
        };
      }
    });

    // Add the last group to the array
    if (currentGroup) {
      groups.push(currentGroup);
    }

    // The final array is chronological, ChatView will reverse it for display.
    return groups;
  }, [messages]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col h-screen bg-background text-white items-center justify-center">
        <Loader2 className="animate-spin h-12 w-12 text-accent" />
        <p className="mt-4 text-lg">Loading conversation...</p>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col h-screen bg-background text-white items-center justify-center">
        <p className="mt-4 text-lg text-red-500">
          Failed to load conversation.
        </p>
      </div>
    );
  }

  // Main content
  return (
    <section className="relative flex flex-col h-screen bg-black text-white">
      {/* Pass the new grouped data to ChatView */}
      <ChatView messageGroups={messageGroups} />
      <footer className="absolute bottom-0 z-10 w-full px-2">
        <div className="relative mx-auto flex w-full max-w-full flex-col items-center justify-center text-center">
          <InputBox conversationId={conversationId} />
        </div>
      </footer>
    </section>
  );
}
