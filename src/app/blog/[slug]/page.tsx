import { Metadata } from "next";
import { notFound } from "next/navigation";

import { AuthorCard } from "@/src/components/blog/AuthorCard";
import BlogContent from "@/src/components/blog/BlogContent";
import { BlogHeader } from "@/src/components/blog/BlogHeader";
import { RelatedPosts } from "@/src/components/blog/RelatedPosts";
import { ShareButtons } from "@/src/components/blog/ShareButtons";
import { TableOfContents } from "@/src/components/blog/TableOfContents";
import {
  generateBlogPostMetadata,
  generateArticleSchema,
  generateBreadcrumbSchema,
} from "@/src/lib/blog/metadata";
import { getPostBySlug, getPublishedPosts, getRelatedPosts } from "@/src/lib/blog/posts";

// Configure Incremental Static Regeneration (ISR)
// Revalidate every hour to keep content fresh while maintaining performance
export const revalidate = 3600;

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

// Generate static params for all blog posts at build time
export async function generateStaticParams() {
  const posts = getPublishedPosts();

  return posts.map((post) => ({
    slug: post.slug,
  }));
}

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const post = getPostBySlug(params.slug);

  // Return default metadata if post not found
  if (!post || !post.published) {
    return {
      title: "Post Not Found | VibeArt Blog",
      description: "The blog post you're looking for could not be found.",
    };
  }

  return generateBlogPostMetadata(post);
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = getPostBySlug(params.slug);

  // Handle 404 for invalid slugs or unpublished posts
  if (!post || !post.published) {
    notFound();
  }

  // Generate JSON-LD structured data
  const articleSchema = generateArticleSchema(post);
  const breadcrumbSchema = generateBreadcrumbSchema(post);

  // Generate full URL for sharing
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";
  const postUrl = `${baseUrl}/blog/${post.slug}`;

  // Get related posts
  const relatedPosts = getRelatedPosts(post.slug, 3);

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <article className="min-h-screen bg-background">
        {/* Blog Header with Featured Image */}
        <BlogHeader post={post} />

        {/* Content Container */}
        <div className="container mx-auto px-4 pb-12">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 lg:grid-cols-[1fr_250px]">
            {/* Main Content */}
            <main id="main-content" className="min-w-0 max-w-4xl">
              {/* Table of Contents - Mobile */}
              <TableOfContents content={post.content} />

              {/* Post Content */}
              <BlogContent content={post.content} />

              {/* Share Buttons */}
              <section aria-label="Share this post" className="mt-12">
                <ShareButtons url={postUrl} title={post.title} description={post.description} />
              </section>

              {/* Author Card */}
              <section aria-label="About the author" className="mt-8">
                <AuthorCard author={post.author} />
              </section>

              {/* Related Posts */}
              {/* <RelatedPosts posts={relatedPosts} /> */}
            </main>

            {/* Table of Contents - Desktop Sidebar */}
            <aside className="hidden lg:block" aria-label="Table of contents">
              <TableOfContents content={post.content} />
            </aside>
          </div>
        </div>
      </article>
    </>
  );
}
