"use client";

import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { IconUpload, IconX } from "@tabler/icons-react";
import { supabase } from "@/src/lib/supabase/client";

export default function DragAndDropBox({
  onUploadSuccess,
}: {
  onUploadSuccess: (url: string) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const dragCounter = useRef(0);

  const particles = useRef(
    Array.from({ length: 8 }).map(() => ({
      x: Math.random() * 400 - 200,
      y: Math.random() * 400 - 200,
      delay: Math.random() * 0.6,
    }))
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

    try {
      // 1. Get the current authenticated user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // 2. Ensure the user is logged in before uploading
      if (!user) {
        throw new Error("You must be logged in to upload an image.");
      }

      // 3. Construct the file path using the user's ID as a folder
      // This matches your RLS policy: (storage.foldername(name))[1]
      const filePath = `${user.id}/${file.name}`;

      // 4. Upload the file to the 'uploaded-images' bucket with the new path
      const { error: uploadError } = await supabase.storage
        .from("uploaded-images") // Use your bucket_id from the policy
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // 5. Get the public URL for the file from the correct path
      const { data, error: signedUrlError } = await supabase.storage
        .from("uploaded-images")
        .createSignedUrl(filePath, 3600); // The URL will be valid for 3600 seconds (1 hour)

      if (signedUrlError) {
        throw signedUrlError;
      }

      console.log(data.signedUrl);

      setUploadedImageUrl(data.signedUrl);
      onUploadSuccess(data.signedUrl);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setUploadedImageUrl(null);
    onUploadSuccess("");
  };

  return (
    <>
      {uploadedImageUrl ? (
        <div className="relative w-full h-[65vh]">
          <img
            src={uploadedImageUrl}
            alt="Uploaded"
            className=" object-cover w-full h-full rounded-3xl border-2 border-white/20"
          />
          <button
            onClick={handleRemoveImage}
            className="absolute -top-6 -right-8"
          >
            <IconX size={32} className="custom-box hover:text-accent"/>
          </button>
        </div>
      ) : (
        <motion.div
          className="relative w-[400px] h-[420px] cursor-pointer"
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
          <div
            className="absolute inset-0 z-10 overflow-hidden pointer-events-none opacity-60"
            style={{
              backgroundImage: "url(/images/landing/grain.png)",
              backgroundSize: "200px 200px",
              backgroundRepeat: "repeat",
              backgroundPosition: "left top",
            }}
          />

          <div className="absolute w-full h-full z-20 inset-0 flex items-center justify-center pointer-events-none">
            <svg
              viewBox="0 0 400 420"
              className="absolute inset-0 w-full h-full"
              aria-hidden
            >
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
                  isDragging
                    ? "text-accent"
                    : isHovered
                    ? "text-gray-100"
                    : "text-gray-200"
                }
              />
            </svg>
          </div>

          <motion.div
            className="w-full h-full rounded-[62px] flex flex-col items-center justify-center overflow-hidden relative"
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
                      className="absolute w-2 h-2 bg-white/30 rounded-full"
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
              <div className="text-white text-lg text-center flex flex-col gap-4">
                <div className="upload-loader"></div>
                <p>Uploading...</p>
              </div>
            ) : error ? (
              <div className="text-red-500 text-center">{error}</div>
            ) : (
              <>
                <motion.div
                  className="absolute mb-8 pointer-events-none"
                  animate={{
                    y: isDragging ? -20 : isHovered ? -10 : 0,
                    scale: isDragging ? 1.2 : isHovered ? 1.1 : 1,
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <IconUpload className="w-12 h-12 text-white/70 mb-4" />
                </motion.div>

                <motion.div
                  className="text-center pointer-events-none mt-12"
                  animate={{ y: isDragging ? 20 : isHovered ? 10 : 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <motion.p
                    className="text-white text-lg font-medium mb-2"
                    animate={{
                      color: isDragging
                        ? "#ffffff"
                        : isHovered
                        ? "#f3f4f6"
                        : "#e5e7eb",
                    }}
                  >
                    {isDragging
                      ? "Drop files here"
                      : "Click or drag & drop files here"}
                  </motion.p>

                  <motion.p
                    className="text-white/50 text-sm"
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
