"use client";
import { IconSearch } from "@tabler/icons-react";
import { Input } from "../ui/input";
import ModelCard from "../ui/Modelcard";
import { useState, useMemo } from "react";
import { ConversationType, ModelData } from "@/src/types/BaseType";
import { useModelsByUsecase } from "@/src/hooks/useModelsByUsecase";

type DialogBoxProps = {
  conversationType: ConversationType;
  onSelectModel: (model: ModelData) => void;
};

const DialogBox = ({ conversationType, onSelectModel }: DialogBoxProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ Reusable query hook
  const { data: models, isLoading, error } = useModelsByUsecase(conversationType);

  const filteredModels = useMemo(() => {
    if (!models) return [];
    if (!searchTerm) return models;

    const lower = searchTerm.toLowerCase();
    return models.filter(
      (model) =>
        model.model_name.toLowerCase().includes(lower) ||
        model.description?.toLowerCase().includes(lower) ||
        model.identifier.toLowerCase().includes(lower) ||
        model.usecase?.toLowerCase().includes(lower),
    );
  }, [models, searchTerm]);

  if (isLoading) {
    return <div className="w-full py-8 text-center text-white">Loading models...</div>;
  }

  if (error) {
    return (
      <div className="w-full py-8 text-center text-red-500">
        Error loading models: {error.message}
      </div>
    );
  }

  if (!models || models.length === 0) {
    return <div className="w-full py-8 text-center text-gray-400">No models available.</div>;
  }

  return (
    <div className="w-full">
      <div className="mb-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
        <p className="text-nowrap text-center text-lg font-semibold text-white sm:text-left">
          Change model/checkpoint
        </p>
        <div className="relative w-full sm:w-auto">
          <Input
            placeholder="Search..."
            className="w-full min-w-52 rounded-2xl bg-[#161616] py-1.5 pr-8 text-white placeholder-gray-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <IconSearch
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60"
          />
        </div>
      </div>

      <div className="mb-14 mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {filteredModels.length > 0 ? (
          filteredModels.map((model) => (
            <ModelCard key={model.id} model={model} onSelect={onSelectModel} />
          ))
        ) : (
          <p className="col-span-full text-center text-gray-400">
            No models found matching your search.
          </p>
        )}
      </div>
    </div>
  );
};

export default DialogBox;
