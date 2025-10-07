// export interface MessageType {
//   id: string;
//   userPrompt: string;
//   output_images: { imageUrl: string }[];
//   jobId?: string | null;
//   input_images?: { imageUrl: string }[];
//   job_status:
//     | "pending"
//     | "processing"
//     | "succeeded"
//     | "failed"
//     | "starting"
//     | null;
//   parameters?: any;
//   credit_cost: number;
//   error_message?: string | null;
// }

import { Database } from "@/supabase/database.types";

// Your existing MessageType
export interface MessageType {
  id: string;
  userPrompt: string;
  input_images: { id: string; imageUrl: string }[];
  output_images: { id: string; imageUrl: string }[];
  jobId: string | null;
  job_status: "pending" | "starting" | "processing" | "succeeded" | "failed" | null;
  parameters: any;
  credit_cost: number;
  error_message: string | null;
}

// The new type for a group
export interface MessageGroupType {
  id: string; // A unique ID for the group
  input_images: { id: string; imageUrl: string }[];
  turns: MessageType[]; // The array of messages within this group
}

export type SchemaParam = {
  type: string;
  title: string;
  description?: string;
  default?: any;
  enum?: string[];
  minimum?: number;
  maximum?: number;
  format?: string;
};

export type NodeParam = {
  nodeId: string;
  fieldName: string;
  fieldValue: string;
  description?: string;
  fieldData?: string;
};

export type InputBoxParameter = Record<string, SchemaParam> | NodeParam[];

export interface ModelData {
  id: number;
  created_at: string;
  model_name: string;
  identifier: string;
  cost: number;
  version: string;
  description: string | null;
  model_type: string;
  base_model: string | null;
  usecase: string | null;
  cover_image: string;
  runs: string | null;
  link: string | null;
  model_uploaded: string;
  parameters: InputBoxParameter;
  provider: "running_hub" | "replicate";
  is_popular: boolean;
  estimated_time: number;
}

export type DBModelData = Database["public"]["Functions"]["get_initial_model"]["Returns"][number];

export interface HistoryItem {
  id: string;
  imageUrl: string;
  title: string;
  prompt: string;
  created_at: string;
  appId?: string;
}

export interface ExampleImageType {
  id: number;
  media_url: string;
  prompt: string;
  media_type: "image" | "video";
  showcase_for: ConversationType;
  width?: number;
  height?: number;
}

export enum ConversationType {
  GENERATE = "generate",
  EDIT = "edit",
  BOTH = "both",
  APP = "app", // ✅ changed from "ai-apps" to "app"
  VIDEO = "video",
  ADVANCE = "advance_generate",
}

export interface ImageCard3DType {
  bottomImageUrl: string;
  topImageUrl: string;
  cardText: string;
  rotateDepth?: number;
  parallaxDepth?: number;
  width?: number;
  height?: number;
  topImageScale?: number;
  fontSize?: number;
}
