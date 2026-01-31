"use client";

import Image from "next/image";
import React, { useMemo, useRef, useState, useEffect } from "react";

type Media = {
  url: string;
  alt: string;
  width?: number;
  height?: number;
};

type Props = {
  images: Media[];
};

export default function HeroCarousel({ images }: Props) {
  const slides = useMemo(() => images.filter(Boolean), [images]);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const onScroll = () => {
      const w = el.clientWidth;
      const i = Math.round(el.scrollLeft / w);
      setIndex(i);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const go = (i: number) => {
    const el = trackRef.current;
    if (!el) return;
    const w = el.clientWidth;
    el.scrollTo({ left: i * w, behavior: "smooth" });
  };

  const prev = () => go(Math.max(0, index - 1));
  const next = () => go(Math.min(slides.length - 1, index + 1));

  if (slides.length === 0) return null;

  return (
    <div className="relative w-full">
      <div
        ref={trackRef}
        className="relative flex w-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden scrollbar-none"
        style={{ scrollBehavior: "smooth" }}
      >
        {slides.map((img, i) => (
          <div
            key={i}
            className="relative h-[min(82vh,900px)] w-full shrink-0 snap-center"
            style={{ aspectRatio: "16/9" }}
          >
            <Image
              src={img.url}
              alt={img.alt}
              fill
              className="object-cover"
              sizes="100vw"
              priority={i === 0}
            />
          </div>
        ))}
      </div>
      {/* Controls */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-3">
        <button
          type="button"
          onClick={prev}
          className="pointer-events-auto hidden h-10 w-10 items-center justify-center rounded-full bg-white/80 text-zinc-900 backdrop-blur hover:bg-white md:flex"
          aria-label="Imagem anterior"
        >
          ‹
        </button>
        <button
          type="button"
          onClick={next}
          className="pointer-events-auto hidden h-10 w-10 items-center justify-center rounded-full bg-white/80 text-zinc-900 backdrop-blur hover:bg-white md:flex"
          aria-label="Próxima imagem"
        >
          ›
        </button>
      </div>
      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/30 px-2 py-1 backdrop-blur">
        <div className="flex items-center gap-1">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => go(i)}
              className={`h-1.5 w-4 rounded-full transition ${
                i === index ? "bg-white" : "bg-white/50 hover:bg-white/70"
              }`}
              aria-label={`Ir para imagem ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}


