"use server";

import { adminAuthClient } from "@/src/lib/supabase/admin";
import { createClient } from "@/src/lib/supabase/server";
import { ServerActionRes } from "@/src/types/serverAction";

import { getUser } from "../getUser";

export async function deleteAccount(): ServerActionRes {
  try {
    const userRes = await getUser();
    const supabase = await createClient();
    if (!userRes.success) {
      return {
        success: false,
        error: "User not found",
      };
    }

    // This deletes the user from Supabase Auth
    const { error: authError } = await adminAuthClient.deleteUser(userRes.data.id);
    if (authError) {
      return {
        success: false,
        error: authError.message,
      };
    }

    // This performs a soft delete on the user's record in your public 'users' table
    const { error: dbError } = await supabase
      .from("profiles")
      .update({
        deleted_at: new Date().toISOString(),
      })
      .eq("supabaseUserId", userRes.data.id);

    if (dbError) {
      // If the database update fails, return the error
      return {
        success: false,
        error: dbError.message,
      };
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
