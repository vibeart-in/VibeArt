import { useState, useEffect } from "react";
import { toast } from "sonner";
import { fetchModelByName } from "@/src/actions/canvas/fetchModel";
import { useGenerateImage } from "./useGenerateImage";
import { useConversationMessages } from "./useConversationMessages";

type GenerationState = "idle" | "loading" | "polling" | "running" | "success" | "error";

interface UseCanvasGenerationProps {
  onSuccess?: (imageUrl: string, width: number, height: number) => void;
}

export function useCanvasGeneration({ onSuccess }: UseCanvasGenerationProps = {}) {
  const [status, setStatus] = useState<GenerationState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0); 

  const [conversationId, setConversationId] = useState<string | null>(null);

  // Use the standard generation hook with skipRedirect option
  const { mutateAsync: generateMutation } = useGenerateImage("generate", conversationId || undefined, { skipRedirect: true });

  // Use the standard messages hook to track progress (optimistic + realtime)
  const { data: messages } = useConversationMessages(conversationId || "");

  // Sync status from messages
  useEffect(() => {
    if (!messages || messages.length === 0) return;

    const latestMessage = messages[0];
    const jobStatus = latestMessage.job_status?.toLowerCase();

    if (jobStatus === "succeeded") {
        if (latestMessage.output_images && latestMessage.output_images.length > 0) {
            const validImage = latestMessage.output_images[0];
            setStatus("success");
            onSuccess?.(validImage.imageUrl, validImage.width || 1024, validImage.height || 1024);
        }
    } else if (jobStatus === "failed") {
        setStatus("error");
        setError(latestMessage.error_message || "Generation failed");
        toast.error(latestMessage.error_message || "Generation failed");
    } else if (jobStatus === "running" || jobStatus === "processing") {
        setStatus("running");
    } else if (jobStatus === "pending") {
        setStatus("polling");
    }
  }, [messages, onSuccess]);

  const generate = async (prompt: string, inputImage?: string, inputImageNodeId?: string) => {
    try {
      setStatus("loading");
      setError(null);
      setProgress(0);
      setConversationId(null);

      // 1. Fetch Model (keeping the robust Seedream logic)
      const model = await fetchModelByName("Seedream 4 Fast");
      if (!model) {
        throw new Error("Model 'Seedream 4 Fast' not found.");
      }

      // 2. Prepare Parameters
      let finalParameters: any[] = [];
      try {
        const defaultParams = typeof model.parameters === 'string' ? JSON.parse(model.parameters) : model.parameters;
        if (Array.isArray(defaultParams)) {
             finalParameters = defaultParams.map((p: any) => {
                 const desc = p.description?.toLowerCase() || "";
                 
                 // Inject Prompt
                 if (desc.includes("prompt") && !desc.includes("negative")) {
                     return { ...p, fieldValue: prompt };
                 }

                 // Inject Input Image
                 if (inputImage && (desc.includes("image") || desc.includes("input") || desc.includes("init")) && !desc.includes("mask") && !desc.includes("control")) {
                     return { ...p, fieldValue: inputImage };
                 }
                 
                 return p;
             });
        }
      } catch (e) {
          console.error("Error parsing model parameters", e);
          throw new Error("Invalid model configuration");
      }

      // 3. Call API via useGenerateImage
      const payload = {
        parameters: finalParameters,
        conversationType: "generate" as const, 
        modelName: model.model_name,
        modelIdentifier: model.identifier,
        modelCredit: typeof model.cost === 'number' ? model.cost : 4,
        modelProvider: model.provider as "running_hub" | "replicate",
        inputImagePermanentPaths: inputImage ? [inputImage] : [],
      };

      const result = await generateMutation(payload);
      
      if (result?.conversationId) {
          setConversationId(result.conversationId);
          // Status update will happen via useEffect when optimistic message or real message arrives
      } else {
           throw new Error("No conversation ID returned");
      }
      
    } catch (err: any) {
      console.error("Canvas Generation Error:", err);
      setStatus("error");
      setError(err.message);
      toast.error(`Generation Failed: ${err.message}`);
    }
  };

  return { generate, status, error };
}
