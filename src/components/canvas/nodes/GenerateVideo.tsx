import { Position, NodeProps, Node, useReactFlow } from "@xyflow/react";
import { motion, AnimatePresence } from "framer-motion";
import { useAtom } from "jotai";
import { ArrowUp, Loader2, Copy, Check, AlertCircle, RotateCcw, Maximize2 } from "lucide-react";
import React, { useState, useEffect, useMemo, useCallback } from "react";

import { ModernCardLoader } from "@/src/components/ui/ModernCardLoader";
import { useGenerateCanvasImage } from "@/src/hooks/useGenerateCanvasImage";
import { selectedModelAtom } from "@/src/store/nodeAtoms";
import { InputBoxParameter, NodeParam } from "@/src/types/BaseType";
import { useSyncUpstreamData, useUpstreamData } from "@/src/utils/xyflow";
import { evaluateCreditsFromModelParams } from "@/src/utils/client/credits-evaluator";

import { ReplicateMemoizedOtherParameters } from "../../inputBox/ReplicateParameters";
import { RunninghubMemoizedOtherParameters } from "../../inputBox/RunninghubParameters";
import { useCanvas } from "../../providers/CanvasProvider";
import { TextShimmer } from "../../ui/text-shimmer";
import { Textarea } from "../../ui/textarea";
import { Dialog, DialogContent, DialogTitle } from "../../ui/dotted-dialog";
import NodeLayout from "../NodeLayout";

export type GenerateVideoNodeData = {
  imageUrl?: string;
  videoUrl?: string; // Primary video URL
  prompt?: string;
  stylePrompt?: string; // Hidden style prompt
  inputImageUrls?: string[];
  width?: number; // Note: This might be node width OR image width depending on upstream
  height?: number;
  outputImages?: { width: number; height: number; url: string }[];
  category?: string;
  model?: string;
  conversationId?: string;
  [key: string]: unknown;
};

export type GenerateVideoNodeType = Node<GenerateVideoNodeData, "generateVideo">;

const PLACEHOLDERS = [
  {
    url: "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/video/431008626864462037.mp4",
    prompt: "An astronaut in a field of flowers",
  },
  {
    url: "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/video/620230179975333151.mp4",
    prompt: "A moody cyberpunk street at night",
  },
  {
    url: "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/video/620230179976969272.mp4",
    prompt: "A moody cyberpunk street at night",
  },
  {
    url: "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/video/620230179977407426.mp4",
    prompt: "A moody cyberpunk street at night",
  },
];

const BASE_WIDTH = 450;

// First frame / input image parameters
const FIRST_FRAME_PARAMS = new Set([
  "image_input",
  "image input",
  "input_image",
  "style reference images",
  "style_reference_images",
  "image",
  "image prompt",
  "Image",
  "reference_images",
  "first_frame_image",
  "first_frame",
  "start_image",
]);

// Last frame / end frame parameters
const LAST_FRAME_PARAMS = new Set([
  "last_frame",
  "last_frame_image",
  "end_frame",
  "end_image",
  "end_frame_image",
  "final_frame",
]);

// Combined set for checking if a parameter is any image type
const ALL_IMAGE_PARAMS = new Set([...FIRST_FRAME_PARAMS, ...LAST_FRAME_PARAMS]);

const normalizeKey = (k: string) => k.replace(/\s+/g, "_").toLowerCase();
const isImageParam = (key: string) => ALL_IMAGE_PARAMS.has(key);
const isFirstFrameParam = (key: string) => FIRST_FRAME_PARAMS.has(key);
const isLastFrameParam = (key: string) => LAST_FRAME_PARAMS.has(key);

const GenerateVideo = React.memo(({ id, data, selected }: NodeProps<GenerateVideoNodeType>) => {
  const { updateNodeData, updateNode } = useReactFlow();

  useSyncUpstreamData(id, data);
  const { stylePrompt } = useUpstreamData("target");

  useEffect(() => {
    if (stylePrompt !== data.stylePrompt) {
      updateNodeData(id, { stylePrompt });
    }
  }, [stylePrompt, data.stylePrompt, id, updateNodeData]);

  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);
  const [prompt, setPrompt] = useState(data.prompt || "");
  const [isCopied, setIsCopied] = useState(false);
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);

  // Sync prop to state
  useEffect(() => {
    if (data.prompt !== prompt) {
      setPrompt(data.prompt || "");
    }
  }, [data.prompt]);

  // Debounce prompt updates
  useEffect(() => {
    const timer = setTimeout(() => {
      if (prompt !== data.prompt) {
        updateNodeData(id, { prompt });
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [prompt, id, updateNodeData, data.prompt]);

  const { project } = useCanvas();
  const generateMutation = useGenerateCanvasImage(project?.id || "");
  const [selectedModel] = useAtom(selectedModelAtom(id));

  // Variable pricing states
  const [isComputingCredits, setIsComputingCredits] = useState(false);
  const [computedCreditCost, setComputedCreditCost] = useState<number | null>(null);

  // Sync atom to data.model
  useEffect(() => {
    if (selectedModel && selectedModel.model_name !== data.model) {
      updateNodeData(id, { model: selectedModel.model_name });
    }
  }, [selectedModel, data.model, updateNodeData, id]);

  // --- Parameter Initialization Logic (Unchanged) ---
  const initialValues = useMemo(() => {
    if (!selectedModel?.parameters) return {};
    if (selectedModel.provider === "running_hub" && Array.isArray(selectedModel.parameters)) {
      return selectedModel.parameters;
    }
    const out: Record<string, any> = {};
    for (const [key, param] of Object.entries(selectedModel.parameters)) {
      const nk = normalizeKey(key);
      if (param.default !== undefined) out[nk] = param.default;
      else if (param.type === "boolean") out[nk] = false;
      else if (param.enum) out[nk] = param.enum[0];
      else if (param.type === "integer") out[nk] = param.minimum ?? 0;
      else out[nk] = "";
    }
    return out;
  }, [selectedModel?.parameters, selectedModel?.provider]);

  const [values, setValues] = useState<any>(initialValues);

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  useEffect(() => {
    if (data.videoUrl || data.imageUrl) return;
    const interval = setInterval(() => {
      setCurrentPlaceholder((prev) => (prev + 1) % PLACEHOLDERS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [data.videoUrl, data.imageUrl]);

  // --- RESIZE & ASPECT RATIO LOGIC START ---

  // Simple aspect ratio: use generated video dimensions if available, otherwise default
  const aspectRatio = useMemo(() => {
    const outputImg = data.outputImages?.[0];

    if (outputImg?.width && outputImg?.height) {
      return outputImg.height / outputImg.width;
    }

    // Default aspect ratio for placeholder
    return 0.7;
  }, [data.outputImages]);

  const targetHeight = BASE_WIDTH * aspectRatio;

  // Update node size only when a new video is generated
  useEffect(() => {
    if (data.outputImages?.[0]) {
      updateNode(id, {
        width: BASE_WIDTH,
        height: targetHeight,
      });
    }
  }, [data.outputImages, targetHeight, id, updateNode]);

  // --- RESIZE LOGIC END ---

  const inputImages = data.inputImageUrls || [];

  // Compute credits when parameters change (for variable pricing models)
  useEffect(() => {
    if (!selectedModel?.is_variable_price || !selectedModel.pricing_parameters) {
      setComputedCreditCost(null);
      return;
    }

    try {
      const creditParams =
        typeof selectedModel.pricing_parameters === "string"
          ? JSON.parse(selectedModel.pricing_parameters)
          : selectedModel.pricing_parameters;

      const result = evaluateCreditsFromModelParams(creditParams, values);
      setComputedCreditCost(result.credits ?? null);
    } catch (err) {
      console.error("Failed to compute credits:", err);
      setComputedCreditCost(null);
    }
  }, [selectedModel, values]);

  const displayCreditCost = selectedModel?.is_variable_price
    ? computedCreditCost
    : selectedModel?.cost;

  const handleGenerate = useCallback(() => {
    if ((!prompt && !data.stylePrompt) || !project?.id || !selectedModel) return;

    // Combine visible prompt with hidden style prompt
    const finalPrompt = [prompt, data.stylePrompt].filter(Boolean).join(" ");

    let parameters: InputBoxParameter = {};

    if (selectedModel.provider === "running_hub") {
      let params: NodeParam[] = Array.isArray(values) ? [...values] : [];
      if (params.length === 0 && Array.isArray(selectedModel.parameters)) {
        params = [...selectedModel.parameters];
      }
      params = params.map((p) => {
        if (p.fieldName === "prompt" || p.description === "prompt") {
          return { ...p, fieldValue: finalPrompt || "" };
        }
        return p;
      });

      if (inputImages.length > 0) {
        const imageParamIndex = params.findIndex(
          (p) => isImageParam(p.fieldName) || isImageParam(p.description || ""),
        );
        if (imageParamIndex !== -1) {
          params[imageParamIndex] = { ...params[imageParamIndex], fieldValue: inputImages[0] };
        }
      }
      parameters = params;
    } else {
      const imageParams: Record<string, any> = {};
      const paramsDef = selectedModel?.parameters;

      if (inputImages.length > 0 && paramsDef && !Array.isArray(paramsDef)) {
        // Handle multiple image parameters with proper ordering
        // First, find first frame parameter
        const firstFrameKey = Object.keys(paramsDef).find((k) => isFirstFrameParam(k));
        // Then, find last frame parameter
        const lastFrameKey = Object.keys(paramsDef).find((k) => isLastFrameParam(k));

        let imageIndex = 0;

        // Assign first image to first frame parameter
        if (firstFrameKey && imageIndex < inputImages.length) {
          const def = paramsDef[firstFrameKey];
          if (def.type === "array") {
            // If it's an array type, assign all images
            imageParams[firstFrameKey] = inputImages;
            imageIndex = inputImages.length;
          } else {
            // Single image
            imageParams[firstFrameKey] = inputImages[imageIndex];
            imageIndex++;
          }
        }

        // Assign second image to last frame parameter (if exists)
        if (lastFrameKey && imageIndex < inputImages.length) {
          imageParams[lastFrameKey] = inputImages[imageIndex];
          imageIndex++;
        }

        // Handle any remaining image parameters (fallback for other image types)
        Object.keys(paramsDef).forEach((k) => {
          if (
            isImageParam(k) &&
            !imageParams[k] &&
            imageIndex < inputImages.length &&
            !isFirstFrameParam(k) &&
            !isLastFrameParam(k)
          ) {
            const def = paramsDef[k];
            if (def.type === "array") {
              imageParams[k] = inputImages.slice(imageIndex);
              imageIndex = inputImages.length;
            } else {
              imageParams[k] = inputImages[imageIndex];
              imageIndex++;
            }
          }
        });
      }

      parameters = {
        ...values,
        prompt: finalPrompt,
        ...imageParams,
      } as unknown as InputBoxParameter;

      // Type conversion and validation for Replicate parameters
      if (paramsDef && !Array.isArray(paramsDef)) {
        Object.keys(parameters).forEach((key) => {
          const param = paramsDef[key];
          const value = (parameters as Record<string, any>)[key];

          if (param) {
            // Convert integer types
            if (param.type === "integer" && value !== null && value !== undefined) {
              (parameters as Record<string, any>)[key] = parseInt(String(value), 10);
            }
            // Convert number types
            else if (param.type === "number" && value !== null && value !== undefined) {
              (parameters as Record<string, any>)[key] = parseFloat(String(value));
            }
            // Validate and clean up URI format parameters (image parameters)
            else if (param.format === "uri") {
              // If value is empty, null, undefined, or not a valid string, remove the parameter entirely
              if (!value || typeof value !== "string" || value.trim() === "") {
                delete (parameters as Record<string, any>)[key];
              }
            }
          }
        });
      }

      // Remove empty or null image parameters (additional cleanup)
      Object.keys(parameters).forEach((key) => {
        const value = (parameters as Record<string, any>)[key];
        if (isImageParam(key) || isImageParam(normalizeKey(key))) {
          // Remove if null, undefined, empty string, or empty array
          if (
            value === null ||
            value === undefined ||
            value === "" ||
            (Array.isArray(value) && value.length === 0)
          ) {
            delete (parameters as Record<string, any>)[key];
          }
        }
      });
    }

    // Compute credits for variable pricing models
    let modelCredit = typeof selectedModel.cost === "number" ? selectedModel.cost : 0;

    if (selectedModel.is_variable_price && selectedModel.pricing_parameters) {
      setIsComputingCredits(true);
      try {
        const creditParams =
          typeof selectedModel.pricing_parameters === "string"
            ? JSON.parse(selectedModel.pricing_parameters)
            : selectedModel.pricing_parameters;

        const result = evaluateCreditsFromModelParams(creditParams, parameters);
        modelCredit = result.credits ?? modelCredit;
      } catch (err: any) {
        console.error("Failed to compute credits:", err);
      } finally {
        setIsComputingCredits(false);
      }
    }

    generateMutation.mutate(
      {
        canvasId: project?.id || "",
        parameters,
        modelName: selectedModel.model_name,
        modelIdentifier: selectedModel.identifier,
        modelCredit,
        modelProvider: selectedModel.provider,
      },
      {
        onSuccess: (res) => {
          updateNodeData(id, { activeJobId: res.jobId, status: "starting" });
        },
      },
    );
  }, [
    prompt,
    data.stylePrompt,
    project?.id,
    selectedModel,
    values,
    inputImages,
    generateMutation,
    updateNodeData,
    id,
  ]);

  const imageInputKeys = useMemo(() => {
    return selectedModel?.parameters
      ? Object.keys(selectedModel.parameters).filter((k) => isImageParam(k))
      : [];
  }, [selectedModel]);

  const otherEntries = useMemo(
    () =>
      selectedModel?.parameters
        ? Object.entries(selectedModel.parameters).filter(([k]) => {
            return !imageInputKeys.includes(k) && k !== "prompt";
          })
        : [],
    [selectedModel, imageInputKeys],
  );

  const otherParams = useMemo(() => {
    if (selectedModel?.provider === "running_hub") {
      if (Array.isArray(values)) {
        return values.filter(
          (p: NodeParam) => p.description !== "prompt" && p.fieldName !== "image",
        );
      }
      if (Array.isArray(selectedModel.parameters)) {
        return selectedModel.parameters.filter(
          (p) => p.description !== "prompt" && p.fieldName !== "image",
        );
      }
    }
    return [];
  }, [selectedModel, values]);

  const handleReplicateChange = useCallback((rawKey: string, value: any) => {
    const key = normalizeKey(rawKey);
    setValues((prev: Record<string, any>) => ({ ...prev, [key]: value }));
  }, []);

  const handleRunninghubChange = useCallback((description: string, newFieldValue: any) => {
    setValues((currentParams: any) => {
      if (Array.isArray(currentParams)) {
        return currentParams.map((param: NodeParam) =>
          param.description === description
            ? { ...param, fieldValue: String(newFieldValue ?? "") }
            : param,
        );
      }
      return currentParams;
    });
  }, []);

  const handleReset = useCallback(() => {
    // Reset to default state while preserving prompt and connections
    updateNodeData(id, {
      videoUrl: undefined,
      imageUrl: undefined,
      outputImages: undefined,
      activeJobId: undefined,
      status: undefined,
      conversationId: undefined,
      // Keep: prompt, stylePrompt, inputImageUrls, model, category, width, height
    });
  }, [id, updateNodeData]);

  const isGenerating = !!data.activeJobId;
  const showResetButton =
    (data.videoUrl || data.imageUrl || data.status === "failed") && (selected || isGenerating);

  return (
    <NodeLayout
      id={id}
      selected={selected}
      title={data.category || "Video generation"}
      subtitle={data?.model}
      minWidth={BASE_WIDTH}
      minHeight={targetHeight}
      keepAspectRatio={true}
      className="flex h-full w-full cursor-default flex-col rounded-3xl bg-[#1D1D1D]"
      handles={[
        { type: "target", position: Position.Left },
        { type: "source", position: Position.Right },
      ]}
      toolbarType="generate"
      initialModel={data.model}
    >
      {/* 
         We ensure this container has a minimum height so placeholders show up 
         immediately, even if the NodeLayout hasn't fully expanded yet.
      */}
      <div
        className="relative h-full w-full flex-1 overflow-hidden rounded-3xl"
        // style={{ minHeight: "300px" }}
      >
        {data.videoUrl || data.imageUrl ? (
          <video
            src={data.videoUrl || data.imageUrl}
            className="h-full w-full rounded-3xl object-cover"
            autoPlay
            loop
            muted
            playsInline
            controls={false}
            crossOrigin="anonymous"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <AnimatePresence mode="popLayout">
              <motion.video
                key={currentPlaceholder}
                src={PLACEHOLDERS[currentPlaceholder].url}
                initial={{ opacity: 0, filter: "blur(8px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
                className="absolute inset-0 h-full w-full object-cover"
                autoPlay
                loop
                muted
                playsInline
                crossOrigin="anonymous"
              />
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/10" />
          </div>
        )}

        {(data.videoUrl || data.imageUrl) && (
          <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-b from-transparent via-transparent to-black/30" />
        )}

        {isGenerating && <ModernCardLoader text={"Generating"} />}
        <AnimatePresence>
          {data.status === "failed" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-black/40 backdrop-blur-md"
            >
              <div className="flex size-12 items-center justify-center rounded-full bg-red-500/20 text-red-500 ring-1 ring-red-500/50">
                <AlertCircle size={24} />
              </div>
              <div className="px-6 text-center">
                <h3 className="text-sm font-semibold text-white">Generation Failed</h3>
                <p className="mt-1 text-xs text-white/60">
                  Something went wrong. Please try again.
                </p>
              </div>
              <button
                className="mt-2 flex items-center justify-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white shadow-lg backdrop-blur-sm transition-all hover:scale-105 hover:bg-white/20 hover:shadow-xl"
                onClick={handleReset}
                title="Retry generation"
              >
                <RotateCcw size={16} />
                Retry
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reset Button */}
        {showResetButton && (
          <>
            <button
              className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-black/40 text-white/70 shadow-lg backdrop-blur-sm transition-all hover:scale-110 hover:bg-black/60 hover:text-white hover:shadow-xl"
              onClick={() => setIsVideoDialogOpen(true)}
              title="Open video in fullscreen"
            >
              <Maximize2 size={16} />
            </button>
            <button
              className="absolute left-3 top-3 flex size-8 items-center justify-center rounded-full bg-black/40 text-white/70 shadow-lg backdrop-blur-sm transition-all hover:scale-110 hover:bg-black/60 hover:text-white hover:shadow-xl"
              onClick={handleReset}
              title="Reset to generate state"
            >
              <RotateCcw size={16} />
            </button>
          </>
        )}
      </div>

      <div
        className={`absolute bottom-0 left-0 right-0 p-3 transition-opacity duration-300 ${
          selected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
      >
        {/* Info message for image connections */}
        {selected &&
          inputImages.length === 0 &&
          selectedModel?.parameters &&
          !Array.isArray(selectedModel.parameters) &&
          (() => {
            const hasFirstFrame = Object.keys(selectedModel.parameters).some((k) =>
              isFirstFrameParam(k),
            );
            const hasLastFrame = Object.keys(selectedModel.parameters).some((k) =>
              isLastFrameParam(k),
            );

            if (hasFirstFrame || hasLastFrame) {
              return (
                <div className="mb-3 flex items-start gap-2 rounded-lg bg-blue-500/10 p-2 text-xs text-blue-300 backdrop-blur-sm">
                  <svg
                    className="mt-0.5 size-4 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>
                    Connect images from the left:
                    {hasFirstFrame && " First image = first frame"}
                    {hasFirstFrame && hasLastFrame && ","}
                    {hasLastFrame && " Second image = last frame"}
                  </span>
                </div>
              );
            }
            return null;
          })()}

        {inputImages.length > 0 && (
          <div className="scrollbar-hide relative z-10 mb-3 flex items-center gap-2 overflow-x-auto pb-1">
            {inputImages.map((url, index) => {
              // Determine label based on parameter availability
              const paramsDef = selectedModel?.parameters;
              const hasFirstFrame =
                paramsDef &&
                !Array.isArray(paramsDef) &&
                Object.keys(paramsDef).some((k) => isFirstFrameParam(k));
              const hasLastFrame =
                paramsDef &&
                !Array.isArray(paramsDef) &&
                Object.keys(paramsDef).some((k) => isLastFrameParam(k));

              let label = "";
              if (hasFirstFrame && hasLastFrame) {
                label = index === 0 ? "First Frame" : "Last Frame";
              } else if (hasFirstFrame) {
                label = "First Frame";
              } else if (hasLastFrame) {
                label = "Last Frame";
              }

              return (
                <div
                  key={index}
                  className="relative shrink-0 overflow-hidden rounded-xl border border-white/20 bg-black/20 shadow-sm backdrop-blur-sm transition-transform hover:scale-105"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`Input ${index + 1}`} className="size-12 object-cover" />
                  {label && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-1 py-0.5 text-center text-[8px] font-semibold text-white">
                      {label}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {!(data.videoUrl || data.imageUrl) ? (
          <div className="relative w-full focus-within:outline-none focus-within:ring-0">
            {!data.prompt && (
              <div className="pointer-events-none absolute left-0 right-0 p-2">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentPlaceholder}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <TextShimmer className="font-medium" spread={3} duration={2}>
                      {`Try "${PLACEHOLDERS[currentPlaceholder].prompt}"`}
                    </TextShimmer>
                  </motion.div>
                </AnimatePresence>
              </div>
            )}
            <Textarea
              maxHeight={150}
              className="nodrag !border-0 text-sm font-medium text-white/90 !shadow-none !outline-none !ring-0 focus:!shadow-none focus:!outline-none focus:!ring-0 focus-visible:ring-0"
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value);
              }}
            />

            {selectedModel?.provider === "replicate" && (
              <ReplicateMemoizedOtherParameters
                key={selectedModel?.id}
                otherEntries={otherEntries}
                values={values}
                handleChange={handleReplicateChange}
              />
            )}

            {selectedModel?.provider === "running_hub" && (
              <RunninghubMemoizedOtherParameters
                key={selectedModel?.id}
                otherParams={otherParams}
                values={values}
                handleChange={handleRunninghubChange}
              />
            )}
          </div>
        ) : (
          <div className="group/prompt relative">
            <p className="line-clamp-3 text-[15px] font-light leading-relaxed text-white/90 drop-shadow-sm">
              {data.prompt}
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (data.prompt) {
                  navigator.clipboard.writeText(data.prompt);
                  setIsCopied(true);
                  setTimeout(() => setIsCopied(false), 2000);
                }
              }}
              className="absolute -top-1 right-10 opacity-0 transition-opacity group-hover/prompt:opacity-100"
            >
              <div className="rounded-md bg-black/40 p-1.5 backdrop-blur-sm transition-colors hover:bg-black/60">
                {isCopied ? (
                  <Check className="size-3 text-green-400" />
                ) : (
                  <Copy className="size-3 text-white/70" />
                )}
              </div>
            </button>
          </div>
        )}
      </div>

      <button
        className={`absolute bottom-3 right-3 flex items-center justify-center gap-1.5 rounded-full bg-accent px-3 py-2 text-black shadow-lg transition-all hover:scale-105 hover:shadow-xl ${selected || isGenerating ? "opacity-100" : "opacity-0"}`}
        onClick={handleGenerate}
        disabled={isGenerating || isComputingCredits}
      >
        {isGenerating ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <>
            <ArrowUp size={16} strokeWidth={2.5} />
            {displayCreditCost !== null && displayCreditCost !== undefined && (
              <span className="text-xs font-semibold">
                {isComputingCredits ? "..." : displayCreditCost}
              </span>
            )}
          </>
        )}
      </button>

      {/* Video Dialog Modal */}
      <Dialog open={isVideoDialogOpen} onOpenChange={setIsVideoDialogOpen}>
        <DialogContent className="max-w-5xl p-0">
          <DialogTitle className="sr-only">Video Player</DialogTitle>
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black">
            {(data.videoUrl || data.imageUrl) && (
              <video
                src={data.videoUrl || data.imageUrl}
                className="h-full w-full object-contain"
                controls
                autoPlay
                loop
                playsInline
                crossOrigin="anonymous"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </NodeLayout>
  );
});

GenerateVideo.displayName = "GenerateVideo";

export default GenerateVideo;
