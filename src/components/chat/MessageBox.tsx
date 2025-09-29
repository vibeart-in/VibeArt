"use client";
import ImageCard from "@/src/components/ui/ImageCard";
import { IconCopy, IconDiamondFilled } from "@tabler/icons-react";
import { MessageType } from "@/src/types/BaseType";
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
  message: MessageType;
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
  } = message;

  console.log(message);
  const numOfOutputs = parameters?.num_of_output || 1;
  const ratio = parameters?.aspect_ratio;

  return (
    <div className="w-full flex max-w-screen justify-center">
      {input_images && input_images.length > 0 && (
        <div className="flex justify-center gap-8 items-center mr-8">
          <div className="max-w-[350px]">
            <Image
              className="rounded-3xl border-2 border-white/20 w-full"
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
          <motion.div className="h-fit overflow-x-auto hide-scrollbar max-h-[200px] w-[300px] bg-[#161618] p-4 rounded-3xl">
            <p className="text-base leading-relaxed cursor-pointer">{userPrompt}</p>
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
          <div className="flex gap-4">
            {job_status === "succeeded" && output_images.length > 0 ? (
              output_images.map((image, index) => (
                <div key={image.imageUrl || index} className="max-w-[350px]">
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
                `` ❌ Generation failed: {error_message || "Unknown error."}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
