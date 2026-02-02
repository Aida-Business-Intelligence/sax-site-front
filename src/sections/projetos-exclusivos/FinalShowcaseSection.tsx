'use client';

import Image from "next/image";
import React from "react";

const galleryImages: string[] = [
  "/assets/images/home/bc1.png",
  "/assets/images/home/bc1.png",
  "/assets/images/home/bc1.png",
  "/assets/images/home/bc1.png",
  "/assets/images/home/bc1.png",
  "/assets/images/home/bc1.png",
];

export function FinalShowcaseSection() {
  const [index, setIndex] = React.useState(0);
  const total = galleryImages.length;

  const prev = () => setIndex((i) => (i - 1 + total) % total);
  const next = () => setIndex((i) => (i + 1) % total);
  const goTo = (i: number) => setIndex(i);

  return (
    <section className="mt-14">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <div className="text-xs uppercase tracking-wide text-zinc-500">
            Final
          </div>
          <h2 className="mt-1 text-3xl font-semibold tracking-tight">
            JUST GO IN!
          </h2>
          <p className="mt-2 max-w-lg text-sm text-zinc-600 dark:text-zinc-300">
            Resultado final e entrega das chaves.
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            {[
              "Forros de gesso",
              "Pinturas e texturas",
              "Móveis planejados",
              "Assentamento de revestimentos e pisos",
              "Mármores e granitos",
              "Iluminação",
              "Mobiliários móveis e decoração",
              "Eletrodomésticos",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-[2px] text-[#19F5CC]">●</span>
                <span className="text-zinc-700 dark:text-zinc-300">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border">
            {/* Track */}
            <div
              className="flex h-full w-full transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${index * 100}%)` }}
            >
              {galleryImages.map((src, i) => (
                <div key={`${src}-${i}`} className="relative h-full w-full flex-shrink-0">
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

            {/* Arrows */}
            <button
              onClick={prev}
              aria-label="Anterior"
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-[#19F5CC] p-2 text-black shadow hover:opacity-90"
            >
              ‹
            </button>
            <button
              onClick={next}
              aria-label="Próximo"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-[#19F5CC] p-2 text-black shadow hover:opacity-90"
            >
              ›
            </button>
          </div>

          {/* Thumbnails */}
          <div className="mt-3 flex gap-3 overflow-x-auto">
            {galleryImages.map((src, i) => (
              <button
                key={`${src}-thumb-${i}`}
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


