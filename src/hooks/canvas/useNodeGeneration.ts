import { useCallback } from "react";
import { Node } from "@xyflow/react";
import { useGenerateImage } from "@/src/hooks/useGenerateImage";
import { ConversationType } from "@/src/types/BaseType";
import { createClient } from "@/src/lib/supabase/client";
import { DEFAULT_GENERATION_PARAMS } from "@/src/constants/canvas";
import { ImageOutputNodeData } from "@/src/types/canvas/nodeTypes";

const supabase = createClient();

interface UseNodeGenerationOptions {
  conversationId: string;
  getInputImagesForNode: (nodeId: string) => string[];
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  getNodes: () => Node[];
}

export function useNodeGeneration({
  conversationId,
  getInputImagesForNode,
  setNodes,
  getNodes,
}: UseNodeGenerationOptions) {
  const mutation = useGenerateImage(ConversationType.GENERATE, conversationId);

  // ============================================================================
  // Generation Handler
  // ============================================================================

  const handleGenerate = useCallback(async (nodeId: string, prompt: string) => {
    if (!prompt.trim()) return;

    const currentNodes = getNodes();
    const node = currentNodes.find(n => n.id === nodeId);
    
    if (!node) {
      console.error("Node not found:", nodeId);
      return;
    }

    const nodeData = node.data as ImageOutputNodeData;
    const selectedModel = nodeData.selectedModel as any;
    
    // Default to Flux if no model selected
    const modelName = selectedModel?.model_name || "Flux Schnell";
    const modelIdentifier = selectedModel?.identifier || "black-forest-labs/flux-schnell";
    const modelProvider = selectedModel?.provider || "replicate";
    const modelCredit = selectedModel?.cost || 1;

    // Get input images
    const inputImageUrls = getInputImagesForNode(nodeId);

    console.log("Generating for node:", nodeId, "Model:", modelName);
    
    // Update node to loading state
    setNodes((nds) =>
      nds.map((n) =>
        n.id === nodeId
          ? { 
              ...n, 
              data: { 
                  ...n.data, 
                  isGenerating: true, 
                  prompt,
                  model: modelName
              } 
            }
          : n
      )
    );

    // Ensure conversation exists
    const { data: conversation } = await supabase
      .from('conversations')
      .select('id')
      .eq('id', conversationId)
      .single();

    if (!conversation) {
      const { error: createError } = await supabase
        .from('conversations')
        .insert({ 
          id: conversationId, 
          conversation_type: ConversationType.GENERATE,
          user_id: (await supabase.auth.getUser()).data.user?.id 
        });
      
      if (createError) {
        console.error("Failed to create conversation", createError);
      }
    }

    // Format parameters
    const finalParameters = {
      prompt: prompt.trim(),
      nodeId: nodeId,
      ...(inputImageUrls.length > 0 && { image: inputImageUrls[0] }),
      ...(inputImageUrls.length > 0 && { prompt_strength: DEFAULT_GENERATION_PARAMS.prompt_strength }),
      ...DEFAULT_GENERATION_PARAMS,
    };

    mutation.mutate(
      {
        parameters: finalParameters,
        conversationId: conversationId,
        modelName: modelName,
        modelIdentifier: modelIdentifier,
        modelCredit: modelCredit,
        modelProvider: modelProvider,
        conversationType: ConversationType.GENERATE,
        inputImagePermanentPaths: inputImageUrls
      },
      {
        onSuccess: () => {
          console.log("Generation started for node", nodeId);
        },
        onError: (err) => {
          console.error("Generation failed", err);
          setNodes((nds) => nds.map((n) => 
            n.id === nodeId 
              ? { ...n, data: { ...n.data, isGenerating: false } } 
              : n
          ));
          alert(`Generation failed: ${err.message}`);
        }
      }
    );
  }, [conversationId, getInputImagesForNode, setNodes, getNodes, mutation]);

  return {
    handleGenerate,
    isGenerating: mutation.isPending,
  };
}
