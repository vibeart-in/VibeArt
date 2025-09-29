"use client";
import { uploadImage } from "@/src/lib/UploadImage";
import { ImagesIcon } from "lucide-react";
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

  const handleClick = () => {
    // // Don't open file dialog if an upload is in progress or has just succeeded
    if (isUploading) return;
    inputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      await uploadImage({
        file,
        onProgress: (p) => setUploadProgress(Number(p.toFixed(0))),
        onError: (err) => {
          setError(`Upload failed: ${err.message}`);
          setIsUploading(false);
        },
        onSuccess: (url) => {
          onUploadComplete(url);
          setIsUploading(false);
        },
      });
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
    sessionStorage.removeItem("initialEditImage");
  };

  return (
    <div
      onClick={handleClick}
      className={`w-[100px] h-full relative flex items-center justify-center 
                 bg-black border border-white/30 
                 shadow-[inset_0px_0px_27.5px_4px_rgba(106,106,106,0.25)] 
                 rounded-[21px] text-white/60 transition-all duration-300
                 cursor-pointer hover:text-white`}
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

        {/* {isSuccess && !isUploading && !error && (
          <span className="flex flex-col items-center text-green-400">
            <CheckCircle2 size={24} />
            Done
          </span>
        )} */}

        {!isUploading && !error && (
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
