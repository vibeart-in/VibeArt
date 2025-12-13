"use server";

import { createClient } from "@/src/lib/supabase/server";

export async function deleteImage(imageId: string) {
  try {
    const supabase = await createClient();

    // Verify authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Fix Foreign Key Constraint: "conversations_image_fkey"
    // Set conversation image/cover to null if it references this image
    const { error: updateError } = await supabase
      .from("conversations")
      .update({ image: null })
      .eq("image", imageId);

    if (updateError) {
      console.warn("Failed to unlink image from conversation (might be wrong column name or harmless):", updateError);
      // We continue, as maybe the column is different or row doesn't exist.
      // If it fails here, the delete below will likely fail with FK violation anyway.
    }

    const { error } = await supabase.from("images").delete().eq("id", imageId);

    if (error) {
      console.error("Supabase Image Delete Error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error("Server Action Error:", err);
    return { success: false, error: err.message || "Unknown error" };
  }
}
