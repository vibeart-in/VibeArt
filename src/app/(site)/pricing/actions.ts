"use server";

import {
  Environment,
  Paddle,
} from "@paddle/paddle-node-sdk";
import { createClient } from "@/src/lib/supabase/server";

const paddle = new Paddle(process.env.PADDLE_SECRET_TOKEN!, {
  environment: Environment.sandbox,
});

/**
 * Get current user's subscription status
 * @returns Promise<string | null> - The subscription status or null if not authenticated
 */
export async function getCurrentUserSubscriptionDetails(): Promise<{
  subscription_tier: string | null;
  subscription_type: string | null;
  subscription_id: string | null;
} | null> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return null;
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("subscription_tier, subscription_type, paddle_subscription_id")
      .eq("user_id", user.id)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      return null;
    }

    return {
      subscription_tier: profile?.subscription_tier || null,
      subscription_type: profile?.subscription_type || null,
      subscription_id: profile?.paddle_subscription_id || null,
    };
  } catch (error) {
    console.error("Error in getCurrentUserSubscriptionDetails:", error);
    return null;
  }
}
export async function updateSubscription(
  priceId: string,
  subscriptionId: string
) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return null;
  }
  console.log("Subscription ID:", subscriptionId);
  const subscription = paddle.subscriptions.update(subscriptionId, {
    items: [{ priceId: priceId, quantity: 1 }],
    prorationBillingMode: "prorated_immediately",
    collectionMode: "manual"
  });
  // Returns an updated subscription entity
  console.log("Subscription updated:", subscription);
  return subscription;
}
