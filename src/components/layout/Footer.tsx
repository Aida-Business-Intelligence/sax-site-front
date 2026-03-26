import React from "react";
import Link from "next/link";
import { Star, ChevronDown, Facebook, Instagram, Youtube, Music2 } from "lucide-react";

type FooterContent = {
  creciLocation?: string;
  copyrightText?: string;
  favoritosHref?: string;
  favoritosLabel?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  youtubeUrl?: string;
  tiktokUrl?: string;
};

const DEFAULT: FooterContent = {
  creciLocation: "CRECI: 7587J — Riviera Business Mall - Praia Brava / Itajaí",
  copyrightText: "SAX Imóveis. Todos os direitos reservados.",
  favoritosHref: "/favoritos",
  favoritosLabel: "imóveis favoritos",
  facebookUrl: "",
  instagramUrl: "",
  youtubeUrl: "",
  tiktokUrl: "",
};

function str(v: unknown, fallback: string): string {
  return typeof v === "string" && v.trim() !== "" ? v.trim() : fallback;
}

export default function Footer({
  footerContent = null,
}: {
  footerContent?: Record<string, unknown> | null;
}) {
  const year = new Date().getFullYear();
  const c = footerContent && typeof footerContent === "object" ? (footerContent as FooterContent) : null;
  const creciLocation = str(c?.creciLocation, DEFAULT.creciLocation!);
  const copyrightText = str(c?.copyrightText, DEFAULT.copyrightText!);
  const favoritosHref = str(c?.favoritosHref, DEFAULT.favoritosHref!);
  const favoritosLabel = str(c?.favoritosLabel, DEFAULT.favoritosLabel!);
  const facebookUrl = typeof c?.facebookUrl === "string" ? c.facebookUrl.trim() : DEFAULT.facebookUrl;
  const instagramUrl = typeof c?.instagramUrl === "string" ? c.instagramUrl.trim() : DEFAULT.instagramUrl;
  const youtubeUrl = typeof c?.youtubeUrl === "string" ? c.youtubeUrl.trim() : DEFAULT.youtubeUrl;
  const tiktokUrl = typeof c?.tiktokUrl === "string" ? c.tiktokUrl.trim() : DEFAULT.tiktokUrl;

  const social = [
    { url: facebookUrl, label: "Facebook", Icon: Facebook },
    { url: instagramUrl, label: "Instagram", Icon: Instagram },
    { url: youtubeUrl, label: "YouTube", Icon: Youtube },
    { url: tiktokUrl, label: "TikTok", Icon: Music2 },
  ];

  return (
    <footer className="fixed bottom-0 inset-x-0 z-50 w-full border-t border-zinc-800 bg-zinc-900/95 text-zinc-200 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6">
        <div className="flex flex-wrap items-center justify-center 2xl:justify-between gap-3 text-xs sm:text-sm">
          {/* Left: Registry and location */}
          <div className="w-full 2xl:w-auto text-center 2xl:text-left whitespace-nowrap 2xl:whitespace-normal break-words">
            {creciLocation}
          </div>

          {/* Center: actions */}
          <div className="hidden 2xl:flex items-center gap-6">
            {favoritosHref.startsWith("http") ? (
              <a
                href={favoritosHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 hover:text-white"
              >
                <Star className="h-4 w-4" />
                <span>{favoritosLabel}</span>
              </a>
            ) : (
              <Link
                href={favoritosHref}
                className="inline-flex items-center gap-2 hover:text-white"
              >
                <Star className="h-4 w-4" />
                <span>{favoritosLabel}</span>
              </Link>
            )}
            <div className="inline-flex items-center gap-1 hover:text-white cursor-default">
              <span>encontre rápido</span>
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>

          {/* Right: social (desktop) */}
          <div className="hidden 2xl:flex items-center gap-3">
            {social.map(({ url, label, Icon }) => (
              <a
                key={label}
                href={url || "#"}
                aria-label={label}
                className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-zinc-800 hover:bg-zinc-700"
                {...(url && url !== "#" ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        {/* Mobile: social icons */}
        <div className="mt-2 flex items-center justify-center gap-3 2xl:hidden">
          {social.map(({ url, label, Icon }) => (
            <a
              key={label}
              href={url || "#"}
              aria-label={label}
              className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-zinc-800 hover:bg-zinc-700"
              {...(url && url !== "#" ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            >
              <Icon className="h-4 w-4" />
            </a>
          ))}
        </div>
        <div className="mt-1 text-[11px] text-zinc-500">
          © {year} {copyrightText}
        </div>
      </div>
    </footer>
  );
}
