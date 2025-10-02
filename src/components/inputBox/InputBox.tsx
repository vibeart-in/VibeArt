"use client";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { MoreVertical, XCircle } from "lucide-react";
import { useGenerateImage } from "@/src/hooks/useGenerateImage";
import DialogBox from "./DialogBox";
import { AnimatePresence, motion, Variants } from "motion/react";
import { ConversationType, ModelData } from "@/src/types/BaseType";
import GradualBlurMemo from "../ui/GradualBlur";
import {
  ReplicateParameters,
  ReplicateParametersHandle,
} from "./ReplicateParameters";
import {
  RunninghubParameters,
  RunninghubParametersHandle,
} from "./RunninghubParameters";
import GenerateButton from "../ui/GenerateButton";
import { usePathname } from "next/navigation";
import { PencilSimpleIcon } from "@phosphor-icons/react";

const initialModel: ModelData = {
  id: "1",
  link: "https://replicate.com/black-forest-labs/flux-dev",
  base_model: "black-forest-labs",
  model_name: "flux-dev",
  description:
    "A 12 billion parameter rectified flow transformer capable of generating images from text descriptions",
  model_uploaded: "Updated 4 weeks ago",
  runs: "22.7M runs",
  parameters: {
    prompt: {
      type: "string",
      title: "Prompt",
      description: "Prompt",
    },
    speed_mode: {
      enum: [
        "Lightly Juiced 🍊 (more consistent)",
        "Juiced 🔥 (default)",
        "Extra Juiced 🔥 (more speed)",
        "Blink of an eye 👁️",
      ],
      type: "string",
      title: "speed_mode",
      default: "Juiced 🔥 (default)",
      description: "Speed optimization level",
    },
    "input image": {
      type: "string",
      title: "Input Image",
      format: "uri",
      default: "",
      // "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/sign/uploaded-images/11b860f5-54db-44e5-83ff-8fdb911e0b29/f03e2a24-b4a3-4678-8f54-07cdb1bc4083-0.webp?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82MzgwNmFmZC1mZDZkLTQ5NDktYjFmNC0yNjRiMDgyNDNjMjkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ1cGxvYWRlZC1pbWFnZXMvMTFiODYwZjUtNTRkYi00NGU1LTgzZmYtOGZkYjkxMWUwYjI5L2YwM2UyYTI0LWI0YTMtNDY3OC04ZjU0LTA3Y2RiMWJjNDA4My0wLndlYnAiLCJpYXQiOjE3NTg2NTM5MDEsImV4cCI6MTc1OTI1ODcwMX0.8xrx1cR2PhjwW-y1vya9SaZIHPSXBiSIZs0LoUKwWOc",
      description:
        "Image to use as reference. Must be jpeg, png, gif, or webp.",
    },
    aspect_ratio: {
      enum: [
        "1:1",
        "16:9",
        "21:9",
        "3:2",
        "2:3",
        "4:5",
        "5:4",
        "3:4",
        "4:3",
        "9:16",
        "9:21",
      ],
      type: "string",
      title: "aspect_ratio",
      default: "1:1",
      description: "Aspect ratio of the output image",
    },
    "num inference steps": {
      type: "integer",
      title: "Num Inference Steps",
      default: 28,
      description: "Number of inference steps",
    },
  },
  cost: 2,
  model_type: "Flux",
  cover_image:
    "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/model_cover/3.webp",
  usecase: "generate",
  identifier: "black-forest-labs/flux-dev",
  version: "1.0",
  created_at: "",
  provider: "replicate",
  is_popular: false,
  estimated_time: 2,
};

const validateAndSanitizePrompt = (prompt: string) => {
  const trimmed = prompt.trim();
  if (!trimmed) return { isValid: false, error: "Prompt cannot be empty." };
  if (trimmed.length > 1000)
    return {
      isValid: false,
      error: "Prompt is too long (max 1000 characters).",
    };
  return { isValid: true, sanitized: trimmed };
};

const popVariants: Variants = {
  initial: { opacity: 0, scale: 0.9, y: -6 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      opacity: { duration: 0.12, ease: "easeOut" },
      scale: { type: "spring", stiffness: 520, damping: 24, mass: 0.9 },
      y: { type: "spring", stiffness: 520, damping: 24, mass: 0.9 },
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: -6,
    transition: {
      opacity: { duration: 0.12, ease: "easeIn" },
      scale: { duration: 0.12, ease: "easeIn" },
      y: { duration: 0.12, ease: "easeIn" },
    },
  },
};

interface InputBoxProps {
  conversationId?: string;
}

const InputBox = ({ conversationId }: InputBoxProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ModelData>(initialModel);
  const [formError, setFormError] = useState<string | null>(null);
  const [isParamsMenuOpen, setIsParamsMenuOpen] = useState(false);
  const replicateParamsRef = useRef<ReplicateParametersHandle>(null);
  const runninghubParamsRef = useRef<RunninghubParametersHandle>(null);

  const pathname = usePathname();
  const conversationType = pathname.split("/")[2] as ConversationType;

  const mutation = useGenerateImage(conversationType, conversationId);

  const handleModelSelect = (model: ModelData) => {
    setSelectedModel(model);
    sessionStorage.setItem("lastSelectedModel", JSON.stringify(model));
    setIsDialogOpen(false);
  };

  useEffect(() => {
    const savedModel = sessionStorage.getItem("lastSelectedModel");
    if (savedModel) {
      try {
        setSelectedModel(JSON.parse(savedModel));
      } catch {
        console.warn("Failed to parse saved model.");
      }
    }
  }, []);

  useEffect(() => {
    return () => {
      mutation.reset();
    };
  }, [mutation.reset]);

  const handleGenerateClick = () => {
    if (mutation.isPending) return;
    let finalParameters;
    let promptText = "";

    if (selectedModel.provider === "replicate") {
      if (!replicateParamsRef.current) {
        console.error("Replicate parameters component is not ready.");
        return;
      }
      finalParameters = replicateParamsRef.current.getValues();
      promptText = finalParameters.prompt || "";
    } else if (selectedModel.provider === "running_hub") {
      if (!runninghubParamsRef.current) {
        console.error("Runninghub parameters component is not ready.");
        return;
      }
      finalParameters = runninghubParamsRef.current.getValues();

      const promptParam = finalParameters.find(
        (p) => p.description === "prompt"
      );
      promptText = promptParam?.fieldValue || "";
    } else {
      setFormError(`Unsupported provider: ${selectedModel.provider}`);
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
          setFormError(`Generation failed: ${err.message}`);
        },
      }
    );
  };

  const handleCardClick = () => {
    setIsDialogOpen((prev) => !prev);
  };

  return (
    <>
      <div className="relative w-fit bg-[#111111]/80 backdrop-blur-md rounded-[28px] p-2 md:p-3 mb-2">
        <AnimatePresence>
          {isDialogOpen && (
            <motion.div
              className=" w-full mb-2 overflow-hidden"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "24rem" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <div className="w-full h-full p-2 overflow-y-auto">
                <DialogBox
                  conversationType={conversationType}
                  onSelectModel={handleModelSelect}
                />
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
          <div
            onClick={handleCardClick}
            className="w-[120px] h-[95px] z-20 rounded-3xl relative cursor-pointer transition-transform hover:scale-105 active:scale-100 overflow-hidden flex-shrink-0 group"
          >
            {/* Inner shadow */}
            <div className="absolute inset-0 shadow-[inset_0_4px_18px_rgba(0,0,0,0.5)] rounded-3xl pointer-events-none"></div>

            {/* Image */}
            <Image
              className="object-cover w-full h-full rounded-3xl transition-all duration-300 group-hover:brightness-90"
              src={selectedModel.cover_image}
              alt={selectedModel.model_name}
              width={150}
              height={95}
            />

            {/* Model name (now fades out on hover) */}
            <div className="absolute bottom-2 left-2 right-2 bg-black/30 rounded-md p-1 text-center transition-opacity group-hover:opacity-0">
              <p className="text-accent font-gothic text-sm font-medium truncate">
                {selectedModel.model_name}
              </p>
            </div>

            {/* Hover-only "Click to change" hint (fades in on hover) */}
            <div className="absolute inset-0 flex justify-center items-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-xs text-white/90 bg-black/50 px-2 py-1 rounded-xl">
                <PencilSimpleIcon size={20} weight="fill" />
              </span>
            </div>
          </div>

          <div className="flex z-20 flex-col items-center gap-2">
            {/* DESKTOP: Show parameters inline */}
            <div className="hidden md:flex flex-grow justify-center">
              {selectedModel.provider === "replicate" ? (
                <ReplicateParameters
                  // @ts-expect-error - parameters prop expects correct type but model parameters structure may not match
                  parameters={selectedModel.parameters}
                  ref={replicateParamsRef}
                />
              ) : (
                <RunninghubParameters
                  // @ts-expect-error - parameters prop expects correct type but model parameters structure may not match
                  parameters={selectedModel.parameters}
                  ref={runninghubParamsRef}
                />
              )}
            </div>

            {/* MOBILE: Show 3-dot menu button */}
            <div className="flex-grow flex justify-end md:hidden">
              <button
                onClick={() => setIsParamsMenuOpen(true)}
                className="h-[75px] w-[60px] rounded-2xl bg-black/20 border border-white/10 flex items-center justify-center text-white/70 hover:bg-black/40"
              >
                <MoreVertical />
              </button>
            </div>
          </div>
          <GenerateButton
            handleGenerateClick={handleGenerateClick}
            mutation={mutation}
            selectedModel={selectedModel}
          />
        </section>

        {/* MODAL FOR MOBILE PARAMETERS */}
        <AnimatePresence>
          {isParamsMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsParamsMenuOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-sm bg-[#181818] rounded-2xl border border-white/10 p-6 shadow-2xl"
              >
                <h3 className="text-lg font-semibold text-white mb-4">
                  Advanced Settings
                </h3>
                <div className="mb-6"></div>
                <button
                  onClick={() => setIsParamsMenuOpen(false)}
                  className="w-full py-2.5 rounded-lg bg-accent/90 text-black font-bold"
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
            className="flex items-center gap-2 text-red-400 bg-red-900/70 p-2 rounded-xl mb-2 text-sm"
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
    </>
  );
};

export default InputBox;
