import Link from "next/link";
import { ArrowRight } from "lucide-react";
import PropertyCard from "@/components/cards/PropertyCard";
import type { Property } from "@/types/realEstate";

/**
 * Seção de imóveis logo na home (abaixo do hero). Recebe os imóveis já
 * buscados NO SERVIDOR (via page.tsx) — assim o navegador não precisa chamar
 * o backend (que é fraco e devolve 503 sob várias chamadas simultâneas).
 */
const HOME_HIGHLIGHT_COUNT = 8;

export default function FeaturedImoveis({
  properties,
}: {
  properties?: Property[] | null;
}) {
  const items = (properties ?? []).slice(0, HOME_HIGHLIGHT_COUNT);
  if (items.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
            Imóveis em destaque
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Alguns dos nossos imóveis — veja todos e filtre na busca.
          </p>
        </div>
        <Link
          href="/imoveis"
          className="inline-flex items-center gap-1.5 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Ver todos os imóveis
          <ArrowRight className="size-4" />
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((p) => (
          <PropertyCard key={p.id} property={p} />
        ))}
      </div>
    </section>
  );
}
