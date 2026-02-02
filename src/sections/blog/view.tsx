'use client';

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

import type { BlogPost } from "@/types/blog";
import {
  addComment,
  createPost,
  getPostBySlug,
  likePost,
  listPosts,
  updatePost,
} from "@/services/blog";

export function PostListView() {
  const [allPosts, setAllPosts] = React.useState<BlogPost[]>([]);
  const [query, setQuery] = React.useState("");
  const [visible, setVisible] = React.useState(6);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      const posts = await listPosts();
      if (mounted) {
        setAllPosts(posts);
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const tags = React.useMemo(() => {
    const t = new Set<string>();
    allPosts.forEach((p) => p.tags.forEach((tag) => t.add(tag)));
    return Array.from(t);
  }, [allPosts]);

  const [activeTag, setActiveTag] = React.useState<string>("");

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return allPosts.filter((p) => {
      const matchesQuery =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q);
      const matchesTag = !activeTag || p.tags.includes(activeTag);
      return matchesQuery && matchesTag;
    });
  }, [allPosts, query, activeTag]);

  const visiblePosts = filtered.slice(0, visible);

  return (
    <div className="w-full max-w-5xl">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight">Blog</h1>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por título, conteúdo ou tag..."
          className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring sm:max-w-md"
        />
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTag("")}
            className={`rounded-full border px-3 py-1 text-xs ${
              activeTag === "" ? "bg-black text-white dark:bg-white dark:text-black" : ""
            }`}
          >
            Todas
          </button>
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`rounded-full border px-3 py-1 text-xs ${
                activeTag === tag
                  ? "bg-black text-white dark:bg-white dark:text-black"
                  : ""
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-zinc-700 dark:text-zinc-300">Carregando...</p>
      ) : filtered.length === 0 ? (
        <p className="text-zinc-700 dark:text-zinc-300">
          Nenhum post encontrado.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visiblePosts.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      )}

      {filtered.length > visible && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => setVisible((v) => v + 6)}
            className="rounded-md border px-4 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900"
          >
            Carregar mais
          </button>
        </div>
      )}
    </div>
  );
}

function PostCard({ post }: { post: BlogPost }) {
  const [likes, setLikes] = React.useState(post.reactions.likes);
  const [optimistic, setOptimistic] = React.useState(false);

  const handleLike = async () => {
    setOptimistic(true);
    setLikes((l) => l + 1);
    const next = await likePost(post.slug);
    setOptimistic(false);
    if (typeof next === "number") setLikes(next);
  };

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-xl border">
      {post.coverUrl ? (
        <div
          className="h-32 w-full bg-cover bg-center transition-transform group-hover:scale-[1.02]"
          style={{ backgroundImage: `url(${post.coverUrl})` }}
          aria-hidden="true"
        />
      ) : null}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex flex-wrap gap-1">
          {post.tags.map((t) => (
            <span
              key={t}
              className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] uppercase tracking-wide text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300"
            >
              {t}
            </span>
          ))}
        </div>
        <Link
          href={`/blog/${post.slug}`}
          className="line-clamp-2 text-base font-semibold hover:underline"
        >
          {post.title}
        </Link>
        <p className="line-clamp-3 text-sm text-zinc-600 dark:text-zinc-300">
          {post.excerpt}
        </p>
        <div className="mt-auto flex items-center justify-between pt-2 text-xs text-zinc-500">
          <span>
            {new Date(post.createdAt).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "short",
            })}
          </span>
          <button
            onClick={handleLike}
            className="inline-flex items-center gap-1 rounded-md border px-2 py-1 hover:bg-zinc-50 dark:hover:bg-zinc-900"
            title="Curtir"
          >
            <span>❤️</span>
            <span>{likes}</span>
            {optimistic ? <span className="ml-1 animate-pulse">...</span> : null}
          </button>
        </div>
      </div>
    </div>
  );
}

export function PostDetailsView({ slug }: { slug: string }) {
  const [post, setPost] = React.useState<BlogPost | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      const p = await getPostBySlug(slug);
      if (mounted) {
        setPost(p);
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [slug]);

  if (loading) {
    return <p className="text-zinc-700 dark:text-zinc-300">Carregando...</p>;
  }
  if (!post) {
    return <p className="text-zinc-700 dark:text-zinc-300">Post não encontrado.</p>;
  }

  return (
    <article className="w-full max-w-3xl">
      {post.coverUrl ? (
        <div
          className="mb-6 h-56 w-full rounded-xl bg-cover bg-center"
          style={{ backgroundImage: `url(${post.coverUrl})` }}
          aria-hidden="true"
        />
      ) : null}

      <div className="mb-3 flex flex-wrap gap-2">
        {post.tags.map((t) => (
          <span
            key={t}
            className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] uppercase tracking-wide text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300"
          >
            {t}
          </span>
        ))}
      </div>

      <h1 className="mb-2 text-3xl font-semibold tracking-tight">{post.title}</h1>
      <p className="mb-6 text-sm text-zinc-500">
        Por {post.authorName} •{" "}
        {new Date(post.createdAt).toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })}
      </p>

      <ReactionBar slug={post.slug} likes={post.reactions.likes} />

      <div className="prose prose-zinc mt-6 max-w-none dark:prose-invert">
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
          {post.content}
        </ReactMarkdown>
      </div>

      <div className="mt-10">
        <Comments slug={post.slug} comments={post.comments} />
      </div>
    </article>
  );
}

function ReactionBar({ slug, likes }: { slug: string; likes: number }) {
  const [count, setCount] = React.useState(likes);
  const [optimistic, setOptimistic] = React.useState(false);

  const onLike = async () => {
    setOptimistic(true);
    setCount((c) => c + 1);
    const next = await likePost(slug);
    setOptimistic(false);
    if (typeof next === "number") setCount(next);
  };

  const onShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) {
        await navigator.share({ title: "SAX Blog", url });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        alert("Link copiado!");
      }
    } catch {
      // noop
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onLike}
        className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900"
      >
        <span>❤️</span>
        <span>{count}</span>
        {optimistic ? <span className="ml-1 animate-pulse">...</span> : null}
      </button>
      <button
        onClick={onShare}
        className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900"
      >
        <span>🔗</span>
        <span>Compartilhar</span>
      </button>
    </div>
  );
}

function Comments({
  slug,
  comments,
}: {
  slug: string;
  comments: BlogPost["comments"];
}) {
  const [authorName, setAuthorName] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [items, setItems] = React.useState(comments);
  const [submitting, setSubmitting] = React.useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSubmitting(true);
    const fallbackName = authorName.trim() || "Você";
    const optimistic = {
      id: `tmp_${Math.random()}`,
      authorName: fallbackName,
      message,
      createdAt: new Date().toISOString(),
    };
    setItems((prev) => [...prev, optimistic]);
    await addComment(slug, fallbackName, message);
    setAuthorName("");
    setMessage("");
    setSubmitting(false);
  };

  return (
    <div>
      <h2 className="mb-3 text-lg font-semibold">Comentários ({items.length})</h2>
      <ul className="space-y-3">
        {items.map((c) => (
          <li key={c.id} className="rounded-md border p-3">
            <div className="mb-1 text-xs text-zinc-500">
              {c.authorName} •{" "}
              {new Date(c.createdAt).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "short",
              })}
            </div>
            <p className="text-sm">{c.message}</p>
          </li>
        ))}
      </ul>

      <form onSubmit={onSubmit} className="mt-4 space-y-2">
        <div className="flex gap-2">
          <input
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="Seu nome (opcional)"
            className="w-48 rounded-md border px-3 py-2 text-sm outline-none focus:ring"
          />
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Escreva um comentário..."
            className="flex-1 rounded-md border px-3 py-2 text-sm outline-none focus:ring"
          />
          <button
            type="submit"
            disabled={submitting || !message.trim()}
            className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 dark:bg-white dark:text-black"
          >
            Publicar
          </button>
        </div>
      </form>
    </div>
  );
}

export function PostCreateView() {
  const router = useRouter();
  const [title, setTitle] = React.useState("");
  const [excerpt, setExcerpt] = React.useState("");
  const [content, setContent] = React.useState("");
  const [coverUrl, setCoverUrl] = React.useState("");
  const [tags, setTags] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  const canSave = title.trim() && excerpt.trim() && content.trim();

  const onSave = async () => {
    if (!canSave) return;
    setSaving(true);
    const post = await createPost({
      title: title.trim(),
      excerpt: excerpt.trim(),
      content: content.trim(),
      coverUrl: coverUrl.trim() || undefined,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      authorName: "Você",
    });
    setSaving(false);
    router.push(`/blog/${post.slug}`);
  };

  return (
    <div className="mx-auto w-full max-w-3xl">
      <h1 className="mb-4 text-2xl font-semibold">Novo post</h1>
      <div className="space-y-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título"
          className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring"
        />
        <input
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="Resumo (aparece na lista)"
          className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Conteúdo"
          rows={10}
          className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring"
        />
        <input
          value={coverUrl}
          onChange={(e) => setCoverUrl(e.target.value)}
          placeholder="URL da imagem de capa (opcional)"
          className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring"
        />
        <input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="Tags separadas por vírgula (ex: mercado, investimentos)"
          className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring"
        />
        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={onSave}
            disabled={!canSave || saving}
            className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 dark:bg-white dark:text-black"
          >
            {saving ? "Salvando..." : "Publicar"}
          </button>
          <Link
            href="/blog"
            className="rounded-md border px-4 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900"
          >
            Cancelar
          </Link>
        </div>
      </div>
    </div>
  );
}

export function PostEditView({ slug }: { slug: string }) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [excerpt, setExcerpt] = React.useState("");
  const [content, setContent] = React.useState("");
  const [coverUrl, setCoverUrl] = React.useState("");
  const [tags, setTags] = React.useState("");

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      const post = await getPostBySlug(slug);
      if (mounted) {
        if (!post) {
          setLoading(false);
          return;
        }
        setTitle(post.title);
        setExcerpt(post.excerpt);
        setContent(post.content);
        setCoverUrl(post.coverUrl ?? "");
        setTags(post.tags.join(", "));
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [slug]);

  const canSave = title.trim() && excerpt.trim() && content.trim();

  const onSave = async () => {
    if (!canSave) return;
    setSaving(true);
    const updated = await updatePost(slug, {
      title: title.trim(),
      excerpt: excerpt.trim(),
      content: content.trim(),
      coverUrl: coverUrl.trim() || undefined,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    });
    setSaving(false);
    if (updated) {
      router.push(`/blog/${updated.slug}`);
    }
  };

  if (loading) {
    return <p className="text-zinc-700 dark:text-zinc-300">Carregando...</p>;
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <h1 className="mb-4 text-2xl font-semibold">Editar post</h1>
      <div className="space-y-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título"
          className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring"
        />
        <input
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="Resumo"
          className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Conteúdo"
          rows={10}
          className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring"
        />
        <input
          value={coverUrl}
          onChange={(e) => setCoverUrl(e.target.value)}
          placeholder="URL da imagem de capa (opcional)"
          className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring"
        />
        <input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="Tags separadas por vírgula"
          className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring"
        />
        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={onSave}
            disabled={!canSave || saving}
            className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 dark:bg-white dark:text-black"
          >
            {saving ? "Salvando..." : "Salvar alterações"}
          </button>
          <Link
            href={`/blog/${slug}`}
            className="rounded-md border px-4 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900"
          >
            Cancelar
          </Link>
        </div>
      </div>
    </div>
  );
}

