import fs from "fs";
import path from "path";

import matter from "gray-matter";
import readingTime from "reading-time";

import { BlogPostMetadata } from "@/src/types/blog";

const BLOG_CONTENT_DIR = path.join(process.cwd(), "content", "blog");

/**
 * Parse an MDX file and extract frontmatter and content
 */
export function parseMDXFile(filePath: string) {
  const fileContents = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(fileContents);

  return {
    frontmatter: data as BlogPostMetadata,
    content,
  };
}

/**
 * Parse only the frontmatter of an MDX file
 * This is much faster than parsing the whole file when content isn't needed
 * It reads only the first 4KB which should be enough for frontmatter
 */
export function parseFrontmatter(filePath: string) {
  // Read only the first 4KB to get frontmatter
  // This avoids reading the entire file content into memory
  const fd = fs.openSync(filePath, "r");
  try {
    const buffer = Buffer.alloc(4096);
    const bytesRead = fs.readSync(fd, buffer, 0, 4096, 0);
    const content = buffer.toString("utf8", 0, bytesRead);
    
    // gray-matter will parse what we give it. 
    // If the file was cut off, it might have issues if the frontmatter wasn't closed.
    // But 4KB is very large for frontmatter.
    const { data } = matter(content);
    return data as BlogPostMetadata;
  } finally {
    fs.closeSync(fd);
  }
}

/**
 * Calculate reading time based on word count
 * Average reading speed: 200 words per minute
 */
export function calculateReadingTime(content: string): number {
  const stats = readingTime(content);
  return Math.ceil(stats.minutes);
}

/**
 * Get all MDX file paths from the blog content directory
 */
export function getMDXFilePaths(): string[] {
  if (!fs.existsSync(BLOG_CONTENT_DIR)) {
    return [];
  }

  const files = fs.readdirSync(BLOG_CONTENT_DIR);
  return files
    .filter((file) => file.endsWith(".mdx") || file.endsWith(".md"))
    .map((file) => path.join(BLOG_CONTENT_DIR, file));
}

/**
 * Extract slug from file path
 */
export function getSlugFromFilePath(filePath: string): string {
  const fileName = path.basename(filePath);
  return fileName.replace(/\.mdx?$/, "");
}

/**
 * Validate required frontmatter fields
 */
export function validateFrontmatter(
  frontmatter: Partial<BlogPostMetadata>,
  slug: string,
): frontmatter is BlogPostMetadata {
  const requiredFields: (keyof BlogPostMetadata)[] = [
    "title",
    "description",
    "date",
    "author",
    "featuredImage",
    "category",
    "tags",
  ];

  for (const field of requiredFields) {
    if (!frontmatter[field]) {
      console.warn(`Missing required field "${field}" in frontmatter for post: ${slug}`);
      return false;
    }
  }

  return true;
}

/**
 * Generate excerpt from content
 */
export function generateExcerpt(content: string, maxLength: number = 160): string {
  // Remove MDX/Markdown syntax
  const plainText = content
    .replace(/^#{1,6}\s+/gm, "") // Remove headings
    .replace(/\*\*(.+?)\*\*/g, "$1") // Remove bold
    .replace(/\*(.+?)\*/g, "$1") // Remove italic
    .replace(/\[(.+?)\]\(.+?\)/g, "$1") // Remove links
    .replace(/```[\s\S]*?```/g, "") // Remove code blocks
    .replace(/`(.+?)`/g, "$1") // Remove inline code
    .replace(/\n+/g, " ") // Replace newlines with spaces
    .trim();

  if (plainText.length <= maxLength) {
    return plainText;
  }

  return plainText.substring(0, maxLength).trim() + "...";
}
