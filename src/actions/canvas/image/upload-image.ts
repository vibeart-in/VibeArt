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

    // 3. Upload
    const fileExt = file.name.split(".").pop();
    const filePath = `${user.id}/${nanoid()}.${fileExt}`;
    const bucket = "canvas";

    const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file);

    if (uploadError) return { success: false, error: uploadError.message };

    // 4. GET PUBLIC URL (Simpler!)
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(filePath);

    // 5. Insert into DB
    const { data: dbRecord, error: dbError } = await supabase
      .from("images")
      .insert({
        user_id: user.id,
        image_url: publicUrl, // STORE THE FULL URL NOW
        width: metadata.width,
        height: metadata.height,
        is_public: true,
      })
      .select("id")
      .single();

    if (dbError) return { success: false, error: dbError.message };

    return {
      success: true,
      data: {
        imageId: dbRecord.id,
        url: publicUrl, // This is permanent now
        width: metadata.width,
        height: metadata.height,
      },
    };
  } catch (error) {
    return { success: false, error: "Server error" };
  }
}
