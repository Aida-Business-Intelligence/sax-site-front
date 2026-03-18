import { buildMetadata } from "@/lib/seo";
// Rendering: avoid pre-rendering errors during static export on Vercel
export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 86400; // ISR diário

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const name = slug.split("-")[0]?.toUpperCase() ?? "Bairro";
  return buildMetadata({
    title: `Imóveis no bairro ${name}`,
    canonical: `/bairro/${slug}`,
    description: `Conheça os melhores imóveis à venda no bairro ${name}.`,
  });
}

export default async function BairroPage({ params }: Props) {
  const { slug } = await params;
  const name = slug.replaceAll("-", " ");
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="mb-2 text-2xl font-semibold capitalize">Bairro: {name}</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        Em breve: conteúdo rico de SEO do bairro, mapa, estatísticas e imóveis.
      </p>
    </div>
  );
}
