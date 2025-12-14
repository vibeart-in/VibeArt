import { SparkleIcon } from "@phosphor-icons/react";
import { IconAspectRatio, IconTerminal } from "@tabler/icons-react";
import { DicesIcon, XIcon } from "lucide-react";
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

import { SchemaParam, PresetData, MidjourneyStyleData } from "@/src/types/BaseType";
import { getRandomPromptForModel } from "@/src/utils/client/prompts";
import { getIconForParam } from "@/src/utils/server/utils";

import MidjourneyStylesModal from "./MidjourneyStylesModal";
import PresetModal from "./PresetModal";
import AnimatedCounter from "../ui/AnimatedCounter";
import ImageUploadBox from "../ui/ImageUploadBox";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Switch } from "../ui/switch";
import { Textarea } from "../ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

export interface ImageObject {
  permanentPath: string;
  displayUrl: string;
}

const normalizeKey = (k: string) => k.replace(/\s+/g, "_").toLowerCase();

interface ReplicateParametersProps {
  parameters: Record<string, SchemaParam>;
  modelName?: string;
  identifier?: string;
}

// UPDATE: The handle now exposes an object with both values and inputImages
export interface ReplicateParametersHandle {
  getValues: () => {
    values: Record<string, any>;
    inputImages: string[];
    currentImage?: ImageObject | null;
    allImageObjects?: ImageObject[];
    selectedPreset?: PresetData | null;
  };
  clearPrompt: () => void;
}

const OtherParameters = ({
  otherEntries,
  values,
  handleChange,
}: {
  otherEntries: [string, any][];
  values: Record<string, any>;
  handleChange: (key: string, value: any) => void;
}) => {
  return (
    <div className="flex w-fit flex-wrap items-center gap-2">
      {otherEntries.map(([key, param]) => {
        const value = values[normalizeKey(key)];

        if (param.enum) {
          return (
            <Tooltip key={key}>
              <TooltipTrigger asChild>
                <div className="min-w-[50px]">
                  <Select value={String(value)} onValueChange={(val) => handleChange(key, val)}>
                    <SelectTrigger className="w-full">
                      {param.title !== "aspect_ratio" && getIconForParam(param.title ?? key)}
                      <SelectValue placeholder={param.title ?? key} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>{param.title}</SelectLabel>
                        {param.enum
                          .filter((opt: any) => opt !== "custom")
                          .map((opt: any) => {
                            const isAspect = param.title === "aspect_ratio";
                            const ratioRegex = /^\d+:\d+$/;
                            const isRatio = ratioRegex.test(opt);

                            let preview = null;

                            if (isAspect) {
                              if (isRatio) {
                                // Render aspect ratio box
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
                                preview = <IconAspectRatio size={15} />;
                              }
                            }

                            return (
                              <SelectItem key={String(opt)} value={String(opt)}>
                                <div className="flex items-center gap-2">
                                  {preview}
                                  <span>{String(opt)}</span>
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
                <p>{param.title}</p>
              </TooltipContent>
            </Tooltip>
          );
        }

        if (param.type === "boolean") {
          return (
            <Tooltip key={key}>
              <TooltipTrigger asChild>
                <div>
                  <Switch
                    title={param.title}
                    checked={!!value}
                    onCheckedChange={(v) => handleChange(key, v)}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{param.title}</p>
              </TooltipContent>
            </Tooltip>
          );
        }

        if (param.type === "integer" || param.type === "number") {
          return (
            <Tooltip key={key}>
              <TooltipTrigger asChild>
                <div>
                  <AnimatedCounter
                    initialValue={value ?? param.default}
                    min={param.minimum}
                    max={param.maximum}
                    onChange={handleChange}
                    paramKey={key}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{param.title}</p>
              </TooltipContent>
            </Tooltip>
          );
        }
        return null;
      })}
    </div>
  );
};

// ============================================================================
// 2. CUSTOM COMPARISON FUNCTION to prevent re-renders from prompt changes
// ============================================================================
const areOtherParamsEqual = (prevProps: any, nextProps: any) => {
  // Only re-render if the list of other parameters changes (rare)
  if (prevProps.otherEntries !== nextProps.otherEntries) {
    return false;
  }

  // THE KEY: Check if any value *relevant to this component* has changed.
  // This loop completely ignores changes to `values.prompt`.
  for (const [key] of nextProps.otherEntries) {
    const normalized = normalizeKey(key);
    if (prevProps.values[normalized] !== nextProps.values[normalized]) {
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

export const ReplicateParameters = forwardRef<ReplicateParametersHandle, ReplicateParametersProps>(
  ({ parameters, modelName, identifier }, ref) => {
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

    // Collect all image input keys (may be 0, 1 or many)
    const imageInputKeys = useMemo(() => {
      return Object.keys(parameters).filter((k) => isImageParam(k, parameters[k]));
    }, [parameters]);

    // map helpers (unchanged)
    const normalizedToOriginalKeyMap = useMemo(() => {
      const map = new Map<string, string>();
      for (const key in parameters) {
        map.set(normalizeKey(key), key);
      }
      return map;
    }, [parameters]);

    // initial values logic (unchanged)
    const initialValues = useMemo(() => {
      const out: Record<string, any> = {};
      for (const [key, param] of Object.entries(parameters)) {
        const nk = normalizeKey(key);
        if (param.default !== undefined) out[nk] = param.default;
        else if (param.type === "boolean") out[nk] = false;
        else if (param.enum) out[nk] = param.enum[0];
        else if (param.type === "integer") out[nk] = param.minimum ?? 0;
        else out[nk] = "";
      }
      return out;
    }, [parameters]);

    const [values, setValues] = useState<Record<string, any>>(initialValues);

    // per-image-key states
    const [singleImageObjects, setSingleImageObjects] = useState<
      Record<string, ImageObject | null>
    >(() => ({}));
    const [multiImagesMap, setMultiImagesMap] = useState<Record<string, ImageObject[]>>(() => ({}));
    const [inputImagePermanentPathsMap, setInputImagePermanentPathsMap] = useState<
      Record<string, string[]>
    >(() => ({}));
    const [selectedPreset, setSelectedPreset] = useState<PresetData | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<MidjourneyStyleData | null>(null);

    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const [isSpinning, setIsSpinning] = useState(false);

    const handleChange = useCallback(
      (rawKey: string, value: any) => {
        const key = normalizeKey(rawKey);
        setValues((prev) => ({ ...prev, [key]: value }));
      },
      [], // stable
    );

    useImperativeHandle(
      ref,
      () => ({
        getValues: () => {
          const filteredValues: Record<string, any> = {};
          for (const key in values) {
            const value = values[key];
            const originalParamKey = normalizedToOriginalKeyMap.get(key);
            const param = originalParamKey ? parameters[originalParamKey] : null;

            if (param?.enum && value === "None") continue;
            if (Array.isArray(value) && value.length === 0) continue;
            if (typeof value === "string" && value.trim() === "") continue;

            filteredValues[key] = value;
          }

          if (selectedStyle?.prompt) {
            const existing = filteredValues["prompt"] || "";
            filteredValues["prompt"] = existing ? `${existing} ${selectedStyle.prompt}` : selectedStyle.prompt;
          }

          // Flatten permanent paths into an array (backwards-compatible) and also return a map for clarity
          const inputImagesFlat = Object.values(inputImagePermanentPathsMap).flat().filter(Boolean);
          return {
            values: filteredValues,
            inputImages: inputImagesFlat, // legacy-friendly
            inputImageMap: inputImagePermanentPathsMap, // new, keyed by original param key
            currentImage:
              Object.values(multiImagesMap).flat()[0] ||
              null,
            allImageObjects: [
              ...Object.values(singleImageObjects).filter((img): img is ImageObject => img !== null),
              ...Object.values(multiImagesMap).flat(),
            ],
            selectedPreset,
          };
        },
        clearPrompt: () => {
          handlePromptChange("");
        },
      }),
      [values, inputImagePermanentPathsMap, parameters, normalizedToOriginalKeyMap],
    );

    // Restore session items and initialize per-key image state
    useEffect(() => {
      setValues(initialValues);

      const lastPrompt = sessionStorage.getItem("lastPrompt");
      if (lastPrompt) handleChange("prompt", lastPrompt);

      // Check for URL query param first
      const params = new URLSearchParams(window.location.search);
      const queryImageUrl = params.get("image-url");

      let sessionImage: ImageObject | null = null;

      if (queryImageUrl) {
        sessionImage = {
          permanentPath: queryImageUrl,
          displayUrl: queryImageUrl,
        };
      } else {
        const initialImageData = sessionStorage.getItem("initialEditImage");
        sessionImage = initialImageData ? JSON.parse(initialImageData) : null;
      }

      if (!sessionImage) return;

      // If session image exists, assign it sensibly to image keys:
      // - If there's exactly one string image param, set it there
      // - Otherwise set it to the first image param we find.
      if (imageInputKeys.length === 0) return;

      const targetKey = imageInputKeys[0];
      const imageParam = parameters[targetKey];

      if (imageParam?.type === "string") {
        setSingleImageObjects((prev) => ({ ...prev, [targetKey]: sessionImage }));
        handleChange(targetKey, sessionImage!.displayUrl);
        setInputImagePermanentPathsMap((prev) => ({
          ...prev,
          [targetKey]: [sessionImage!.permanentPath],
        }));
      } else if (imageParam?.type === "array") {
        setMultiImagesMap((prev) => ({ ...prev, [targetKey]: [sessionImage!] }));
        const normalizedKey = normalizeKey(targetKey);
        setValues((prev) => ({ ...prev, [normalizedKey]: [sessionImage!.displayUrl] }));
        setInputImagePermanentPathsMap((prev) => ({
          ...prev,
          [targetKey]: [sessionImage!.permanentPath],
        }));
      }

      // Restore multiple images if available
      const persistedImagesStr = sessionStorage.getItem("persistedInputImages");
      if (persistedImagesStr) {
        try {
          const persistedImages: ImageObject[] = JSON.parse(persistedImagesStr);
          if (persistedImages.length > 0 && imageInputKeys.length > 0) {
            const targetKey = imageInputKeys[0];
            const imageParam = parameters[targetKey];

            if (imageParam?.type === "array") {
               setMultiImagesMap((prev) => ({ ...prev, [targetKey]: persistedImages }));
               const normalizedKey = normalizeKey(targetKey);
               setValues((prev) => ({ 
                 ...prev, 
                 [normalizedKey]: persistedImages.map(img => img.displayUrl) 
               }));
               setInputImagePermanentPathsMap((prev) => ({
                 ...prev,
                 [targetKey]: persistedImages.map(img => img.permanentPath),
               }));
            }
          }
        } catch (e) {
          console.error("Failed to restore persisted images", e);
        }
        sessionStorage.removeItem("persistedInputImages");
      }

      // Restore preset
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
    }, [initialValues, imageInputKeys, parameters, handleChange]);

    // handlers now accept the 'originalParamKey' so we can handle multiple image params
    const handleSingleImageUploaded = useCallback(
      (paramKey: string, image: ImageObject) => {
        setSingleImageObjects((prev) => ({ ...prev, [paramKey]: image }));
        handleChange(paramKey, image.displayUrl);
        setInputImagePermanentPathsMap((prev) => ({ ...prev, [paramKey]: [image.permanentPath] }));
      },
      [handleChange],
    );

    const handleSingleImageRemoved = useCallback(
      (paramKey: string) => {
        setSingleImageObjects((prev) => ({ ...prev, [paramKey]: null }));
        handleChange(paramKey, null);
        setInputImagePermanentPathsMap((prev) => ({ ...prev, [paramKey]: [] }));
        sessionStorage.removeItem("initialEditImage");
      },
      [handleChange],
    );

    const addMultiImage = useCallback((paramKey: string, newImage: ImageObject) => {
      const normalizedKey = normalizeKey(paramKey);
      setMultiImagesMap((prev) => ({ ...prev, [paramKey]: [...(prev[paramKey] || []), newImage] }));
      setValues((prev) => ({
        ...prev,
        [normalizedKey]: [...(prev[normalizedKey] || []), newImage.displayUrl],
      }));
      setInputImagePermanentPathsMap((prev) => ({
        ...prev,
        [paramKey]: [...(prev[paramKey] || []), newImage.permanentPath],
      }));
    }, []);

    const removeMultiImage = useCallback(
      (paramKey: string, indexToRemove: number) => {
        const normalizedKey = normalizeKey(paramKey);
        const imagesForKey = multiImagesMap[paramKey] || [];
        const imageToRemove = imagesForKey[indexToRemove];
        if (!imageToRemove) return;

        setMultiImagesMap((prev) => ({
          ...prev,
          [paramKey]: prev[paramKey]?.filter((_, i) => i !== indexToRemove) || [],
        }));

        setInputImagePermanentPathsMap((prev) => ({
          ...prev,
          [paramKey]: (prev[paramKey] || []).filter((p) => p !== imageToRemove.permanentPath),
        }));

        setValues((prev) => ({
          ...prev,
          [normalizedKey]: (prev[normalizedKey] || []).filter(
            (url: string) => url !== imageToRemove.displayUrl,
          ),
        }));

        if (indexToRemove === 0) {
          sessionStorage.removeItem("initialEditImage");
        }
      },
      [multiImagesMap],
    );

    const handleMultiImageRemoved = useCallback(() => {}, []);

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
      handleChange("prompt", newValue);
      sessionStorage.setItem("lastPrompt", newValue);
      if (newValue !== lastEnhancedPromptRef.current) {
        lastEnhancedPromptRef.current = null;
      }
    };

    const handleRandomPrompt = async () => {
      try {
        if (isSpinning) return;
        setIsSpinning(true);

        const userPrompt = values.prompt;
        let finalPrompt: string;

        if (!userPrompt || !userPrompt.trim()) {
          finalPrompt = await getRandomPromptForModel("", modelName);
          lastEnhancedPromptRef.current = null;
        } else {
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

    const otherEntries = useMemo(
      () =>
        Object.entries(parameters).filter(([k]) => {
          return !imageInputKeys.includes(k) && k !== "prompt";
        }),
      [parameters, imageInputKeys],
    );

    const canEnhanceOrGetRandom =
      !values.prompt?.trim() || values.prompt !== lastEnhancedPromptRef.current;
    const isDisabled = !canEnhanceOrGetRandom || isSpinning;

    const memoizedIsMidjourney = useMemo(() => {
      const name = modelName ? modelName.toLowerCase() : "";
      return name === "midjourney - fast" || name === "midjourney - upscale";
    }, [modelName]);

    return (
      <div className="flex w-full flex-col gap-8 md:flex-row md:gap-3">
        <div className="flex flex-col gap-4">
          {!memoizedIsMidjourney && (
            <PresetModal
              forModel={identifier}
              onSelectPrompt={handlePromptChange}
              selectedPreset={selectedPreset}
              onSelect={setSelectedPreset}
            />
          )}

          {/* Render all image inputs (one per image param) */}
          <div className="flex gap-4 md:hidden">
            {imageInputKeys.map((imgKey) => {
              const imgParam = parameters[imgKey];
              if (!imgParam) return null;

              if (imgParam.type === "string") {
                return (
                  <ImageUploadBox
                    key={imgKey}
                    initialImage={singleImageObjects[imgKey] ?? null}
                    onImageUploaded={(img) => handleSingleImageUploaded(imgKey, img)}
                    onImageRemoved={() => handleSingleImageRemoved(imgKey)}
                    imageDescription={`${imgParam.title}`}
                  />
                );
              }


              return null;
            })}
          </div>
        </div>

        <div>
          <div>
            <AnimatePresence>
              {isSpinning && (
                <div
                  key="spinning-overlay"
                  className="ai-textbox-gradient absolute inset-0 z-50 rounded-3xl opacity-50 blur-sm"
                />
              )}
              {parameters["prompt"] && (
                <motion.div
                  key="prompt-section"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="relative mb-3 w-full"
                >
                  <IconTerminal className="absolute left-4 top-2 text-white/80" />
                  <Textarea
                    ref={textareaRef}
                    value={values["prompt"] ?? ""}
                    onChange={(e) => handlePromptChange(e.target.value)}
                    className="hide-scrollbar prompt-textarea min-h-24 w-full pl-12 pr-8 md:min-h-4 md:min-w-[420px]"
                    placeholder={
                      parameters["prompt"]?.description ??
                      "A cute magical flying cat, cinematic, 4k"
                    }
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
                    {values.prompt ? (
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
            </AnimatePresence>
          </div>

          <div className="flex w-full justify-between gap-2">
            <div>
              {memoizedIsMidjourney && (
                <MidjourneyStylesModal
                  onSelectPrompt={handlePromptChange}
                  selectedStyle={selectedStyle}
                  onSelect={setSelectedStyle}
                  currentPrompt={values.prompt}
                />
              )}
            </div>
          </div>

          <MemoizedOtherParameters
            otherEntries={otherEntries}
            values={values}
            handleChange={handleChange}
          />
        </div>

        {/* Render all image inputs (one per image param) */}
        <div className="hidden gap-4 md:flex">
          {imageInputKeys.map((imgKey) => {
            const imgParam = parameters[imgKey];
            if (!imgParam) return null;

            if (imgParam.type === "string") {
              return (
                <ImageUploadBox
                  key={imgKey}
                  initialImage={singleImageObjects[imgKey] ?? null}
                  onImageUploaded={(img) => handleSingleImageUploaded(imgKey, img)}
                  onImageRemoved={() => handleSingleImageRemoved(imgKey)}
                  imageDescription={`${imgParam.title}`}
                />
              );
            }

            if (imgParam.type === "array") {
              const imgs = multiImagesMap[imgKey] || [];
              return (
                <div key={imgKey} className="flex flex-wrap gap-4">
                  {imgs.map((img, idx) => (
                    <div
                      key={img.permanentPath}
                      className="group relative size-[100px] rounded-3xl border border-white/30 bg-black p-1.5"
                    >
                      <Image
                        src={img.displayUrl}
                        alt={`uploaded-${idx}`}
                        width={80}
                        height={80}
                        className="size-full rounded-[20px] object-cover object-top"
                      />
                      <button
                        onClick={() => removeMultiImage(imgKey, idx)}
                        className="absolute right-2 top-2 rounded-full bg-black bg-opacity-50 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                        aria-label="Remove image"
                      >
                        <XIcon size={16} />
                      </button>
                    </div>
                  ))}

                  {(multiImagesMap[imgKey]?.length || 0) < 5 && (
                    <ImageUploadBox
                      key={imgKey + "-adder"}
                      onImageUploaded={(img) => addMultiImage(imgKey, img)}
                      onImageRemoved={handleMultiImageRemoved}
                      imageDescription={`${imgParam.title}`}
                      resetOnSuccess={true}
                    />
                  )}
                </div>
              );
            }

            return null;
          })}
        </div>
      </div>
    );
  },
);

ReplicateParameters.displayName = "ReplicateParameters";

export default React.memo(ReplicateParameters);
