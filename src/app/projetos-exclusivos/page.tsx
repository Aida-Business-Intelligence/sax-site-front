import { buildMetadata } from "@/lib/seo";

export const revalidate = 1800;

export const metadata = buildMetadata({
  title: "Projetos exclusivos",
  canonical: "/projetos-exclusivos",
});

export default function ProjetosExclusivosPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <h1 className="mb-4 text-3xl font-semibold tracking-tight">
        Projetos exclusivos
      </h1>
      <p className="text-zinc-700 dark:text-zinc-300">
        Em breve listaremos nossos projetos exclusivos e lançamentos
        selecionados.
      </p>
    </div>
  );
}
