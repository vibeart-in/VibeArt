import { useRef } from "react";
import { ArrowLeft, ArrowRight, LayoutTemplateIcon } from "lucide-react";

interface Template {
  id: string;
  title: string;
  image: string;
  user_id: string;
  category: string;
}

interface TemplatesSliderProps {
  templates: Template[];
  onTemplateClick: (id: string) => void;
}

export function TemplatesSlider({ templates, onTemplateClick }: TemplatesSliderProps) {
  const sliderRef = useRef<HTMLDivElement>(null);

  const scrollSlider = (direction: "left" | "right") => {
    if (sliderRef.current) {
      const scrollAmount = direction === "left" ? -400 : 400;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div className="mb-12">
      <div className="mb-6 flex items-center gap-3">
        <LayoutTemplateIcon className="size-6 text-white" />
        <h2 className="font-satoshi text-2xl font-bold text-white">Templates</h2>
      </div>
      <div className="group/slider relative -mx-6 overflow-hidden px-6 md:-mx-8 md:px-8 lg:-mx-12 lg:px-12">
        {/* Left Button */}
        <button
          onClick={() => scrollSlider("left")}
          className="absolute left-10 top-1/2 z-20 flex size-10 -translate-y-1/2 items-center justify-center rounded-2xl border border-white/10 bg-neutral-900/95 text-white opacity-0 shadow-xl backdrop-blur-xl transition-all duration-150 hover:scale-105 hover:bg-neutral-800 active:scale-95 disabled:opacity-0 group-hover/slider:opacity-100 lg:left-16"
          aria-label="Scroll left"
        >
          <ArrowLeft className="size-5" />
        </button>

        {/* Right Button */}
        <button
          onClick={() => scrollSlider("right")}
          className="absolute right-10 top-1/2 z-20 flex size-10 -translate-y-1/2 items-center justify-center rounded-2xl border border-white/10 bg-neutral-900/95 text-white opacity-0 shadow-xl backdrop-blur-xl transition-all duration-150 hover:scale-105 hover:bg-neutral-800 active:scale-95 disabled:opacity-0 group-hover/slider:opacity-100 lg:right-16"
          aria-label="Scroll right"
        >
          <ArrowRight className="size-5" />
        </button>

        <div
          ref={sliderRef}
          className="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {templates.map((item) => (
            <div
              key={item.id}
              onClick={() => onTemplateClick(item.id)}
              className="group relative h-56 w-80 flex-shrink-0 cursor-pointer snap-center overflow-hidden rounded-3xl border border-white/10 bg-neutral-900 shadow-lg transition-all duration-300 hover:border-white/30 hover:shadow-2xl active:scale-[0.98]"
            >
              {/* Image with overlay effects */}
              <div className="absolute inset-0 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-full w-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-110"
                />
                {/* Gradient overlays */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-24 backdrop-blur-sm"
                  style={{
                    WebkitMaskImage:
                      "linear-gradient(to top, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)",
                    maskImage: "linear-gradient(to top, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)",
                  }}
                />
                {/* <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-80" /> */}
              </div>

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-between p-5">
                {/* Category badge */}
                <div className="flex justify-end">
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-md transition-all duration-300 group-hover:bg-white/20">
                    {item.category}
                  </span>
                </div>

                {/* Title and action */}
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-white drop-shadow-2xl transition-all duration-300 group-hover:opacity-0">
                    {item.title}
                  </h3>

                  {/* Use template text that appears on hover */}
                  <div className="absolute inset-x-5 bottom-5 flex items-center gap-2 opacity-0 transition-all duration-300 group-hover:opacity-100">
                    <div className="flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur-md transition-all duration-300 hover:bg-white/30">
                      <span className="text-lg font-bold text-white">Use Template</span>
                      <ArrowRight className="size-4 text-white transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Border glow effect */}
              <div
                className="absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{ boxShadow: "inset 0 0 20px rgba(168, 85, 247, 0.2)" }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
