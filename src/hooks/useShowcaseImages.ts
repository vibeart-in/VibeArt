// src/hooks/useShowcaseImages.ts
"use client";

import { useInfiniteQuery, QueryFunctionContext } from "@tanstack/react-query";

import { ExampleImageType } from "@/src/types/BaseType";

import { createClient } from "../lib/supabase/client";

/**
 * Public shape returned to consumers
 */
export interface ModelShowcase {
  name: string;
  cover: ExampleImageType & { is_cover: boolean; media_type: string };
  images: ExampleImageType[];
}

/**
 * Explicit query key shape so generics match everywhere.
 * Using `readonly` tuple improves inference.
 */
type ShowcaseQueryKey = readonly ["showcase", string[]];

/** Map DB row -> ExampleImageType (adjust fields if your type differs) */
const mapDbImageToExample = (row: any): ExampleImageType => ({
  id: row.id ?? "",
  mediaUrl: row?.media_url ?? "",
  thumbnailUrl: row?.thumbnail_url ?? "",
  prompt: row?.prompt ?? "",
  width: row?.width ?? 0,
  height: row?.height ?? 0,
  isVideo: row?.media_type === "video",
});

export const useInfiniteShowcase = (models: string[]) => {
  const supabase = createClient();

  // Query function: explicitly type QueryKey and pageParam as number
  const fetchModelShowcase = async ({
    pageParam = 0,
  }: QueryFunctionContext<ShowcaseQueryKey, number>): Promise<ModelShowcase> => {
    const pageIndex = typeof pageParam === "number" ? pageParam : Number(pageParam || 0);

    if (pageIndex >= models.length) {
      // react-query expects a rejection for failed fetch; returning undefined would be wrong
      throw new Error("No more models to fetch");
    }

    const modelName = models[pageIndex];

    const { data, error } = await supabase.rpc("get_showcase_by_generator", {
      p_generated_by: modelName,
    });

    if (error) {
      console.error("Error fetching model showcase:", error);
      throw new Error(error.message);
    }

    const payload: any = data;
    if (!payload) {
      throw new Error("Empty payload from get_model_showcase");
    }

    const rawCover = payload.cover ?? null;
    const rawImages = Array.isArray(payload.images) ? payload.images : [];

    const defaultCover = {
      mediaUrl: "",
      thumbnailUrl: "",
      prompt: "",
      width: 0,
      height: 0,
      isVideo: false,
      is_cover: false,
      media_type: "image",
    };

    const formatted: ModelShowcase = {
      name: String(payload.name ?? modelName),
      cover: rawCover
        ? {
            ...mapDbImageToExample(rawCover),
            is_cover: !!rawCover.is_cover,
            media_type: rawCover.media_type ?? "image",
          }
        : (defaultCover as any),
      images: rawImages.map((img: any) => mapDbImageToExample(img)),
    };

    return formatted;
  };

  const queryKey: ShowcaseQueryKey = ["showcase", models];

  // IMPORTANT: the big generics list keeps types aligned:
  // <TData, TError, TQueryFnData, TQueryKey, TPageParam>
  return useInfiniteQuery<ModelShowcase, Error, ModelShowcase, ShowcaseQueryKey, number>({
    queryKey,
    queryFn: fetchModelShowcase,
    getNextPageParam: (_lastPage, allPages) => {
      const nextIndex = allPages.length; // pages length equals the next model index
      return nextIndex < models.length ? nextIndex : undefined;
    },
    initialPageParam: 0,
  });
};
