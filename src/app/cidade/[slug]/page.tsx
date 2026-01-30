import { buildMetadata } from "@/lib/seo";
import { getCitySlugs } from "@/services/properties";

type Props = {
  params: { slug: string };
};

export const revalidate = 86400;

export async function generateStaticParams() {
  return getCitySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props) {
  const name = params.slug.split("-")[0]?.toUpperCase() ?? "Cidade";
  return buildMetadata({
    title: `Imóveis na cidade de ${name}`,
    canonical: `/cidade/${params.slug}`,
    description: `Veja imóveis à venda em ${name}.`,
  });
}

export default function CidadePage({ params }: Props) {
  const name = params.slug.replaceAll("-", " ");
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="mb-2 text-2xl font-semibold capitalize">Cidade: {name}</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        Em breve: conteúdo SEO da cidade, qualidade de vida, regiões e imóveis.
      </p>
    </div>
  );
}
