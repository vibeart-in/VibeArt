// src/utils/prompts.ts
export type PromptsByModel = Record<string, string[]>;

/**
 * Return a random element from an array, or undefined if empty.
 */
export function pickRandom<T>(arr?: T[]): T | undefined {
  if (!arr || arr.length === 0) return undefined;
  const idx = Math.floor(Math.random() * arr.length);
  return arr[idx];
}

/**
 * Get a randomized prompt for a given model name.
 *
 * - modelName: string | undefined (safe to pass nothing)
 * - promptsByModel: optional overrides for the default map
 * - fallbackPrompts: optional override for fallback prompts
 *
 * Matching strategy (in order):
 * 1. exact (case-insensitive) key match
 * 2. loose match: any key that includes modelName or modelName includes the key
 * 3. fallback prompts
 */
export function getRandomPromptForModel(
  modelName?: string,
  promptsByModel?: PromptsByModel,
  fallbackPrompts?: string[],
): string {
  const DEFAULT_PROMPTS: PromptsByModel = {
    "Photon Flash": [
      "Person peaking from back of the flower with cinematic blur",
      "A train car is engulfed in a massive explosion, with flames and smoke billowing into the sky as debris flies in all directions, cinematic photograph, explosive action, high contrast, dynamic lighting.",
      "Hand holding flower paddles, subdue, realistic camera, 85mm lens, shallow depth of field",
      "a dog hotel in a city with colorful identity",
      "Rainforest tree frog realistic above view:",
    ],
    Photon: [
      "Person peaking from back of the flower with cinematic blur",
      "A train car is engulfed in a massive explosion, with flames and smoke billowing into the sky as debris flies in all directions, cinematic photograph, explosive action, high contrast, dynamic lighting.",
      "Hand holding flower paddles, subdue, realistic camera, 85mm lens, shallow depth of field",
      "black women with short hair wearing a gold hook earing, Her hand is placed on side of his hair braded",
      "full body horizontal studio portrait of a female fashion model resting on the floor",
    ],
    "Image 01": [
      "Golden‑hour portrait of a person in soft backlight, 85mm look, shallow depth, natural skin texture, subtle rim light, cinematic coloration",
      "Macro of a rainforest tree frog perched on a glossy leaf with dewdrops, 100mm macro look, diffused daylight, high micro‑detail",
      "Modern living room interior with floor‑to‑ceiling windows, overcast soft light, natural materials, wide‑angle perspective and clean lines",
      "Rainy neon street at blue hour, reflective puddles, anamorphic flares, moody atmosphere, subject crossing under umbrella, high dynamic range",
      "Luxury watch on wrist, brushed steel and sapphire reflections, softbox gradients, crisp micro‑detail on dial and bezel",
    ],
    "Stable Diffusion 3.5 medium": [
      "Lifestyle portrait, soft window light, 85mm lens look, shallow depth of field, natural skin texture, editorial color grade",
      "Epic fantasy valley at sunrise with low fog, warm rim light on cliffs, leading lines, balanced foreground/midground/background composition",
      "Matte black smartphone on seamless grey, studio softbox reflections, clean speculars, high contrast, product photography aesthetic",
      "Overhead brunch spread on rustic table, natural window light, crisp shadows, fresh herbs for color pop, vibrant yet realistic",
      "High‑speed splash of colored liquid against black, frozen droplets, hard rim light, crisp contrast and ultra‑sharp detail",
    ],
    "Stable Diffusion 3.5 Large Turbo": [
      "Cinematic street scene at night with rain and bokeh, 35mm perspective, wet pavement reflections, crowd silhouettes, high clarity",
      "Athlete mid‑stride on track at golden hour, motion frozen, dust particles visible, strong rim light, telephoto compression",
      "Architectural facade with repeating patterns, side‑lit at golden hour, razor‑sharp edges, precise concrete and glass textures",
      "Studio fashion full‑body on seamless, crisp shadow edge, gel accents, medium‑format look, refined fabric detail",
      "Macro honeybee on sunflower, pollen granules sharp, soft background, natural daylight, 100mm macro aesthetic",
    ],
    "Imagen 4 Ultra": [
      "Photoreal headshot, soft Rembrandt lighting, 85mm lens cues, shallow depth, fine skin detail, neutral background, cinematic color grade",
      "Product still life of a clear perfume bottle with glass caustics on black velvet, controlled speculars, high micro‑contrast, studio precision",
      "Cathedral interior with volumetric god rays through stained glass, fine stone detail, balanced exposure, tripod‑stable clarity",
      "Farm‑to‑table salad on ceramic plate, natural window light, crisp greens, subtle steam, shallow depth and realistic color",
      "Poster on textured wall that reads “CITY JAZZ NIGHT” in bold sans serif, accurate kerning, clean layout, photoreal lighting",
    ],
    "Imagen 4": [
      "Warm café portrait by a window, soft backlight, shallow depth, natural tones, candid expression",
      "Sunset coastal cliffs with sea spray and birds in flight, golden rim light, dramatic clouds",
      "Sleek sneakers on white seamless with softbox highlights, clean reflections, minimal styling",
      "Modern office interior with plants and wood accents, overcast soft light, wide composition",
      "City skyline at blue hour with long‑exposure light trails over a bridge, high clarity",
    ],
    "Imagen 4 Fast": [
      "Close‑up portrait, soft window light, 85mm, shallow depth",
      "Neon street in rain, bokeh, reflective puddles, moody blue hour",
      "Minimal product on seamless, softbox reflections, high contrast",
      "Mountain lake sunrise, mist, warm rim light on peaks",
      "Classic car on desert road at dusk, dust trail, golden backlight",
    ],
    "Recraft V3 Svg": [
      "Flat SVG icon of a coffee cup, 2‑color palette, monoline outline, no gradients, pixel‑perfect, vector only",
      "Minimal geometric logo for “Aurora”, stylized letter A with balanced negative space, flat vector, scalable, no textures",
      "Set of 8 UI line icons (home, search, bell, user, gear, chat, heart, camera), 24px grid, even stroke, SVG output",
      "Badge sticker that reads “SAVE 50%”, bold sans serif, flat colors, clean outline, no shadows, vector shapes",
      "Isometric delivery truck, 3‑color flat palette, crisp edges, no gradients, SVG friendly construction",
    ],
    "Recraft V3": [
      "Sticker‑pack style illustration: cute fruit characters with bold outlines, flat shading, vibrant palette, clean vector look",
      "Poster design for a synthwave concert, neon gradients, grid horizon, bold typography placement, crisp vector shapes",
      "T‑shirt graphic of a roaring tiger head, sharp outlines, limited spot colors, halftone accent, print‑ready look",
      "Isometric workspace scene with laptop and plants, soft flat shading, organized composition, pastel palette",
      "Iconic skyline in minimalist vector style, 2‑3 colors, simplified silhouettes, balanced negative space",
    ],
    "Nano Banana": [
      "Photoreal portrait with clean studio lighting, crisp eyes and skin texture, neutral backdrop, ready for iterative edits",
      "Modern living room with a wall poster that reads “WELCOME HOME”, accurate typography, natural window light, soft shadows",
      "Urban streetwear lookbook shot, consistent identity across angles implied in session, soft rim light, realistic fabric texture",
      "Kitchen scene with a blue ceramic mug replaced by a red one, consistent lighting, precise local change, photoreal finish",
      "Product hero of a smartwatch on dark acrylic, controlled speculars, micro‑detail on crown and strap, high realism",
    ],
    "Seedream 4": [
      "High‑detail architectural exterior at golden hour, glass and concrete materials, realistic reflections, 4K clarity",
      "Editorial food spread with labeled elements (small caption tags), overhead composition, natural window light, crisp textures",
      "Fantasy jungle ruins at dawn, volumetric mist, complex foliage layers, warm rim light, cinematic atmosphere",
      "Tech product trio on colored acrylic blocks, soft gradients, clean shadows, precise material separation, commercial polish",
      "Infographic‑style timeline with clear section headers, minimal palette, neat layout, crisp vector‑like rendering",
    ],
    "Ideogram V3": [
      "Vintage poster on a brick wall that reads “SUMMER FESTIVAL” in bold serif, warm print texture, balanced layout",
      "Minimal logo on white that reads “NOVA” in uppercase sans serif, tight kerning, clean vector look",
      "T‑shirt design that reads “CODE & COFFEE”, hand‑lettered script with bold shadow, centered composition",
      "Billboard mockup that reads “FRESH MARKET TODAY”, photoreal street scene, accurate perspective and kerning",
      "Album cover that reads “MIDNIGHT DRIVE”, neon typography, retro grid, starry sky background",
    ],
    "Flux Dev": [
      "moody portrait, soft rim light, 85mm, shallow depth, film grain, neutral grade",
      "neon city street, rain, bokeh, reflective pavement, cinematic, wide shot",
      "clean product on seamless, softbox highlight, high contrast, editorial",
      "sunrise mountains, low fog, warm rim light, deep contrast, dramatic sky",
      "minimal interior, overcast light, natural materials, wide angle, crisp edges",
    ],
    "Flux Schnell": [
      "isometric workspace, pastel palette, soft shadows, clean geometry",
      "street portrait, golden hour, shallow depth, candid expression",
      "sci‑fi corridor, volumetric fog, rim lights, metallic textures",
      "vector sticker sheet, bold outlines, limited colors, playful icons",
      "night skyline, long exposure light trails, high clarity",
    ],
    "Flux 1.1 Pro": [
      "Photoreal editorial headshot, soft Rembrandt light, 85mm cue, subtle film grain, natural skin texture, neutral backdrop",
      "Cinematic rainy alley, reflective water, neon signage, moody atmosphere, anamorphic flares, deep contrast",
      "Studio product trio on colored acrylic, controlled speculars, precise shadows, commercial polish, high micro‑detail",
      "Documentary street scene at blue hour, practical lighting, layered depth, natural color, authentic expressions",
      "Minimal still life of citrus on linen, soft window light, delicate shadows, texture fidelity, magazine aesthetic",
    ],
    "Flux 1.1 Pro Ultra": [
      "Ultra‑detailed portrait with pore‑level detail, soft key and rim, shallow depth, refined color, premium editorial look",
      "Architectural interior with complex materials and mixed lighting, fine edge fidelity, wide dynamic range, tripod‑sharp",
      "Macro watch close‑up, brushed metal, sapphire reflections, micro indices sharp, studio gradients, luxury finish",
      "Underwater swimmer with caustics, bubbles trailing, teal‑orange grade, crisp clarity, cinematic framing",
      "Night city skyline panoramic, long exposure, starburst streetlights, mirror reflections, ultra‑high detail",
    ],
    "Wan Image": [
      "Cinematic still of a runner splashing through a puddle at dusk, frozen droplets, telephoto compression, dramatic backlight",
      "Drone‑style desert highway at golden hour with a lone car, dust trail, strong rim light, epic scale",
      "Stormy sea with lighthouse beam cutting through rain, volumetric atmosphere, high dynamic range, cinematic mood",
      "Urban market scene at blue hour, wet pavement, practical lighting, layered crowd, documentary realism",
      "Sci‑fi hangar with volumetric fog and moving light beams, glossy materials, cinematic composition, deep contrast",
    ],
  };

  const DEFAULT_FALLBACK = [
    "Cinematic portrait in soft window light, 85mm look, shallow depth, natural skin, neutral backdrop", // [web:56][web:42][web:93]
    "Cyberpunk city alley in rain, neon reflections, blue hour, bokeh, cinematic framing", // [web:56][web:98][web:93]
    "Minimal product shot of a wooden chair on seamless, softbox highlights, clean shadows, studio precision", // [web:56][web:42][web:93]
    "Epic fantasy landscape with floating islands at sunrise, volumetric mist, warm rim light, grand scale", // [web:56][web:49][web:93]
    "Photoreal astronaut portrait in suit, film grain, dramatic rim light, black background", // [web:56][web:42][web:93]
    "Vibrant watercolor seaside market scene, wet‑on‑wet texture, loose brush strokes, lively color", // [web:56][web:98][web:93]
    "Macro dew on a spiderweb at golden hour, ultra‑detailed, strong backlight bokeh, razor‑sharp focal plane", // [web:56][web:42][web:93]
    "Desert highway at dusk with a classic car, dust trail, golden backlight, long lens compression", // [web:56][web:42][web:93]
    "Modern living room interior, floor‑to‑ceiling windows, overcast soft light, natural materials, wide composition", // [web:56][web:42][web:93]
    "Rainforest tree frog macro on a glossy leaf with dewdrops, diffused daylight, 100mm macro look, micro‑detail", // [web:56][web:42][web:93]
    "Mountain lake at sunrise, low fog, mirror reflections, high dynamic range, balanced foreground and background", // [web:56][web:42][web:93]
    "Studio watch macro, brushed steel, sapphire reflections, clean gradients, luxury finish", // [web:56][web:42][web:93]
    "Overhead sushi platter, natural window light, crisp textures, minimal styling, editorial food photography", // [web:56][web:42][web:93]
    "Stormy sea with lighthouse beam cutting through rain, volumetric atmosphere, dramatic contrast, cinematic mood", // [web:56][web:42][web:93]
    "Minimal still life of citrus on linen, soft diffused daylight, subtle shadows, texture fidelity, magazine aesthetic", // [web:56][web:42][web:93]
    "Street portrait at golden hour, shallow depth, authentic expression, natural color, 50mm perspective", // [web:56][web:42][web:93]
    "Night skyline long exposure, light trails, starburst streetlights, mirror‑like reflections, tripod‑sharp clarity", // [web:56][web:42][web:93]
    "Isometric workspace scene, clean geometry, pastel palette, soft shadows, organized composition", // [web:56][web:98][web:93]
    "Underwater swimmer, caustic light patterns, bubbles trailing, teal‑orange tonal contrast, high clarity", // [web:56][web:42][web:93]
    "Sci‑fi corridor with volumetric fog, realistic metal materials, practical light strips, cinematic framing", // [web:56][web:42][web:93]
    "Botanical close‑up of a monstera leaf, glossy highlights, deep green tones, studio backdrop, macro texture", // [web:56][web:42][web:93]
    "Snowy mountain ridge, crisp atmosphere, polarized sky look, panoramic feeling, high detail", // [web:56][web:42][web:93]
    "Coffee splash frozen mid‑air, hard rim light, micro droplets visible, black background, high shutter speed look", // [web:56][web:42][web:93]
    "Classic portrait with chiaroscuro lighting, painterly background, soft falloff, timeless editorial style", // [web:56][web:42][web:93]
  ];

  const map = promptsByModel ?? DEFAULT_PROMPTS;
  const fallback = fallbackPrompts ?? DEFAULT_FALLBACK;

  // normalize modelName
  const name = modelName?.trim().toLowerCase();

  // 1) exact case-insensitive match
  if (name) {
    for (const key of Object.keys(map)) {
      if (key.toLowerCase() === name) {
        const p = pickRandom(map[key]);
        if (p) return p;
      }
    }

    // 2) loose match: key contains name or name contains key
    for (const key of Object.keys(map)) {
      const k = key.toLowerCase();
      if (k.includes(name) || name.includes(k)) {
        const p = pickRandom(map[key]);
        if (p) return p;
      }
    }
  }

  // 3) fallback
  const f = pickRandom(fallback);
  return f ?? ""; // never undefined for caller convenience
}
