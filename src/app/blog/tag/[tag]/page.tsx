import { ChevronRight, Tag as TagIcon } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BlogCard } from "@/src/components/blog/BlogCard";
import { getPostsByTag, getAllTags } from "@/src/lib/blog/posts";

// Configure Incremental Static Regeneration (ISR)
// Revalidate every hour to keep content fresh while maintaining performance
export const revalidate = 3600;

interface TagPageProps {
  params: { tag: string };
  searchParams: { page?: string };
}

const POSTS_PER_PAGE = 12;

// Generate static params for all tags
export async function generateStaticParams() {
  const tags = getAllTags();
  return tags.map((tag) => ({
    tag: tag.toLowerCase().replace(/\s+/g, "-"),
  }));
}

// Generate metadata for SEO
export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const tagSlug = params.tag;
  const tagName = tagSlug.replace(/-/g, " ");
  const posts = getPostsByTag(tagName);

  if (posts.length === 0) {
    return {
      title: "Tag Not Found",
    };
  }

  const capitalizedTag = tagName
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return {
    title: `${capitalizedTag} - Blog`,
    description: `Browse all blog posts tagged with ${capitalizedTag}. Discover related articles and insights.`,
    openGraph: {
      title: `${capitalizedTag} - VibeArt Blog`,
      description: `Browse all blog posts tagged with ${capitalizedTag}.`,
      type: "website",
    },
  };
}

export default async function TagPage({ params, searchParams }: TagPageProps) {
  const tagSlug = params.tag;
  const tagName = tagSlug.replace(/-/g, " ");

  // Fetch posts for this tag
  const allPosts = getPostsByTag(tagName);

  // Return 404 if no posts found
  if (allPosts.length === 0) {
    notFound();
  }

  // Get current page from search params
  const currentPage = Number(searchParams.page) || 1;

  // Calculate pagination
  const totalPosts = allPosts.length;
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const paginatedPosts = allPosts.slice(startIndex, endIndex);

  const capitalizedTag = tagName
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="border-b border-border bg-gradient-to-b from-background to-background/50">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl">
            {/* Breadcrumb */}
            <nav
              className="mb-6 flex items-center gap-2 text-sm text-muted-foreground"
              aria-label="Breadcrumb"
            >
              <Link href="/blog" className="transition-colors hover:text-foreground">
                Blog
              </Link>
              <ChevronRight className="size-4" />
              <span className="text-foreground">Tag: {capitalizedTag}</span>
            </nav>

            <div className="mb-4 flex items-center gap-3">
              <TagIcon className="size-8 text-primary" />
              <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
                <span className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                  {capitalizedTag}
                </span>
              </h1>
            </div>
            <p className="text-lg text-muted-foreground md:text-xl">
              {totalPosts} {totalPosts === 1 ? "post" : "posts"} with this tag
            </p>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {paginatedPosts.map((post, index) => (
            <BlogCard key={post.slug} post={post} priority={index < 3} />
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalPosts={totalPosts}
            tagSlug={tagSlug}
          />
        )}
      </section>
    </div>
  );
}

// Pagination Component
function Pagination({
  currentPage,
  totalPages,
  totalPosts,
  tagSlug,
}: {
  currentPage: number;
  totalPages: number;
  totalPosts: number;
  tagSlug: string;
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
          <Link
            href={`/blog/tag/${tagSlug}?page=${currentPage - 1}`}
            className="rounded-md border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
            aria-label="Previous page"
          >
            Previous
          </Link>
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
              <Link
                key={page}
                href={`/blog/tag/${tagSlug}?page=${page}`}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  currentPage === page
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-card hover:bg-accent"
                }`}
                aria-label={`Page ${page}`}
                aria-current={currentPage === page ? "page" : undefined}
              >
                {page}
              </Link>
            ),
          )}
        </div>

        {/* Next Button */}
        {currentPage < totalPages ? (
          <Link
            href={`/blog/tag/${tagSlug}?page=${currentPage + 1}`}
            className="rounded-md border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
            aria-label="Next page"
          >
            Next
          </Link>
        ) : (
          <span className="cursor-not-allowed rounded-md border border-border bg-muted px-4 py-2 text-sm font-medium text-muted-foreground">
            Next
          </span>
        )}
      </div>
    </nav>
  );
}
