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
          console.log("updatedJob---------", updatedJob);

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
              // Extract image data from the nested structure
              const outputImages = jobImages.map((row: any) => row.images);

              // Check if this is an AI app node
              const isAiAppNode = targetNode.type === "aiApp";

              if (isAiAppNode) {
                // For AI app nodes, just pass the raw output images
                // The AiAppNode component will handle creating separate output image nodes
                setNodes((nds) =>
                  nds.map((node) =>
                    node.id === targetNode.id
                      ? {
                          ...node,
                          data: {
                            ...node.data,
                            outputImages: jobImages, // Pass the raw response with nested 'images' property
                            activeJobId: null,
                            status: null,
                          },
                        }
                      : node,
                  ),
                );
              } else {
                // For other node types, use the original duplication logic
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
                      generated_model: updatedJob.model_name,
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
                            imageUrl: outputImages[0].image_url,
                            outputImages: outputImages,
                            generated_model: updatedJob.model_name,

                            activeJobId: null,
                            status: null,
                          },
                        }
                      : node,
                  );
                  return [...updated, ...newNodes];
                });
              }
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
