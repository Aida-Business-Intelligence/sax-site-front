import { buildMetadata } from "@/lib/seo";
import { getPropertyBySlug } from "@/services/properties";
import Image from "next/image";
import Map from "@/components/map/Map";
import { trackImovelView } from "@/lib/tracking";

export const revalidate = 1800;
export const dynamic = "force-dynamic";

type Props = {
  params: { slug: string };
};

// Do not pre-generate all property pages to avoid export issues while mocking

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

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <ImovelViewTracker slug={property.slug} />
      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl">
            <Image
              src={property.coverImage.url}
              alt={property.coverImage.alt}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          <div className="mt-6 space-y-3">
            <h1 className="text-2xl font-semibold">{property.title}</h1>
            <p className="text-zinc-700 dark:text-zinc-300">
              {property.description}
            </p>
            <p className="text-lg font-medium">
              {property.price.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
                maximumFractionDigits: 0,
              })}
            </p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {property.bedrooms}q • {property.bathrooms}b • {property.area}m²
            </p>
          </div>
        </div>
        <div className="space-y-6">
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
            className="border border-zinc-200 dark:border-zinc-800"
          />
          <div className="rounded-2xl border border-zinc-200 p-6 dark:border-zinc-800">
            <h2 className="mb-4 text-lg font-semibold">
              Fale com um especialista
            </h2>
            {/* Form será renderizado em /contato e também podemos embutir aqui depois */}
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Em breve adicionaremos o formulário neste detalhe também.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
