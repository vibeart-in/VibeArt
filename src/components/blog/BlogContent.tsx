// src/components/blog/BlogContent.tsx
import { MDXRemote } from "next-mdx-remote/rsc";

import { mdxComponents } from "./mdx/MDXComponents";

interface BlogContentProps {
  content: string; // raw MDX string (from your getPostBySlug)
}

export default function BlogContent({ content }: BlogContentProps) {
  return (
    <article className="prose prose-invert prose-headings:font-bold prose-headings:tracking-tight prose-h1:text-4xl prose-h1:mb-6 prose-h1:mt-8 prose-h2:text-3xl prose-h2:mb-4 prose-h2:mt-8 prose-h2:border-b prose-h2:border-border prose-h2:pb-2 prose-h3:text-2xl prose-h3:mb-3 prose-h3:mt-6 prose-h4:text-xl prose-h4:mb-2 prose-h4:mt-4 prose-p:my-4 prose-p:text-base prose-strong:font-semibold prose-strong:text-foreground prose-img:rounded-lg prose-img:border prose-img:border-border prose-hr:my-8 prose-hr:border-border mx-auto max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
      {/* pass raw MDX string as `source` */}
      <MDXRemote source={content} components={mdxComponents} />
    </article>
  );
}
