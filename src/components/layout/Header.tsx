"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Filter } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const DEFAULT_LOGO = "/assets/logo/logo2.png";

type HeaderProps = {
  /** URL completa da logo do site (vinda da API / site-config). Quando definida, substitui a logo padrão. */
  logoSrc?: string | null;
};

export default function Header({ logoSrc = null }: HeaderProps) {
  const pathname = usePathname();
  const items = [
    { href: "/imoveis", label: "Imóveis" },
    { href: "/sobre", label: "Sobre nós" },
    { href: "/projetos-exclusivos", label: "Projetos exclusivos" },
    { href: "https://open.spotify.com/show/1BLwMlTNBV1vS6jjLbQWL3", label: "Podcast" },
    { href: "/blog", label: "Blog" },
  ];
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);
  const isMapaPage = pathname?.startsWith("/imoveis/mapa") ?? false;

  return (
    <>
      <header
        className={
          isMapaPage
            ? "2xl:fixed 2xl:inset-x-0 2xl:top-0 z-50 pointer-events-none 2xl:bg-white 2xl:shadow-[0_1px_0_0_rgb(0_0_0/0.06)] dark:2xl:bg-zinc-950"
            : "2xl:fixed 2xl:inset-x-0 2xl:top-0 z-50 pointer-events-none"
        }
      >
        {/* Mobile: filtro no /imoveis/mapa (esquerda) */}
        {usePathname()?.startsWith("/imoveis/mapa") ? (
          <div className="fixed left-4 top-4 z-50 2xl:hidden pointer-events-auto">
            <button
              type="button"
              aria-label="Abrir filtros do mapa"
              onClick={() => {
                try {
                  window.dispatchEvent(new CustomEvent("open-map-filters"));
                } catch {
                  // no-op
                }
              }}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white/80 shadow-md backdrop-blur ring-1 ring-black/5 transition hover:bg-white/90 active:scale-[0.98] dark:border-zinc-800 dark:bg-zinc-900/80 dark:hover:bg-zinc-900"
            >
              <Filter className="h-5 w-5" />
            </button>
          </div>
        ) : null}
        <div className="mx-auto max-w-6xl px-4 py-5 flex items-center justify-center 2xl:justify-start">
          <Link
            href="/"
            className="inline-flex items-center gap-2 pointer-events-auto"
            aria-label="Página inicial"
          >
            {logoSrc ? (
              <img
                src={logoSrc}
                alt="Logo do site"
                width={140}
                height={36}
                className="h-9 w-auto object-contain"
                style={{ maxHeight: 36 }}
              />
            ) : (
              <Image
                src={DEFAULT_LOGO}
                alt="SAX Imóveis"
                width={140}
                height={36}
                priority
              />
            )}
          </Link>
        </div>
      </header>

      {/* Floating menu (desktop/tablet) */}
      <div className="fixed inset-x-0 top-4 z-50 hidden 2xl:flex pointer-events-none">
        <div className="relative mx-auto w-full max-w-6xl flex items-center justify-center px-4">
          <nav className="pointer-events-auto rounded-full border border-zinc-200 bg-white/95 px-2 sm:px-3 py-1 shadow-md backdrop-blur-md ring-1 ring-black/5 dark:border-zinc-800 dark:bg-zinc-900/90 max-w-[95vw] overflow-x-auto">
            <ul className="flex items-center gap-0.5 sm:gap-1">
              {items.map((item) => (
                <li key={item.href}>
                  {item.href.startsWith("http") ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded-full px-2.5 sm:px-3 py-1 text-sm transition text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <Link
                      href={item.href}
                      className={[
                        "block rounded-full px-2.5 sm:px-3 py-1 text-sm transition",
                        isActive(item.href)
                          ? "font-semibold text-teal-500"
                          : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800",
                      ].join(" ")}
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>
          {/* Botão fora do menu, à direita */}
          <Link
            href="/para-proprietarios"
            className="pointer-events-auto absolute right-4 top-1/2 -translate-y-1/2 inline-flex h-8 items-center whitespace-nowrap rounded-full bg-zinc-900 px-3 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Proprietários
          </Link>
        </div>
      </div>

      {/* Mobile hamburger button */}
      <MobileMenu items={items} isActive={isActive} />
    </>
  );
}

function MobileMenu({
  items,
  isActive,
}: {
  items: { href: string; label: string }[];
  isActive: (href: string) => boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="absolute right-4 top-4 z-50 2xl:hidden pointer-events-auto">
        <button
          type="button"
          aria-label="Abrir menu"
          aria-expanded={open}
          onClick={() => setOpen(true)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white/80 shadow-md backdrop-blur ring-1 ring-black/5 transition hover:bg-white/90 active:scale-[0.98] dark:border-zinc-800 dark:bg-zinc-900/80 dark:hover:bg-zinc-900"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            className="fixed inset-0 z-[80] 2xl:hidden"
            aria-modal="true"
            role="dialog"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              className="absolute right-0 top-0 h-full w-80 max-w-[88%] flex flex-col rounded-l-2xl border border-white/30 bg-white/20 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-zinc-800/25"
              initial={{ x: 320 }}
              animate={{ x: 0 }}
              exit={{ x: 320 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/20 text-zinc-900 dark:text-zinc-100">
                <span className="text-sm font-semibold tracking-wide">Menu</span>
                <button
                  type="button"
                  aria-label="Fechar menu"
                  onClick={() => setOpen(false)}
                  className="rounded-md p-2 hover:bg-white/20 active:scale-[0.98]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="px-2 py-2">
                <ul className="space-y-0.5">
                  <li>
                    <Link
                      href="/para-proprietarios"
                      onClick={() => setOpen(false)}
                      className="block rounded-lg px-3 py-2 text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800"
                    >
                      Proprietários
                    </Link>
                  </li>
                  {items.map((item) => (
                    <li key={item.href}>
                      {item.href.startsWith("http") ? (
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setOpen(false)}
                          className={[
                            "block rounded-lg px-3 py-2 text-sm transition",
                            isActive(item.href)
                              ? "font-semibold text-white bg-white/30"
                              : "text-white hover:bg-white/20",
                          ].join(" ")}
                        >
                          {item.label}
                        </a>
                      ) : (
                        <Link
                          href={item.href}
                          onClick={() => setOpen(false)}
                          className={[
                            "block rounded-lg px-3 py-2 text-sm transition",
                            isActive(item.href)
                              ? "font-semibold text-white bg-white/30"
                              : "text-white hover:bg-white/20",
                          ].join(" ")}
                        >
                          {item.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </nav>
              <div className="mt-auto border-t border-white/20 px-4 py-3 text-xs text-white">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-white/40 px-2 py-0.5 text-[10px] font-medium text-zinc-700 backdrop-blur-sm dark:bg-white/10 dark:text-zinc-200">
                    V 1.2
                  </span>
                  <span className="whitespace-nowrap">
                    Desenvolvido por{" "}
                    <a
                      href="https://www.aidabi.com.br/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-black dark:text-black hover:underline"
                    >
                      Aida
                    </a>
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}


