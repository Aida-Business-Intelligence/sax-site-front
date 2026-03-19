import { siteConfig } from "@/config/site";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? siteConfig.url;

/**
 * JSON-LD para a imobiliária (RealEstateAgent = LocalBusiness).
 * Ajuda o Google a exibir Knowledge Panel e melhorar E-E-A-T.
 */
export function JsonLdRealEstateAgent() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "@id": `${baseUrl}/#organization`,
    name: siteConfig.name,
    description: siteConfig.description,
    url: baseUrl,
    logo: `${baseUrl}/og.jpg`,
    ...(siteConfig.social?.twitter && {
      sameAs: [`https://twitter.com/${siteConfig.social.twitter.replace("@", "")}`],
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
