import { buildMetadata } from "@/lib/seo";
export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 86400;

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const name = slug.split("-")[0]?.toUpperCase() ?? "Cidade";
  return buildMetadata({
    title: `Imóveis na cidade de ${name}`,
    canonical: `/cidade/${slug}`,
    description: `Veja imóveis à venda em ${name}.`,
  });
}

export default async function CidadePage({ params }: Props) {
  const { slug } = await params;
  const name = slug.replaceAll("-", " ");
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="mb-2 text-2xl font-semibold capitalize">Cidade: {name}</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        Em breve: conteúdo SEO da cidade, qualidade de vida, regiões e imóveis.
      </p>
    </div>
  );
}
