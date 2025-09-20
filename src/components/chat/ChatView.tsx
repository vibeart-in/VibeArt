"use client";
import React, { useEffect, useRef, useState } from "react";
import MessageBox from "./MessageBox";
import { MessageType } from "@/src/types/BaseType";
interface ChatViewProps {
  messages: MessageType[];
}
export default function ChatView({ messages }: ChatViewProps) {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [userHasScrolled, setUserHasScrolled] = useState(false);

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (container) {
      const isAtBottom = 
        container.scrollHeight - container.scrollTop <=
        container.clientHeight + 5;
      setUserHasScrolled(!isAtBottom);
    }
  };
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, []);
  useEffect(() => {
    if (scrollContainerRef.current && !userHasScrolled) {
      scrollContainerRef.current.children[0]?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [messages, userHasScrolled]);

  return (
    <div
      ref={scrollContainerRef}
      className="w-full flex flex-col-reverse items-center h-full overflow-y-auto gap-12 pb-48 pt-32 px-4"
    >
      {messages.map((message) => (
        <MessageBox key={message.id} message={message} />
      ))}
    </div>
  );
}
