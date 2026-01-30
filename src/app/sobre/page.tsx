import { buildMetadata } from "@/lib/seo";

export const revalidate = 1800;

export const metadata = buildMetadata({
  title: "Sobre nós",
  canonical: "/sobre",
});

export default function SobrePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <h1 className="mb-4 text-3xl font-semibold tracking-tight">Sobre nós</h1>
      <p className="text-zinc-700 dark:text-zinc-300">
        Conteúdo institucional em breve.
      </p>
    </div>
  );
}
