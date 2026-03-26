import type { InstagramMediaItemPublic } from "@/lib/sax-api";

type Props = {
  items: InstagramMediaItemPublic[];
};

function pickSrc(item: InstagramMediaItemPublic): string {
  const isVideo = item.mediaType === "VIDEO" || item.mediaType === "REELS";
  if (isVideo) {
    return item.thumbnailUrl || item.mediaUrl || "";
  }
  return item.mediaUrl || item.thumbnailUrl || "";
}

export default function FeedInstagramGrid({ items }: Props) {
  const list = items.filter((i) => pickSrc(i));

  if (!list.length) {
    return (
      <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/80 px-6 py-12 text-center dark:border-zinc-800 dark:bg-zinc-900/40">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Nenhuma mídia do Instagram disponível no momento.
        </p>
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Instagram
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Publicações recentes da conta conectada
        </p>
      </div>

      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {list.map((item) => {
          const src = pickSrc(item);
          const href = item.permalink || "#";
          return (
            <li key={item.id} className="aspect-square overflow-hidden rounded-xl border border-zinc-200/90 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900">
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block h-full w-full"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={item.caption?.slice(0, 80) ?? "Post Instagram"}
                  className="h-full w-full object-cover transition group-hover:scale-[1.03]"
                  loading="lazy"
                />
                {(item.mediaType === "VIDEO" || item.mediaType === "REELS") ? (
                  <span className="absolute bottom-2 right-2 rounded bg-black/55 px-1.5 py-0.5 text-[10px] font-medium text-white">
                    Vídeo
                  </span>
                ) : null}
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
