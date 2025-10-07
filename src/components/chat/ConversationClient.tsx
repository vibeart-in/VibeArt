// src/components/ConversationClient.tsx

"use client";

import ChatView from "@/src/components/chat/ChatView";
import InputBox from "@/src/components/inputBox/InputBox";
// 1. Import the new ProcessedMessage type from the hook
import { useConversationMessages, ProcessedMessage } from "@/src/hooks/useConversationMessages";
import { Loader2 } from "lucide-react";
import { MessageGroupType, MessageType } from "@/src/types/BaseType"; // You will need to update these types
import { useMemo } from "react";

export default function ConversationClient({ conversationId }: { conversationId: string }) {
  const { data: messages, isLoading, isError } = useConversationMessages(conversationId);

  const messageGroups = useMemo(() => {
    if (!messages || messages.length === 0) {
      return [];
    }

    // The messages from the hook are already processed.
    const chronologicalMessages: ProcessedMessage[] = [...messages];

    const groups: MessageGroupType[] = [];
    let currentGroup: MessageGroupType | null = null;

    // 2. Update the helper to use the new image object type
    const getImageKey = (images: { id: string; signedUrl: string }[] | undefined) => {
      if (!images || images.length === 0) return "no-images";
      // The logic is still correct: sort by ID to create a stable key
      return images
        .map((img) => img.id)
        .sort()
        .join(",");
    };

    chronologicalMessages.forEach((message) => {
      // 3. The message is already in the correct format. No need for a separate `formattedMessage` object.
      // We can use `message` directly.

      const messageImageKey = getImageKey(message.input_images);
      const currentGroupImageKey = currentGroup ? getImageKey(currentGroup.input_images) : null;

      if (currentGroup && messageImageKey === currentGroupImageKey) {
        // This message belongs to the current group. Push the whole message object.
        currentGroup.turns.push(message);
      } else {
        // This message starts a new group
        if (currentGroup) {
          groups.push(currentGroup);
        }
        currentGroup = {
          // Use the image key as part of a unique group ID
          id: `${message.id}-${messageImageKey}`,
          input_images: message.input_images,
          turns: [message], // Start the turns with the current message
        };
      }
    });

    // Add the last group to the array
    if (currentGroup) {
      groups.push(currentGroup);
    }

    return groups;
  }, [messages]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-background text-white">
        <Loader2 className="h-12 w-12 animate-spin text-accent" />
        <p className="mt-4 text-lg">Loading conversation...</p>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-background text-white">
        <p className="mt-4 text-lg text-red-500">Failed to load conversation.</p>
      </div>
    );
  }

  // Main content
  return (
    <section className="relative flex h-screen flex-col bg-black text-white">
      <ChatView messageGroups={messageGroups} />
      <footer className="absolute bottom-0 z-10 w-full px-2">
        <div className="relative mx-auto flex w-full max-w-full flex-col items-center justify-center text-center">
          <InputBox conversationId={conversationId} />
        </div>
      </footer>
    </section>
  );
}
