"use server";

import { createClient } from "@/src/lib/supabase/server";
import { ServerActionRes } from "@/src/types/serverAction";
import { Database } from "@/supabase/database.types";

import { getUser } from "../getUser";

// Define the custom return type using Supabase's generated types
type UserSubscription = {
  subscription: Database["public"]["Tables"]["subscriptions"]["Row"] | null;
  user: Database["public"]["Tables"]["profiles"]["Row"];
};

export async function getUserSubscription(): ServerActionRes<UserSubscription> {
  // Add a try-catch block for robust error handling
  try {
    const supabase = await createClient();
    const userRes = await getUser();

    if (!userRes.success) {
      return { success: false, error: "User not found" };
    }

    const user = userRes.data;

    // Fetch details from your public 'users' table
    const { data: userDetails, error: userDetailsError } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single(); // Use .single() as an auth user should have one corresponding user record

    if (userDetailsError) {
      // This error indicates a data inconsistency (e.g., user in auth but not in public.users)
      return { success: false, error: "User details not found" };
    }

    // If the user has no subscription ID, we can return early
    if (!userDetails.current_subscription_id) {
      return { success: true, data: { subscription: null, user: userDetails } };
    }

    // Fetch the subscription record. Use .maybeSingle() in case the subscription
    // reference is stale and the record doesn't exist anymore.
    const { data: subscription, error: subscriptionError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("subscription_id", userDetails.current_subscription_id)
      .maybeSingle();

    if (subscriptionError) {
      // This indicates a more serious issue than just a missing record
      return { success: false, error: "Failed to retrieve subscription data" };
    }

    return {
      success: true,
      data: { subscription, user: userDetails },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}
