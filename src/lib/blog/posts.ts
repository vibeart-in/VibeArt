import fs from "fs";

import { BlogPost, Author } from "@/src/types/blog";

import {
  parseMDXFile,
  calculateReadingTime,
  getMDXFilePaths,
  getSlugFromFilePath,
  validateFrontmatter,
  generateExcerpt,
  parseFrontmatter,
} from "./mdx";

// Mock author data - in a real app, this would come from a database or config
const AUTHORS: Record<string, Author> = {
  "John Doe": {
    name: "John Doe",
    avatar: "/authors/john-doe.jpg",
    bio: "Product designer and developer passionate about AI and creative tools.",
    social: {
      twitter: "https://twitter.com/johndoe",
      linkedin: "https://linkedin.com/in/johndoe",
      github: "https://github.com/johndoe",
    },
  },
  "Sarah Johnson": {
    name: "Sarah Johnson",
    avatar: "/authors/sarah-johnson.jpg",
    bio: "AI art enthusiast and content creator helping people unlock their creative potential with VibeArt.",
    social: {
      twitter: "https://twitter.com/sarahjohnson",
      linkedin: "https://linkedin.com/in/sarahjohnson",
    },
  },
  "Alex Chen": {
    name: "Alex Chen",
    avatar: "/authors/alex-chen.jpg",
    bio: "Technical writer and AI researcher exploring the intersection of creativity and technology.",
    social: {
      twitter: "https://twitter.com/alexchen",
      github: "https://github.com/alexchen",
    },
  },
  // Add more authors as needed
};

/**
 * Get author information by name
 */
function getAuthor(authorName: string): Author {
  return (
    AUTHORS[authorName] || {
      name: authorName,
      avatar: "/authors/default.jpg",
      bio: "Content creator at VibeArt",
    }
  );
}

/**
 * Get all blog posts
 */
export function getAllPosts(): BlogPost[] {
  const filePaths = getMDXFilePaths();
  const posts: BlogPost[] = [];

  for (const filePath of filePaths) {
    try {
      const slug = getSlugFromFilePath(filePath);
      // Optimization: Only parse frontmatter for the list view
      const frontmatter = parseFrontmatter(filePath);

      // Validate frontmatter
      if (!validateFrontmatter(frontmatter, slug)) {
        continue;
      }

      // Estimate reading time from file size to avoid reading full content
      // Approx 6 chars per word (5 chars + 1 space)
      // This is a rough estimate but sufficient for list view
      const stats = fs.statSync(filePath);
      const estimatedWords = stats.size / 6;
      const readingTime = Math.ceil(estimatedWords / 200);

      // Use description as excerpt for list view
      const excerpt = frontmatter.description;
      const author = getAuthor(frontmatter.author);

      posts.push({
        slug,
        title: frontmatter.title,
        description: frontmatter.description,
        content: "", // Empty content for list view to save memory
        date: frontmatter.date,
        author,
        featuredImage: frontmatter.featuredImage,
        category: frontmatter.category,
        tags: frontmatter.tags,
        published: frontmatter.published ?? true,
        readingTime,
        excerpt,
      });
    } catch (error) {
      console.error(`Error parsing blog post at ${filePath}:`, error);
    }
  }

  return posts;
}

/**
 * Get a single blog post by slug
 */
/**
 * Get a single blog post by slug
 */
export function getPostBySlug(slug: string): BlogPost | null {
  const filePaths = getMDXFilePaths();
  const filePath = filePaths.find((path) => getSlugFromFilePath(path) === slug);

  if (!filePath) {
    return null;
  }

  try {
    const { frontmatter, content } = parseMDXFile(filePath);

    // Validate frontmatter
    if (!validateFrontmatter(frontmatter, slug)) {
      return null;
    }

    const readingTime = calculateReadingTime(content);
    const excerpt = generateExcerpt(content);
    const author = getAuthor(frontmatter.author);

    return {
      slug,
      title: frontmatter.title,
      description: frontmatter.description,
      content,
      date: frontmatter.date,
      author,
      featuredImage: frontmatter.featuredImage,
      category: frontmatter.category,
      tags: frontmatter.tags,
      published: frontmatter.published ?? true,
      readingTime,
      excerpt,
    };
  } catch (error) {
    console.error(`Error parsing blog post at ${filePath}:`, error);
    return null;
  }
}

/**
 * Get blog posts by category
 */
export function getPostsByCategory(category: string): BlogPost[] {
  const posts = getAllPosts();
  return posts.filter(
    (post) => post.category.toLowerCase() === category.toLowerCase() && post.published,
  );
}

/**
 * Get blog posts by tag
 */
export function getPostsByTag(tag: string): BlogPost[] {
  const posts = getAllPosts();
  return posts.filter(
    (post) => post.tags.some((t) => t.toLowerCase() === tag.toLowerCase()) && post.published,
  );
}

/**
 * Get published posts sorted by date (newest first)
 */
export function getPublishedPosts(): BlogPost[] {
  const posts = getAllPosts();
  return posts
    .filter((post) => post.published)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Get all unique categories
 */
export function getAllCategories(): string[] {
  const posts = getAllPosts();
  const categories = new Set(posts.filter((post) => post.published).map((post) => post.category));
  return Array.from(categories).sort();
}

/**
 * Get all unique tags
 */
export function getAllTags(): string[] {
  const posts = getAllPosts();
  const tags = new Set(posts.filter((post) => post.published).flatMap((post) => post.tags));
  return Array.from(tags).sort();
}

/**
 * Get related posts based on tags and category
 */
export function getRelatedPosts(currentSlug: string, limit: number = 3): BlogPost[] {
  const currentPost = getPostBySlug(currentSlug);
  if (!currentPost) return [];

  const allPosts = getPublishedPosts();

  // Calculate relevance score for each post
  const scoredPosts = allPosts
    .filter((post) => post.slug !== currentSlug)
    .map((post) => {
      let score = 0;

      // Same category gets higher score
      if (post.category === currentPost.category) {
        score += 3;
      }

      // Matching tags
      const matchingTags = post.tags.filter((tag) => currentPost.tags.includes(tag));
      score += matchingTags.length;

      return { post, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  return scoredPosts.slice(0, limit).map((item) => item.post);
}
