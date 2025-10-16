"use server";
import { createClient } from "@/src/lib/supabase/server";

import { createDodoCustomer } from "./createDodoCustomer";
import { getUser } from "../getUser";

// Server action: runs on server, does supabase operations and (if needed) creates Dodo customer
export async function ensureDodoCustomer(): Promise<{
  success: boolean;
  alreadyExists?: boolean;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    const userRes = await getUser();
    if (!userRes.success) {
      return { success: false, error: "User not found" };
    }

    const user = userRes.data;

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("customer_id, full_name")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profileError) {
      return { success: false, error: "Failed to read profile" };
    }

    // ✅ Customer already exists
    if (profile?.customer_id) {
      return { success: true, alreadyExists: true };
    }

    // ❌ No customer_id, so create one
    const dodoRes = await createDodoCustomer({
      email: user.email!,
      name: user.user_metadata?.name ?? profile?.full_name ?? user.email!.split("@")[0],
    });

    if (!dodoRes.success) {
      return { success: false, error: "Failed to create Dodo customer" };
    }

    const { error: updateErr } = await supabase
      .from("profiles")
      .update({
        customer_id: dodoRes.data.customer_id,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    if (updateErr) {
      return { success: false, error: "Failed to update profile" };
    }

    return { success: true, alreadyExists: false };
  } catch (err) {
    console.error(err);
    return { success: false, error: "Unknown server error" };
  }
}
