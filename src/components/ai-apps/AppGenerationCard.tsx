import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import { motion, Variants } from "framer-motion";
import { useState } from "react";

import { conversationImageObject, NodeParam } from "@/src/types/BaseType";

import GroupImageLayout from "./GroupImagelayout";

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
  const [expandedSection, setExpandedSection] = useState<"input" | "output" | null>(null);
  const [inputSelectedIndex, setInputSelectedIndex] = useState<number>(0);
  const [outputSelectedIndex, setOutputSelectedIndex] = useState<number>(0);

  const visibleParameters = parameters.filter((param) => param.fieldName.toLowerCase() !== "image");

  // Helper function to get thumbnails for a section
  const getThumbnails = (
    images: conversationImageObject[],
    selectedIndex: number,
    hidePrimary = true,
  ) => {
    return images
      .map((img, idx) => ({ img, idx }))
      .filter(({ idx }) => !(hidePrimary && idx === selectedIndex));
  };

  const inputThumbnails = getThumbnails(inputImages, inputSelectedIndex);
  const outputThumbnails = getThumbnails(outputImages, outputSelectedIndex);

  const handleThumbClick = (section: "input" | "output", idx: number) => {
    if (section === "input") {
      setInputSelectedIndex(idx);
    } else {
      setOutputSelectedIndex(idx);
    }
    // setExpandedSection(null); // Removed to prevent UI shift
  };

  const handleExpandToggle = (section: "input" | "output") => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const renderExpandedGrid = (section: "input" | "output") => {
    const thumbnails = section === "input" ? inputThumbnails : outputThumbnails;
    const selectedIndex = section === "input" ? inputSelectedIndex : outputSelectedIndex;
    const title = section === "input" ? "Input" : "Output";

    if (expandedSection !== section || thumbnails.length === 0) return null;

    return (
      <div className="w-full max-w-[520px]">
        <div className="mb-3 mt-4 flex items-center justify-between px-1">
          <div className="text-xs text-neutral-400">
            Showing all {thumbnails.length} {title.toLowerCase()} image
            {thumbnails.length > 1 ? "s" : ""}
          </div>
          <button
            type="button"
            onClick={() => setExpandedSection(null)}
            className="rounded px-2 py-1 text-xs text-neutral-300 underline hover:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-neutral-900"
          >
            Close
          </button>
        </div>

        <div className="xs:grid-cols-2 grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3">
          {thumbnails.map(({ img, idx }) => (
            <button
              key={img.id ?? `${idx}-exp`}
              type="button"
              onClick={() => handleThumbClick(section, idx)}
              className={`relative aspect-square w-full overflow-hidden rounded-xl border-2 transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-neutral-900 ${
                idx === selectedIndex
                  ? "scale-105 border-indigo-500 shadow-lg ring-2 ring-indigo-500 ring-offset-1 ring-offset-neutral-900"
                  : "border-neutral-700 hover:border-neutral-500"
              } `}
              aria-label={`Select ${title.toLowerCase()} image ${idx + 1}`}
              aria-current={idx === selectedIndex ? "true" : "false"}
            >
              <img
                src={img.thumbnailUrl || img.imageUrl}
                alt={`${title} thumbnail ${idx + 1}`}
                className="size-full object-cover"
                draggable={false}
                loading="lazy"
              />
              <div className="absolute right-1 top-1 min-w-[20px] rounded-md bg-black/70 px-1.5 py-0.5 text-center text-xs font-medium text-neutral-200 backdrop-blur-sm">
                {idx + 1}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  const [showInputMobile, setShowInputMobile] = useState(false);

  return (
    <motion.div
      initial="rest"
      whileHover="hover"
      animate="rest"
      className="flex h-fit w-full flex-col gap-0 overflow-hidden rounded-3xl bg-[#111111] p-4 sm:p-5"
    >
      {/* Mobile Toggle for Input */}
      <div className="mb-4 flex w-full justify-end md:hidden">
        <button
          type="button"
          onClick={() => setShowInputMobile(!showInputMobile)}
          className="text-xs font-medium text-neutral-400 underline decoration-neutral-600 underline-offset-4 hover:text-neutral-200"
        >
          {showInputMobile ? "Hide Input" : "Show Input"}
        </button>
      </div>

      {/* Top section with Images and Arrow */}
      <div className="flex w-full flex-col items-center gap-6 md:flex-row md:items-start md:gap-4">
        {/* Input Images */}
        <div
          className={`w-full min-w-0 flex-1 md:w-auto ${
            showInputMobile ? "flex" : "hidden md:flex"
          }`}
        >
          <GroupImageLayout
            images={inputImages}
            title="Input"
            autoRatio={true}
            selectedIndex={inputSelectedIndex}
            onThumbClick={(idx) => handleThumbClick("input", idx)}
            onExpandToggle={() => handleExpandToggle("input")}
            expanded={expandedSection === "input"}
            maxVisibleThumbnails={3}
            containerClassName="max-w-[240px] md:max-w-[520px]"
          />
        </div>

        {/* Arrow */}
        <div
          className={`shrink-0 items-center justify-center self-center ${
            showInputMobile ? "flex" : "hidden md:flex"
          }`}
        >
          <ArrowRightIcon size={36} className="rotate-90 text-neutral-500 md:rotate-0" />
        </div>

        {/* Output Images */}
        <div className="w-full min-w-0 flex-1 md:w-auto">
          <GroupImageLayout
            images={outputImages}
            title="Output"
            status={status}
            selectedIndex={outputSelectedIndex}
            onThumbClick={(idx) => handleThumbClick("output", idx)}
            onExpandToggle={() => handleExpandToggle("output")}
            expanded={expandedSection === "output"}
            maxVisibleThumbnails={3}
          />
        </div>
      </div>

      {/* Expanded grid appears below both input and output */}
      <div className="mt-4 flex w-full flex-col items-center gap-6">
        {renderExpandedGrid("input")}
        {renderExpandedGrid("output")}
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
