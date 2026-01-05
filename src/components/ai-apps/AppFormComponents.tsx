"use client";

import React from "react";
import { IconAspectRatio } from "@tabler/icons-react";
import { Type, Hash, ToggleLeft, Image as ImageIcon, Video as VideoIcon, Sparkles } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Switch } from "@/src/components/ui/switch";
import { Textarea } from "@/src/components/ui/textarea";
import { Label } from "@/src/components/ui/label";
import AnimatedCounter from "@/src/components/ui/AnimatedCounter";
import ImageUploadBox from "@/src/components/ui/ImageUploadBox";
import VideoUploadBox from "@/src/components/ui/VideoUploadBox";
import { ImageObject } from "@/src/components/inputBox/ReplicateParameters";
import { NodeParam } from "@/src/types/BaseType";
import { getIconForParam } from "@/src/utils/server/utils";

// --- Types ---
interface AppParamTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

interface AppParamSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  options: (string | { label: string; value: string })[];
  className?: string; // Class for the wrapper container
  triggerIcon?: React.ReactNode; // Icon to display in the trigger
  renderOption?: (option: string | { label: string; value: string }) => React.ReactNode; // Custom renderer for options
  triggerClassName?: string; // Class for the trigger element
}

interface AppSectionLabelProps {
  text: string;
}

interface AppParameterRendererProps {
    values: NodeParam[];
    handleChange: (description: string, newFieldValue: any, mediaObject?: ImageObject) => void;
    mediaObjects?: Record<string, ImageObject | null>;
    setMediaObjects?: React.Dispatch<React.SetStateAction<Record<string, ImageObject | null>>>;
    mode?: "app" | "canvas";
    inputImageUrl?: string;
  }

// --- Components ---

export const AppSectionLabel = ({ text }: AppSectionLabelProps) => {
  return (
    <div className="flex items-center gap-2 ml-1">
      <div className="h-1 w-1 rounded-full bg-[#CCFF00]" />
      <Label className="text-[13px] font-bold text-zinc-400 uppercase tracking-wider">
        {text}
      </Label>
    </div>
  );
};

export const AppParamTextarea = ({
  value,
  onChange,
  placeholder,
  className,
}: AppParamTextareaProps) => {
  return (
    <div className="relative group w-full">
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={className}
        placeholder={placeholder}
      />
    </div>
  );
};

export const AppParamSelect = ({
  value,
  onValueChange,
  placeholder,
  options,
  className,
  triggerIcon,
  renderOption,
  triggerClassName,
}: AppParamSelectProps) => {
  const defaultTriggerClass = "h-11 w-full rounded-2xl border-zinc-800 bg-[#1A1A1A] text-xs font-semibold text-zinc-300 hover:bg-zinc-800/50 transition-colors";
  
  return (
    <div className={`${className}`}>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className={triggerClassName || defaultTriggerClass}>
          {triggerIcon && <span className="mr-2">{triggerIcon}</span>}
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="bg-[#1A1A1A] border-zinc-800">
          {options.map((opt) => {
             const label = typeof opt === 'string' ? opt : opt.label;
             const val = typeof opt === 'string' ? opt : opt.value;
             return (
                 <SelectItem key={val} value={val}>
                    {renderOption ? renderOption(opt) : <span className="text-xs">{label}</span>}
                 </SelectItem>
             );
          })}
        </SelectContent>
      </Select>
    </div>
  );
};

export const AppParameterRenderer = ({
    values,
    handleChange,
    mediaObjects = {},
    setMediaObjects,
    mode = "app",
    inputImageUrl,
  }: AppParameterRendererProps) => {
  
    return (
      <>
        {values.map((param) => {
          const key = param.description;
          const isCanvas = mode === "canvas";
  
          // --- Image Field ---
          if (param.fieldName === "image") {
            if (isCanvas) return null; // Image is handled separately in canvas
            return (
              <div className="w-[150px] md:w-full" key={key}>
                <ImageUploadBox
                  onImageUploaded={(image) => {
                    handleChange(key, image.displayUrl, image);
                  }}
                  onImageRemoved={() => {
                    handleChange(key, "");
                    setMediaObjects?.((prev) => ({ ...prev, [key]: null }));
                    sessionStorage.removeItem("initialEditImage");
                  }}
                  initialImage={mediaObjects[key]}
                  imageDescription={param.description}
                />
              </div>
            );
          }
  
          // --- Video Field ---
          if (param.fieldName === "video") {
            if (isCanvas) return null;
            return (
              <div className="w-[150px] md:w-full" key={key}>
                <VideoUploadBox
                  onVideoUploaded={(video) => {
                    handleChange(key, video.displayUrl, video);
                  }}
                  onVideoRemoved={() => {
                    handleChange(key, "");
                    setMediaObjects?.((prev) => ({ ...prev, [key]: null }));
                    sessionStorage.removeItem("initialEditImage");
                  }}
                  videoDescription={param.description}
                />
              </div>
            );
          }

          // --- Common Select Fields (aspect_ratio, size, select, model_selected) ---
          if (
            (param.fieldName === "aspect_ratio" ||
              param.fieldName === "size" ||
              param.fieldName === "select" ||
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

            if (isCanvas) {
                 return (
                    <div key={key} className="flex flex-col gap-2.5">
                        <AppSectionLabel text={param.description} />
                        <AppParamSelect
                            value={String(param.fieldValue)}
                            onValueChange={(val) => handleChange(key, val)}
                            placeholder={param.description}
                            options={options}
                        />
                    </div>
                 )
            }

            return (
              <div key={key} className="flex h-full flex-col justify-between gap-2 py-2">
                <span className="text-center text-sm font-semibold">{param.description}</span>
                <AppParamSelect
                    key={param.nodeId}
                    className="min-w-[130px]"
                    triggerClassName="w-full h-10 rounded-md border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={String(param.fieldValue)}
                    onValueChange={(val) => handleChange(key, val)}
                    placeholder={param.description}
                    options={options}
                    triggerIcon={param.fieldName !== "aspect_ratio" && param.description !== "aspect_ratio" ? getIconForParam(param.description ?? key) : null}
                    renderOption={(opt) => {
                        const optionLabel = typeof opt === 'string' ? opt : opt.label;
                        // Aspect Ratio Logic
                        const isAspect = param.fieldName === "aspect_ratio" || param.description === "aspect_ratio";
                        const ratioRegex = /^\d+:\d+$/;
                        const isRatio = ratioRegex.test(optionLabel);
                        
                        let preview = null;
                        if (isAspect) {
                            if (isRatio) {
                                const [w, h] = optionLabel.split(":").map(Number);
                                const aspectRatio = w / h;
                                const baseHeight = 15;
                                const previewWidth = baseHeight * aspectRatio;
                                preview = (
                                    <div
                                        className="flex-shrink-0 rounded-sm border border-gray-400 bg-muted"
                                        style={{ width: `${previewWidth}px`, height: `${baseHeight}px` }}
                                    />
                                );
                            } else {
                                preview = <IconAspectRatio size={15} />;
                            }
                        }
                        
                        return (
                            <div className="flex items-center gap-2">
                                {preview}
                                <span className="text-sm">{optionLabel}</span>
                            </div>
                        );
                    }}
                />
              </div>
            );
          }
  
          // --- Specific Select Fields (Portrait/Landscape, Camera, Gender, Action, POV) ---
          const specificSelects = [
             { desc: "Portrait or landscape mode", options: [{ label: "Vertical", value: "1" }, { label: "Landscape", value: "2" }] },
             { desc: "Camera movement", options: [{ label: "None", value: "1" }, { label: "Turn to front", value: "2" }, { label: "Approach", value: "3" }] },
             { desc: "Object gender", options: [{ label: "Women", value: "1" }, { label: "Mam", value: "2" }] },
             { desc: "Character action selection", options: [{ label: "Clean the figurine", value: "1" }, { label: "Figurine sits on hands", value: "2" }, { label: "Custom action", value: "3" }] },
             { desc: "POV interactive preset", options: [
                { label: "None", value: "1" },
                { label: "Click me", value: "2" },
                { label: "Help me warm my hands", value: "3" },
                { label: "I look at [your]", value: "4" },
                { label: "Palm painting heart", value: "5" },
                { label: "Apply band-aid", value: "6" },
                { label: "I send [item]", value: "7" },
                { label: "Kiss me", value: "8" },
                { label: "Look at me", value: "9" },
                { label: "Take off shoes", value: "10" },
                { label: "Take off stockings", value: "11" },
                { label: "Take off shoes and hit me", value: "12" },
                { label: "Make my hair", value: "13" },
                { label: "Feed [food]", value: "14" },
                { label: "Quiet", value: "15" },
                { label: "Comb hair", value: "16" },
                { label: "Stethoscope", value: "17" },
                { label: "Make a funny face", value: "19" },
                { label: "Snatch my glasses", value: "20" },
                { label: "Hold your hand", value: "21" },
                { label: "Send me [item]", value: "22" },
                { label: "Pinch cheeks", value: "23" },
                { label: "Combo punch me", value: "24" },
                { label: "Sit down and cross your legs", value: "26" },
                { label: "Continuous shooting", value: "29" },
                { label: "Stretching", value: "31" },
                { label: "Pick up things", value: "32" },
                { label: "Make your hair", value: "33" },
                { label: "Bow", value: "34" },
                { label: "Fall down", value: "35" }
             ]}
          ];

          const matchedSelect = specificSelects.find(s => s.desc === param.description);
          if (matchedSelect) {
              if (isCanvas && param.description === "Portrait or landscape mode") return null; // Often hidden or handled specially in partial updates? Or stick to simple.

              // Node Design
              if (isCanvas) {
                   return (
                      <div key={key} className="flex flex-col gap-2.5">
                          <AppSectionLabel text={param.description} />
                          <AppParamSelect
                                value={String(param.fieldValue)}
                                onValueChange={(val) => handleChange(key, val)}
                                placeholder={param.description}
                                options={matchedSelect.options}
                          />
                      </div>
                   );
              }

              // App Input Design
              return (
                  <div key={key} className="flex h-full flex-col justify-between gap-2 py-2">
                    <span className="text-center text-sm font-semibold">{param.description === "Object gender" ? "Gender" : param.description}</span>
                    <AppParamSelect
                        className="min-w-[130px]"
                        triggerClassName="w-full h-10 rounded-md border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={String(param.fieldValue)}
                        onValueChange={(val) => handleChange(key, val)}
                        placeholder={param.description}
                        options={matchedSelect.options}
                        triggerIcon={getIconForParam(param.description ?? key)}
                    />
                  </div>
              );
          }
  
          // --- Boolean Field ---
          if (param.fieldName === "boolean") {
            if (isCanvas) {
                 return (
                    <div key={key} className="flex flex-col gap-2.5">
                        <AppSectionLabel text={param.description} />
                         <Switch
                            checked={param.fieldValue === "true"}
                            onCheckedChange={(value) => handleChange(key, value ? "true" : "false")}
                         />
                    </div>
                 )
            }
            return (
              <div key={key} className="flex h-full flex-col justify-between gap-2 py-2">
                <span className="text-center text-xs font-semibold">{param.description}</span>
                <div className="px-2">
                  <Switch
                    checked={param.fieldValue === "true"}
                    onCheckedChange={(value) => handleChange(key, value ? "true" : "false")}
                  />
                </div>
              </div>
            );
          }

           // --- Int / Counter Fields ---
           const isWidthHeight = param.description === "Width" || param.description === "Height";
           const isDuration = param.description === "Duration (seconds)";
           
           if (param.fieldName === "int" || isWidthHeight || isDuration) {
               const max = isDuration ? 10 : isWidthHeight ? 1080 : undefined;

               if (isCanvas) {
                   return (
                       <div key={key} className="flex flex-col gap-2.5">
                           <AppSectionLabel text={param.description} />
                           <AnimatedCounter
                                initialValue={Number(param.fieldValue)}
                                onChange={handleChange}
                                paramKey={key!}
                                max={max}
                           />
                       </div>
                   )
               }
               
               return (
                  <div key={key} className="flex h-full flex-col justify-between gap-2 py-2">
                    <span className="text-center text-xs font-semibold">{param.description}</span>
                    <div className={!isWidthHeight && !isDuration ? "px-2" : ""}>
                      <AnimatedCounter
                        initialValue={Number(param.fieldValue)}
                        onChange={handleChange}
                        paramKey={key!}
                        max={max}
                      />
                    </div>
                  </div>
               )
           }
  
          // --- Prompt / Text Fields ---
          if (
            param.fieldName === "prompt" ||
            param.fieldName === "text" ||
            param.description === "Prompt"
          ) {
            if (isCanvas) {
                return (
                    <div key={key} className="flex flex-col gap-2.5">
                        <AppSectionLabel text={param.description} />
                        <AppParamTextarea
                            value={param.fieldValue as string}
                            onChange={(val) => handleChange(key, val)}
                            placeholder={`Type your ${param.description.toLowerCase()}...`}
                        />
                    </div>
                );
            }

            return (
              <div key={key} className="flex h-full flex-col justify-between gap-2 py-2">
                <span className="text-center text-xs font-semibold">{param.description}</span>
                <AppParamTextarea
                  value={param.fieldValue as string}
                  onChange={(val) => handleChange(key, val)}
                  className="hide-scrollbar max-h-[60px] min-w-[200px] border pl-4 bg-background"
                  placeholder={param.description}
                />
              </div>
            );
          }
  
          return null;
        })}
      </>
    );
  };
