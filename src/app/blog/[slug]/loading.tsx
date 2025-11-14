/**
 * Loading state for individual blog post page
 * Automatically shown by Next.js while the page is loading
 */
export default function BlogPostLoading() {
  return (
    <article className="min-h-screen bg-background">
      {/* Blog Header Skeleton */}
      <header className="relative border-b border-border">
        {/* Featured Image Skeleton */}
        <div className="relative h-[400px] w-full animate-pulse bg-muted md:h-[500px]" />

        {/* Header Content Skeleton */}
        <div className="container mx-auto px-4 py-8">
          <div className="mx-auto max-w-4xl">
            {/* Breadcrumb Skeleton */}
            <div className="mb-4 h-4 w-48 animate-pulse rounded bg-muted" />

            {/* Title Skeleton */}
            <div className="mb-4 space-y-2">
              <div className="h-10 w-full animate-pulse rounded bg-muted md:h-12" />
              <div className="h-10 w-3/4 animate-pulse rounded bg-muted md:h-12" />
            </div>

            {/* Metadata Skeleton */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="size-10 animate-pulse rounded-full bg-muted" />
                <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              </div>
              <div className="h-4 w-32 animate-pulse rounded bg-muted" />
              <div className="h-4 w-20 animate-pulse rounded bg-muted" />
            </div>
          </div>
        </div>
      </header>

      {/* Content Container Skeleton */}
      <div className="container mx-auto px-4 pb-12">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 lg:grid-cols-[1fr_250px]">
          {/* Main Content Skeleton */}
          <div className="min-w-0 max-w-4xl">
            <div className="space-y-4 py-8">
              {/* Paragraph Skeletons */}
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-full animate-pulse rounded bg-muted" />
                  <div className="h-4 w-full animate-pulse rounded bg-muted" />
                  <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
                </div>
              ))}

              {/* Code Block Skeleton */}
              <div className="my-6 h-48 animate-pulse rounded-lg bg-muted" />

              {/* More Paragraph Skeletons */}
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-full animate-pulse rounded bg-muted" />
                  <div className="h-4 w-full animate-pulse rounded bg-muted" />
                  <div className="h-4 w-4/5 animate-pulse rounded bg-muted" />
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar Skeleton (Desktop) */}
          <div className="hidden lg:block">
            <div className="sticky top-24 space-y-2">
              <div className="h-6 w-32 animate-pulse rounded bg-muted" />
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-4 w-full animate-pulse rounded bg-muted" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
