"use client";

import { IconUpload, IconX } from "@tabler/icons-react";
import { motion, AnimatePresence } from "motion/react";
import React, { useRef, useState } from "react";

import { uploadImage } from "@/src/utils/server/UploadImage";

export default function DragAndDropBox({
  onUploadSuccess,
}: {
  onUploadSuccess: (paths: { permanentPath: string; displayUrl: string }) => void;
}) {
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
        <div className="relative h-[60vh] w-full">
          <img
            src={uploadedImageUrl}
            alt="Uploaded"
            className="size-full rounded-3xl border-2 border-white/20 object-cover"
          />
          <button onClick={handleRemoveImage} className="absolute -right-8 -top-6">
            <IconX size={32} className="custom-box hover:text-accent" />
          </button>
        </div>
      ) : (
        <motion.div
          className="relative h-[420px] w-[400px] cursor-pointer"
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
