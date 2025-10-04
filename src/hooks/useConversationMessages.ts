// src/hooks/useConversationMessages.ts

"use client";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/src/lib/supabase/client";

// The hook is now just a simple useQuery call.
// The RealtimeProvider handles invalidation when a job in this conversation updates.
export function useConversationMessages(conversationId: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["messages", conversationId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_conversation_messages", {
        p_conversation_id: conversationId,
      });
      if (error) throw new Error(error.message);
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!conversationId, // Only run if conversationId is present
  });
}