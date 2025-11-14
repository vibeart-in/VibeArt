"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { BlogPost } from "@/src/types/blog";

import { BlogCard } from "./BlogCard";

interface RelatedPostsProps {
  posts: BlogPost[];
}

export function RelatedPosts({ posts }: RelatedPostsProps) {
  const [isVisible, setIsVisible] = useState(false);

  // Lazy load related posts when they come into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
        }
      },
      { rootMargin: "100px" },
    );

    const element = document.getElementById("related-posts");
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);
  if (posts.length === 0) {
    return null;
  }

  return (
    <section
      id="related-posts"
      className="mt-16 border-t border-border pt-12"
      aria-labelledby="related-posts-heading"
    >
      <div className="mb-8 flex items-center justify-between">
        <h2 id="related-posts-heading" className="text-2xl font-semibold">
          Related Posts
        </h2>
        <Link
          href="/blog"
          className="group flex items-center gap-2 rounded text-sm text-muted-foreground transition-colors hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
          aria-label="View all blog posts"
        >
          View all posts
          <ArrowRight
            className="size-4 transition-transform group-hover:translate-x-1"
            aria-hidden="true"
          />
        </Link>
      </div>

      {isVisible ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      ) : (
        // Skeleton while loading
        <div
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          aria-busy="true"
          aria-label="Loading related posts"
        >
          {posts.map((_, index) => (
            <div
              key={index}
              className="h-96 animate-pulse rounded-lg bg-muted"
              aria-hidden="true"
            />
          ))}
        </div>
      )}
    </section>
  );
}
