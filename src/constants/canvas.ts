// ============================================================================
// Layout Constants
// ============================================================================

export const CANVAS_LAYOUT = {
  INPUT_X: 50,
  NODE_WIDTH: 300,
  NODE_HEIGHT: 450, // Approx height for 2:3 aspect ratio + padding
  GAP_Y: 50,
  GAP_X: 100,
} as const;

// ============================================================================
// Default Models
// ============================================================================

export const DEFAULT_MODELS = [
  {
    id: "flux-schnell",
    model_name: "Flux Schnell",
    identifier: "black-forest-labs/flux-schnell",
    provider: "replicate",
    cost: 1,
    cover_image: "https://replicate.delivery/yhqm/Kk81U4w2XqI5O0c9B9W9x9x9/out-0.png"
  },
  {
    id: "flux-dev",
    model_name: "Flux Dev",
    identifier: "black-forest-labs/flux-dev",
    provider: "replicate",
    cost: 2,
    cover_image: "https://replicate.delivery/yhqm/Kk81U4w2XqI5O0c9B9W9x9x9/out-0.png"
  },
  {
    id: "sdxl",
    model_name: "SDXL",
    identifier: "stability-ai/sdxl",
    provider: "replicate",
    cost: 1,
    cover_image: "https://replicate.delivery/pbxt/Kk81U4w2XqI5O0c9B9W9x9x9/out-0.png"
  }
] as const;

// ============================================================================
// Node Categories
// ============================================================================

export const NODE_CATEGORIES = {
  DRAFT: "Draft",
  GENERATED: "Generated",
  EDIT: "Edit",
  VARIATION: "Variation",
  REMOVE_BG: "Remove BG",
  UPSCALE: "Upscale",
} as const;

// ============================================================================
// Generation Parameters
// ============================================================================

export const DEFAULT_GENERATION_PARAMS = {
  go_fast: true,
  megapixels: "1",
  num_outputs: 1,
  aspect_ratio: "3:2",
  output_format: "webp",
  output_quality: 80,
  prompt_strength: 0.8, // For img2img
} as const;
