import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import { SchemaParam } from "@/src/types/BaseType";
import { IconTerminal } from "@tabler/icons-react";
import { AnimatePresence, motion } from "motion/react";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import AnimatedCounter from "../ui/AnimatedCounter";
import { Switch } from "../ui/switch";
import { RatioIcon } from "lucide-react";
import {
  FrameCornersIcon,
  LightningIcon,
  GearIcon,
  ImageIcon,
  PaintBrushIcon,
  SparkleIcon,
  XIcon,
} from "@phosphor-icons/react";
import Image from "next/image";
import ImageUploadBox from "../ui/ImageUploadBox";

const getIconForParam = (title: string) => {
  const titleLower = title.toLowerCase();

  if (titleLower.includes("aspect") || titleLower.includes("ratio")) {
    return <RatioIcon size={15} />;
  }
  if (
    titleLower.includes("magic_prompt_option") ||
    titleLower.includes("enhance")
  ) {
    return <SparkleIcon size={15} weight="regular" />;
  }
  if (titleLower.includes("resolution") || titleLower.includes("output")) {
    return <ImageIcon size={15} weight="regular" />;
  }
  if (titleLower.includes("steps") || titleLower.includes("config")) {
    return <GearIcon size={15} weight="regular" />;
  }
  if (titleLower.includes("speed_mode") || titleLower.includes("fast")) {
    return <LightningIcon size={15} weight="regular" />;
  }
  if (titleLower.includes("style") || titleLower.includes("style")) {
    return <PaintBrushIcon size={15} weight="regular" />;
  }

  // Default fallback
  return <FrameCornersIcon size={15} weight="regular" />;
};

interface ReplicateParametersProps {
  parameters: Record<string, SchemaParam>;
}

export interface ReplicateParametersHandle {
  getValues: () => Record<string, any>;
}

const normalizeKey = (k: string) => k.replace(/\s+/g, "_").toLowerCase();

export const ReplicateParameters = forwardRef<
  ReplicateParametersHandle,
  ReplicateParametersProps
>(({ parameters }, ref) => {
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

  useEffect(() => {
    setValues(initialValues);

    // Reset image states when parameters change
    const imageInputKey = parameters["image input"]
      ? "image input"
      : "input image";
    const imageParam = parameters[imageInputKey];

    if (imageParam?.type === "string") {
      setSingleImageUrl(imageParam.default || null);
    } else if (imageParam?.type === "array") {
      setMultiImages(
        Array.isArray(imageParam.default) ? imageParam.default : []
      );
    }
  }, [initialValues, parameters]);

  useImperativeHandle(ref, () => ({
    getValues: () => values,
  }));

  const handleChange = useCallback(
    (rawKey: string, v: any) => {
      const key = normalizeKey(rawKey);
      setValues((prev) => ({ ...prev, [key]: v }));
    },
    [setValues]
  );

  const otherEntries = useMemo(
    () => Object.entries(parameters).filter(([k]) => k !== "prompt"),
    [parameters]
  );

  const [singleImageUrl, setSingleImageUrl] = useState<string | null>(() => {
    // Initialize with default value if it exists for single image inputs
    const imageInputKey = parameters["image input"]
      ? "image input"
      : "input image";
    const imageParam = parameters[imageInputKey];
    if (imageParam?.type === "string" && imageParam.default) {
      return imageParam.default;
    }
    return null;
  });

  const handleUpload = (url: string) => {
    console.log("Upload complete! Signed URL:", url);
    setSingleImageUrl(url);
    // Update the form values as well
    const key = parameters["image input"] ? "image input" : "input image";
    handleChange(key, url);
  };

  const [multiImages, setMultiImages] = useState<string[]>(() => {
    // Initialize with default value if it exists for array image inputs
    const imageInputKey = parameters["image input"]
      ? "image input"
      : "input image";
    const imageParam = parameters[imageInputKey];
    if (imageParam?.type === "array" && Array.isArray(imageParam.default)) {
      return imageParam.default;
    }
    return [];
  });

  const addImage = (imageLink: string) => {
    const newImages = [...multiImages, imageLink].slice(0, 5);
    const key = parameters["image input"] ? "image input" : "input image";
    setMultiImages(newImages);
    handleChange(key, newImages);
  };

  const removeImage = (index: number) => {
    const key = parameters["image input"] ? "image input" : "input image";
    const newImages = multiImages.filter((_, i) => i !== index);
    setMultiImages(newImages);
    handleChange(key, newImages); // keep parent in sync
  };

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
              className="relative w-full mb-3"
            >
              <IconTerminal className="absolute top-2 left-4 text-white/80" />
              <Textarea
                value={values["prompt"] ?? ""}
                onChange={(e) => handleChange("prompt", e.target.value)}
                className="pl-12 hide-scrollbar min-w-[400px]"
                placeholder={
                  (parameters["prompt"]?.description as string) ??
                  "A cute magical flying cat, cinematic, 4k"
                }
                maxHeight={100}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="w-fit flex gap-2 flex-wrap">
          {otherEntries.map(([key, param]) => {
            const value = values[normalizeKey(key)];

            // enum -> Select
            if (param.enum) {
              return (
                <div key={key} className="min-w-[50px]">
                  <Select
                    value={value}
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
                            <SelectItem key={opt} value={opt}>
                              {opt}
                            </SelectItem>
                          ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              );
            }

            // boolean -> Switch
            if (param.type === "boolean") {
              return (
                <div key={key} className="flex items-center gap-2">
                  <span className="text-sm">{param.title}</span>
                  <Switch
                    checked={!!value}
                    onCheckedChange={(v) => handleChange(key, v)}
                  />
                </div>
              );
            }

            // integer -> AnimatedCounter
            if (param.type === "integer") {
              return (
                <AnimatedCounter
                  key={key}
                  initialValue={value}
                  min={param.minimum}
                  max={param.maximum}
                  onChange={(v) => handleChange(key, v)}
                />
              );
            }
          })}
        </div>
      </div>
      {(parameters["image input"]?.type === "string" ||
        parameters["input image"]?.type === "string") && (
        <div className="flex gap-2">
          {!singleImageUrl && (
            <ImageUploadBox onUploadComplete={handleUpload} />
          )}
          {singleImageUrl && (
            <div className="w-[100px] h-[100px] relative bg-black border border-white/30 rounded-3xl p-1.5 group">
              <Image
                src={singleImageUrl}
                alt="Uploaded preview"
                width={80}
                height={80}
                className="w-full h-full object-cover object-top rounded-[20px]"
              />
              <button
                onClick={() => setSingleImageUrl(null)}
                className="absolute top-2 right-2 bg-black bg-opacity-50 rounded-full p-1 
                         text-white opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Remove image"
              >
                <XIcon size={16} />
              </button>
            </div>
          )}
        </div>
      )}

      {(parameters["image input"]?.type === "array" ||
        parameters["input image"]?.type === "array") && (
        <div className="flex gap-4 flex-wrap">
          {multiImages.map((img, idx) => (
            <div
              key={idx}
              className="w-[100px] h-[100px] relative bg-black border border-white/30 rounded-3xl p-1.5 group"
            >
              <Image
                src={img}
                alt={`uploaded-${idx}`}
                width={80}
                height={80}
                className="w-full h-full object-cover object-top rounded-[20px]"
              />
              <button
                onClick={() => removeImage(idx)}
                className="absolute top-2 right-2 bg-black bg-opacity-50 rounded-full p-1 
                         text-white opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Remove image"
              >
                <XIcon size={16} />
              </button>
            </div>
          ))}

          {multiImages.length < 5 && (
            <ImageUploadBox onUploadComplete={addImage} />
          )}
        </div>
      )}
    </div>
  );
});

ReplicateParameters.displayName = "ReplicateParameters";

export default React.memo(ReplicateParameters);
