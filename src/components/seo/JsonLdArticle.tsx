import type { BlogPost } from "@/types/blog";
import { siteConfig } from "@/config/site";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? siteConfig.url;

type Props = {
  post: BlogPost;
};

/**
 * JSON-LD Article para posts do blog.
 * Ajuda o Google a exibir rich results (data de publicação, autor, imagem).
 */
export function JsonLdArticle({ post }: Props) {
  const url = `${baseUrl}/blog/${post.slug}`;
  const imageUrl = post.coverUrl
    ? post.coverUrl.startsWith("http")
      ? post.coverUrl
      : `${baseUrl}${post.coverUrl.startsWith("/") ? "" : "/"}${post.coverUrl}`
    : undefined;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt || post.title,
    url,
    datePublished: post.createdAt,
    dateModified: post.updatedAt || post.createdAt,
    author: {
      "@type": "Person",
      name: post.authorName,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/og.jpg`,
      },
    },
    ...(imageUrl && { image: imageUrl }),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
