import { buildMetadata } from "@/lib/seo";
import { fetchSiteConfig } from "@/lib/sax-api";
import {
  normalizeExclusiveProjectsContent,
} from "@/lib/exclusive-projects-content";
import { ExclusiveProjectsView } from "@/sections/projetos-exclusivos/ExclusiveProjectsView";

export const dynamic = "force-dynamic";

export const metadata = buildMetadata({
  title: "Projetos exclusivos",
  canonical: "/projetos-exclusivos",
});

export default async function ProjetosExclusivosPage() {
  const config = await fetchSiteConfig();
  const content = normalizeExclusiveProjectsContent(
    config.exclusiveProjectsContent ?? null
  );

  return (
    <div className="relative min-h-screen pb-28">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 bg-no-repeat bg-cover bg-center opacity-[0.03]"
        style={{ backgroundImage: "url('/assets/images/home/bc1.png')" }}
      />

      <div className="mx-auto max-w-7xl px-4 pt-14 pb-10 sm:px-6 sm:pt-36">
        <ExclusiveProjectsView content={content} />
      </div>
    </div>
  );
}
