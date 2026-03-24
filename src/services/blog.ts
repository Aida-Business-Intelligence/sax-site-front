'use client';

import { initialBlogPosts } from "@/_mock/blog";
import type { BlogPost, BlogPostInput, BlogComment } from "@/types/blog";
import { getSaxApiBase, hasSaxApi } from "@/lib/sax-api";

const STORAGE_KEY = "blog.posts.v1";

/** Converte post da API sax-backend para BlogPost do site. */
function mapApiPostToBlogPost(raw: Record<string, unknown>): BlogPost {
  const reactions = (raw.reactions as { likes?: number }) ?? {};
  const comments = (Array.isArray(raw.comments) ? raw.comments : []) as BlogComment[];
  return {
    id: String(raw.id ?? ''),
    slug: String(raw.slug ?? ''),
    title: String(raw.title ?? ''),
    excerpt: String(raw.excerpt ?? ''),
    content: String(raw.content ?? ''),
    coverUrl: raw.coverUrl != null ? String(raw.coverUrl) : undefined,
    tags: Array.isArray(raw.tags) ? raw.tags.map(String) : [],
    authorName: String(raw.authorName ?? ''),
    createdAt: String(raw.createdAt ?? ''),
    updatedAt: String(raw.updatedAt ?? ''),
    reactions: { likes: Number(reactions.likes) || 0 },
    comments,
  };
}

function slugify(input?: string | null): string {
  const str = (input ?? "").toString();
  if (!str) return "";
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function nowISO(): string {
  return new Date().toISOString();
}

function seedAndReturn(): BlogPost[] {
  if (typeof window === "undefined") return [...initialBlogPosts];
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initialBlogPosts));
  return [...initialBlogPosts];
}

function readStore(): BlogPost[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return seedAndReturn();
    }
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      if (parsed.length === 0) {
        return seedAndReturn();
      }
      return parsed as BlogPost[];
    }
    return seedAndReturn();
  } catch {
    return seedAndReturn();
  }
}

function writeStore(posts: BlogPost[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

export async function listPosts(): Promise<BlogPost[]> {
  if (hasSaxApi()) {
    try {
      const base = getSaxApiBase();
      const res = await fetch(`${base}/api/blog`, { cache: "no-store" });
      if (!res.ok) return [];
      const data = await res.json();
      const list = Array.isArray(data) ? data : data?.posts ?? [];
      const posts: BlogPost[] = list.map((p: Record<string, unknown>) => mapApiPostToBlogPost(p));
      return posts.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch {
      return [];
    }
  }
  const posts = readStore().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return posts;
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  if (hasSaxApi()) {
    try {
      const base = getSaxApiBase();
      const res = await fetch(
        `${base}/api/blog/by-slug/${encodeURIComponent(slug)}`,
        { cache: "no-store" }
      );
      if (!res.ok) return null;
      const raw = await res.json();
      return mapApiPostToBlogPost(raw as Record<string, unknown>);
    } catch {
      return null;
    }
  }
  let posts = readStore();
  let found = posts.find((p) => p.slug === slug) ?? null;
  if (found) return found;
  const normalized = slugify(slug);
  found =
    posts.find(
      (p) => p.slug === normalized || slugify(p.title) === normalized
    ) ?? null;
  if (found) return found;
  posts = seedAndReturn();
  return (
    posts.find(
      (p) => p.slug === normalized || slugify(p.title) === normalized
    ) ?? null
  );
}

export async function searchPosts(query: string): Promise<BlogPost[]> {
  const q = query.trim().toLowerCase();
  if (!q) return listPosts();
  const posts = await listPosts();
  return posts.filter((p) => {
    return (
      p.title.toLowerCase().includes(q) ||
      p.excerpt.toLowerCase().includes(q) ||
      p.content.toLowerCase().includes(q) ||
      (Array.isArray(p.tags) && p.tags.some((t) => String(t).toLowerCase().includes(q)))
    );
  });
}

export async function createPost(input: BlogPostInput): Promise<BlogPost> {
  const posts = readStore();
  const id = `p_${Math.random().toString(36).slice(2)}${Date.now()}`;
  const slugBase = slugify(input.title);
  let slug = slugBase;
  let suffix = 1;
  while (posts.some((p) => p.slug === slug)) {
    slug = `${slugBase}-${suffix++}`;
  }
  const createdAt = nowISO();
  const post: BlogPost = {
    id,
    slug,
    title: input.title,
    excerpt: input.excerpt,
    content: input.content,
    coverUrl: input.coverUrl,
    tags: input.tags ?? [],
    authorName: input.authorName ?? "Você",
    createdAt,
    updatedAt: createdAt,
    reactions: { likes: 0 },
    comments: [],
  };
  writeStore([post, ...posts]);
  return post;
}

export async function updatePost(
  slug: string,
  updates: Partial<BlogPostInput>
): Promise<BlogPost | null> {
  const posts = readStore();
  const idx = posts.findIndex((p) => p.slug === slug);
  if (idx === -1) return null;
  const current = posts[idx];
  const next: BlogPost = {
    ...current,
    title: updates.title ?? current.title,
    excerpt: updates.excerpt ?? current.excerpt,
    content: updates.content ?? current.content,
    coverUrl: updates.coverUrl ?? current.coverUrl,
    tags: updates.tags ?? current.tags,
    authorName: updates.authorName ?? current.authorName,
    updatedAt: nowISO(),
  };
  posts[idx] = next;
  writeStore(posts);
  return next;
}

export async function addComment(
  slug: string,
  authorName: string,
  message: string
): Promise<BlogComment | null> {
  const posts = readStore();
  const idx = posts.findIndex((p) => p.slug === slug);
  if (idx === -1) return null;
  const comment: BlogComment = {
    id: `c_${Math.random().toString(36).slice(2)}${Date.now()}`,
    authorName,
    message,
    createdAt: nowISO(),
  };
  posts[idx] = {
    ...posts[idx],
    comments: [...posts[idx].comments, comment],
    updatedAt: nowISO(),
  };
  writeStore(posts);
  return comment;
}

export async function likePost(slug: string): Promise<number | null> {
  const posts = readStore();
  const idx = posts.findIndex((p) => p.slug === slug);
  if (idx === -1) return null;
  const likes = (posts[idx].reactions.likes ?? 0) + 1;
  posts[idx] = {
    ...posts[idx],
    reactions: { likes },
    updatedAt: nowISO(),
  };
  writeStore(posts);
  return likes;
}


