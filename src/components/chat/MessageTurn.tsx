"use client";
import { IconCopy, IconDiamondFilled, IconCheck } from "@tabler/icons-react";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";

import ImageCard from "@/src/components/ui/imageCard/ImageCard";
import { conversationData } from "@/src/types/BaseType";
import { extractParams } from "@/src/utils/client/utils";

import ForceFetchButton from "./ForceFetch";
import ErrorBox from "./MessageError";
import { ImageCardLoading } from "../ui/ImageCardLoading";

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
  isEdit?: boolean;
}

// Renamed from MessageBox to MessageTurn
export default function MessageTurn({ message, isEdit }: MessageTurnProps) {
  const {
    job_status,
    output_images,
    parameters,
    error_message,
    userPrompt,
    credit_cost,
    model_name,
    prediction_id,
    jobId,
    input_images,
  } = message;

  const { aspectRatio, batch } = extractParams(parameters, model_name);

  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(userPrompt || "");
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  return (
    <div className="flex w-full flex-col xl:flex-row">
      {/* Prompt Box */}
      <div>
        <div className="h-fit w-full flex-shrink-0 overflow-hidden rounded-3xl bg-[#111111] lg:w-[320px]">
          <div className="hide-scrollbar max-h-[200px] w-full overflow-y-auto p-4">
            <p className="text-base font-light leading-relaxed text-white/95">{userPrompt}</p>
          </div>

          {/* Footer */}
          <div className="relative flex items-center justify-between bg-black/20 p-3 px-4">
            <div className="absolute left-0 top-0 h-[1px] w-full bg-gradient-to-r from-transparent via-accent/50 to-transparent" />

            {/* Left: Copy + Credits */}
            <div className="flex items-center gap-4">
              <div
                onClick={handleCopy}
                title="Copy prompt"
                className="flex size-8 cursor-pointer items-center justify-center rounded-full transition-colors duration-200 hover:bg-accent/20"
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
                      <IconCheck className="size-4 text-green-400" />{" "}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="copy"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <IconCopy className="size-4 text-white/70 transition-colors hover:text-accent" />{" "}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <p className="flex select-none items-center gap-1.5 text-xs font-medium text-white/70">
                <IconDiamondFilled className="size-4 text-accent/80" />
                {credit_cost}
              </p>
            </div>

            {/* Right: Model Name */}
            <p className="text-sm tracking-wide text-white/70">
              <span className="font-semibold">{model_name}</span>
            </p>
          </div>
        </div>
        {jobId &&
          prediction_id &&
          job_status !== "succeeded" &&
          Array.isArray(parameters) &&
          typeof parameters[0]?.nodeId === "string" && (
            <ForceFetchButton jobId={jobId} taskId={prediction_id} />
          )}

        {!isEdit && input_images && input_images.length > 0 && (
          <div className="mt-4 flex w-full flex-wrap gap-4">
            {input_images.map((image) => (
              <div key={image.id} className="w-[150px]">
                <img
                  className="w-full rounded-xl border-2 border-white/20"
                  src={image.imageUrl}
                  width={300}
                  height={300}
                  alt="INPUT IMAGE"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Images Section */}
      <div className="mt-6 w-full lg:mt-0 lg:pl-6">
        <div className="md:mt-5">
          {/* <div className="flex flex-wrap gap-4"> */}
          {job_status === "succeeded" && output_images.length > 0 ? (
            output_images.map((image) => (
              <div key={image.id} className="max-w-[350px]">
                <ImageCard
                  thumbnailUrl={image.thumbnailUrl}
                  mediaUrl={image.imageUrl}
                  width={image.width || 800}
                  height={image.height || 800}
                  prompt={userPrompt}
                />
              </div>
            ))
          ) : job_status === "pending" ||
            job_status === "processing" ||
            job_status === "QUEUED" ||
            job_status === "RUNNING" ||
            job_status === "starting" ? (
            [...Array(batch)].map((_, index) => (
              <ImageCardLoading
                key={index}
                ratio={aspectRatio}
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
