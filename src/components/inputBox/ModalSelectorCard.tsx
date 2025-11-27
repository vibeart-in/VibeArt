import { PencilSimpleLineIcon, SwapIcon } from "@phosphor-icons/react";
import Image from "next/image";
import React from "react";

import type { ModelData } from "@/src/types/BaseType";

interface ModelSelectorCardProps {
  selectedModel: ModelData | null;
  onClick: () => void;
}

const ModelSelectorCard = React.memo(({ selectedModel, onClick }: ModelSelectorCardProps) => {
  console.log("Rendering ModelSelectorCard");

  if (!selectedModel) {
    return (
      <div
        onClick={onClick}
        className="group relative z-20 h-[95px] w-[120px] flex-shrink-0 cursor-pointer overflow-hidden rounded-3xl border-2 border-dashed border-gray-600 bg-gray-800/50 transition-transform hover:scale-105 active:scale-100"
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <PencilSimpleLineIcon size={24} weight="fill" className="mb-1 text-gray-400" />
          <span className="px-2 text-center font-satoshi text-xs text-gray-400">Select Model</span>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className="group relative z-20 h-[150px] w-full flex-shrink-0 cursor-pointer overflow-hidden rounded-3xl transition-transform hover:scale-105 active:scale-100 md:h-[95px] md:w-[120px]"
    >
      <div className="pointer-events-none absolute inset-0 rounded-3xl shadow-[inset_0_4px_18px_rgba(0,0,0,0.5)]"></div>

      {selectedModel.cover_image.endsWith(".mp4") ? (
        <video
          key={selectedModel.identifier}
          src={selectedModel.cover_image}
          className="size-full rounded-3xl object-cover transition-all duration-300 group-hover:brightness-90"
          autoPlay
          muted
          loop
          playsInline
        />
      ) : (
        <img
          className="size-full rounded-3xl object-cover transition-all duration-300 group-hover:brightness-90"
          src={selectedModel.cover_image}
          alt={selectedModel.model_name}
          width={150}
          height={150}
        />
      )}

      {/* Model name label */}
      <div className="absolute inset-x-2 bottom-2 rounded-md bg-black/30 p-1 text-center transition-opacity group-hover:opacity-0">
        <p className="truncate font-satoshi text-sm font-medium text-accent">
          {selectedModel.model_name}
        </p>
      </div>

      {/* Change hover overlay */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
        <span className="rounded-xl bg-black/50 px-2 py-1 text-xs text-white/90">
          <SwapIcon size={20} weight="bold" />
        </span>
      </div>

      {/* ✏️ Edit indicator — visible even without hover */}
      <div className="absolute right-2 top-2 z-10 rounded-full bg-black/60 p-1 transition-all duration-200 group-hover:scale-110 group-hover:bg-black/80">
        <PencilSimpleLineIcon
          size={14}
          weight="fill"
          className="text-gray-300 group-hover:text-white"
        />
      </div>
    </div>
  );
});

ModelSelectorCard.displayName = "ModelSelectorCard";
export default ModelSelectorCard;
