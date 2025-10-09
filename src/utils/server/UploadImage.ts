// src/lib/UploadImage.ts

import { supabase } from "@/src/lib/supabase/client";
import * as tus from "tus-js-client";

interface UploadOptions {
  file: File;
  onProgress?: (progress: number) => void;
  onError?: (err: Error) => void;
  onSuccess?: (permanentPath: string, displayUrl: string) => void;
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

  const filePath = `${user.id}/${Date.now()}_${file.name.replace(/\s/g, "_")}`;

  return new Promise((resolve, reject) => {
    const upload = new tus.Upload(file, {
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
        contentType: file.type,
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
        const fullPermanentPath = `${filePath}`;

        // Generate a short-lived signed URL for client-side display
        const { data: signedUrlData, error: signedUrlError } = await supabase.storage
          .from(bucketName)
          .createSignedUrl(filePath, 3600);

        if (signedUrlError || !signedUrlData) {
          onError?.(signedUrlError);
          reject(signedUrlError);
          return;
        }

        onSuccess?.(fullPermanentPath, signedUrlData.signedUrl); // Pass both to callback
        resolve({
          permanentPath: fullPermanentPath,
          displayUrl: signedUrlData.signedUrl,
        });
      },
    });
    upload.start();
  });
};
