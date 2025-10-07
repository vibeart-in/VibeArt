"use client";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { MoreVertical, XCircle } from "lucide-react";
import { useGenerateImage } from "@/src/hooks/useGenerateImage";
import DialogBox from "./DialogBox";
import { AnimatePresence, motion, Variants } from "motion/react";
import { ConversationType, ModelData } from "@/src/types/BaseType";
import GradualBlurMemo from "../ui/GradualBlur";
import { ReplicateParameters, ReplicateParametersHandle } from "./ReplicateParameters";
import { RunninghubParameters, RunninghubParametersHandle } from "./RunninghubParameters";
import GenerateButton from "../ui/GenerateButton";
import { usePathname } from "next/navigation";
import { PencilSimpleIcon } from "@phosphor-icons/react";
import LoginModal from "../auth/LoginModal";
import { useModelsByUsecase } from "@/src/hooks/useModelsByUsecase";

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
  const replicateParamsRef = useRef<ReplicateParametersHandle>(null);
  const runninghubParamsRef = useRef<RunninghubParametersHandle>(null);

  const pathname = usePathname();
  const conversationType = pathname.split("/")[2] as ConversationType;

  const mutation = useGenerateImage(conversationType, conversationId);
  const { data: initialModel } = useModelsByUsecase(conversationType);

  const handleModelSelect = (model: ModelData) => {
    setSelectedModel(model);
    sessionStorage.setItem(`${conversationType}-model`, JSON.stringify(model));
    setIsDialogOpen(false);
  };

  useEffect(() => {
    const savedModel = sessionStorage.getItem(`${conversationType}-model`);

    if (savedModel) {
      try {
        const parsed = JSON.parse(savedModel);
        setSelectedModel(parsed);
        return;
      } catch {
        console.warn("Failed to parse saved model.");
      }
    }

    if (initialModel && initialModel.length > 0 && !selectedModel) {
      setSelectedModel(initialModel[0]);
    }
  }, [conversationType, initialModel]);

  useEffect(() => {
    if (selectedModel) {
      sessionStorage.setItem(`${conversationType}-model`, JSON.stringify(selectedModel));
    }
  }, [selectedModel, conversationType]);

  useEffect(() => {
    return () => {
      mutation.reset();
    };
  }, [mutation.reset]);

  const handleGenerateClick = () => {
    if (mutation.isPending) return;
    let finalParameters;
    let promptText = "";

    if (selectedModel?.provider === "replicate") {
      if (!replicateParamsRef.current) {
        console.error("Replicate parameters component is not ready.");
        return;
      }
      finalParameters = replicateParamsRef.current.getValues();
      promptText = finalParameters.prompt || "";
    } else if (selectedModel?.provider === "running_hub") {
      if (!runninghubParamsRef.current) {
        console.error("Runninghub parameters component is not ready.");
        return;
      }
      finalParameters = runninghubParamsRef.current.getValues();

      const promptParam = finalParameters.find((p) => p.description === "prompt");
      promptText = promptParam?.fieldValue || "";
    } else {
      setFormError(`Unsupported provider: ${selectedModel?.provider}`);
      return;
    }
    console.log(finalParameters);

    const { isValid, error } = validateAndSanitizePrompt(promptText);
    if (!isValid && error) {
      setFormError(error);
      return;
    }

    setFormError(null);

    console.log(finalParameters);

    mutation.mutate(
      {
        parameters: finalParameters,
        conversationId,
        modelIdentifier: selectedModel.identifier,
        modelCredit: selectedModel.cost,
        modelProvider: selectedModel.provider,
        conversationType: conversationType,
      },
      {
        onSuccess: () => {
          // You would need to add a reset method to the imperative handle
          // on both parameter components if you want to clear the prompt on success.
        },
        onError: (err) => {
          if (err.message === "Unauthorized") {
            setIsLoginModalOpen(true);
          } else {
            setFormError(`Generation failed: ${err.message}`);
          }
        },
      },
    );
  };

  const handleCardClick = () => {
    setIsDialogOpen((prev) => !prev);
  };

  return (
    <>
      <div className="relative mb-2 w-fit rounded-[28px] bg-[#111111]/80 p-2 backdrop-blur-md md:p-3">
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
                height: "24rem",
              }}
              exit={{
                opacity: 0,
                height: 0,
              }}
              transition={{
                duration: 0.4,
                ease: "easeInOut",
              }}
            >
              <div className="h-full w-full overflow-y-auto p-2">
                <DialogBox conversationType={conversationType} onSelectModel={handleModelSelect} />
              </div>
              <GradualBlurMemo
                target="parent"
                position="bottom"
                height="12rem"
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
        <section className="flex gap-4">
          {selectedModel ? (
            <div
              onClick={handleCardClick}
              className="group relative z-20 h-[95px] w-[120px] flex-shrink-0 cursor-pointer overflow-hidden rounded-3xl transition-transform hover:scale-105 active:scale-100"
            >
              <div className="pointer-events-none absolute inset-0 rounded-3xl shadow-[inset_0_4px_18px_rgba(0,0,0,0.5)]"></div>
              {selectedModel.cover_image.endsWith(".mp4") ? (
                <video
                  src={selectedModel.cover_image}
                  className="h-full w-full rounded-3xl object-cover transition-all duration-300 group-hover:brightness-90"
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              ) : (
                <Image
                  className="h-full w-full rounded-3xl object-cover transition-all duration-300 group-hover:brightness-90"
                  src={selectedModel.cover_image}
                  alt={selectedModel.model_name}
                  width={150}
                  height={95}
                />
              )}

              <div className="absolute bottom-2 left-2 right-2 rounded-md bg-black/30 p-1 text-center transition-opacity group-hover:opacity-0">
                <p className="truncate font-gothic text-sm font-medium text-accent">
                  {selectedModel.model_name}
                </p>
              </div>

              <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                <span className="rounded-xl bg-black/50 px-2 py-1 text-xs text-white/90">
                  <PencilSimpleIcon size={20} weight="fill" />
                </span>
              </div>
            </div>
          ) : (
            <div
              onClick={handleCardClick}
              className="group relative z-20 h-[95px] w-[120px] flex-shrink-0 cursor-pointer overflow-hidden rounded-3xl border-2 border-dashed border-gray-600 bg-gray-800/50 transition-transform hover:scale-105 active:scale-100"
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <PencilSimpleIcon size={24} weight="fill" className="mb-1 text-gray-400" />
                <span className="px-2 text-center font-gothic text-xs text-gray-400">
                  Select Model
                </span>
              </div>
            </div>
          )}

          <div className="z-20 flex flex-col items-center gap-2">
            {selectedModel && (
              <div className="hidden flex-grow justify-center md:flex">
                {selectedModel?.provider === "replicate" ? (
                  <ReplicateParameters
                    // @ts-expect-error - parameters prop expects correct type but model parameters structure may not match
                    parameters={selectedModel?.parameters}
                    ref={replicateParamsRef}
                  />
                ) : (
                  <RunninghubParameters
                    // @ts-expect-error - parameters prop expects correct type but model parameters structure may not match
                    parameters={selectedModel?.parameters}
                    ref={runninghubParamsRef}
                  />
                )}
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

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </>
  );
};

export default InputBox;
