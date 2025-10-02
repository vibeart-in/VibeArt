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
import {
  DotsThreeVerticalIcon,
  MinusCircleIcon,
  PencilSimpleIcon,
} from "@phosphor-icons/react";

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
  // The state now holds the entire array of parameters
  const [values, setValues] = useState<NodeParam[]>(parameters);
  const [showNegtivePrompt, setShowNegtivePrompt] = useState(false);
  const [enableLoraStrength, setEnableLoraStrength] = useState(false);

  // Effect to reset the state when the input `parameters` prop changes (e.g., new model selected)
  useEffect(() => {
    setValues(parameters);
  }, [parameters]);

  // Expose a function to get the current state, which is already in the desired output format
  useImperativeHandle(
    ref,
    () => ({
      getValues: () => values,
    }),
    [values]
  ); // Dependency array ensures getValues always has the latest state

  // A single, generic handler to update a parameter in the state array immutably
  const handleChange = useCallback(
    (description: string, newFieldValue: any) => {
      setValues((currentParams) =>
        currentParams.map((param) =>
          param.description === description
            ? { ...param, fieldValue: String(newFieldValue) } // Update the matching param
            : param
        )
      );
    },
    []
  );

  const promptParam = useMemo(
    () => values.find((p) => p.description === "prompt"),
    [values]
  );

  const loraParam = useMemo(
    () => values.find((p) => p.fieldName === "lora_name"),
    [values]
  );

  const otherParams = useMemo(
    () => values.filter((p) => p.description !== "prompt"),
    [values]
  );

  return (
    <div className="flex gap-2">
      <AnimatePresence>
        {loraParam && (
          <div
            // onClick={handleCardClick}
            className="w-[70px] h-[95px] z-20 rounded-2xl relative cursor-pointer transition-transform hover:scale-105 active:scale-100 overflow-hidden flex-shrink-0 group"
          >
            <div className="absolute inset-0 shadow-[inset_0_4px_18px_rgba(0,0,0,0.5)] rounded-3xl pointer-events-none"></div>

            <Image
              className="object-cover w-full h-full rounded-lg transition-all duration-300 group-hover:brightness-90"
              src={
                "https://i.pinimg.com/736x/84/27/67/842767f8e288bfd4a0cbf2977ee7661c.jpg"
              }
              alt={"selectedModel.model_name"}
              width={150}
              height={95}
            />

            <div className="absolute bottom-2 left-2 right-2 bg-black/30 rounded-md p-1 text-center transition-opacity group-hover:opacity-0">
              <p className="text-accent font-gothic text-sm font-medium truncate">
                {/* {selectedModel.model_name} */}
                Noob xl
              </p>
            </div>

            {/* Hover-only "Click to change" hint (fades in on hover) */}
            <div className="absolute inset-0 flex justify-center items-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-xs text-white/90 bg-black/50 px-2 py-1 rounded-xl">
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
              key={promptParam.nodeId + promptParam.fieldName} // Key for re-animation on model change
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="relative w-full mb-3"
            >
              <IconTerminal className="absolute top-2 left-4 text-white/80" />
              <Textarea
                value={promptParam.fieldValue}
                onChange={(e) =>
                  handleChange(promptParam.description!, e.target.value)
                }
                className="pl-12 hide-scrollbar min-w-[400px]"
                placeholder="A cute magical flying cat, cinematic, 4k"
                maxHeight={100}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="w-fit flex gap-2 flex-wrap items-center">
          {otherParams.map((param) => {
            // Unique key for each parameter
            const key = `${param.nodeId}`;

            // SELECT for aspect_ratio
            if (
              (param.fieldName === "aspect_ratio" ||
                param.fieldName === "size") &&
              param.fieldData
            ) {
              let options: string[] = [];
              try {
                // fieldData is a JSON string of a nested array, e.g., "[['1:1', '16:9']]"
                options = JSON.parse(param.fieldData)[0];
              } catch (e) {
                console.error("Failed to parse fieldData for aspect_ratio:", e);
              }
              return (
                <div key={key} className="min-w-[130px]">
                  <Select
                    value={param.fieldValue}
                    onValueChange={(val) =>
                      handleChange(param.description!, val)
                    }
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
              );
            }

            // COUNTER for integer/numeric values
            if (param.description === "batch_size") {
              return (
                <div key={key}>
                  {/* <label className="text-xs text-white/70 block mb-1">
                    {param.description}
                  </label> */}
                  <AnimatedCounter
                    initialValue={Number(param.fieldValue)}
                    // You might need to add min/max logic based on the parameter
                    min={param.description === "batch_size" ? 1 : 0}
                    max={param.description === "batch_size" ? 8 : 2}
                    //   step={param.description === "lora_strength" ? 0.1 : 1}
                    onChange={(val) => handleChange(param.description!, val)}
                  />
                </div>
              );
            }

            if (param.description === "lora_strength" && enableLoraStrength) {
              return (
                <div key={key}>
                  <label className="text-xs text-white/70 block mb-1">
                    {param.description}
                  </label>
                  <AnimatedCounter
                    initialValue={Number(param.fieldValue)}
                    min={0}
                    max={2}
                    onChange={(val) => handleChange(param.description!, val)}
                  />
                </div>
              );
            }

            // TEXTAREA for negative_prompt
            if (param.description === "negtive_prompt" && showNegtivePrompt) {
              return (
                <div key={key} className="w-full relative">
                  <MinusCircleIcon className="absolute top-2 left-4 text-white/80" />
                  <Textarea
                    value={param.fieldValue as string}
                    onChange={(e) =>
                      handleChange(param.description!, e.target.value)
                    }
                    className="pl-12 text-red-300 hide-scrollbar min-w-[400px]"
                    maxHeight={50}
                    placeholder="Negative Prompt..."
                  />
                </div>
              );
            }

            // Default to a simple INPUT for other fields like ckpt_name, lora_name
            // You can hide these by returning null if they are not meant to be user-editable

            // Render nothing for unhandled fields
            return null;
          })}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 rounded-full hover:bg-white/10 transition">
                <DotsThreeVerticalIcon className="w-5 h-5 text-white" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-black/90 backdrop-blur-sm">
              <DropdownMenuItem
                onClick={() => setShowNegtivePrompt((prev) => !prev)}
              >
                {showNegtivePrompt
                  ? "Hide Negative Prompt"
                  : "Show Negative Prompt"}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setEnableLoraStrength((prev) => !prev)}
              >
                {enableLoraStrength
                  ? "Disable Lora Strength"
                  : "Enable Lora Strength"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
});

RunninghubParameters.displayName = "RunninghubParameters";

export default React.memo(RunninghubParameters);
