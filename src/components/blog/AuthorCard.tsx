import Avatar from "boring-avatars";
import { Twitter, Linkedin, Github } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Author } from "@/src/types/blog";

interface AuthorCardProps {
  author: Author;
}

export function AuthorCard({ author }: AuthorCardProps) {
  return (
    <article className="flex flex-col gap-4 rounded-lg border border-border bg-card p-6 sm:flex-row sm:items-start">
      {/* Avatar */}

      <Avatar size={80} name={author.name || "Unknown"} variant="beam" />

      {/* Author Info */}
      <div className="flex-1">
        <h3 className="mb-1 text-lg font-semibold">{author.name}</h3>
        <p className="mb-3 text-sm text-muted-foreground">{author.bio}</p>

        {/* Social Links */}
        {author.social && (
          <nav aria-label={`${author.name}'s social media links`}>
            <ul className="flex items-center gap-3">
              {author.social.twitter && (
                <li>
                  <Link
                    href={author.social.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded text-muted-foreground transition-colors hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
                    aria-label={`Follow ${author.name} on Twitter`}
                  >
                    <Twitter className="size-4" aria-hidden="true" />
                  </Link>
                </li>
              )}
              {author.social.linkedin && (
                <li>
                  <Link
                    href={author.social.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded text-muted-foreground transition-colors hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
                    aria-label={`Connect with ${author.name} on LinkedIn`}
                  >
                    <Linkedin className="size-4" aria-hidden="true" />
                  </Link>
                </li>
              )}
              {author.social.github && (
                <li>
                  <Link
                    href={author.social.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded text-muted-foreground transition-colors hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
                    aria-label={`View ${author.name}'s GitHub profile`}
                  >
                    <Github className="size-4" aria-hidden="true" />
                  </Link>
                </li>
              )}
            </ul>
          </nav>
        )}
      </div>
    </article>
  );
}
