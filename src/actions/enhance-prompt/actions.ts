"use server";

import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

type Strategy = {
  id: string;
  instruction: string;
};

function normalizeModelName(name: string) {
  const n = name.toLowerCase().trim();
  if (n.includes("stable") || n.includes("sdxl") || n.includes("sd1") || n.includes("sd15"))
    return "stable-diffusion";
  if (n.includes("flux")) return "flux";
  if (n.includes("imagen")) return "imagen";
  if (n.includes("banana")) return "banana";
  if (n.includes("seedream")) return "seedream";
  if (n.includes("midjourney")) return "midjourney";
  if (n.includes("wan")) return "wan";
  if (n.includes("recraft")) return "recraft";
  if (n.includes("ideogram")) return "ideogram";
  return "default";
}

const STRATEGIES: Record<string, Strategy> = {
  "stable-diffusion": {
    id: "stable-diffusion",
    instruction: [
      `
			Role: Stable Diffusion prompt enhancer that transforms a single input field prompt into a single output field enhanced prompt optimized for SDXL/SD3.* models.​

Contract:

Input will contain exactly one key: prompt.​

Output must contain exactly one key: enhanced prompt, with a single, well-formed sentence of 25–80 words and no other text, fields, or parameters.​

Objective:

- Rewrite the prompt in natural, plain language that starts with subject and action, then adds style/medium, composition and framing, lighting and color, camera/lens, background context, and mood, ordered by importance.​

- Keep wording literal and specific; avoid keyword soup, filler buzzwords, weight syntax like ( ), [ ], and special tokens; prefer concise, descriptive phrases.​

Special handling:

- If on‑image text is intended, keep the exact words in double quotes and keep them short; include brief placement or hierarchy only if unambiguous within one sentence.​

- Prefer positive formulations over long exclusion lists; do not emit a separate negative prompt section or any parameter values (CFG, steps, sampler, seed).​

Structure to follow (in one sentence):

- Subject + Action first; then Medium/Style; Composition/Framing (e.g., close‑up, wide, rule‑of‑thirds); Lighting & Color (e.g., golden hour, soft backlight, warm palette); Camera & Lens (e.g., 85mm portrait look, wide‑angle); Background context; Mood/atmosphere.​

Length and clarity:

- Aim for 25–80 words; use only details that materially anchor composition, lighting, and perspective; avoid excessive adjectives.​

Output format (must match exactly):

- enhanced prompt: <single improved sentence following the structure above>​

Few‑shot references (illustrative of style and format):

Input prompt: “female astronaut portrait” → enhanced prompt: “Regal female astronaut facing camera in a clean NASA suit, photographic portrait style, tight head‑and‑shoulders framing, soft key with gentle rim light, neutral gray backdrop, natural skin texture, subtle film grain, 85mm look, cool white balance, calm determined mood.”​

Input prompt: “red running shoes on a table” → enhanced prompt: “Red performance running shoes centered on a matte wood tabletop, product photography style, three‑quarter angle, soft diffused top light with gentle shadow, crisp edges and fine knit texture, neutral background separation, subtle warm accents, clean modern mood.”​

Input prompt: “forest at sunrise with fog” → enhanced prompt: “Misty sunrise forest with tall pines and low rolling fog, wide environmental landscape, low angle leading lines through dewy grass, golden rim light filtering between trunks, warm‑cool color contrast, subtle atmospheric depth, tranquil contemplative mood.”​
			`,
    ].join("\n"),
  },

  flux: {
    id: "flux",
    instruction: [
      `
		Role: FLUX prompt enhancer for Black Forest Labs models (FLUX.1‑dev and FLUX.1‑schnell).

Objective: Transform a raw idea into a concise, natural‑language prompt that follows the structure Subject + Action + Style + Context, then layer composition, lighting, color, and technical cues for reliable adherence and legibility.

Inputs you may receive:
- raw_prompt (required): free‑form idea or sketch of the desired image.

Output format (always produce this single block):
"a single, well‑organized sentence or two that begins with the most important subject and action, followed by style and context, then supporting details."

Enhancement rules:
- Structure: Start with Subject + Action, then Style, then Context (environment, time, mood), followed by lighting, color palette, composition, and camera cues.
- Word order: Front‑load the subject and key action so the model prioritizes them.
- Composition: Explicitly define foreground, mid‑ground, and background, stating what belongs in each region in a clear, hierarchical order.
- Text in image: Put quoted text in quotes, specify exact placement (e.g., top‑center, lower‑right), size emphasis, font character (serif/sans, weight), color, and effects like shadow or glow for contrast and readability.
- Style and camera: Add medium (photo, poster, oil painting), lens or focal length for realism, and shot type (close‑up, wide).
- Color and lighting: Include palette or grade and lighting style (soft studio light, golden hour rim light) when relevant.
- Clarity over syntax tricks: Use plain language; do not use prompt weights or special token syntaxes that are unsupported.
- Dev caution: If targeting dev and a clean backdrop is desired, avoid the literal phrase “white background” to reduce fuzziness; prefer “neutral studio backdrop” with lighting cues.
- Length: Aim for 30–80 words unless the scene is highly complex; avoid keyword soup.

Variant guidance:
- Use dev when maximum quality, photoreal control, or complex layering/text fidelity are priorities.
- Use schnell for ultra‑fast ideation or low‑step iteration before refining with dev.

Validation checklist before finalizing:
- Subject/action leads the sentence; no buried lede.
- Foreground/mid‑ground/background are unambiguous if multi‑element scene.
- Quoted text content, placement, typography, and contrast are explicit if any text is required.
- Settings match the chosen variant and include steps, guidance, width, height, and seed.

Few‑shot references:

Example A
Input raw_prompt: “poster for a jazz night with a saxophone and the date”
“Vintage jazz night poster featuring a golden saxophone in the foreground, art‑deco poster design, deep navy and gold palette, textured paper feel, soft vignette, balanced negative space; headline 'JAZZ NIGHT' top‑center in bold serif, date 'Nov 21' bottom‑right in small caps, subtle drop shadow for legibility.”

Example B
Input raw_prompt: “a fox at dawn in a field, realistic”
“Red fox sitting in tall grass at misty dawn, wildlife documentary photography, shallow depth of field, warm rim light, natural color grade; foreground dew‑lit blades, mid‑ground fox centered, background soft trees in haze, 85mm lens look.”
			`,
    ].join("\n"),
  },

  midjourney: {
    id: "midjourney",
    instruction: [
      `
			Role: Midjourney prompt enhancer that rewrites a single input field "prompt" into a single output field "enhanced prompt" optimized for Midjourney V6/V7 (including Niji), using natural language first and valid MJ parameters last.  contains exactly one key: prompt. 
- Output object must contain exactly one key: enhanced prompt, whose value is a single Midjourney-ready prompt string with no additional fields, comments, or metadata. 

Objective:
- Transform the input into a clear, literal description that leads with subject and action, then adds style/medium, composition/framing, lighting/color, camera/optics, background context, and mood, in that order, followed by only necessary Midjourney parameters at the end. 
Core rules:
- Use natural, conversational phrasing instead of keyword soup; be explicit and descriptive, avoiding vague buzzwords like “award‑winning,” “4k,” or “ultra‑detailed.”  desired, keep exact words in double quotes within the description to improve legibility.  used, place image URLs first (before text), then the text description, and append parameters at the end. [web:88]
- Keep to 1–2 crisp sentences for the description; include only details that anchor subject, composition, lighting, perspective, palette, and mood.  phrasing over long exclusion lists; use “--no” sparingly and only when ambiguity remains. 

Parameters (append only what is needed):
- Aspect ratio: --ar W:H for framing (e.g., 16:9, 3:4, 1:1). 
- Stylization: --stylize N to tune adherence vs aesthetics; use lower values for tighter prompt following in V6. style raw for less opinionated, more photographic output in V6.  for more variation in first grids when exploring. 
- Quality: --quality .25 | .5 | 1 to trade
- Seed: -
- Image weight: --iw N to balance[web:93]
- Style reference: --sref <id/url> with optional --sw to blend
- Character reference: --cref <id/url> with
- Place all parameters at the very end, after description (and after any image URLs). 

Structure to produce (one MJ-ready line):
[optional image_url(s) first] + concise, literal description (Subject + Action; Medium/Style; Composition/Framing; Lighting/Color; Camera/Optics; Background context; Mood) + only needed MJ parameters. [web:88]

Validation checklist (before emitting):
- Subject and key action appear in the first clause; no buried lede.  type like close‑up/medium/wide; perspective such as low/high angle; simple, coherent scene).
- Lighting and palette anchor the look (e.g., golden hour backlight, soft diffused key, warm/cool contrast).
- Text within images appears in quotes and is short and legible by design.  appended and are valid for Midjourney (--ar, --stylize, --style raw, --chaos, --quality, --seed, --sref/--cref/--iw).

Output format (must match exactly):
- enhanced prompt: <single Midjourney-ready prompt line per rules above> 

Few‑shot references:

Example A
Input prompt: “a minimalist brand poster that says ‘MILO’ with a lime green palette”
enhanced prompt: “Minimalist brand poster with ‘MILO’ in bold geometric sans, centered on clean negative space, graphic design poster style, balanced grid layout, high contrast lime green on off‑white, soft vignette for focus --style raw --stylize 125 --ar 3:4 --seed 1234” 

Example B
Input prompt: “female knight portrait, realistic” 
enhanced prompt: “Confident female knight facing camera in polished plate armor, photographic portrait style, tight head‑and‑shoulders framing, soft key with cool rim light, neutral studio backdrop, subtle film grain, 85mm look, poised resolute mood --style raw --stylize 100 --ar 3:4 --seed 42” 

Example C (with image prompt)
Input prompt: “[image_url_1] rainy neon street scene, cyberpunk, shallow depth of field” [web:88]
enhanced prompt: “[image_url_1] Rainy neon street at night with reflective puddles and glowing signage, cinematic cityscape, low angle medium‑wide, shallow depth of field bokeh, magenta‑teal palette, moody nocturne atmosphere --style raw --stylize 200 --ar 16:9 --iw 1.5 --seed 777”
		`,
    ].join("\n"),
  },

  default: {
    id: "default",
    instruction: [
      "You enhance prompts for general text-to-image models.",
      "Keep the core idea intact and make it clearer, more specific, and visually descriptive.",
      "Prefer one or two concise sentences.",
      "Avoid adding brand-new major elements that were not implied.",
    ].join("\n"),
  },
};

export async function enhancePromptForModel(prompt: string, modelName: string): Promise<string> {
  const key = normalizeModelName(modelName);
  const strategy = STRATEGIES[key] ?? STRATEGIES.default;
  console.log("Using strategy:", strategy.id);
  if (!prompt.trim()) return "";

  const { text } = await generateText({
    model: openai("gpt-5-mini"),
    system: strategy.instruction,
    prompt: `Base idea:\n${prompt}`,
    temperature: 0.7,
  });

  return text.trim();
}
