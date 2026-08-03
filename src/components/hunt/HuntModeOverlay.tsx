"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchProperties, fetchSiteConfig } from "@/lib/sax-api";
import { mapApiPropertyToProperty } from "@/services/properties";
import type { Property } from "@/types/realEstate";
import { trackEvent, identifyLead } from "@/lib/tracking-crm";
import { cn } from "@/lib/utils";
import { usePropertyTypes } from "@/hooks/usePropertyTypes";

const STORAGE_DONE = "sax.hunt.v1.done";
const STORAGE_SNOOZE = "sax.hunt.v1.snoozeUntil";
const OPEN_DELAY_MS = 6000;

type Mode = "venda" | "aluguel";
type PropertyKind = string;
type PriceRangeKey =
  | "any"
  | "lt500k"
  | "500k-1m"
  | "1m-2m"
  | "2m-4m"
  | "4m-6m"
  | "6m-8m"
  | "gt8m"
  | "gt2m";

const PRICE_RANGES: Record<
  Exclude<PriceRangeKey, "any">,
  { min?: number; max?: number }
> = {
  lt500k: { max: 500_000 },
  "500k-1m": { min: 500_000, max: 1_000_000 },
  "1m-2m": { min: 1_000_000, max: 2_000_000 },
  "2m-4m": { min: 2_000_000, max: 4_000_000 },
  "4m-6m": { min: 4_000_000, max: 6_000_000 },
  "6m-8m": { min: 6_000_000, max: 8_000_000 },
  gt8m: { min: 8_000_000 },
  gt2m: { min: 2_000_000 },
};

function isSnoozed(): boolean {
  if (typeof window === "undefined") return true;
  const raw = window.localStorage.getItem(STORAGE_SNOOZE);
  if (!raw) return false;
  const t = new Date(raw).getTime();
  return Number.isFinite(t) && t > Date.now();
}

function isCompleted(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(STORAGE_DONE) === "1";
}

// Modo Caca: escopo restrito a Balneario Camboriu (cidade) e Praia Brava (bairro de Itajai).
// Por design, isso tambem exclui outras cidades (Itajai-centro, Itapema, Picarras, etc.).
// Casa por cidade OU bairro (a mesma localidade pode vir cadastrada em qualquer um dos campos).
const HUNT_ALLOWED_LOCATIONS = ["balneario camboriu", "praia brava"];

function normalizeLocation(v: string | undefined | null): string {
  return String(v ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove acentos
    .toLowerCase()
    .trim();
}

function matchesHuntLocation(p: Property): boolean {
  const city = normalizeLocation(p.address?.city);
  const neighborhood = normalizeLocation(p.address?.neighborhood);
  return (
    HUNT_ALLOWED_LOCATIONS.includes(city) ||
    HUNT_ALLOWED_LOCATIONS.includes(neighborhood)
  );
}

function filterMatches(
  list: Property[],
  mode: Mode,
  kind: PropertyKind,
  bedroomsMin: number,
  priceRange: PriceRangeKey,
): Property[] {
  return list.filter((p) => {
    if (!matchesHuntLocation(p)) return false;
    if (p.type !== kind) return false;
    if (p.bedrooms < bedroomsMin) return false;

    const txs = p.transactionTypes;
    if (Array.isArray(txs) && txs.length > 0) {
      if (mode === "venda" && !txs.includes("venda")) return false;
      if (mode === "aluguel" && !txs.includes("aluguel")) return false;
    }

    const price = mode === "aluguel" ? p.priceAluguel : p.priceVenda;
    if (price == null || !Number.isFinite(price) || price <= 0) return false;

    if (priceRange !== "any") {
      const r = PRICE_RANGES[priceRange];
      if (r.min != null && price < r.min) return false;
      if (r.max != null && price > r.max) return false;
    }
    return true;
  });
}

function normalizePhoneBr(raw: string): string {
  const d = raw.replace(/\D/g, "");
  if (d.length >= 10 && d.length <= 13) return d;
  return "";
}

type HuntModeOverlayProps = {
  /** Valor lido no servidor (GET /api/site-config sem CORS). Se o fetch no cliente falhar, mantemos este valor. */
  huntModeEnabled?: boolean;
};

export function HuntModeOverlay({ huntModeEnabled: serverHuntEnabled = false }: HuntModeOverlayProps) {
  const [enabled, setEnabled] = useState(Boolean(serverHuntEnabled));
  const [checked, setChecked] = useState(false);
  const [open, setOpen] = useState(false);
  const [showFab, setShowFab] = useState(false);
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<Mode>("venda");
  const [kind, setKind] = useState<PropertyKind>("apartamento");
  const [bedroomsMin, setBedroomsMin] = useState(2);
  const [priceRange, setPriceRange] = useState<PriceRangeKey>("any");
  const [matches, setMatches] = useState<Property[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const propertyTypes = usePropertyTypes();
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const xp = useMemo(() => Math.min(100, step * 18), [step]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const cfg = await fetchSiteConfig();
        if (cancelled) return;
        setEnabled(Boolean(cfg.huntModeEnabled));
      } catch {
        // CORS, rede ou API fora: não forçar false — senão o funil some mesmo com toggle ativo no PDV.
        setEnabled(Boolean(serverHuntEnabled));
      } finally {
        if (!cancelled) setChecked(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [serverHuntEnabled]);

  useEffect(() => {
    if (!checked || !enabled) return;
    if (isCompleted()) return;
    if (typeof window === "undefined") return;

    if (isSnoozed()) {
      setShowFab(true);
      return;
    }

    const t = window.setTimeout(() => {
      setOpen(true);
      trackEvent("FUNNEL_HUNT_OPEN", { source: "auto" });
    }, OPEN_DELAY_MS);
    return () => window.clearTimeout(t);
  }, [checked, enabled]);

  const handleDismiss = useCallback(() => {
    setOpen(false);
    const until = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();
    window.localStorage.setItem(STORAGE_SNOOZE, until);
    setShowFab(true);
    trackEvent("FUNNEL_HUNT_DISMISS", {});
  }, []);

  const openFromFab = useCallback(() => {
    setOpen(true);
    setShowFab(false);
    trackEvent("FUNNEL_HUNT_OPEN", { source: "fab" });
  }, []);

  const runMatch = useCallback(
    async (pr: PriceRangeKey) => {
      setPriceRange(pr);
      setStep(5);
      setLoadingMatches(true);
      try {
        const raw = await fetchProperties();
        const list = (Array.isArray(raw) ? raw : []).map((p) =>
          mapApiPropertyToProperty(p as Record<string, unknown>),
        );
        const m = filterMatches(list, mode, kind, bedroomsMin, pr);
        setMatches(m);
        trackEvent("FUNNEL_HUNT_MATCH", {
          mode,
          kind,
          bedroomsMin,
          priceRange: pr,
          count: m.length,
        });
      } finally {
        setLoadingMatches(false);
      }
    },
    [mode, kind, bedroomsMin],
  );

  const handleFinishPhone = useCallback(async () => {
    const normalized = normalizePhoneBr(phone);
    if (normalized.length < 10) return;
    setSubmitting(true);
    try {
      identifyLead(
        { phone: normalized },
        {
          source: "modo_caca",
          crmMetadata: {
            mode,
            kind,
            bedroomsMin,
            priceRange,
            matchesCount: matches.length,
          },
        },
      );
      trackEvent("FUNNEL_HUNT_COMPLETE", {
        mode,
        kind,
        bedroomsMin,
        priceRange,
        matchesCount: matches.length,
      });
      window.localStorage.setItem(STORAGE_DONE, "1");
      window.localStorage.removeItem(STORAGE_SNOOZE);
      setStep(6);
    } finally {
      setSubmitting(false);
    }
  }, [phone, mode, kind, bedroomsMin, priceRange, matches.length]);

  if (!checked || !enabled) return null;

  if (isCompleted() && !open) {
    return null;
  }

  const topMatch = matches[0];

  return (
    <>
      {showFab && !open && (
        <button
          type="button"
          onClick={openFromFab}
          className={cn(
            "fixed bottom-6 right-4 z-[110] flex items-center gap-2 rounded-full border border-emerald-500/40",
            "bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg",
            "transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-emerald-400 2xl:bottom-8 2xl:right-8",
          )}
        >
          <span aria-hidden>🎯</span> Modo Caça
        </button>
      )}

      {open && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 px-4 pt-[max(1rem,env(safe-area-inset-top,0px))] pb-[max(1rem,env(safe-area-inset-bottom,0px))] backdrop-blur-sm sm:p-6"
          role="dialog"
          aria-modal
          aria-labelledby="hunt-title"
        >
          <div
            className={cn(
              "flex w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-white/10",
              "max-h-[min(88dvh,calc(100dvh-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px)-2rem))]",
              "bg-gradient-to-b from-zinc-900 via-zinc-950 to-black text-zinc-100 shadow-2xl sm:max-h-[min(90vh,88dvh)]",
            )}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-emerald-400/90">
                  Modo Caça
                </span>
                <div className="h-1.5 w-40 overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-[width] duration-500"
                    style={{ width: `${xp}%` }}
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handleDismiss}
                className="rounded-lg p-2 text-zinc-400 hover:bg-white/10 hover:text-white"
                aria-label="Fechar"
              >
                ✕
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5">
              {step === 0 && (
                <div className="space-y-4">
                  <h2
                    id="hunt-title"
                    className="text-xl font-bold tracking-tight sm:text-2xl"
                  >
                    Seu imóvel ideal em poucos passos
                  </h2>
                  <p className="text-sm leading-relaxed text-zinc-400">
                    Responda rápido, ganhe pontos e veja quantos imóveis
                    combinam com você — depois deixe seu WhatsApp para a equipe
                    retornar.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      trackEvent("FUNNEL_HUNT_STEP", { step: "start" });
                    }}
                    className="w-full rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-white hover:bg-emerald-400"
                  >
                    Começar — ganhar XP
                  </button>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    Você busca compra ou aluguel?
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {(
                      [
                        ["venda", "Comprar"],
                        ["aluguel", "Alugar"],
                      ] as const
                    ).map(([v, label]) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => {
                          setMode(v);
                          setStep(2);
                          trackEvent("FUNNEL_HUNT_STEP", { mode: v });
                        }}
                        className={cn(
                          "rounded-xl border py-4 text-sm font-medium transition",
                          mode === v
                            ? "border-emerald-500 bg-emerald-500/20 text-white"
                            : "border-white/15 bg-white/5 text-zinc-300 hover:border-emerald-500/50",
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    Qual tipo de imóvel?
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {propertyTypes
                      .filter((t) => t.value !== "comercial")
                      .map((t) => (
                        <button
                          key={t.value}
                          type="button"
                          onClick={() => {
                            setKind(t.value);
                            setStep(3);
                            trackEvent("FUNNEL_HUNT_STEP", { kind: t.value });
                          }}
                          className={cn(
                            "rounded-xl border px-3 py-3 text-sm capitalize transition",
                            kind === t.value
                              ? "border-emerald-500 bg-emerald-500/20"
                              : "border-white/15 bg-white/5 hover:border-emerald-500/40",
                          )}
                        >
                          {t.label}
                        </button>
                      ))}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    Mínimo de dormitórios
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => {
                          setBedroomsMin(n);
                          setStep(4);
                          trackEvent("FUNNEL_HUNT_STEP", { bedroomsMin: n });
                        }}
                        className={cn(
                          "min-w-[3rem] rounded-lg border px-4 py-2 text-sm font-medium",
                          bedroomsMin === n
                            ? "border-emerald-500 bg-emerald-500/20"
                            : "border-white/15 bg-white/5",
                        )}
                      >
                        {n}+
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    Faixa de preço (referência)
                  </h3>
                  <div className="flex flex-col gap-2">
                    {(
                      [
                        ["any", "Indiferente"],
                        ["lt500k", "Até R$ 500 mil"],
                        ["500k-1m", "R$ 500 mil – 1 mi"],
                        ["1m-2m", "R$ 1 mi – 2 mi"],
                        ["2m-4m", "R$ 2 mi – 4 mi"],
                        ["4m-6m", "R$ 4 mi – 6 mi"],
                        ["6m-8m", "R$ 6 mi – 8 mi"],
                        ["gt8m", "Acima de R$ 8 mi"],
                      ] as const
                    ).map(([key, label]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          trackEvent("FUNNEL_HUNT_STEP", { priceRange: key });
                          void runMatch(key);
                        }}
                        className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-left text-sm hover:border-emerald-500/50"
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className="space-y-4">
                  {loadingMatches ? (
                    <p className="text-center text-sm text-zinc-400">
                      Buscando imóveis…
                    </p>
                  ) : (
                    <>
                      <p className="text-center text-2xl font-bold text-emerald-400">
                        {matches.length} imóvel(eis) no seu perfil
                      </p>
                      {topMatch && (
                        <div className="relative overflow-hidden rounded-xl border border-white/10">
                          <div
                            className="aspect-[16/10] bg-zinc-800 bg-cover bg-center blur-sm"
                            style={{
                              backgroundImage: topMatch.coverImage?.url
                                ? `url(${topMatch.coverImage.url})`
                                : undefined,
                            }}
                          />
                          <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/90 to-transparent p-4">
                            <p className="text-xs text-zinc-400">
                              Preview do match
                            </p>
                            <p className="font-semibold">{topMatch.title}</p>
                            <p className="text-xs text-zinc-500">
                              {topMatch.address.neighborhood} ·{" "}
                              {topMatch.address.city}
                            </p>
                          </div>
                        </div>
                      )}
                      <label className="block text-sm font-medium text-zinc-300">
                        Seu WhatsApp (com DDD)
                        <input
                          type="tel"
                          inputMode="numeric"
                          autoComplete="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="(00) 00000-0000"
                          className="mt-2 w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-white placeholder:text-zinc-600"
                        />
                      </label>
                      <button
                        type="button"
                        disabled={
                          normalizePhoneBr(phone).length < 10 || submitting
                        }
                        onClick={handleFinishPhone}
                        className="w-full rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-white disabled:opacity-40"
                      >
                        {submitting
                          ? "Enviando…"
                          : "Concluir e registrar meu perfil"}
                      </button>
                      <p className="text-center text-[11px] text-zinc-500">
                        Ao continuar, você autoriza o contato da imobiliária
                        sobre este perfil. Os dados seguem a política de
                        privacidade do site.
                      </p>
                    </>
                  )}
                </div>
              )}

              {step === 6 && (
                <div className="space-y-3 text-center">
                  <p className="text-3xl" aria-hidden>
                    ✓
                  </p>
                  <h3 className="text-lg font-semibold">Perfil registrado!</h3>
                  <p className="text-sm text-zinc-400">
                    Seus dados e preferências foram salvos. Nossa equipe pode
                    retornar pelo número informado — você continua no site
                    normalmente.
                  </p>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="w-full rounded-xl border border-white/20 py-3 text-sm font-medium text-white hover:bg-white/10"
                  >
                    Fechar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
