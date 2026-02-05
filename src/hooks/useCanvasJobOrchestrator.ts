// hooks/useCanvasJobOrchestrator.ts
import { useReactFlow, Edge } from "@xyflow/react";
import { useEffect } from "react";

import { createClient } from "../lib/supabase/client";

export function useCanvasJobOrchestrator(canvasId: string) {
  const { getNodes, setNodes, getEdges, setEdges } = useReactFlow();
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

              const currentEdges = getEdges();
              const incomingEdges = currentEdges.filter((e: Edge) => e.target === targetNode.id);
              const outgoingEdges = currentEdges.filter((e: Edge) => e.source === targetNode.id);

              const newNodes: any[] = [];
              const newEdges: any[] = [];

              // Create nodes for additional images
              outputImages.slice(1).forEach((img: any, index: number) => {
                const newId = crypto.randomUUID();
                // Shift position to the right
                const offset = (index + 1) * 550;

                const newNode = {
                  ...targetNode,
                  id: newId,
                  selected: false,
                  position: {
                    x: targetNode.position.x + offset,
                    y: targetNode.position.y,
                  },
                  data: {
                    ...targetNode.data,
                    imageUrl: img.image_url,
                    outputImages: outputImages,
                    activeJobId: null,
                    status: null,
                  },
                };
                newNodes.push(newNode);

                // Duplicate connections
                incomingEdges.forEach((edge: Edge) => {
                  newEdges.push({
                    ...edge,
                    id: crypto.randomUUID(),
                    target: newId,
                  });
                });
                outgoingEdges.forEach((edge: Edge) => {
                  newEdges.push({
                    ...edge,
                    id: crypto.randomUUID(),
                    source: newId,
                  });
                });
              });

              setEdges((eds: Edge[]) => [...eds, ...newEdges]);

              // Update the specific node and add new ones
              setNodes((nds) => {
                const updated = nds.map((node) =>
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
                );
                return [...updated, ...newNodes];
              });
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
  }, [canvasId, getNodes, setNodes, getEdges, setEdges]);
}
