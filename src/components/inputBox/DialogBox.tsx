"use client";
import {
  IconBolt,
  IconBoltFilled,
  IconBrandGoogle,
  IconBrandGoogleFilled,
  IconPig,
  IconPigFilled,
  IconSearch,
} from "@tabler/icons-react";
import { Input } from "../ui/input";
import ModelCard from "../ui/Modelcard";
import { useState, useMemo, useRef, useEffect } from "react";
import { ConversationType, ModelData } from "@/src/types/BaseType";
import { useModelsByUsecase } from "@/src/hooks/useModelsByUsecase";
import { FireIcon, GoogleLogoIcon, HighDefinitionIcon, PenNibIcon } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import MidjourneyIcon from "@/src/icons/midjourney";
import FluxIcon from "@/src/icons/flux";

const TagIcon = ({ name }: { name: string }) => {
  // This is a placeholder for the actual icons.
  // You would replace these with your actual icon components.
  const icons: { [key: string]: React.ReactNode } = {
    All: <FireIcon size={20} weight="bold" />,
    google: <IconBrandGoogle size={20} />,
    flux: <FluxIcon className="h-6 w-6" />,
    value: <IconPig size={20} />,
    fast: <IconBolt size={20} />,
    midjourney: <MidjourneyIcon className="h-6 w-6" />,
    highres: <HighDefinitionIcon size={20} weight="bold" />,
    desgin: <PenNibIcon size={20} weight="bold" />,
  };
  return <>{icons[name] || null}</>;
};
// Define the tags to be displayed in the UI, matching the image.
const displayTags = ["google", "flux", "midjourney", "fast", "value", "highres", "desgin"];

// This array is used to render the UI tabs, including "All" and "Other".
const filterTabs = ["All", ...displayTags, "Other"];

type DialogBoxProps = {
  conversationType: ConversationType;
  onSelectModel: (model: ModelData) => void;
};

const DialogBox = ({ conversationType, onSelectModel }: DialogBoxProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("All");

  // --- START: State and Refs for Expandable Search ---
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // --- END: State and Refs for Expandable Search ---

  const { data: models, isLoading, error } = useModelsByUsecase(conversationType);

  // Auto-focus the input when it opens
  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Handle clicking outside of the search bar to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredModels = useMemo(() => {
    if (!models) return [];
    let tempModels = models;

    if (selectedTag === "All") {
      tempModels = models;
    } else if (selectedTag === "Other") {
      tempModels = models.filter((model) => {
        if (!model.tags || model.tags.length === 0) return true;
        const hasMatchingTag = model.tags.some((tag) => displayTags.includes(tag));
        return !hasMatchingTag;
      });
    } else {
      tempModels = models.filter((model) => model.tags?.includes(selectedTag));
    }

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      tempModels = tempModels.filter(
        (model) =>
          model.model_name.toLowerCase().includes(lower) ||
          model.description?.toLowerCase().includes(lower) ||
          model.identifier.toLowerCase().includes(lower) ||
          model.usecase?.toLowerCase().includes(lower),
      );
    }

    return tempModels;
  }, [models, searchTerm, selectedTag]);

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
      {/* --- START: Combined Tag Filter and Search Bar --- */}
      <div className="mb-8 flex items-center justify-between gap-4 border-b border-gray-700">
        {/* Scrollable Tags Container */}
        <div className="flex items-center gap-x-6 overflow-x-auto pb-px">
          {filterTabs.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`flex items-center gap-2 whitespace-nowrap py-3 text-sm font-medium transition-colors duration-200 ${
                selectedTag === tag
                  ? "border-b-2 border-white text-white"
                  : "border-b-2 border-transparent text-gray-400 hover:text-white"
              }`}
            >
              <TagIcon name={tag} />
              <span>
                {tag
                  .split(" ")
                  .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : w))
                  .join(" ")}
              </span>
            </button>
          ))}
        </div>

        {/* Expandable Search Component */}
        <div ref={searchRef} className="relative flex items-center">
          <AnimatePresence>
            {isSearchOpen && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "220px", opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="relative"
              >
                <Input
                  ref={inputRef}
                  placeholder="Search..."
                  className="w-full rounded-2xl bg-[#161616] py-1.5 pl-4 pr-8 text-white placeholder-gray-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </motion.div>
            )}
          </AnimatePresence>
          <motion.button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="absolute right-0 p-2" // Always positioned right
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <IconSearch size={16} className="text-white/80" />
          </motion.button>
        </div>
      </div>
      {/* --- END: Combined Tag Filter and Search Bar --- */}

      {/* Grid of models remains the same */}
      <div className="mb-14 mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {filteredModels.length > 0 ? (
          filteredModels.map((model) => (
            <ModelCard key={model.id} model={model} onSelect={onSelectModel} />
          ))
        ) : (
          <p className="col-span-full text-center text-gray-400">
            No models found matching your criteria.
          </p>
        )}
      </div>
    </div>
  );
};

export default DialogBox;
