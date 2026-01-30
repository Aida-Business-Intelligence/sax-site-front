import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

type SeoParams = {
  title?: string;
  description?: string;
  canonical?: string;
  image?: string;
};

export function buildMetadata({
  title,
  description,
  canonical,
  image,
}: SeoParams = {}): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? siteConfig.url;
  const finalTitle = title ? `${title} | ${siteConfig.name}` : siteConfig.name;
  const finalDescription = description ?? siteConfig.description;
  const fullCanonical = canonical?.startsWith("http")
    ? canonical
    : `${baseUrl}${canonical ?? "/"}`;

  const ogImage = image ?? `${baseUrl}/og.jpg`;

  return {
    title: finalTitle,
    description: finalDescription,
    alternates: {
      canonical: fullCanonical,
    },
    openGraph: {
      type: "website",
      locale: siteConfig.locale,
      siteName: siteConfig.name,
      title: finalTitle,
      description: finalDescription,
      url: fullCanonical,
      images: [
        {
          url: ogImage,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: finalTitle,
      description: finalDescription,
      images: [ogImage],
    },
  };
}
