import { Metadata } from "next";

import { BlogCard } from "@/src/components/blog/BlogCard";
import { CategoryFilter } from "@/src/components/blog/CategoryFilter";
import { generateBlogListingMetadata, generateBlogSchema } from "@/src/lib/blog/metadata";
import { getPublishedPosts, getAllCategories } from "@/src/lib/blog/posts";

// Configure Incremental Static Regeneration (ISR)
// Revalidate every hour to keep content fresh while maintaining performance
export const revalidate = 3600;

// Generate metadata for SEO
export async function generateMetadata(): Promise<Metadata> {
  return generateBlogListingMetadata();
}

interface BlogListingPageProps {
  searchParams: { page?: string };
}

const POSTS_PER_PAGE = 12;

export default async function BlogListingPage({ searchParams }: BlogListingPageProps) {
  // Fetch all published posts sorted by date (newest first)
  const allPosts = getPublishedPosts();

  // Get all categories for filter
  const categories = getAllCategories();

  // Get current page from search params
  const currentPage = Number(searchParams.page) || 1;

  // Calculate pagination
  const totalPosts = allPosts.length;
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const paginatedPosts = allPosts.slice(startIndex, endIndex);

  // Generate JSON-LD structured data
  const blogSchema = generateBlogSchema();

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
      />

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <header className="border-b border-border bg-gradient-to-b from-background to-background/50">
          <div className="container mx-auto mt-16 px-4 py-16 md:py-14">
            <h1 className="mb-4 text-center text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
              <span className="bg-gradient-to-r from-white to-white/60 bg-clip-text font-satoshi uppercase text-transparent">
                VibeArt Blog
              </span>
            </h1>
            <p className="mx-auto max-w-2xl text-center text-lg text-muted-foreground md:text-xl">
              Discover the latest features, tips, and updates from VibeArt. Learn about AI image
              generation, creative tools, and design inspiration.
            </p>
          </div>
        </header>

        {/* Blog Posts Grid */}
        <main id="main-content" className="container mx-auto px-4 py-12 md:py-16">
          {/* Category Filter */}
          {categories.length > 0 && (
            <nav aria-label="Blog category filter" className="mb-8">
              <CategoryFilter categories={categories} />
            </nav>
          )}

          {paginatedPosts.length === 0 ? (
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="text-center">
                <h2 className="mb-2 text-2xl font-semibold">No posts yet</h2>
                <p className="text-muted-foreground">Check back soon for new content!</p>
              </div>
            </div>
          ) : (
            <>
              <section aria-label="Blog posts">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {paginatedPosts.map((post, index) => (
                    <BlogCard key={post.slug} post={post} priority={index < 3} />
                  ))}
                </div>
              </section>

              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalPosts={totalPosts}
                />
              )}
            </>
          )}
        </main>
      </div>
    </>
  );
}

// Pagination Component
function Pagination({
  currentPage,
  totalPages,
  totalPosts,
}: {
  currentPage: number;
  totalPages: number;
  totalPosts: number;
}) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  // Show max 7 page numbers
  let visiblePages = pages;
  if (totalPages > 7) {
    if (currentPage <= 4) {
      visiblePages = [...pages.slice(0, 5), -1, totalPages];
    } else if (currentPage >= totalPages - 3) {
      visiblePages = [1, -1, ...pages.slice(totalPages - 5)];
    } else {
      visiblePages = [1, -1, currentPage - 1, currentPage, currentPage + 1, -1, totalPages];
    }
  }

  return (
    <nav className="mt-12 flex flex-col items-center gap-4" aria-label="Blog pagination">
      <p className="text-sm text-muted-foreground">
        Showing {(currentPage - 1) * POSTS_PER_PAGE + 1} to{" "}
        {Math.min(currentPage * POSTS_PER_PAGE, totalPosts)} of {totalPosts} posts
      </p>

      <div className="flex items-center gap-2">
        {/* Previous Button */}
        {currentPage > 1 ? (
          <a
            href={`/blog?page=${currentPage - 1}`}
            className="rounded-md border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
            aria-label="Previous page"
          >
            Previous
          </a>
        ) : (
          <span className="cursor-not-allowed rounded-md border border-border bg-muted px-4 py-2 text-sm font-medium text-muted-foreground">
            Previous
          </span>
        )}

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {visiblePages.map((page, index) =>
            page === -1 ? (
              <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
                ...
              </span>
            ) : (
              <a
                key={page}
                href={`/blog?page=${page}`}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  currentPage === page
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-card hover:bg-accent"
                }`}
                aria-label={`Page ${page}`}
                aria-current={currentPage === page ? "page" : undefined}
              >
                {page}
              </a>
            ),
          )}
        </div>

        {/* Next Button */}
        {currentPage < totalPages ? (
          <a
            href={`/blog?page=${currentPage + 1}`}
            className="rounded-md border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
            aria-label="Next page"
          >
            Next
          </a>
        ) : (
          <span className="cursor-not-allowed rounded-md border border-border bg-muted px-4 py-2 text-sm font-medium text-muted-foreground">
            Next
          </span>
        )}
      </div>
    </nav>
  );
}
