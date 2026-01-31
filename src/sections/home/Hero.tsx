"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import Map from "@/components/map/Map";
import { getProperties } from "@/services/properties";
import HomeFilter from "@/sections/home/HomeFilter";

export default function Hero() {
  const [markers, setMarkers] = useState<
    { id: string; lng: number; lat: number }[]
  >([]);

  useEffect(() => {
    let mounted = true;
    getProperties().then((props) => {
      if (!mounted) return;
      const pts =
        props
          .filter(
            (p) =>
              typeof p.address.lat === "number" &&
              typeof p.address.lng === "number"
          )
          .map((p) => ({
            id: p.id,
            lng: p.address.lng as number,
            lat: p.address.lat as number,
          })) ?? [];
      setMarkers(pts);
    });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="relative mx-auto max-w-7xl px-4 pt-36 sm:px-6 sm:pt-48 min-h-[calc(100vh-184px)] sm:min-h-[calc(100vh-180px)] lg:min-h-[calc(100vh-176px)] overflow-visible">
      <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
        <div className="space-y-6 relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-semibold tracking-tight sm:text-5xl"
          >
            Imóveis selecionados para um estilo de vida premium
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="max-w-xl text-lg text-zinc-600 dark:text-zinc-400"
          >
            Descubra oportunidades únicas nas melhores regiões, com atendimento
            consultivo e foco em geração de valor.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex gap-3"
          >
            <a
              href="https://wa.me/5547997324596"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
            >
              Falar com especialista
            </a>
          </motion.div>
        </div>
        {/* Espaçador para manter o layout do grid; o globo fica absoluto sobre o canto direito */}
        <div className="hidden lg:block" aria-hidden="true" />
      </div>

      {/* Mapa interativo dentro do círculo (mesma config de /imoveis/mapa) */}
      <div className="pointer-events-auto absolute right-0 hidden pr-4 md:block z-0 top-24 md:top-28 lg:top-32 xl:top-36">
        <div className="pointer-events-auto relative h-[520px] w-[520px] overflow-hidden rounded-full border border-zinc-900/60">
          <Map
            center={{ lng: -56, lat: -15 }}
            zoom={2.1}
            minZoom={2.1}
            pitch={0}
            bearing={0}
            styleUrl="mapbox://styles/mapbox/dark-v11"
            projectionGlobe
            markers={markers}
            markerStyle="teal-glow"
            className="h-full w-full"
          />
        </div>
      </div>

      {/* Filtro (mesmo de /imoveis) dentro do Hero, alinhado próximo à base */}
      <div className="absolute inset-x-0 bottom-28 sm:bottom-24 md:bottom-28 flex justify-center px-4 sm:px-6 z-50">
        <div className="w-full max-w-7xl relative z-50">
          <HomeFilter />
        </div>
      </div>
    </section>
  );
}
