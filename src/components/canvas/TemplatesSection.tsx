"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { Copy, Eye, Loader2, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { duplicateCanvas } from "@/src/actions/canvas";
import { CanvasProject } from "@/src/types/BaseType";
import { cn } from "@/src/lib/utils";

interface TemplatesSectionProps {
  templates: CanvasProject[];
}

export function TemplatesSection({ templates }: TemplatesSectionProps) {
  const router = useRouter();
  const [pendingTemplateId, setPendingTemplateId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 480; // slightly larger for the wider card sizes
      const newScrollLeft =
        direction === "left"
          ? scrollContainerRef.current.scrollLeft - scrollAmount
          : scrollContainerRef.current.scrollLeft + scrollAmount;

      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });
    }
  };

  const handleUseTemplate = (templateId: string) => {
    setPendingTemplateId(templateId);
    startTransition(async () => {
      try {
        const newCanvasId = await duplicateCanvas(templateId);
        router.push(`/canvas/${newCanvasId}`);
      } catch (error) {
        console.error("Failed to use template:", error);
        setPendingTemplateId(null);
      }
    });
  };

  if (!templates || templates.length === 0) return null;

  return (
    <section className="relative mx-auto w-full max-w-[1400px] py-8">
      {/* Header */}
      <div className="mb-6 flex items-end justify-between px-4 sm:px-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-violet-400">
            <Sparkles className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Templates</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Start with a framework</h2>
          <p className="text-sm text-neutral-400">
            Choose a pre-built node workflow to get started instantly.
          </p>
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => scroll("left")}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-800 bg-neutral-900/50 text-neutral-400 backdrop-blur-sm transition-colors hover:border-neutral-700 hover:bg-neutral-800 hover:text-white active:scale-95"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-800 bg-neutral-900/50 text-neutral-400 backdrop-blur-sm transition-colors hover:border-neutral-700 hover:bg-neutral-800 hover:text-white active:scale-95"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Scroll Container with Fade Masks */}
      <div className="group/carousel relative">
        {/* Left Fade Mask */}
        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-12 bg-gradient-to-r from-background to-transparent" />

        <div
          ref={scrollContainerRef}
          className="no-scrollbar flex snap-x snap-mandatory gap-6 overflow-x-auto px-4 pb-12 pt-2 sm:px-6"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              isPending={isPending}
              pendingId={pendingTemplateId}
              onUse={() => handleUseTemplate(template.id)}
              onView={() => router.push(`/canvas/${template.id}?mode=view`)}
            />
          ))}
        </div>

        {/* Right Fade Mask */}
        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-12 bg-gradient-to-l from-background to-transparent" />
      </div>
    </section>
  );
}

/* ---------------------------
   Updated TemplateCard style
   - larger, cleaner thumbnail
   - stronger hover lift + shadow
   - subtle rim lighting (via ring/gradient)
   - smooth overlay with centered action buttons
   - improved title typography and optional subtitle
   --------------------------- */
function TemplateCard({
  template,
  onUse,
  onView,
  isPending,
  pendingId,
}: {
  template: CanvasProject;
  onUse: () => void;
  onView: () => void;
  isPending: boolean;
  pendingId: string | null;
}) {
  const imageUrl = template.image?.public_url || template.image?.url || template.image?.image_url;
  const isLoading = isPending && pendingId === template.id;

  return (
    <div
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") onView();
      }}
      className={cn(
        "group relative flex h-40 min-w-[380px] cursor-pointer snap-center overflow-hidden rounded-3xl border border-white/5 bg-[#141414] transition-transform duration-300",
        "hover:scale-[1.012] hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-violet-500/25",
      )}
      onClick={onView}
    >
      {/* Thumbnail */}
      <div className="relative h-full w-44 shrink-0 overflow-hidden bg-neutral-900">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={template.title || "Template thumbnail"}
            className="duration-800 h-full w-full object-cover transition-transform will-change-transform group-hover:scale-110"
            draggable={false}
          />
        ) : (
          <div className="h-full w-full bg-neutral-900 bg-[radial-gradient(#262626_1px,transparent_1px)] opacity-60 [background-size:18px_18px]">
            <div className="absolute inset-0 bg-gradient-to-tr from-neutral-950/80 via-transparent to-transparent" />
          </div>
        )}

        <div className="pointer-events-none absolute left-0 top-0 h-full w-full bg-gradient-to-r from-black/25 to-transparent" />
      </div>

      {/* Content (no description) */}
      <div className="relative flex flex-1 flex-col justify-center px-5 py-4 text-left">
        <div className="flex items-center justify-between">
          <h3 className="line-clamp-2 text-sm font-semibold text-neutral-100 transition-colors group-hover:text-white">
            {template.title || "Untitled Project"}
          </h3>

          {/* <div className="ml-3 hidden items-center gap-2 text-xs text-neutral-400 sm:flex">
            <span className="rounded-md border border-neutral-800 bg-neutral-900/40 px-2 py-1 text-[11px]">
              Template
            </span>
          </div> */}
        </div>

        {/* Compact action pill overlay on hover */}
        <div className="duration-180 absolute inset-0 z-20 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-2 rounded-full bg-neutral-900/70 px-2 py-1 backdrop-blur-sm"
            role="group"
            aria-hidden={false}
          >
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onUse();
              }}
              disabled={isLoading}
              size="sm"
              className="bg-white/6 hover:bg-white/12 flex items-center gap-2 rounded-full border border-neutral-700 px-3 py-1 text-xs font-medium text-white focus:ring-2 focus:ring-violet-400/30"
              aria-label={`Use ${template.title || "template"}`}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
              <span className="sr-only">Use</span>
              <span className="hidden sm:inline">Use</span>
            </Button>

            <Button
              onClick={(e) => {
                e.stopPropagation();
                onView();
              }}
              variant="ghost"
              size="sm"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-transparent bg-neutral-800/40 p-0 text-white hover:bg-neutral-700/30 focus:ring-2 focus:ring-violet-400/25"
              title="Preview"
              aria-label={`Preview ${template.title || "template"}`}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
