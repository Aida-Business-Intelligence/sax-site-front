"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function Header() {
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

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 pointer-events-none">
        <div className="mx-auto max-w-6xl px-4 py-5 flex items-center justify-center md:justify-start">
          <Link
            href="/"
            className="inline-flex items-center gap-2 pointer-events-auto"
            aria-label="Página inicial"
          >
            <Image
              src="/assets/logo/logo2.png"
              alt="SAX Imóveis"
              width={140}
              height={36}
              priority
            />
          </Link>
        </div>
      </header>

      {/* Floating menu (desktop/tablet) */}
      <div className="fixed inset-x-0 top-4 z-50 hidden md:flex justify-center pointer-events-none">
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
      <div className="fixed right-4 top-4 z-50 md:hidden pointer-events-auto">
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
            className="fixed inset-0 z-[80] md:hidden"
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
              className="absolute right-0 top-0 h-full w-72 max-w-[85%] bg-white shadow-xl dark:bg-zinc-900"
              initial={{ x: 320 }}
              animate={{ x: 0 }}
              exit={{ x: 320 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
                <span className="text-sm font-medium">Menu</span>
                <button
                  type="button"
                  aria-label="Fechar menu"
                  onClick={() => setOpen(false)}
                  className="rounded-md p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="px-2 py-2">
                <ul className="space-y-1">
                  {items.map((item) => (
                    <li key={item.href}>
                      {item.href.startsWith("http") ? (
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setOpen(false)}
                          className={[
                            "block rounded-md px-3 py-2 text-sm",
                            isActive(item.href) ? "font-semibold text-teal-600" : "text-zinc-700 dark:text-zinc-300",
                          ].join(" ")}
                        >
                          {item.label}
                        </a>
                      ) : (
                        <Link
                          href={item.href}
                          onClick={() => setOpen(false)}
                          className={[
                            "block rounded-md px-3 py-2 text-sm",
                            isActive(item.href) ? "font-semibold text-teal-600" : "text-zinc-700 dark:text-zinc-300",
                          ].join(" ")}
                        >
                          {item.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </nav>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}


