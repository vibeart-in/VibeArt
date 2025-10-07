"use client";

import { AnimatePresence, motion } from "motion/react";
import { LoginForm } from "./login-form";
import { XIcon } from "@phosphor-icons/react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal = ({ isOpen, onClose }: LoginModalProps) => {
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
            <LoginForm />
            <button
              onClick={onClose}
              className="absolute right-4 top-4 z-50 rounded-full p-2 text-white/70 hover:text-white"
              aria-label="Remove image"
            >
              <XIcon size={25} weight="bold" />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoginModal;
