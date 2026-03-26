"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

type GalleryImage = { url: string; alt: string };

type Props = {
  title: string;
  cover: { url: string; alt: string };
  images?: GalleryImage[];
};

function buildSlides(
  cover: { url: string; alt: string },
  images: GalleryImage[] | undefined,
  title: string
): GalleryImage[] {
  const seen = new Set<string>();
  const out: GalleryImage[] = [];
  const push = (url: unknown, alt: unknown) => {
    const u = String(url ?? "").trim();
    if (!u || seen.has(u)) return;
    seen.add(u);
    out.push({ url: u, alt: String(alt ?? "").trim() || title });
  };

  if (images?.length) {
    for (const im of images) {
      push(im?.url, im?.alt);
    }
  }
  if (cover?.url?.trim()) {
    push(cover.url, cover.alt);
  }
  return out;
}

export function PropertyImageGallery({ title, cover, images }: Props) {
  const slides = useMemo(
    () => buildSlides(cover, images, title),
    [cover, images, title]
  );

  const [index, setIndex] = useState(0);

  const safe = slides.length
    ? Math.min(Math.max(0, index), slides.length - 1)
    : 0;
  const current = slides[safe];

  if (slides.length === 0) {
    return (
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-zinc-200/60 dark:bg-zinc-800/40">
        <div className="flex h-full w-full items-center justify-center text-zinc-400 dark:text-zinc-500">
          <span className="text-sm">Sem imagem</span>
        </div>
      </div>
    );
  }

  /* Mesmo padrão do PDV (propriedade-detail-view): borda 2px no próprio thumb
     (primary / transparent), sem ring-offset — evita corte pelo overflow do layout. */
  return (
    <div className="space-y-6">
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-zinc-200/60 dark:bg-zinc-800/40">
        <Image
          src={current.url}
          alt={current.alt}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority={safe === 0}
        />
      </div>

      {slides.length > 1 ? (
        <div
          className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:thin]"
          role="tablist"
          aria-label="Fotos do imóvel"
        >
          {slides.map((s, i) => (
            <button
              key={`${s.url}-${i}`}
              type="button"
              role="tab"
              aria-selected={i === safe}
              onClick={() => setIndex(i)}
              className={`relative h-16 w-[88px] shrink-0 cursor-pointer overflow-hidden rounded-lg border-2 border-solid transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                i === safe
                  ? "border-primary opacity-100"
                  : "border-transparent opacity-80 hover:opacity-100"
              }`}
            >
              <Image
                src={s.url}
                alt=""
                fill
                className="object-cover"
                sizes="88px"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
