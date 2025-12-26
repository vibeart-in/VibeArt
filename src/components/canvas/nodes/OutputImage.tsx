import { Position, NodeProps, Node, useReactFlow, NodeToolbar } from "@xyflow/react";
import NodeLayout from "../NodeLayout";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { ArrowUp, Loader2 } from "lucide-react";
import { TextShimmer } from "../../ui/text-shimmer";
import { Textarea } from "../../ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { useSyncUpstreamData } from "@/src/utils/xyflow";
import { useModelsByUsecase } from "@/src/hooks/useModelsByUsecase";
import { ConversationType, InputBoxParameter, ModelData, NodeParam } from "@/src/types/BaseType";
import { ModernCardLoader } from "@/src/components/ui/ModernCardLoader";
import { useGenerateCanvasImage } from "@/src/hooks/useGenerateCanvasImage";
import { useCanvas } from "../../providers/CanvasProvider";
import { MemoizedOtherParameters } from "../../inputBox/ReplicateParameters";
import { useAtom } from "jotai";
import { selectedModelAtom } from "@/src/store/nodeAtoms";

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

const OutputImage = React.memo(({ id, data, selected }: NodeProps<OutputImageNodeType>) => {
  const { updateNodeData, updateNode } = useReactFlow();

  useSyncUpstreamData(id, data);

  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);

  useEffect(() => {
    if (data.width && data.height) {
      const ratio = data.height / data.width;
      updateNode(id, {
        width: 320,
        height: 320 * ratio,
      });
    }
  }, [data.width, data.height, id, updateNode]);

  const { data: models } = useModelsByUsecase(ConversationType.GENERATE);
  const { project } = useCanvas();
  const generateMutation = useGenerateCanvasImage(project?.id || "");

  const [selectedModelName, setSelectedModelName] = useAtom(selectedModelAtom(id));

  // Sync data.model to atom on init
  useEffect(() => {
    if (data.model && !selectedModelName) {
      setSelectedModelName(data.model);
    }
  }, [data.model, selectedModelName, setSelectedModelName]);

  // Sync atom to data.model
  useEffect(() => {
    if (selectedModelName && selectedModelName !== data.model) {
      updateNodeData(id, { model: selectedModelName });
    }
  }, [selectedModelName, data.model, updateNodeData, id]);

  // Derive model strictly from the atom state
  const selectedModel = useMemo(() => {
    const targetName = selectedModelName;
    if (!targetName && models && models.length > 0) {
      return models.find((m) => m.model_name === (data.model || "Seedream 4 Fast")) || null;
    }
    return models?.find((m) => m.model_name === targetName) || null;
  }, [models, selectedModelName, data.model]);

  const normalizeKey = (k: string) => k.replace(/\s+/g, "_").toLowerCase();

  const initialValues = useMemo(() => {
    if (!selectedModel?.parameters) return {};
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
  }, [selectedModel?.parameters]);

  const [values, setValues] = useState<Record<string, any>>(initialValues);

  // Update values when model changes
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

  const BASE_WIDTH = 320;
  const aspectRatio = data.width && data.height ? data.height / data.width : 1.4;
  const nodeHeight = BASE_WIDTH * aspectRatio;
  const inputImages = data.inputImageUrls || [];

  const handleGenerate = () => {
    if (!data.prompt || !project?.id || !selectedModel) return;

    let parameters: InputBoxParameter = {};

    if (selectedModel.provider === "running_hub") {
      const schema = selectedModel.parameters as NodeParam[];
      const params: NodeParam[] = schema.map((p) => {
        const normalizedKey = normalizeKey(p.fieldName);

        if (p.fieldName === "prompt" || p.description === "prompt") {
          return {
            ...p,
            fieldValue: data.prompt || "",
          };
        }

        return {
          ...p,
          fieldValue: values[normalizedKey] !== undefined ? values[normalizedKey] : p.fieldValue,
        };
      });

      // Handle input images for running_hub
      if (inputImages.length > 0) {
        const imageParamIndex = params.findIndex(
          (p) =>
            (p.fieldName.toLowerCase().includes("image") ||
              p.description.toLowerCase().includes("image")) &&
            p.fieldName !== "prompt",
        );

        if (imageParamIndex !== -1) {
          params[imageParamIndex] = {
            ...params[imageParamIndex],
            fieldValue: inputImages[0],
          };
        }
      }

      parameters = params;
    } else {
      // For replicate and other providers, use values state
      parameters = {
        ...values,
        prompt: data.prompt,
        ...(inputImages.length > 0 ? { image_input: [inputImages[0]] } : {}),
      } as unknown as InputBoxParameter;
    }

    // Call mutation
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
  };

  function isImageParam(key: string, param: any) {
    const explicit = new Set([
      "image_input",
      "image input",
      "input_image",
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
    if (explicit.has(key)) return true;
  }

  // TODO: Implement parameter filtering when needed
  const imageInputKeys = useMemo(() => {
    return selectedModel?.parameters
      ? Object.keys(selectedModel.parameters).filter((k) =>
          isImageParam(k, selectedModel?.parameters[k]),
        )
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

  const handleChange = useCallback(
    (rawKey: string, value: any) => {
      const key = normalizeKey(rawKey);
      setValues((prev) => ({ ...prev, [key]: value }));
    },
    [], // stable
  );

  const isGenerating = !!data.activeJobId;

  return (
    <NodeLayout
      selected={selected}
      title={data.category || "Image generation"}
      subtitle={data?.model}
      minWidth={BASE_WIDTH}
      minHeight={nodeHeight}
      keepAspectRatio={true}
      className="flex h-full w-full cursor-default flex-col rounded-3xl bg-[#1D1D1D]"
      handles={[
        { type: "target", position: Position.Left },
        { type: "source", position: Position.Right },
      ]}
      toolbarType="generate"
    >
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
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/10" />
          </div>
        )}

        {/* Overlay gradient only if image exists */}
        {data.imageUrl && (
          <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-b from-transparent via-transparent to-black/30" />
        )}

        {isGenerating && <ModernCardLoader text={"Generating"} />}
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
              value={data.prompt || ""}
              onChange={(e) => {
                updateNodeData(id, { prompt: e.target.value });
              }}
            />
            {/* TODO: Re-enable when parameter filtering is implemented */}
            <MemoizedOtherParameters
              key={selectedModel?.model_name}
              otherEntries={otherEntries}
              values={values}
              handleChange={handleChange}
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
        {isGenerating ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <ArrowUp size={18} strokeWidth={3} />
        )}
      </button>
    </NodeLayout>
  );
});

export default OutputImage;
