'use client';

import Link from "next/link";
import React from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-24">
      <div className="rounded-xl border p-8 text-center">
        <h1 className="text-2xl font-semibold">Post não encontrado</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
          {error?.message || "Ocorreu um erro ao carregar este post."}
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90 dark:bg-white dark:text-black"
          >
            Tentar novamente
          </button>
          <Link
            href="/blog"
            className="rounded-md border px-4 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900"
          >
            Voltar para o blog
          </Link>
        </div>
      </div>
    </div>
  );
}
