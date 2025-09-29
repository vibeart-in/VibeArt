import { supabase } from "@/src/lib/supabase/client";
import * as tus from "tus-js-client";

interface UploadResult {
  signedUrl: string;
}

interface UploadOptions {
  file: File;
  onProgress?: (progress: number) => void;
  onError?: (err: Error) => void;
  onSuccess?: (signedUrl: string) => void;
}

export const uploadImage = async ({
  file,
  onProgress,
  onError,
  onSuccess,
}: UploadOptions): Promise<UploadResult> => {
  // 1. Get session
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;

  if (!user) {
    throw new Error("You must be logged in to upload an image.");
  }

  const accessToken = session.access_token;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const bucketName = "uploaded-images";
  const filePath = `${user.id}/${file.name}`;

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
        const { data, error } = await supabase.storage
          .from(bucketName)
          .createSignedUrl(filePath, 3600);

        if (error) {
          onError?.(error);
          reject(error);
        } else {
          onSuccess?.(data.signedUrl);
          resolve({ signedUrl: data.signedUrl });
        }
      },
    });

    upload.start();
  });
};
