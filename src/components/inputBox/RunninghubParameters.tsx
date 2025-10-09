import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { IconTerminal } from "@tabler/icons-react";
import { AnimatePresence, motion } from "motion/react";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import AnimatedCounter from "../ui/AnimatedCounter";
import { NodeParam } from "@/src/types/BaseType";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { DotsThreeVerticalIcon, MinusCircleIcon, PencilSimpleIcon } from "@phosphor-icons/react";
import { Switch } from "../ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import ImageUploadBox from "../ui/ImageUploadBox";
import { ImageObject } from "./ReplicateParameters";
import { DicesIcon } from "lucide-react";
import { getRandomPromptForModel } from "@/src/utils/client/prompts";

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
    setImageObjects({ [firstImageParam.nodeId]: sessionImg });
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

  const handleChange = useCallback((nodeId: string, newFieldValue: any) => {
    setValues((currentParams) =>
      currentParams.map((param) =>
        param.nodeId === nodeId ? { ...param, fieldValue: String(newFieldValue ?? "") } : param,
      ),
    );
  }, []);

  const promptParam = useMemo(() => values.find((p) => p.description === "prompt"), [values]);
  const loraParam = useMemo(() => values.find((p) => p.fieldName === "lora_name"), [values]);

  // FIX: Ensure this uses .filter() to return an array, which has the .map method
  const imageParams = useMemo(() => values.filter((p) => p.fieldName === "image"), [values]);

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
    (nodeId: string, image: ImageObject) => {
      // Update the main values array with the displayUrl
      handleChange(nodeId, image.displayUrl);
      // Update our dedicated state with the full image object
      setImageObjects((prev) => ({ ...prev, [nodeId]: image }));
    },
    [handleChange],
  );

  const handleImageRemoved = useCallback(
    (nodeId: string) => {
      // Clear the value in the main array
      handleChange(nodeId, "");
      // Clear the object in our dedicated state
      setImageObjects((prev) => ({ ...prev, [nodeId]: null }));
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

  function handleRandomPrompt() {
    const prompt = getRandomPromptForModel(modelName);
    setIsSpinning(true);
    if (promptParam) {
      handleChange(promptParam.nodeId, prompt);
    }

    // focus textarea after DOM updates
    requestAnimationFrame(() => {
      const el =
        textareaRef.current ||
        (document.querySelector("textarea.prompt-textarea") as HTMLTextAreaElement | null);
      focusTextareaAndPlaceCaret(el);
    });

    setTimeout(() => setIsSpinning(false), 600);
  }

  return (
    <div className="flex gap-2">
      <AnimatePresence>
        {loraParam && (
          <div className="group relative z-20 h-[95px] w-[70px] flex-shrink-0 cursor-pointer overflow-hidden rounded-2xl transition-transform hover:scale-105 active:scale-100">
            <div className="pointer-events-none absolute inset-0 rounded-3xl shadow-[inset_0_4px_18px_rgba(0,0,0,0.5)]"></div>
            <Image
              className="h-full w-full rounded-lg object-cover transition-all duration-300 group-hover:brightness-90"
              src={"https://i.pinimg.com/736x/84/27/67/842767f8e288bfd4a0cbf2977ee7661c.jpg"}
              alt={"selectedModel.model_name"}
              width={150}
              height={95}
            />
            <div className="absolute bottom-2 left-2 right-2 rounded-md bg-black/30 p-1 text-center transition-opacity group-hover:opacity-0">
              <p className="truncate font-gothic text-sm font-medium text-accent">Noob xl</p>
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
                onChange={(e) => handleChange(promptParam.nodeId, e.target.value)}
                className="hide-scrollbar prompt-textarea min-w-[420px] pl-12"
                placeholder="A cute magical flying cat, cinematic, 4k"
                maxHeight={100}
              />
              <motion.button
                onClick={handleRandomPrompt}
                aria-label="Generate random prompt"
                title="Random prompt"
                type="button"
                animate={{ rotate: isSpinning ? 360 : 0 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                className="bg-white/6 absolute right-4 top-2 flex items-center justify-center rounded-md p-1.5 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                <DicesIcon size={20} className="text-white/80" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex w-fit flex-wrap items-center gap-2">
          {otherParams.map((param) => {
            const key = `${param.nodeId}`;

            if (
              (param.fieldName === "aspect_ratio" || param.fieldName === "size") &&
              param.fieldData
            ) {
              let options: string[] = [];
              try {
                options = JSON.parse(param.fieldData)[0];
              } catch (e) {
                console.error("Failed to parse fieldData for aspect_ratio:", e);
              }
              return (
                <Tooltip key={key}>
                  <TooltipTrigger asChild>
                    <div className="min-w-[130px]">
                      <Select
                        value={param.fieldValue}
                        onValueChange={(val) => handleChange(param.nodeId, val)}
                      >
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
                    <p>{param.description}</p>
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
                      <div className="">
                        <Switch
                          checked={param.fieldValue === "true"}
                          onCheckedChange={(value) =>
                            handleChange(param.nodeId, value ? "true" : "false")
                          }
                        />
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{param.description}</p>
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
                        paramKey={param.nodeId!}
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
                        paramKey={param.nodeId!}
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{param.description}</p>
                  </TooltipContent>
                </Tooltip>
              );
            }

            // Typo here: "negtive_prompt" should likely be "negative_prompt"
            if (param.description === "negtive_prompt" && showNegativePrompt) {
              return (
                <div key={key} className="relative w-full">
                  <MinusCircleIcon className="absolute left-4 top-2 text-white/80" />
                  <Textarea
                    value={param.fieldValue as string}
                    onChange={(e) => handleChange(param.nodeId!, e.target.value)}
                    className="hide-scrollbar min-w-[400px] pl-12 text-red-300"
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
                  <DotsThreeVerticalIcon className="h-5 w-5 text-white" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-40 bg-black/90 backdrop-blur-sm">
                {/* Conditionally show menu items for better robustness */}
                {hasNegativePromptParam && (
                  <DropdownMenuItem onClick={() => setShowNegativePrompt((prev) => !prev)}>
                    {showNegativePrompt ? "Hide Negative Prompt" : "Show Negative Prompt"}
                  </DropdownMenuItem>
                )}
                {hasLoraStrengthParam && (
                  <DropdownMenuItem onClick={() => setEnableLoraStrength((prev) => !prev)}>
                    {enableLoraStrength ? "Disable Lora Strength" : "Enable Lora Strength"}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
      {imageParams.map((param, index) => {
        // Get the full image object from our dedicated state
        const imageObject = imageObjects[param.nodeId] ?? null;

        return (
          <ImageUploadBox
            key={param.nodeId}
            initialImage={imageObject}
            onImageUploaded={(image) => handleImageUploaded(param.nodeId, image)}
            onImageRemoved={() => handleImageRemoved(param.nodeId)}
            imageDescription={param.description || `Image ${index}`}
          />
        );
      })}
    </div>
  );
});

RunninghubParameters.displayName = "RunninghubParameters";

export default React.memo(RunninghubParameters);
