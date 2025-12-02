import React, { useImperativeHandle, useRef, forwardRef } from "react";

import { ModelData } from "@/src/types/BaseType";

import ReplicateParameters, { ReplicateParametersHandle } from "./ReplicateParameters";
import RunninghubParameters, { RunninghubParametersHandle } from "./RunninghubParameters";
// Adjust path

interface ParametersSectionProps {
  selectedModel: ModelData;
}

export interface ParametersSectionHandle {
  getValues: () => {
    values: any; // Use a more specific type if possible
    inputImages: string[];
    promptText: string;
    currentImage?: any; // ImageObject | null
    allImageObjects?: any[]; // ImageObject[]
    selectedPreset?: any; // PresetData | null
  };
  clearPrompt: () => void;
}

const ParametersSection = forwardRef<ParametersSectionHandle, ParametersSectionProps>(
  ({ selectedModel }, ref) => {
    const replicateParamsRef = useRef<ReplicateParametersHandle>(null);
    const runninghubParamsRef = useRef<RunninghubParametersHandle>(null);

    // This hook exposes a function to the parent component via the ref
    useImperativeHandle(ref, () => ({
      getValues: () => {
        if (selectedModel.provider === "replicate") {
          if (!replicateParamsRef.current) throw new Error("Replicate parameters not ready");
          const { values, inputImages, currentImage, allImageObjects, selectedPreset } = replicateParamsRef.current.getValues();
          return { values, inputImages, promptText: values.prompt || "", currentImage, allImageObjects, selectedPreset };
        }

        if (selectedModel.provider === "running_hub") {
          if (!runninghubParamsRef.current) throw new Error("Runninghub parameters not ready");
          const { values, inputImages, currentImage, allImageObjects, selectedPreset } = runninghubParamsRef.current.getValues();
          const promptParam = values.find(
            (p: any) => p.description === "prompt" || p.fieldName === "prompt",
          );
          return {
            values,
            inputImages,
            promptText: promptParam?.fieldValue || "",
            currentImage,
            allImageObjects,
            selectedPreset,
          };
        }

        // Fallback for unsupported provider
        throw new Error(`Unsupported provider: ${selectedModel.provider}`);
      },
      clearPrompt: () => {
        if (selectedModel.provider === "replicate") {
          replicateParamsRef.current?.clearPrompt?.();
          return;
        }
        if (selectedModel.provider === "running_hub") {
          runninghubParamsRef.current?.clearPrompt?.();
          return;
        }
      },
    }));

    console.log("Rendering ParametersSection"); // For debugging

    if (selectedModel.provider === "replicate") {
      return (
        <ReplicateParameters
          key={selectedModel.id}
          parameters={selectedModel.parameters as any}
          modelName={selectedModel.model_name}
          identifier={selectedModel.identifier}
          ref={replicateParamsRef}
        />
      );
    }

    if (selectedModel.provider === "running_hub") {
      return (
        <RunninghubParameters
          key={selectedModel.id}
          parameters={selectedModel.parameters as any}
          modelName={selectedModel.model_name}
          identifier={selectedModel.identifier}
          ref={runninghubParamsRef}
        />
      );
    }

    // Render nothing if provider is not supported
    return null;
  },
);

ParametersSection.displayName = "ParametersSection";
export default ParametersSection;
