"use client";

import { IconSparkles } from "@tabler/icons-react";
import ChatView from "@/src/components/chat/ChatView";
import InputBox from "@/src/components/inputBox/InputBox";
import { useConversationMessages } from "@/src/hooks/useConversationMessages";
import { Loader2 } from "lucide-react";
import { MessageType } from "@/src/types/BaseType";

export default function ConversationClient({
  conversationId,
}: {
  conversationId: string;
}) {
  const { messages, isLoading, isError } =
    useConversationMessages(conversationId);

  const formattedMessages: MessageType[] = messages.map((m) => ({
    id: m.id,
    userPrompt: m.userPrompt,
    output_images: Array.isArray(m.output_images)
      ? m.output_images.map((img: any) =>
          typeof img === "string" ? { imageUrl: img } : img
        )
      : [],
    jobId: m.jobId,
    input_images: Array.isArray(m.input_images)
      ? m.input_images.map((img: any) =>
          typeof img === "string" ? { imageUrl: img } : img
        )
      : [],
    job_status:
      m.job_status === "pending" ||
      m.job_status === "processing" ||
      m.job_status === "succeeded" ||
      m.job_status === "failed" ||
      m.job_status === "starting"
        ? m.job_status
        : null,
    parameters: m.parameters,
    credit_cost: m.credit_cost,
    error_message: m.error_message,
  }));

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
    <section className="relative flex flex-col h-screen bg-background text-white">
      <ChatView messages={formattedMessages} />
      <footer className="absolute bottom-0 z-10 w-full px-2">
        <div className="relative mx-auto flex w-full max-w-3xl flex-col text-center">
          <InputBox conversationId={conversationId} />
        </div>
      </footer>
    </section>
  );
}
