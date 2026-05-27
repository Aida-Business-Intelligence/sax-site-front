import { buildMetadata } from "@/lib/seo";
import { getPropertyBySlug, getSiteConfig } from "@/services/properties";
import { PropertyExpertWhatsAppButton } from "@/components/imovel/PropertyExpertWhatsAppButton";
import { PropertyImageGallery } from "@/components/imovel/PropertyImageGallery";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLdProperty } from "@/components/seo/JsonLdProperty";
import { PropertyViewAnalytics } from "@/components/PropertyViewAnalytics";
import Link from "next/link";
import Map from "@/components/map/Map";
import { trackImovelView } from "@/lib/tracking";
import { trackEvent as trackCrm } from "@/lib/tracking-crm";
import {
  ArrowLeft,
  Bath,
  Bed,
  Car,
  Check,
  Home,
  Ruler,
  Sparkles,
  X,
} from "lucide-react";

export const revalidate = 0; // sempre dados frescos ao recarregar
export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

// Do not pre-generate all property pages to avoid export issues while mocking

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);
  if (!property) {
    return buildMetadata({
      title: "Imóvel",
      canonical: `/imovel/${slug}`,
    });
  }
  const imageUrl =
    typeof property.coverImage?.url === "string" &&
    property.coverImage.url.trim() !== ""
      ? property.coverImage.url
      : undefined;
  const keywords: string[] = [
    property.title,
    property.address.city,
    property.address.neighborhood,
    property.type,
  ].filter(Boolean) as string[];
  if (property.address.state)
    keywords.push(`imóveis ${property.address.state}`);

  return buildMetadata({
    title: property.title,
    description: property.description,
    canonical: `/imovel/${property.slug}`,
    ...(imageUrl && { image: imageUrl }),
    keywords,
  });
}

function buildWhatsappHref(digitsRaw: unknown): string | null {
  const digits = String(digitsRaw ?? "").replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}` : null;
}

function ImovelViewTracker({ slug }: { slug: string }) {
  if (typeof window !== "undefined") {
    trackImovelView({ slug });
    trackCrm("VIEW_PROPERTY", { slug });
  }
  return null;
}

export default async function ImovelPage({ params }: Props) {
  const { slug } = await params;
  const [property, siteConfig] = await Promise.all([
    getPropertyBySlug(slug),
    getSiteConfig(),
  ]);
  if (!property) {
    return (
      <div className="relative min-h-screen">
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 -z-10 bg-no-repeat bg-cover bg-center opacity-[0.03]"
          style={{ backgroundImage: "url('/assets/images/home/bc1.png')" }}
        />
        <div className="mx-auto max-w-3xl px-4 pt-8 pb-14 sm:px-6 md:pt-10">
          <Link
            href="/imoveis"
            className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          >
            <ArrowLeft className="size-4" />
            Voltar
          </Link>
          <h1 className="mb-2 text-2xl font-semibold">Imóvel não encontrado</h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Verifique o endereço e tente novamente.
          </p>
        </div>
      </div>
    );
  }

  const breadcrumbs = [
    { label: "Imóveis", href: "/imoveis" },
    { label: property.title, href: `/imovel/${property.slug}` },
  ];

  const mapLat = property.address.lat;
  const mapLng = property.address.lng;
  const hasMapCoords =
    mapLat != null &&
    mapLng != null &&
    Number.isFinite(Number(mapLat)) &&
    Number.isFinite(Number(mapLng));

  const im = siteConfig.imoveisContent;
  const waHref = buildWhatsappHref(im?.whatsappNumber);
  const waButtonText =
    typeof im?.whatsappButtonText === "string" &&
    im.whatsappButtonText.trim() !== ""
      ? im.whatsappButtonText
      : "Falar no WhatsApp";

  return (
    <div className="relative min-h-screen">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 bg-no-repeat bg-cover bg-center opacity-[0.03]"
        style={{ backgroundImage: "url('/assets/images/home/bc1.png')" }}
      />
      <div className="mx-auto max-w-7xl px-4 pt-8 pb-10 sm:px-6 md:pt-10 md:pb-12">
        <JsonLdProperty property={property} />
        <PropertyViewAnalytics propertySlug={property.slug} />
        <Breadcrumbs items={breadcrumbs} />
        <ImovelViewTracker slug={property.slug} />
        <div className="mb-8 flex min-w-0 items-center justify-between gap-3">
          <Link
            href="/imoveis"
            className="inline-flex min-w-0 items-center gap-2 text-sm font-medium text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          >
            <ArrowLeft className="size-4 shrink-0" />
            Voltar
          </Link>
          {waHref ? (
            <div className="2xl:hidden">
              <PropertyExpertWhatsAppButton
                href={waHref}
                compact
                trackingSource="imovel-detail-header"
              >
                WhatsApp
              </PropertyExpertWhatsAppButton>
            </div>
          ) : null}
        </div>
        <div className="grid gap-10 2xl:grid-cols-2">
          <div className="space-y-6">
            <PropertyImageGallery
              key={property.slug}
              title={property.title}
              cover={property.coverImage}
              images={property.images}
            />
            <div>
              {property.ref && (
                <p className="mb-1 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  Ref. {property.ref}
                </p>
              )}
              <h1 className="text-2xl font-semibold">{property.title}</h1>
              {(property.address.street ||
                property.address.number ||
                property.address.neighborhood) && (
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                  {[
                    [property.address.street, property.address.number]
                      .filter(Boolean)
                      .join(", "),
                    property.address.neighborhood,
                  ]
                    .filter(Boolean)
                    .join(" — ")}
                  {property.address.city && `, ${property.address.city}`}
                  {property.address.state && ` - ${property.address.state}`}
                  {property.address.zip && ` • CEP ${property.address.zip}`}
                </p>
              )}
              <p className="mt-3 whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">
                {property.description}
              </p>

              <div className="mt-6 flex flex-col gap-4 sm:gap-5">
                {/* Valores por tipo de transação */}
                <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-900/30">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                    <Sparkles className="size-4" />
                    Valores
                  </h3>
                  <div className="space-y-2">
                    {property.priceVenda != null && property.priceVenda > 0 && (
                      <p className="flex justify-between text-sm">
                        <span className="text-zinc-600 dark:text-zinc-400">
                          Venda
                        </span>
                        <span className="font-medium">
                          {property.priceVenda.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                            maximumFractionDigits: 0,
                          })}
                          {property.area > 0 && (
                            <span className="ml-2 text-zinc-500">
                              (
                              {(property.priceVenda / property.area).toFixed(0)}
                              /m²)
                            </span>
                          )}
                        </span>
                      </p>
                    )}
                    {property.priceAluguel != null &&
                      property.priceAluguel > 0 && (
                        <p className="flex justify-between text-sm">
                          <span className="text-zinc-600 dark:text-zinc-400">
                            Locação
                          </span>
                          <span className="font-medium">
                            {property.priceAluguel.toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                              maximumFractionDigits: 0,
                            })}
                            {property.area > 0 && (
                              <span className="ml-2 text-zinc-500">
                                (
                                {(
                                  property.priceAluguel / property.area
                                ).toFixed(0)}
                                /m²)
                              </span>
                            )}
                          </span>
                        </p>
                      )}
                    {property.priceCrowdfunding != null &&
                      property.priceCrowdfunding > 0 && (
                        <p className="flex justify-between text-sm">
                          <span className="text-zinc-600 dark:text-zinc-400">
                            Crowdfunding
                          </span>
                          <span className="font-medium">
                            {property.priceCrowdfunding.toLocaleString(
                              "pt-BR",
                              {
                                style: "currency",
                                currency: "BRL",
                                maximumFractionDigits: 0,
                              },
                            )}
                            {property.area > 0 && (
                              <span className="ml-2 text-zinc-500">
                                (
                                {(
                                  property.priceCrowdfunding / property.area
                                ).toFixed(0)}
                                /m²)
                              </span>
                            )}
                          </span>
                        </p>
                      )}
                    {(!property.priceVenda || property.priceVenda <= 0) &&
                      (!property.priceAluguel || property.priceAluguel <= 0) &&
                      (!property.priceCrowdfunding ||
                        property.priceCrowdfunding <= 0) && (
                        <p className="text-sm font-medium">
                          {property.price.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                            maximumFractionDigits: 0,
                          })}
                        </p>
                      )}
                  </div>
                </div>

                {/* Características do imóvel */}
                <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-900/30">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                    <Home className="size-4" />
                    Características
                  </h3>
                  <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-zinc-700 dark:text-zinc-300">
                    {property.area > 0 && (
                      <li className="flex items-center gap-1.5">
                        <Ruler className="size-4 text-zinc-500" />
                        {property.area} m²
                      </li>
                    )}
                    {property.bedrooms > 0 && (
                      <li className="flex items-center gap-1.5">
                        <Bed className="size-4 text-zinc-500" />
                        {property.bedrooms} quartos
                      </li>
                    )}
                    {(property.suites ?? 0) > 0 && (
                      <li className="flex items-center gap-1.5">
                        <Bed className="size-4 text-zinc-500" />
                        {property.suites} suítes
                      </li>
                    )}
                    {(property.demiSuites ?? 0) > 0 && (
                      <li className="flex items-center gap-1.5">
                        <Bed className="size-4 text-zinc-500" />
                        {property.demiSuites} demi-suítes
                      </li>
                    )}
                    {property.bathrooms > 0 && (
                      <li className="flex items-center gap-1.5">
                        <Bath className="size-4 text-zinc-500" />
                        {property.bathrooms} banheiros
                      </li>
                    )}
                    {(property.garage ?? 0) > 0 && (
                      <li className="flex items-center gap-1.5">
                        <Car className="size-4 text-zinc-500" />
                        {property.garage} vagas
                      </li>
                    )}
                  </ul>
                </div>

                {/* Comodidades */}
                {property.comodidades && property.comodidades.length > 0 && (
                  <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-900/30">
                    <h3 className="mb-3 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                      Comodidades
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {property.comodidades.map((c) => (
                        <span
                          key={c}
                          className="rounded-full bg-zinc-200 px-3 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sim/Não: Mobiliado, Pets, Permuta, Em construção, Parceria */}
                <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-900/30">
                  <h3 className="mb-3 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                    Outras informações
                  </h3>
                  <ul className="space-y-1.5 text-sm text-zinc-700 dark:text-zinc-300">
                    <li className="flex items-center gap-2">
                      {property.mobiliado ? (
                        <Check className="size-4 text-emerald-600" />
                      ) : (
                        <X className="size-4 text-zinc-400" />
                      )}
                      Mobiliado
                    </li>
                    <li className="flex items-center gap-2">
                      {property.aceita_pets ? (
                        <Check className="size-4 text-emerald-600" />
                      ) : (
                        <X className="size-4 text-zinc-400" />
                      )}
                      Aceita pets
                    </li>
                    <li className="flex items-center gap-2">
                      {property.aceita_permuta ? (
                        <Check className="size-4 text-emerald-600" />
                      ) : (
                        <X className="size-4 text-zinc-400" />
                      )}
                      Aceita permuta
                    </li>
                    <li className="flex items-center gap-2">
                      {property.em_construcao ? (
                        <Check className="size-4 text-emerald-600" />
                      ) : (
                        <X className="size-4 text-zinc-400" />
                      )}
                      Em construção
                    </li>
                    <li className="flex items-center gap-2">
                      {property.parceria ? (
                        <Check className="size-4 text-emerald-600" />
                      ) : (
                        <X className="size-4 text-zinc-400" />
                      )}
                      Parceria
                    </li>
                    {property.dataPrevistaEntrega && (
                      <li className="flex items-center gap-2">
                        <span className="text-zinc-500">
                          Data prevista entrega:
                        </span>
                        <span className="font-medium">
                          {new Date(
                            property.dataPrevistaEntrega,
                          ).toLocaleDateString("pt-BR")}
                        </span>
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Tags do imóvel */}
              {property.tagImovel && property.tagImovel.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2 sm:mt-5">
                  {property.tagImovel.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md bg-zinc-800 px-2.5 py-0.5 text-xs text-white dark:bg-zinc-200 dark:text-zinc-900"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="space-y-6">
            <Map
              center={
                hasMapCoords
                  ? { lng: Number(mapLng), lat: Number(mapLat) }
                  : { lng: -51.5, lat: -14.2 }
              }
              zoom={hasMapCoords ? 16 : 4}
              view3D
              markerStyle="neon-blue"
              markers={
                hasMapCoords
                  ? [
                      {
                        id: property.id,
                        lng: Number(mapLng),
                        lat: Number(mapLat),
                      },
                    ]
                  : []
              }
              className="h-[320px] w-full rounded-2xl border border-zinc-200 dark:border-zinc-800"
            />
            <div className="rounded-2xl border border-zinc-200 p-5 pb-6 dark:border-zinc-800 sm:p-6 md:mb-0">
              <h2 className="mb-3 text-lg font-semibold md:mb-4">
                Fale com um especialista
              </h2>
              {waHref ? (
                <>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Tire dúvidas sobre este imóvel pelo WhatsApp.
                  </p>
                  <PropertyExpertWhatsAppButton
                    href={waHref}
                    trackingSource="imovel-detail-footer"
                  >
                    {waButtonText}
                  </PropertyExpertWhatsAppButton>
                </>
              ) : (
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-12">
                  Em breve adicionaremos o formulário neste detalhe também. O
                  botão do WhatsApp aparece quando o número for configurado na
                  gestão do site (seção Imóveis).
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
