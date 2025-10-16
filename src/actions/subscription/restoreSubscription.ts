"use server";

import { dodoClient } from "@/src/lib/dodoPayments";
import { createClient } from "@/src/lib/supabase/server";
import { ServerActionRes } from "@/src/types/serverAction";

export async function restoreSubscription(props: { subscriptionId: string }): ServerActionRes {
  try {
    const supabase = await createClient();

    // First, update the subscription with the payment provider
    await dodoClient.subscriptions.update(props.subscriptionId, {
      cancel_at_next_billing_date: false,
    });

    // Next, update your local database record
    const { error: dbError } = await supabase
      .from("subscriptions")
      .update({
        cancel_at_next_billing_date: false,
      })
      .eq("subscription_id", props.subscriptionId);

    // If the database update fails, throw an error
    if (dbError) {
      throw new Error(dbError.message);
    }

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}
