import { DotsThreeVerticalIcon, MinusCircleIcon } from "@phosphor-icons/react";
import { IconAspectRatio, IconTerminal } from "@tabler/icons-react";
import { DicesIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";

import { ConversationType, ModelData, NodeParam, PresetData } from "@/src/types/BaseType";
import { getRandomPromptForModel } from "@/src/utils/client/prompts";
import { getIconForParam } from "@/src/utils/server/utils";

import ModelSelectModal from "./ModelSelectModal";
import PresetModal from "./PresetModal";
import { ImageObject } from "./ReplicateParameters";
import AnimatedCounter from "../ui/AnimatedCounter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import ImageUploadBox from "../ui/ImageUploadBox";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Switch } from "../ui/switch";
import { Textarea } from "../ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { SparkleIcon } from "@phosphor-icons/react";

interface RunninghubParametersProps {
  parameters: NodeParam[];
  modelName?: string;
  identifier?: string;
}

export interface RunninghubParametersHandle {
  getValues: () => {
    values: NodeParam[];
    inputImages: string[];
    currentImage?: ImageObject | null;
    allImageObjects?: ImageObject[];
    selectedPreset?: PresetData | null;
  };
  clearPrompt: () => void;
}

// ============================================================================
// 1. EXTRACTED COMPONENT for parameters that don't change on prompt typing
// ============================================================================
const OtherParameters = ({
  otherParams,
  handleChange,
  showNegativePrompt,
  setShowNegativePrompt,
  hasNegativePromptParam,
  enableLoraStrength,
  setEnableLoraStrength,
  hasLoraStrengthParam,
}: any) => {
  return (
    <div className="flex w-fit flex-wrap items-center gap-2">
      {otherParams.map((param: NodeParam) => {
        const key = `${param.description}`;

        if (
          (param.fieldName === "aspect_ratio" ||
            param.fieldName === "size" ||
            param.fieldName === "model" ||
            param.fieldName === "model_selected" ||
            param.description === "aspect_ratio") &&
          param.fieldData
        ) {
          let options: string[] = [];
          try {
            options = JSON.parse(param.fieldData)[0];
          } catch (e) {
            console.error("Failed to parse fieldData:", e);
          }
          return (
            <Tooltip key={key}>
              <TooltipTrigger asChild>
                <div className="min-w-[130px]">
                  <Select value={param.fieldValue} onValueChange={(val) => handleChange(key, val)}>
                    <SelectTrigger className="w-full">
                      {param.fieldName !== "aspect_ratio" &&
                        param.description !== "aspect_ratio" &&
                        getIconForParam(param.description ?? key)}
                      <SelectValue placeholder={param.description} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {options.map((opt) => {
                          const isAspect =
                            param.fieldName === "aspect_ratio" ||
                            param.description === "aspect_ratio";

                          // Detect ratio-like options (e.g. "16:9")
                          const ratioRegex = /^\d+:\d+$/;
                          const isRatio = ratioRegex.test(opt);

                          let preview = null;

                          if (isAspect) {
                            if (isRatio) {
                              // Numeric aspect ratio visualization
                              const [w, h] = opt.split(":").map(Number);
                              const aspectRatio = w / h;
                              const baseHeight = 15;
                              const previewWidth = baseHeight * aspectRatio;

                              preview = (
                                <div
                                  className="flex-shrink-0 rounded-sm border border-gray-400 bg-muted"
                                  style={{
                                    width: `${previewWidth}px`,
                                    height: `${baseHeight}px`,
                                  }}
                                />
                              );
                            } else {
                              // Non-ratio text options like "match_input_image" or "auto"
                              preview = <IconAspectRatio size={15} />;
                            }
                          }

                          return (
                            <SelectItem key={opt} value={opt}>
                              <div className="flex items-center gap-2">
                                {preview}
                                <span className="text-sm">{opt}</span>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{param.description || param.fieldName}</p>
              </TooltipContent>
            </Tooltip>
          );
        }

        if (
          param.fieldName === "boolean" ||
          param.fieldValue === "true" ||
          param.fieldValue === "false"
        ) {
          return (
            <Tooltip key={key}>
              <TooltipTrigger asChild>
                <div className="flex h-full flex-col justify-between gap-2 py-2">
                  <Switch
                    checked={param.fieldValue === "true"}
                    onCheckedChange={(value) => handleChange(key, value ? "true" : "false")}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{param.description}</p>
              </TooltipContent>
            </Tooltip>
          );
        }

        if (param.fieldName === "active_weight") {
          return (
            <Tooltip key={key}>
              <TooltipTrigger asChild>
                <div>
                  <AnimatedCounter
                    initialValue={Number(param.fieldValue)}
                    min={50}
                    max={900}
                    incrementStep={50}
                    onChange={handleChange}
                    paramKey={key!}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{param.fieldName}</p>
              </TooltipContent>
            </Tooltip>
          );
        }

        if (param.description === "batch_size") {
          return (
            <Tooltip key={key}>
              <TooltipTrigger asChild>
                <div>
                  <AnimatedCounter
                    initialValue={Number(param.fieldValue)}
                    min={1}
                    max={8}
                    onChange={handleChange}
                    paramKey={key!}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{param.description}</p>
              </TooltipContent>
            </Tooltip>
          );
        }

        if (param.description === "lora_strength" && enableLoraStrength) {
          return (
            <Tooltip key={key}>
              <TooltipTrigger asChild>
                <div>
                  <AnimatedCounter
                    initialValue={Number(param.fieldValue)}
                    incrementStep={0.1}
                    min={0}
                    max={2}
                    onChange={handleChange}
                    paramKey={key!}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{param.description}</p>
              </TooltipContent>
            </Tooltip>
          );
        }

        if (param.description === "negtive_prompt" && showNegativePrompt) {
          return (
            <div key={key} className="relative w-full">
              <MinusCircleIcon className="absolute left-4 top-2 text-white/80" />
              <Textarea
                value={param.fieldValue as string}
                onChange={(e) => handleChange(key!, e.target.value)}
                className="hide-scrollbar pl-12 text-red-300"
                maxHeight={50}
                placeholder="Negative Prompt..."
              />
            </div>
          );
        }
        return null;
      })}

      {(hasNegativePromptParam || hasLoraStrengthParam) && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="rounded-2xl p-2 transition hover:bg-white/10">
              <DotsThreeVerticalIcon className="size-5 text-white" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-40 bg-black/90 backdrop-blur-sm">
            {hasNegativePromptParam && (
              <DropdownMenuItem onClick={() => setShowNegativePrompt((prev: boolean) => !prev)}>
                {showNegativePrompt ? "Hide Negative Prompt" : "Show Negative Prompt"}
              </DropdownMenuItem>
            )}
            {hasLoraStrengthParam && (
              <DropdownMenuItem onClick={() => setEnableLoraStrength((prev: boolean) => !prev)}>
                {enableLoraStrength ? "Disable Lora Strength" : "Enable Lora Strength"}
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};

// ============================================================================
// 3. CREATE THE MEMOIZED COMPONENT
// ============================================================================
const MemoizedOtherParameters = React.memo(OtherParameters);

export const RunninghubParameters = forwardRef<
  RunninghubParametersHandle,
  RunninghubParametersProps
>(({ parameters, modelName, identifier }, ref) => {
  const [values, setValues] = useState<NodeParam[]>(parameters);
  const [showNegativePrompt, setShowNegativePrompt] = useState(false);
  const [enableLoraStrength, setEnableLoraStrength] = useState(false);
  const [imageObjects, setImageObjects] = useState<Record<string, ImageObject | null>>({});
  const [selectedPreset, setSelectedPreset] = useState<PresetData | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedModels, setSelectedModels] = useState<ModelData | null>(null);
  const [selectedLoraModel, setSelectedLoraModel] = useState<ModelData | null>(null);

  useEffect(() => {
    // 1. Start with clean parameters, ensuring any initial image values are cleared
    const initialValues = parameters.map((p) =>
      p.fieldName === "image" ? { ...p, fieldValue: "" } : p,
    );

    // 2. Clear out any previous image object state
    setImageObjects({});
    setImageObjects({});
    const lastPrompt = sessionStorage.getItem("lastPrompt");
    if (lastPrompt) {
      handleChange("prompt", lastPrompt);
    }

    // 3. Get image from session storage
    const initialImageData = sessionStorage.getItem("initialEditImage");
    const sessionImg: ImageObject | null = initialImageData ? JSON.parse(initialImageData) : null;

    if (!sessionImg) {
      setValues(initialValues);
      return;
    }

    // 4. Find the first available image parameter to apply the session image to
    const firstImageParam = initialValues.find((p) => p.fieldName === "image");
    if (!firstImageParam) {
      setValues(initialValues);
      return;
    }

    // 5. Populate BOTH states correctly
    //  a. Set the full image object in our dedicated state
    setImageObjects({ [firstImageParam.description]: sessionImg });
    //  b. Set the main values array with the displayUrl
    const updatedValues = initialValues.map((p) =>
      p.nodeId === firstImageParam.nodeId
        ? { ...p, fieldValue: sessionImg.displayUrl } // Set displayUrl in data
        : p,
    );
    setValues(updatedValues);

    // 6. Restore preset
    const persistedPresetStr = sessionStorage.getItem("persistedPreset");
    if (persistedPresetStr) {
      try {
        const preset = JSON.parse(persistedPresetStr);
        setSelectedPreset(preset);
      } catch (e) {
        console.error("Failed to restore preset", e);
      }
      sessionStorage.removeItem("persistedPreset");
    }
  }, [parameters]);

  useImperativeHandle(
    ref,
    () => ({
      getValues: () => {
        // Derive the permanent paths from our dedicated `imageObjects` state
        const inputImages = Object.values(imageObjects)
          .filter((img): img is ImageObject => img !== null) // Filter out nulls
          .map((img) => img.permanentPath); // Extract the permanent path

        return {
          values: values, // This array contains the displayUrl for images
          inputImages: inputImages, // This array contains ONLY the permanentPath
          currentImage: Object.values(imageObjects).find((img) => img !== null) || null,
          allImageObjects: Object.values(imageObjects).filter(
            (img): img is ImageObject => img !== null,
          ),
          selectedPreset,
        };
      },
      clearPrompt: () => {
        handlePromptChange("");
      },
    }),
    [values, imageObjects], // Depend on both states
  );

  const handleChange = useCallback((description: string, newFieldValue: any) => {
    setValues((currentParams) =>
      currentParams.map((param) =>
        param.description === description
          ? { ...param, fieldValue: String(newFieldValue ?? "") }
          : param,
      ),
    );
  }, []);

  // These useMemo hooks are efficient and correctly recalculate the filtered lists
  // when the `values` state changes. This is the desired behavior.
  const promptParam = useMemo(
    () => values.find((p) => p.fieldName === "prompt" || p.description === "prompt"),
    [values],
  );
  const loraParam = useMemo(() => values.find((p) => p.description === "lora_name"), [values]);
  const checkpointParam = useMemo(
    () => values.find((p) => p.description === "checkpoint_name"),
    [values],
  );
  const imageParams = useMemo(() => values.filter((p) => p.fieldName === "image"), [values]);

  // This list is now passed to the memoized child component
  const otherParams = useMemo(
    () => values.filter((p) => p.description !== "prompt" && p.fieldName !== "image"),
    [values],
  );

  const hasNegativePromptParam = useMemo(
    () => values.some((p) => p.description === "negtive_prompt"),
    [values],
  );
  const hasLoraStrengthParam = useMemo(
    () => values.some((p) => p.description === "lora_strength"),
    [values],
  );

  const handleImageUploaded = useCallback(
    (description: string, image: ImageObject) => {
      // Update the main values array with the displayUrl
      handleChange(description, image.displayUrl);
      // Update our dedicated state with the full image object
      setImageObjects((prev) => ({ ...prev, [description]: image }));
    },
    [handleChange],
  );

  const handleImageRemoved = useCallback(
    (description: string) => {
      // Clear the value in the main array
      handleChange(description, "");
      // Clear the object in our dedicated state
      setImageObjects((prev) => ({ ...prev, [description]: null }));
      // Clean up session storage
      sessionStorage.removeItem("initialEditImage");
    },
    [handleChange],
  );

  function focusTextareaAndPlaceCaret(el: HTMLTextAreaElement | null) {
    if (!el) return;
    el.focus({ preventScroll: false });
    try {
      const len = el.value?.length ?? 0;
      el.setSelectionRange(len, len);
    } catch {
      // ignore if custom textarea doesn't support setSelectionRange
    }
  }

  const lastEnhancedPromptRef = useRef<string | null>(null);

  const handlePromptChange = (newValue: string) => {
    if (promptParam) handleChange(promptParam.description, newValue);
    sessionStorage.setItem("lastPrompt", newValue);

    if (newValue !== lastEnhancedPromptRef.current) {
      lastEnhancedPromptRef.current = null;
    }
  };

  const handleRandomPrompt = async () => {
    try {
      if (isSpinning) return;
      setIsSpinning(true);

      const userPrompt = promptParam?.fieldValue;
      let finalPrompt: string;

      if (!userPrompt || !userPrompt.trim()) {
        // Random prompt
        finalPrompt = await getRandomPromptForModel("", modelName);
        lastEnhancedPromptRef.current = null;
      } else {
        // Enhance only if not already enhanced
        if (userPrompt === lastEnhancedPromptRef.current) {
          finalPrompt = userPrompt;
        } else {
          finalPrompt = await getRandomPromptForModel(userPrompt, modelName);
          lastEnhancedPromptRef.current = finalPrompt;
        }
      }

      handleChange("prompt", finalPrompt);

      requestAnimationFrame(() => {
        const el =
          textareaRef.current ||
          (document.querySelector("textarea.prompt-textarea") as HTMLTextAreaElement | null);
        focusTextareaAndPlaceCaret(el);
      });
    } finally {
      setTimeout(() => setIsSpinning(false), 800);
    }
  };

  const canEnhanceOrGetRandom =
    !promptParam?.fieldValue.trim() || promptParam?.fieldValue !== lastEnhancedPromptRef.current;
  const isDisabled = !canEnhanceOrGetRandom || isSpinning;

  const handleCheckpointSelect = (model: ModelData) => {
    setSelectedModels(model);
    console.log("Selected checkpoint:", model.identifier);
    if (checkpointParam) {
      handleChange(checkpointParam.description, model.identifier);
    }
  };

  const handleLoraSelect = (model: ModelData) => {
    setSelectedLoraModel(model);
    console.log("Selected lora:", model.identifier);
    if (loraParam) {
      handleChange(loraParam.description, model.identifier);
    }
  };

  return (
    <div className="relative flex w-full flex-col gap-8 md:flex-row md:gap-2">
      {!(checkpointParam || loraParam) && (
        <PresetModal
          forModel={identifier}
          onSelectPrompt={handlePromptChange}
          selectedPreset={selectedPreset}
          onSelect={setSelectedPreset}
        />
      )}
      <div className="grid grid-cols-2 gap-2">
        <AnimatePresence>
          {checkpointParam && (
            <ModelSelectModal
              title="Checkpoint"
              description="A checkpoint is the core AI model used to create images. It determines the overall style, realism, and creativity of the results, guiding how the AI interprets your prompt to generate visuals."
              coverImage={
                selectedModels?.cover_image ||
                "https://i.pinimg.com/736x/84/27/67/842767f8e288bfd4a0cbf2977ee7661c.jpg"
              }
              modelName={selectedModels?.model_name || "Select Model"}
              conversationType={ConversationType.CHECKPOINT}
              onSelectModel={handleCheckpointSelect}
            />
          )}
        </AnimatePresence>
        <AnimatePresence>
          {loraParam && (
            <ModelSelectModal
              title="LoRA"
              description="LoRA (Low-Rank Adaptation) models are small, fine-tuned models that can be added to a checkpoint to introduce specific styles, characters, or concepts without changing the base model."
              coverImage={
                selectedLoraModel?.cover_image ||
                "https://i.pinimg.com/736x/84/27/67/842767f8e288bfd4a0cbf2977ee7661c.jpg"
              }
              modelName={selectedLoraModel?.model_name || "Select LoRA"}
              conversationType={ConversationType.LORA}
              onSelectModel={handleLoraSelect}
            />
          )}
        </AnimatePresence>
      </div>

      <div>
        <AnimatePresence>
          <div className="">
            {isSpinning && (
              <div className="ai-textbox-gradient absolute inset-0 z-50 rounded-3xl opacity-50 blur-sm" />
            )}
            {promptParam && (
              <motion.div
                key={promptParam.nodeId + promptParam.fieldName}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="relative mb-3 w-full"
              >
                <IconTerminal className="absolute left-4 top-2 text-white/80" />
                <Textarea
                  ref={textareaRef}
                  value={promptParam.fieldValue}
                  onChange={(e) => handlePromptChange(e.target.value)}
                  className="hide-scrollbar prompt-textarea min-h-24 w-full pl-12 pr-8 md:min-h-4 md:min-w-[420px]"
                  placeholder="A cute magical flying cat, cinematic, 4k"
                  maxHeight={100}
                  disabled={isSpinning}
                />
                <motion.button
                  onClick={handleRandomPrompt}
                  aria-label="Generate random prompt"
                  title="Random prompt"
                  type="button"
                  disabled={isDisabled}
                  animate={{ rotate: isSpinning ? 360 : 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className="absolute right-0 top-1 flex items-center justify-center rounded-xl bg-black/50 p-1.5 shadow-md shadow-black hover:bg-white/10 hover:text-accent hover:shadow-none focus:outline-none focus:ring-2 focus:ring-white/30 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {promptParam.fieldValue ? (
                    <SparkleIcon
                      size={20}
                      className="drop-shadow-accent/50 animate-pulse text-accent"
                    />
                  ) : (
                    <DicesIcon size={20} />
                  )}
                </motion.button>
              </motion.div>
            )}
          </div>
        </AnimatePresence>

        <MemoizedOtherParameters
          otherParams={otherParams}
          handleChange={handleChange}
          showNegativePrompt={showNegativePrompt}
          setShowNegativePrompt={setShowNegativePrompt}
          hasNegativePromptParam={hasNegativePromptParam}
          enableLoraStrength={enableLoraStrength}
          setEnableLoraStrength={setEnableLoraStrength}
          hasLoraStrengthParam={hasLoraStrengthParam}
        />
      </div>
      {imageParams.map((param, index) => {
        return (
          <ImageUploadBox
            uploaderId={index}
            key={index}
            onImageUploaded={(image) => handleImageUploaded(param.description, image)}
            onImageRemoved={() => handleImageRemoved(param.description)}
            initialImage={imageObjects[param.description]}
            imageDescription={param.description || `Image ${index}`}
          />
        );
      })}
    </div>
  );
});

RunninghubParameters.displayName = "RunninghubParameters";

export default React.memo(RunninghubParameters);
