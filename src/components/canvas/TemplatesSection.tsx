"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { Copy, ArrowRight, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
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

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 350;
      const newScrollLeft = direction === 'left' 
        ? scrollContainerRef.current.scrollLeft - scrollAmount 
        : scrollContainerRef.current.scrollLeft + scrollAmount;
        
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
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

  if(!templates || templates.length === 0) return null;

  return (
    <div className="group/section relative mb-12">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Getting started</h2>

        {/* Navigation Buttons */}
        <div className="flex gap-2">
          <button 
            onClick={() => scroll('left')}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition-all hover:bg-white/10 hover:text-white disabled:opacity-50"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button 
            onClick={() => scroll('right')}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition-all hover:bg-white/10 hover:text-white disabled:opacity-50"
             aria-label="Scroll right"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div 
        ref={scrollContainerRef}
        className="flex gap-6 overflow-x-auto pb-8 pt-2 scrollbar-hide"
      >
        {templates.map((template) => (
          <div
            key={template.id}
            className="group relative min-w-[320px] max-w-[320px] flex-shrink-0 cursor-pointer overflow-hidden rounded-2xl border border-white/5 bg-neutral-900 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-white/10 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
          >
            {/* Image Preview */}
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-800">
               {template.image && (template.image.public_url || template.image.url || template.image.image_url) ? (
                  <img 
                    src={template.image.public_url || template.image.url || template.image.image_url || ""} 
                    alt={template.title || "Template"} 
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
               ) : (
                  <div className="h-full w-full bg-gradient-to-br from-violet-900/40 via-neutral-900 to-neutral-900" />
               )}
               
               {/* Overlay Gradient */}
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-60" />
            </div>

            {/* Content Content */}
            <div className="absolute inset-0 flex flex-col justify-between p-5">
               <div className="flex justify-end">
                 {/* Optional: Add badges or tags here */}
               </div>
               
               <div className="flex flex-col gap-3">
                 <h3 className="line-clamp-1 translate-y-8 text-lg font-bold text-white drop-shadow-md transition-all duration-300 group-hover:translate-y-0">{template.title}</h3>
                 
                <div className="translate-y-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
  <Button
    className="
      relative
      h-auto px-3
      w-auto
      gap-1.5
      rounded-md
      bg-white/5
      text-xs font-medium text-white
      backdrop-blur-sm
      transition-all duration-200


      hover:bg-white/10
      disabled:opacity-40
    "
    onClick={(e) => {
      e.stopPropagation();
      handleUseTemplate(template.id);
    }}
    disabled={isPending && pendingTemplateId === template.id}
  >
    {isPending && pendingTemplateId === template.id ? (
      <Loader2 className="h-3.5 w-3.5 animate-spin" />
    ) : (
      <Copy className="h-3.5 w-3.5" />
    )}
    Use
  </Button>
</div>

               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
