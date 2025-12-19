import { Position, NodeProps, Node, useReactFlow } from "@xyflow/react";
import NodeLayout from "../NodeLayout";
import React, { useState, useEffect, useMemo } from "react";
import { ArrowUp, Loader2 } from "lucide-react";
import { TextShimmer } from "../../ui/text-shimmer";
import { Textarea } from "../../ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { useSyncUpstreamData } from "@/src/utils/xyflow";
import { useGenerateImage } from "@/src/hooks/useGenerateImage";
import { useModelsByUsecase } from "@/src/hooks/useModelsByUsecase";
import {
  ConversationType,
  InputBoxParameter,
  NodeParam,
} from "@/src/types/BaseType";
import { useConversationMessages } from "@/src/hooks/useConversationMessages";
import { AITextLoading } from "@/src/components/ui/ImageCardLoading";
import { ModernCardLoader } from "@/src/components/ui/ModernCardLoader";

export type OutputImageNodeData = {
  imageUrl?: string;
  prompt?: string;
  inputImageUrls?: string[];
  width?: number;
  height?: number;
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

const getLoadingMessage = (status: string) => {
  switch (status) {
    case "pending":
      return "Queued...";
    case "QUEUED":
      return "Higres-Generation...";
    case "starting":
      return "Starting...";
    case "processing":
      return "Generating...";
    case "RUNNING":
      return "Generating...";
    default:
      return "Loading...";
  }
};

export default function OutputImage({
  id,
  data,
  selected,
}: NodeProps<OutputImageNodeType>) {
  const { updateNodeData } = useReactFlow();

  useSyncUpstreamData(id, data);

  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);

  // --- Hooks for Generation ---
  // 1. Get models to find "Seedream 4 Fast"
  const { data: models } = useModelsByUsecase(ConversationType.GENERATE);

  // 2. Setup generation hook (ConversationType.GENERATE)
  // We don't pass conversationId here initially because we might be starting a new one.
  // Actually, if we have data.conversationId, we could pass it, but useGenerateImage
  // handles creating new ones if id is missing.
  const generateMutation = useGenerateImage(
    ConversationType.GENERATE,
    data.conversationId,
    { redirectOnSuccess: false },
  );

  // 3. Poll for messages if we have a conversationId
  const { data: messages } = useConversationMessages(data.conversationId || "");

  // Update node with generated image when it appears
  useEffect(() => {
    if (!messages || messages.length === 0) return;

    // Messages are usually sorted newest first or we check the latest
    // The hook returns conversationData[], usually ordered.
    // Let's look at the first one (most recent usually)
    const latestMsg = messages[0];

    // If we have output images and the job succeeded
    if (
      latestMsg?.job_status === "succeeded" &&
      latestMsg.output_images &&
      latestMsg.output_images.length > 0
    ) {
      const generatedUrl = latestMsg.output_images[0].imageUrl;
      // Only update if it's different to avoid loops
      if (generatedUrl !== data.imageUrl) {
        updateNodeData(id, { imageUrl: generatedUrl });
      }
    }
  }, [messages, data.imageUrl, id, updateNodeData]);

  useEffect(() => {
    if (data.imageUrl) return;
    const interval = setInterval(() => {
      setCurrentPlaceholder((prev) => (prev + 1) % PLACEHOLDERS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [data.imageUrl]);

  // Constants for sizing
  const BASE_WIDTH = 320;
  const aspectRatio = data.width && data.height ? data.height / data.width : 1.4;
  const nodeHeight = BASE_WIDTH * aspectRatio;

  // Derived state for the list view
  const inputImages = data.inputImageUrls || [];

  const handleGenerate = () => {
    if (!data.prompt) return;

    // Find default model
    const targetModelName = "Seedream 4 Fast";
    const model = models?.find((m) => m.model_name === targetModelName);

    if (!model) {
      console.error(`Model '${targetModelName}' not found.`);
      // Fallback to first model or alert user
      alert(`Model ${targetModelName} not found. Please try again later.`);
      return;
    }

    // Prepare parameters based on model provider
    let parameters: InputBoxParameter = {};

    if (model.provider === "running_hub") {
      

      const schema = model.parameters as NodeParam[];
      // Clone schema to params
      const params: NodeParam[] = schema.map((p) => ({
        ...p,
        fieldValue:
          p.fieldName === "prompt" || p.description === "prompt"
            ? data.prompt || ""
            : p.fieldValue, // default
      }));

      // Look for input image field if we have an input image
      if (inputImages.length > 0) {
        const imageParamIndex = params.findIndex(
           (p) => (p.fieldName.toLowerCase().includes("image") || p.description.toLowerCase().includes("image")) && p.fieldName !== "prompt"
        );
        
        if (imageParamIndex !== -1) {
           params[imageParamIndex] = {
             ...params[imageParamIndex],
             fieldValue: inputImages[0]
           };
        }
      }

      parameters = params;
    } else {
      // Replicate case: Record<string, any>
      const defaults = (typeof model.parameters === "object" && !Array.isArray(model.parameters))
        ? Object.entries(model.parameters).reduce((acc, [key, val]) => {
            // @ts-ignore
            if (val.default !== undefined) acc[key] = val.default;
            return acc;
          }, {} as Record<string, any>)
        : {};

      parameters = {
        ...defaults,
        prompt: data.prompt,
        aspect_ratio: inputImages.length > 0 ? "match_input_image" : defaults.aspect_ratio || "1:1",
        ...(inputImages.length > 0 ? { "image_input": [inputImages[0]] } : {}),
      } as unknown as InputBoxParameter;
    }

    // Call mutation
    generateMutation.mutate(
      {
        parameters,
        // conversationId: data.conversationId, // Optional: continue conversation if exists
        modelName: model.model_name,
        modelIdentifier: model.identifier,
        modelCredit: typeof model.cost === "number" ? model.cost : 0, // Simplified credit handling
        modelProvider: model.provider,
        conversationType: ConversationType.GENERATE,
        inputImagePermanentPaths: inputImages,
      },
      {
        onSuccess: (res) => {
          if (res.conversationId) {
            updateNodeData(id, { conversationId: res.conversationId });
          }
        },
        onError: (err) => {
          console.error("Generation failed:", err);
          alert("Generation failed: " + err.message);
        },
      },
    );
  };

  const isGenerating =
    generateMutation.isPending || (messages && (messages[0]?.job_status === "RUNNING" || messages[0]?.job_status === "processing" || messages[0]?.job_status === "starting" || messages[0]?.job_status === "QUEUED" || messages[0]?.job_status === "pending"));

  const jobStatus = messages?.[0]?.job_status || "processing";
  const loadingText = getLoadingMessage(jobStatus);

  return (
    <NodeLayout
      selected={selected}
      title={data.category || "Image generation"}
      subtitle={data?.model}
      minWidth={BASE_WIDTH}
      minHeight={nodeHeight}
      className="flex h-full w-full cursor-default flex-col rounded-3xl bg-[#1D1D1D]"
      style={{
        width: `${BASE_WIDTH}px`,
        height: `${nodeHeight}px`,
      }}
      handles={[
        { type: "target", position: Position.Left },
        { type: "source", position: Position.Right },
      ]}
    >
      {/* Background Image Area */}
      <div className="relative h-full w-full flex-1 overflow-hidden rounded-3xl">
        {data.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={data.imageUrl}
            alt={data.prompt || "Generated Image"}
            className="h-full w-full rounded-3xl object-cover"
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
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/40" />
          </div>
        )}

        {/* Overlay gradient only if image exists */}
        {data.imageUrl && (
          <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-b from-transparent via-transparent to-black/80" />
        )}

        {/* Modern Loading Overlay */}
        {isGenerating && <ModernCardLoader text={loadingText} />}
      </div>

      {/* Footer Area */}
      <div className="absolute bottom-0 left-0 right-0 p-3">
        {/* Input Images List */}
        {inputImages.length > 0 && (
          <div className="scrollbar-hide relative z-10 mb-3 flex items-center gap-2 overflow-x-auto pb-1">
            {inputImages.map((url, index) => (
              <div
                key={index}
                className="relative shrink-0 overflow-hidden rounded-xl border border-white/20 bg-black/20 shadow-sm backdrop-blur-sm transition-transform hover:scale-105"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`Input ${index + 1}`}
                  className="size-12 object-cover"
                />
              </div>
            ))}
          </div>
        )}

        {/* Text Area / Prompt */}
        {!data.imageUrl ? (
          <div className="relative w-full focus-within:outline-none focus-within:ring-0">
            {!data.prompt && (
              <div className="pointer-events-none absolute bottom-0 left-0 right-0 p-2">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentPlaceholder}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <TextShimmer
                      className="font-medium"
                      spread={3}
                      duration={2}
                    >
                      {`Try "${PLACEHOLDERS[currentPlaceholder].prompt}"`}
                    </TextShimmer>
                  </motion.div>
                </AnimatePresence>
              </div>
            )}
            {/* Note: We don't need `updateNodeData` here manually if we want strictly 1-way sync, 
                but usually we want 2-way for text. 
                Since `useSyncUpstreamData` checks equality, it won't overwrite your typing 
                unless the upstream node changes specifically. */}
            <Textarea
              maxHeight={150}
              className="nodrag !border-0 text-sm font-medium text-white/90 !shadow-none !outline-none !ring-0 focus:!shadow-none focus:!outline-none focus:!ring-0 focus-visible:ring-0"
              value={data.prompt || ""}
              onChange={(e) => {
                updateNodeData(id, { prompt: e.target.value });
              }}
            />
          </div>
        ) : (
          <p className="line-clamp-3 text-[15px] font-light leading-relaxed text-white/90 drop-shadow-sm">
            {data.prompt}
          </p>
        )}
      </div>

      <button
        className={`absolute bottom-3 right-3 flex size-8 items-center justify-center rounded-full bg-accent text-black shadow-lg transition-all hover:scale-110 hover:shadow-xl ${selected || isGenerating ? "opacity-100" : "opacity-0"}`}
        onClick={handleGenerate}
        disabled={isGenerating}
      >
        {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <ArrowUp size={18} strokeWidth={3} />}
      </button>
    </NodeLayout>
  );
}
