"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type GalleryImage = { url: string; alt: string };

type Props = {
  title: string;
  cover: { url: string; alt: string };
  images?: GalleryImage[];
};

function buildSlides(
  cover: { url: string; alt: string },
  images: GalleryImage[] | undefined,
  title: string,
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
    [cover, images, title],
  );

  const [index, setIndex] = useState(0);

  const total = slides.length;
  const safe = total ? Math.min(Math.max(0, index), total - 1) : 0;

  const prev = () => setIndex((i) => (i - 1 + total) % total);
  const next = () => setIndex((i) => (i + 1) % total);

  if (total === 0) {
    return (
      <div className="relative w-full overflow-hidden rounded-2xl bg-zinc-200/60 aspect-16/10 dark:bg-zinc-800/40">
        <div className="flex h-full w-full items-center justify-center text-zinc-400 dark:text-zinc-500">
          <span className="text-sm">Sem imagem</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 space-y-3">
      {/* ── Slider principal ── */}
      <div className="relative w-full overflow-hidden rounded-2xl bg-zinc-200/60 aspect-16/10 dark:bg-zinc-800/40">
        {/* Trilha deslizante: w-full garante que translateX(100%) == largura de 1 slide */}
        <div
          className="flex h-full w-full transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${safe * 100}%)` }}
        >
          {slides.map((s, i) => (
            <div
              key={`${s.url}-${i}`}
              className="relative h-full w-full shrink-0"
            >
              <Image
                src={s.url}
                alt={s.alt}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority={i === 0}
              />
            </div>
          ))}
        </div>

        {/* Botões anterior / próximo */}
        {total > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Foto anterior"
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white shadow transition hover:bg-black/70 active:scale-95"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Próxima foto"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white shadow transition hover:bg-black/70 active:scale-95"
            >
              <ChevronRight className="size-5" />
            </button>
          </>
        )}

        {/* Contador */}
        {total > 1 && (
          <div className="absolute bottom-2 right-2 rounded-full bg-black/50 px-2.5 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
            {safe + 1} / {total}
          </div>
        )}
      </div>

      {/* ── Faixa de miniaturas ── */}
      {total > 1 && (
        <div
          className="w-full min-w-0 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-300 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-600"
          role="tablist"
          aria-label="Fotos do imóvel"
        >
          {slides.map((s, i) => (
            <button
              key={`${s.url}-thumb-${i}`}
              type="button"
              role="tab"
              aria-selected={i === safe}
              onClick={() => setIndex(i)}
              className={[
                "relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 border-solid transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                i === safe
                  ? "border-primary opacity-100"
                  : "cursor-pointer border-transparent opacity-70 hover:opacity-100",
              ].join(" ")}
            >
              <Image
                src={s.url}
                alt=""
                fill
                className="object-cover"
                sizes="96px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
