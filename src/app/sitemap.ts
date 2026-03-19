import type { MetadataRoute } from "next";
import { getProperties, getCities, getNeighborhoods } from "@/services/properties";
import { listPosts } from "@/services/blog-server";
import { siteConfig } from "@/config/site";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? siteConfig.url;

const staticRoutes = [
  "",
  "/imoveis",
  "/imoveis/mapa",
  "/blog",
  "/sobre",
  "/contato",
  "/projetos-exclusivos",
  "/podcast",
  "/para-proprietarios",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  // Páginas estáticas
  for (const path of staticRoutes) {
    entries.push({
      url: `${baseUrl}${path || "/"}`,
      lastModified: new Date(),
      changeFrequency: path === "" || path === "/imoveis" ? "daily" : "weekly",
      priority: path === "" ? 1 : path === "/imoveis" ? 0.9 : 0.8,
    });
  }

  // Imóveis (cada imóvel = página para índice)
  try {
    const properties = await getProperties();
    for (const p of properties) {
      entries.push({
        url: `${baseUrl}/imovel/${p.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
  } catch {
    // ignora; sitemap continua com o resto
  }

  // Cidades (hierarquia: cidade → ajuda no rankeamento local)
  try {
    const cities = await getCities();
    for (const c of cities) {
      entries.push({
        url: `${baseUrl}/cidade/${c.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  } catch {
    // ignora
  }

  // Bairros
  try {
    const neighborhoods = await getNeighborhoods();
    for (const n of neighborhoods) {
      entries.push({
        url: `${baseUrl}/bairro/${n.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }
  } catch {
    // ignora
  }

  // Posts do blog (conteúdo = bom para SEO orgânico)
  try {
    const posts = await listPosts();
    for (const post of posts) {
      entries.push({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: post.updatedAt ? new Date(post.updatedAt) : new Date(),
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  } catch {
    // ignora
  }

  return entries;
}
