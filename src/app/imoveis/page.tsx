import { getProperties, getSectionsWithProperties, getTags, getSiteConfig } from "@/services/properties";
import { buildMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { PropertyCatalog } from "@/sections/imoveis/PropertyCatalog";

export const revalidate = 0; // sempre dados frescos (atualiza no PDV = aparece ao recarregar)

export const metadata = buildMetadata({
  title: "Imóveis à venda",
  canonical: "/imoveis",
  description:
    "Explore nossa seleção de imóveis premium à venda nas melhores regiões do Brasil.",
  keywords: ["imóveis à venda", "imobiliária", "apartamento", "casa", "lançamentos"],
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
  const partnerLogos = siteConfig?.partnerLogos ?? [];
  const hasPartners = Array.isArray(partnerLogos) && partnerLogos.length > 0;
  return (
    <div
      className={cn("relative min-h-screen", hasPartners ? "pb-28" : "pb-14 md:pb-16")}
    >
      {/* Background illustration with 3% opacity, full width */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 bg-no-repeat bg-cover bg-center opacity-[0.03]"
        style={{ backgroundImage: "url('/assets/images/home/bc1.png')" }}
      />

      <div
        className={cn(
          "mx-auto max-w-7xl px-4 pt-8 sm:px-6 md:pt-10",
          hasPartners ? "pb-10" : "pb-5 md:pb-6"
        )}
      >
        <Breadcrumbs items={[{ label: "Início", href: "/" }, { label: "Imóveis", href: "/imoveis" }]} />
        <PropertyCatalog
          properties={properties}
          sectionsWithProperties={sectionsWithProperties}
          tags={tags}
          initialSearchParams={params}
          featuredPropertyIds={siteConfig?.featuredPropertyIds ?? []}
          partnerLogos={partnerLogos}
          transactionTypes={siteConfig?.transactionTypes ?? []}
        />
      </div>
    </div>
  );
}
