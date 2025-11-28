"use client";

import { PencilSimpleIcon, PlusCircleIcon, SwapIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import React, { useState, useMemo } from "react";

import { supabase } from "@/src/lib/supabase/client";
import { PresetData } from "@/src/types/BaseType";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dotted-dialog";
import PresetCard from "../ui/PresetCard";

type Props = {
  forModel?: string;
  onSelectPrompt?: (prompt: string) => void;
  triggerClassName?: string;
};

const fetchPresets = async (forModel?: string): Promise<PresetData[]> => {
  let query = supabase.from("presets").select("*");

  if (forModel) {
    // This is the ideal way to check if an array column contains a specific value.
    // It checks if the two arrays have any elements in common.
    query = query.overlaps("for_model", [forModel]);
  }

  // optional ordering
  const { data, error } = await query.order("id", { ascending: true });

  if (error) {
    console.error("Error fetching presets:", error);
    throw error;
  }

  // It's safer to return an empty array than null/undefined if data is null
  return (data as PresetData[]) || [];
};

const PresetModal: React.FC<Props> = ({ forModel, onSelectPrompt, triggerClassName }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<PresetData | null>(null);
  const [selectedTag, setSelectedTag] = useState<string>("all");

  const {
    data: presets = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["presets", forModel],
    queryFn: async () => fetchPresets(forModel),
    enabled: isDialogOpen,
    staleTime: 1000 * 60 * 2,
  });

  // Extract all unique tags from presets
  const allTags = useMemo(() => {
    const tags = presets.flatMap((preset) => preset.tags || []);
    return ["all", ...Array.from(new Set(tags))];
  }, [presets]);

  // Filter presets based on selected tag
  const filteredPresets = useMemo(() => {
    if (selectedTag === "all") {
      return presets;
    }
    return presets.filter((preset) => preset.tags && preset.tags.includes(selectedTag));
  }, [presets, selectedTag]);

  const handleSelect = (preset: PresetData) => {
    setSelectedPreset(preset);
    setIsDialogOpen(false);
    if (onSelectPrompt && preset.prompt) onSelectPrompt(preset.prompt);
  };

  const hasPreview = Boolean(selectedPreset?.cover);
  const previewAlt = selectedPreset?.name ?? "Presets";

  return (
    <Dialog
      open={isDialogOpen}
      onOpenChange={(open) => {
        setIsDialogOpen(open);
        // Reset filter when dialog closes
        if (!open) {
          setSelectedTag("all");
        }
        if (open) refetch();
      }}
    >
      <DialogTrigger asChild>
        <div
          className={`group relative z-20 h-[95px] w-[70px] flex-shrink-0 cursor-pointer overflow-hidden rounded-2xl transition-transform hover:scale-105 active:scale-100 ${triggerClassName ?? ""}`}
        >
          {/* <div className="pointer-events-none absolute inset-0 rounded-3xl shadow-[inset_0_4px_18px_rgba(0,0,0,0.5)]"></div> */}

          {hasPreview ? (
            <Image
              className="size-full rounded-lg object-cover transition-all duration-300 group-hover:brightness-90"
              src={selectedPreset!.cover!}
              alt={previewAlt}
              width={150}
              height={95}
            />
          ) : (
            <div className="flex size-full flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-neutral-800 to-neutral-700 text-white transition-all duration-300 group-hover:brightness-95">
              <PlusCircleIcon size={28} weight="fill" />
              <p className="mt-1 text-xs font-medium text-white/80">Prompts</p>
            </div>
          )}

          {hasPreview && (
            <>
              <div className="absolute inset-x-2 bottom-2 rounded-md bg-black/30 p-1 text-center transition-opacity group-hover:opacity-0">
                <p className="truncate font-satoshi text-sm font-medium text-accent">
                  {selectedPreset?.name ?? "Selected Preset"}
                </p>
              </div>

              <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                <span className="rounded-xl bg-black/50 px-2 py-1 text-xs text-white/90">
                  <SwapIcon size={20} weight="fill" />
                </span>
              </div>
            </>
          )}
        </div>
      </DialogTrigger>

      <DialogContent className="flex h-[90vh] w-full max-w-3xl flex-col rounded-[30px] p-0">
        <DialogHeader className="px-4 sm:px-6">
          <DialogTitle className="text-lg sm:text-xl">Prompts</DialogTitle>
          {/* <DialogDescription className="text-xs sm:text-sm md:text-base">
            Prompts are ready-made prompt templates designed to help you create stylish, trendy, and
            creative visuals instantly. Pick a preset to use its prompt — you can edit it after
            selection if you want.
          </DialogDescription> */}
        </DialogHeader>

        {/* Improved Responsive Tags Filter */}
        {allTags.length > 1 && (
          <div className="px-3 sm:px-4">
            <div className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20 flex flex-wrap gap-1.5 overflow-x-auto pb-2">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`flex-shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                    selectedTag === tag
                      ? "bg-accent text-black shadow-sm"
                      : "bg-white/10 text-white/80 hover:bg-white/20 hover:text-white"
                  }`}
                >
                  {tag === "all" ? "All" : `#${tag}`}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="size-full overflow-y-auto p-3 sm:p-4">
          {isLoading && (
            <div className="py-8 text-center text-sm text-white/70">Loading Prompts</div>
          )}

          {isError && (
            <div className="py-4 text-center text-sm text-rose-400">
              Error loading Prompts: {(error as any)?.message ?? "Unknown error"}
            </div>
          )}

          {!isLoading && filteredPresets.length === 0 && (
            <div className="py-8 text-center text-sm text-white/60">
              {selectedTag === "all"
                ? "Prompts are coming soon for this model."
                : `No Prompts found with the "${selectedTag}" tag.`}
            </div>
          )}

          {!isLoading && filteredPresets.length > 0 && (
            <div className="grid auto-rows-fr grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredPresets.map((p) => (
                <PresetCard key={p.id} preset={p} onSelect={handleSelect} />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PresetModal;
