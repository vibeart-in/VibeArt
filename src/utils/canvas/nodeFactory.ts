import { Node } from "@xyflow/react";
import { v4 as uuidv4 } from "uuid";
import {
  ImageInputNodeData,
  ImageOutputNodeData,
  VideoInputNodeData,
  VideoOutputNodeData,
} from "@/src/types/canvas/nodeTypes";
import { NODE_CATEGORIES } from "@/src/constants/canvas";

// ============================================================================
// Node Factory Functions
// ============================================================================

interface CreateNodeOptions {
  position: { x: number; y: number };
  data?: Partial<ImageInputNodeData | ImageOutputNodeData>;
}

/**
 * Creates a new image input node
 */
export function createImageInputNode(
  options: CreateNodeOptions & {
    imageUrl?: string;
    label?: string;
    permanentPath?: string;
    onDelete?: () => void;
  }
): Node<ImageInputNodeData, "inputImage"> {
  const id = uuidv4();
  
  return {
    id,
    type: "inputImage",
    position: options.position,
    data: {
      mediaType: "image",
      imageUrl: options.imageUrl,
      label: options.label || "Input Image",
      permanentPath: options.permanentPath,
      onDelete: options.onDelete || (() => {}),
      ...options.data,
    },
  };
}

/**
 * Creates a new image output node
 */
export function createImageOutputNode(
  options: CreateNodeOptions & {
    prompt?: string;
    model?: string;
    category?: string;
    selectedModel?: any;
    onGenerate?: (prompt: string) => void;
    onEdit?: (prompt?: string) => void;
    onPromptUpdate?: (prompt: string) => void;
    onModelChange?: (model: any) => void;
    onDelete?: () => void;
  }
): Node<ImageOutputNodeData, "outputImage"> {
  const id = uuidv4();
  
  return {
    id,
    type: "outputImage",
    position: options.position,
    data: {
      mediaType: "image",
      label: options.label || "New Generation",
      category: options.category || NODE_CATEGORIES.DRAFT,
      model: options.model || "Flux Schnell",
      prompt: options.prompt,
      selectedModel: options.selectedModel,
      isGenerating: false,
      inputImages: [],
      onGenerate: options.onGenerate || (() => {}),
      onEdit: options.onEdit || (() => {}),
      onPromptUpdate: options.onPromptUpdate || (() => {}),
      onModelChange: options.onModelChange || (() => {}),
      onDelete: options.onDelete || (() => {}),
      ...options.data,
    },
  };
}

/**
 * Creates a new video input node (placeholder for future)
 */
export function createVideoInputNode(
  options: CreateNodeOptions & {
    videoUrl?: string;
    label?: string;
    permanentPath?: string;
    duration?: number;
    thumbnail?: string;
    onDelete?: () => void;
  }
): Node<VideoInputNodeData, "inputVideo"> {
  const id = uuidv4();
  
  return {
    id,
    type: "inputVideo",
    position: options.position,
    data: {
      mediaType: "video",
      videoUrl: options.videoUrl,
      label: options.label || "Input Video",
      permanentPath: options.permanentPath,
      duration: options.duration,
      thumbnail: options.thumbnail,
      onDelete: options.onDelete || (() => {}),
      ...options.data,
    },
  };
}

/**
 * Creates a new video output node (placeholder for future)
 */
export function createVideoOutputNode(
  options: CreateNodeOptions & {
    prompt?: string;
    model?: string;
    category?: string;
    duration?: number;
    selectedModel?: any;
    onGenerate?: (prompt: string) => void;
    onEdit?: (prompt?: string) => void;
    onPromptUpdate?: (prompt: string) => void;
    onModelChange?: (model: any) => void;
    onDelete?: () => void;
  }
): Node<VideoOutputNodeData, "outputVideo"> {
  const id = uuidv4();
  
  return {
    id,
    type: "outputVideo",
    position: options.position,
    data: {
      mediaType: "video",
      label: options.label || "New Video Generation",
      category: options.category || NODE_CATEGORIES.DRAFT,
      model: options.model || "Video Model",
      prompt: options.prompt,
      duration: options.duration,
      selectedModel: options.selectedModel,
      isGenerating: false,
      inputVideos: [],
      inputImages: [],
      onGenerate: options.onGenerate || (() => {}),
      onEdit: options.onEdit || (() => {}),
      onPromptUpdate: options.onPromptUpdate || (() => {}),
      onModelChange: options.onModelChange || (() => {}),
      onDelete: options.onDelete || (() => {}),
      ...options.data,
    },
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Gets the ID from a node (useful for extracting from factory-created nodes)
 */
export function getNodeId(node: Node): string {
  return node.id;
}

/**
 * Creates a variation node from an existing node
 */
export function createVariationNode(
  sourceNode: Node,
  position: { x: number; y: number },
  editedPrompt?: string
): Node {
  if (sourceNode.type === "outputImage") {
    const data = sourceNode.data as ImageOutputNodeData;
    return createImageOutputNode({
      position,
      prompt: editedPrompt || data.prompt,
      model: data.model,
      category: NODE_CATEGORIES.EDIT,
      selectedModel: data.selectedModel,
      onGenerate: data.onGenerate,
      onEdit: data.onEdit,
      onPromptUpdate: data.onPromptUpdate,
      onModelChange: data.onModelChange,
      onDelete: data.onDelete,
    });
  }
  
  // Add video support here in the future
  throw new Error(`Cannot create variation from node type: ${sourceNode.type}`);
}
