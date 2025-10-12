import {
  DotsThreeVerticalIcon,
  MinusCircleIcon,
  PencilSimpleIcon,
  SparkleIcon,
} from "@phosphor-icons/react";
import { IconTerminal } from "@tabler/icons-react";
import { DicesIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";

import { ConversationType, ModelData, NodeParam } from "@/src/types/BaseType";
import { getRandomPromptForModel } from "@/src/utils/client/prompts";

import DialogBox from "./DialogBox";
import { ImageObject } from "./ReplicateParameters";
import AnimatedCounter from "../ui/AnimatedCounter";
import CommonModal from "../ui/CommonModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import GradualBlurMemo from "../ui/GradualBlur";
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

interface RunninghubParametersProps {
  parameters: NodeParam[];
  modelName?: string;
}

export interface RunninghubParametersHandle {
  getValues: () => {
    values: NodeParam[];
    inputImages: string[];
  };
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
                      <SelectValue placeholder={param.description} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {options.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
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
// 2. CUSTOM COMPARISON FUNCTION to prevent re-renders from prompt changes
// ============================================================================
const areOtherParamsEqual = (prevProps: any, nextProps: any) => {
  // Check simple boolean toggles first
  if (prevProps.showNegativePrompt !== nextProps.showNegativePrompt) return false;
  if (prevProps.enableLoraStrength !== nextProps.enableLoraStrength) return false;

  const prevParams = prevProps.otherParams;
  const nextParams = nextProps.otherParams;

  // Check if the number of parameters has changed
  if (prevParams.length !== nextParams.length) return false;

  // THE KEY: Iterate and check if any `fieldValue` has actually changed.
  // This is what allows a change in "aspect_ratio" to trigger a re-render,
  // while a change in the main component's "prompt" does not.
  for (let i = 0; i < nextParams.length; i++) {
    if (prevParams[i].fieldValue !== nextParams[i].fieldValue) {
      return false; // A relevant value changed, so we must re-render.
    }
  }

  // If we reach here, no relevant props have changed. Skip the re-render.
  return true;
};

// ============================================================================
// 3. CREATE THE MEMOIZED COMPONENT
// ============================================================================
const MemoizedOtherParameters = React.memo(OtherParameters, areOtherParamsEqual);

export const RunninghubParameters = forwardRef<
  RunninghubParametersHandle,
  RunninghubParametersProps
>(({ parameters, modelName }, ref) => {
  const [values, setValues] = useState<NodeParam[]>(parameters);
  const [showNegativePrompt, setShowNegativePrompt] = useState(false);
  const [enableLoraStrength, setEnableLoraStrength] = useState(false);
  const [imageObjects, setImageObjects] = useState<Record<string, ImageObject | null>>({});
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedModels, setSelectedModels] = useState<ModelData | null>(null);

  useEffect(() => {
    // 1. Start with clean parameters, ensuring any initial image values are cleared
    const initialValues = parameters.map((p) =>
      p.fieldName === "image" ? { ...p, fieldValue: "" } : p,
    );

    // 2. Clear out any previous image object state
    setImageObjects({});

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
        };
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
    // If user types, we should allow enhancement again.
    // Setting ref to null ensures the condition `values.prompt !== lastEnhancedPromptRef.current` becomes true.
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

  const handleModelSelect = (model: ModelData) => {
    setSelectedModels(model);
    // sessionStorage.setItem(`-model`, JSON.stringify(model));
    setIsDialogOpen(false);
  };
  const handleCardClick = () => {
    setIsDialogOpen((prev) => !prev);
  };

  return (
    <div className="relative flex gap-2">
      <AnimatePresence>
        {isDialogOpen && (
          <motion.div
            className="absolute mb-2 size-full overflow-hidden"
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
              <DialogBox
                conversationType={ConversationType.ADVANCE}
                onSelectModel={handleModelSelect}
              />
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
      <AnimatePresence>
        {checkpointParam && (
          <div
            onClick={handleCardClick}
            className="group relative z-20 h-[95px] w-[70px] flex-shrink-0 cursor-pointer overflow-hidden rounded-2xl transition-transform hover:scale-105 active:scale-100"
          >
            <div className="pointer-events-none absolute inset-0 rounded-3xl shadow-[inset_0_4px_18px_rgba(0,0,0,0.5)]"></div>
            <Image
              className="size-full rounded-lg object-cover transition-all duration-300 group-hover:brightness-90"
              src={
                selectedModels?.cover_image ||
                "https://i.pinimg.com/736x/84/27/67/842767f8e288bfd4a0cbf2977ee7661c.jpg"
              }
              alt={selectedModels?.model_name || "selectedModel.model_name"}
              width={150}
              height={95}
            />
            <div className="absolute inset-x-2 bottom-2 rounded-md bg-black/30 p-1 text-center transition-opacity group-hover:opacity-0">
              <p className="truncate font-satoshi text-sm font-medium text-accent">
                {selectedModels?.model_name || "Select Model"}
              </p>
            </div>
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
              <span className="rounded-xl bg-black/50 px-2 py-1 text-xs text-white/90">
                <PencilSimpleIcon size={20} weight="fill" />
              </span>
            </div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {loraParam && (
          <div className="group relative z-20 h-[95px] w-[70px] flex-shrink-0 cursor-pointer overflow-hidden rounded-2xl transition-transform hover:scale-105 active:scale-100">
            <div className="pointer-events-none absolute inset-0 rounded-3xl shadow-[inset_0_4px_18px_rgba(0,0,0,0.5)]"></div>
            <Image
              className="size-full rounded-lg object-cover transition-all duration-300 group-hover:brightness-90"
              src={"https://i.pinimg.com/736x/84/27/67/842767f8e288bfd4a0cbf2977ee7661c.jpg"}
              alt={"selectedModel.model_name"}
              width={150}
              height={95}
            />
            <div className="absolute inset-x-2 bottom-2 rounded-md bg-black/30 p-1 text-center transition-opacity group-hover:opacity-0">
              <p className="truncate font-satoshi text-sm font-medium text-accent">Noob xl</p>
            </div>
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
              <span className="rounded-xl bg-black/50 px-2 py-1 text-xs text-white/90">
                <PencilSimpleIcon size={20} weight="fill" />
              </span>
            </div>
          </div>
        )}
      </AnimatePresence>
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
                  className="hide-scrollbar prompt-textarea min-w-[420px] pl-12 pr-8"
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
        // Get the full image object from our dedicated state
        // const imageObject = imageObjects[param.fieldValue] ?? null;

        return (
          <ImageUploadBox
            key={param.description}
            // initialImage={imageObject}
            onImageUploaded={(image) => handleImageUploaded(param.description, image)}
            onImageRemoved={() => handleImageRemoved(param.description)}
            imageDescription={param.description || `Image ${index}`}
          />
        );
      })}

      {/* <CommonModal
        isOpen={!isEnhanceModalOpen}
        onClose={() => setIsEnhanceModalOpen(false)}
        variant="enhance"
      >
        <div className="fixed flex h-96 w-96 items-center justify-center bg-black">TESTING</div>
      </CommonModal> */}
    </div>
  );
});

RunninghubParameters.displayName = "RunninghubParameters";

export default React.memo(RunninghubParameters);
