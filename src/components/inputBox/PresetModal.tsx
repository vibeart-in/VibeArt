"use client";

import { PencilSimpleIcon, PlusCircleIcon, SwapIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import React, { useState } from "react";

import { supabase } from "@/src/lib/supabase/client"; // your supabase client
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

  const {
    data: presets = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["presets", forModel],
    queryFn: async () => fetchPresets(forModel),
    enabled: isDialogOpen, // only fetch when dialog is open
    staleTime: 1000 * 60 * 2, // 2 minutes optional
  });

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
        // optional: refetch on open to get latest
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
              <p className="mt-1 text-xs font-medium text-white/80">Presets</p>
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

      <DialogContent className="w-full max-w-3xl rounded-[30px]">
        <DialogHeader>
          <DialogTitle>Presets</DialogTitle>
          <DialogDescription>
            Presets are ready-made prompt templates designed to help you create stylish, trendy, and
            creative visuals instantly. Pick a preset to use its prompt — you can edit it after
            selection if you want.
          </DialogDescription>
        </DialogHeader>

        <div className="size-full overflow-y-auto p-4">
          {isLoading && (
            <div className="py-8 text-center text-sm text-white/70">Loading presets…</div>
          )}

          {isError && (
            <div className="py-4 text-center text-sm text-rose-400">
              Error loading presets: {(error as any)?.message ?? "Unknown error"}
            </div>
          )}

          {!isLoading && presets.length === 0 && (
            <div className="py-8 text-center text-sm text-white/60">
              Presets are coming soon for this model.
            </div>
          )}

          {!isLoading && presets.length > 0 && (
            <div className="grid auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {presets.map((p) => (
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
