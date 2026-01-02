"use client";

import { IconAspectRatio } from "@tabler/icons-react";
import { Type, Hash, ToggleLeft, Image as ImageIcon, Video as VideoIcon } from "lucide-react";
import { NodeParam } from "@/src/types/BaseType";
import { getIconForParam } from "@/src/utils/server/utils";
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
import AnimatedCounter from "@/src/components/ui/AnimatedCounter";
import ImageUploadBox from "@/src/components/ui/ImageUploadBox";
import VideoUploadBox from "@/src/components/ui/VideoUploadBox";
import { ImageObject } from "@/src/components/inputBox/ReplicateParameters";

interface AppParameterRendererProps {
  values: NodeParam[];
  handleChange: (description: string, newFieldValue: any, mediaObject?: ImageObject) => void;
  mediaObjects?: Record<string, ImageObject | null>;
  setMediaObjects?: React.Dispatch<React.SetStateAction<Record<string, ImageObject | null>>>;
  mode?: "app" | "canvas";
  inputImageUrl?: string;
}

const AppParameterRenderer = ({
  values,
  handleChange,
  mediaObjects = {},
  setMediaObjects,
  mode = "app",
  inputImageUrl,
}: AppParameterRendererProps) => {
  // Helper to render field label with icon
  const FieldLabel = ({ icon: Icon, label, required = false }: { icon?: any; label: string; required?: boolean }) => (
    <div className={mode === "canvas" ? "flex items-center gap-1.5 mb-1" : "flex items-center gap-2 mb-2"}>
      {Icon && <Icon size={mode === "canvas" ? 12 : 14} className="text-zinc-400 shrink-0" />}
      <label className={mode === "canvas" ? "text-[10px] font-medium text-zinc-400" : "text-xs font-medium text-zinc-300"}>
        {label}
        {required && <span className="ml-1 text-red-400">*</span>}
      </label>
    </div>
  );

  // Check if a parameter should be in grid layout (compact fields)
  const isGridField = (param: NodeParam) => {
    return (
      param.description === "Width" ||
      param.description === "Height" ||
      param.description === "Duration (seconds)" ||
      param.description === "Camera movement" ||
      param.description === "Object gender" ||
      param.description === "Portrait or landscape mode" ||
      (param.fieldName === "int" && param.description !== "Width" && param.description !== "Height" && param.description !== "Duration (seconds)")
    );
  };

  // Separate grid fields from regular fields
  const gridFields: NodeParam[] = [];
  const regularFields: NodeParam[] = [];

  values.forEach((param) => {
    if (param.fieldName === "image" || param.fieldName === "video") {
      regularFields.push(param);
    } else if (isGridField(param)) {
      gridFields.push(param);
    } else {
      regularFields.push(param);
    }
  });

  // Render a compact grid field
  const renderGridField = (param: NodeParam) => {
    const key = param.description;

    // Camera movement
    if (param.description === "Camera movement") {
      return (
        <Select value={param.fieldValue} onValueChange={(val) => handleChange(key, val)}>
          <SelectTrigger className={mode === "canvas" ? "w-full h-8 text-xs rounded-lg border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800/50 transition-colors" : "w-full h-10 rounded-xl border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800/50 transition-colors"}>
            <div className="flex items-center gap-2">
              {getIconForParam(param.description ?? key)}
              <SelectValue placeholder="Select movement" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value={"1"}>None</SelectItem>
              <SelectItem value={"2"}>Turn to front</SelectItem>
              <SelectItem value={"3"}>Approach</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      );
    }

    // Object gender
    if (param.description === "Object gender") {
      return (
        <Select value={param.fieldValue} onValueChange={(val) => handleChange(key, val)}>
          <SelectTrigger className={mode === "canvas" ? "w-full h-8 text-xs rounded-lg border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800/50 transition-colors" : "w-full h-10 rounded-xl border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800/50 transition-colors"}>
            <div className="flex items-center gap-2">
              {getIconForParam(param.description ?? key)}
              <SelectValue placeholder="Select gender" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value={"1"}>Women</SelectItem>
              <SelectItem value={"2"}>Man</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      );
    }

    // Portrait or landscape mode
    if (param.description === "Portrait or landscape mode") {
      return (
        <Select value={param.fieldValue} onValueChange={(val) => handleChange(key, val)}>
          <SelectTrigger className={mode === "canvas" ? "w-full h-8 text-xs rounded-lg border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800/50 transition-colors" : "w-full h-10 rounded-xl border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800/50 transition-colors"}>
            <div className="flex items-center gap-2">
              {getIconForParam(param.description ?? key)}
              <SelectValue placeholder="Select orientation" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value={"1"}>Vertical</SelectItem>
              <SelectItem value={"2"}>Landscape</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      );
    }

    // Width, Height, Duration, or generic int
    const max = param.description === "Duration (seconds)" ? 10 : param.description === "Width" || param.description === "Height" ? 1080 : undefined;
    
    return (
      <div className={mode === "canvas" ? "rounded-lg border border-zinc-700 bg-zinc-900/30 p-1.5 hover:border-zinc-600 transition-colors" : "rounded-xl border border-zinc-700 bg-zinc-900/30 p-2 hover:border-zinc-600 transition-colors"}>
        <AnimatedCounter
          initialValue={Number(param.fieldValue)}
          onChange={handleChange}
          paramKey={key!}
          max={max}
        />
      </div>
    );
  };

  return (
    <>
      {/* Regular fields */}
      {regularFields.map((param) => {
        const key = param.description;

        // Image field
        if (param.fieldName === "image") {
          if (mode === "canvas") {
            return null;
          }
          return (
            <div className="w-[150px] md:w-full" key={key}>
              <FieldLabel icon={ImageIcon} label={param.description} />
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

        // Video field
        if (param.fieldName === "video") {
          if (mode === "canvas") {
            return null;
          }
          return (
            <div className="w-[150px] md:w-full" key={key}>
              <FieldLabel icon={VideoIcon} label={param.description} />
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

        // Select fields with fieldData
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
          return (
            <div key={key} className={mode === "canvas" ? "flex h-full flex-col gap-1 py-1" : "flex h-full flex-col gap-2 py-2"}>
              <FieldLabel label={param.description} />
              <div key={param.nodeId} className="min-w-[130px]">
                <Select
                  value={param.fieldValue}
                  onValueChange={(val) => handleChange(key, val)}
                >
                  <SelectTrigger className={mode === "canvas" ? "w-full h-8 text-xs rounded-lg border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800/50 transition-colors" : "w-full h-10 rounded-xl border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800/50 transition-colors"}>
                    <div className="flex items-center gap-2">
                      {param.fieldName !== "aspect_ratio" &&
                        param.description !== "aspect_ratio" &&
                        getIconForParam(param.description ?? key)}
                      <SelectValue placeholder={`Select ${param.description.toLowerCase()}`} />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    <SelectGroup>
                      {options.map((opt) => {
                        const isAspect =
                          param.fieldName === "aspect_ratio" ||
                          param.description === "aspect_ratio";

                        const ratioRegex = /^\d+:\d+$/;
                        const isRatio = ratioRegex.test(opt);

                        let preview = null;

                        if (isAspect) {
                          if (isRatio) {
                            const [w, h] = opt.split(":").map(Number);
                            const aspectRatio = w / h;
                            const baseHeight = 16;
                            const previewWidth = baseHeight * aspectRatio;

                            preview = (
                              <div
                                className="flex-shrink-0 rounded border-2 border-zinc-600 bg-zinc-800"
                                style={{
                                  width: `${previewWidth}px`,
                                  height: `${baseHeight}px`,
                                }}
                              />
                            );
                          } else {
                            preview = <IconAspectRatio size={16} className="text-zinc-400" />;
                          }
                        }

                        return (
                          <SelectItem key={opt} value={opt} className="cursor-pointer">
                            <div className="flex items-center gap-2.5">
                              {preview}
                              <span className="text-sm font-medium">{opt}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
          );
        }

        // Character action selection
        if (param.description === "Character action selection") {
          return (
            <div key={key} className={mode === "canvas" ? "flex h-full flex-col gap-1 py-1" : "flex h-full flex-col gap-2 py-2"}>
              <FieldLabel label="Character Action" />
              <div className="min-w-[130px]">
                <Select
                  value={param.fieldValue}
                  onValueChange={(val) => handleChange(key, val)}
                >
                  <SelectTrigger className={mode === "canvas" ? "w-full h-8 text-xs rounded-lg border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800/50 transition-colors" : "w-full h-10 rounded-xl border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800/50 transition-colors"}>
                    <div className="flex items-center gap-2">
                      {getIconForParam(param.description ?? key)}
                      <SelectValue placeholder="Select action" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value={"1"}>Clean the figurine</SelectItem>
                      <SelectItem value={"2"}>Figurine sits on hands</SelectItem>
                      <SelectItem value={"3"}>Custom action</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
          );
        }

        // POV interactive preset
        if (param.description === "POV interactive preset") {
          return (
            <div key={key} className={mode === "canvas" ? "flex h-full flex-col gap-1 py-1" : "flex h-full flex-col gap-2 py-2"}>
              <FieldLabel label="POV Interactive Preset" />
              <div className="min-w-[130px]">
                <Select
                  value={param.fieldValue}
                  onValueChange={(val) => handleChange(key, val)}
                >
                  <SelectTrigger className={mode === "canvas" ? "w-full h-8 text-xs rounded-lg border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800/50 transition-colors" : "w-full h-10 rounded-xl border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800/50 transition-colors"}>
                    <div className="flex items-center gap-2">
                      {getIconForParam(param.description ?? key)}
                      <SelectValue placeholder="Select preset" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    <SelectGroup>
                      <SelectItem value={"1"}>None</SelectItem>
                      <SelectItem value={"2"}>Click me</SelectItem>
                      <SelectItem value={"3"}>Help me warm my hands</SelectItem>
                      <SelectItem value={"4"}>I look at [your]</SelectItem>
                      <SelectItem value={"5"}>Palm painting heart</SelectItem>
                      <SelectItem value={"6"}>Apply band-aid</SelectItem>
                      <SelectItem value={"7"}>I send [item]</SelectItem>
                      <SelectItem value={"8"}>Kiss me</SelectItem>
                      <SelectItem value={"9"}>Look at me</SelectItem>
                      <SelectItem value={"10"}>Take off shoes</SelectItem>
                      <SelectItem value={"11"}>Take off stockings</SelectItem>
                      <SelectItem value={"12"}>Take off shoes and hit me</SelectItem>
                      <SelectItem value={"13"}>Make my hair</SelectItem>
                      <SelectItem value={"14"}>Feed [food]</SelectItem>
                      <SelectItem value={"15"}>Quiet</SelectItem>
                      <SelectItem value={"16"}>Comb hair</SelectItem>
                      <SelectItem value={"17"}>Stethoscope</SelectItem>
                      <SelectItem value={"19"}>Make a funny face</SelectItem>
                      <SelectItem value={"20"}>Snatch my glasses</SelectItem>
                      <SelectItem value={"21"}>Hold your hand</SelectItem>
                      <SelectItem value={"22"}>Send me [item]</SelectItem>
                      <SelectItem value={"23"}>Pinch cheeks</SelectItem>
                      <SelectItem value={"24"}>Combo punch me</SelectItem>
                      <SelectItem value={"26"}>Sit down and cross your legs</SelectItem>
                      <SelectItem value={"29"}>Continuous shooting</SelectItem>
                      <SelectItem value={"31"}>Stretching</SelectItem>
                      <SelectItem value={"32"}>Pick up things</SelectItem>
                      <SelectItem value={"33"}>Make your hair</SelectItem>
                      <SelectItem value={"34"}>Bow</SelectItem>
                      <SelectItem value={"35"}>Fall down</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
          );
        }

        // Boolean field
        if (param.fieldName === "boolean") {
          return (
            <div key={key} className={mode === "canvas" ? "flex h-full flex-col gap-1 py-1" : "flex h-full flex-col gap-2 py-2"}>
              <FieldLabel icon={ToggleLeft} label={param.description} />
              <div className={mode === "canvas" ? "flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900/30 p-2 hover:border-zinc-600 transition-colors" : "flex items-center gap-3 rounded-xl border border-zinc-700 bg-zinc-900/30 p-3 hover:border-zinc-600 transition-colors"}>
                <Switch
                  checked={param.fieldValue === "true"}
                  onCheckedChange={(value) => handleChange(key, value ? "true" : "false")}
                />
                <span className="text-xs text-zinc-400">
                  {param.fieldValue === "true" ? "Enabled" : "Disabled"}
                </span>
              </div>
            </div>
          );
        }

        // Prompt/Text field
        if (
          param.fieldName === "prompt" ||
          param.fieldName === "text" ||
          param.description === "Prompt"
        ) {
          return (
            <div key={key} className={mode === "canvas" ? "flex h-full flex-col gap-1 py-1" : "flex h-full flex-col gap-2 py-2"}>
              <FieldLabel icon={Type} label={param.description} />
              <Textarea
                value={param.fieldValue as string}
                onChange={(e) => handleChange(key, e.target.value)}
                className={mode === "canvas" 
                  ? "hide-scrollbar min-h-[60px] min-w-[180px] resize-none rounded-lg border-zinc-700 bg-zinc-900/30 px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-500 focus:border-indigo-500/50 focus:bg-zinc-900/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                  : "hide-scrollbar min-h-[80px] min-w-[200px] resize-none rounded-xl border-zinc-700 bg-zinc-900/30 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-indigo-500/50 focus:bg-zinc-900/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                }
                placeholder={`Enter ${param.description.toLowerCase()}...`}
                maxHeight={mode === "canvas" ? 80 : 120}
              />
              {mode === "app" && (
                <p className="text-[10px] text-zinc-500 mt-1">
                  {(param.fieldValue as string)?.length || 0} characters
                </p>
              )}
            </div>
          );
        }

        return null;
      })}

      {/* Grid fields - 2 per row */}
      {gridFields.length > 0 && (
        <div className={mode === "canvas" ? "grid grid-cols-2 gap-2 py-1" : "grid grid-cols-2 gap-3 py-2"}>
          {gridFields.map((param) => {
            const key = param.description;
            return (
              <div key={key} className="flex flex-col gap-1">
                <FieldLabel icon={Hash} label={param.description === "Object gender" ? "Gender" : param.description} />
                {renderGridField(param)}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};

export default AppParameterRenderer;
