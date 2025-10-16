// src/components/ui/VideoUploadBox.tsx
"use client";
import { VideoIcon, XIcon } from "lucide-react";
import React, { useRef, useState, useEffect, memo } from "react";

import { uploadImage } from "@/src/utils/server/UploadImage"; // implement or rename to your existing util

interface VideoUploadBoxProps {
  onVideoUploaded: (paths: { permanentPath: string; displayUrl: string }) => void;
  onVideoRemoved: () => void;
  initialVideo?: { permanentPath: string; displayUrl: string } | null;
  videoDescription?: string;
  resetOnSuccess?: boolean;
}

const VideoUploadBox = ({
  onVideoUploaded,
  onVideoRemoved,
  initialVideo = null,
  videoDescription = "Add video",
  resetOnSuccess = false,
}: VideoUploadBoxProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [video, setVideo] = useState<{ permanentPath: string; displayUrl: string } | null>(
    initialVideo,
  );

  // local preview for selected file before server returns displayUrl
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    setVideo(initialVideo);
  }, [initialVideo]);

  // cleanup object URL when component unmounts or preview changes
  useEffect(() => {
    return () => {
      if (localPreviewUrl) {
        URL.revokeObjectURL(localPreviewUrl);
      }
    };
  }, [localPreviewUrl]);

  const handleClick = () => {
    if (isUploading || video) return;
    inputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // create local preview immediately
    if (localPreviewUrl) {
      URL.revokeObjectURL(localPreviewUrl);
    }
    const tempUrl = URL.createObjectURL(file);
    setLocalPreviewUrl(tempUrl);

    setError(null);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      await uploadImage({
        file,
        onProgress: (p: number) => setUploadProgress(Number(p.toFixed(0))),
        onSuccess: (permanentPath: string, displayUrl: string) => {
          const newVideo = { permanentPath, displayUrl };

          // Inform parent first
          onVideoUploaded(newVideo);
          setIsUploading(false);

          // Conditionally reset internal state
          if (resetOnSuccess) {
            setVideo(null);
            setLocalPreviewUrl(null);
            if (inputRef.current) {
              inputRef.current.value = "";
            }
          } else {
            setVideo(newVideo);
            // release the temporary preview if we now rely on the server displayUrl
            if (localPreviewUrl) {
              URL.revokeObjectURL(localPreviewUrl);
              setLocalPreviewUrl(null);
            }
          }
        },
        onError: (err: any) => {
          setError(`Upload failed: ${err?.message ?? String(err)}`);
          setIsUploading(false);
        },
      });
    } catch (err: any) {
      setError(err?.message ?? String(err));
      setIsUploading(false);
    }
  };

  const handleRemove = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setVideo(null);
    setLocalPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    onVideoRemoved();
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
    const previewUrl = video?.displayUrl ?? localPreviewUrl;
    if (previewUrl) {
      return (
        <div className="group relative size-full">
          <video
            src={previewUrl}
            width={320}
            height={180}
            className="size-full rounded-[20px] object-cover"
            autoPlay
            muted
            loop
            playsInline
            // autoplay muted loop could be used for tiny previews, but controls gives user better UX
          />
          <button
            onClick={handleRemove}
            className="absolute right-2 top-2 rounded-full bg-black bg-opacity-50 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
            aria-label="Remove video"
          >
            <XIcon size={16} />
          </button>
        </div>
      );
    }
    // Default state: The uploader button
    return (
      <div className="flex flex-col items-center justify-center gap-1 text-center font-semibold text-white">
        <VideoIcon size={20} />
        <p className="text-xs">{videoDescription}</p>
      </div>
    );
  };

  return (
    <div
      onClick={handleClick}
      className={`relative flex size-[100px] items-center justify-center rounded-3xl border border-white/30 bg-black p-1.5 text-white/60 transition-all duration-300 ${
        !video && !isUploading ? "cursor-pointer hover:text-white" : ""
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={handleFileChange}
      />
      {renderContent()}
    </div>
  );
};

export default memo(VideoUploadBox);
