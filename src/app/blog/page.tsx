import { buildMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { PostListView } from "@/sections/blog/view";

export const metadata = buildMetadata({
  title: "Blog",
  canonical: "/blog",
  description: "Conteúdo de mercado imobiliário, investimentos e lifestyle.",
  keywords: ["blog imobiliário", "mercado imobiliário", "investimento imóveis"],
});

export default function BlogPage() {
  return (
    <div className="relative min-h-screen pb-28">
      {/* Background illustration with 3% opacity, full width */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 bg-no-repeat bg-cover bg-center opacity-[0.03]"
        style={{ backgroundImage: "url('/assets/images/home/bc1.png')" }}
      />

      <div className="mx-auto max-w-7xl px-4 pt-14 pb-10 sm:px-6 sm:pt-36">
        <Breadcrumbs items={[{ label: "Início", href: "/" }, { label: "Blog", href: "/blog" }]} />
        <PostListView />
      </div>
    </div>
  );
}
