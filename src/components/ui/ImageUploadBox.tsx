"use client";
import { supabase } from "@/src/lib/supabase/client";
import { ImagesIcon, X, CheckCircle2 } from "lucide-react";
import React, { useRef, useState } from "react";
import * as tus from "tus-js-client";

// Define the props for the component, including the callback
interface ImageUploadBoxProps {
  onUploadComplete: (url: string) => void;
}

const ImageUploadBox = ({ onUploadComplete }: ImageUploadBoxProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const tusUploadRef = useRef<tus.Upload | null>(null);

  // State management for the upload process
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleClick = () => {
    // Don't open file dialog if an upload is in progress or has just succeeded
    if (isUploading || isSuccess) return;
    inputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset states before starting a new upload
    setError(null);
    setIsSuccess(false);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // 1. Get user session for RLS policy
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user = session?.user;

      if (!user) {
        throw new Error("You must be logged in to upload an image.");
      }

      // 2. Get Supabase project details for TUS client
      const accessToken = session.access_token;
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const bucketName = "uploaded-images"; // Your bucket name
      const filePath = `${user.id}/${file.name}`; // File path for RLS

      // 3. Create a new TUS upload instance
      const upload = new tus.Upload(file, {
        endpoint: `${supabaseUrl}/storage/v1/upload/resumable`,
        retryDelays: [0, 3000, 5000, 10000, 20000],
        headers: {
          authorization: `Bearer ${accessToken}`,
          "x-upsert": "true", // Ovwrites file with same name
        },
        uploadDataDuringCreation: true,
        metadata: {
          bucketName: bucketName,
          objectName: filePath,
          contentType: file.type,
        },
        chunkSize: 6 * 1024 * 1024, // 6MB chunks
        onError: (err) => {
          setError(`Upload failed: ${err.message}`);
          setIsUploading(false);
        },
        onProgress: (bytesUploaded, bytesTotal) => {
          const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
          setUploadProgress(Number(percentage));
        },
        onSuccess: async () => {
          // 4. On success, create a signed URL for the private file
          const { data, error: urlError } = await supabase.storage
            .from(bucketName)
            .createSignedUrl(filePath, 3600); // URL valid for 1 hour

          if (urlError) {
            setError(`Failed to get signed URL: ${urlError.message}`);
          } else {
            onUploadComplete(data.signedUrl);
            // setIsSuccess(true);
          }
          setIsUploading(false);
        },
      });

      // Store the upload instance to allow cancellation
      tusUploadRef.current = upload;
      upload.start();
    } catch (err: any) {
      setError(err.message);
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    if (tusUploadRef.current) {
      tusUploadRef.current.abort();
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`w-[100px] h-full relative flex items-center justify-center 
                 bg-black border border-white/30 
                 shadow-[inset_0px_0px_27.5px_4px_rgba(106,106,106,0.25)] 
                 rounded-[21px] text-white/60 transition-all duration-300
                 ${
                   isUploading || isSuccess
                     ? "cursor-default"
                     : "cursor-pointer hover:text-white"
                 }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <div className="text-xs flex flex-col justify-center items-center text-center p-2">
        {error && <span className="text-red-500">{error}</span>}

        {isUploading && !error && (
          <>
            <span>{uploadProgress.toFixed(0)}%</span>
            <div className="w-full bg-gray-600 rounded-full h-1.5 mt-1">
              <div
                className="bg-green-500 h-1.5 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <button
              onClick={handleCancel}
              className="mt-2 text-red-400 hover:text-red-300"
            >
              Cancel
            </button>
          </>
        )}

        {isSuccess && !isUploading && !error && (
          <span className="flex flex-col items-center text-green-400">
            <CheckCircle2 size={24} />
            Done
          </span>
        )}

        {!isUploading && !isSuccess && !error && (
          <>
            <ImagesIcon size={20} />
            Add image
          </>
        )}
      </div>
    </div>
  );
};

export default ImageUploadBox;
