"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, List } from "lucide-react";
import { useEffect, useState } from "react";

import { Heading } from "@/src/types/blog";

interface TableOfContentsProps {
  content: string;
}

/**
 * TableOfContents component generates a navigable table of contents
 * from H2 and H3 headings in the blog post content.
 * Features smooth scroll navigation and active section highlighting.
 */
export function TableOfContents({ content }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);

  // Extract headings from content on mount
  useEffect(() => {
    const extractedHeadings = extractHeadings(content);
    setHeadings(extractedHeadings);
  }, [content]);

  // Track active section based on scroll position
  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-80px 0px -80% 0px",
        threshold: 0,
      },
    );

    // Observe all heading elements
    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [headings]);

  // Smooth scroll to section
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // Account for fixed header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });

      // Close mobile menu after navigation
      setIsOpen(false);
    }
  };

  // Don't render if no headings
  if (headings.length === 0) {
    return null;
  }

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="sticky top-20 z-10 mb-6 lg:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex w-full items-center justify-between rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
          aria-expanded={isOpen}
          aria-controls="table-of-contents"
          aria-label={isOpen ? "Close table of contents" : "Open table of contents"}
        >
          <span className="flex items-center gap-2">
            <List className="size-4" aria-hidden="true" />
            Table of Contents
          </span>
          <ChevronDown
            className={`size-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
            aria-hidden="true"
          />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              id="table-of-contents"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <nav
                className="mt-2 rounded-lg border border-border bg-card p-4"
                aria-label="Table of contents"
              >
                <ul className="space-y-2">
                  {headings.map((heading) => (
                    <li key={heading.id} style={{ paddingLeft: `${(heading.level - 2) * 1}rem` }}>
                      <button
                        onClick={() => scrollToSection(heading.id)}
                        className={`block w-full rounded text-left text-sm transition-colors hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background ${
                          activeId === heading.id
                            ? "font-medium text-foreground"
                            : "text-muted-foreground"
                        }`}
                        aria-current={activeId === heading.id ? "location" : undefined}
                      >
                        {heading.text}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Desktop Sticky Sidebar */}
      <aside className="hidden lg:block">
        <div className="sticky top-24">
          <nav
            className="rounded-lg border border-border bg-card/50 p-4 backdrop-blur-sm"
            aria-label="Table of contents"
          >
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              On This Page
            </h2>
            <ul className="space-y-2">
              {headings.map((heading) => (
                <li key={heading.id} style={{ paddingLeft: `${(heading.level - 2) * 0.75}rem` }}>
                  <button
                    onClick={() => scrollToSection(heading.id)}
                    className={`block w-full rounded text-left text-sm transition-colors hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background ${
                      activeId === heading.id
                        ? "-ml-3 border-l-2 border-primary pl-3 font-medium text-foreground"
                        : "text-muted-foreground"
                    }`}
                    aria-current={activeId === heading.id ? "location" : undefined}
                  >
                    {heading.text}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>
    </>
  );
}

/**
 * Extract H2 and H3 headings from markdown content
 */
function extractHeadings(content: string): Heading[] {
  const headings: Heading[] = [];
  const lines = content.split("\n");

  lines.forEach((line) => {
    // Match H2 (##) and H3 (###) headings
    const h2Match = line.match(/^##\s+(.+)$/);
    const h3Match = line.match(/^###\s+(.+)$/);

    if (h2Match) {
      const text = h2Match[1].trim();
      const id = generateId(text);
      headings.push({ id, text, level: 2 });
    } else if (h3Match) {
      const text = h3Match[1].trim();
      const id = generateId(text);
      headings.push({ id, text, level: 3 });
    }
  });

  return headings;
}

/**
 * Generate URL-friendly ID from heading text
 */
function generateId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}
