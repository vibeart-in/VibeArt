export interface AiAppParameter {
  nodeId: string;
  fieldName: string;
  fieldValue: string;
  description: string;
  fieldData?: string;
}

export interface AiApp {
  id: string;
  app_name: string;
  // Optional fields for when data is fetched dynamically
  created_at?: string;
  description?: string;
  runs?: number;
  author?: string;
  webappId?: string;
  parameters?: string; // JSON string of AiAppParameter[]
  cover_image?: string;
  examples_images?: string | null; // JSON string of string[] or null
  duration?: string;
  cost?: number;
  tags?: string; // JSON string of string[]
  instance_type?: string;
}

export const AI_APPS: AiApp[] = [
  {
    app_name: "Custom sticker pack",
    id: "0078075f-17eb-44d7-9b5c-94479a721437",
  },
  {
    app_name: "Add Pikachu with sound effect ",
    id: "10677e8f-93bb-4f5a-9f4c-4ab2e5a5d89b",
  },
  {
    app_name: "Upscale any image to 4K",
    id: "108fa3df-6a1a-460b-aecb-cd1f025d4534",
  },
  {
    app_name: "AI short film told in 3 scenes",
    id: "12202b17-c024-49a9-a21a-2b17f40cc756",
  },
  {
    app_name: "Mecha Transformation ",
    id: "15e3e3ee-27f9-4904-8055-caa00a92ec0e",
  },
  {
    app_name: "AI Girlfriend",
    id: "2e10a43b-ed29-4bdd-a298-091779a04b15",
  },
  {
    app_name: "Create quick and easy short films",
    id: "4bd9d235-697a-4ee6-b204-ed594b3fb34d",
  },
  {
    app_name: "Image to 3d figurine (Image and video)",
    id: "633bd8d5-e1ac-4314-bde8-125272928fa5",
  },
  {
    app_name: "One click multiple consistent character poses",
    id: "6e62ea85-4062-456d-9891-ee0ac56bb6c6",
  },
  {
    app_name: "Pose transfer! Pose your model using doodles",
    id: "7ca91622-4c0a-42f8-b4e4-dd2b51e0ca9e",
  },
  {
    app_name: "360° camera orbit",
    id: "aae47442-b5ec-4946-9b76-eb468d6f5d60",
  },
  {
    app_name: "Dance or Action transfer",
    id: "eda689e8-0683-4290-86c4-f973532305f1",
  },
  {
    app_name: "Anime to Real life",
    id: "f5e56ab0-9137-43fb-82c1-876b217f9904",
  },
];
