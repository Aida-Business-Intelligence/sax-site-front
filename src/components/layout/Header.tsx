 "use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
        <div className="mx-auto max-w-6xl px-4 py-3">
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

      {/* Floating menu */}
      <div className="fixed inset-x-0 top-4 z-50 flex justify-center pointer-events-none">
        <nav className="pointer-events-auto rounded-full border border-zinc-200 bg-white/95 px-3 py-1 shadow-md backdrop-blur-md ring-1 ring-black/5 dark:border-zinc-800 dark:bg-zinc-900/90">
          <ul className="flex items-center gap-1">
            {items.map((item) => (
              <li key={item.href}>
                {item.href.startsWith("http") ? (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-full px-3 py-1 text-sm transition text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link
                    href={item.href}
                    className={[
                      "block rounded-full px-3 py-1 text-sm transition",
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
    </>
  );
}


