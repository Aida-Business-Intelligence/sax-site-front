import { buildMetadata } from "@/lib/seo";
import { AboutView } from "@/sections/sobre/AboutView";
import { getSiteConfig } from "@/services/properties";

export const revalidate = 0;

export const metadata = buildMetadata({
  title: "Sobre nós",
  canonical: "/sobre",
});

export default async function SobrePage() {
  const config = await getSiteConfig();
  return (
    <div className="relative min-h-screen pb-28">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 bg-no-repeat bg-cover bg-center opacity-[0.03]"
        style={{ backgroundImage: "url('/assets/images/home/bc1.png')" }}
      />

      <div className="mx-auto max-w-7xl px-4 pt-14 pb-10 sm:px-6 sm:pt-36">
        <AboutView aboutContent={config?.aboutContent ?? null} />
      </div>
    </div>
  );
}
