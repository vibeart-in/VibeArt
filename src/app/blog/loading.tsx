import { BlogCardSkeleton } from "@/src/components/blog/BlogCardSkeleton";

/**
 * Loading state for blog listing page
 * Automatically shown by Next.js while the page is loading
 */
export default function BlogListingLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section Skeleton */}
      <section className="border-b border-border bg-gradient-to-b from-background to-background/50">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl">
            <div className="mb-4 h-12 w-48 animate-pulse rounded bg-muted md:h-14 lg:h-16" />
            <div className="space-y-2">
              <div className="h-6 w-full animate-pulse rounded bg-muted md:h-7" />
              <div className="h-6 w-3/4 animate-pulse rounded bg-muted md:h-7" />
            </div>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid Skeleton */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        {/* Category Filter Skeleton */}
        <div className="mb-8 flex gap-2">
          <div className="h-10 w-20 animate-pulse rounded-full bg-muted" />
          <div className="h-10 w-24 animate-pulse rounded-full bg-muted" />
          <div className="h-10 w-28 animate-pulse rounded-full bg-muted" />
        </div>

        {/* Blog Cards Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <BlogCardSkeleton key={i} />
          ))}
        </div>
      </section>
    </div>
  );
}
