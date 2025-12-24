import { uploadImageAction } from "../actions/canvas/image/upload-image";

/**
 * Converts a Canvas to a Blob, then to a File, and uploads it to Supabase.
 * Returns the public URL of the uploaded image.
 */
export async function uploadCanvasToSupabase(
  canvas: HTMLCanvasElement, 
  filename: string = "processed_image.jpg"
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Convert to JPEG for better compatibility and smaller size
    canvas.toBlob(async (blob) => {
      if (!blob) {
        reject(new Error("Failed to create blob from canvas"));
        return;
      }

      // Ensure filename ends in .jpg
      const finalFilename = filename.replace(/\.(png|jpeg|webp)$/i, "") + ".jpg";
      const file = new File([blob], finalFilename, { type: "image/jpeg" });
      const formData = new FormData();
      formData.append("file", file);

      try {
        const result = await uploadImageAction(formData);
        if (result.success && result.data) {
          resolve(result.data.url);
        } else {
          reject(new Error(result.error || "Upload failed"));
        }
      } catch (err) {
        reject(err);
      }
    }, "image/jpeg", 0.95);
  });
}
