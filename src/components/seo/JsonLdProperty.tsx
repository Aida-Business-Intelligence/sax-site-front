import type { Property } from "@/types/realEstate";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";

type Props = {
  property: Property;
};

/**
 * JSON-LD para página de imóvel (Product + Offer + Place).
 * Melhora rich results e rankeamento para buscas por cidade/região.
 */
export function JsonLdProperty({ property }: Props) {
  const addr = property.address;
  const streetWithNumber = [addr.street, addr.number].filter(Boolean).join(", ");
  const addressLine = [
    streetWithNumber,
    addr.neighborhood,
    addr.city,
    addr.state,
    addr.zip,
  ]
    .filter(Boolean)
    .join(", ");

  const price = property.priceVenda ?? property.priceAluguel ?? property.price;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: property.title,
    description: property.description,
    ...(property.coverImage?.url && {
      image: property.coverImage.url.startsWith("http")
        ? property.coverImage.url
        : `${baseUrl}${property.coverImage.url.startsWith("/") ? "" : "/"}${property.coverImage.url}`,
    }),
    url: `${baseUrl}/imovel/${property.slug}`,
    category: "Imóvel à venda",
    ...(addressLine && {
      // Place para localização (cidade, bairro = bom para SEO local)
      containedInPlace: {
        "@type": "Place",
        name: addr.city || addr.neighborhood || "Brasil",
        address: {
          "@type": "PostalAddress",
          addressLocality: addr.city,
          addressRegion: addr.state,
          addressNeighborhood: addr.neighborhood,
          streetAddress: streetWithNumber || addr.street,
          postalCode: addr.zip,
          addressCountry: "BR",
        },
      },
    }),
    offers: {
      "@type": "Offer",
      price: price,
      priceCurrency: "BRL",
      availability: "https://schema.org/InStock",
      url: `${baseUrl}/imovel/${property.slug}`,
    },
    ...(property.area > 0 && { additionalProperty: { "@type": "PropertyValue", name: "Área", value: `${property.area} m²` } }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
