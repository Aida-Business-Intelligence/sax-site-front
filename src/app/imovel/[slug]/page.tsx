import { buildMetadata } from "@/lib/seo";
import { getPropertyBySlug, getPropertySlugs } from "@/services/properties";
import Map from "@/components/map/Map";
import HeroCarousel from "@/components/gallery/HeroCarousel";
import Link from "next/link";
import { trackImovelView } from "@/lib/tracking";

export const revalidate = 1800;
export const dynamicParams = true;

type Props = {
  params: { slug: string };
};

export async function generateStaticParams() {
  return getPropertySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props) {
  const property = await getPropertyBySlug(params.slug);
  if (!property) {
    return buildMetadata({
      title: "Imóvel",
      canonical: `/imovel/${params.slug}`,
    });
  }
  return buildMetadata({
    title: property.title,
    description: property.description,
    canonical: `/imovel/${property.slug}`,
    image: property.coverImage.url,
  });
}

function ImovelViewTracker({ slug }: { slug: string }) {
  // client-only tracker
  if (typeof window !== "undefined") {
    trackImovelView({ slug });
  }
  return null;
}

export default async function ImovelPage({ params }: Props) {
  const property = await getPropertyBySlug(params.slug);
  if (!property) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="mb-2 text-2xl font-semibold">Imóvel não encontrado</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Verifique o endereço e tente novamente.
        </p>
      </div>
    );
  }

  const heroImages = [
    property.coverImage,
    ...(property.images ?? []),
  ].filter(Boolean);

  return (
    <div className="mx-auto max-w-none px-0 sm:px-0">
      <ImovelViewTracker slug={property.slug} />

      {/* Hero - full width carousel */}
      <section className="w-full">
        <HeroCarousel images={heroImages} />
        {/* Breadcrumb + actions */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-center justify-between py-3">
            <nav className="text-sm text-zinc-600 dark:text-zinc-300">
              <Link href="/" className="hover:underline">
                Início
              </Link>{" "}
              /{" "}
              <Link href="/imoveis" className="hover:underline">
                Imóveis
              </Link>{" "}
              / {property.address.city} - {property.address.state}
            </nav>
            <div className="flex items-center gap-2">
              <a
                href="#bairro"
                className="rounded-full border border-zinc-300 px-3 py-1 text-xs hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
              >
                Conheça o bairro
              </a>
              <a
                href="#video"
                className="rounded-full border border-zinc-300 px-3 py-1 text-xs hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
              >
                Vídeo
              </a>
              <a
                href="#mapa"
                className="rounded-full border border-zinc-300 px-3 py-1 text-xs hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
              >
                Mapa
              </a>
              <a
                href="#rua"
                className="rounded-full border border-zinc-300 px-3 py-1 text-xs hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
              >
                Rua
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Content that appears as user scrolls */}
      <section className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="space-y-4">
            <h1 className="text-3xl font-semibold tracking-tight">
              {property.title}
            </h1>
            <p className="text-zinc-700 dark:text-zinc-300">
              {property.description}
            </p>
            <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-700 dark:text-zinc-300">
              <span>
                {property.bedrooms} dormitórios • {property.bathrooms} banheiros
                • {property.area} m²
              </span>
              {property.builder ? (
                <span className="rounded-full border border-zinc-300 px-2 py-0.5 text-xs dark:border-zinc-700">
                  {property.builder}
                </span>
              ) : null}
            </div>
            <p className="text-2xl font-semibold">
              {property.price.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
                maximumFractionDigits: 0,
              })}
            </p>

            {/* Amenities */}
            {property.amenities && property.amenities.length ? (
              <div className="mt-4">
                <h2 className="mb-2 text-lg font-semibold">
                  O que você vai encontrar
                </h2>
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map((a) => (
                    <span
                      key={a}
                      className="rounded-full border border-zinc-300 px-2 py-1 text-xs text-zinc-700 dark:border-zinc-700 dark:text-zinc-300"
                    >
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
          <div className="space-y-6">
            <div id="mapa" className="rounded-2xl border border-zinc-200 dark:border-zinc-800">
              <Map
                center={{
                  lng: property.address.lng ?? -46.651,
                  lat: property.address.lat ?? -23.564,
                }}
                markers={
                  property.address.lat && property.address.lng
                    ? [
                        {
                          id: property.id,
                          lng: property.address.lng,
                          lat: property.address.lat,
                        },
                      ]
                    : []
                }
                className="h-[380px] w-full rounded-2xl"
              />
            </div>
            <div className="rounded-2xl border border-zinc-200 p-6 dark:border-zinc-800">
              <h2 className="mb-4 text-lg font-semibold">
                Fale com um especialista
              </h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Em breve adicionaremos o formulário neste detalhe também.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
