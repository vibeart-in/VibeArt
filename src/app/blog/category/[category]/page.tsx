import { ChevronRight } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BlogCard } from "@/src/components/blog/BlogCard";
import { getPostsByCategory, getAllCategories } from "@/src/lib/blog/posts";

// Configure Incremental Static Regeneration (ISR)
// Revalidate every hour to keep content fresh while maintaining performance
export const revalidate = 3600;

interface CategoryPageProps {
  params: { category: string };
  searchParams: { page?: string };
}

const POSTS_PER_PAGE = 12;

// Generate static params for all categories
export async function generateStaticParams() {
  const categories = getAllCategories();
  return categories.map((category) => ({
    category: category.toLowerCase().replace(/\s+/g, "-"),
  }));
}

// Generate metadata for SEO
export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const categorySlug = params.category;
  const categoryName = categorySlug.replace(/-/g, " ");
  const posts = getPostsByCategory(categoryName);

  if (posts.length === 0) {
    return {
      title: "Category Not Found",
    };
  }

  const capitalizedCategory = categoryName
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return {
    title: `${capitalizedCategory} - Blog`,
    description: `Browse all blog posts in the ${capitalizedCategory} category. Discover articles, tutorials, and insights.`,
    openGraph: {
      title: `${capitalizedCategory} - VibeArt Blog`,
      description: `Browse all blog posts in the ${capitalizedCategory} category.`,
      type: "website",
    },
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const categorySlug = params.category;
  const categoryName = categorySlug.replace(/-/g, " ");

  // Fetch posts for this category
  const allPosts = getPostsByCategory(categoryName);

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

  const capitalizedCategory = categoryName
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
              <span className="text-foreground">{capitalizedCategory}</span>
            </nav>

            <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
              <span className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                {capitalizedCategory}
              </span>
            </h1>
            <p className="text-lg text-muted-foreground md:text-xl">
              {totalPosts} {totalPosts === 1 ? "post" : "posts"} in this category
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
            categorySlug={categorySlug}
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
  categorySlug,
}: {
  currentPage: number;
  totalPages: number;
  totalPosts: number;
  categorySlug: string;
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
            href={`/blog/category/${categorySlug}?page=${currentPage - 1}`}
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
                href={`/blog/category/${categorySlug}?page=${page}`}
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
            href={`/blog/category/${categorySlug}?page=${currentPage + 1}`}
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
