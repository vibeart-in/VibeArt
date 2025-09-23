"use client";

import { motion } from "motion/react";
import { SparkleIcon, SpinnerBallIcon } from "@phosphor-icons/react";

type Props = {
  handleGenerateClick: () => void;
  mutation: { isPending: boolean };
  selectedModel: { cost: number };
};

export default function GenerateButton({
  handleGenerateClick,
  mutation,
  selectedModel,
}: Props) {
  return (
    <motion.button
      onClick={handleGenerateClick}
      disabled={mutation.isPending}
      whileHover={{ scale: 1.05, boxShadow: "0px 0px 12px rgba(0,0,0,0.2)" }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="flex flex-col items-center justify-center z-20 px-12 py-3 rounded-3xl font-bold text-base bg-accent text-black border-2 border-black disabled:bg-gray-500 disabled:cursor-not-allowed"
    >
      <motion.span
        className="flex gap-1 items-center"
        layout
        transition={{ type: "spring", stiffness: 250, damping: 20 }}
      >
        {mutation.isPending ? "Generating..." : "Generate"}
        {mutation.isPending ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <SpinnerBallIcon size={32} weight="duotone" />
          </motion.div>
        ) : (
          <motion.div
            key="sparkles"
            initial={{ scale: 0, rotate: -90, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
          >
            <SparkleIcon size={25} weight="duotone" />
          </motion.div>
        )}
      </motion.span>
      <span className="font-medium text-xs">
        ({selectedModel.cost} Credits)
      </span>
    </motion.button>
  );
}
