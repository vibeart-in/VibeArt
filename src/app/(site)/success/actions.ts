"use server";

import { createClient } from "@/src/lib/supabase/server";

export async function getUserSubscriptionData() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "Not authenticated" };
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("subscription_tier, subscription_credits, subscription_status, subscription_type")
      .eq("user_id", user.id)
      .single();

    if (profileError) {
      return { error: "Failed to fetch profile data" };
    }

    return { data: profile };
  } catch (error) {
    console.error("Error fetching user subscription data:", error);
    return { error: "Internal server error" };
  }
}
