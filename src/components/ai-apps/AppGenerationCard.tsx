// src/components/ai-apps/AppGenerationCard.tsx (Corrected and Redesigned)

import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import { motion, Variants } from "framer-motion";

import { conversationImageObject, NodeParam } from "@/src/types/BaseType";

import ImageCard from "../ui/imageCard/ImageCard";
import { ImageCardLoading } from "../ui/ImageCardLoading";

// Animation variants for the parameters section
const paramsContainerVariants: Variants = {
  rest: { opacity: 0, height: 0, marginTop: 0, transition: { duration: 0.3 } },
  hover: { opacity: 1, height: "auto", marginTop: "1rem", transition: { duration: 0.4 } },
};

// Component to render the image layout (primary + thumbnails)
const ImageLayout = ({
  images,
  title,
  status,
}: {
  images: conversationImageObject[];
  title: string;
  status?: string;
}) => {
  const primaryImage = images[0];
  const secondaryImages = images.slice(1);

  // Loading state for the Output column
  if (status === "pending" || status === "running") {
    return (
      <div className="flex size-full flex-col gap-2">
        <p className="text-center text-neutral-400">{title}</p>
        <ImageCardLoading width={200} />
      </div>
    );
  }

  // No images available
  if (!primaryImage) {
    const message = title === "Input" ? "No Image Input" : "Image Failed";
    return (
      <div className="flex size-full flex-col gap-2">
        <p className="text-center text-neutral-400">{title}</p>
        <div className="flex aspect-square w-full items-center justify-center rounded-2xl border-2 border-dashed border-neutral-700 bg-neutral-900/50">
          <p className="text-neutral-500">{message}</p>
        </div>
      </div>
    );
  }

  // Render the primary image and thumbnails
  return (
    <div className="flex size-full flex-col gap-2">
      <p className="text-center text-neutral-400">{title}</p>
      <ImageCard mediaUrl={primaryImage.imageUrl} width={500} height={500} prompt={title} />
      {secondaryImages.length > 0 && (
        <div className="mt-1 grid grid-cols-3 gap-2">
          {secondaryImages.map((img) => (
            <img
              key={img.id}
              src={img.thumbnailUrl || img.imageUrl}
              alt="Secondary thumbnail"
              className="aspect-square w-full rounded-lg object-cover"
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface AppGenerationCardProps {
  status: string;
  parameters: NodeParam[];
  inputImages: conversationImageObject[];
  outputImages: conversationImageObject[];
}

const AppGenerationCard = ({
  status,
  parameters,
  inputImages,
  outputImages,
}: AppGenerationCardProps) => {
  // Filter out parameters with fieldName 'image' to avoid redundancy
  const visibleParameters = parameters.filter((param) => param.fieldName.toLowerCase() !== "image");

  return (
    <motion.div
      initial="rest"
      whileHover="hover"
      animate="rest"
      className="flex h-fit w-full flex-col gap-0 overflow-hidden rounded-[40px] bg-[#111111] p-6"
    >
      {/* Top section with Images */}
      <div className="flex w-full items-start justify-between gap-2">
        <ImageLayout images={inputImages} title="Input" />
        <ArrowRightIcon size={40} className="mt-12 flex-shrink-0 text-neutral-500" />
        <ImageLayout images={outputImages} title="Output" status={status} />
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
