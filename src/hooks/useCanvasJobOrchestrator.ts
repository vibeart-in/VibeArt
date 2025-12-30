// hooks/useCanvasJobOrchestrator.ts
import { useEffect } from "react";
import { useReactFlow } from "@xyflow/react";
import { createClient } from "../lib/supabase/client";

export function useCanvasJobOrchestrator(canvasId: string) {
  const { getNodes, setNodes } = useReactFlow();
  const supabase = createClient();

  useEffect(() => {
    if (!canvasId) return;

    const channel = supabase
      .channel(`canvas-jobs-${canvasId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "jobs", filter: `canvas_id=eq.${canvasId}` },
        async (payload) => {
          const updatedJob = payload.new;

          // Find the node that owns this job
          const nodes = getNodes();
          const targetNode = nodes.find((n) => n.data.activeJobId === updatedJob.id);

          if (!targetNode) return;

          if (updatedJob.job_status === "succeeded") {
            // Fetch the image results
            const { data: jobImages } = await supabase
              .from("job_output_images")
              .select("images(*)")
              .eq("job_id", updatedJob.id);

            if (jobImages && jobImages.length > 0) {
              const outputImages = jobImages.map((row: any) => row.images);
              
              // Update the specific node
              setNodes((nds) =>
                nds.map((node) =>
                  node.id === targetNode.id
                    ? {
                        ...node,
                        data: {
                          ...node.data,
                          imageUrl: outputImages[0].image_url, // Default fallback
                          outputImages: outputImages, // Pass full list
                          activeJobId: null,
                          status: null,
                        },
                      }
                    : node,
                ),
              );
            }
          } else {
            // Just update the status text (e.g., "Processing", "Queued")
            setNodes((nds) =>
              nds.map((node) =>
                node.id === targetNode.id
                  ? { ...node, data: { ...node.data, status: updatedJob.job_status } }
                  : node,
              ),
            );
          }
        },
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [canvasId, getNodes, setNodes]);
}
