"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/src/lib/supabase/server";
import { ServerActionRes } from "@/src/types/serverAction";

export async function cloneCanvasAction(canvasId: string): ServerActionRes<{ canvasId: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    // Fetch the original canvas
    const { data: originalCanvas, error: fetchError } = await supabase
      .from("canvas")
      .select("*")
      .eq("id", canvasId)
      .single();

    if (fetchError || !originalCanvas) {
      return { success: false, error: "Canvas not found" };
    }

    // Create a new canvas with the same content
    const { data: newCanvas, error: createError } = await supabase
      .from("canvas")
      .insert({
        user_id: user.id,
        title: `${originalCanvas.title || "Untitled"} (Copy)`,
        content: originalCanvas.content,
        cover: originalCanvas.cover,
      })
      .select("id")
      .single();

    if (createError || !newCanvas) {
      return { success: false, error: "Failed to clone canvas" };
    }

    revalidatePath("/canvas");
    return { success: true, data: { canvasId: newCanvas.id } };
  } catch (error) {
    console.error("Error cloning canvas:", error);
    return { success: false, error: "Internal server error" };
  }
}
