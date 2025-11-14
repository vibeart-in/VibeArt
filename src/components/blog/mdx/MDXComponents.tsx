// src/components/blog/mdx/MDXComponents.tsx
import Image from "next/image";
import Link from "next/link";
import React, { ComponentPropsWithoutRef, ReactNode } from "react";

import { Callout } from "./Callout";
import { CodeBlock } from "./CodeBlock";
import { ImageWithCaption } from "./ImageWithCaption";

/* ----------------------------- Type helpers ----------------------------- */
type IntrinsicElementKey = keyof React.JSX.IntrinsicElements;
type AnyProps<T extends IntrinsicElementKey> = ComponentPropsWithoutRef<T> & {
  children?: ReactNode;
};

/* ------------------------------ Utilities ------------------------------- */

/** Convert JSX children (possibly array) into a plain text string for slugging */
function getTextFromChildren(children: ReactNode): string {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) return children.map(getTextFromChildren).join("");
  return typeof children === "number" ? String(children) : "";
}

/** URL-friendly slug (keeps it simple and predictable) */
function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "")
    .replace(/\-+/g, "-");
}

/** Whether the URL points to an external resource */
function isExternalHref(href?: string) {
  return !!href && /^(https?:)?\/\//.test(href);
}

/* ------------------------------ Headings --------------------------------
   Creates h1..h4 components with optional anchor link shown on hover.
   Keeps markup consistent and small.
------------------------------------------------------------------------- */
function createHeading(level: 1 | 2 | 3 | 4) {
  const Tag = `h${level}` as "h1" | "h2" | "h3" | "h4";

  const baseClasses =
    "group relative scroll-mt-20 font-semibold leading-tight" +
    (level === 1 ? " text-4xl mt-8 mb-6" : "") +
    (level === 2 ? " text-3xl mt-8 mb-4" : "") +
    (level === 3 ? " text-2xl mt-6 mb-3" : "") +
    (level === 4 ? " text-xl mt-4 mb-2" : "");

  // eslint-disable-next-line react/display-name
  return ({ children, ...props }: React.ComponentPropsWithoutRef<typeof Tag>) => {
    const raw = getTextFromChildren(children);
    const id = raw ? slugify(raw) : undefined;

    return (
      <Tag id={id} className={baseClasses} {...props}>
        {id && (
          <Link
            href={`#${id}`}
            className="absolute -left-6 top-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100"
            aria-label={`Anchor link for ${raw}`}
          >
            <span className="sr-only">{`Link to ${raw}`}</span>
            <span aria-hidden className="text-muted-foreground">
              #
            </span>
          </Link>
        )}
        {children}
      </Tag>
    );
  };
}

/* ------------------------------ Core mapping ----------------------------- */

export const mdxComponents = {
  /* Headings */
  h1: createHeading(1),
  h2: createHeading(2),
  h3: createHeading(3),
  h4: createHeading(4),

  /* Simple passthrough headings if needed */
  h5: ({ children, ...props }: AnyProps<"h5">) => <h5 {...props}>{children}</h5>,
  h6: ({ children, ...props }: AnyProps<"h6">) => <h6 {...props}>{children}</h6>,

  /* Paragraph */
  p: ({ children, ...props }: AnyProps<"p">) => (
    <p className="my-4 leading-relaxed text-foreground/90" {...props}>
      {children}
    </p>
  ),

  /* Links — uses Next/Link for internal links and normal <a> for external ones */
  a: ({ href, children, ...props }: AnyProps<"a"> & { href?: string }) => {
    const external = isExternalHref(href);
    if (external) {
      return (
        <a
          href={href}
          className="rounded font-medium underline decoration-primary/30 underline-offset-4 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
          target="_blank"
          rel="noopener noreferrer"
          {...props}
        >
          {children}
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      );
    }

    // internal — use Next Link for client navigation
    return (
      <Link
        href={href ?? "#"}
        className="rounded font-medium underline decoration-primary/30 underline-offset-4 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
        {...(props as any)}
      >
        {children}
      </Link>
    );
  },

  /* Lists */
  ul: ({ children, ...props }: AnyProps<"ul">) => (
    <ul className="my-6 ml-6 list-disc space-y-2 text-foreground/90" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }: AnyProps<"ol">) => (
    <ol className="my-6 ml-6 list-decimal space-y-2 text-foreground/90" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }: AnyProps<"li">) => (
    <li className="leading-relaxed" {...props}>
      {children}
    </li>
  ),

  /* Blockquote */
  blockquote: ({ children, ...props }: AnyProps<"blockquote">) => (
    <blockquote
      className="my-6 border-l-4 border-primary/50 bg-muted/50 py-3 pl-6 pr-4 italic text-foreground/90"
      {...props}
    >
      {children}
    </blockquote>
  ),

  /* Inline code / code blocks */
  code: ({ children, className, ...props }: AnyProps<"code"> & { className?: string }) => {
    // inline code
    if (!className) {
      return (
        <code
          className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm text-foreground"
          {...props}
        >
          {children}
        </code>
      );
    }
    // block-level is handled by pre -> CodeBlock
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },

  pre: ({ children, ...props }: AnyProps<"pre">) => {
    const codeEl: any = Array.isArray(children) ? children[0] : children;
    // If MDX emits <pre><code className="language-js">...</code></pre>
    if (codeEl?.props) {
      return (
        <CodeBlock className={codeEl.props.className} filename={codeEl.props.filename}>
          {codeEl.props.children}
        </CodeBlock>
      );
    }
    return <pre {...props}>{children}</pre>;
  },

  /* Tables (scrollable wrapper for small screens) */
  table: ({ children, ...props }: AnyProps<"table">) => (
    <div className="my-6 overflow-x-auto" role="region" aria-label="Table">
      <table className="w-full border-collapse text-sm" {...props}>
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }: AnyProps<"thead">) => (
    <thead className="border-b bg-muted/50" {...props}>
      {children}
    </thead>
  ),
  tbody: ({ children, ...props }: AnyProps<"tbody">) => <tbody {...props}>{children}</tbody>,
  tr: ({ children, ...props }: AnyProps<"tr">) => (
    <tr className="border-b transition-colors hover:bg-muted/30" {...props}>
      {children}
    </tr>
  ),
  th: ({ children, ...props }: AnyProps<"th">) => (
    <th className="px-4 py-3 text-left font-semibold" scope="col" {...props}>
      {children}
    </th>
  ),
  td: ({ children, ...props }: AnyProps<"td">) => (
    <td className="px-4 py-3" {...props}>
      {children}
    </td>
  ),

  /* Horizontal rule */
  hr: (props: AnyProps<"hr">) => <hr className="my-8 border-border" {...props} />,

  /* Images
     - internal paths -> next/image (better perf)
     - external -> plain <img> (avoids remote config issues)
     - if you prefer to always use next/image configure `next.config.js` remotePatterns/domains
  */
  img: ({ src, alt, ...props }: AnyProps<"img"> & { src?: string; alt?: string }) => {
    const srcStr = src ?? "";
    const external = /^(https?:)?\/\//.test(srcStr);

    if (external) {
      return (
        <figure className="my-8">
          <img
            src={srcStr}
            alt={alt ?? "Blog image"}
            className="w-full rounded-lg border border-border object-cover"
            loading="lazy"
            {...(props as any)}
          />
        </figure>
      );
    }

    // internal — use next/image for better optimization
    return (
      <figure className="my-8">
        <Image
          src={srcStr}
          alt={alt ?? "Blog image"}
          width={1200}
          height={675}
          className="w-full rounded-lg border border-border object-cover"
          loading="lazy"
          placeholder="blur"
          blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI2NzUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEyMDAiIGhlaWdodD0iNjc1IiBmaWxsPSIjMjEyMTIxIi8+PC9zdmc+"
          {...(props as any)}
        />
      </figure>
    );
  },

  /* Exported custom MDX components (callouts, images with caption, etc.) */
  Callout,
  ImageWithCaption,
} as const;
