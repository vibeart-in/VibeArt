// src/components/ui/ImageUploadBox.tsx
"use client";
import { uploadImage } from "@/src/lib/UploadImage";
import { ImagesIcon, XIcon } from "lucide-react";
import Image from "next/image";
import React, { useRef, useState, useEffect } from "react";

interface ImageUploadBoxProps {
  // NEW: Callbacks to inform the parent of changes
  onImageUploaded: (paths: { permanentPath: string; displayUrl: string }) => void;
  onImageRemoved: () => void;

  // NEW: Prop to set an initial image from the parent
  initialImage?: { permanentPath: string; displayUrl: string } | null;

  imageDescription?: string;
}

const ImageUploadBox = ({
  onImageUploaded,
  onImageRemoved,
  initialImage = null,
  imageDescription = "Add Image",
}: ImageUploadBoxProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // This is the key change: the component now owns its image state
  const [image, setImage] = useState(initialImage);
  console.log(image);

  // Effect to sync with the parent if the initial image prop changes
  useEffect(() => {
    setImage(initialImage);
  }, [initialImage]);

  const handleClick = () => {
    if (isUploading || image) return; // Don't re-trigger if uploading or image exists
    inputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsUploading(true);
    setUploadProgress(0);
    setImage(null);

    try {
      // The upload function now calls our internal success/error handlers
      await uploadImage({
        file,
        onProgress: (p) => setUploadProgress(Number(p.toFixed(0))),
        onSuccess: (permanentPath, displayUrl) => {
          const newImage = { permanentPath, displayUrl };
          setImage(newImage);
          onImageUploaded(newImage); // Inform the parent
          setIsUploading(false);
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
    e.stopPropagation(); // Prevent the main div's click handler
    setImage(null);
    onImageRemoved(); // Inform the parent
    // Also clear the file input so the same file can be re-selected
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
        <div className="group relative h-full w-full">
          <Image
            src={image.displayUrl}
            alt="Uploaded preview"
            width={80}
            height={80}
            className="h-full w-full rounded-[20px] object-cover object-top"
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
      className={`relative flex h-[100px] w-[100px] items-center justify-center rounded-3xl border border-white/30 bg-black p-1.5 text-white/60 transition-all duration-300 ${!image && !isUploading ? "cursor-pointer hover:text-white" : ""}`}
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

export default ImageUploadBox;
