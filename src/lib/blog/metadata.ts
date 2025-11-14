import { Metadata } from "next";

import { BlogPost } from "@/src/types/blog";

/**
 * Base URL for the site - should be configured via environment variable
 */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vibeart.com";
const SITE_NAME = "VibeArt";

/**
 * Generate metadata for the blog listing page
 */
export function generateBlogListingMetadata(): Metadata {
  const title = "Blog | VibeArt";
  const description =
    "Discover the latest features, tips, and updates from VibeArt. Learn about AI image generation, creative tools, and design inspiration.";
  const url = `${SITE_URL}/blog`;
  const ogImage = `${SITE_URL}/blog-og-image.png`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: "VibeArt Blog",
        },
      ],
      type: "website",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
      creator: "@vibeart",
      site: "@vibeart",
    },
  };
}

/**
 * Generate metadata for an individual blog post
 */
export function generateBlogPostMetadata(post: BlogPost): Metadata {
  const url = `${SITE_URL}/blog/${post.slug}`;
  const ogImage = post.featuredImage.startsWith("http")
    ? post.featuredImage
    : `${SITE_URL}${post.featuredImage}`;

  return {
    title: `${post.title} | VibeArt Blog`,
    description: post.description,
    authors: [{ name: post.author.name }],
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      url,
      siteName: SITE_NAME,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      type: "article",
      publishedTime: post.date,
      authors: [post.author.name],
      tags: post.tags,
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [ogImage],
      creator: post.author.social?.twitter
        ? `@${post.author.social.twitter.split("/").pop()}`
        : "@vibeart",
      site: "@vibeart",
    },
  };
}

/**
 * Generate metadata for category filtered pages
 */
export function generateCategoryMetadata(category: string, postCount: number): Metadata {
  const title = `${category} | VibeArt Blog`;
  const description = `Browse ${postCount} ${postCount === 1 ? "post" : "posts"} about ${category} on the VibeArt blog.`;
  const url = `${SITE_URL}/blog/category/${encodeURIComponent(category.toLowerCase())}`;
  const ogImage = `${SITE_URL}/blog-og-image.png`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${category} - VibeArt Blog`,
        },
      ],
      type: "website",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
      creator: "@vibeart",
      site: "@vibeart",
    },
  };
}

/**
 * Generate JSON-LD structured data for an article
 */
export function generateArticleSchema(post: BlogPost) {
  const url = `${SITE_URL}/blog/${post.slug}`;
  const imageUrl = post.featuredImage.startsWith("http")
    ? post.featuredImage
    : `${SITE_URL}${post.featuredImage}`;

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    image: imageUrl,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      "@type": "Person",
      name: post.author.name,
      url: post.author.social?.twitter || post.author.social?.linkedin,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    keywords: post.tags.join(", "),
    articleSection: post.category,
    wordCount: Math.round(post.readingTime * 200), // Approximate word count
  };
}

/**
 * Generate JSON-LD structured data for blog listing (Blog schema)
 */
export function generateBlogSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: `${SITE_NAME} Blog`,
    description:
      "Discover the latest features, tips, and updates from VibeArt. Learn about AI image generation, creative tools, and design inspiration.",
    url: `${SITE_URL}/blog`,
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo.png`,
      },
    },
  };
}

/**
 * Generate JSON-LD breadcrumb list for blog post
 */
export function generateBreadcrumbSchema(post: BlogPost) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: `${SITE_URL}/blog`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: `${SITE_URL}/blog/${post.slug}`,
      },
    ],
  };
}
