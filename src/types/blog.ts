export interface Author {
  name: string;
  avatar: string;
  bio: string;
  social?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
}

export interface BlogPostMetadata {
  title: string;
  description: string;
  date: string;
  author: string;
  featuredImage: string;
  category: string;
  tags: string[];
  published: boolean;
}

export interface BlogPost {
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

export interface Heading {
  id: string;
  text: string;
  level: number;
}
