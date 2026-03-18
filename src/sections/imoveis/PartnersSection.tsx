"use client";

import { getSaxApiBase } from "@/lib/sax-api";

type PartnerLogoItem = { url: string; name?: string };

type PartnersSectionProps = {
  partnerLogos?: PartnerLogoItem[];
};

function fullUrl(url: string): string {
  const s = (url || "").trim();
  if (!s) return "";
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  const base = getSaxApiBase();
  return base ? `${base}${s.startsWith("/") ? s : `/${s}`}` : s;
}

export default function PartnersSection({ partnerLogos = [] }: PartnersSectionProps) {
  const list = Array.isArray(partnerLogos) ? partnerLogos : [];
  const line = list.length > 0 ? [...list, ...list] : [];

  if (line.length === 0) {
    return null;
  }

  return (
    <section className="py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center">
          <h2 className="text-2xl font-semibold tracking-tight">
            Nossos <span className="text-[#19F5CC]">Parceiros</span>
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Trabalhamos com as principais construtoras e incorporadoras do mercado
          </p>
        </div>

        <div className="logo-rail relative mt-8 overflow-hidden">
          <div className="logo-track flex items-center gap-16 will-change-transform">
            {line.map((item, i) => {
              const src = fullUrl(item.url);
              const alt = item.name || "Parceiro";
              if (!src) return null;
              return (
                <div key={`${item.url}-${i}`} className="shrink-0">
                  <img
                    src={src}
                    alt={alt}
                    width={220}
                    height={80}
                    className="h-12 w-auto object-contain grayscale opacity-70 transition hover:grayscale-0 hover:opacity-100"
                  />
                </div>
              );
            })}
          </div>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white to-transparent dark:from-zinc-950" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white to-transparent dark:from-zinc-950" />
        </div>
      </div>
    </section>
  );
}
