"use server";

import { dodoClient } from "@/src/lib/dodoPayments";
import { createClient } from "@/src/lib/supabase/server";
import { ServerActionRes } from "@/src/types/serverAction";

export async function cancelSubscription(props: { subscriptionId: string }): ServerActionRes {
  try {
    const supabase = await createClient();
    console.log("props.subscriptionId", props.subscriptionId);
    const res = await dodoClient.subscriptions.update(props.subscriptionId, {
      cancel_at_next_billing_date: true,
    });

    const { error: dbError } = await supabase
      .from("subscriptions")
      .update({
        cancel_at_next_billing_date: true,
      })
      .eq("subscription_id", props.subscriptionId);

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
