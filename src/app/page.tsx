import Hero from "@/sections/home/Hero";
import CategoriasImoveis from "@/sections/home/CategoriasImoveis";
import FeaturedImoveis from "@/sections/home/FeaturedImoveis";
import {
  getSiteConfig,
  getPropertiesFromApiOnly,
} from "@/services/properties";

export const revalidate = 0; // sempre dados frescos (edição no PDV reflete ao recarregar)

export default async function Home() {
  // Busca NO SERVIDOR (uma vez) e entrega pronto — evita o navegador chamar o
  // backend dev-sax várias vezes (ele devolve 503 sob chamadas simultâneas).
  const [config, properties] = await Promise.all([
    getSiteConfig(),
    getPropertiesFromApiOnly(),
  ]);
  return (
    <>
      <Hero
        heroContent={config?.heroContent ?? null}
        initialProperties={properties}
      />
      <CategoriasImoveis properties={properties} />
      <FeaturedImoveis properties={properties} />
    </>
  );
}
