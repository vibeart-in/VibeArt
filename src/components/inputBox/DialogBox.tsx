"use client";
import { IconSearch } from "@tabler/icons-react";
import { Input } from "../ui/input";
import { ModelData } from "@/src/types/BaseType";
import ModelCard from "../ui/Modelcard";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/src/lib/supabase/client";

type DialogBoxProps = {
  onSelectModel: (model: ModelData) => void;
};

const DialogBox = ({ onSelectModel }: DialogBoxProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const supabase = createClient();

  const {
    data: models,
    isLoading,
    error,
  } = useQuery<ModelData[], Error>({
    queryKey: ["allModelsDialog"],
    queryFn: async () => {
      const { data, error: rpcError } = await supabase.rpc(
        "get_all_models_info"
      );
      if (rpcError) {
        throw new Error(rpcError.message);
      }
      console.log(data);
      return data as unknown as ModelData[];
    },
    // staleTime: 5 * 60 * 1000, // 5 minutes
    // refetchOnWindowFocus: false, // Prevents refetching on window focus
  });

  const filteredModels = useMemo(() => {
    if (!models) {
      return [];
    }
    if (!searchTerm) {
      return models; // If no search term, return all loaded models
    }
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    return models.filter(
      (model) =>
        model.model_name.toLowerCase().includes(lowercasedSearchTerm) ||
        (model.description &&
          model.description.toLowerCase().includes(lowercasedSearchTerm)) ||
        model.identifier.toLowerCase().includes(lowercasedSearchTerm) ||
        (model.usecase &&
          model.usecase.toLowerCase().includes(lowercasedSearchTerm))
    );
  }, [models, searchTerm]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  if (isLoading) {
    return (
      <div className="w-full text-center py-8 text-white">
        Loading models...
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full text-center py-8 text-red-500">
        Error loading models: {error.message}
      </div>
    );
  }

  if (!models || models.length === 0) {
    return (
      <div className="w-full text-center py-8 text-gray-400">
        No models available.
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <p className="text-nowrap text-white text-lg font-semibold text-center sm:text-left">
          Change model/checkpoint
        </p>
        <div className="relative w-full sm:w-auto">
          <Input
            placeholder="Search..."
            // Make search bar full-width on mobile to be easily tappable
            className="rounded-2xl w-full min-w-52 py-1.5 pr-8 bg-[#161616] text-white placeholder-gray-400"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <IconSearch
            size={16}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-white/60"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 mb-14 mt-6 gap-4">
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
