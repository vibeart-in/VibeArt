"use client";
import { IconTerminal } from "@tabler/icons-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Textarea } from "../ui/textarea";
import { Loader2, MoreVertical, Sparkles, XCircle } from "lucide-react";
import { useGenerateImage } from "@/src/hooks/useGenerateImage";
import DialogBox from "./DialogBox";
import { AnimatePresence, motion } from "motion/react";
import { ModelData } from "@/src/types/BaseType";
import DynamicParameters from "./DynamicParameters";
import GradualBlurMemo from "../ui/GradualBlur";

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
    seed: {
      type: "integer",
      title: "Seed",
      "x-order": 10,
      description: "Random seed. Set for reproducible generation",
    },
    steps: {
      type: "integer",
      title: "Steps",
      default: 25,
      maximum: 50,
      minimum: 1,
      "x-order": 5,
      description: "Number of diffusion steps",
    },
    width: {
      type: "integer",
      title: "Width",
      maximum: 1440,
      minimum: 256,
      "x-order": 3,
      description:
        "Width of the generated image in text-to-image mode. Only used when aspect_ratio=custom. Must be a multiple of 32 (if it's not, it will be rounded to nearest multiple of 32). Note: Ignored in img2img and inpainting modes.",
    },
    height: {
      type: "integer",
      title: "Height",
      maximum: 1440,
      minimum: 256,
      "x-order": 4,
      description:
        "Height of the generated image in text-to-image mode. Only used when aspect_ratio=custom. Must be a multiple of 32 (if it's not, it will be rounded to nearest multiple of 32). Note: Ignored in img2img and inpainting modes.",
    },
    prompt: {
      type: "string",
      title: "Prompt",
      "x-order": 0,
      description: "Text prompt for image generation",
    },
    guidance: {
      type: "number",
      title: "Guidance",
      default: 3,
      maximum: 5,
      minimum: 2,
      "x-order": 6,
      description:
        "Controls the balance between adherence to the text prompt and image quality/diversity. Higher values make the output more closely match the prompt but may reduce overall image quality. Lower values allow for more creative freedom but might produce results less relevant to the prompt.",
    },
    interval: {
      type: "number",
      title: "Interval",
      default: 2,
      maximum: 4,
      minimum: 1,
      "x-order": 7,
      description:
        "Interval is a setting that increases the variance in possible outputs letting the model be a tad more dynamic in what outputs it may produce in terms of composition, color, detail, and prompt interpretation. Setting this value low will ensure strong prompt following with more consistent outputs, setting it higher will produce more dynamic or varied outputs.",
    },
    aspect_ratio: {
      enum: [
        "custom",
        "1:1",
        "16:9",
        "3:2",
        "2:3",
        "4:5",
        "5:4",
        "9:16",
        "3:4",
        "4:3",
      ],
      type: "string",
      title: "aspect_ratio",
      description: "Aspect ratio for the generated image",
      default: "1:1",
      "x-order": 2,
    },
    image_prompt: {
      type: "string",
      title: "Image Prompt",
      format: "uri",
      "x-order": 1,
      description:
        "Image to use with Flux Redux. This is used together with the text prompt to guide the generation towards the composition of the image_prompt. Must be jpeg, png, gif, or webp.",
    },
    output_format: {
      enum: ["webp", "jpg", "png"],
      type: "string",
      title: "output_format",
      description: "Format of the output images.",
      default: "webp",
      "x-order": 11,
    },
    output_quality: {
      type: "integer",
      title: "Output Quality",
      default: 80,
      maximum: 100,
      minimum: 0,
      "x-order": 12,
      description:
        "Quality when saving the output images, from 0 to 100. 100 is best quality, 0 is lowest quality. Not relevant for .png outputs",
    },
    safety_tolerance: {
      type: "integer",
      title: "Safety Tolerance",
      default: 2,
      maximum: 6,
      minimum: 1,
      "x-order": 8,
      description:
        "Safety tolerance, 1 is most strict and 6 is most permissive",
    },
    prompt_upsampling: {
      type: "boolean",
      title: "Prompt Upsampling",
      default: false,
      "x-order": 9,
      description:
        "Automatically modify the prompt for more creative generation",
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
  provider: "running_hub",
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

interface InputBoxProps {
  conversationId?: string;
}

const InputBox = ({ conversationId }: InputBoxProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ModelData>(initialModel);
  const [parameters, setParameters] = useState<Record<string, any>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isParamsMenuOpen, setIsParamsMenuOpen] = useState(false);

  const mutation = useGenerateImage(conversationId);

  const handleModelSelect = (model: ModelData) => {
    setSelectedModel(model);
    localStorage.setItem("lastSelectedModel", JSON.stringify(model));
    setIsDialogOpen(false);
  };

  useEffect(() => {
    const savedModel = localStorage.getItem("lastSelectedModel");
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

    const { isValid, error } = validateAndSanitizePrompt(
      parameters.prompt || ""
    );
    if (!isValid && error) {
      setFormError(error);
      return;
    }

    setFormError(null);

    mutation.mutate(
      {
        parameters,
        conversationId,
        modelIdentifier: selectedModel.identifier,
        modelCredit: selectedModel.cost,
        modelProvider: selectedModel.provider,
      },
      {
        onSuccess: () => {
          setParameters((prev) => ({
            ...prev,
            prompt: "",
          }));
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

  const handleParametersChange = (values: Record<string, any>) => {
    setParameters(values);
  };

  return (
    <div className="relative w-fit bg-background/80 border border-white/10 backdrop-blur-md rounded-[28px] p-2 md:p-3 mb-2">
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
              <DialogBox onSelectModel={handleModelSelect} />
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
          className="w-[120px] h-[95px] z-20 rounded-3xl relative cursor-pointer transition-transform hover:scale-105 active:scale-100 overflow-hidden flex-shrink-0"
        >
          <div className="absolute inset-0 shadow-[inset_0_4px_18px_rgba(0,0,0,0.9)] rounded-3xl pointer-events-none"></div>

          <Image
            className="object-cover w-full h-full"
            src={selectedModel.cover_image}
            alt={selectedModel.model_name}
            width={150}
            height={95}
          />

          <div className="absolute inset-0 bg-black/20 flex justify-center items-center p-1 text-center">
            <p className="text-accent font-gothic text-base font-medium leading-tight">
              {selectedModel.model_name}
            </p>
          </div>
        </div>

        <div className="mt-2 flex z-20 flex-col items-center gap-2">
          <AnimatePresence>
            {!isDialogOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.1 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="relative w-full"
              >
                <IconTerminal className="absolute top-2 left-4 text-white/80" />
                <Textarea
                  value={parameters.prompt || ""}
                  onChange={(e) =>
                    setParameters((prev) => ({
                      ...prev,
                      prompt: e.target.value,
                    }))
                  }
                  className="pl-12 hide-scrollbar min-w-[400px]"
                  placeholder="A cute magical flying cat, cinematic, 4k"
                  maxHeight={100}
                  disabled={mutation.isPending}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleGenerateClick();
                    }
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* DESKTOP: Show parameters inline */}
          <div className="hidden md:flex flex-grow justify-center">
            <DynamicParameters
              inputParameters={selectedModel.parameters}
              outputParameters={parameters}
              onValuesChange={handleParametersChange}
            />
          </div>
          {formError && (
            <div className="flex items-center gap-2 text-red-400 bg-red-900/50 p-2 rounded-xl mb-2 text-sm">
              <XCircle
                size={16}
                className="cursor-pointer hover:text-red-300"
                onClick={() => setFormError(null)}
              />
              <p>{formError}</p>
            </div>
          )}

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
        <button
          onClick={handleGenerateClick}
          disabled={mutation.isPending}
          className="px-6 rounded-3xl z-20 text-xl bg-accent/90 text-black font-black border-2 border-black flex items-center gap-2 disabled:bg-gray-500 disabled:cursor-not-allowed flex-shrink-0"
        >
          {mutation.isPending ? (
            <Loader2 className="animate-spin" />
          ) : (
            <Sparkles />
          )}
          <span className={mutation.isPending ? "hidden sm:inline" : "inline"}>
            {mutation.isPending ? "Generating..." : "Generate"}
          </span>
        </button>
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
              <div className="mb-6">
                <DynamicParameters
                  inputParameters={selectedModel.parameters}
                  outputParameters={parameters}
                  onValuesChange={handleParametersChange}
                />
              </div>
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
  );
};

export default InputBox;
