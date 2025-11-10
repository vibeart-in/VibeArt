// src/components/ui/ImageUploadBox.tsx
"use client";
import { ImagesIcon, XIcon } from "lucide-react";
import React, { useRef, useState, useEffect, memo, useCallback } from "react";

import { uploadImage } from "@/src/utils/server/UploadImage";

interface ImageObject {
  permanentPath: string;
  displayUrl: string;
}

interface ImageUploadBoxProps {
  onImageUploaded: (paths: ImageObject) => void;
  onImageRemoved: () => void;
  initialImage?: ImageObject | null;
  imageDescription?: string;
  resetOnSuccess?: boolean;
  uploaderId?: number;
}

const ImageUploadBox = ({
  onImageUploaded,
  onImageRemoved,
  initialImage = null,
  imageDescription = "Add Image",
  resetOnSuccess = false,
  uploaderId,
}: ImageUploadBoxProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [image, setImage] = useState<ImageObject | null>(initialImage);

  useEffect(() => {
    setImage(initialImage);
  }, [initialImage]);

  // Wrap the callback-style uploadImage so we can re-use it for url->file uploads
  const uploadImagePromise = useCallback((file: File) => {
    return new Promise<ImageObject>((resolve, reject) => {
      uploadImage({
        file,
        onProgress: (p) => setUploadProgress(Number(p.toFixed(0))),
        onSuccess: (permanentPath: string, displayUrl: string) => {
          resolve({ permanentPath, displayUrl });
        },
        onError: (err: any) => reject(err),
      });
    });
  }, []);

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

          if (resetOnSuccess) {
            setImage(null);
            if (inputRef.current) inputRef.current.value = "";
          } else {
            setImage(newImage);
          }
        },
        onError: (err) => {
          setError(`Upload failed: ${err?.message ?? err}`);
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
    setImage(null);
    onImageRemoved();
    if (inputRef.current) inputRef.current.value = "";
    try {
      sessionStorage.removeItem("initialEditImage");
    } catch {
      /* ignore */
    }
  };

  // Attempt to fetch imageUrl, convert to File and upload via uploadImage
  const processImageUrl = useCallback(
    async (imageUrl: string) => {
      if (!imageUrl) return;
      setError(null);
      setIsUploading(true);
      setUploadProgress(0);

      try {
        // Try to fetch (may fail due to CORS)
        const resp = await fetch(imageUrl, { mode: "cors" });
        if (!resp.ok) throw new Error("Failed to fetch image");
        const blob = await resp.blob();
        const ext = (blob.type?.split("/")?.[1] ?? "jpg").split(";")[0];
        const file = new File([blob], `edit-image.${ext}`, { type: blob.type || "image/jpeg" });

        const uploaded = await uploadImagePromise(file);

        // Use the same onImageUploaded + internal state flow as file uploads
        onImageUploaded(uploaded);
        setIsUploading(false);

        if (resetOnSuccess) {
          setImage(null);
        } else {
          setImage(uploaded);
        }
        try {
          sessionStorage.setItem("initialEditImage", JSON.stringify(uploaded));
        } catch {
          setIsUploading(false);
        }
      } catch (_err) {
        // fallback: can't fetch/upload -> use remote url as display url/permanentPath
        const fallback = { permanentPath: imageUrl, displayUrl: imageUrl };
        onImageUploaded(fallback);
        if (resetOnSuccess) {
          setImage(null);
        } else {
          setImage(fallback);
        }
        try {
          sessionStorage.setItem("initialEditImage", JSON.stringify(fallback));
        } catch {
          /* ignore */
        }
      } finally {
        setIsUploading(false);
        // remove query param so page reload won't re-trigger
        try {
          const url = new URL(window.location.href);
          url.searchParams.delete("image-url");
          url.searchParams.delete("imageUrl");
          window.history.replaceState({}, "", url.toString());
        } catch {
          /* ignore */
        }
      }
    },
    [onImageUploaded, resetOnSuccess, uploadImagePromise],
  );

  // Event listener and query param/session handling move here
  useEffect(() => {
    const onAppImageEdit = (e: Event) => {
      const detail = (e as CustomEvent).detail as
        | { displayUrl?: string; permanentPath?: string; uploaderId?: number }
        | undefined;
      if (!detail) return;
      console.log("ImageUploadBox received app:image-edit event:", detail.uploaderId, uploaderId);
      // If multiple uploaders exist, optionally filter by uploaderId
      if (
        typeof detail.uploaderId === "number" &&
        typeof uploaderId === "number" &&
        detail.uploaderId !== uploaderId
      ) {
        return null;
      }

      const url = detail.displayUrl ?? detail.permanentPath;
      if (!url) return;
      processImageUrl(url);
    };

    window.addEventListener("app:image-edit", onAppImageEdit as EventListener);
    return () => window.removeEventListener("app:image-edit", onAppImageEdit as EventListener);
  }, [processImageUrl, uploaderId]);

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
          <img
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
      onClick={() => {
        if (!isUploading && !image) inputRef.current?.click();
      }}
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
