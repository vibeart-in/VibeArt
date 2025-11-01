//src/hooks/useNavInfo.ts
import { User } from "@supabase/supabase-js";
import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/src/lib/supabase/client";

import { getUser } from "../actions/getUser";

// Define a type for what our hook will return
export type NavInfoData = {
  subscription_tier: string;
  total_credits: number;
};

export type UseNavInfoReturn = {
  user: User | null;
  navInfo: NavInfoData | null;
};

// The async fetch function now gets both user and navInfo
const fetchUserData = async (): Promise<UseNavInfoReturn> => {
  const userRes = await getUser();

  if (!userRes.success) {
    return { user: null, navInfo: null }; // Return a consistent shape
  }

  const user = userRes.data;

  const { data, error } = await supabase
    .rpc("get_user_credit_info", { p_user_id: user.id })
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return { user, navInfo: data };
};

// The custom hook now provides everything needed
export const useNavInfo = () => {
  return useQuery({
    queryKey: ["user", "nav-info"],
    queryFn: fetchUserData,
    staleTime: 1000 * 60 * 5, // 5 minutes fresh
    gcTime: 1000 * 60 * 30, // keep in cache 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false, // optional: avoid refetch on mount if you don't want it
    refetchOnReconnect: false,
  });
};
