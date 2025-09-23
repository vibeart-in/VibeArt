import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import { IconTerminal } from "@tabler/icons-react";
import { AnimatePresence, motion } from "motion/react"; // Note: Use framer-motion, not motion/react
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
import { Input } from "../ui/input"; // Assuming you have a basic Input component

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

  // Effect to reset the state when the input `parameters` prop changes (e.g., new model selected)
  useEffect(() => {
    setValues(parameters);
  }, [parameters]);

  // Expose a function to get the current state, which is already in the desired output format
  useImperativeHandle(ref, () => ({
    getValues: () => values,
  }), [values]); // Dependency array ensures getValues always has the latest state

  // A single, generic handler to update a parameter in the state array immutably
  const handleChange = useCallback((description: string, newFieldValue: any) => {
    setValues((currentParams) =>
      currentParams.map((param) =>
        param.description === description
          ? { ...param, fieldValue: String(newFieldValue) } // Update the matching param
          : param
      )
    );
  }, []);

  // Separate the prompt from other parameters for special layout treatment
  console.log(values)
  const promptParam = useMemo(
    () => values.find((p) => p.description === "prompt"),
    [values]
  );

  const otherParams = useMemo(
    () => values.filter((p) => p.description !== "prompt"),
    [values]
  );

  return (
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
              onChange={(e) => handleChange(promptParam.description!, e.target.value)}
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
          const key = `${param.nodeId}-${param.fieldName}-${param.description}`;
          
          // --- RENDER LOGIC BASED ON fieldName or description ---

          // SELECT for aspect_ratio
          if ((param.fieldName === "aspect_ratio" || param.fieldName === "size") && param.fieldData) {
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
                  onValueChange={(val) => handleChange(param.description!, val)}
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
          if (
            param.description === "batch_size" ||
            param.description === "lora_strength"
          ) {
            return (
              <div key={key}>
                <label className="text-xs text-white/70 block mb-1">{param.description}</label>
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

          // TEXTAREA for negative_prompt
          if (param.description === "negtive_prompt") {
             return (
              <div key={key} className="w-full">
                <Textarea
                  value={param.fieldValue}
                  onChange={(e) => handleChange(param.description!, e.target.value)}
                  placeholder="Negative Prompt..."
                  maxHeight={80}
                  className="text-sm"
                />
              </div>
             )
          }

          // Default to a simple INPUT for other fields like ckpt_name, lora_name
          // You can hide these by returning null if they are not meant to be user-editable
          if (
            param.fieldName === 'text' ||
            param.fieldName === 'ckpt_name' ||
            param.fieldName === 'lora_name'
          ) {
            return (
               <div key={key}>
                 <label className="text-xs text-white/70 block mb-1 capitalize">
                   {param.description?.replace(/_/g, ' ')}
                 </label>
                 <Input
                   value={param.fieldValue}
                   onChange={(e) => handleChange(param.description!, e.target.value)}
                   className="min-w-[150px]"
                 />
               </div>
            )
          }

          // Render nothing for unhandled fields
          return null;
        })}
      </div>
    </div>
  );
});

RunninghubParameters.displayName = "RunninghubParameters";

export default React.memo(RunninghubParameters);