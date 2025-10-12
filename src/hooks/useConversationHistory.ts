"use client";
import { useInfiniteQuery, InfiniteData, QueryFunctionContext } from "@tanstack/react-query";

import { createClient } from "@/src/lib/supabase/client";
import { ConversationType, HistoryItem } from "@/src/types/BaseType";

// ❗️ Import `InfiniteData` and `QueryFunctionContext` for better typing
import { getSignedUrls } from "../utils/client/getSignedUrls";

const PAGE_SIZE = 10;

// ❗️ Define the type for our specific query key for better type safety
type ConversationHistoryQueryKey = readonly [string, ConversationType];

/**
 * Fetches a single page of conversation history.
 * ❗️ The signature is updated to match TanStack Query's context.
 */
const fetchConversationHistoryPage = async (
  context: QueryFunctionContext<ConversationHistoryQueryKey, number>,
): Promise<HistoryItem[]> => {
  // Destructure from the context object
  const { pageParam = 0, queryKey } = context;
  const [_key, conversationType] = queryKey;

  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase.rpc("get_conversations_with_details", {
    p_conversation_type: conversationType,
    p_limit: PAGE_SIZE,
    p_offset: pageParam, // pageParam is now correctly typed as a number
  });

  if (error) throw new Error("Could not fetch conversation history");
  const history = (data as unknown as HistoryItem[]) || [];

  const signedHistory = await Promise.all(
    history.map(async (item) => {
      if (!item.imageUrl || item.imageUrl.startsWith("http")) {
        return item;
      }
      const signedUrl = await getSignedUrls(item.imageUrl, "generated-media", { supabase });
      return { ...item, imageUrl: signedUrl };
    }),
  );

  return signedHistory;
};

// ✅ The updated React Query hook using useInfiniteQuery
export const useConversationHistory = (conversationType: ConversationType) => {
  return useInfiniteQuery<
    HistoryItem[], // TQueryFnData: Type returned by the query function
    Error, // TError
    InfiniteData<HistoryItem[]>, // TData: The final shape of `data`
    ConversationHistoryQueryKey, // TQueryKey
    number // ❗️ TPageParam: Explicitly type pageParam as number
  >({
    queryKey: ["conversationHistory", conversationType],
    queryFn: fetchConversationHistoryPage, // This now matches the expected signature
    initialPageParam: 0,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      // If the last page was not full, we've reached the end
      if (lastPage.length < PAGE_SIZE) {
        return undefined;
      }
      // Otherwise, return the next page number (offset)
      return lastPageParam + PAGE_SIZE;
    },
    staleTime: 5 * 60 * 1000,
  });
};
