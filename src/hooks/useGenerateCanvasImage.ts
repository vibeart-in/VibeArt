import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InputBoxParameter } from "../types/BaseType";

type CanvasGenerationParams = {
  canvasId: string;
  parameters: InputBoxParameter;
  modelName: string;
  modelIdentifier: string;
  modelCredit: number | null;
  modelProvider: "running_hub" | "replicate";
};

const generateCanvasImage = async (formData: CanvasGenerationParams) => {
  const response = await fetch("/api/generate/canvas", {
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
  return result; // Returns { jobId: string }
};

export function useGenerateCanvasImage(canvasId: string) {
  const queryClient = useQueryClient();

  // These are the query keys we want to refresh when a generation starts/ends
  const canvasQueryKey = ["canvas", canvasId];
  const jobsQueryKey = ["canvas_jobs", canvasId];

  return useMutation({
    mutationFn: (params: CanvasGenerationParams) => generateCanvasImage(params),

    onMutate: async (newGeneration) => {
      // 1. Cancel outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: jobsQueryKey });

      // 2. Snapshot the previous value
      const previousJobs = queryClient.getQueryData(jobsQueryKey);

      // 3. Optimistically add a "pending" job to the list
      // This allows your UI to show a "Generating..." card immediately
      queryClient.setQueryData(jobsQueryKey, (old: any = []) => [
        {
          id: "temp-id-" + Date.now(),
          job_status: "pending",
          model_name: newGeneration.modelName,
          created_at: new Date().toISOString(),
          is_optimistic: true, // Helper flag to distinguish in UI
        },
        ...old,
      ]);

      return { previousJobs };
    },

    onError: (err, newParams, context) => {
      // Roll back to the previous state if the API call fails
      if (context?.previousJobs) {
        queryClient.setQueryData(jobsQueryKey, context.previousJobs);
      }
    },

    onSettled: () => {
      // Always refetch after error or success to sync with server
      // We invalidate both the canvas (for image arrays) and the jobs list
      queryClient.invalidateQueries({ queryKey: canvasQueryKey });
      queryClient.invalidateQueries({ queryKey: jobsQueryKey });
    },

    // Standard retry logic for flaky connections
    retry: (failureCount, error) => {
      return error.message === "network" && failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
