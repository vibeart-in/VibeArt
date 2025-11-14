# Blog Posts Test Content

This directory contains sample blog posts created to test the VibeArt blog functionality.

## Blog Posts Summary

### 1. Getting Started with VibeArt (getting-started-with-vibeart.mdx)

- **Category**: Tutorial
- **Tags**: getting-started, tutorial, ai-art, guide
- **Content**: Comprehensive guide covering basic features, prompt writing, and best practices
- **Components Used**: Callout (info, success)

### 2. Test Blog Post (test-post.mdx)

- **Category**: Testing
- **Tags**: test, mdx, blog
- **Content**: Simple test post for MDX parsing verification
- **Components Used**: Basic markdown elements, code blocks

### 3. Mastering AI Prompts (mastering-ai-prompts.mdx)

- **Category**: Advanced
- **Tags**: prompt-engineering, ai-art, advanced, techniques
- **Content**: Advanced prompt engineering techniques with examples
- **Components Used**:
  - Callout (info, warning, success)
  - Code blocks (TypeScript, Python, JavaScript)
  - Tables
  - Lists (ordered and unordered)

### 4. What's New in January 2024 (new-features-january-2024.mdx)

- **Category**: Updates
- **Tags**: updates, features, news, product
- **Content**: Product updates, new features, and community highlights
- **Components Used**:
  - Callout (success, info, warning)
  - ImageWithCaption
  - Code blocks (TypeScript, JavaScript, Python, Bash)
  - Tables
  - Blockquotes
  - Lists

### 5. The Ethics of AI Art (ai-art-ethics-guide.mdx)

- **Category**: Discussion
- **Tags**: ethics, ai-art, copyright, community, responsibility
- **Content**: Thoughtful exploration of ethical considerations in AI art
- **Components Used**:
  - Callout (info, warning, success, error)
  - Code blocks (TypeScript, Python, JavaScript, Markdown)
  - Lists
  - Blockquotes

### 6. Image Upscaling and Enhancement (image-upscaling-techniques.mdx)

- **Category**: Technical
- **Tags**: upscaling, enhancement, technical, tutorial, image-processing
- **Content**: Technical guide to image upscaling algorithms and techniques
- **Components Used**:
  - Callout (info, warning, success)
  - Code blocks (Python, TypeScript, JavaScript)
  - Tables (comparison table)
  - Lists (ordered and unordered)

## Content Coverage

### Categories Tested

- Tutorial
- Testing
- Advanced
- Updates
- Discussion
- Technical

### Tags Tested

Multiple tags across different topics including:

- getting-started, tutorial, ai-art, guide
- test, mdx, blog
- prompt-engineering, advanced, techniques
- updates, features, news, product
- ethics, copyright, community, responsibility
- upscaling, enhancement, technical, image-processing

### MDX Components Tested

#### Standard Markdown Elements

- ✅ Headings (H1-H6) with automatic anchor links
- ✅ Paragraphs
- ✅ Links (internal and external)
- ✅ Lists (ordered and unordered)
- ✅ Blockquotes
- ✅ Horizontal rules
- ✅ Tables with headers and data
- ✅ Inline code
- ✅ Code blocks with syntax highlighting

#### Custom Components

- ✅ Callout (all types: info, warning, success, error)
- ✅ ImageWithCaption
- ✅ CodeBlock with multiple languages (TypeScript, JavaScript, Python, Bash, Markdown)

### Content Variety

#### Text Content

- Short posts (~200 words)
- Medium posts (~1000 words)
- Long posts (~2000+ words)

#### Technical Content

- Code examples in multiple languages
- Configuration examples
- API usage examples
- Command-line examples

#### Visual Content

- Tables for data comparison
- Lists for structured information
- Callouts for emphasis
- Code blocks for technical details

## Verification Checklist

- [x] All posts have valid frontmatter
- [x] All posts have unique slugs
- [x] All posts have proper metadata (title, description, date, author, etc.)
- [x] All posts use published: true
- [x] Multiple categories represented
- [x] Multiple tags per post
- [x] All custom MDX components used
- [x] Various content lengths tested
- [x] Different writing styles represented
- [x] Code blocks in multiple languages
- [x] Tables included
- [x] All Callout types used
- [x] ImageWithCaption component used
- [x] Authors properly defined in posts.ts

## Testing Recommendations

1. **Visual Testing**: View each post in the browser to verify rendering
2. **Navigation Testing**: Test links between blog listing and individual posts
3. **Category Filtering**: Test filtering by each category
4. **Tag Filtering**: Test filtering by various tags
5. **Responsive Testing**: Check mobile, tablet, and desktop views
6. **Accessibility Testing**: Verify keyboard navigation and screen reader support
7. **SEO Testing**: Check meta tags and structured data
8. **Performance Testing**: Verify image optimization and loading times

## Notes

- All posts use placeholder images from `/images/hero-gradient.png`
- Author avatars reference `/authors/[name].jpg` (placeholders)
- Posts are dated in early 2024 for chronological testing
- Content is realistic and comprehensive for testing purposes
