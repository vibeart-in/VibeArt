import { GenerationItem } from "@/src/components/landing/pricing/FeatureComparison";

const planCredits = { free: 100, basic: 500, pro: 1500, creator: 5000 };

export const generationData: Record<string, GenerationItem[]> = {
  image: [
    {
      name: "Flux base",
      counts: { free: 256, basic: 2564, pro: 6410, creator: 12820 },
      unit: "images",
      creditsPerUse: 0.39,
    },
    {
      name: "Flux 1.1 Pro",
      counts: { free: 19, basic: 192, pro: 480, creator: 961 },
      unit: "images",
      premium: true,
      creditsPerUse: 5.2,
    },
    {
      name: "flux krea",
      counts: { free: 30, basic: 307, pro: 769, creator: 1538 },
      unit: "images",
      creditsPerUse: 0.325,
    },

    // --- Imagen Family ---
    {
      name: "Imagen 4 fast",
      counts: { free: 38, basic: 384, pro: 961, creator: 1923 },
      unit: "images",
      creditsPerUse: 2.6,
    },
    {
      name: "Imagen 4",
      counts: { free: 19, basic: 192, pro: 480, creator: 961 },
      unit: "images",
      creditsPerUse: 5.2,
    },
    {
      name: "Imagen 4 ultra",
      counts: { free: 12, basic: 128, pro: 320, creator: 641 },
      unit: "images",
      creditsPerUse: 7.8,
    },

    // --- Other Models (alphabetical) ---
    {
      name: "GPT image 1",
      counts: { free: 34, basic: 349, pro: 874, creator: 1748 },
      unit: "images",
      creditsPerUse: 2.86,
    },
    {
      name: "Ideogram v3 tubo",
      counts: { free: 25, basic: 256, pro: 641, creator: 1282 },
      unit: "images",
      creditsPerUse: 3.9,
    },
    {
      name: "Midjourney",
      counts: { free: 21, basic: 213, pro: 534, creator: 1068 },
      unit: "images",
      creditsPerUse: 4.68,
    },
    {
      name: "Qwen Image",
      counts: { free: 30, basic: 307, pro: 769, creator: 1538 },
      unit: "images",
      creditsPerUse: 3.25,
    },
    {
      name: "Recraft v3",
      counts: { free: 19, basic: 192, pro: 480, creator: 961 },
      unit: "images",
      creditsPerUse: 5.2,
    },
    {
      name: "Sdxl",
      counts: { free: 76, basic: 769, pro: 1923, creator: 3846 },
      unit: "images",
      creditsPerUse: 1.3,
    },
    {
      name: "Wan 2.2",
      counts: { free: 38, basic: 384, pro: 961, creator: 1923 },
      unit: "images",
      premium: true,
      creditsPerUse: 2.6,
    },

    // --- (moved from `edit`) --- image-edit / inpainting / kontext family
    {
      name: "Nano Banana",
      counts: { free: 76, basic: 769, pro: 1923, creator: 3846 },
      unit: "images",
      creditsPerUse: 1.3,
    },
    {
      name: "Seedream 4",
      counts: { free: 25, basic: 256, pro: 641, creator: 1282 },
      unit: "images",
      premium: true,
      creditsPerUse: 3.9,
    },
    {
      name: "flux kontext small",
      counts: { free: 157, basic: 1570, pro: 3924, creator: 7849 },
      unit: "images",
      premium: true,
      creditsPerUse: 0.637,
    },
    {
      name: "Flux kontext pro",
      counts: { free: 30, basic: 307, pro: 769, creator: 1538 },
      unit: "images",
      premium: true,
      creditsPerUse: 3.25,
    },
    {
      name: "Flux kontext Max",
      counts: { free: 15, basic: 153, pro: 384, creator: 769 },
      unit: "images",
      premium: true,
      creditsPerUse: 6.5,
    },

    // --- Image-only stylistic models (Illustrious / UltraRealistic) ---
    {
      name: "Illustrious",
      counts: { free: 38, basic: 384, pro: 961, creator: 1923 },
      unit: "images",
      creditsPerUse: 2.6,
    },
    {
      name: "UltraRealistic",
      counts: { free: 25, basic: 256, pro: 641, creator: 1282 },
      unit: "images",
      creditsPerUse: 3.9,
    },
  ],

  // ------------------- VIDEO section -------------------
  video: [
    /**
     * For video models you gave ranges. I used representative creditsPerUse values (midpoints or conservative choice)
     * - Sora 2: 10-20 -> used 15 credits
     * - Veo 3: 40-100 -> used 70 credits
     * - Runway Gen 3: assumed 50 credits per video (moderate)
     * - Kling: 80-100 -> used 90 credits
     * - Wan 2.2: 30-50 -> used 40 credits
     * - Wan 2.1: 20-50 -> used 35 credits
     *
     * counts = floor(planCredits / creditsPerUse)
     */
    {
      name: "Sora 2",
      counts: {
        free: Math.floor(planCredits.free / 15),
        basic: Math.floor(planCredits.basic / 15),
        pro: Math.floor(planCredits.pro / 15),
        creator: Math.floor(planCredits.creator / 15),
      },
      premium: true,

      unit: "videos",
      creditsPerUse: 15,
    },
    {
      name: "Veo 3",
      counts: {
        free: Math.floor(planCredits.free / 70),
        basic: Math.floor(planCredits.basic / 70),
        pro: Math.floor(planCredits.pro / 70),
        creator: Math.floor(planCredits.creator / 70),
      },
      unit: "videos",
      creditsPerUse: 70,
    },
    {
      name: "Runway Gen 3",
      counts: {
        free: Math.floor(planCredits.free / 50),
        basic: Math.floor(planCredits.basic / 50),
        pro: Math.floor(planCredits.pro / 50),
        creator: Math.floor(planCredits.creator / 50),
      },
      unit: "videos",
      creditsPerUse: 50,
    },
    {
      name: "Kling",
      counts: {
        free: Math.floor(planCredits.free / 90),
        basic: Math.floor(planCredits.basic / 90),
        pro: Math.floor(planCredits.pro / 90),
        creator: Math.floor(planCredits.creator / 90),
      },
      unit: "videos",
      creditsPerUse: 90,
      premium: true,
    },
    {
      name: "Wan 2.2",
      counts: {
        free: Math.floor(planCredits.free / 40),
        basic: Math.floor(planCredits.basic / 40),
        pro: Math.floor(planCredits.pro / 40),
        creator: Math.floor(planCredits.creator / 40),
      },
      unit: "videos",
      creditsPerUse: 40,
      premium: true,
    },
    {
      name: "Wan 2.1",
      counts: {
        free: Math.floor(planCredits.free / 35),
        basic: Math.floor(planCredits.basic / 35),
        pro: Math.floor(planCredits.pro / 35),
        creator: Math.floor(planCredits.creator / 35),
      },
      unit: "videos",
      creditsPerUse: 35,
    },
  ],

  // ------------------- AI APPS (previously 'other') -------------------
  aiApps: [
    // Lora / style transfer (moved from `other`)
    {
      name: "flux with lora",
      counts: { free: 38, basic: 384, pro: 961, creator: 1923 },
      unit: "styles",
      premium: true,
      creditsPerUse: 2.6,
    },
    {
      name: "sdxl with lora",
      counts: { free: 38, basic: 384, pro: 961, creator: 1923 },
      unit: "styles",
      premium: true,
      creditsPerUse: 2.6,
    },

    // Upscale & style models
    {
      name: "4k upscale",
      counts: { free: 19, basic: 192, pro: 480, creator: 961 },
      unit: "images",
      creditsPerUse: 5.2,
    },
    {
      name: "8k upscale",
      // assume 8K is 2x cost of 4k upscale; counts derived accordingly
      counts: {
        free: Math.floor(100 / (5.2 * 2)),
        basic: Math.floor(500 / (5.2 * 2)),
        pro: Math.floor(1500 / (5.2 * 2)),
        creator: Math.floor(5000 / (5.2 * 2)),
      },
      unit: "images",
      creditsPerUse: 5.2 * 2,
    },

    // AI App features (assumed creditsPerUse for transparency)
    {
      name: "Thumbnail generation",
      counts: {
        free: Math.floor(planCredits.free / 2),
        basic: Math.floor(planCredits.basic / 2),
        pro: Math.floor(planCredits.pro / 2),
        creator: Math.floor(planCredits.creator / 2),
      },
      unit: "uses",
      creditsPerUse: 2,
    },
    {
      name: "Pose transfer",
      counts: {
        free: Math.floor(planCredits.free / 20),
        basic: Math.floor(planCredits.basic / 20),
        pro: Math.floor(planCredits.pro / 20),
        creator: Math.floor(planCredits.creator / 20),
      },
      unit: "uses",
      creditsPerUse: 20,
    },
    {
      name: "Dance transfer",
      counts: {
        free: Math.floor(planCredits.free / 20),
        basic: Math.floor(planCredits.basic / 20),
        pro: Math.floor(planCredits.pro / 20),
        creator: Math.floor(planCredits.creator / 20),
      },
      unit: "uses",
      creditsPerUse: 20,
    },
    {
      name: "Product placement",
      counts: {
        free: Math.floor(planCredits.free / 100),
        basic: Math.floor(planCredits.basic / 100),
        pro: Math.floor(planCredits.pro / 100),
        creator: Math.floor(planCredits.creator / 100),
      },
      unit: "uses",
      creditsPerUse: 100,
    },
    {
      name: "Custom workflows",
      // workflows are charged per workflow-run (assumed moderate)
      counts: {
        free: Math.floor(planCredits.free / 50),
        basic: Math.floor(planCredits.basic / 50),
        pro: Math.floor(planCredits.pro / 50),
        creator: Math.floor(planCredits.creator / 50),
      },
      unit: "runs",
      creditsPerUse: 50,
    },
  ],
};
