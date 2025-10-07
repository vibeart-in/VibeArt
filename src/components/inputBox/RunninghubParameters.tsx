import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
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

interface RunninghubParametersProps {
  parameters: NodeParam[];
}

export interface RunninghubParametersHandle {
  getValues: () => NodeParam[];
}

export const RunninghubParameters = forwardRef<
  RunninghubParametersHandle,
  RunninghubParametersProps
>(({ parameters }, ref) => {
  const [values, setValues] = useState<NodeParam[]>(parameters);
  const [showNegativePrompt, setShowNegativePrompt] = useState(false);
  const [enableLoraStrength, setEnableLoraStrength] = useState(false);

  useEffect(() => {
    setValues(parameters);
  }, [parameters]);

  useImperativeHandle(
    ref,
    () => ({
      getValues: () => values,
    }),
    [values],
  );

  const handleChange = useCallback((nodeId: string, newFieldValue: any) => {
    setValues((currentParams) =>
      currentParams.map((param) =>
        param.nodeId === nodeId ? { ...param, fieldValue: String(newFieldValue) } : param,
      ),
    );
  }, []);

  const promptParam = useMemo(() => values.find((p) => p.description === "prompt"), [values]);

  const loraParam = useMemo(() => values.find((p) => p.fieldName === "lora_name"), [values]);

  const otherParams = useMemo(() => values.filter((p) => p.description !== "prompt"), [values]);

  const hasNegativePromptParam = useMemo(
    () => values.some((p) => p.description === "negtive_prompt"),
    [values],
  );

  const hasLoraStrengthParam = useMemo(
    () => values.some((p) => p.description === "lora_strength"),
    [values],
  );

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
                value={promptParam.fieldValue}
                onChange={(e) => handleChange(promptParam.nodeId, e.target.value)}
                className="hide-scrollbar min-w-[400px] pl-12"
                placeholder="A cute magical flying cat, cinematic, 4k"
                maxHeight={100}
              />
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
                        onChange={(val) => handleChange(param.nodeId, val)}
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
                        onChange={(val) => handleChange(param.nodeId!, val)}
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

          {/* --- FIX START --- */}
          {/* 2. Only render the DropdownMenu if at least one of its controlled parameters exists */}
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
    </div>
  );
});

RunninghubParameters.displayName = "RunninghubParameters";

export default React.memo(RunninghubParameters);
