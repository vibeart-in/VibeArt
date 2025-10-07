import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";

import { XIcon } from "lucide-react";

import Image from "next/image";
import { getIconForParam } from "@/src/lib/utils";
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

export interface ImageObject {
  permanentPath: string;
  displayUrl: string;
}

const normalizeKey = (k: string) => k.replace(/\s+/g, "_").toLowerCase();

interface ReplicateParametersProps {
  parameters: Record<string, SchemaParam>;
}

export interface ReplicateParametersHandle {
  getValues: () => Record<string, any>;
}

export const ReplicateParameters = forwardRef<ReplicateParametersHandle, ReplicateParametersProps>(
  ({ parameters }, ref) => {
    const imageInputKey = useMemo(() => {
      if (parameters["image input"]) return "image input";
      if (parameters["input image"]) return "input image";
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
    const [singleImageObject, setSingleImageObject] = useState<ImageObject | null>(null);

    // For multiple images, store both paths to avoid state inconsistencies.
    const [multiImages, setMultiImages] = useState<ImageObject[]>([]);

    // Effect to initialize values and handle initial image from session storage
    useEffect(() => {
      // 1. Reset values to defaults from the schema
      setValues(initialValues);

      // 2. Check for an image from session storage to override the default
      if (!imageInputKey || !imageParam) return;

      const initialImageData = sessionStorage.getItem("initialEditImage");
      const sessionImage: ImageObject | null = initialImageData
        ? JSON.parse(initialImageData)
        : null;

      if (!sessionImage) return;

      if (imageParam.type === "string") {
        // For single image, we just need to update the `values` state.
        // The `ImageUploadBox` will receive this via the `initialImage` prop.
        setSingleImageObject(sessionImage);
        handleChange(imageInputKey, sessionImage.permanentPath);
      } else if (imageParam.type === "array") {
        // For multi-image, we update both our UI state and form values.
        setMultiImages([sessionImage]);
        handleChange(imageInputKey, [sessionImage.permanentPath]);
      }
    }, [initialValues, imageInputKey]);

    useImperativeHandle(ref, () => ({
      getValues: () => values,
    }));

    const handleChange = useCallback(
      (rawKey: string, value: any) => {
        const key = normalizeKey(rawKey);
        setValues((prev) => ({ ...prev, [key]: value }));
      },
      [setValues],
    );

    // --- REFACTORED: Simplified Image Handlers ---

    const addMultiImage = (newImage: ImageObject) => {
      if (!imageInputKey) return;
      const normalizedKey = normalizeKey(imageInputKey);

      setMultiImages((prev) => [...prev, newImage]);
      setValues((prev) => ({
        ...prev,
        [normalizedKey]: [...(prev[normalizedKey] || []), newImage.permanentPath],
      }));
    };

    const removeMultiImage = (indexToRemove: number) => {
      if (!imageInputKey) return;
      const normalizedKey = normalizeKey(imageInputKey);
      let removedPath: string | null = null;

      setMultiImages((prev) => {
        removedPath = prev[indexToRemove]?.permanentPath;
        return prev.filter((_, i) => i !== indexToRemove);
      });

      if (removedPath) {
        setValues((prev) => ({
          ...prev,
          [normalizedKey]: (prev[normalizedKey] || []).filter((p: string) => p !== removedPath),
        }));
      }

      if (indexToRemove === 0) {
        sessionStorage.removeItem("initialEditImage");
      }
    };

    const otherEntries = useMemo(
      () => Object.entries(parameters).filter(([k]) => k !== "prompt"),
      [parameters],
    );

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
                  value={values["prompt"] ?? ""}
                  onChange={(e) => handleChange("prompt", e.target.value)}
                  className="hide-scrollbar min-w-[400px] pl-12"
                  placeholder={
                    parameters["prompt"]?.description ?? "A cute magical flying cat, cinematic, 4k"
                  }
                  maxHeight={100}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex w-fit flex-wrap items-center gap-2">
            {otherEntries.map(([key, param]) => {
              // Filter out the image input from this generic rendering section
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

              if (param.type === "integer") {
                return (
                  <Tooltip key={key}>
                    <TooltipTrigger asChild>
                      <div>
                        <AnimatedCounter
                          initialValue={param.default}
                          min={param.minimum}
                          max={param.maximum}
                          onChange={(v) => handleChange(key, v)}
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{param.title}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              }
              return null; // Render nothing for unhandled param types
            })}
          </div>
        </div>

        {/* --- REFACTORED: Image Rendering Logic --- */}

        {imageParam?.type === "string" && imageInputKey && (
          <ImageUploadBox
            initialImage={singleImageObject}
            onImageUploaded={({ permanentPath }) => {
              handleChange(imageInputKey, permanentPath);
            }}
            onImageRemoved={() => {
              handleChange(imageInputKey, null); // Set to null or ""
              sessionStorage.removeItem("initialEditImage");
            }}
            imageDescription="Add Image"
          />
        )}

        {/* MULTI IMAGE case manages a list */}
        {imageParam?.type === "array" && (
          <div className="flex flex-wrap gap-4">
            {/* Render previews for existing images */}
            {multiImages.map((img, idx) => {
              console.log("idx", idx);
              return (
                <div
                  key={idx}
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

            {/* Render the "Add New" box */}
            {multiImages.length < 5 && (
              <ImageUploadBox
                // A simple uploader that doesn't need to manage its own state
                onImageUploaded={({ permanentPath, displayUrl }) => {
                  addMultiImage({ permanentPath, displayUrl });
                }}
                onImageRemoved={() => {}} // Not applicable for the "add new" box
                imageDescription="Add Image"
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
