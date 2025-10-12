import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import { motion, Variants } from "motion/react";

import { NodeParam } from "@/src/types/BaseType";

import ImageCard from "../ui/imageCard/ImageCard";
import { ImageCardLoading } from "../ui/ImageCardLoading";

// Animation variants for the parameters section that appears at the bottom
const paramsContainerVariants: Variants = {
  // State when not hovered (collapsed)
  rest: {
    opacity: 0,
    height: 0,
    marginTop: 0,
    transition: {
      duration: 0.3,
      ease: "easeInOut",
    },
  },
  // State when hovered (expanded)
  hover: {
    opacity: 1,
    height: "auto", // Automatically adjust height to content
    marginTop: "1rem", // Adds some space between images and params
    transition: {
      duration: 0.4,
      ease: "easeInOut",
    },
  },
};

interface AppGenerationCardProps {
  status?: "pending" | "succeeded"; // <-- Add status prop
  parameters: NodeParam[];
  inputImageUrl: string | null; // Prop can be null
  outputImageUrl: string | null; // Prop can be null
}

const AppGenerationCard = ({
  status = "succeeded",
  parameters,
  inputImageUrl,
  outputImageUrl,
}: AppGenerationCardProps) => {
  // Filter out parameters where the fieldName is 'image'
  const visibleParameters = parameters.filter((param) => param.fieldName.toLowerCase() !== "image");

  return (
    <motion.div
      initial="rest"
      whileHover="hover"
      animate="rest"
      className="flex h-fit w-full flex-col gap-0 overflow-hidden rounded-[40px] bg-[#111111] p-6"
    >
      {/* Top section with Images */}
      <div className="flex w-full items-center justify-between gap-2">
        {/* Input Section */}
        <div className="flex size-full flex-col gap-2">
          <p className="text-center text-neutral-400">Input</p>
          {inputImageUrl ? ( // Check if the URL exists
            <ImageCard
              mediaUrl={inputImageUrl}
              width={500}
              height={500}
              prompt="Input Image" // A more descriptive prompt
            />
          ) : (
            <div className="flex aspect-square w-full items-center justify-center rounded-2xl border-2 border-dashed border-neutral-700 bg-neutral-900/50">
              <p className="text-neutral-500">No Image Input</p>
            </div>
          )}
        </div>

        <ArrowRightIcon size={40} className="flex-shrink-0 text-neutral-500" />

        {/* Output Section */}
        <div className="flex size-full flex-col gap-2">
          <p className="text-center text-neutral-400">Output</p>
          {status === "pending" ? (
            // If the status is pending, show the loading skeleton
            <ImageCardLoading width={200} />
          ) : outputImageUrl ? (
            // Otherwise, if it succeeded, show the image
            <ImageCard
              mediaUrl={outputImageUrl}
              width={500}
              height={500}
              prompt="Generated Output" // A more descriptive prompt
            />
          ) : (
            // Fallback for succeeded but missing image (error case)
            <div className="... flex aspect-square w-full items-center justify-center">
              <p className="text-neutral-500">Image Failed</p>
            </div>
          )}
        </div>
      </div>

      {/* Hidden Parameters Section - Expands on hover */}
      {visibleParameters.length > 0 && (
        <motion.div variants={paramsContainerVariants}>
          <div className="flex h-full flex-col justify-center gap-2 rounded-2xl bg-neutral-900/50 p-4">
            <h3 className="mb-2 text-center font-semibold text-neutral-300">Parameters</h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              {visibleParameters.map((param) => (
                <div
                  key={param.nodeId + param.fieldName}
                  className="flex justify-between gap-2 border-b border-neutral-800 py-1"
                >
                  <span className="capitalize text-neutral-400">
                    {param.description?.replace(/_/g, " ")}:
                  </span>
                  <span className="truncate font-medium text-neutral-200">{param.fieldValue}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default AppGenerationCard;
