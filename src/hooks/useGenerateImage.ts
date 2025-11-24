import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { conversationData, ConversationType, InputBoxParameter } from "../types/BaseType";

type GenerationParams = {
  parameters: InputBoxParameter;
  conversationId?: string;
  modelName: string;
  modelIdentifier: string;
  modelCredit: number | null;
  modelProvider: "running_hub" | "replicate";
  conversationType: ConversationType;
  inputImagePermanentPaths: string[];
};

const generateImage = async (formData: GenerationParams) => {
  const response = await fetch("/api", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });

  const result = await response.json();
  if (!response.ok) {
    if (response.status >= 500) {
      throw new Error("network");
    }
    throw new Error(result.error || "An unknown error occurred.");
  }
  return result;
};

export function useGenerateImage(conversationType: ConversationType, conversationId?: string) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const queryKey = ["messages", conversationId];

  return useMutation({
    mutationFn: (params: GenerationParams) => generateImage(params),
    onMutate: async (newGeneration) => {
      await queryClient.cancelQueries({ queryKey });
      const previousMessages = queryClient.getQueryData<conversationData[]>(queryKey);

      // Extract prompt based on parameter type
      let userPrompt = "";
      if (Array.isArray(newGeneration.parameters)) {
        // NodeParam[] case (running_hub)
        const promptParam = newGeneration.parameters.find((p) => p.description === "prompt");
        userPrompt = promptParam?.fieldValue || "";
      } else {
        // Record<string, SchemaParam> case (replicate)
        userPrompt = (newGeneration.parameters as any).prompt || "";
      }

      const optimisticMessage: conversationData = {
        id: crypto.randomUUID(),
        userPrompt,
        job_status: "pending",
        input_images: [],
        output_images: [],
        parameters: [],
        credit_cost: 2,
        error_message: null,
        jobId: null,
        model_name: newGeneration.modelName,
      };

      queryClient.setQueryData<conversationData[]>(queryKey, (old = []) => [
        optimisticMessage,
        ...old,
      ]);

      return { previousMessages };
    },
    onError: (err, newTodo, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(queryKey, context.previousMessages);
      }
    },
    onSettled: (data) => {
      if (!conversationId && data?.conversationId) {
        router.push(`/${conversationType}/${data.conversationId}`);
      } else {
        queryClient.invalidateQueries({ queryKey });
      }
    },
    // Add retry logic for network errors
    retry: (failureCount, error) => {
      return error.message === "network" && failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
