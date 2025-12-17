"use server";

import { createClient } from "@/src/lib/supabase/server";
import { ModelData } from "@/src/types/BaseType";

export async function fetchModelByName(name: string): Promise<ModelData | null> {
  const supabase = await createClient();

  // SPECIAL HANDLING: Seedream 4 Fast
  if (name.toLowerCase() === "seedream 4 fast") {
      const supabase = await createClient(); // Ensure client is created if not already
      
      // 1. Try Base Model "Seedream 4"
      let { data: baseModel } = await supabase
        .from("models")
        .select("*")
        .ilike("model_name", "Seedream 4")
        .single();
      
      // 2. If not found, try fallback models (Flux base, or Sdxl) to borrow parameters
      if (!baseModel) {
          const { data: fallbackModel } = await supabase
            .from("models")
            .select("*")
            .or('model_name.ilike.Flux Dev,model_name.ilike.Flux Schnell,model_name.ilike.Stable Diffusion 3.5 medium,model_name.ilike.Flux base')
            .limit(1)
            .single();
          
          if (fallbackModel) {
              console.log(`Fallback: Using ${fallbackModel.model_name} parameters for Seedream 4 Fast`);
              baseModel = fallbackModel;
          }
      }

      if (baseModel) {
          return {
              ...baseModel,
              model_name: "Seedream 4 Fast", 
              cost: 4, 
          } as ModelData;
      }
      
      // 3. Final Fallback: Hardcoded (if DB is empty)
      console.warn("No base model found for Seedream 4 Fast. Using generic fallback.");
       return {
          model_name: "Seedream 4 Fast",
          identifier: "seedream-4",
          provider: "running_hub",
          cost: 4,
          parameters: JSON.stringify([
              { nodeId: "10", fieldName: "prompt", description: "prompt", fieldValue: "" },
              { nodeId: "10", fieldName: "init_image", description: "input image", fieldValue: "" }
          ])
      } as ModelData;
  }

  // Try exact match first
  let { data, error } = await supabase
    .from("models")
    .select("*")
    .ilike("model_name", name)
    .single();

  if (data) return data;

  // Try RPC for fuzzy match if exact fails
  const { data: fuzzyData, error: fuzzyError } = await supabase.rpc("get_models_by_usecase", {
        p_usecase: "image", // Assuming image model
        p_user_id: (await supabase.auth.getUser()).data.user?.id
  });
  
  if (fuzzyData && Array.isArray(fuzzyData)) {
      // Find closest match or first one containing the name
      const match = fuzzyData.find((m: any) => m.model_name.toLowerCase().includes(name.toLowerCase()));
      if (match) return match as ModelData;
  }
  
  console.log(`Model ${name} not found. Returning null.`);
  return null;
}
