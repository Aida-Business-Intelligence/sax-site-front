import { buildMetadata } from "@/lib/seo";
// import BlogListView from "@/sections/blog/BlogListView";
import { PostListView } from "./../../sections/blog/view";
export const metadata = buildMetadata({
  title: "Blog",
  canonical: "/blog",
  description: "Conteúdo de mercado imobiliário, investimentos e lifestyle.",
});

export default function BlogPage() {
  return <PostListView />;
}
