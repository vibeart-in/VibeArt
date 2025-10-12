import { Database } from "@/supabase/database.types";

// Your existing MessageType

// The new type for a group
export interface MessageGroupType {
  input_images: conversationImageObject[];
  turns: conversationData[]; // The array of messages within this group
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
  description: string;
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
  tags?: string[];
}

export type DBModelData = Database["public"]["Functions"]["get_initial_model"]["Returns"][number];

export interface HistoryItem {
  id: string;
  imageUrl: string;
  title: string;
  created_at: string;
  appId?: string;
  conversation_type: ConversationType;
}

export type ExampleImageType =
  Database["public"]["Functions"]["get_example_generations"]["Returns"][number];

export enum ConversationType {
  GENERATE = "generate",
  EDIT = "edit",
  BOTH = "both",
  APP = "app", // ✅ changed from "ai-apps" to "app"
  AIAPP = "ai-apps", // ✅ changed from "ai-apps" to "app"
  VIDEO = "video",
  ADVANCE = "advance_generate",
  CHECKPOINT = "checkpoint",
  LORA = "lora",
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

export type conversationImageObject = {
  id: string;
  imageUrl: string;
  thumbnailUrl?: string | null;
};

export type conversationData = {
  credit_cost: number;
  error_message: string | null;
  id: string;
  input_images: conversationImageObject[];
  job_status:
    | "pending"
    | "starting"
    | "processing"
    | "succeeded"
    | "failed"
    | "QUEUED"
    | "RUNNING"
    | null;
  jobId: string | null;
  output_images: conversationImageObject[];
  parameters: InputBoxParameter;
  userPrompt: string;
  model_name: string;
};
