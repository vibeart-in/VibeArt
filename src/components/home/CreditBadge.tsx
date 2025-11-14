"use client";

import { IconDiamondFilled } from "@tabler/icons-react";
import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation"; // ✅ import router
import { useState } from "react";

interface CreditBadgeProps {
  credits: number;
  lowThreshold?: number;
}

export default function CreditBadge({ credits, lowThreshold = 10 }: CreditBadgeProps) {
  const [open, setOpen] = useState(false);
  const low = credits < lowThreshold;
  const router = useRouter(); // ✅ initialize router

  return (
    <div className="relative">
      {/* Badge Button */}
      <motion.button
        onClick={() => setOpen(!open)}
        className={`relative flex size-10 items-center justify-center rounded-2xl border transition-colors ${
          low ? "border-red-500 bg-red-600 text-white" : "border-white/10 bg-black text-white"
        }`}
        whileHover={{
          scale: 1.08,
          boxShadow: low ? "0px 0px 12px rgba(255,0,0,0.6)" : "0px 0px 12px rgba(217,232,37,0.5)",
        }}
        animate={low ? { scale: [1, 1.06, 1] } : {}}
        transition={low ? { duration: 1.2, repeat: Infinity } : { duration: 0.2 }}
      >
        <IconDiamondFilled className="size-5" />
        {/* Small pill badge */}
        <span
          className={`absolute -right-1 -top-1 rounded-full px-1 text-[10px] font-bold ${
            low ? "bg-white text-red-600" : "bg-accent text-black"
          }`}
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
            className="absolute right-0 z-50 mt-2 w-52 rounded-xl border border-white/10 bg-black/90 p-3 text-sm shadow-lg"
          >
            <div className="flex items-center justify-between">
              <span className="text-white/80">Total Credits</span>
              <span className="font-semibold text-white">{credits}</span>
            </div>

            <button
              className="mt-3 w-full rounded-lg bg-accent py-2 font-semibold text-black transition-colors hover:bg-accent/90"
              onClick={() => router.push("/pricing")} // ✅ redirect
            >
              Buy more
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
