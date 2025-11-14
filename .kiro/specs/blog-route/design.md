# Design Document

## Overview

The blog system will be built using Next.js 15 App Router with server-side rendering and static
generation for optimal SEO and performance. The architecture follows a file-based content management
approach using MDX files stored in the repository, eliminating the need for a separate CMS. The
design leverages Next.js's built-in features for metadata generation, image optimization, and
dynamic routing while maintaining consistency with the existing VibeArt design system.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Browser                        │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Next.js App Router                        │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │  /blog (listing) │  │ /blog/[slug]     │                │
│  │  Server Component│  │ Server Component │                │
│  └────────┬─────────┘  └────────┬─────────┘                │
│           │                     │                            │
│           └──────────┬──────────┘                            │
│                      ▼                                       │
│           ┌──────────────────────┐                          │
│           │   Blog Service       │                          │
│           │  (Server-side only)  │                          │
│           └──────────┬───────────┘                          │
└──────────────────────┼──────────────────────────────────────┘
                       │
                       ▼
            ┌──────────────────────┐
            │  MDX Content Files   │
            │  /content/blog/*.mdx │
            └──────────────────────┘
```

### Directory Structure

```
src/
├── app/
│   └── blog/
│       ├── page.tsx                    # Blog listing page
│       ├── [slug]/
│       │   └── page.tsx                # Individual blog post page
│       └── category/
│           └── [category]/
│               └── page.tsx            # Category filtered view
├── components/
│   └── blog/
│       ├── BlogCard.tsx                # Post preview card
│       ├── BlogHeader.tsx              # Post header with metadata
│       ├── BlogContent.tsx             # MDX content renderer
│       ├── TableOfContents.tsx         # Auto-generated TOC
│       ├── AuthorCard.tsx              # Author information display
│       ├── ShareButtons.tsx            # Social sharing buttons
│       ├── RelatedPosts.tsx            # Related posts section
│       ├── CategoryFilter.tsx          # Category filtering UI
│       └── mdx/
│           ├── MDXComponents.tsx       # Custom MDX components
│           ├── CodeBlock.tsx           # Syntax highlighted code
│           ├── Callout.tsx             # Custom callout component
│           └── ImageWithCaption.tsx    # Enhanced image component
├── lib/
│   └── blog/
│       ├── mdx.ts                      # MDX parsing utilities
│       ├── posts.ts                    # Post fetching and filtering
│       └── metadata.ts                 # SEO metadata generation
└── types/
    └── blog.ts                         # TypeScript interfaces

content/
└── blog/
    ├── getting-started.mdx
    ├── new-features-2024.mdx
    └── ai-image-generation-tips.mdx
```

## Components and Interfaces

### 1. Data Models

#### BlogPost Interface

```typescript
interface BlogPost {
  slug: string;
  title: string;
  description: string;
  content: string;
  date: string;
  author: Author;
  featuredImage: string;
  category: string;
  tags: string[];
  published: boolean;
  readingTime: number;
  excerpt: string;
}

interface Author {
  name: string;
  avatar: string;
  bio: string;
  social?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
}

interface BlogPostMetadata {
  title: string;
  description: string;
  date: string;
  author: string;
  featuredImage: string;
  category: string;
  tags: string[];
  published: boolean;
}
```

### 2. Core Components

#### BlogCard Component

- **Purpose**: Display blog post preview in listing page
- **Props**: `post: BlogPost`, `priority?: boolean`
- **Features**:
  - Optimized Next.js Image for featured image
  - Reading time badge
  - Category tag
  - Hover animations using Framer Motion
  - Responsive grid layout
- **Styling**: Matches existing VibeArt card design with dark theme

#### BlogHeader Component

- **Purpose**: Display post metadata at the top of individual posts
- **Props**: `post: BlogPost`
- **Features**:
  - Large featured image with gradient overlay
  - Title, author, date, reading time
  - Category and tags
  - Breadcrumb navigation
- **Styling**: Hero-style header with glassmorphism effects

#### BlogContent Component

- **Purpose**: Render MDX content with custom components
- **Props**: `content: string`, `components?: MDXComponents`
- **Features**:
  - Custom styled headings, paragraphs, lists
  - Syntax highlighted code blocks
  - Responsive images with captions
  - Custom callout boxes
  - Automatic anchor links for headings
- **Styling**: Typography optimized for readability

#### TableOfContents Component

- **Purpose**: Generate navigable table of contents
- **Props**: `headings: Heading[]`
- **Features**:
  - Auto-generated from H2 and H3 headings
  - Smooth scroll to sections
  - Active section highlighting
  - Sticky positioning on desktop
- **Styling**: Sidebar component with subtle animations

#### ShareButtons Component

- **Purpose**: Social media sharing functionality
- **Props**: `url: string`, `title: string`, `description: string`
- **Features**:
  - Twitter, LinkedIn, Facebook share buttons
  - Copy link functionality with toast notification
  - Icon-based design
- **Styling**: Minimal icon buttons with hover effects

### 3. MDX Custom Components

#### CodeBlock Component

```typescript
interface CodeBlockProps {
  children: string;
  className?: string;
  filename?: string;
}
```

- Syntax highlighting using `shiki` or `prism-react-renderer`
- Copy code button
- Language badge
- Optional filename display

#### Callout Component

```typescript
interface CalloutProps {
  type: "info" | "warning" | "success" | "error";
  title?: string;
  children: React.ReactNode;
}
```

- Colored border and icon based on type
- Optional title
- Supports nested content

#### ImageWithCaption Component

```typescript
interface ImageWithCaptionProps {
  src: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
}
```

- Next.js Image optimization
- Optional caption below image
- Responsive sizing

## Data Flow

### Blog Listing Page Flow

```
1. User navigates to /blog
2. Server Component renders
3. getAllPosts() fetches and parses all MDX files
4. Filter published posts
5. Sort by date (newest first)
6. Calculate pagination
7. Generate metadata for SEO
8. Render BlogCard components
9. Return static HTML to client
```

### Individual Post Page Flow

```
1. User navigates to /blog/[slug]
2. Server Component renders with slug param
3. getPostBySlug(slug) fetches specific MDX file
4. Parse frontmatter and content
5. Calculate reading time
6. Generate dynamic metadata (title, OG tags, JSON-LD)
7. Compile MDX with custom components
8. Extract headings for TOC
9. Fetch related posts
10. Return static HTML to client
```

### MDX Processing Pipeline

```
MDX File → Read File → Parse Frontmatter → Extract Metadata
                                                    ↓
                                          Validate Required Fields
                                                    ↓
                                          Calculate Reading Time
                                                    ↓
                                          Compile MDX to React
                                                    ↓
                                          Apply Custom Components
                                                    ↓
                                          Return BlogPost Object
```

## SEO Implementation

### Metadata Generation

Each blog page will generate comprehensive metadata:

```typescript
// Blog listing page
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Blog",
    description: "Discover the latest features, tips, and updates from VibeArt",
    openGraph: {
      title: "VibeArt Blog",
      description: "Discover the latest features, tips, and updates",
      images: ["/blog-og-image.png"],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "VibeArt Blog",
      description: "Discover the latest features, tips, and updates",
      images: ["/blog-og-image.png"],
    },
  };
}

// Individual post page
export async function generateMetadata({ params }): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);

  return {
    title: post.title,
    description: post.description,
    authors: [{ name: post.author.name }],
    openGraph: {
      title: post.title,
      description: post.description,
      images: [post.featuredImage],
      type: "article",
      publishedTime: post.date,
      authors: [post.author.name],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [post.featuredImage],
    },
  };
}
```

### Structured Data (JSON-LD)

```typescript
function generateArticleSchema(post: BlogPost) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    image: post.featuredImage,
    datePublished: post.date,
    author: {
      "@type": "Person",
      name: post.author.name,
    },
    publisher: {
      "@type": "Organization",
      name: "VibeArt",
      logo: {
        "@type": "ImageObject",
        url: "/logo.png",
      },
    },
  };
}
```

### Static Generation Strategy

- **Blog listing**: Static generation with revalidation (ISR)
- **Individual posts**: Static generation at build time using `generateStaticParams`
- **Category pages**: Static generation for known categories
- **Sitemap**: Auto-generated including all blog posts

## Styling and Design System

### Theme Integration

- Use existing Tailwind configuration
- Dark theme by default (matching site theme)
- Satoshi font for headings
- Quicksand font for body text
- Consistent spacing and color tokens

### Component Styling Patterns

```typescript
// Card hover effect (matching landing page style)
<motion.div
  whileHover={{ y: -4 }}
  transition={{ duration: 0.2 }}
  className="group relative overflow-hidden rounded-lg border border-border bg-card"
>
  {/* Card content */}
</motion.div>

// Glassmorphism effect
<div className="backdrop-blur-md bg-black/50 border border-white/10">
  {/* Content */}
</div>

// Gradient text
<h1 className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
  {title}
</h1>
```

### Responsive Design

- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Grid layouts: 1 column (mobile), 2 columns (tablet), 3 columns (desktop)
- Sticky TOC on desktop, collapsible on mobile

## Performance Optimization

### Image Optimization

- Use Next.js Image component for all images
- Lazy loading for images below the fold
- Responsive image sizes with srcset
- WebP format with fallbacks
- Blur placeholder for featured images

### Code Splitting

- Dynamic imports for heavy components (syntax highlighter)
- Separate chunks for MDX content
- Lazy load share buttons and related posts

### Caching Strategy

- Static generation for all blog pages
- Incremental Static Regeneration (ISR) with 1-hour revalidation
- Browser caching for images and static assets
- CDN caching for production deployment

### Bundle Size Optimization

- Tree-shake unused MDX components
- Use lightweight syntax highlighter
- Minimize client-side JavaScript
- Server Components for all non-interactive parts

## Error Handling

### Not Found Handling

```typescript
// app/blog/[slug]/page.tsx
export default async function BlogPost({ params }) {
  const post = await getPostBySlug(params.slug);

  if (!post || !post.published) {
    notFound(); // Returns 404 page
  }

  return <BlogPostContent post={post} />;
}
```

### MDX Parsing Errors

- Validate frontmatter schema
- Provide helpful error messages during development
- Graceful fallbacks for missing images
- Log errors to console in development

### Loading States

- Skeleton screens for blog listing
- Loading spinner for dynamic content
- Suspense boundaries for async components

## Testing Strategy

### Unit Tests

- Test MDX parsing functions
- Test metadata generation
- Test reading time calculation
- Test post filtering and sorting

### Integration Tests

- Test blog listing page rendering
- Test individual post page rendering
- Test category filtering
- Test search functionality

### E2E Tests

- Test navigation between blog pages
- Test social sharing buttons
- Test responsive design
- Test accessibility with screen readers

### Performance Tests

- Lighthouse CI for performance scores
- Bundle size monitoring
- Image optimization verification
- Core Web Vitals tracking

## Accessibility

### WCAG 2.1 AA Compliance

- Semantic HTML structure (article, section, nav)
- Proper heading hierarchy (h1 → h2 → h3)
- Alt text for all images
- ARIA labels for interactive elements
- Keyboard navigation support
- Focus indicators for all focusable elements
- Sufficient color contrast (4.5:1 minimum)

### Screen Reader Support

- Skip to content link
- Descriptive link text
- ARIA landmarks
- Live regions for dynamic content
- Proper form labels

## Security Considerations

- Sanitize MDX content (built-in with MDX)
- Validate frontmatter data
- Prevent XSS in user-generated content
- Secure image URLs
- Rate limiting for API routes (if added)

## Future Enhancements

- Full-text search using Algolia or similar
- RSS feed generation
- Newsletter subscription integration
- Comment system (optional)
- View count tracking
- Reading progress indicator
- Dark/light mode toggle (if site adds light mode)
- Multi-language support
