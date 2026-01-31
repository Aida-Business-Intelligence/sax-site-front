import { getProperties } from "@/services/properties";
import { buildMetadata } from "@/lib/seo";
import { PropertyCatalog } from "@/sections/imoveis/PropertyCatalog";

export const revalidate = 1800; // ISR: 30m

export const metadata = buildMetadata({
  title: "Imóveis à venda",
  canonical: "/imoveis",
  description:
    "Explore nossa seleção de imóveis premium à venda nas melhores regiões do Brasil.",
});

export default async function ImoveisPage() {
  const properties = await getProperties();
  return (
    <div className="relative min-h-screen pb-28">
      {/* Background illustration with 3% opacity, full width */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 bg-no-repeat bg-cover bg-center opacity-[0.03]"
        style={{ backgroundImage: "url('/assets/images/home/bc1.png')" }}
      />

      <div className="mx-auto max-w-7xl px-4 pt-8 pb-10 sm:px-6 md:pt-10">
        <PropertyCatalog properties={properties} />
      </div>
    </div>
  );
}
