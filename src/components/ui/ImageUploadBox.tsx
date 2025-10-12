// src/components/ui/ImageUploadBox.tsx
"use client";
import { ImagesIcon, XIcon } from "lucide-react";
import Image from "next/image";
import React, { useRef, useState, useEffect, memo } from "react";

import { uploadImage } from "@/src/utils/server/UploadImage";

interface ImageUploadBoxProps {
  onImageUploaded: (paths: { permanentPath: string; displayUrl: string }) => void;
  onImageRemoved: () => void;
  initialImage?: { permanentPath: string; displayUrl: string } | null;
  imageDescription?: string;
  resetOnSuccess?: boolean;
}

const ImageUploadBox = ({
  onImageUploaded,
  onImageRemoved,
  initialImage = null,
  imageDescription = "Add Image",
  resetOnSuccess = false,
}: ImageUploadBoxProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [image, setImage] = useState(initialImage);

  useEffect(() => {
    setImage(initialImage);
  }, [initialImage]);

  const handleClick = () => {
    if (isUploading || image) return;
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
        onSuccess: (permanentPath, displayUrl) => {
          const newImage = { permanentPath, displayUrl };

          // Inform the parent first
          onImageUploaded(newImage);
          setIsUploading(false);

          // THE FIX: Conditionally reset the internal state
          if (resetOnSuccess) {
            setImage(null);
            // Also clear the file input so the same file can be re-selected immediately
            if (inputRef.current) {
              inputRef.current.value = "";
            }
          } else {
            // This is for the single-image uploader behavior
            setImage(newImage);
          }
        },
        onError: (err) => {
          setError(`Upload failed: ${err.message}`);
          setIsUploading(false);
        },
      });
    } catch (err: any) {
      setError(err.message);
      setIsUploading(false);
    }
  };

  const handleRemove = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setImage(null);
    onImageRemoved();
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  // Render Logic
  const renderContent = () => {
    if (error) {
      return <span className="text-xs text-red-500">{error}</span>;
    }
    if (isUploading) {
      return (
        <div className="text-center">
          <span>{uploadProgress.toFixed(0)}%</span>
          <div className="mt-1 h-1.5 w-full rounded-full bg-gray-600">
            <div
              className="h-1.5 rounded-full bg-green-500"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      );
    }
    if (image) {
      return (
        <div className="group relative size-full">
          <Image
            src={image.displayUrl}
            alt="Uploaded preview"
            width={80}
            height={80}
            className="size-full rounded-[20px] object-cover object-top"
          />
          <button
            onClick={handleRemove}
            className="absolute right-2 top-2 rounded-full bg-black bg-opacity-50 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
            aria-label="Remove image"
          >
            <XIcon size={16} />
          </button>
        </div>
      );
    }
    // Default state: The uploader button
    return (
      <div className="flex flex-col items-center justify-center gap-1 text-center font-semibold text-white">
        <ImagesIcon size={20} />
        <p className="text-xs">{imageDescription}</p>
      </div>
    );
  };

  return (
    <div
      onClick={handleClick}
      className={`relative flex size-[100px] items-center justify-center rounded-3xl border border-white/30 bg-black p-1.5 text-white/60 transition-all duration-300 ${!image && !isUploading ? "cursor-pointer hover:text-white" : ""}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      {renderContent()}
    </div>
  );
};

export default memo(ImageUploadBox);
