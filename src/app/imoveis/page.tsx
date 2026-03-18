import { getProperties, getSectionsWithProperties, getTags, getSiteConfig } from "@/services/properties";
import { buildMetadata } from "@/lib/seo";
import { PropertyCatalog } from "@/sections/imoveis/PropertyCatalog";

export const revalidate = 0; // sempre dados frescos (atualiza no PDV = aparece ao recarregar)

export const metadata = buildMetadata({
  title: "Imóveis à venda",
  canonical: "/imoveis",
  description:
    "Explore nossa seleção de imóveis premium à venda nas melhores regiões do Brasil.",
});

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function ImoveisPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const [properties, sectionsWithProperties, tags, siteConfig] = await Promise.all([
    getProperties(),
    getSectionsWithProperties(),
    getTags(),
    getSiteConfig(),
  ]);
  return (
    <div className="relative min-h-screen pb-28">
      {/* Background illustration with 3% opacity, full width */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 bg-no-repeat bg-cover bg-center opacity-[0.03]"
        style={{ backgroundImage: "url('/assets/images/home/bc1.png')" }}
      />

      <div className="mx-auto max-w-7xl px-4 pt-8 pb-10 sm:px-6 md:pt-10">
        <PropertyCatalog
          properties={properties}
          sectionsWithProperties={sectionsWithProperties}
          tags={tags}
          initialSearchParams={params}
          featuredPropertyIds={siteConfig?.featuredPropertyIds ?? []}
          partnerLogos={siteConfig?.partnerLogos ?? []}
        />
      </div>
    </div>
  );
}
