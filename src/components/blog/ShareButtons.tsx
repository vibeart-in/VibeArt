"use client";

import { Twitter, Linkedin, Facebook, Link as LinkIcon, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/src/components/ui/button";

interface ShareButtonsProps {
  url: string;
  title: string;
  description: string;
}

export function ShareButtons({ url, title, description }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied to clipboard!");

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const handleShare = (platform: string, shareUrl: string) => {
    window.open(shareUrl, "_blank", "noopener,noreferrer,width=600,height=400");
  };

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-medium text-muted-foreground">Share this post</h3>
      <div
        className="flex flex-wrap items-center gap-2"
        role="group"
        aria-label="Social media sharing options"
      >
        {/* Twitter */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleShare("Twitter", shareUrls.twitter)}
          aria-label="Share on Twitter"
          className="size-9 rounded-full border border-border hover:border-primary hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
        >
          <Twitter className="size-4" aria-hidden="true" />
        </Button>

        {/* LinkedIn */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleShare("LinkedIn", shareUrls.linkedin)}
          aria-label="Share on LinkedIn"
          className="size-9 rounded-full border border-border hover:border-primary hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
        >
          <Linkedin className="size-4" aria-hidden="true" />
        </Button>

        {/* Facebook */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleShare("Facebook", shareUrls.facebook)}
          aria-label="Share on Facebook"
          className="size-9 rounded-full border border-border hover:border-primary hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
        >
          <Facebook className="size-4" aria-hidden="true" />
        </Button>

        {/* Copy Link */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCopyLink}
          aria-label={copied ? "Link copied to clipboard" : "Copy link to clipboard"}
          className="size-9 rounded-full border border-border hover:border-primary hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
        >
          {copied ? (
            <Check className="size-4" aria-hidden="true" />
          ) : (
            <LinkIcon className="size-4" aria-hidden="true" />
          )}
        </Button>
      </div>
    </div>
  );
}
