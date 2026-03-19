import Link from "next/link";
import { ChevronRight } from "lucide-react";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";

export type BreadcrumbItem = {
  label: string;
  href: string;
};

type Props = {
  items: BreadcrumbItem[];
};

/**
 * Breadcrumbs visíveis + JSON-LD BreadcrumbList para SEO.
 */
export function Breadcrumbs({ items }: Props) {
  if (items.length === 0) return null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: item.href.startsWith("http") ? item.href : `${baseUrl}${item.href.startsWith("/") ? "" : "/"}${item.href}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex flex-wrap items-center gap-1 text-sm text-zinc-600 dark:text-zinc-400">
          {items.map((item, i) => (
            <li key={item.href} className="flex items-center gap-1">
              {i > 0 && (
                <ChevronRight className="size-4 shrink-0 text-zinc-400 dark:text-zinc-500" aria-hidden />
              )}
              {i === items.length - 1 ? (
                <span className="font-medium text-zinc-900 dark:text-zinc-100" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="hover:text-zinc-900 hover:underline dark:hover:text-zinc-200"
                >
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
