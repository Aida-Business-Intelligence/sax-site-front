"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Bath, Bed, Car, Ruler, X } from "lucide-react";
import { getPropertyBySlug } from "@/services/properties";
import type { Media, Property } from "@/types/realEstate";

type Props = {
  open: boolean;
  property: Property | null;
  onOpenChange?: (open: boolean) => void;
};

const TYPE_LABEL: Record<Property["type"], string> = {
  casa: "Casa",
  casa_condominio: "Casa Condomínio",
  apartamento: "Apartamento",
  duplex: "Duplex",
  master: "Master",
  flat: "Flat",
  cobertura: "Cobertura",
  terraco: "Terraço",
  terreno: "Terreno",
  sala: "Sala",
  galpao: "Galpão",
  kitnet: "Kitnet",
  studio: "Studio",
  comercial: "Comercial",
};

function hasValidImageUrl(m?: Media | null): boolean {
  return typeof m?.url === "string" && m.url.trim() !== "";
}

function galleryList(p: Property): Media[] {
  const seen = new Set<string>();
  const out: Media[] = [];
  const push = (m: Media | undefined) => {
    if (!hasValidImageUrl(m)) return;
    const u = m!.url.trim();
    if (seen.has(u)) return;
    seen.add(u);
    out.push({ ...m!, url: u, alt: m!.alt || "" });
  };
  push(p.coverImage);
  (p.images ?? []).forEach(push);
  return out;
}

function formatMoney(n: number | null | undefined): string | null {
  if (n == null || !Number.isFinite(n) || n <= 0) return null;
  return n.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}

export default function PropertyDialog({
  open,
  property,
  onOpenChange,
}: Props) {
  const [detail, setDetail] = useState<Property | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !property) {
      setDetail(null);
      setLoading(false);
      return;
    }
    setDetail(property);
    let cancelled = false;
    setLoading(true);
    getPropertyBySlug(property.slug).then((full) => {
      if (cancelled) return;
      if (full) setDetail(full);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [open, property]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange?.(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  const p = detail;
  const photos = useMemo(() => (p ? galleryList(p) : []), [p]);

  if (!open || !p) return null;

  const mainPrice = formatMoney(p.price);
  const venda = formatMoney(p.priceVenda ?? null);
  const aluguel = formatMoney(p.priceAluguel ?? null);
  const cf = formatMoney(p.priceCrowdfunding ?? null);

  const addrParts = [
    [p.address.street, p.address.number].filter(Boolean).join(", "),
    p.address.neighborhood,
    `${p.address.city} - ${p.address.state}`,
  ].filter((s) => s && String(s).trim() !== "");

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="property-dialog-title"
      className="fixed inset-0 z-[80] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      onClick={() => onOpenChange?.(false)}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950 sm:max-h-[90vh] sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800 sm:px-5">
          <div className="min-w-0 flex-1">
            {p.ref ? (
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Ref. {p.ref}
              </p>
            ) : null}
            <h2
              id="property-dialog-title"
              className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-white"
            >
              {p.title}
            </h2>
          </div>
          <button
            type="button"
            className="grid size-9 shrink-0 place-items-center rounded-full text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white"
            aria-label="Fechar"
            onClick={() => onOpenChange?.(false)}
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {loading && photos.length === 0 ? (
            <div className="flex h-40 items-center justify-center text-sm text-zinc-500">
              Carregando…
            </div>
          ) : null}

          {photos.length > 0 ? (
            <div className="border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 py-3 sm:px-5">
                {photos.map((img, i) => (
                  <div
                    key={`${img.url}-${i}`}
                    className="relative aspect-[16/10] w-[min(100%,420px)] shrink-0 snap-center overflow-hidden rounded-xl bg-zinc-200 dark:bg-zinc-800"
                  >
                    {img.url.startsWith("/") ? (
                      <Image
                        src={img.url}
                        alt={img.alt || p.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 90vw, 420px"
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={img.url}
                        alt={img.alt || p.title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : !loading ? (
            <div className="flex h-36 items-center justify-center border-b border-zinc-200 bg-zinc-100 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900">
              Sem fotos cadastradas
            </div>
          ) : null}

          <div className="space-y-4 px-4 py-4 sm:px-5">
            <div className="flex flex-wrap gap-2 text-sm font-semibold text-zinc-900 dark:text-white">
              {venda ? (
                <span className="rounded-full bg-zinc-900 px-3 py-1 text-white dark:bg-white dark:text-zinc-900">
                  Venda {venda}
                </span>
              ) : null}
              {aluguel ? (
                <span className="rounded-full border border-zinc-300 px-3 py-1 dark:border-zinc-600">
                  Locação {aluguel}
                </span>
              ) : null}
              {cf ? (
                <span className="rounded-full border border-zinc-300 px-3 py-1 dark:border-zinc-600">
                  Crowdfunding {cf}
                </span>
              ) : null}
              {!venda && !aluguel && !cf && mainPrice ? (
                <span className="rounded-full bg-zinc-900 px-3 py-1 text-white dark:bg-white dark:text-zinc-900">
                  {mainPrice}
                </span>
              ) : null}
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Localização
              </p>
              <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
                {addrParts.join(" · ")}
              </p>
            </div>

            <ul className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              <li className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                <Ruler className="size-4 shrink-0 text-zinc-400" />
                <span>{p.area} m²</span>
              </li>
              <li className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                <Bed className="size-4 shrink-0 text-zinc-400" />
                <span>{p.bedrooms} quartos</span>
              </li>
              <li className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                <Bath className="size-4 shrink-0 text-zinc-400" />
                <span>{p.bathrooms} banheiros</span>
              </li>
              {p.garage != null && p.garage > 0 ? (
                <li className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                  <Car className="size-4 shrink-0 text-zinc-400" />
                  <span>{p.garage} vagas</span>
                </li>
              ) : null}
            </ul>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Tipo
              </p>
              <p className="mt-1 text-sm text-zinc-800 dark:text-zinc-200">
                {TYPE_LABEL[p.type] ?? p.type}
                {p.builder ? ` · ${p.builder}` : ""}
              </p>
            </div>

            {p.description?.trim() ? (
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Descrição
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                  {p.description.trim()}
                </p>
              </div>
            ) : null}

            {(p.comodidades?.length ?? 0) > 0 ? (
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Comodidades
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {p.comodidades!.map((c) => (
                    <span
                      key={c}
                      className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {(p.tagImovel?.length ?? 0) > 0 ? (
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Tags
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {p.tagImovel!.map((t) => (
                    <span
                      key={t}
                      className="rounded-md bg-zinc-900 px-2 py-0.5 text-xs text-white dark:bg-zinc-200 dark:text-zinc-900"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="shrink-0 border-t border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/80 sm:px-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              className="rounded-full border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-800 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
              onClick={() => onOpenChange?.(false)}
            >
              Fechar
            </button>
            <Link
              href={`/imovel/${p.slug}`}
              className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-4 py-2.5 text-center text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
              onClick={() => onOpenChange?.(false)}
            >
              Ver ficha completa
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
