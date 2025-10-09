import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";

import { DicesIcon, XIcon } from "lucide-react";

import Image from "next/image";
import { getIconForParam } from "@/src/utils/server/utils";
import { SchemaParam } from "@/src/types/BaseType";
import { IconTerminal } from "@tabler/icons-react";
import { AnimatePresence, motion } from "motion/react";

import { Switch } from "../ui/switch";
import { Textarea } from "../ui/textarea";
import ImageUploadBox from "../ui/ImageUploadBox";
import AnimatedCounter from "../ui/AnimatedCounter";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { getRandomPromptForModel } from "@/src/utils/client/prompts";

export interface ImageObject {
  permanentPath: string;
  displayUrl: string;
}

const normalizeKey = (k: string) => k.replace(/\s+/g, "_").toLowerCase();

interface ReplicateParametersProps {
  parameters: Record<string, SchemaParam>;
  modelName?: string;
}

// UPDATE: The handle now exposes an object with both values and inputImages
export interface ReplicateParametersHandle {
  getValues: () => {
    values: Record<string, any>;
    inputImages: string[];
  };
}

export const ReplicateParameters = forwardRef<ReplicateParametersHandle, ReplicateParametersProps>(
  ({ parameters, modelName }, ref) => {
    const imageInputKey = useMemo(() => {
      if (parameters["image input"]) return "image input";
      if (parameters["input image"]) return "input image";
      if (parameters["style reference images"]) return "style reference images";
      if (parameters["style reference images"]) return "style reference images";
      if (parameters["image"]) return "image";
      if (parameters["image prompt"]) return "image prompt";
      return null;
    }, [parameters]);

    const imageParam = imageInputKey ? parameters[imageInputKey] : null;

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
    const [inputImagePermanentPaths, setInputImagePermanentPaths] = useState<string[]>([]);
    const [singleImageObject, setSingleImageObject] = useState<ImageObject | null>(null);
    const [multiImages, setMultiImages] = useState<ImageObject[]>([]);
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const [isSpinning, setIsSpinning] = useState(false);

    const handleChange = useCallback(
      (rawKey: string, value: any) => {
        const key = normalizeKey(rawKey);
        setValues((prev) => ({ ...prev, [key]: value }));
      },
      [setValues],
    );

    // UPDATE: The handle now exposes an object with both values and inputImages
    useImperativeHandle(ref, () => ({
      getValues: () => {
        const filteredValues: Record<string, any> = {};

        // Iterate over all the keys in the current `values` state
        for (const key in values) {
          const value = values[key];

          // Find the original parameter definition to check its properties (like enum)
          const originalParamKey = Object.keys(parameters).find(
            (pKey) => normalizeKey(pKey) === key,
          );
          const param = originalParamKey ? parameters[originalParamKey] : null;

          // RULE 1: If the parameter is an enum and its value is "None", skip it.
          if (param?.enum && value === "None") {
            continue;
          }

          // RULE 2: If the value is an empty array, skip it.
          // This handles the "style reference images": [] case.
          if (Array.isArray(value) && value.length === 0) {
            continue;
          }

          // RULE 3: If the value is just an empty string, skip it.
          if (typeof value === "string" && value.trim() === "") {
            continue;
          }

          // If none of the filtering rules apply, add the key-value pair to the result.
          filteredValues[key] = value;
        }

        return {
          values: filteredValues,
          inputImages: inputImagePermanentPaths, // This is returned as is, per your request.
        };
      },
    }));

    useEffect(() => {
      setValues(initialValues);
      if (!imageInputKey || !imageParam) return;

      const initialImageData = sessionStorage.getItem("initialEditImage");
      const sessionImage: ImageObject | null = initialImageData
        ? JSON.parse(initialImageData)
        : null;

      if (!sessionImage) return;

      if (imageParam.type === "string") {
        setSingleImageObject(sessionImage);
        handleChange(imageInputKey, sessionImage.displayUrl);
        setInputImagePermanentPaths([sessionImage.permanentPath]);
      } else if (imageParam.type === "array") {
        setMultiImages([sessionImage]);
        handleChange(imageInputKey, [sessionImage.displayUrl]);
        setInputImagePermanentPaths([sessionImage.permanentPath]);
      }
    }, [initialValues, imageInputKey, imageParam, handleChange]);

    const handleSingleImageUploaded = useCallback(
      (image: ImageObject) => {
        if (!imageInputKey) return;
        setSingleImageObject(image);
        handleChange(imageInputKey, image.displayUrl);
        setInputImagePermanentPaths([image.permanentPath]);
      },
      [imageInputKey, handleChange],
    );

    const handleSingleImageRemoved = useCallback(() => {
      if (!imageInputKey) return;
      setSingleImageObject(null);
      handleChange(imageInputKey, null);
      setInputImagePermanentPaths([]);
      sessionStorage.removeItem("initialEditImage");
    }, [imageInputKey, handleChange]);

    const addMultiImage = useCallback(
      (newImage: ImageObject) => {
        if (!imageInputKey) return;
        const normalizedKey = normalizeKey(imageInputKey);

        setMultiImages((prev) => [...prev, newImage]);
        setValues((prev) => ({
          ...prev,
          [normalizedKey]: [...(prev[normalizedKey] || []), newImage.displayUrl],
        }));
        setInputImagePermanentPaths((prev) => [...prev, newImage.permanentPath]);
      },
      [imageInputKey],
    );

    const removeMultiImage = (indexToRemove: number) => {
      if (!imageInputKey) return;
      const normalizedKey = normalizeKey(imageInputKey);
      const imageToRemove = multiImages[indexToRemove];

      if (!imageToRemove) return;

      setMultiImages((prev) => prev.filter((_, i) => i !== indexToRemove));
      setInputImagePermanentPaths((prev) =>
        prev.filter((path) => path !== imageToRemove.permanentPath),
      );
      setValues((prev) => ({
        ...prev,
        [normalizedKey]: (prev[normalizedKey] || []).filter(
          (url: string) => url !== imageToRemove.displayUrl,
        ),
      }));

      if (indexToRemove === 0) {
        sessionStorage.removeItem("initialEditImage");
      }
    };

    const handleMultiImageRemoved = useCallback(() => {}, []);

    const otherEntries = useMemo(
      () => Object.entries(parameters).filter(([k]) => k !== "prompt"),
      [parameters],
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
      handleChange("prompt", prompt);

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
        <div>
          <AnimatePresence>
            {parameters["prompt"] && (
              <motion.div
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
                  onChange={(e) => handleChange("prompt", e.target.value)}
                  className="hide-scrollbar prompt-textarea min-w-[420px] pl-12 pr-8"
                  placeholder={
                    parameters["prompt"]?.description ?? "A cute magical flying cat, cinematic, 4k"
                  }
                  maxHeight={100}
                />
                <motion.button
                  onClick={handleRandomPrompt}
                  aria-label="Generate random prompt"
                  title="Random prompt"
                  type="button"
                  animate={{ rotate: isSpinning ? 360 : 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className="bg-white/6 absolute right-0 top-1 flex items-center justify-center rounded-xl bg-black/50 p-1.5 shadow-md shadow-black hover:bg-white/10 hover:text-accent hover:shadow-none focus:outline-none focus:ring-2 focus:ring-white/30"
                >
                  <DicesIcon size={20} />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex w-fit flex-wrap items-center gap-2">
            {otherEntries.map(([key, param]) => {
              if (key === imageInputKey) return null;
              const value = values[normalizeKey(key)];

              if (param.enum) {
                return (
                  <Tooltip key={key}>
                    <TooltipTrigger asChild>
                      <div className="min-w-[50px]">
                        <Select
                          value={String(value)}
                          onValueChange={(val) => handleChange(key, val)}
                        >
                          <SelectTrigger className="w-full">
                            {getIconForParam(param.title ?? key)}
                            <SelectValue placeholder={param.title ?? key} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>{param.title}</SelectLabel>
                              {param.enum
                                .filter((opt) => opt !== "custom")
                                .map((opt) => (
                                  <SelectItem key={String(opt)} value={String(opt)}>
                                    {String(opt)}
                                  </SelectItem>
                                ))}
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
                        <Switch checked={!!value} onCheckedChange={(v) => handleChange(key, v)} />
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
        </div>

        {imageParam?.type === "string" && imageInputKey && (
          <ImageUploadBox
            initialImage={singleImageObject}
            onImageUploaded={handleSingleImageUploaded}
            onImageRemoved={handleSingleImageRemoved}
            imageDescription={`${imageParam.title}`}
          />
        )}

        {imageParam?.type === "array" && (
          <div className="flex flex-wrap gap-4">
            {multiImages.map((img, idx) => {
              return (
                <div
                  key={img.permanentPath} // Use permanent path for a stable key
                  className="group relative h-[100px] w-[100px] rounded-3xl border border-white/30 bg-black p-1.5"
                >
                  <Image
                    src={img.displayUrl}
                    alt={`uploaded-${idx}`}
                    width={80}
                    height={80}
                    className="h-full w-full rounded-[20px] object-cover object-top"
                  />
                  <button
                    onClick={() => removeMultiImage(idx)}
                    className="absolute right-2 top-2 rounded-full bg-black bg-opacity-50 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    aria-label="Remove image"
                  >
                    <XIcon size={16} />
                  </button>
                </div>
              );
            })}

            {multiImages.length < 5 && (
              <ImageUploadBox
                onImageUploaded={addMultiImage}
                onImageRemoved={handleMultiImageRemoved}
                imageDescription={`${imageParam.title}`}
                resetOnSuccess={true}
              />
            )}
          </div>
        )}
      </div>
    );
  },
);

ReplicateParameters.displayName = "ReplicateParameters";

export default React.memo(ReplicateParameters);
