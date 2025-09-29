"use client";
import { createClient } from "@/src/lib/supabase/client";
import { ConversationType, HistoryItem } from "@/src/types/BaseType";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

const supabase = createClient();
const {
  data: { user },
} = await supabase.auth.getUser();

const fetchConversationHistory = async (
  conversationType: ConversationType
): Promise<HistoryItem[]> => {
  const { data, error } = await supabase.rpc("get_conversations_with_details", {
    p_conversation_type: conversationType, // or whatever type you want
  });
  if (error) throw new Error("Could not fetch conversation history");
  if (!Array.isArray(data))
    throw new Error("Unexpected response format from RPC");

  // The RPC should be ordered by created_at desc
  return data as unknown as HistoryItem[];
};

export const useConversationHistory = (conversationType: ConversationType) => {
  const queryClient = useQueryClient();

  // Effect to handle real-time updates
  useEffect(() => {
    // We only want to set this up once.
    const channel = supabase
      .channel("conversations-changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "conversations",
          filter: `user_id=eq.${user?.id}`,
          // Note: RLS (Row Level Security) on the 'conversations' table
          // will automatically filter these changes for the logged-in user.
        },
        (payload) => {
          console.log("New conversation received!", payload);
          // Invalidate the query to trigger a background refetch.
          // This is the "elegant" way. React Query will handle fetching
          // the new data and updating the UI without a harsh loading state,
          // as long as there is already `data` in the cache.
          queryClient.invalidateQueries({
            queryKey: ["conversationHistory", conversationType],
          });
        }
      )
      .subscribe();

    // Cleanup function to remove the subscription when the component unmounts
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // The main query
  return useQuery<HistoryItem[], Error>({
    queryKey: ["conversationHistory", conversationType],
    queryFn: () => fetchConversationHistory(conversationType),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  });
};
