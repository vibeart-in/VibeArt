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
  };
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
          const { values, inputImages } = replicateParamsRef.current.getValues();
          return { values, inputImages, promptText: values.prompt || "" };
        }

        if (selectedModel.provider === "running_hub") {
          if (!runninghubParamsRef.current) throw new Error("Runninghub parameters not ready");
          const { values, inputImages } = runninghubParamsRef.current.getValues();
          const promptParam = values.find((p: any) => p.description === "prompt");
          return { values, inputImages, promptText: promptParam?.fieldValue || "" };
        }

        // Fallback for unsupported provider
        throw new Error(`Unsupported provider: ${selectedModel.provider}`);
      },
    }));

    console.log("Rendering ParametersSection"); // For debugging

    if (selectedModel.provider === "replicate") {
      return (
        <ReplicateParameters
          key={selectedModel.identifier} // Add a key to reset state when model changes
          parameters={selectedModel.parameters as any}
          modelName={selectedModel.model_name}
          ref={replicateParamsRef}
        />
      );
    }

    if (selectedModel.provider === "running_hub") {
      return (
        <RunninghubParameters
          key={selectedModel.identifier} // Add a key to reset state when model changes
          parameters={selectedModel.parameters as any}
          modelName={selectedModel.model_name}
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
