import React from "react";
import Link from "next/link";
import { Star, ChevronDown, Facebook, Instagram, Youtube, Music2 } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="fixed bottom-0 inset-x-0 z-50 w-full border-t border-zinc-800 bg-zinc-900/95 text-zinc-200 backdrop-blur">
      <div className="w-full px-4 py-2 sm:px-6">
        <div className="flex flex-wrap items-center justify-center md:justify-between gap-3 text-xs sm:text-sm">
          {/* Left: Registry and location */}
          <div className="w-full md:w-auto text-center md:text-left whitespace-nowrap md:whitespace-normal break-words">
            CRECI: 7587J — Riviera Business Mall - Praia Brava / Itajaí
          </div>

          {/* Center: actions */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/favoritos"
              className="inline-flex items-center gap-2 hover:text-white"
            >
              <Star className="h-4 w-4" />
              <span>imóveis favoritos</span>
            </Link>
            <div className="inline-flex items-center gap-1 hover:text-white cursor-default">
              <span>encontre rápido</span>
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>

          {/* Right: social (desktop) */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="#"
              aria-label="Facebook"
              className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-zinc-800 hover:bg-zinc-700"
            >
              <Facebook className="h-4 w-4" />
            </a>
            <a
              href="#"
              aria-label="Instagram"
              className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-zinc-800 hover:bg-zinc-700"
            >
              <Instagram className="h-4 w-4" />
            </a>
            <a
              href="#"
              aria-label="YouTube"
              className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-zinc-800 hover:bg-zinc-700"
            >
              <Youtube className="h-4 w-4" />
            </a>
            <a
              href="#"
              aria-label="TikTok"
              className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-zinc-800 hover:bg-zinc-700"
            >
              <Music2 className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Mobile: social icons */}
        <div className="mt-2 flex items-center justify-center gap-3 md:hidden">
          <a
            href="#"
            aria-label="Facebook"
            className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-zinc-800 hover:bg-zinc-700"
          >
            <Facebook className="h-4 w-4" />
          </a>
          <a
            href="#"
            aria-label="Instagram"
            className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-zinc-800 hover:bg-zinc-700"
          >
            <Instagram className="h-4 w-4" />
          </a>
          <a
            href="#"
            aria-label="YouTube"
            className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-zinc-800 hover:bg-zinc-700"
          >
            <Youtube className="h-4 w-4" />
          </a>
          <a
            href="#"
            aria-label="TikTok"
            className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-zinc-800 hover:bg-zinc-700"
          >
            <Music2 className="h-4 w-4" />
          </a>
        </div>
        <div className="mt-1 text-[11px] text-zinc-500">
          © {year} SAX Imóveis. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
