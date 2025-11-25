// InputBox.tsx (replace relevant parts or drop in whole file)
"use client";
import { MoreVertical, XCircle } from "lucide-react";
import { AnimatePresence, motion, Variants } from "motion/react";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";

import { useGenerateImage } from "@/src/hooks/useGenerateImage";
import { useModelsByUsecase } from "@/src/hooks/useModelsByUsecase";
import { ConversationType, ModelData } from "@/src/types/BaseType";
import { evaluateCreditsFromModelParams } from "@/src/utils/client/credits-evaluator";

import DialogBox from "./DialogBox";
import ModelSelectorCard from "./ModalSelectorCard";
import ParametersSection, { ParametersSectionHandle } from "./ParametersSection";
import CommonModal from "../ui/CommonModal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dotted-dialog";
import GenerateButton from "../ui/GenerateButton";
import GradualBlurMemo from "../ui/GradualBlur";

const validateAndSanitizePrompt = (prompt: string) => {
  const trimmed = prompt.trim();
  if (!trimmed)
    return {
      isValid: false,
      error: "Prompt cannot be empty.",
    };
  if (trimmed.length > 5000)
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

  // confirmation modal state (new)
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmCredits, setConfirmCredits] = useState<number | null>(null);
  const [confirmAppliedRule, setConfirmAppliedRule] = useState<string | undefined>(undefined);
  const [confirmPayload, setConfirmPayload] = useState<{
    finalParameters: Record<string, any>;
    inputImagePermanentPaths: string[];
    promptText: string;
  } | null>(null);
  const [isComputingCredits, setIsComputingCredits] = useState(false);

  // This single ref will now control the parameters section
  const paramsRef = useRef<ParametersSectionHandle>(null);

  const pathname = usePathname();
  const conversationType = pathname.split("/")[1] as ConversationType;
  console.log("Conversation Type:", conversationType);

  const mutation = useGenerateImage(conversationType, conversationId);
  const { data: initialModel } = useModelsByUsecase(conversationType);

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
  }, [conversationType, initialModel]);

  useEffect(() => {
    if (selectedModel) {
      sessionStorage.setItem(`${conversationType}-model`, JSON.stringify(selectedModel));
    }
  }, [selectedModel, conversationType]);

  useEffect(() => {
    return () => mutation.reset();
  }, [mutation.reset]);

  // --- Memoized Callbacks ---
  const handleModelSelect = useCallback((model: ModelData) => {
    setSelectedModel(model);
    setIsDialogOpen(false);
  }, []);

  const handleCardClick = useCallback(() => {
    setIsDialogOpen((prev) => !prev);
  }, []);

  // ---------- New behaviour: only compute credits at top-level Generate click ----------
  const handleGenerateClick = useCallback(() => {
    if (mutation.isPending || !selectedModel || !paramsRef.current) return;

    try {
      setFormError(null);

      // read params only now
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

      // If not variable pricing -> proceed immediately with existing static model cost
      if (!selectedModel.is_variable_price) {
        const modelCredit = typeof selectedModel.cost === "number" ? selectedModel.cost : null;

        mutation.mutate(
          {
            parameters: finalParameters,
            conversationId,
            modelName: selectedModel.model_name,
            modelIdentifier: selectedModel.identifier,
            modelCredit,
            modelProvider: selectedModel.provider,
            conversationType: conversationType,
            inputImagePermanentPaths,
          },
          {
            onSuccess: () => {
              if (paramsRef.current) {
                paramsRef.current.clearPrompt?.();
              }
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

        return;
      }

      // Variable pricing -> compute credits once, then open confirmation dialog
      setIsComputingCredits(true);
      try {
        // parse credit parameters safely (some models may store stringified JSON)
        const creditParams =
          typeof selectedModel.pricing_parameters === "string"
            ? JSON.parse(selectedModel.pricing_parameters)
            : selectedModel.pricing_parameters;

        // call the evaluator (it returns { credits, appliedRule })
        const result = evaluateCreditsFromModelParams(creditParams, finalParameters);
        const credits = result.credits ?? null;

        // store payload to confirm
        setConfirmCredits(credits);
        setConfirmAppliedRule(result.appliedRule);
        setConfirmPayload({
          finalParameters,
          inputImagePermanentPaths,
          promptText,
        });

        // open confirm dialog
        setConfirmOpen(true);
      } catch (err: any) {
        console.error("Failed to compute credits:", err);
        // fallback: show static cost if available, or show error
        const modelCredit = typeof selectedModel.cost === "number" ? selectedModel.cost : null;
        if (modelCredit !== null) {
          // proceed with fallback cost after optionally notifying the user
          mutation.mutate(
            {
              parameters: finalParameters,
              conversationId,
              modelName: selectedModel.model_name,
              modelIdentifier: selectedModel.identifier,
              modelCredit,
              modelProvider: selectedModel.provider,
              conversationType: conversationType,
              inputImagePermanentPaths,
            },
            {
              onSuccess: () => paramsRef.current?.clearPrompt?.(),
              onError: (err) => {
                if (err.message === "Unauthorized") setIsLoginModalOpen(true);
                else setFormError(`Generation failed: ${err.message}`);
              },
            },
          );
          return;
        }

        setFormError("Could not calculate credits for these parameters. Please check your input.");
      } finally {
        setIsComputingCredits(false);
      }
    } catch (e: any) {
      console.error("Failed to get parameter values:", e.message);
      setFormError(`Configuration Error: ${e.message}`);
    }
  }, [mutation, selectedModel, conversationId, conversationType]);

  // when user confirms in the dialog -> actually generate
  const handleConfirmGenerate = useCallback(() => {
    if (!confirmPayload || !selectedModel) {
      setFormError("Missing payload for generation.");
      setConfirmOpen(false);
      return;
    }

    const { finalParameters, inputImagePermanentPaths } = confirmPayload;

    // use confirmCredits as final charge
    const modelCredit = confirmCredits;

    mutation.mutate(
      {
        parameters: finalParameters,
        conversationId,
        modelName: selectedModel.model_name,
        modelIdentifier: selectedModel.identifier,
        modelCredit,
        modelProvider: selectedModel.provider,
        conversationType: conversationType,
        inputImagePermanentPaths,
        // optional: pass appliedRule so backend can persist which rule was used
        // appliedPricingRule: confirmAppliedRule,
      },
      {
        onSuccess: () => {
          if (paramsRef.current) {
            paramsRef.current.clearPrompt?.();
          }
          setConfirmOpen(false);
          setConfirmCredits(null);
          setConfirmPayload(null);
          setConfirmAppliedRule(undefined);
        },
        onError: (err) => {
          setConfirmOpen(false);
          if (err.message === "Unauthorized") {
            setIsLoginModalOpen(true);
          } else {
            setFormError(`Generation failed: ${err.message}`);
          }
        },
      },
    );
  }, [
    confirmPayload,
    confirmCredits,
    selectedModel,
    mutation,
    conversationId,
    conversationType,
    confirmAppliedRule,
  ]);

  return (
    <>
      <div className="relative mb-2 w-fit rounded-[28px] border border-white/10 bg-[#0C0C0C]/80 p-2 backdrop-blur-lg md:p-3">
        {/* Model Selection Dialog */}
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
                <ParametersSection ref={paramsRef} selectedModel={selectedModel} />
              </div>
            )}

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
            cost={selectedModel?.cost} // still shows static cost; confirmation dialog will show final for variable
          />
        </section>

        {/* MOBILE: parameters modal (unchanged) */}
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

      {/* Confirmation Dialog (appears only when variable-priced model) */}
      <AnimatePresence>
        <Dialog
          open={confirmOpen}
          onOpenChange={(open) => {
            // keep same semantics: close dialog when user dismisses
            if (!open) setConfirmOpen(false);
          }}
        >
          <DialogContent className="w-full max-w-md rounded-2xl bg-[#0f0f0f] p-6 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="mb-2 text-xl font-semibold text-white">
                Confirm Credits
              </DialogTitle>
              <DialogDescription className="mb-4 text-sm text-muted-foreground">
                Based on your video parameters. You're about to spend{" "}
                <span className="font-bold text-white">
                  {isComputingCredits
                    ? "calculating..."
                    : confirmCredits !== null
                      ? `${confirmCredits} credits`
                      : "—"}
                </span>{" "}
                to generate this output.
              </DialogDescription>
            </DialogHeader>

            {/* optional: show applied rule */}
            {/* {confirmAppliedRule && (
              <div className="mb-4 text-xs text-white/60">Applied rule: {confirmAppliedRule}</div>
            )} */}

            {/* you can show a short summary of parameters if you want */}
            {/* <pre className="mb-4 text-xs text-white/60">{JSON.stringify(confirmPayload?.finalParameters, null, 2)}</pre> */}

            <DialogFooter className="flex gap-3 pt-4">
              <button
                onClick={() => setConfirmOpen(false)}
                className="flex-1 rounded-lg border border-white/10 px-4 py-2 text-sm"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmGenerate}
                className="flex-1 rounded-lg bg-accent px-4 py-2 text-sm font-bold text-black"
              >
                {mutation.isPending
                  ? "Generating..."
                  : `Generate (${confirmCredits ?? "—"} credits)`}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </AnimatePresence>

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
