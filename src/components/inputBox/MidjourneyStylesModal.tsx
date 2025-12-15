"use client";

import { PlusCircleIcon, SwapIcon, X } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import React, { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";

import { useMediaQuery } from "@/src/hooks/use-media-query";
import { createClient } from "@/src/lib/supabase/client";
import { MidjourneyStyleData } from "@/src/types/BaseType";

import StyleCard from "../ui/StyleCard";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dotted-dialog";

type Props = {
  onSelectPrompt: (prompt: string) => void;
  triggerClassName?: string;
  selectedStyle?: MidjourneyStyleData | null;
  onSelect?: (style: MidjourneyStyleData) => void;
  currentPrompt?: string;
};

const fetchStyles = async (): Promise<MidjourneyStyleData[]> => {
  const supabase = createClient();
  const { data, error } = await supabase.from("midjourney_styles").select("*");

  if (error) {
    console.error("Error fetching midjourney styles:", error);
    throw error;
  }

  return (data as MidjourneyStyleData[]) || [];
};

const MidjourneyStylesModal: React.FC<Props & { variant?: "default" | "node" }> = ({
  onSelectPrompt,
  triggerClassName,
  selectedStyle: controlledSelectedStyle,
  onSelect,
  currentPrompt,
  variant = "default",
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [internalSelectedStyle, setInternalSelectedStyle] = useState<MidjourneyStyleData | null>(
    null,
  );
  const selectedStyle = controlledSelectedStyle ?? internalSelectedStyle;
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    data: styles = [],

    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["midjourney_styles"],
    queryFn: fetchStyles,
    enabled: isDialogOpen,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Extract all unique tags
  const allTags = useMemo(() => {
    const tags = styles.flatMap((style) => style.tags || []);
    return ["all", ...Array.from(new Set(tags))];
  }, [styles]);

  // Filter styles based on selected tag
  const filteredStyles = useMemo(() => {
    if (selectedTag === "all") {
      return styles;
    }
    return styles.filter((style) => style.tags && style.tags.includes(selectedTag));
  }, [styles, selectedTag]);

  const handleSelect = (style: MidjourneyStyleData) => {
    if (onSelect) {
      onSelect(style);
    } else {
      setInternalSelectedStyle(style);
    }

    // Auto-close with a small delay to allow state updates to settle
    setTimeout(() => {
      setIsDialogOpen(false);
    }, 50);

    // We no longer update the prompt text here (as per user request)
    // The style is stored in selectedStyle and appended during generation
  };

  const hasPreview = Boolean(selectedStyle?.cover);
  const previewAlt = selectedStyle?.name ?? "Styles";

  const renderContent = () => (
    <div className="flex h-full flex-col">
      {/* Tags Filter */}
      {allTags.length > 1 && (
        <div className={isMobile ? "mb-4" : "px-3 sm:px-4"}>
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

      <div className={`size-full overflow-y-auto ${isMobile ? "p-4" : "p-6 sm:p-8"}`}>
        {isLoading && (
          <div className="py-8 text-center text-sm text-white/70">Loading Styles...</div>
        )}

        {isError && (
          <div className="py-4 text-center text-sm text-rose-400">
            Error loading Styles: {(error as any)?.message ?? "Unknown error"}
          </div>
        )}

        {!isLoading && !isError && filteredStyles.length === 0 && (
          <div className="py-8 text-center text-sm text-white/60">
            {selectedTag === "all"
              ? "No styles found."
              : `No styles found with the "${selectedTag}" tag.`}
          </div>
        )}

        {!isLoading && !isError && filteredStyles.length > 0 && (
          <div className="grid grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {filteredStyles.map((style) => (
              <StyleCard key={style.id} style={style} onSelect={handleSelect} />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const triggerContent = (
    <div
      onClick={() => {
        if (isMobile) {
          setIsDialogOpen(true);
          refetch();
        }
      }}
      className={`md: group relative z-20 h-[130px] w-full flex-shrink-0 cursor-pointer overflow-hidden rounded-2xl transition-transform hover:scale-105 active:scale-100 md:h-[95px] md:w-[70px] ${triggerClassName ?? ""}`}
    >
      {hasPreview ? (
        <img
          className="size-full rounded-lg object-cover transition-all duration-300 group-hover:brightness-90"
          src={selectedStyle!.cover!}
          alt={previewAlt}
          width={150}
          height={95}
        />
      ) : (
        <div className="flex size-full flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-neutral-800 to-neutral-700 text-white transition-all duration-300 group-hover:brightness-95">
          <PlusCircleIcon size={28} weight="fill" />
          <p className="mt-1 text-xs font-medium text-white/80">Styles</p>
        </div>
      )}

      {hasPreview && variant === "default" && (
        <>
          <div className="absolute inset-x-2 bottom-2 rounded-md bg-black/30 p-1 text-center transition-opacity group-hover:opacity-0">
            <p className="truncate font-satoshi text-sm font-medium text-accent">
              {selectedStyle?.name ?? "Selected Style"}
            </p>
          </div>

          <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
            <span className="rounded-xl bg-black/50 px-2 py-1 text-xs text-white/90">
              <SwapIcon size={20} weight="fill" />
            </span>
          </div>
        </>
      )}

      {hasPreview && variant === "node" && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
          <p className="text-center font-satoshi text-sm font-bold text-white drop-shadow-md">
            {selectedStyle?.name ?? "Selected Style"}
          </p>
        </div>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <>
        {triggerContent}
        {mounted &&
          createPortal(
            <AnimatePresence>
              {isDialogOpen && (
                <motion.div
                  initial={{ opacity: 0, y: "100%" }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className="fixed inset-0 z-[9999] flex h-full flex-col bg-black p-4"
                >
                  <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">Select Style</h2>
                    <button
                      onClick={() => setIsDialogOpen(false)}
                      className="rounded-2xl bg-white/10 p-2 text-white/70 hover:bg-white/20"
                    >
                      <X size={24} />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto pb-8">{renderContent()}</div>
                </motion.div>
              )}
            </AnimatePresence>,
            document.body,
          )}
      </>
    );
  }

  return (
    <Dialog
      open={isDialogOpen}
      onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) setSelectedTag("all");
        if (open) refetch();
      }}
    >
      <DialogTrigger asChild>{triggerContent}</DialogTrigger>
      <DialogContent className="flex h-[95vh] w-[95vw] max-w-none flex-col rounded-[24px] bg-[#0C0C0C] p-0 text-white shadow-2xl ring-1 ring-white/10">
        <DialogHeader className="px-6 py-4">
          <DialogTitle className="text-xl font-semibold">Select Style</DialogTitle>
          <DialogDescription className="sr-only">
            Select a style to apply to your Midjourney generation.
          </DialogDescription>
        </DialogHeader>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
};

export default MidjourneyStylesModal;
