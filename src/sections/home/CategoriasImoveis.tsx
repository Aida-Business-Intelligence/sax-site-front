import Link from "next/link";
import type { Property } from "@/types/realEstate";
import { FIXED_PROPERTY_TYPES } from "@/lib/property-types";

const LABELS = new Map(FIXED_PROPERTY_TYPES.map((t) => [t.value, t.label]));

/** Rótulo da categoria: usa o label conhecido e pluraliza só quando termina em vogal (evita plurais errados). */
function labelFor(slug: string): string {
  const base =
    LABELS.get(slug) ??
    slug.charAt(0).toUpperCase() + slug.slice(1).replace(/[-_]/g, " ");
  return /[aeiou]$/i.test(base) ? `${base}s` : base;
}

/**
 * Categorias por Tipo de imóvel, geradas AUTOMATICAMENTE a partir dos imóveis
 * (não depende de cadastrar Seção no PDV). Cada categoria leva para a busca
 * filtrada por aquele tipo (ex.: /imoveis?type=cobertura).
 */
export default function CategoriasImoveis({
  properties,
}: {
  properties?: Property[] | null;
}) {
  const counts = new Map<string, number>();
  for (const p of properties ?? []) {
    const t = String(p.type ?? "").trim();
    if (!t) continue;
    counts.set(t, (counts.get(t) ?? 0) + 1);
  }
  const cats = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([slug, count]) => ({ slug, count, label: labelFor(slug) }));

  if (cats.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-7xl px-4 pt-10 sm:px-6">
      <h2 className="mb-4 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
        Categorias
      </h2>
      <div className="flex flex-wrap gap-3">
        {cats.map((c) => (
          <Link
            key={c.slug}
            href={`/imoveis?type=${encodeURIComponent(c.slug)}`}
            className="group inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-800 shadow-sm transition hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            <span>{c.label}</span>
            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
              {c.count}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
