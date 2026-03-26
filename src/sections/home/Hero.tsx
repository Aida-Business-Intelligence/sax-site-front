"use client";

import { motion } from "framer-motion";
import { useEffect, useState, useMemo } from "react";
import Map from "@/components/map/Map";
import { siteMapStyle } from "@/lib/mapbox";
import { getPropertiesFromApiOnly } from "@/services/properties";
import HomeFilter from "@/sections/home/HomeFilter";
import { trackWhatsappClick } from "@/lib/tracking";

/** Globo mobile/tablet: abre neste zoom e não permite afastar mais que isso (América do Sul em destaque). */
const HERO_MOBILE_GLOBE_ZOOM = 2.4;

const DEFAULT_HERO = {
  title: "Imóveis selecionados para um estilo de vida premium",
  subtitle:
    "Descubra oportunidades únicas nas melhores regiões, com atendimento consultivo e foco em geração de valor.",
  titleDisplay: "twoLines" as const,
  titleFontSize: "large" as const,
  buttonText: "Falar com especialista",
  buttonLinkType: "whatsapp" as const,
  buttonLink: "5547997324596",
  showMap: true,
};

type HeroContent = {
  title?: string;
  subtitle?: string;
  titleDisplay?: "oneLine" | "twoLines";
  titleFontSize?: "small" | "medium" | "large";
  buttonText?: string;
  buttonLinkType?: "whatsapp" | "url";
  buttonLink?: string;
  showMap?: boolean;
};

function normalizeHero(raw: HeroContent | null | undefined): Required<HeroContent> {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_HERO };
  return {
    title: typeof raw.title === "string" ? raw.title : DEFAULT_HERO.title,
    subtitle: typeof raw.subtitle === "string" ? raw.subtitle : DEFAULT_HERO.subtitle,
    titleDisplay:
      raw.titleDisplay === "oneLine" || raw.titleDisplay === "twoLines"
        ? raw.titleDisplay
        : DEFAULT_HERO.titleDisplay,
    titleFontSize: ["small", "medium", "large"].includes(raw.titleFontSize ?? "")
      ? (raw.titleFontSize as "small" | "medium" | "large")
      : DEFAULT_HERO.titleFontSize,
    buttonText: typeof raw.buttonText === "string" ? raw.buttonText : DEFAULT_HERO.buttonText,
    buttonLinkType:
      raw.buttonLinkType === "whatsapp" || raw.buttonLinkType === "url"
        ? raw.buttonLinkType
        : DEFAULT_HERO.buttonLinkType,
    buttonLink: typeof raw.buttonLink === "string" ? raw.buttonLink : DEFAULT_HERO.buttonLink,
    showMap: typeof raw.showMap === "boolean" ? raw.showMap : DEFAULT_HERO.showMap,
  };
}

function buildButtonHref(linkType: string, link: string): string {
  if (linkType === "whatsapp") {
    const digits = (link || "").replace(/\D/g, "");
    return digits ? `https://wa.me/${digits}` : "#";
  }
  return link && link.startsWith("http") ? link : (link ? `https://${link}` : "#");
}

const titleFontSizeClasses = {
  small: "text-2xl font-semibold tracking-tight sm:text-3xl",
  medium: "text-3xl font-semibold tracking-tight sm:text-4xl",
  large: "text-3xl font-semibold tracking-tight sm:text-5xl",
};

type HeroProps = {
  heroContent?: HeroContent | Record<string, unknown> | null;
};

export default function Hero({ heroContent = null }: HeroProps) {
  const hero = useMemo(() => normalizeHero(heroContent as HeroContent), [heroContent]);

  const [markers, setMarkers] = useState<
    { id: string; lng: number; lat: number }[]
  >([]);

  useEffect(() => {
    let mounted = true;
    getPropertiesFromApiOnly().then((props) => {
      if (!mounted) return;
      const pts =
        props
          ?.map((p) => {
            const lat = Number(p.address?.lat);
            const lng = Number(p.address?.lng);
            if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
            return { id: p.id, lng, lat };
          })
          .filter((m): m is { id: string; lng: number; lat: number } => m != null) ??
        [];
      setMarkers(pts);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const titleClass = [
    titleFontSizeClasses[hero.titleFontSize],
    hero.titleDisplay === "oneLine" ? "whitespace-nowrap" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const buttonHref = buildButtonHref(hero.buttonLinkType, hero.buttonLink);

  return (
    <section className="relative mx-auto flex min-h-[calc(100vh-220px)] max-w-7xl flex-col overflow-visible px-4 pt-12 sm:min-h-[calc(100vh-180px)] sm:px-6 sm:pt-16 2xl:block 2xl:min-h-[calc(100vh-176px)] 2xl:pt-48">
      <div className="grid gap-8 2xl:grid-cols-2 2xl:items-center">
        <div className="space-y-6 relative z-10 hidden 2xl:block">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className={titleClass}
          >
            {hero.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="max-w-xl text-lg text-zinc-600 dark:text-zinc-400"
          >
            {hero.subtitle}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex gap-3"
          >
            <a
              href={buttonHref}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
              onClick={() => hero.buttonLinkType === "whatsapp" && trackWhatsappClick({ source: "hero" })}
            >
              {hero.buttonText}
            </a>
          </motion.div>
        </div>
        {/* Espaçador para manter o layout do grid; o globo fica absoluto sobre o canto direito */}
        <div className="hidden 2xl:block" aria-hidden="true" />
      </div>

      {/* Mapa (mobile/tablet): globo “solto” no fundo da página — sombra suave, sem anel escuro (como referência visual) */}
      {hero.showMap && (
        <div className="2xl:hidden flex min-h-0 flex-1 basis-0 flex-col items-center justify-center py-3 sm:py-4 -translate-y-8 sm:-translate-y-10 md:landscape:-translate-y-12">
          <div className="flex w-screen max-w-none justify-center ml-[calc(50%-50vw)]">
            <div className="relative aspect-square w-[min(calc((100vw-2rem)*0.88),calc((100vh-110px)*0.88))] max-w-none overflow-hidden rounded-full bg-background shadow-[0_20px_60px_-12px_rgba(15,23,42,0.2),0_8px_28px_-6px_rgba(15,23,42,0.12)] ring-1 ring-black/5 md:landscape:w-[min(calc((100vw-2rem)*0.62),calc((100vh-168px)*0.62))] dark:shadow-[0_24px_64px_-12px_rgba(0,0,0,0.55)] dark:ring-white/10">
              <Map
                center={{ lng: -56, lat: -15 }}
                zoom={HERO_MOBILE_GLOBE_ZOOM}
                minZoom={HERO_MOBILE_GLOBE_ZOOM}
                pitch={0}
                bearing={0}
                styleUrl={siteMapStyle}
                projectionGlobe
                globeAtmosphere="neutral"
                markers={markers}
                markerStyle="neon-blue"
                show3DBuildings
                autoRotate
                autoRotateSpeedDegPerSec={1.0}
                showControls={false}
                className="h-full w-full"
              />
            </div>
          </div>
        </div>
      )}

      {/* Mapa interativo dentro do círculo (desktop) */}
      {hero.showMap && (
        <div className="pointer-events-auto absolute right-0 hidden pr-4 2xl:block z-0 top-24 2xl:top-36">
          <div className="pointer-events-auto relative 2xl:h-[520px] 2xl:w-[520px] min-[1700px]:h-[560px] min-[1700px]:w-[560px] overflow-hidden rounded-full border border-zinc-900/60 shadow-[0_30px_120px_rgba(0,0,0,0.35)]">
            <Map
              center={{ lng: -56, lat: -15 }}
              zoom={2.1}
              minZoom={2.1}
              pitch={0}
              bearing={0}
              styleUrl={siteMapStyle}
              projectionGlobe
              markers={markers}
              markerStyle="neon-blue"
              show3DBuildings
              autoRotate
              autoRotateSpeedDegPerSec={1.0}
              className="h-full w-full"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-full"
              style={{
                background:
                  "radial-gradient(closest-side, rgba(0,0,0,0) 62%, rgba(0,0,0,0.36) 100%)",
              }}
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-full"
              style={{
                background:
                  "radial-gradient(circle at 28% 22%, rgba(255,255,255,0.12), rgba(255,255,255,0) 42%)",
                mixBlendMode: "screen",
              }}
            />
          </div>
        </div>
      )}

      {/* Filtro (desktop/tablet fixo próximo à base) */}
      <div className="hidden 2xl:flex absolute inset-x-0 bottom-40 sm:bottom-32 2xl:bottom-40 justify-center px-4 sm:px-6 z-50">
        <div className="w-full max-w-7xl relative z-50">
          <HomeFilter />
        </div>
      </div>

      {/* Filtro (mobile: no fluxo, abaixo do conteúdo) */}
      <div className="2xl:hidden mt-0 shrink-0">
        <HomeFilter />
      </div>
    </section>
  );
}
