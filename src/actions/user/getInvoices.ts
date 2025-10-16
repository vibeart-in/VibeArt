"use server";

import { createClient } from "@/src/lib/supabase/server";
import { ServerActionRes } from "@/src/types/serverAction";
import { Database } from "@/supabase/database.types";

import { getUserSubscription } from "../subscription/getUserSubscriptionFull";

// Define a type for a single payment row from your Supabase schema
type Payment = Database["public"]["Tables"]["payments"]["Row"];

export async function getInvoices(): ServerActionRes<Payment[]> {
  try {
    const supabase = await createClient();
    const subscriptionRes = await getUserSubscription();

    if (!subscriptionRes.success || !subscriptionRes.data.user.customer_id) {
      return { success: false, error: "Subscription or Customer ID not found" };
    }

    const { data: invoices, error: dbError } = await supabase
      .from("payments")
      .select("*")
      .eq("customer_id", subscriptionRes.data.user.customer_id);

    if (dbError) {
      // If the database query itself fails, throw an error
      throw new Error(dbError.message);
    }

    return { success: true, data: invoices };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get invoices",
    };
  }
}
