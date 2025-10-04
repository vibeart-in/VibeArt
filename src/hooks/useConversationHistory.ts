// src/hooks/useConversationHistory.ts

"use client";
import { createClient } from "@/src/lib/supabase/client";
import { ConversationType, HistoryItem } from "@/src/types/BaseType";
import { useQuery } from "@tanstack/react-query";

const fetchConversationHistory = async (
  conversationType: ConversationType
): Promise<HistoryItem[]> => {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase.rpc("get_conversations_with_details", {
    p_conversation_type: conversationType,
  });

  if (error) throw new Error("Could not fetch conversation history");
  return (data as any) || [];
};

// The hook is now just a simple useQuery call.
// The RealtimeProvider handles invalidation.
export const useConversationHistory = (conversationType: ConversationType) => {
  return useQuery<HistoryItem[], Error>({
    queryKey: ["conversationHistory", conversationType],
    queryFn: () => fetchConversationHistory(conversationType),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};