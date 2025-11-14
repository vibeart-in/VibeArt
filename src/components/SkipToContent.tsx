"use client";

/**
 * SkipToContent component provides a keyboard-accessible link
 * that allows users to skip navigation and jump directly to main content.
 * This is essential for screen reader users and keyboard navigation.
 */
export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[9999] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
    >
      Skip to main content
    </a>
  );
}
