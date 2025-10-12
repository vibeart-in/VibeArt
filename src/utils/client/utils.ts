import { InputBoxParameter } from "@/src/types/BaseType";

export function extractParams(parameters: InputBoxParameter, model_name: string) {
  let aspectRatio: string | undefined = undefined;
  let batch = 1;

  // --- CASE 1: Array of fields (ComfyUI style) ---
  if (Array.isArray(parameters)) {
    for (const param of parameters) {
      const name = param.description?.toLowerCase();

      if (name === "aspect_ratio") {
        const raw = String(param.fieldValue || "").toLowerCase().trim();

        // match "1:1", "16:9", etc.
        const colonMatch = raw.match(/(\d+)\s*:\s*(\d+)/);
        if (colonMatch) {
          aspectRatio = `${colonMatch[1]}:${colonMatch[2]}`;
        }
        // match "1024x768" or "1024×768"
        else {
          const xMatch = raw.match(/(\d+)\s*[x×]\s*(\d+)/);
          if (xMatch) {
        aspectRatio = `${xMatch[1]}:${xMatch[2]}`;
          } else {
        // fallback: if there's a single number like "1" treat as "1:1", otherwise try first number
        const numMatch = raw.match(/^\d+$/) || raw.match(/\d+/);
        if (numMatch) {
          const n = numMatch[0];
          aspectRatio = `${n}:${n}`;
        }
          }
        }
      }
      if (name === "batch_size" || name === "num_of_output") {
        // Try to extract a number from fieldValue, even if it's a string like "3:4 portrait 896x1152"
        batch = Number(param.fieldValue);
      }
    }
  }

  // --- CASE 2: JSON schema style ---
  else if (typeof parameters === "object" && parameters !== null) {
    // direct aspect ratio
    if (parameters.aspect_ratio) {
      // @ts-ignore
      aspectRatio = parameters.aspect_ratio;
    }

    // direct batch value if provided
    if (parameters.batch_size || parameters.num_of_output) {
      batch = Number(parameters.batch_size || parameters.num_of_output) || batch;
    }
  }

  // --- Midjourney override ---
  if (model_name.toLowerCase().includes("midjourney")) {
    batch = 4;
  }

  return { aspectRatio, batch };
}
