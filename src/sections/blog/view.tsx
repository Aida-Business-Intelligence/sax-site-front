import React from "react";

export function PostListView() {
  const posts: { id: string; title: string; slug: string; excerpt: string }[] =
    [];
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <h1 className="mb-6 text-2xl font-semibold">Blog</h1>
      {posts.length === 0 ? (
        <p className="text-zinc-600 dark:text-zinc-300">
          Em breve publicaremos os primeiros posts.
        </p>
      ) : (
        <ul className="space-y-4">
          {posts.map((p) => (
            <li key={p.id} className="rounded-lg border p-4">
              <a href={`/blog/${p.slug}`} className="font-medium">
                {p.title}
              </a>
              <p className="text-sm text-zinc-600">{p.excerpt}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}


