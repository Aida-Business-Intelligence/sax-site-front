'use client';

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { MessageCircle, Eye, Heart, MoreHorizontal, Share2 } from "lucide-react";

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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

/** Formata número no estilo 1.95k, 9.91k */
function formatStat(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(2).replace(/\.?0+$/, "")}k`;
  return String(n);
}

function PostCard({ post }: { post: BlogPost }) {
  const [likes, setLikes] = React.useState(post.reactions.likes);
  const [optimistic, setOptimistic] = React.useState(false);
  const [imgError, setImgError] = React.useState(false);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOptimistic(true);
    setLikes((l) => l + 1);
    const next = await likePost(post.slug);
    setOptimistic(false);
    if (typeof next === "number") setLikes(next);
  };

  const showCover = post.coverUrl && !imgError;
  const commentsCount = post.comments?.length ?? 0;
  const authorInitial = (post.authorName || "A").charAt(0).toUpperCase();

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex w-full overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
    >
      {/* Coluna esquerda: conteúdo (~65%) */}
      <div className="flex min-w-0 flex-1 flex-col justify-between p-6">
        {/* Topo: badge + data */}
        <div className="flex items-center justify-between gap-3">
          {post.tags.length > 0 ? (
            <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
              {post.tags[0].toUpperCase()}
            </span>
          ) : (
            <span />
          )}
          <span className="shrink-0 text-xs text-slate-400 dark:text-slate-500">
            {new Date(post.createdAt).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>

        {/* Título + excerpt */}
        <div className="min-w-0 flex-1 py-2">
          <h2 className="line-clamp-2 text-lg font-semibold leading-tight text-slate-800 dark:text-slate-100">
            {post.title}
          </h2>
          <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
            {post.excerpt || "Sem resumo."}
          </p>
        </div>

        {/* Rodapé: opções + estatísticas */}
        <div className="flex items-center justify-between gap-4 pt-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
            <MoreHorizontal className="h-5 w-5" aria-hidden />
          </span>
          <div className="flex items-center gap-4 text-xs text-slate-400 dark:text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <MessageCircle className="h-4 w-4" />
              {formatStat(commentsCount)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Eye className="h-4 w-4" />
              {formatStat(0)}
            </span>
            <button
              type="button"
              onClick={handleLike}
              className="inline-flex items-center gap-1.5 hover:text-slate-600 dark:hover:text-slate-300"
              title="Curtir"
            >
              <Heart className="h-4 w-4" />
              {formatStat(optimistic ? likes + 1 : likes)}
              {optimistic ? <span className="animate-pulse">...</span> : null}
            </button>
          </div>
        </div>
      </div>

      {/* Coluna direita: imagem da capa (~35%) + avatar */}
      <div className="relative w-[35%] min-w-[200px] shrink-0 overflow-hidden rounded-r-[1.5rem] bg-slate-100 dark:bg-slate-800">
        {showCover ? (
          <img
            src={post.coverUrl}
            alt=""
            className="h-full min-h-[180px] w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex h-full min-h-[180px] w-full items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600">
            <span className="text-4xl text-white/40 dark:text-slate-500/50">📄</span>
          </div>
        )}
        {/* Avatar no canto superior direito da imagem */}
        <div
          className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-slate-700 text-sm font-medium text-white shadow dark:border-slate-800"
          aria-hidden
        >
          {authorInitial}
        </div>
      </div>
    </Link>
  );
}

/** Detecta se o conteúdo parece HTML (ex.: do editor rico do PDV). */
function looksLikeHtml(raw: string): boolean {
  const t = raw.trim();
  return t.startsWith("<") || /<\/(p|div|br|span|strong|em|ul|ol|li|h[1-6])>/i.test(t);
}

export function PostDetailsView({ slug }: { slug: string }) {
  const [post, setPost] = React.useState<BlogPost | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [coverError, setCoverError] = React.useState(false);

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
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <p className="text-zinc-500 dark:text-zinc-400">Carregando...</p>
      </div>
    );
  }
  if (!post) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-zinc-600 dark:text-zinc-400">Post não encontrado.</p>
      </div>
    );
  }

  const showCover = post.coverUrl && !coverError;
  const isHtml = looksLikeHtml(post.content);

  return (
    <article className="mx-auto w-full max-w-3xl">
      {/* Card container: fundo branco, borda leve, sombra */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        {/* Imagem de capa em destaque */}
        {showCover ? (
          <div className="relative aspect-[21/9] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
            <img
              src={post.coverUrl}
              alt=""
              className="h-full w-full object-cover"
              onError={() => setCoverError(true)}
            />
          </div>
        ) : (
          <div className="relative aspect-[21/9] w-full bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-700" />
        )}

        <div className="px-6 py-6 sm:px-8 sm:py-8">
          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {post.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium uppercase tracking-wide text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                >
                  {t}
                </span>
              ))}
            </div>
          )}

          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl">
            {post.title}
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Por {post.authorName} •{" "}
            {new Date(post.createdAt).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </p>

          <ReactionBar slug={post.slug} likes={post.reactions.likes} />

          {/* Corpo: HTML (do PDV) ou Markdown */}
          <div className="mt-8 border-t border-zinc-100 pt-8 dark:border-zinc-800">
            {isHtml ? (
              <div
                className="prose prose-zinc max-w-none dark:prose-invert prose-p:leading-relaxed prose-p:text-zinc-700 dark:prose-p:text-zinc-300 prose-headings:font-semibold"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            ) : (
              <div className="prose prose-zinc max-w-none dark:prose-invert">
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                  {post.content}
                </ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Comentários fora do card, mesmo container */}
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
    <div className="mt-4 flex items-center gap-3">
      <button
        type="button"
        onClick={onLike}
        className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
      >
        <Heart className="h-4 w-4" />
        <span>{optimistic ? count + 1 : count}</span>
        {optimistic ? <span className="animate-pulse">...</span> : null}
      </button>
      <button
        type="button"
        onClick={onShare}
        className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
      >
        <Share2 className="h-4 w-4" />
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
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
      <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
        Comentários ({items.length})
      </h2>
      <ul className="space-y-4">
        {items.map((c) => (
          <li
            key={c.id}
            className="rounded-xl border border-zinc-100 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-800/30"
          >
            <div className="mb-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
              {c.authorName} •{" "}
              {new Date(c.createdAt).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </div>
            <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">{c.message}</p>
          </li>
        ))}
      </ul>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <input
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="Seu nome (opcional)"
            className="rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:focus:ring-zinc-500"
          />
          <div className="flex flex-1 flex-col gap-2 sm:flex-row">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Escreva um comentário..."
              className="min-w-0 flex-1 rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:focus:ring-zinc-500"
            />
            <button
              type="submit"
              disabled={submitting || !message.trim()}
              className="rounded-lg bg-zinc-800 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-zinc-100"
            >
              {submitting ? "Enviando…" : "Publicar"}
            </button>
          </div>
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

