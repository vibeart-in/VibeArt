/**
 * Skeleton loading component for BlogCard
 * Used to show loading state while blog posts are being fetched
 */
export function BlogCardSkeleton() {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card">
      {/* Featured Image Skeleton */}
      <div className="relative aspect-video w-full animate-pulse bg-muted" />

      {/* Content Skeleton */}
      <div className="flex flex-1 flex-col p-6">
        {/* Title Skeleton */}
        <div className="mb-2 h-6 w-3/4 animate-pulse rounded bg-muted" />

        {/* Description Skeleton */}
        <div className="mb-3 flex-1 space-y-2">
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
        </div>

        {/* Tags Skeleton */}
        <div className="mb-3 flex gap-2">
          <div className="h-6 w-16 animate-pulse rounded-full bg-muted" />
          <div className="h-6 w-20 animate-pulse rounded-full bg-muted" />
        </div>

        {/* Metadata Skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-6 animate-pulse rounded-full bg-muted" />
            <div className="h-4 w-20 animate-pulse rounded bg-muted" />
          </div>
          <div className="h-4 w-24 animate-pulse rounded bg-muted" />
        </div>
      </div>
    </article>
  );
}
