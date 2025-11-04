// src/components/ai-apps/AppGenerationCard.tsx (Corrected and Redesigned)

import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import { motion, Variants } from "framer-motion";

import { conversationImageObject, NodeParam } from "@/src/types/BaseType";
import GroupImageLayout from "./GroupImagelayout";

// Animation variants for the parameters section
const paramsContainerVariants: Variants = {
  rest: { opacity: 0, height: 0, marginTop: 0, transition: { duration: 0.3 } },
  hover: { opacity: 1, height: "auto", marginTop: "1rem", transition: { duration: 0.4 } },
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
      <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <GroupImageLayout images={inputImages} title="Input" autoRatio={true} />
        </div>

        {/* Arrow — hidden on very small screens for space */}
        <div className="hidden px-2 sm:flex sm:flex-col sm:items-center sm:justify-center">
          <ArrowRightIcon size={36} className="text-neutral-500" />
        </div>

        <div className="min-w-0 flex-1">
          <GroupImageLayout images={outputImages} title="Output" status={status} />
        </div>
      </div>

      {/* Hidden Parameters Section - Expands on hover */}
      {/* {visibleParameters.length > 0 && (
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
      )} */}
    </motion.div>
  );
};

export default AppGenerationCard;
