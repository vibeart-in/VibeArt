"use server";

import { createClient } from "@/src/lib/supabase/server";
import sharp from "sharp";
import { nanoid } from "nanoid";

export async function uploadImageAction(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    if (!file) return { success: false, error: "No file" };

    const supabase = await createClient();

    // 1. Auth Check
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    // 2. Process Image (Dimensions)
    const buffer = Buffer.from(await file.arrayBuffer());
    const metadata = await sharp(buffer).metadata();

    const canvasId = formData.get("canvasId") as string;
    if (!canvasId) return { success: false, error: "No canvas ID" };

    // 3. Upload
    const customFileName = formData.get("customFileName") as string;
    let filePath;

    if (customFileName) {
      filePath = `${user.id}/${canvasId}/${customFileName}`;
    } else {
      const fileExt = file.name.split(".").pop();
      filePath = `${user.id}/${canvasId}/${nanoid()}.${fileExt}`;
    }

    const bucket = "canvas";

    const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file, {
      upsert: !!customFileName,
    });

    console.log("ERROR", uploadError);
    console.log(customFileName);

    if (uploadError) return { success: false, error: uploadError.message };

    // 4. GET PUBLIC URL (Simpler!)
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(filePath);

    console.log("public URL", publicUrl);

    let dbRecord;
    let dbError;

    if (customFileName) {
      // Check if image exists
      const { data: existing } = await supabase
        .from("images")
        .select("id")
        .eq("image_url", publicUrl)
        .single();

      if (existing) {
        dbRecord = existing;
      } else {
        const { data, error } = await supabase
          .from("images")
          .insert({
            user_id: user.id,
            image_url: publicUrl,
            width: metadata.width,
            height: metadata.height,
            is_public: true,
          })
          .select("id")
          .single();
        dbRecord = data;
        dbError = error;
      }
    } else {
      const { data, error } = await supabase
        .from("images")
        .insert({
          user_id: user.id,
          image_url: publicUrl,
          width: metadata.width,
          height: metadata.height,
          is_public: true,
        })
        .select("id")
        .single();
      dbRecord = data;
      dbError = error;
    }

    if (dbError || !dbRecord)
      return { success: false, error: dbError?.message || "Failed to save image record" };

    // ✅ NEW: Automatically link this image to the canvas input_images array
    const { error: linkError } = await supabase.rpc("append_input_image_to_canvas", {
      p_canvas_id: canvasId,
      p_image_id: dbRecord.id,
    });

    if (linkError) console.error("Failed to link image to canvas:", linkError);

    return {
      success: true,
      data: {
        imageId: dbRecord.id,
        url: publicUrl,
        width: metadata.width,
        height: metadata.height,
      },
    };
  } catch (error) {
    return { success: false, error: "Server error" };
  }
}
