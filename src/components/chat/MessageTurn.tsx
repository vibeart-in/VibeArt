"use client";
import ImageCard from "@/src/components/ui/ImageCard";
import { IconCopy, IconDiamondFilled } from "@tabler/icons-react";
import { MessageType } from "@/src/types/BaseType";
import { ImageCardLoading } from "../ui/ImageCardLoading";
import { motion } from "motion/react";

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
  const {
    job_status,
    output_images,
    parameters,
    error_message,
    userPrompt,
    credit_cost,
  } = message;

  const numOfOutputs = parameters?.num_of_output || 1;
  const ratio = parameters?.aspect_ratio;

  return (
    // The outer div from the original MessageBox is no longer needed
    <div className="flex">
      <div>
        <motion.div className="h-fit overflow-x-auto hide-scrollbar max-h-[200px] w-[300px] bg-[#161618] p-4 rounded-3xl">
          <p className="text-base leading-relaxed cursor-pointer">
            {userPrompt}
          </p>
        </motion.div>
        <div className="flex gap-3 mt-2 items-center w-full justify-between">
          <div className="flex gap-2">
            <IconCopy size={25} className="custom-box" />
            <p className="flex custom-box items-center gap-2 text-xs font-semibold text-white/80">
              <IconDiamondFilled className="w-5 h-5" />
              {credit_cost}
            </p>
          </div>
          <p className="text-sm tracking-wide text-white/80">
            <span className="font-medium">Model:</span> Image 2.1
          </p>
        </div>
      </div>

      <div className="pl-4">
        <div className="flex gap-4 flex-wrap">
          {job_status === "succeeded" && output_images.length > 0 ? (
            output_images.map((image) => (
              <div key={image.id} className="max-w-[350px]">
                <ImageCard
                  imageUrl={image.imageUrl}
                  width={800}
                  height={800}
                  prompt={userPrompt}
                />
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
            <p className="text-red-500 font-semibold">
              ❌ Generation failed: {error_message || "Unknown error."}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
