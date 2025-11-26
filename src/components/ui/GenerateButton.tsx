"use client";

import { SparkleIcon, SpinnerBallIcon, ArrowUpIcon } from "@phosphor-icons/react";
import { motion } from "motion/react";
import React from "react";

type GenerateButtonProps = {
  handleGenerateClick: () => void;
  isPending: boolean;
  cost?: number | null;
};

const GenerateButton = React.memo(
  ({ handleGenerateClick, isPending, cost }: GenerateButtonProps) => {
    return (
      <motion.button
        onClick={handleGenerateClick}
        disabled={isPending}
        whileHover={{ scale: 1.05, boxShadow: "0px 0px 12px rgba(0,0,0,0.2)" }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="z-20 lg:min-h-[100px] flex h-full flex-col items-center justify-center rounded-3xl border-2 border-black bg-accent px-4 py-2 text-sm font-bold text-black disabled:cursor-not-allowed disabled:bg-gray-500 md:px-12 md:text-base"
      >
        <motion.span
          className="flex items-center gap-1"
          layout
          transition={{ type: "spring", stiffness: 250, damping: 20 }}
        >
          {isPending ? (
            <span className="hidden md:inline">Generating...</span>
          ) : (
            <>
              <span className="hidden md:inline">Generate</span>
              <span className="md:hidden">
                <ArrowUpIcon size={24} weight="bold" />
              </span>
            </>
          )}
          {isPending ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <SpinnerBallIcon size={24} weight="duotone" className="md:h-8 md:w-8" />
            </motion.div>
          ) : (
            <motion.div
              key="sparkles"
              className="hidden md:block"
              initial={{ scale: 0, rotate: -90, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              <SparkleIcon size={25} weight="duotone" />
            </motion.div>
          )}
        </motion.span>
        {cost && (
          <span className="text-xs font-medium">
            <span className="md:hidden">{cost}</span>
            <span className="hidden md:inline">({cost} Credits)</span>
          </span>
        )}
      </motion.button>
    );
  },
);

GenerateButton.displayName = "GenerateButton";

export default GenerateButton;
