import { createClient } from "@/src/lib/supabase/client";
import { AiApp } from "@/src/constants/aiApps";
import { useEffect, useState } from "react";

export function useAiAppDetails(appId?: string) {
  const [data, setData] = useState<AiApp | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!appId) return;

    const fetchApp = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const supabase = createClient();
        const { data: appData, error: appError } = await supabase
          .from("ai_apps")
          .select("*")
          .eq("id", appId)
          .single();

        if (appError) throw appError;

        setData(appData as unknown as AiApp);
      } catch (err: any) {
        console.error("Error fetching AI app:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApp();
  }, [appId]);

  return { data, isLoading, error };
}
