import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/src/lib/supabase/client";
import { User } from "@supabase/supabase-js";

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
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, navInfo: null }; // Return a consistent shape
  }

  const { data, error } = await supabase
    .rpc("get_nav_info", { p_user_id: user.id })
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
  });
};
