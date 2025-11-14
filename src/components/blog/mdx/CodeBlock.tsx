"use client";

import { Check, Copy } from "lucide-react";
import { useState, useEffect } from "react";

interface CodeBlockProps {
  children: string;
  className?: string;
  filename?: string;
}

export function CodeBlock({ children, className, filename }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [highlightedCode, setHighlightedCode] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  // Extract language from className (format: language-js, language-typescript, etc.)
  const language = className?.replace(/language-/, "") || "text";

  // Dynamically import and highlight code on mount
  useEffect(() => {
    const highlightCode = async () => {
      try {
        // Dynamic import of shiki to reduce initial bundle size
        const { codeToHtml } = await import("shiki");
        const html = await codeToHtml(children.trim(), {
          lang: language,
          theme: "github-dark",
        });
        setHighlightedCode(html);
      } catch (error) {
        // Fallback to plain text if language is not supported
        setHighlightedCode(`<pre><code>${children}</code></pre>`);
      } finally {
        setIsLoading(false);
      }
    };
    highlightCode();
  }, [children, language]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(children.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <figure
      className="group relative my-6 overflow-hidden rounded-lg border border-border bg-muted/50"
      role="group"
      aria-label={`Code block${filename ? `: ${filename}` : ` in ${language}`}`}
    >
      {/* Header with filename and copy button */}
      <figcaption className="flex items-center justify-between border-b border-border bg-muted/80 px-4 py-2">
        <div className="flex items-center gap-2">
          {filename && (
            <span className="text-xs font-medium text-muted-foreground">{filename}</span>
          )}
          {!filename && (
            <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {language}
            </span>
          )}
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
          aria-label={copied ? "Code copied to clipboard" : "Copy code to clipboard"}
        >
          {copied ? (
            <>
              <Check className="size-3" aria-hidden="true" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="size-3" aria-hidden="true" />
              <span>Copy</span>
            </>
          )}
        </button>
      </figcaption>

      {/* Code content */}
      <div className="overflow-x-auto" role="region" aria-label="Code content" tabIndex={0}>
        {isLoading ? (
          // Loading skeleton
          <div className="m-0 bg-transparent p-4" aria-busy="true" aria-label="Loading code">
            <div className="space-y-2">
              <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
              <div className="h-4 w-full animate-pulse rounded bg-muted" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
            </div>
          </div>
        ) : highlightedCode ? (
          <div
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
            className="[&>pre]:m-0 [&>pre]:bg-transparent [&>pre]:p-4 [&>pre]:text-sm [&>pre]:leading-relaxed"
          />
        ) : (
          <pre className="m-0 bg-transparent p-4 text-sm leading-relaxed">
            <code className={className}>{children}</code>
          </pre>
        )}
      </div>
    </figure>
  );
}
