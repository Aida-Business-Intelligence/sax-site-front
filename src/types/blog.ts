export interface BlogComment {
  id: string;
  authorName: string;
  message: string;
  createdAt: string; // ISO date string
}

export interface BlogReactions {
  likes: number;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverUrl?: string;
  tags: string[];
  authorName: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  reactions: BlogReactions;
  comments: BlogComment[];
}

export interface BlogPostInput {
  title: string;
  excerpt: string;
  content: string;
  coverUrl?: string;
  tags?: string[];
  authorName?: string;
}


