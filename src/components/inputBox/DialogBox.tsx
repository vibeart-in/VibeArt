"use client";

import { IconSearch } from "@tabler/icons-react";
import { AnimatePresence, motion } from "motion/react";
import { useState, useMemo, useRef, useEffect } from "react";

import { useModelsByUsecase } from "@/src/hooks/useModelsByUsecase";
import { ConversationType, ModelData } from "@/src/types/BaseType";
import { normalizeTag, TagIcon } from "@/src/utils/server/utils";

import { Input } from "../ui/input";
import ModelCard from "../ui/Modelcard";

const displayLabel = (tag: string) =>
  tag
    .split(/[-_\s]/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

type DialogBoxProps = {
  conversationType: ConversationType;
  onSelectModel: (model: ModelData) => void;
};

const DialogBox = ({ conversationType, onSelectModel }: DialogBoxProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("All");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: models, isLoading, error } = useModelsByUsecase(conversationType);

  // Build the available tag list from models dynamically
  const availableTags = useMemo(() => {
    if (!models || models.length === 0) return [];
    const set = new Set<string>();
    for (const m of models) {
      const rawTags = m.tags ?? [];
      // allow tags to be either string[] or a single comma-separated string
      for (const raw of rawTags as any[]) {
        if (!raw && raw !== 0) continue;
        // split comma-separated tags in case DB stores "a,b,c"
        const parts = String(raw).split(",");
        for (const p of parts) {
          const norm = normalizeTag(p);
          if (norm) set.add(norm);
        }
      }
    }
    // return stable order (alphabetical) — change if you prefer another sort
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [models]);

  // Tabs: All + dynamic tags + Other (Other = models with no tags)
  const filterTabs = useMemo(() => ["All", ...availableTags], [availableTags]);

  // If selectedTag disappears (e.g., models change), reset to All
  useEffect(() => {
    if (!filterTabs.includes(selectedTag)) {
      setSelectedTag("All");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterTabs.join("|")]);

  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchOpen]);

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

  // Helper to extract normalized tags from a model
  const getModelTags = (model: ModelData) => {
    const rawTags = model.tags ?? [];
    const out: string[] = [];
    for (const raw of rawTags as any[]) {
      if (!raw && raw !== 0) continue;
      const parts = String(raw).split(",");
      for (const p of parts) {
        const norm = normalizeTag(p);
        if (norm) out.push(norm);
      }
    }
    return out;
  };

  const filteredModels = useMemo(() => {
    if (!models) return [];
    let tempModels = models.slice();

    if (selectedTag === "All") {
    } else if (selectedTag === "Other") {
      tempModels = tempModels.filter((model) => {
        const tags = getModelTags(model);
        return !tags || tags.length === 0;
      });
    } else {
      tempModels = tempModels.filter((model) => {
        const tags = getModelTags(model);
        return tags.includes(selectedTag);
      });
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
      <div className="mb-8 flex items-center justify-between gap-4 border-b border-gray-700">
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
              <span>{tag === "All" || tag === "Other" ? tag : displayLabel(tag)}</span>
            </button>
          ))}
        </div>

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
            className="absolute right-0 p-2"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <IconSearch size={16} className="text-white/80" />
          </motion.button>
        </div>
      </div>
      <div className="mb-14 mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4">
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
