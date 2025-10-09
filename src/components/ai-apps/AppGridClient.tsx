"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/src/lib/supabase/client";
import { useState } from "react";
import Masonry from "react-masonry-css";
import AppCard from "./AppCard";
import { getTagColor } from "@/src/utils/server/utils";
interface AiApp {
  id: string;
  app_name: string;
  cover_image: string;
  tags: string[];
}

async function fetchApps(): Promise<AiApp[]> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("get_ai_apps");
  if (error) {
    console.error("Error fetching apps:", error);
    throw new Error("Could not fetch AI apps.");
  }
  return data || [];
}

export default function AppGridClient({
  initialApps,
  compact = false,
}: {
  initialApps?: AiApp[];
  compact?: boolean;
}) {
  const breakpointColumnsObj = {
    default: 5,
    1500: 3,
    1100: 2,
    700: 1,
  };
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const {
    data: apps,
    isLoading,
    error,
  } = useQuery<AiApp[]>({
    queryKey: ["apps"],
    queryFn: fetchApps,
    initialData: initialApps,
  });

  if (isLoading) return <p className="mt-8 text-white">Loading apps...</p>;
  if (error) return <p className="mt-8 text-red-500">Error fetching apps: {error.message}</p>;

  const allTags = Array.from(new Set(apps?.flatMap((app) => app.tags) || []));

  const filteredApps = selectedTag ? apps?.filter((app) => app.tags.includes(selectedTag)) : apps;

  return (
    <div>
      <div className="my-4 flex flex-wrap gap-2">
        {allTags.map((tag: string, index: number) => (
          <button
            key={tag}
            onClick={() => setSelectedTag((prev) => (prev === tag ? null : tag))}
            className={`rounded-full border px-3 py-1 transition-colors ${
              selectedTag === tag
                ? "border-accent bg-accent font-semibold text-black"
                : `bg-gray-800/50 hover:bg-gray-700/50 ${getTagColor(index)}`
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="app-masonry-grid mt-8"
        columnClassName="app-masonry-grid_column"
      >
        {filteredApps?.map((app) => (
          <AppCard
            key={app.id}
            id={app.id}
            appName={app.app_name}
            previewUrl={app.cover_image}
            compact={compact}
          />
        ))}
      </Masonry>
    </div>
  );
}
