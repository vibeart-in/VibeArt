"use server";

import { createClient } from "@/src/lib/supabase/server";
import { revalidatePath } from "next/cache";

import { getUser } from "@/src/actions/getUser";
import { ServerActionRes } from "@/src/types/serverAction";

export async function updateProjectAction(
  projectId: string,
  payload: {
    title?: string;
    content?: any;
    cover?: string; // UUID of the image if updating the cover
  },
): ServerActionRes {
  try {
    const userRes = await getUser();
    if (!userRes.success || !userRes.data) {
      return { success: false, error: "Unauthorized" };
    }
    const user = userRes.data;

    const supabase = await createClient();

    const { error } = await supabase
      .from("canvas")
      .update({
        ...payload,
        updated_at: new Date().toISOString(),
      })
      .eq("id", projectId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error updating canvas:", error);
      return { success: false, error: "Failed to update project" };
    }

    revalidatePath("/canvas");
    return { success: true };
  } catch (error) {
    console.error("Error in updateProjectAction:", error);
    return { success: false, error: "Internal server error" };
  }
}
