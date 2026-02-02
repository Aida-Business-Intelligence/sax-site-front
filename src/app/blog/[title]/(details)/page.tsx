import { PostDetailsView } from "@/sections/blog/view";

type Props = {
  params: { title: string };
};

export default function Page({ params }: Props) {
  return (
    <div className="relative min-h-screen pb-28">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 bg-no-repeat bg-cover bg-center opacity-[0.03]"
        style={{ backgroundImage: "url('/assets/images/home/bc1.png')" }}
      />
      <div className="mx-auto max-w-7xl px-4 pt-32 pb-10 sm:px-6 sm:pt-36">
        <PostDetailsView slug={params.title} />
      </div>
    </div>
  );
}
