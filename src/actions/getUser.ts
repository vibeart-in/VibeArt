"use server";

import type { User } from "@supabase/supabase-js";

import { createClient } from "../lib/supabase/server";
import { ServerActionRes } from "../types/serverAction";

export async function getUser(): ServerActionRes<User> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "User not found" };
    }

    return { success: true, data: user };
  } catch (error) {
    return { success: false, error: "Failed to get user" };
  }
}
