import { buildMetadata } from "@/lib/seo";
import Link from "next/link";
import OwnerAuth from "@/sections/proprietarios/OwnerAuth";
import { getSiteConfig } from "@/services/properties";
import {
  normalizeProprietariosContent,
  getProprietariosSeo,
  resolveProprietariosCtaHref,
} from "@/lib/para-proprietarios-content";

export const revalidate = 1800;
export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const config = await getSiteConfig();
  const seo = getProprietariosSeo(config.proprietariosContent);
  return buildMetadata({
    title: seo.title,
    description: seo.description,
    canonical: "/para-proprietarios",
  });
}

export default async function ParaProprietariosPage() {
  const config = await getSiteConfig();
  const content = normalizeProprietariosContent(config.proprietariosContent);

  return (
    <div className="relative min-h-screen pb-28">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 bg-no-repeat bg-cover bg-center opacity-[0.03]"
        style={{ backgroundImage: "url('/assets/images/home/bc1.png')" }}
      />

      <div className="mx-auto max-w-7xl px-4 pt-14 pb-10 sm:px-6 sm:pt-36">
        <div className="grid items-start gap-8 lg:grid-cols-2">
          <div className="max-w-3xl">
            <h1 className="mb-3 text-3xl font-semibold tracking-tight">
              {content.title}
            </h1>
            <p className="text-zinc-700 dark:text-zinc-300">{content.intro}</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {content.cards.map((card, i) => (
                <div
                  key={`${card.title}-${i}`}
                  className="rounded-xl border p-5 dark:border-zinc-800"
                >
                  <h3 className="text-base font-medium">{card.title}</h3>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    {card.description}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={resolveProprietariosCtaHref(content.ctaPrimary)}
                className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                {content.ctaPrimary.text}
              </Link>
              <Link
                href={resolveProprietariosCtaHref(content.ctaSecondary)}
                className="rounded-md border px-4 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
              >
                {content.ctaSecondary.text}
              </Link>
            </div>
          </div>
          <div className="min-w-0 lg:ml-auto lg:flex lg:justify-end">
            <OwnerAuth />
          </div>
        </div>
      </div>
    </div>
  );
}
