import { Node } from "@xyflow/react";

// ============================================================================
// Base Media Node Types
// ============================================================================

export type MediaType = "image" | "video";

export interface BaseMediaNodeData {
  label?: string;
  mediaUrl?: string;
  mediaType: MediaType;
  category?: string;
  [key: string]: unknown;
}

// ============================================================================
// Image Node Types
// ============================================================================

export interface ImageInputNodeData extends BaseMediaNodeData {
  mediaType: "image";
  imageUrl?: string;
  permanentPath?: string;
  onDelete?: () => void;
}

export interface ImageOutputNodeData extends BaseMediaNodeData {
  mediaType: "image";
  imageUrl?: string;
  prompt?: string;
  model?: string;
  isGenerating?: boolean;
  inputImages?: string[];
  availableModels?: any[];
  selectedModel?: any;
  onGenerate?: (prompt: string) => void;
  onEdit?: (prompt?: string) => void;
  onPromptUpdate?: (prompt: string) => void;
  onModelChange?: (model: any) => void;
  onDelete?: () => void;
}

// ============================================================================
// Video Node Types (Future Support)
// ============================================================================

export interface VideoInputNodeData extends BaseMediaNodeData {
  mediaType: "video";
  videoUrl?: string;
  permanentPath?: string;
  duration?: number;
  thumbnail?: string;
  onDelete?: () => void;
}

export interface VideoOutputNodeData extends BaseMediaNodeData {
  mediaType: "video";
  videoUrl?: string;
  prompt?: string;
  model?: string;
  isGenerating?: boolean;
  inputVideos?: string[];
  inputImages?: string[];
  availableModels?: any[];
  selectedModel?: any;
  duration?: number;
  thumbnail?: string;
  onGenerate?: (prompt: string) => void;
  onEdit?: (prompt?: string) => void;
  onPromptUpdate?: (prompt: string) => void;
  onModelChange?: (model: any) => void;
  onDelete?: () => void;
}

// ============================================================================
// Node Type Definitions
// ============================================================================

export type ImageInputNodeType = Node<ImageInputNodeData, "inputImage">;
export type ImageOutputNodeType = Node<ImageOutputNodeData, "outputImage">;
export type VideoInputNodeType = Node<VideoInputNodeData, "inputVideo">;
export type VideoOutputNodeType = Node<VideoOutputNodeData, "outputVideo">;

export type MediaNodeType = 
  | ImageInputNodeType 
  | ImageOutputNodeType 
  | VideoInputNodeType 
  | VideoOutputNodeType;

// ============================================================================
// Node Type Guards
// ============================================================================

export function isImageInputNode(node: Node): node is ImageInputNodeType {
  return node.type === "inputImage";
}

export function isImageOutputNode(node: Node): node is ImageOutputNodeType {
  return node.type === "outputImage";
}

export function isVideoInputNode(node: Node): node is VideoInputNodeType {
  return node.type === "inputVideo";
}

export function isVideoOutputNode(node: Node): node is VideoOutputNodeType {
  return node.type === "outputVideo";
}

export function isInputNode(node: Node): boolean {
  return isImageInputNode(node) || isVideoInputNode(node);
}

export function isOutputNode(node: Node): boolean {
  return isImageOutputNode(node) || isVideoOutputNode(node);
}
