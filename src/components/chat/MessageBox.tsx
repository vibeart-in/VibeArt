"use client";
import ImageCard from "@/src/components/ui/imageCard/ImageCard";
import { IconCopy, IconDiamondFilled } from "@tabler/icons-react";
import { conversationData } from "@/src/types/BaseType";
import { ImageCardLoading } from "../ui/ImageCardLoading";
import { motion } from "motion/react";
import Image from "next/image";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";

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

interface MessageBoxProps {
  message: conversationData;
}

export default function MessageBox({ message }: MessageBoxProps) {
  const {
    job_status,
    output_images,
    parameters,
    error_message,
    userPrompt,
    credit_cost,
    input_images,
    model_name,
  } = message;

  console.log(message);
  const numOfOutputs = parameters?.num_of_output || 1;
  const ratio = parameters?.aspect_ratio;

  return (
    <div className="max-w-screen flex w-full justify-center">
      {input_images && input_images.length > 0 && (
        <div className="mr-8 flex items-center justify-center gap-8">
          <div className="max-w-[350px]">
            <Image
              className="w-full rounded-3xl border-2 border-white/20"
              src={input_images[0].imageUrl}
              width={300}
              height={300}
              alt="INPUT IMAGE"
            />
          </div>
          <ArrowRightIcon size={40} />
        </div>
      )}
      <div className="flex">
        <div>
          <motion.div className="hide-scrollbar h-fit max-h-[200px] w-[300px] overflow-x-auto rounded-3xl bg-[#161618] p-4">
            <p className="cursor-pointer text-base leading-relaxed">{userPrompt}</p>
          </motion.div>
          <div className="mt-2 flex w-full items-center justify-between gap-3">
            <div className="flex gap-2">
              <IconCopy size={25} className="custom-box" />
              <p className="custom-box flex items-center gap-2 text-xs font-semibold text-white/80">
                <IconDiamondFilled className="h-5 w-5" />
                {credit_cost}
              </p>
            </div>
            <p className="text-sm tracking-wide text-white/80">
              <span className="font-medium">Model:</span>
              {model_name}
            </p>
          </div>
        </div>

        <div className="pl-4">
          <div className="flex gap-4">
            {job_status === "succeeded" && output_images.length > 0 ? (
              output_images.map((image, index) => (
                <div key={image.imageUrl || index} className="max-w-[350px]">
                  <ImageCard
                    mediaUrl={image.imageUrl}
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
              <p className="font-semibold text-red-500">
                `` ❌ Generation failed: {error_message || "Unknown error."}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
