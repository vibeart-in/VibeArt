"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { IconDiamondFilled } from "@tabler/icons-react"; // change to your icon lib

interface CreditBadgeProps {
  credits: number;
  lowThreshold?: number;
}

export default function CreditBadge({ credits, lowThreshold = 10 }: CreditBadgeProps) {
  const [open, setOpen] = useState(false);
  const low = credits < lowThreshold;

  return (
    <div className="relative">
      {/* Badge Button */}
      <motion.button
        onClick={() => setOpen(!open)}
        className={`relative flex items-center justify-center w-10 h-10 rounded-lg border transition-colors
          ${low ? "bg-red-600 border-red-500 text-white" : "bg-black border-white/10 text-white"}`}
        whileHover={{
          scale: 1.08,
          boxShadow: low
            ? "0px 0px 12px rgba(255,0,0,0.6)"
            : "0px 0px 12px rgba(217,232,37,0.5)",
        }}
        animate={
          low
            ? { scale: [1, 1.06, 1] }
            : {}
        }
        transition={low ? { duration: 1.2, repeat: Infinity } : { duration: 0.2 }}
      >
        <IconDiamondFilled className="w-5 h-5" />
        {/* Small pill badge */}
        <span
          className={`absolute -top-1 -right-1 px-1 text-[10px] rounded-full font-bold
            ${low ? "bg-white text-red-600" : "bg-accent text-black"}`}
        >
          {credits}
        </span>
      </motion.button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-52 rounded-xl bg-black/90 border border-white/10 shadow-lg p-3 text-sm z-50"
          >
            <div className="flex items-center justify-between">
              <span className="text-white/80">Total Credits</span>
              <span className="font-semibold text-white">{credits}</span>
            </div>

            <button
              className="mt-3 w-full py-2 rounded-lg bg-accent text-black font-semibold hover:bg-accent/90 transition-colors"
              onClick={() => {
                // 🔗 handle Buy More flow
                alert("Redirect to Buy more credits!");
              }}
            >
              Buy more
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
