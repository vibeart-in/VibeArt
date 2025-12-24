import { Node, useNodeConnections, useNodesData, useReactFlow } from "@xyflow/react";
import { useEffect, useMemo } from "react";

import type { InputImageNodeData } from "../components/canvas/nodes/InputImage";
import type { OutputImageNodeData } from "../components/canvas/nodes/OutputImage";
import type { TextType } from "../components/canvas/nodes/TextNode";

export type BaseNodeData = InputImageNodeData | OutputImageNodeData | TextType["data"];

export type XYNode = Node<BaseNodeData>;
export type XYNodeSnapshot = Pick<XYNode, "id" | "type" | "data">;

// ============================================================================
// 2. EXTRACTION HELPERS (Pure Functions)
// ============================================================================

export const getTextFromNodes = (nodes: XYNodeSnapshot[]): string => {
  if (!nodes.length) return "";
  return nodes
    .filter((node) => node.type === "prompt" || node.type === "text")
    .map((node) => node.data?.prompt || node.data?.text)
    .filter((t): t is string => typeof t === "string" && t.trim().length > 0)
    .join(" ");
};

export const getImagesFromNodes = (nodes: XYNodeSnapshot[]): string[] => {
  return nodes
    .map((node) => 
      node.data?.croppedImageUrl || 
      node.data?.processedImageUrl || 
      node.data?.url || 
      node.data?.imageUrl
    )
    .filter((url): url is string => typeof url === "string" && !!url);
};

export const getDimensionsFromNodes = (
  nodes: XYNodeSnapshot[],
): { width: number; height: number } | undefined => {
  const node = nodes.find(
    (n) => typeof n.data?.width === "number" && typeof n.data?.height === "number",
  );
  if (!node) return undefined;
  return { width: node.data.width as number, height: node.data.height as number };
};

/**
 * Hook to retrieve aggregated data from upstream nodes (connected to 'target').
 */
export const useUpstreamData = (handleType: "target" | "source" = "target") => {
  const connections = useNodeConnections({ handleType });
  const nodesData = useNodesData<XYNode>(connections.map((connection) => connection.source));

  return useMemo(() => {
    const nodes = Array.isArray(nodesData) ? nodesData : nodesData ? [nodesData] : [];

    return {
      nodes,
      images: getImagesFromNodes(nodes),
      prompt: getTextFromNodes(nodes),
      dimensions: getDimensionsFromNodes(nodes),
    };
  }, [nodesData]);
};

/**
 * Hook that automatically syncs upstream data into the current node's data.
 * Handles equality checks to prevent infinite loops.
 */
export const useSyncUpstreamData = (id: string, currentData: BaseNodeData) => {
  const { updateNodeData } = useReactFlow();
  const { images, prompt, dimensions } = useUpstreamData("target");

  useEffect(() => {
    const updatePayload: Partial<BaseNodeData> = {};
    let hasChanges = false;

    // 1. Sync Images
    const currentUrls = Array.isArray(currentData.inputImageUrls) ? currentData.inputImageUrls : [];
    // Fast array comparison
    const imagesChanged =
      images.length !== currentUrls.length || images.some((url, i) => url !== currentUrls[i]);

    if (imagesChanged) {
      updatePayload.inputImageUrls = images;
      hasChanges = true;
    }

    // 2. Sync Prompt
    // Only update if upstream has text and it's different.
    // This allows manual typing if upstream is empty.
    if (prompt && prompt !== currentData.prompt) {
      updatePayload.prompt = prompt;
      hasChanges = true;
    }

    // 3. Sync Dimensions
    // Only sync if upstream has dimensions and they are different
    if (
      dimensions &&
      (dimensions.width !== currentData.width || dimensions.height !== currentData.height)
    ) {
      updatePayload.width = dimensions.width;
      updatePayload.height = dimensions.height;
      hasChanges = true;
    }

    if (hasChanges) {
      updateNodeData(id, updatePayload);
    }
  }, [
    id,
    updateNodeData,
    images,
    prompt,
    dimensions,
    currentData.inputImageUrls,
    currentData.prompt,
    currentData.width,
    currentData.height,
  ]);
};
