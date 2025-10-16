"use server";
import { createClient } from "@/src/lib/supabase/server";
import { ServerActionRes } from "@/src/types/serverAction";

import { getUser } from "./getUser";

export async function saveOnboardingChoice(choice: string): ServerActionRes<string> {
  try {
    const supabase = await createClient();

    const userRes = await getUser();

    if (!userRes.success) {
      return { success: false, error: "User not found" };
    }

    const user = userRes.data;

    // Insert or update the onboarding choice
    const { error } = await supabase.from("onboarding").upsert(
      {
        user_id: user.id,
        primary_choice: choice,
        created_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id",
      },
    );

    if (error) {
      console.error("Error saving onboarding choice:", error);
      return { success: false, error: "Failed to save onboarding choice" };
    }

    return { success: true, data: "Success" };
  } catch (err) {
    console.error("Unknown error saving onboarding choice:", err);
    return { success: false, error: "Unknown server error" };
  }
}
