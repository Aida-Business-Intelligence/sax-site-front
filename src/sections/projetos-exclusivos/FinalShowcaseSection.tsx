"use client";

import Image from "next/image";
import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import type { ExclusiveProjectsContent } from "@/lib/exclusive-projects-content";
import { resolveExclusiveProjectImageUrl } from "@/lib/exclusive-projects-content";

type Props = {
  showcase: ExclusiveProjectsContent["showcase"];
};

export function FinalShowcaseSection({ showcase }: Props) {
  const [index, setIndex] = React.useState(0);
  const galleryUrls = showcase.galleryUrls.map((u) =>
    resolveExclusiveProjectImageUrl(u),
  );
  const total = Math.max(galleryUrls.length, 1);

  const prev = () => setIndex((i) => (i - 1 + total) % total);
  const next = () => setIndex((i) => (i + 1) % total);
  const goTo = (i: number) => setIndex(i);

  return (
    <section className="mt-14">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <div className="text-xs uppercase tracking-wide text-zinc-500">
            {showcase.kicker}
          </div>
          <h2 className="mt-1 text-3xl font-semibold tracking-tight">
            {showcase.title}
          </h2>
          <p className="mt-2 max-w-lg text-sm text-zinc-600 dark:text-zinc-300">
            {showcase.subtitle}
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            {showcase.bullets.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-[2px] text-[#19F5CC]">●</span>
                <span className="text-zinc-700 dark:text-zinc-300">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border">
            <div
              className="flex h-full w-full transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${index * 100}%)` }}
            >
              {galleryUrls.map((src, i) => (
                <div
                  key={`${src}-${i}`}
                  className="relative h-full w-full flex-shrink-0"
                >
                  <Image
                    src={src}
                    alt={`Projeto ${i + 1}`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                    priority={i === 0}
                  />
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={prev}
              aria-label="Anterior"
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white shadow transition hover:bg-black/70 active:scale-95"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Próximo"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white shadow transition hover:bg-black/70 active:scale-95"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>

          <div className="mt-3 flex gap-3 overflow-x-auto">
            {galleryUrls.map((src, i) => (
              <button
                key={`${src}-thumb-${i}`}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Ir para imagem ${i + 1}`}
                className={`relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg border ${
                  i === index ? "ring-2 ring-[#19F5CC]" : ""
                }`}
              >
                <Image
                  src={src}
                  alt={`Thumb ${i + 1}`}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
