"use client";

import React, { useState, useEffect } from "react";
import type { Property } from "@/types/realEstate";
import FeaturedBanner from "./FeaturedBanner";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  properties: Property[];
};

export default function FeaturedCarousel({ properties }: Props) {
  const [index, setIndex] = useState(0);

  const n = properties.length;
  const current = properties[index] ?? null;

  useEffect(() => {
    if (n <= 1) return;
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % n);
    }, 6000);
    return () => clearInterval(t);
  }, [n]);

  if (n === 0) return null;

  if (n === 1) {
    return <FeaturedBanner property={properties[0]} />;
  }

  return (
    <section className="relative mb-12">
      <div className="relative">
        <FeaturedBanner property={current} />
        <div className="absolute left-0 right-0 top-1/2 z-10 flex -translate-y-1/2 justify-between px-2 md:px-4">
          <button
            type="button"
            onClick={() => setIndex((i) => (i - 1 + n) % n)}
            className="rounded-full bg-white/90 p-2 shadow-md transition hover:bg-white dark:bg-zinc-800/90 dark:hover:bg-zinc-800"
            aria-label="Anterior"
          >
            <ChevronLeft className="size-6 text-zinc-700 dark:text-zinc-200" />
          </button>
          <button
            type="button"
            onClick={() => setIndex((i) => (i + 1) % n)}
            className="rounded-full bg-white/90 p-2 shadow-md transition hover:bg-white dark:bg-zinc-800/90 dark:hover:bg-zinc-800"
            aria-label="Próximo"
          >
            <ChevronRight className="size-6 text-zinc-700 dark:text-zinc-200" />
          </button>
        </div>
      </div>
      <div className="mt-4 flex justify-center gap-2">
        {properties.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIndex(i)}
            className={`h-2 rounded-full transition-all ${
              i === index
                ? "w-6 bg-zinc-900 dark:bg-white"
                : "w-2 bg-zinc-300 dark:bg-zinc-600"
            }`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
