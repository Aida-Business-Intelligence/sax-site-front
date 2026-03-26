import { buildMetadata } from "@/lib/seo";
import { fetchPublicFeed, hasSaxApi } from "@/lib/sax-api";
import FeedSaxStories from "@/components/feed/FeedSaxStories";
import FeedInstagramGrid from "@/components/feed/FeedInstagramGrid";

/** Sempre dados frescos da API — exclusões/publicações no PDV aparecem na hora. */
export const dynamic = "force-dynamic";

export const metadata = buildMetadata({
  title: "Feed",
  description:
    "Stories e novidades SAX, além das publicações recentes do Instagram quando a integração estiver ativa.",
  canonical: "/feed",
});

export default async function FeedPage() {
  const apiOk = hasSaxApi();
  const { stories, instagram } = apiOk ? await fetchPublicFeed() : { stories: [], instagram: null };
  const igItems = instagram?.items ?? [];

  return (
    <div className="relative min-h-screen pb-28">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 bg-no-repeat bg-cover bg-center opacity-[0.03]"
        style={{ backgroundImage: "url('/assets/images/home/bc1.png')" }}
      />

      <div className="mx-auto max-w-5xl px-4 pt-14 pb-10 sm:px-6 sm:pt-36">
        <header className="mb-10 max-w-2xl">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
            Feed
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Acompanhe as stories publicadas pela equipe SAX.
          </p>
        </header>

        {!apiOk ? (
          <div className="rounded-2xl border border-amber-200/90 bg-amber-50/90 px-5 py-4 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
            O feed SAX não está disponível: configure{" "}
            <code className="rounded bg-amber-100/80 px-1.5 py-0.5 text-xs dark:bg-amber-900/50">
              NEXT_PUBLIC_SAX_API_URL
            </code>{" "}
            no ambiente do site para carregar stories e Instagram.
          </div>
        ) : (
          <div className="space-y-16">
            <FeedSaxStories stories={stories} />
            <FeedInstagramGrid items={igItems} />
          </div>
        )}
      </div>
    </div>
  );
}
