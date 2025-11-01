// src/lib/UploadImage.ts
import * as tus from "tus-js-client";

import { supabase } from "@/src/lib/supabase/client";

interface UploadOptions {
  file: File;
  onProgress?: (progress: number) => void;
  onError?: (err: Error) => void;
  onSuccess?: (permanentPath: string, displayUrl: string) => void;
}

// Utility to convert any image file to JPEG
async function convertToJpeg(file: File, quality = 0.9): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Failed to create canvas context"));

      ctx.drawImage(img, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error("Failed to convert image to JPEG"));
          const newFile = new File([blob], file.name.replace(/\.\w+$/, ".jpg"), {
            type: "image/jpeg",
            lastModified: Date.now(),
          });
          resolve(newFile);
        },
        "image/jpeg",
        quality,
      );
    };

    img.onerror = (err) => reject(err);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

export const uploadImage = async ({
  file,
  onProgress,
  onError,
  onSuccess,
}: UploadOptions): Promise<{ permanentPath: string; displayUrl: string }> => {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session || !session.user) {
    throw new Error("You must be logged in to upload an image.");
  }

  const user = session.user;
  const accessToken = session.access_token;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const bucketName = "uploaded-images";

  // ✅ Convert image to JPG before upload
  const convertedFile = await convertToJpeg(file);

  const filePath = `${user.id}/${Date.now()}_${convertedFile.name.replace(/\s/g, "_")}`;

  return new Promise((resolve, reject) => {
    const upload = new tus.Upload(convertedFile, {
      endpoint: `${supabaseUrl}/storage/v1/upload/resumable`,
      retryDelays: [0, 3000, 5000, 10000, 20000],
      headers: {
        authorization: `Bearer ${accessToken}`,
        "x-upsert": "true",
      },
      uploadDataDuringCreation: true,
      metadata: {
        bucketName,
        objectName: filePath,
        contentType: "image/jpeg",
      },
      chunkSize: 6 * 1024 * 1024, // 6MB
      onError: (err) => {
        onError?.(err);
        reject(err);
      },
      onProgress: (bytesUploaded, bytesTotal) => {
        const percentage = (bytesUploaded / bytesTotal) * 100;
        onProgress?.(percentage);
      },
      onSuccess: async () => {
        const { data: signedUrlData, error: signedUrlError } = await supabase.storage
          .from(bucketName)
          .createSignedUrl(filePath, 3600);

        if (signedUrlError || !signedUrlData) {
          onError?.(signedUrlError);
          reject(signedUrlError);
          return;
        }

        onSuccess?.(filePath, signedUrlData.signedUrl);
        resolve({
          permanentPath: filePath,
          displayUrl: signedUrlData.signedUrl,
        });
      },
    });

    upload.start();
  });
};
