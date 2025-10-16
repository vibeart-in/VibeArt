"use client";

import {
  InfiniteData,
  QueryFunctionContext,
  useInfiniteQuery,
  UseInfiniteQueryOptions,
} from "@tanstack/react-query";

import { createClient } from "@/src/lib/supabase/client";
import { ConversationType, HistoryItem } from "@/src/types/BaseType";

import { getSignedUrls } from "../utils/client/getSignedUrls";

const PAGE_SIZE = 6;

// FIX 1: Update the query key to allow for a null conversationType.
// This makes the key's type accurately reflect its possible values.
type ConversationHistoryQueryKey = readonly [string, ConversationType | null];

// FIX 2: Update the Omit type.
// We now control the `enabled` state within the hook, so we omit it from the options
// a user can pass, preventing conflicting logic.
type ConversationHistoryOptions = Omit<
  UseInfiniteQueryOptions<
    HistoryItem[],
    Error,
    InfiniteData<HistoryItem[]>,
    ConversationHistoryQueryKey,
    number
  >,
  "queryKey" | "queryFn" | "initialPageParam" | "getNextPageParam" | "enabled"
>;

/**
 * Fetches a single page of conversation history.
 */
const fetchConversationHistoryPage = async (
  context: QueryFunctionContext<ConversationHistoryQueryKey, number>,
): Promise<HistoryItem[]> => {
  const { pageParam = 0, queryKey } = context;
  const [_key, conversationType] = queryKey;

  // FIX 3: Add a guard clause.
  // Although the `enabled` flag should prevent this function from ever running
  // with a null conversationType, this makes the function itself more robust and type-safe.
  if (!conversationType) {
    return [];
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase.rpc("get_conversations_with_details", {
    p_conversation_type: conversationType, // This is now guaranteed to be a valid ConversationType
    p_limit: PAGE_SIZE,
    p_offset: pageParam,
  });

  if (error) {
    console.error("Error fetching conversation history:", error);
    throw new Error("Could not fetch conversation history");
  }

  const history = (data as unknown as HistoryItem[]) || [];

  // This logic remains the same
  const signedHistory = await Promise.all(
    history.map(async (item) => {
      if (!item.imageUrl || item.imageUrl.startsWith("http")) {
        return item;
      }
      try {
        const signedUrl = await getSignedUrls(item.imageUrl, "generated-media", { supabase });
        return { ...item, imageUrl: signedUrl };
      } catch (e) {
        console.error("Failed to get signed URL for image:", item.imageUrl, e);
        return item; // Return the original item if signing fails
      }
    }),
  );

  return signedHistory;
};

/**
 * Custom hook to fetch conversation history with infinite scrolling.
 * This hook is robust and will automatically disable the query if conversationType is null.
 */
export const useConversationHistory = (
  // FIX 4: The hook now correctly accepts ConversationType OR null.
  conversationType: ConversationType | null,
  options?: ConversationHistoryOptions,
) => {
  return useInfiniteQuery<
    HistoryItem[],
    Error,
    InfiniteData<HistoryItem[]>,
    ConversationHistoryQueryKey,
    number
  >({
    queryKey: ["conversationHistory", conversationType],
    queryFn: fetchConversationHistoryPage,
    initialPageParam: 0,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      if (lastPage.length < PAGE_SIZE) {
        return undefined;
      }
      return lastPageParam + PAGE_SIZE;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes

    // FIX 5: Automatically handle the enabled state.
    // This is the core fix. The query will ONLY run if conversationType is not null.
    // This removes the need to pass an `enabled` flag from your component.
    enabled: !!conversationType,

    ...options,
  });
};
