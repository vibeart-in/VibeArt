"use client";
import { useState } from "react";
import ImageCard from "@/src/components/ui/imageCard/ImageCard";
import { IconCopy, IconDiamondFilled, IconCheck } from "@tabler/icons-react";
import { conversationData } from "@/src/types/BaseType";
import { ImageCardLoading } from "../ui/ImageCardLoading";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import ErrorBox from "./MessageError";

// Helper function remains the same
const getLoadingMessage = (status: string) => {
  switch (status) {
    case "pending":
      return "Queued...";
    case "QUEUED":
      return "Higres-Generation...";
    case "starting":
      return "Starting...";
    case "processing":
      return "Generating...";
    case "RUNNING":
      return "Generating...";
    default:
      return "Loading...";
  }
};

interface MessageTurnProps {
  message: conversationData;
}

// Renamed from MessageBox to MessageTurn
export default function MessageTurn({ message }: MessageTurnProps) {
  const {
    job_status,
    output_images,
    parameters,
    error_message,
    userPrompt,
    credit_cost,
    model_name,
  } = message;

  const numOfOutputs = parameters?.num_of_output || 1;
  const ratio = parameters?.aspect_ratio;

  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(userPrompt || "");
      setCopied(true);
      setTimeout(() => setCopied(false), 1500); // reset after 1.5s
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  console.log("OUT", output_images);

  return (
    <div className="flex">
      <div className="h-fit w-[320px] overflow-hidden rounded-3xl bg-[#111111]">
        <div className="p-4">
          <div className="hide-scrollbar max-h-[200px] w-full overflow-y-auto">
            <p className="text-base font-light leading-relaxed text-white/95">{userPrompt}</p>
          </div>
        </div>

        {/* Footer with a divider and inner glow */}
        <div className="relative flex items-center justify-between bg-black/20 p-3 px-4">
          <div className="absolute left-0 top-0 h-[1px] w-full bg-gradient-to-r from-transparent via-accent/50 to-transparent" />

          {/* Left side: Copy & Credits */}
          <div className="flex items-center gap-4">
            <div
              onClick={handleCopy}
              title="Copy prompt"
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-colors duration-200 hover:bg-accent/20"
            >
              <AnimatePresence mode="wait" initial={false}>
                {copied ? (
                  <motion.div
                    key="check"
                    initial={{ scale: 0.5, opacity: 0, rotate: -90 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    exit={{ scale: 0.5, opacity: 0, rotate: 90 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  >
                    <IconCheck className="h-4 w-4 text-green-400" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="copy"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <IconCopy className="h-4 w-4 text-white/70 transition-colors hover:text-accent" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <p className="flex select-none items-center gap-1.5 text-xs font-medium text-white/70">
              <IconDiamondFilled className="h-4 w-4 text-accent/80" />
              {credit_cost}
            </p>
          </div>

          {/* Right side: Model Name */}
          <p className="text-sm tracking-wide text-white/70">
            <span className="font-semibold">{model_name}</span>
          </p>
        </div>
      </div>

      <div className="pl-4">
        <div className="flex flex-wrap gap-4">
          {job_status === "succeeded" && output_images.length > 0 ? (
            output_images.map((image) => (
              <div key={image.id} className="max-w-[500px]">
                <ImageCard
                  thumbnailUrl={image.thumbnailUrl}
                  mediaUrl={image.imageUrl}
                  width={800}
                  height={800}
                  prompt={userPrompt}
                />
              </div>
            ))
          ) : job_status === "pending" ||
            job_status === "processing" ||
            job_status === "QUEUED" ||
            job_status === "RUNNING" ||
            job_status === "starting" ? (
            [...Array(numOfOutputs)].map((_, index) => (
              <ImageCardLoading
                key={index}
                ratio={ratio}
                width={500}
                loadingText={getLoadingMessage(job_status)}
                variant="warm"
              />
            ))
          ) : job_status === "failed" ? (
            <ErrorBox
              src="https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/chibi_anime_girl_bowing_polite.webp"
              error={error_message || "Unknown error."}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
