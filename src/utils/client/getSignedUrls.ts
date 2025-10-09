"use client";
import { createClient } from "@/src/lib/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";

type ImageObject = { id: string | number; imageUrl: string };

type SignedUrlReturn<T> = T extends string
  ? string
  : T extends string[]
    ? string[]
    : T extends ImageObject[]
      ? ImageObject[]
      : never;

interface GetSignedUrlsOptions {
  supabase?: SupabaseClient;
  expiresIn?: number; // default 3600s (1 hour)
}

/**
 * Generates signed URLs for Supabase Storage assets.
 * Works with single strings, string arrays, or object arrays.
 * Automatically uses your SSR Supabase client if none is provided.
 */
export async function getSignedUrls<T extends string | string[] | ImageObject[]>(
  input: T,
  bucketName: string,
  options: GetSignedUrlsOptions = {},
): Promise<SignedUrlReturn<T>> {
  const { supabase, expiresIn = 3600 } = options;

  // ✅ Use provided Supabase client or create one (works in Next.js Server Components)
  const client = supabase ?? (await createClient());

  async function createSignedUrl(path: string): Promise<string | null> {
    if (!path) return null;

    const { data, error } = await client.storage.from(bucketName).createSignedUrl(path, expiresIn);

    if (error || !data?.signedUrl) {
      console.warn(`❌ Failed to sign ${path} in bucket ${bucketName}:`, error?.message);
      return null;
    }
    return data.signedUrl;
  }

  // 🧩 Handle single string
  if (typeof input === "string") {
    const signedUrl = await createSignedUrl(input);
    return (signedUrl ?? input) as SignedUrlReturn<T>;
  }

  // 🧩 Handle string[]
  if (Array.isArray(input) && typeof input[0] === "string") {
    const results = await Promise.all(
      (input as string[]).map(async (path) => (await createSignedUrl(path)) ?? path),
    );
    return results as SignedUrlReturn<T>;
  }

  // 🧩 Handle {id, imageUrl}[]
  if (Array.isArray(input) && typeof input[0] === "object") {
    const imageObjects = input as ImageObject[];
    const results = await Promise.all(
      imageObjects.map(async (obj) => {
        const signedUrl = await createSignedUrl(obj.imageUrl);
        return { ...obj, imageUrl: signedUrl ?? obj.imageUrl };
      }),
    );
    return results as SignedUrlReturn<T>;
  }

  // Fallback
  return input as unknown as SignedUrlReturn<T>;
}

export function normalizeImages(input: any): string | string[] | ImageObject[] {
  if (!input) return [];
  return input;
}
