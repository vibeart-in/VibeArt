"use client";
import { useState } from "react";
import ImageCard from "@/src/components/ui/imageCard/ImageCard";
import { IconCopy, IconDiamondFilled, IconCheck } from "@tabler/icons-react";
import { MessageType } from "@/src/types/BaseType";
import { ImageCardLoading } from "../ui/ImageCardLoading";
import { motion, AnimatePresence } from "motion/react";

// Helper function remains the same
const getLoadingMessage = (status: string) => {
  switch (status) {
    case "pending":
      return "Queued...";
    case "starting":
      return "Starting...";
    case "processing":
      return "Generating...";
    default:
      return "Loading...";
  }
};

interface MessageTurnProps {
  message: MessageType;
}

// Renamed from MessageBox to MessageTurn
export default function MessageTurn({ message }: MessageTurnProps) {
  const { job_status, output_images, parameters, error_message, userPrompt, credit_cost } = message;

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

  return (
    <div className="flex">
      <div>
        <motion.div className="hide-scrollbar h-fit max-h-[200px] w-[300px] overflow-x-auto rounded-3xl bg-[#161618] p-4">
          <p className="cursor-pointer text-base leading-relaxed">{userPrompt}</p>
        </motion.div>

        <div className="mt-2 flex w-full items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div
              onClick={handleCopy}
              className="custom-box relative flex cursor-pointer items-center justify-center"
            >
              <AnimatePresence mode="wait" initial={false}>
                {copied ? (
                  <motion.div
                    key="check"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <IconCheck className="h-4 w-4 text-green-400" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="copy"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <IconCopy className="h-4 w-4 text-white/80" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <p className="custom-box flex items-center gap-2 text-xs font-semibold text-white/80">
              <IconDiamondFilled className="h-4 w-4" />
              {credit_cost}
            </p>
          </div>

          <p className="text-sm tracking-wide text-white/80">
            <span className="font-medium">Model:</span> Image 2.1
          </p>
        </div>
      </div>

      <div className="pl-4">
        <div className="flex flex-wrap gap-4">
          {job_status === "succeeded" && output_images.length > 0 ? (
            output_images.map((image) => (
              <div key={image.id} className="max-w-[350px]">
                <ImageCard mediaUrl={image.imageUrl} width={800} height={800} prompt={userPrompt} />
              </div>
            ))
          ) : job_status === "pending" ||
            job_status === "processing" ||
            job_status === "starting" ? (
            [...Array(numOfOutputs)].map((_, index) => (
              <ImageCardLoading
                key={index}
                ratio={ratio}
                width={360}
                loadingText={getLoadingMessage(job_status)}
                variant="cool"
              />
            ))
          ) : job_status === "failed" ? (
            <p className="max-w-[350px] font-semibold text-red-500">
              ❌ Generation failed: {error_message || "Unknown error."}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
