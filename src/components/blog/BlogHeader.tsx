"use client";

import Avatar from "boring-avatars";
import { Clock, Calendar, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { BlogPost } from "@/src/types/blog";

interface BlogHeaderProps {
  post: BlogPost;
}

export function BlogHeader({ post }: BlogHeaderProps) {
  return (
    <header className="relative mb-12 overflow-hidden">
      {/* Featured Image with Gradient Overlay */}
      <div className="relative h-[420px] w-full md:h-[520px] lg:h-[620px]">
        <Image
          src={post.featuredImage}
          alt={`Featured image for ${post.title}`}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />

        {/* Gradient Overlay */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"
          aria-hidden="true"
        />

        {/* Content Container */}
        <div className="absolute -inset-0 flex items-end">
          <div className="container mx-auto px-4 pt-52">
            <div className="mx-auto max-w-4xl">
              {/* Breadcrumb Navigation */}
              <nav
                className="mb-6 flex items-center gap-2 text-sm text-muted-foreground"
                aria-label="Breadcrumb"
              >
                <ol className="flex items-center gap-2">
                  <li>
                    <Link
                      href="/"
                      className="rounded transition-colors hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
                    >
                      Home
                    </Link>
                  </li>
                  <li aria-hidden="true">
                    <ChevronRight className="size-4" />
                  </li>
                  <li>
                    <Link
                      href="/blog"
                      className="rounded transition-colors hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
                    >
                      Blog
                    </Link>
                  </li>
                  <li aria-hidden="true">
                    <ChevronRight className="size-4" />
                  </li>
                  <li aria-current="page">
                    <span className="text-foreground">{post.category}</span>
                  </li>
                </ol>
              </nav>

              {/* Category Badge */}
              <div className="mb-4">
                <Link
                  href={`/blog/category/${post.category.toLowerCase().replace(/\s+/g, "-")}`}
                  className="inline-block rounded-full bg-primary/90 px-4 py-1.5 text-sm font-medium text-primary-foreground backdrop-blur-sm transition-colors hover:bg-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  aria-label={`View all posts in ${post.category} category`}
                >
                  {post.category}
                </Link>
              </div>

              {/* Title with Glassmorphism Effect */}
              <div className="rounded-3xl border border-white/10 bg-black/50 p-6 backdrop-blur-md md:p-12">
                <h1 className="mb-6 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl xl:text-6xl">
                  <span className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                    {post.title}
                  </span>
                </h1>

                <p className="mb-6 text-base text-muted-foreground md:text-lg lg:text-xl">
                  {post.description}
                </p>

                {/* Post Metadata */}
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground md:gap-4">
                  {/* Author */}
                  <div className="flex items-center gap-2">
                    {/* <div className="relative h-8 w-8 overflow-hidden rounded-full border-2 border-white/20">
                      <Image
                        src={post.author.avatar}
                        alt={`${post.author.name}'s avatar`}
                        fill
                        sizes="32px"
                        className="object-cover"
                        loading="lazy"
                      />
                    </div> */}
                    <Avatar size={25} name={post.author.name || "Unknown"} variant="beam" />
                    <span className="font-medium text-foreground">{post.author.name}</span>
                  </div>

                  <span className="text-muted-foreground/50" aria-hidden="true">
                    ·
                  </span>

                  {/* Date */}
                  <div className="flex items-center gap-1.5">
                    <Calendar className="size-4" aria-hidden="true" />
                    <time dateTime={post.date}>
                      {new Date(post.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </time>
                  </div>

                  <span className="text-muted-foreground/50" aria-hidden="true">
                    ·
                  </span>

                  {/* Reading Time */}
                  <div className="flex items-center gap-1.5">
                    <Clock className="size-4" aria-hidden="true" />
                    <span>{post.readingTime} min read</span>
                  </div>
                </div>

                {/* Tags */}
                {post.tags.length > 0 && (
                  <div className="mt-6 flex flex-wrap gap-2" role="list" aria-label="Post tags">
                    {post.tags.map((tag: string) => {
                      const tagSlug = tag.toLowerCase().replace(/\s+/g, "-");
                      return (
                        <Link
                          key={tag}
                          href={`/blog/tag/${tagSlug}`}
                          className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-xs backdrop-blur-sm transition-colors hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                          aria-label={`View all posts tagged with ${tag}`}
                          role="listitem"
                        >
                          #{tag}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
