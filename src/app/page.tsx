import Hero from "@/sections/home/Hero";
import FeaturedImoveis from "@/sections/home/FeaturedImoveis";
import { getSiteConfig } from "@/services/properties";

export const revalidate = 0; // sempre dados frescos (edição no PDV reflete ao recarregar)

export default async function Home() {
  const config = await getSiteConfig();
  return (
    <>
      <Hero heroContent={config?.heroContent ?? null} />
      <FeaturedImoveis />
    </>
  );
}
