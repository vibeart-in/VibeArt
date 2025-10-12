"use client";

import { XIcon } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";

import { LoginForm } from "../auth/login-form";

// import { PricingModal } from "./pricing-modal"; // Example component

interface CommonModalProps {
  isOpen: boolean;
  onClose: () => void;
  variant: "login" | "pricing" | "enhance" | "custom"; // add more as needed
  children?: React.ReactNode; // Optional if "custom" variant
}

const CommonModal = ({ isOpen, onClose, variant, children }: CommonModalProps) => {
  // Decide what to render based on variant
  const renderContent = () => {
    switch (variant) {
      case "login":
        return <LoginForm />;
      case "pricing":
        return "";
      case "enhance":
        return children;
      case "enhance":
        return children;
      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-20 flex items-center justify-center bg-black/30 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="relative"
          >
            {renderContent()}

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 z-50 rounded-full p-2 text-white/70 hover:text-white"
              aria-label="Close modal"
            >
              <XIcon size={25} weight="bold" />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CommonModal;
