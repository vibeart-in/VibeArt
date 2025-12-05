"use client";

import { IconUpload, IconX, IconEdit } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import React, { useEffect, useRef, useState } from "react";

import { uploadImage } from "@/src/utils/server/UploadImage";

export default function DragAndDropBox({
  onUploadSuccess,
}: {
  onUploadSuccess: (paths: { permanentPath: string; displayUrl: string }) => void;
}) {
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const dragCounter = useRef(0);

  const particles = useRef(
    Array.from({ length: 8 }).map(() => ({
      x: Math.random() * 400 - 200,
      y: Math.random() * 400 - 200,
      delay: Math.random() * 0.6,
    })),
  );

  // <<< START: NEW CODE >>>
  useEffect(() => {
    // This function will run only once when the component mounts,
    // because of the empty dependency array `[]`.
    const processUrl = async () => {
      try {
        // We use URLSearchParams to easily read the query parameters from the URL.
        const params = new URLSearchParams(window.location.search);
        const imageUrlFromQuery = params.get("image-url");

        if (imageUrlFromQuery) {
          // Set initial state to show the user we are processing the image.
          setUploading(true);
          setError(null);
          setProgress(5); // Show a little progress to indicate start

          // Fetch the image from the provided URL.
          // We use a proxy to avoid CORS issues if fetching from a different domain.
          // Note: You might need to set up a CORS proxy or ensure the source image server allows requests.
          // For simplicity here, we'll assume direct fetching works.
          const response = await fetch(imageUrlFromQuery);
          if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.statusText}`);
          }

          // Convert the response into a Blob, which is raw file data.
          const blob = await response.blob();

          // Try to get a filename from the URL, or default to a generic name.
          const filename = new URL(imageUrlFromQuery).pathname.split("/").pop() || "image.jpg";

          // Create a File object, which is what our uploader function expects.
          const file = new File([blob], filename, { type: blob.type });

          // Now, call the existing file upload handler with the new file.
          // This reuses all our existing logic for progress, success, and error handling.
          await handleFileUpload(file);
        }
      } catch (err: any) {
        console.error("Error processing image from URL:", err);
        setError("Could not load image from the provided URL.");
        setUploading(false);
      }
    };

    processUrl();
  }, []); // Empty dependency array ensures this runs only once on mount.
  // <<< END: NEW CODE >>>

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragCounter.current += 1;
    setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    try {
      e.dataTransfer.dropEffect = "copy";
    } catch {}
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragCounter.current -= 1;
    if (dragCounter.current <= 0) {
      dragCounter.current = 0;
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragCounter.current = 0;
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleClick = () => {
    if (!uploading && !uploadedImageUrl) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      await uploadImage({
        file,
        onProgress: (p: number) => {
          const pct = Math.max(0, Math.min(100, Math.round(p)));
          setProgress(pct);
          console.log("Progress:", pct + "%");
        },
        onError: (err: Error) => {
          setError(err.message);
        },
        onSuccess: (permanentPath: string, displayUrl: string) => {
          setUploadedImageUrl(displayUrl);
          setProgress(100);
          sessionStorage.setItem(
            "initialEditImage",
            JSON.stringify({
              permanentPath: permanentPath,
              displayUrl: displayUrl,
            }),
          );
          onUploadSuccess({ permanentPath, displayUrl });
        },
      });
    } catch (err: any) {
      setError(err.message || String(err));
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setUploadedImageUrl(null);
    setProgress(0);
    onUploadSuccess({ displayUrl: "", permanentPath: "" });
    sessionStorage.removeItem("initialEditImage");
  };

  return (
    <>
      {uploadedImageUrl ? (
        <div className="relative flex w-full max-w-[600px] justify-center">
          <img
            src={uploadedImageUrl}
            alt="Uploaded"
            className="h-auto max-h-[60vh] w-auto max-w-full rounded-3xl border-2 border-white/20"
          />
          <button onClick={handleRemoveImage} className="absolute -right-4 -top-4">
            <IconX size={32} className="custom-box hover:text-accent" />
          </button>
          
        </div>
      ) : (
        <motion.div
          className="relative aspect-[400/420] h-auto w-full max-w-[400px] cursor-pointer"
          onClick={handleClick}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          whileHover={{ scale: uploadedImageUrl ? 1 : 1.02 }}
          whileTap={{ scale: uploadedImageUrl ? 1 : 0.98 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="pointer-events-none absolute inset-0 z-20 flex size-full items-center justify-center">
            <svg viewBox="0 0 400 420" className="absolute inset-0 size-full" aria-hidden>
              <rect
                x="4"
                y="4"
                width="392"
                height="412"
                rx="62"
                fill="none"
                stroke="currentColor"
                strokeWidth={8}
                strokeDasharray="30 20"
                style={{
                  transition: "stroke-color 0.25s, opacity 0.25s",
                  opacity: isDragging || isHovered ? 1 : 0.6,
                }}
                className={
                  isDragging ? "text-accent" : isHovered ? "text-gray-100" : "text-gray-200"
                }
              />
            </svg>
          </div>

          <motion.div
            className="relative flex size-full flex-col items-center justify-center overflow-hidden rounded-[62px]"
            animate={{
              backgroundColor: isDragging
                ? "rgba(0, 0, 0, 0.4)"
                : isHovered
                  ? "rgba(0, 0, 0, 0.25)"
                  : "rgba(0, 0, 0, 0.2)",
            }}
            style={{ backdropFilter: "blur(2px)" }}
            transition={{ duration: 0.25 }}
          >
            <AnimatePresence>
              {(isDragging || isHovered) && !uploadedImageUrl && (
                <>
                  {particles.current.map((p, i) => (
                    <motion.div
                      key={i}
                      className="absolute size-2 rounded-full bg-white/30"
                      initial={{ opacity: 0, scale: 0, x: p.x, y: p.y }}
                      animate={{
                        opacity: [0, 1, 0],
                        scale: [0, 1, 0],
                        y: [0, -50, -100],
                      }}
                      exit={{ opacity: 0, scale: 0 }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: p.delay,
                        ease: "easeOut",
                      }}
                    />
                  ))}
                </>
              )}
            </AnimatePresence>

            {uploading ? (
              <div className="relative flex size-full items-center justify-center">
                <div className="absolute inset-6 overflow-hidden rounded-[52px] border border-white/10 bg-transparent">
                  <div className="relative size-full">
                    <motion.div
                      className="absolute -left-1/2 size-[700px] -translate-x-1/2 rounded-[40%] border border-accent/90 bg-accent/80"
                      initial={{ top: "100%", rotate: 0 }}
                      animate={{
                        top: `${100 - progress}%`,
                        rotate: 360,
                      }}
                      transition={{
                        duration: progress > 0 ? 1.5 : 0,
                        ease: "easeOut",
                        rotate: {
                          duration: 7,
                          ease: "linear",
                          repeat: Infinity,
                        },
                      }}
                    />
                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-white">
                      <div className="text-3xl font-semibold">{Math.round(progress)}%</div>
                      <div className="mt-1 text-base">Uploading</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : error ? (
              <div className="text-center text-red-500">{error}</div>
            ) : (
              <>
                <motion.div
                  className="pointer-events-none absolute mb-8"
                  animate={{
                    y: isDragging ? -20 : isHovered ? -10 : 0,
                    scale: isDragging ? 1.2 : isHovered ? 1.1 : 1,
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <IconUpload className="mb-4 size-12 text-white/70" />
                </motion.div>

                <motion.div
                  className="pointer-events-none mt-12 text-center"
                  animate={{ y: isDragging ? 20 : isHovered ? 10 : 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <motion.p
                    className="mb-2 text-lg font-medium text-white"
                    animate={{
                      color: isDragging ? "#ffffff" : isHovered ? "#f3f4f6" : "#e5e7eb",
                    }}
                  >
                    {isDragging ? "Drop files here" : "Click or drag & drop files here"}
                  </motion.p>

                  <motion.p
                    className="text-sm text-white/50"
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: isHovered ? 1 : 0,
                      y: isHovered ? 0 : 10,
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    Upload an image to get started
                  </motion.p>
                </motion.div>
              </>
            )}

            <AnimatePresence>
              {isDragging && (
                <motion.div
                  className="absolute inset-0 rounded-[62px]"
                  initial={{ scale: 0, opacity: 0.5 }}
                  animate={{ scale: 1, opacity: 0 }}
                  exit={{ scale: 1.2, opacity: 0 }}
                  transition={{ duration: 0.6 }}
                  style={{
                    background:
                      "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)",
                  }}
                />
              )}
            </AnimatePresence>
          </motion.div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            multiple={false}
            accept="image/*"
          />
        </motion.div>
      )}
    </>
  );
}
