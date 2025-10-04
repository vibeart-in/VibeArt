"use client";
import { uploadImage } from "@/src/lib/UploadImage";
import { ImagesIcon, XIcon } from "lucide-react";
import Image from "next/image";
import React, { useRef, useState } from "react";
import * as tus from "tus-js-client";

interface ImageUploadBoxProps {
  onUploadComplete: (permanentPath: string, displayUrl: string) => void;
  showImage?: boolean;
  imageDescription?: string;
}

const ImageUploadBox = ({
  onUploadComplete,
  showImage = false,
  imageDescription = "Add Image",
}: ImageUploadBoxProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const tusUploadRef = useRef<tus.Upload | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadedDisplayUrl, setUploadedDisplayUrl] = useState<string | null>(
    null
  );

  const handleClick = () => {
    if (isUploading) return;
    inputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsUploading(true);
    setUploadProgress(0);
    setUploadedDisplayUrl(null);

    try {
      const result = await uploadImage({
        file,
        onProgress: (p) => setUploadProgress(Number(p.toFixed(0))),
        onError: (err) => {
          setError(`Upload failed: ${err.message}`);
          setIsUploading(false);
        },
        onSuccess: (permanentPath, displayUrl) => {
          onUploadComplete(permanentPath, displayUrl);
          setUploadedDisplayUrl(displayUrl);
          setIsUploading(false);
        },
      });
      if (!uploadedDisplayUrl) {
        setUploadedDisplayUrl(result.displayUrl);
        onUploadComplete(result.permanentPath, result.displayUrl);
      }
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
    setUploadedDisplayUrl(null);
  };

  return (
    <div
      onClick={handleClick}
      className={`w-[100px] h-[100px] relative flex items-center justify-center
                 bg-black border border-white/30
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
      <div className="text-xs w-full h-full flex flex-col justify-center items-center text-center p-2">
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
              onClick={(e) => {
                e.stopPropagation();
                handleCancel();
              }}
              className="mt-2 text-red-400 hover:text-red-300"
            >
              Cancel
            </button>
          </>
        )}

        {!isUploading &&
          !error &&
          uploadedDisplayUrl &&
          showImage && ( // Use uploadedDisplayUrl
            <div className="w-full h-full group">
              <Image
                src={uploadedDisplayUrl} // Use the display URL here
                alt="Uploaded preview"
                width={80}
                height={80}
                className="w-full h-full object-cover object-top rounded-xl"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setUploadedDisplayUrl(null);
                  onUploadComplete("","");
                }}
                className="absolute top-2 right-2 bg-black bg-opacity-50 rounded-full p-1
                                   text-white opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Remove image"
              >
                <XIcon size={16} />
              </button>
            </div>
          )}

        {!isUploading && !error && (!showImage || !uploadedDisplayUrl) && (
          <div className="text-white flex flex-col justify-center items-center gap-1 font-semibold">
            <ImagesIcon size={20} />
            <p>{imageDescription}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploadBox;
