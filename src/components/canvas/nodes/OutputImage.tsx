import { Position, NodeProps, Node, useReactFlow, NodeToolbar } from "@xyflow/react";
import NodeLayout from "../NodeLayout";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { ArrowUp, Loader2, Copy, Check, AlertCircle } from "lucide-react";
import { TextShimmer } from "../../ui/text-shimmer";
import { Textarea } from "../../ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { useSyncUpstreamData, useUpstreamData } from "@/src/utils/xyflow";
import { InputBoxParameter, NodeParam } from "@/src/types/BaseType";
import { ModernCardLoader } from "@/src/components/ui/ModernCardLoader";
import { useGenerateCanvasImage } from "@/src/hooks/useGenerateCanvasImage";
import { useCanvas } from "../../providers/CanvasProvider";
import { ReplicateMemoizedOtherParameters } from "../../inputBox/ReplicateParameters";
import { useAtom } from "jotai";
import { selectedModelAtom } from "@/src/store/nodeAtoms";
import { RunninghubMemoizedOtherParameters } from "../../inputBox/RunninghubParameters";

export type OutputImageNodeData = {
  imageUrl?: string;
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

export type OutputImageNodeType = Node<OutputImageNodeData, "outputImage">;

const PLACEHOLDERS = [
  {
    url: "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/canvas/5daa4c31fc80f9fb0694d395998ee3b2.jpg",
    prompt: "An astronaut in a field of flowers",
  },
  {
    url: "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/canvas/8a17b1c1dcebb918050eb417b343e3fd.jpg",
    prompt: "A moody cyberpunk street at night",
  },
  {
    url: "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/canvas/138864f441bad71a9d5b496f044e76f5.jpg",
    prompt: "A portrait of a cyborg woman",
  },
  {
    url: "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/canvas/57dd0213ddcc344454fb198e24be2e66.jpg",
    prompt: "A portrait of a burning woman",
  },
];

const BASE_WIDTH = 450;
const EXPLICIT_IMAGE_PARAMS = new Set([
  "image_input",
  "image input",
  "input_image",
  "input_images",
  "style reference images",
  "style_reference_images",
  "image",
  "last_frame",
  "image prompt",
  "Image",
  "last_frame_image",
  "reference_images",
  "first_frame_image",
]);

const normalizeKey = (k: string) => k.replace(/\s+/g, "_").toLowerCase();
const isImageParam = (key: string) => EXPLICIT_IMAGE_PARAMS.has(key);

const OutputImage = React.memo(({ id, data, selected }: NodeProps<OutputImageNodeType>) => {
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
    if (data.imageUrl) return;
    const interval = setInterval(() => {
      setCurrentPlaceholder((prev) => (prev + 1) % PLACEHOLDERS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [data.imageUrl]);

  // --- RESIZE & ASPECT RATIO LOGIC START ---

  // 1. Determine dimensions strictly from Output if available, ignoring 'data.width' if it's an input param
  const aspectRatio = useMemo(() => {
    const outputImg = data.outputImages?.[0];

    // Priority 1: Generated Image Dimensions
    if (outputImg?.width && outputImg?.height) {
      return outputImg.height / outputImg.width;
    }

    // Priority 2: Use explicit width/height from data if available
    if (data.height && data.width) {
      return data.height / data.width;
    }

    // Priority 3: Default behavior
    // We assume standard portrait if we have an image but no metadata, or 1:1
    if (data.imageUrl) {
      return 1.0;
    }

    // Priority 4: Default Placeholder Aspect Ratio (Vertical for text area space)
    return 1.2;
  }, [data.outputImages, data.imageUrl, data.width, data.height]);

  const targetHeight = BASE_WIDTH * aspectRatio;

  // 2. Enforce Node Size
  useEffect(() => {
    // We only trigger update if the current stored dimensions differ significantly from target
    // We check `data.width` because React Flow usually syncs current node size back to data.width/height
    // depending on your onNodesChange setup. If not, we trust the calculation.

    const currentWidth = data.width;
    const currentHeight = data.height;

    const isSizeMismatch =
      !currentWidth ||
      !currentHeight ||
      Math.abs(currentWidth - BASE_WIDTH) > 1 ||
      Math.abs(currentHeight - targetHeight) > 1;

    // Only update if we have a generated image OR if it's the initialization phase
    // We don't want to constantly fight the user if they manually resized,
    // BUT we do want to snap to aspect ratio when an image is generated.
    if (isSizeMismatch) {
      // Check if this mismatch is due to a new generation
      if (data.imageUrl || !currentWidth) {
        updateNode(id, {
          width: BASE_WIDTH,
          height: targetHeight,
        });
      }
    }
  }, [aspectRatio, targetHeight, data.width, data.height, data.imageUrl, id, updateNode]);

  // --- RESIZE LOGIC END ---

  const inputImages = data.inputImageUrls || [];

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
        const imageKey = Object.keys(paramsDef).find((k) => isImageParam(k));
        if (imageKey) {
          const def = paramsDef[imageKey];
          if (def.type === "array") {
            imageParams[imageKey] = inputImages;
          } else {
            imageParams[imageKey] = inputImages[0];
          }
        }
      }

      parameters = {
        ...values,
        prompt: finalPrompt,
        ...imageParams,
      } as unknown as InputBoxParameter;

      if (inputImages.length === 0) {
        Object.keys(parameters).forEach((key) => {
          if (isImageParam(key) || isImageParam(normalizeKey(key))) {
            delete (parameters as Record<string, any>)[key];
          }
        });
      }
    }

    generateMutation.mutate(
      {
        canvasId: project?.id || "",
        parameters,
        modelName: selectedModel.model_name,
        modelIdentifier: selectedModel.identifier,
        modelCredit: typeof selectedModel.cost === "number" ? selectedModel.cost : 0,
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

  const isGenerating = !!data.activeJobId;

  return (
    <NodeLayout
      id={id}
      selected={selected}
      title={data.category || "Image generation"}
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
        {data.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={data.imageUrl}
            alt={data.prompt || "Generated Image"}
            className="object-fit h-full w-full rounded-3xl"
            draggable={false}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <AnimatePresence mode="popLayout">
              <motion.img
                key={currentPlaceholder}
                src={PLACEHOLDERS[currentPlaceholder].url}
                initial={{ opacity: 0, filter: "blur(8px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
                className="absolute inset-0 h-full w-full object-cover"
                alt="Placeholder"
              />
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/10" />
          </div>
        )}

        {data.imageUrl && (
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div
        className={`absolute bottom-0 left-0 right-0 p-3 transition-opacity duration-300 ${
          selected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
      >
        {inputImages.length > 0 && (
          <div className="scrollbar-hide relative z-10 mb-3 flex items-center gap-2 overflow-x-auto pb-1">
            {inputImages.map((url, index) => (
              <div
                key={index}
                className="relative shrink-0 overflow-hidden rounded-xl border border-white/20 bg-black/20 shadow-sm backdrop-blur-sm transition-transform hover:scale-105"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`Input ${index + 1}`} className="size-12 object-cover" />
              </div>
            ))}
          </div>
        )}

        {!data.imageUrl ? (
          <div className="relative w-full focus-within:outline-none focus-within:ring-0">
            {!data.prompt && (
              <div className="pointer-events-none absolute bottom-10 left-0 right-0 p-2">
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
        className={`absolute bottom-3 right-3 flex size-8 items-center justify-center rounded-full bg-accent text-black shadow-lg transition-all hover:scale-110 hover:shadow-xl ${selected || isGenerating ? "opacity-100" : "opacity-0"}`}
        onClick={handleGenerate}
        disabled={isGenerating}
      >
        {isGenerating ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <ArrowUp size={18} strokeWidth={3} />
        )}
      </button>
    </NodeLayout>
  );
});

OutputImage.displayName = "OutputImage";

export default OutputImage;
