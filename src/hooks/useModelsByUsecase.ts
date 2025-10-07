import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/src/lib/supabase/client";
import { ModelData, ConversationType } from "@/src/types/BaseType";

export const useModelsByUsecase = (conversationType: ConversationType) => {
  const supabase = createClient();

  return useQuery<ModelData[], Error>({
    queryKey: ["modelsByUsecase", conversationType],
    queryFn: async () => {
      const { data, error: rpcError } = await supabase.rpc("get_models_by_usecase", {
        p_usecase: conversationType,
      });
      if (rpcError) throw new Error(rpcError.message);
      return data as unknown as ModelData[];
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
