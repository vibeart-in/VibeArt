"use client";

import Avatar from "boring-avatars";
import { motion } from "framer-motion";
import { Clock, Calendar, Tag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { BlogPost } from "@/src/types/blog";

interface BlogCardProps {
  post: BlogPost;
  priority?: boolean;
}

export function BlogCard({ post, priority = false }: BlogCardProps) {
  return (
    <motion.article
      className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Link
        href={`/blog/${post.slug}`}
        className="flex h-full flex-col focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
        aria-label={`Read article: ${post.title}`}
      >
        {/* Featured Image */}
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
          <Image
            src={post.featuredImage}
            alt={`Featured image for ${post.title}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            priority={priority}
            loading={priority ? "eager" : "lazy"}
            placeholder="blur"
            blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzAwIiBoZWlnaHQ9IjQ3NSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNzAwIiBoZWlnaHQ9IjQ3NSIgZmlsbD0iIzIxMjEyMSIvPjwvc3ZnPg=="
          />

          {/* Category Badge */}
          <div className="absolute left-4 top-4">
            <Link
              href={`/blog/category/${post.category.toLowerCase().replace(/\s+/g, "-")}`}
              onClick={(e) => e.stopPropagation()}
              className="inline-block rounded-full bg-accent/50 px-3 py-1 text-xs font-medium text-primary-foreground backdrop-blur-sm transition-colors hover:bg-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              aria-label={`View all posts in ${post.category} category`}
            >
              {post.category}
            </Link>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-6">
          {/* Title */}
          <h2 className="mb-3 text-xl font-semibold leading-tight transition-colors group-hover:text-accent">
            {post.title}
          </h2>

          {/* Description */}
          <p className="mb-4 line-clamp-2 flex-1 text-sm text-muted-foreground">
            {post.description}
          </p>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2" role="list" aria-label="Post tags">
              {post.tags.slice(0, 3).map((tag) => {
                const tagSlug = tag.toLowerCase().replace(/\s+/g, "-");
                return (
                  <Link
                    key={tag}
                    href={`/blog/tag/${tagSlug}`}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 rounded-full border border-border bg-background/50 px-2 py-1 text-xs transition-colors hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    aria-label={`View all posts tagged with ${tag}`}
                    role="listitem"
                  >
                    <Tag className="size-3" aria-hidden="true" />
                    {tag}
                  </Link>
                );
              })}
            </div>
          )}

          {/* Metadata */}
          <div className="flex flex-col gap-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            {/* Author */}
            <div className="flex items-center gap-2">
              {/* <Image
                  src={post.author.avatar}
                  alt={`${post.author.name}'s avatar`}
                  fill
                  sizes="24px"
                  className="object-cover"
                  loading="lazy"
                /> */}
              <Avatar size={25} name={post.author.name || "Unknown"} variant="beam" />
              <span className="font-medium">{post.author.name}</span>
            </div>

            {/* Date and Reading Time */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Calendar className="size-3" aria-hidden="true" />
                <time dateTime={post.date}>
                  {new Date(post.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </time>
              </div>
              <span className="text-muted-foreground/50" aria-hidden="true">
                ·
              </span>
              <div className="flex items-center gap-1">
                <Clock className="size-3" aria-hidden="true" />
                <span>{post.readingTime} min read</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
