"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Filter, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { getTagColor } from "@/src/utils/server/utils";

interface CategoryFilterProps {
  categories: string[];
  currentCategory?: string;
}

export function CategoryFilter({ categories, currentCategory }: CategoryFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const getCategorySlug = (category: string) => {
    return category.toLowerCase().replace(/\s+/g, "-");
  };

  const isActive = (category: string) => {
    if (!currentCategory) return false;
    return getCategorySlug(category) === currentCategory;
  };

  return (
    <div className="relative">
      {/* Mobile Filter Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background md:hidden"
        aria-label={isOpen ? "Close category filter" : "Open category filter"}
        aria-expanded={isOpen}
        aria-controls="category-filter-menu"
      >
        <Filter className="size-4" aria-hidden="true" />
        Filter by Category
        {currentCategory && (
          <span
            className="ml-1 rounded-full bg-primary/20 px-2 py-0.5 text-xs text-primary"
            aria-label="1 filter applied"
          >
            1
          </span>
        )}
      </button>

      {/* Desktop Filter */}
      <div className="hidden md:block">
        <FilterContent
          categories={categories}
          currentCategory={currentCategory}
          isActive={isActive}
          getCategorySlug={getCategorySlug}
        />
      </div>

      {/* Mobile Filter Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
            />

            {/* Dropdown */}
            <motion.div
              id="category-filter-menu"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute inset-x-0 top-full z-50 mt-2 rounded-lg border border-border bg-card p-4 shadow-lg md:hidden"
              role="dialog"
              aria-label="Category filter menu"
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 id="filter-dialog-title" className="text-sm font-semibold">
                  Filter by Category
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-md p-1 hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
                  aria-label="Close filter menu"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              </div>
              <FilterContent
                categories={categories}
                currentCategory={currentCategory}
                isActive={isActive}
                getCategorySlug={getCategorySlug}
                onSelect={() => setIsOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterContent({
  categories,
  currentCategory,
  isActive,
  getCategorySlug,
  onSelect,
}: {
  categories: string[];
  currentCategory?: string;
  isActive: (category: string) => boolean;
  getCategorySlug: (category: string) => string;
  onSelect?: () => void;
}) {
  return (
    <nav aria-label="Category filter options">
      <ul className="flex gap-2">
        {/* All Posts Link */}
        <li>
          <Link
            href="/blog"
            onClick={onSelect}
            className={`rounded-full border px-3 py-1 transition-colors ${`bg-gray-800/50 hover:bg-gray-700/50 ${getTagColor(0)}`}`}
            aria-current={!currentCategory ? "page" : undefined}
          >
            All Posts
          </Link>
        </li>

        {/* Category Links */}
        {categories.map((category, index) => (
          <li key={category}>
            <Link
              href={`/blog/category/${getCategorySlug(category)}`}
              onClick={onSelect}
              className={`rounded-full border px-3 py-1 transition-colors ${`bg-gray-800/50 hover:bg-gray-700/50 ${getTagColor(index)}`}`}
              aria-current={isActive(category) ? "page" : undefined}
            >
              {category}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
