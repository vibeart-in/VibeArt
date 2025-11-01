// src/hooks/useExampleGenerations.ts
"use client";
import { useQuery } from "@tanstack/react-query";

import { createClient } from "@/src/lib/supabase/client"; // client-side version

import { ConversationType } from "../types/BaseType";

export interface useExampleGenerationsType {
  limit: number;
  showcaseFor: ConversationType;
}
export const useExampleGenerations = ({ limit, showcaseFor }: useExampleGenerationsType) => {
  return useQuery({
    queryKey: ["exampleGenerations", limit, showcaseFor],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase.rpc("get_example_generations", {
        p_limit: limit,
        p_showcase_for: showcaseFor,
      });
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 10, // 5 minutes — cached data considered "fresh"
    gcTime: 1000 * 60 * 30, // keep in cache for 30 minutes
  });
};
