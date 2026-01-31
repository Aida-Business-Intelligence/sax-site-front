import { buildMetadata } from "@/lib/seo";

export const revalidate = 1800;

export const metadata = buildMetadata({
  title: "Projetos exclusivos",
  canonical: "/projetos-exclusivos",
});

export default function ProjetosExclusivosPage() {
  return (
    <div className="relative min-h-screen pb-28">
      {/* Background illustration with 3% opacity, full width */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 bg-no-repeat bg-cover bg-center opacity-[0.03]"
        style={{ backgroundImage: "url('/assets/images/home/bc1.png')" }}
      />

      <div className="mx-auto max-w-7xl px-4 pt-32 pb-10 sm:px-6 sm:pt-36">
        <h1 className="mb-4 text-3xl font-semibold tracking-tight">
          Projetos exclusivos
        </h1>
        <p className="text-zinc-700 dark:text-zinc-300">
          Em breve listaremos nossos projetos exclusivos e lançamentos
          selecionados.
        </p>
      </div>
    </div>
  );
}
