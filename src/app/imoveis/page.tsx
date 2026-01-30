import { getProperties } from "@/services/properties";
import { buildMetadata } from "@/lib/seo";
import SearchBar from "@/components/forms/SearchBar";
import PropertySection from "@/sections/imoveis/PropertySection";
import FeaturedBanner from "@/sections/imoveis/FeaturedBanner";
import MapTeaser from "@/sections/imoveis/MapTeaser";
import PartnersSection from "@/sections/imoveis/PartnersSection";

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
        className="pointer-events-none fixed inset-0 -z-10 bg-no-repeat bg-cover bg-center opacity-[0.04]"
        style={{ backgroundImage: "url('/assets/images/home/bc1.png')" }}
      />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {/* Filtro horizontal (mesmo da Home) */}
        <div className="sticky top-20 z-20 mb-12">
          <div className="relative">
            <SearchBar />
            {/* Máscara sólida + fade: o conteúdo desaparece antes de encostar no filtro */}
            <div className="pointer-events-none -mt-2 h-6 bg-white dark:bg-zinc-900" />
            <div className="-mt-px h-10 pointer-events-none bg-linear-to-b from-white to-transparent dark:from-zinc-900" />
          </div>
        </div>

        <PropertySection
          title="Melhores investimentos"
          href="/imoveis?secao=investimentos"
          properties={properties}
        />
        <PropertySection
          title="Mais procurados"
          href="/imoveis?secao=mais-procurados"
          properties={properties}
        />
        <PropertySection
          title="Lançamentos"
          href="/imoveis?secao=lancamentos"
          properties={properties}
        />
        {/* Banner destacado (imóvel ranqueado) */}
        <FeaturedBanner property={properties[0]} />
        <PropertySection
          title="Na planta"
          href="/imoveis?secao=na-planta"
          properties={properties}
        />
        <PropertySection
          title="Frente mar"
          href="/imoveis?secao=frente-mar"
          properties={properties}
        />
        <div className="relative">
          <div className="sticky top-66 z-10">
            <MapTeaser properties={properties} />
          </div>
          <div aria-hidden="true" className="h-[560px]" />
          <PartnersSection />
        </div>
      </div>
    </div>
  );
}
