"use server";
import { createClient } from "@/src/lib/supabase/server";
import { ServerActionRes } from "@/src/types/serverAction";

// Rename for clarity since this is what the data represents
type UserSubscription = {
  subscription_tier: string | null;
  subscription_type: string | null;
  subscription_id: string | null;
};

export async function getCurrentUserSubscriptionDetails(): Promise<
  ServerActionRes<UserSubscription>
> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "User not found" };
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("subscription_tier, subscription_type, current_subscription_id")
      .eq("user_id", user.id)
      .single();

    if (error) {
      // It's often better to log the actual error on the server for debugging
      console.error("Error fetching profile for user:", user.id, error);
      return { success: false, error: "Could not fetch user subscription details." };
    }

    return {
      success: true,
      data: {
        subscription_tier: profile?.subscription_tier ?? null,
        subscription_type: profile?.subscription_type ?? null,
        subscription_id: profile?.current_subscription_id ?? null,
      },
    };
  } catch (error) {
    console.error("Unexpected error in getCurrentUserSubscriptionDetails:", error);
    return { success: false, error: "An unexpected error occurred." };
  }
}
