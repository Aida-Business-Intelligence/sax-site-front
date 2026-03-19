import { buildMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 86400;

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const name = slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return buildMetadata({
    title: `Imóveis no bairro ${name}`,
    canonical: `/bairro/${slug}`,
    description: `Conheça os melhores imóveis à venda no bairro ${name}.`,
    keywords: [`imóveis ${name}`, `bairro ${name}`],
  });
}

function formatName(s: string) {
  return s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default async function BairroPage({ params }: Props) {
  const { slug } = await params;
  const name = formatName(slug);
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <Breadcrumbs
        items={[
          { label: "Imóveis", href: "/imoveis" },
          { label: `Bairro: ${name}`, href: `/bairro/${slug}` },
        ]}
      />
      <h1 className="mb-2 text-2xl font-semibold">Imóveis no bairro {name}</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        Em breve: conteúdo rico de SEO do bairro, mapa, estatísticas e imóveis.
      </p>
    </div>
  );
}
