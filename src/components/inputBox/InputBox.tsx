"use client";
import { PencilSimpleIcon, SwapIcon } from "@phosphor-icons/react";
import { MoreVertical, XCircle } from "lucide-react";
import { AnimatePresence, motion, Variants } from "motion/react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";

import { useGenerateImage } from "@/src/hooks/useGenerateImage";
import { useModelsByUsecase } from "@/src/hooks/useModelsByUsecase";
import { ConversationType, ModelData } from "@/src/types/BaseType";

import DialogBox from "./DialogBox";
import ModelSelectorCard from "./ModalSelectorCard";
import ParametersSection, { ParametersSectionHandle } from "./ParametersSection";
import { ReplicateParameters, ReplicateParametersHandle } from "./ReplicateParameters";
import { RunninghubParameters, RunninghubParametersHandle } from "./RunninghubParameters";
import CommonModal from "../ui/CommonModal";
import GenerateButton from "../ui/GenerateButton";
import GradualBlurMemo from "../ui/GradualBlur";

const validateAndSanitizePrompt = (prompt: string) => {
  const trimmed = prompt.trim();
  if (!trimmed)
    return {
      isValid: false,
      error: "Prompt cannot be empty.",
    };
  if (trimmed.length > 1000)
    return {
      isValid: false,
      error: "Prompt is too long (max 1000 characters).",
    };
  return {
    isValid: true,
    sanitized: trimmed,
  };
};

const popVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.9,
    y: -6,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      opacity: {
        duration: 0.12,
        ease: "easeOut",
      },
      scale: {
        type: "spring",
        stiffness: 520,
        damping: 24,
        mass: 0.9,
      },
      y: {
        type: "spring",
        stiffness: 520,
        damping: 24,
        mass: 0.9,
      },
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: -6,
    transition: {
      opacity: {
        duration: 0.12,
        ease: "easeIn",
      },
      scale: {
        duration: 0.12,
        ease: "easeIn",
      },
      y: {
        duration: 0.12,
        ease: "easeIn",
      },
    },
  },
};

interface InputBoxProps {
  conversationId?: string;
}

const InputBox = ({ conversationId }: InputBoxProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ModelData | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isParamsMenuOpen, setIsParamsMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // This single ref will now control the parameters section
  const paramsRef = useRef<ParametersSectionHandle>(null);

  const pathname = usePathname();
  const conversationType = pathname.split("/")[2] as ConversationType;

  const mutation = useGenerateImage(conversationType, conversationId);
  const { data: initialModel } = useModelsByUsecase(conversationType);

  // This logic remains largely the same
  useEffect(() => {
    const savedModel = sessionStorage.getItem(`${conversationType}-model`);
    if (savedModel) {
      try {
        setSelectedModel(JSON.parse(savedModel));
        return;
      } catch {
        console.warn("Failed to parse saved model.");
      }
    }
    if (initialModel && initialModel.length > 0 && !selectedModel) {
      setSelectedModel(initialModel[0]);
    }
  }, [conversationType, initialModel]); // Removed selectedModel from deps

  useEffect(() => {
    if (selectedModel) {
      sessionStorage.setItem(`${conversationType}-model`, JSON.stringify(selectedModel));
    }
  }, [selectedModel, conversationType]);

  useEffect(() => {
    return () => mutation.reset();
  }, [mutation.reset]); // Assuming mutation.reset is stable

  // --- Memoized Callbacks ---
  const handleModelSelect = useCallback((model: ModelData) => {
    setSelectedModel(model);
    setIsDialogOpen(false);
  }, []);

  const handleCardClick = useCallback(() => {
    setIsDialogOpen((prev) => !prev);
  }, []);

  const handleGenerateClick = useCallback(() => {
    if (mutation.isPending || !selectedModel || !paramsRef.current) return;

    try {
      setFormError(null);

      // Get all values from the single ref
      const {
        values: finalParameters,
        inputImages: inputImagePermanentPaths,
        promptText,
      } = paramsRef.current.getValues();

      const { isValid, error } = validateAndSanitizePrompt(promptText);
      if (!isValid && error) {
        setFormError(error);
        return;
      }

      mutation.mutate(
        {
          parameters: finalParameters,
          conversationId,
          modelName: selectedModel.model_name,
          modelIdentifier: selectedModel.identifier,
          modelCredit: selectedModel.cost,
          modelProvider: selectedModel.provider,
          conversationType: conversationType,
          inputImagePermanentPaths,
        },
        {
          onError: (err) => {
            if (err.message === "Unauthorized") {
              setIsLoginModalOpen(true);
            } else {
              setFormError(`Generation failed: ${err.message}`);
            }
          },
        },
      );
    } catch (e: any) {
      console.error("Failed to get parameter values:", e.message);
      setFormError(`Configuration Error: ${e.message}`);
    }
  }, [mutation, selectedModel, conversationId, conversationType]);

  return (
    <>
      <div className="relative mb-2 w-fit rounded-[28px] border border-white/10 bg-[#0C0C0C]/80 p-2 backdrop-blur-lg md:p-3">
        {/* Model Selection Dialog - No major changes needed here, as it's driven by simple state */}
        <AnimatePresence>
          {isDialogOpen && (
            <motion.div
              className="mb-2 w-full overflow-hidden"
              initial={{
                opacity: 0,
                height: 0,
              }}
              animate={{
                opacity: 1,
                height: "32rem",
              }}
              exit={{
                opacity: 0,
                height: 0,
              }}
              transition={{
                duration: 0.5,
                ease: "easeInOut",
              }}
            >
              <div className="size-full overflow-y-auto p-2">
                <DialogBox conversationType={conversationType} onSelectModel={handleModelSelect} />
              </div>
              <GradualBlurMemo
                target="parent"
                position="bottom"
                height="10rem"
                strength={2}
                divCount={5}
                zIndex={1}
                className="!bottom-2 p-2"
                curve="bezier"
                exponential={true}
                opacity={1}
              />
            </motion.div>
          )}
        </AnimatePresence>
        <section className="flex justify-between gap-4">
          <ModelSelectorCard selectedModel={selectedModel} onClick={handleCardClick} />

          <div className="z-20 flex flex-col items-center gap-2">
            {selectedModel && (
              <div className="hidden flex-grow justify-center md:flex">
                {/* The new, self-contained parameters component */}
                <ParametersSection ref={paramsRef} selectedModel={selectedModel} />
              </div>
            )}

            {/* MOBILE: Show 3-dot menu button */}
            <div className="flex flex-grow justify-end md:hidden">
              <button
                onClick={() => setIsParamsMenuOpen(true)}
                className="flex h-[75px] w-[60px] items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-white/70 hover:bg-black/40"
              >
                <MoreVertical />
              </button>
            </div>
          </div>

          <GenerateButton
            handleGenerateClick={handleGenerateClick}
            isPending={mutation.isPending}
            cost={selectedModel?.cost}
          />
        </section>
        {/* MODAL FOR MOBILE PARAMETERS */}
        <AnimatePresence>
          {isParamsMenuOpen && (
            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              onClick={() => setIsParamsMenuOpen(false)}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            >
              <motion.div
                initial={{
                  scale: 0.9,
                  opacity: 0,
                }}
                animate={{
                  scale: 1,
                  opacity: 1,
                }}
                exit={{
                  scale: 0.9,
                  opacity: 0,
                }}
                transition={{
                  duration: 0.2,
                  ease: "easeOut",
                }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#181818] p-6 shadow-2xl"
              >
                <h3 className="mb-4 text-lg font-semibold text-white">Advanced Settings</h3>
                <div className="mb-6"></div>
                <button
                  onClick={() => setIsParamsMenuOpen(false)}
                  className="w-full rounded-lg bg-accent/90 py-2.5 font-bold text-black"
                >
                  Done
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <AnimatePresence mode="popLayout">
        {formError && (
          <motion.div
            key="form-error"
            variants={popVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="mb-2 flex items-center gap-2 rounded-xl bg-red-900/70 p-2 text-sm text-red-400"
            role="alert"
          >
            <XCircle
              size={16}
              className="cursor-pointer hover:text-red-300"
              onClick={() => setFormError(null)}
            />
            <p>{formError}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <CommonModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        variant="login"
      />
    </>
  );
};

export default InputBox;
