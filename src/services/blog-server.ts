import type { BlogPost, BlogComment } from "@/types/blog";

function getApiBase(): string {
  const base = process.env.NEXT_PUBLIC_SAX_API_URL ?? "";
  return typeof base === "string" ? base.trim().replace(/\/$/, "") : "";
}

function mapApiPostToBlogPost(raw: Record<string, unknown>): BlogPost {
  const reactions = (raw.reactions as { likes?: number }) ?? {};
  const comments = (Array.isArray(raw.comments) ? raw.comments : []) as BlogComment[];
  return {
    id: String(raw.id ?? ""),
    slug: String(raw.slug ?? ""),
    title: String(raw.title ?? ""),
    excerpt: String(raw.excerpt ?? ""),
    content: String(raw.content ?? ""),
    coverUrl: raw.coverUrl != null ? String(raw.coverUrl) : undefined,
    tags: Array.isArray(raw.tags) ? raw.tags.map(String) : [],
    authorName: String(raw.authorName ?? ""),
    createdAt: String(raw.createdAt ?? ""),
    updatedAt: String(raw.updatedAt ?? ""),
    reactions: { likes: Number(reactions.likes) || 0 },
    comments,
  };
}

/**
 * Busca um post pelo slug na API. Apenas para uso em Server Components.
 */
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const base = getApiBase();
  if (!base) return null;
  try {
    const res = await fetch(
      `${base}/api/blog/by-slug/${encodeURIComponent(slug)}`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    const raw = (await res.json()) as Record<string, unknown>;
    return mapApiPostToBlogPost(raw);
  } catch {
    return null;
  }
}

/**
 * Lista posts publicados na API. Apenas para uso em Server (ex.: sitemap).
 */
export async function listPosts(): Promise<BlogPost[]> {
  const base = getApiBase();
  if (!base) return [];
  try {
    const res = await fetch(`${base}/api/blog`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = (await res.json()) as unknown;
    const list = Array.isArray(data) ? data : (data as { posts?: unknown[] })?.posts ?? [];
    const posts = (list as Record<string, unknown>[]).map((p) => mapApiPostToBlogPost(p));
    return posts.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch {
    return [];
  }
}
