import { buildMetadata } from "@/lib/seo";
import { getPostBySlug } from "@/services/blog-server";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLdArticle } from "@/components/seo/JsonLdArticle";
import { PostDetailsView } from "@/sections/blog/view";

type Props = {
  params: Promise<{ title: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { title: slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) {
    return buildMetadata({
      title: "Post",
      canonical: `/blog/${slug}`,
    });
  }
  return buildMetadata({
    title: post.title,
    description: post.excerpt || post.title,
    canonical: `/blog/${post.slug}`,
    ...(post.coverUrl && { image: post.coverUrl }),
    keywords: post.tags?.length ? post.tags : undefined,
  });
}

export default async function Page({ params }: Props) {
  const { title } = await params;
  const post = await getPostBySlug(title);

  return (
    <div className="relative min-h-screen pb-28">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 bg-no-repeat bg-cover bg-center opacity-[0.03]"
        style={{ backgroundImage: "url('/assets/images/home/bc1.png')" }}
      />
      <div className="mx-auto max-w-7xl px-4 pt-32 pb-10 sm:px-6 sm:pt-36">
        {post && (
          <>
            <JsonLdArticle post={post} />
            <Breadcrumbs
              items={[
                { label: "Blog", href: "/blog" },
                { label: post.title, href: `/blog/${post.slug}` },
              ]}
            />
          </>
        )}
        <PostDetailsView slug={title} />
      </div>
    </div>
  );
}
