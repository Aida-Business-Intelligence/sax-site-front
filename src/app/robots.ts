import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? siteConfig.url;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/blog/*/edit/", "/api/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
