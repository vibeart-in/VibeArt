"use client";
import { IconCheck, IconCopy } from "@tabler/icons-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

export function CopyButton({ userPrompt }: { userPrompt: string }) {
  const [copied, setCopied] = useState(false);

  const doCopy = async () => {
    try {
      await navigator.clipboard.writeText(userPrompt || "");
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      // fallback
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    }
  };

  return (
    <button
      onClick={doCopy}
      aria-label="Copy prompt"
      className="flex h-8 w-8 items-center justify-center rounded-full"
    >
      <AnimatePresence mode="wait" initial={false}>
        {copied ? (
          <motion.span
            key="check"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
          >
            <IconCheck className="h-4 w-4 text-green-400" />
          </motion.span>
        ) : (
          <motion.span
            key="copy"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
          >
            <IconCopy className="h-4 w-4 text-white/70" />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
