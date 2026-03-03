"use server";

import { nanoid } from "nanoid";

import { createClient } from "@/src/lib/supabase/server";

// Helper function to get image dimensions from buffer
async function getImageDimensions(buffer: Buffer): Promise<{ width: number; height: number }> {
  // Read dimensions from image file headers
  // PNG signature and dimensions
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
    return {
      width: buffer.readUInt32BE(16),
      height: buffer.readUInt32BE(20),
    };
  }

  // JPEG/JPG
  if (buffer[0] === 0xff && buffer[1] === 0xd8) {
    let offset = 2;
    while (offset < buffer.length) {
      if (buffer[offset] !== 0xff) break;
      const marker = buffer[offset + 1];
      if (marker === 0xc0 || marker === 0xc2) {
        return {
          height: buffer.readUInt16BE(offset + 5),
          width: buffer.readUInt16BE(offset + 7),
        };
      }
      offset += 2 + buffer.readUInt16BE(offset + 2);
    }
  }

  // GIF
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) {
    return {
      width: buffer.readUInt16LE(6),
      height: buffer.readUInt16LE(8),
    };
  }

  // WebP
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    // VP8
    if (buffer[12] === 0x56 && buffer[13] === 0x50 && buffer[14] === 0x38) {
      if (buffer[15] === 0x20) {
        // VP8
        return {
          width: buffer.readUInt16LE(26) & 0x3fff,
          height: buffer.readUInt16LE(28) & 0x3fff,
        };
      } else if (buffer[15] === 0x4c) {
        // VP8L
        const bits = buffer.readUInt32LE(21);
        return {
          width: (bits & 0x3fff) + 1,
          height: ((bits >> 14) & 0x3fff) + 1,
        };
      } else if (buffer[15] === 0x58) {
        // VP8X
        return {
          width: (buffer.readUIntLE(24, 3) & 0xffffff) + 1,
          height: (buffer.readUIntLE(27, 3) & 0xffffff) + 1,
        };
      }
    }
  }

  // Fallback - return default dimensions
  return { width: 0, height: 0 };
}

export async function uploadImageAction(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    if (!file) return { success: false, error: "No file" };

    // Limit: Images 5MB, Videos 10MB
    const isVideoUpload = file.type.startsWith("video");
    const limit = isVideoUpload ? 10 * 1024 * 1024 : 5 * 1024 * 1024;

    if (file.size > limit)
      return { success: false, error: `File size exceeds ${isVideoUpload ? "10MB" : "5MB"}` };

    const supabase = await createClient();

    // 1. Auth Check
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    // 2. Process Image (Dimensions)
    let width: number | undefined;
    let height: number | undefined;

    const isVideo = file.type.startsWith("video");

    if (isVideo) {
      width = Number(formData.get("width")) || 0;
      height = Number(formData.get("height")) || 0;
    } else {
      const buffer = Buffer.from(await file.arrayBuffer());
      const dimensions = await getImageDimensions(buffer);
      width = dimensions.width;
      height = dimensions.height;
    }

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
            width: width,
            height: height,
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
          width: width,
          height: height,
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
        width: width,
        height: height,
      },
    };
  } catch (error) {
    return { success: false, error: "Server error" };
  }
}
