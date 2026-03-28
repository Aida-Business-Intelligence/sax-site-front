"use client";

import React, {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Share2, X } from "lucide-react";
import clsx from "clsx";
import { toast } from "sonner";
import type { PublicSiteStory } from "@/lib/sax-api";
import { resolveSaxAssetUrl } from "@/lib/sax-api";

/** IDs de stories já vistas — mesmo aparelho/navegador (localStorage), como Instagram. */
const VIEWED_STORAGE_KEY = "sax-feed-viewed-story-ids";

/** Duração por story entre 5s e 10s (como pedido). */
function randomDurationMs() {
  return 5000 + Math.random() * 5000;
}

const HOLD_MS = 220;
const TAP_MS = 280;

type Props = {
  stories: PublicSiteStory[];
};

function parseOverlays(raw: PublicSiteStory["overlays"]) {
  if (!raw || typeof raw !== "object") {
    return {
      link: null as { url: string; label: string } | null,
      text: null as string | null,
    };
  }
  const o = raw as Record<string, unknown>;
  const pl = o.primaryLink;
  let link: { url: string; label: string } | null = null;
  if (pl && typeof pl === "object") {
    const u = (pl as { url?: string }).url;
    const lab = (pl as { label?: string }).label;
    if (typeof u === "string" && u.trim()) {
      link = {
        url: u.trim(),
        label:
          typeof lab === "string" && lab.trim() ? lab.trim() : "Saiba mais",
      };
    }
  }
  const to = o.textOverlay;
  let text: string | null = null;
  if (
    to &&
    typeof to === "object" &&
    typeof (to as { text?: string }).text === "string"
  ) {
    const t = (to as { text: string }).text.trim();
    text = t || null;
  }
  return { link, text };
}

function loadViewedIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(VIEWED_STORAGE_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as unknown;
    return new Set(
      Array.isArray(arr)
        ? arr.filter((x): x is string => typeof x === "string")
        : []
    );
  } catch {
    return new Set();
  }
}

/** Web Share no Windows/desktop costuma abrir diálogo quebrado. Só usamos `navigator.share` em mobile. */
function isLikelyMobileShareTarget(): boolean {
  if (typeof navigator === "undefined") return false;
  const nav = navigator as Navigator & { userAgentData?: { mobile?: boolean } };
  if (nav.userAgentData?.mobile === true) return true;
  const ua = navigator.userAgent || "";
  if (/Android|iPhone|iPod/i.test(ua)) return true;
  if (/iPad|Mobile/i.test(ua)) return true;
  if (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) return true;
  return false;
}

function FeedSaxStoriesContent({ stories }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [barPct, setBarPct] = useState(0);
  const [paused, setPaused] = useState(false);
  const [viewedIds, setViewedIds] = useState<Set<string>>(() => new Set());

  const openRef = useRef(false);
  const pausedRef = useRef(false);
  const nRef = useRef(0);
  const elapsedRef = useRef(0);
  const durationMsRef = useRef(7500);
  const lastTickRef = useRef(0);
  const rafRef = useRef(0);

  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pressStartRef = useRef(0);
  const zoneRef = useRef<"left" | "right" | "center">("center");
  const longPressActiveRef = useRef(false);
  const imageAreaRef = useRef<HTMLDivElement | null>(null);
  const deepLinkOpenedForRef = useRef<string | null>(null);

  const safeStories = useMemo(
    () => stories.filter((s) => resolveSaxAssetUrl(s.imageUrl)),
    [stories]
  );
  const current = safeStories[index];
  const hasMany = safeStories.length > 1;
  const n = safeStories.length;

  openRef.current = open;
  pausedRef.current = paused;
  nRef.current = n;

  useEffect(() => {
    setViewedIds(loadViewedIds());
  }, []);

  const markViewed = useCallback((id: string) => {
    setViewedIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      try {
        localStorage.setItem(VIEWED_STORAGE_KEY, JSON.stringify([...next]));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const storyQueryId = searchParams.get("story");

  /** Abrir story via ?story=id no /feed (link compartilhado). */
  useEffect(() => {
    if (!storyQueryId) {
      deepLinkOpenedForRef.current = null;
      return;
    }
    if (safeStories.length === 0) return;
    const i = safeStories.findIndex((s) => s.id === storyQueryId);
    if (i < 0) return;
    if (deepLinkOpenedForRef.current === storyQueryId) return;
    deepLinkOpenedForRef.current = storyQueryId;
    setIndex(i);
    setOpen(true);
  }, [storyQueryId, safeStories]);

  const closeViewer = useCallback(() => {
    setOpen(false);
    if (
      typeof window !== "undefined" &&
      window.location.search.includes("story=")
    ) {
      router.replace("/feed", { scroll: false });
    }
  }, [router]);

  const shareCurrentStory = useCallback(async () => {
    if (!current) return;
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}/feed?story=${encodeURIComponent(current.id)}`;
    const title = "Story SAX";
    const text = "Confira esta story no feed SAX";

    const copyLink = async () => {
      try {
        await navigator.clipboard.writeText(url);
        toast.success("Link copiado — cole onde quiser compartilhar");
      } catch {
        toast.error("Não foi possível copiar o link");
      }
    };

    if (!isLikelyMobileShareTarget()) {
      await copyLink();
      return;
    }

    const payload = { title, text, url };
    if (typeof navigator.share === "function") {
      const can =
        typeof navigator.canShare !== "function" ? true : navigator.canShare(payload);
      if (can) {
        try {
          await navigator.share(payload);
          return;
        } catch (e) {
          if ((e as Error).name === "AbortError") return;
        }
      }
    }

    await copyLink();
  }, [current]);

  /** Marca como vista ao exibir a story (troca de slide ou abertura). */
  useEffect(() => {
    if (!open || !current) return;
    markViewed(current.id);
  }, [open, current?.id, markViewed]);

  const go = useCallback(
    (delta: number) => {
      if (!safeStories.length) return;
      setIndex((i) => (i + delta + safeStories.length) % safeStories.length);
    },
    [safeStories.length]
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeViewer();
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, go, closeViewer]);

  /** Progresso linear só via RAF — sem transition CSS na largura. */
  useEffect(() => {
    if (!open || !n) return;

    elapsedRef.current = 0;
    durationMsRef.current = randomDurationMs();
    setBarPct(0);
    lastTickRef.current = performance.now();

    const tick = (now: number) => {
      if (!openRef.current) return;

      const delta = now - lastTickRef.current;
      lastTickRef.current = now;

      if (!pausedRef.current) {
        elapsedRef.current += delta;
        const dur = durationMsRef.current;
        const p = Math.min(100, (elapsedRef.current / dur) * 100);
        setBarPct(p);

        if (elapsedRef.current >= dur) {
          const last = nRef.current;
          setIndex((i) => {
            if (i >= last - 1) {
              queueMicrotask(() => closeViewer());
              return 0;
            }
            return i + 1;
          });
          return;
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [open, index, n, closeViewer]);

  useEffect(() => {
    if (!open) setIndex(0);
  }, [open]);

  const clearHold = useCallback(() => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    setPaused(false);
    longPressActiveRef.current = false;
    clearHold();
  }, [index, open, clearHold]);

  const getZone = (clientX: number) => {
    const el = imageAreaRef.current;
    if (!el) return "center" as const;
    const r = el.getBoundingClientRect();
    if (r.width <= 0) return "center" as const;
    const x = (clientX - r.left) / r.width;
    if (x < 0.3) return "left" as const;
    if (x > 0.7) return "right" as const;
    return "center" as const;
  };

  const onImagePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    longPressActiveRef.current = false;
    pressStartRef.current = performance.now();
    zoneRef.current = getZone(e.clientX);
    clearHold();
    holdTimerRef.current = setTimeout(() => {
      holdTimerRef.current = null;
      longPressActiveRef.current = true;
      setPaused(true);
    }, HOLD_MS);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };

  const onImagePointerUp = (e: React.PointerEvent) => {
    clearHold();
    const elapsedPress = performance.now() - pressStartRef.current;

    if (longPressActiveRef.current) {
      longPressActiveRef.current = false;
      setPaused(false);
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      return;
    }

    if (elapsedPress < TAP_MS) {
      const z = zoneRef.current;
      if (z === "left") go(-1);
      else if (z === "right") go(1);
    }

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };

  const onImagePointerCancel = () => {
    clearHold();
    longPressActiveRef.current = false;
    setPaused(false);
  };

  if (!safeStories.length) {
    return (
      <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/80 px-6 py-12 text-center dark:border-zinc-800 dark:bg-zinc-900/40">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Nenhuma story SAX publicada no momento.
        </p>
      </div>
    );
  }

  const { link, text } = current
    ? parseOverlays(current.overlays)
    : { link: null, text: null };
  const imgSrc = current ? resolveSaxAssetUrl(current.imageUrl) : "";

  const showChrome = !paused;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Stories
        </h2>
        {/* <span className="text-xs text-zinc-500 dark:text-zinc-400">
          Segure na foto para pausar — solte para continuar
        </span> */}
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 pt-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {safeStories.map((s, i) => {
          const thumb = resolveSaxAssetUrl(s.imageUrl);
          const label = s.bubbleLabel?.trim() ?? "";
          const seen = viewedIds.has(s.id);
          return (
            <div
              key={s.id}
              className="flex w-[5.25rem] shrink-0 flex-col items-center gap-1"
            >
              <button
                type="button"
                onClick={() => {
                  setIndex(i);
                  setOpen(true);
                }}
                className="group relative focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
                aria-label={
                  label ? `Abrir story: ${label}` : `Abrir story ${i + 1}`
                }
              >
                <span
                  className={clsx(
                    "block h-20 w-20 rounded-full p-[3px] shadow-md transition group-active:scale-[0.98]",
                    seen
                      ? "bg-zinc-200 dark:bg-zinc-700"
                      : "bg-teal-500 dark:bg-teal-600"
                  )}
                >
                  <span className="flex h-full w-full items-center justify-center overflow-hidden rounded-full border-2 border-white bg-white dark:border-zinc-900 dark:bg-zinc-900">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={thumb}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </span>
                </span>
              </button>
              {label ? (
                <span
                  className="line-clamp-2 w-full max-w-[5.25rem] text-center text-[11px] font-semibold leading-snug text-zinc-700 dark:text-zinc-300"
                  title={label}
                >
                  {label}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {open && current ? (
          <motion.div
            className="fixed inset-0 z-[90] flex flex-col bg-black md:items-center md:justify-center md:bg-black/90 md:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label="Visualizador de story"
          >
            <div
              className={`pointer-events-none absolute inset-x-0 top-0 z-20 flex w-full min-w-0 gap-1 px-2 pt-[max(0.75rem,env(safe-area-inset-top))] transition-opacity duration-150 md:px-4 md:pt-4 ${
                showChrome ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
              aria-hidden={!showChrome}
            >
              {safeStories.map((_, i) => {
                let fill = 0;
                if (i < index) fill = 100;
                else if (i === index) fill = barPct;
                return (
                  <div
                    key={safeStories[i].id}
                    className="h-0.5 min-w-0 flex-1 overflow-hidden rounded-full bg-white/25 md:h-1"
                  >
                    <div
                      className="h-full rounded-full bg-white"
                      style={{
                        width: `${fill}%`,
                        transition: "none",
                      }}
                    />
                  </div>
                );
              })}
            </div>

            <div
              className={`absolute right-3 top-14 z-30 flex items-center gap-2 md:right-4 md:top-8 ${
                showChrome ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
            >
              <button
                type="button"
                className="rounded-full bg-white/10 p-2 text-white backdrop-blur hover:bg-white/20"
                onClick={() => void shareCurrentStory()}
                aria-label="Compartilhar link desta story"
              >
                <Share2 className="h-6 w-6" />
              </button>
              <button
                type="button"
                className="rounded-full bg-white/10 p-2 text-white backdrop-blur hover:bg-white/20"
                onClick={closeViewer}
                aria-label="Fechar"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {hasMany ? (
              <>
                <button
                  type="button"
                  className={`pointer-events-auto absolute left-2 top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-white/10 p-2 text-white backdrop-blur hover:bg-white/20 md:left-6 md:flex ${
                    showChrome ? "" : "pointer-events-none opacity-0"
                  }`}
                  onClick={() => go(-1)}
                  aria-label="Story anterior"
                >
                  <ChevronLeft className="h-8 w-8" />
                </button>
                <button
                  type="button"
                  className={`pointer-events-auto absolute right-2 top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-white/10 p-2 text-white backdrop-blur hover:bg-white/20 md:right-6 md:flex ${
                    showChrome ? "" : "pointer-events-none opacity-0"
                  }`}
                  onClick={() => go(1)}
                  aria-label="Próxima story"
                >
                  <ChevronRight className="h-8 w-8" />
                </button>
              </>
            ) : null}

            <div className="relative mt-10 flex min-h-0 w-full max-w-lg flex-1 flex-col overflow-hidden md:mt-0 md:max-h-[min(90vh,820px)] md:rounded-2xl md:bg-zinc-950 md:shadow-2xl">
              <div
                ref={imageAreaRef}
                className="relative flex min-h-0 flex-1 touch-none items-center justify-center bg-black md:min-h-[50vh]"
                onPointerDown={onImagePointerDown}
                onPointerUp={onImagePointerUp}
                onPointerCancel={onImagePointerCancel}
                onPointerLeave={(e) => {
                  if (e.buttons === 0) onImagePointerCancel();
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imgSrc}
                  alt={current.caption ?? "Story"}
                  className="relative z-0 max-h-[min(85dvh,780px)] w-full select-none object-contain md:max-h-[min(78vh,720px)]"
                  draggable={false}
                />
                {text && showChrome ? (
                  <div className="pointer-events-none absolute inset-x-0 top-8 bg-linear-to-b from-black/70 to-transparent px-4 pb-8 pt-2 md:top-0 md:pt-6">
                    <p className="text-center text-base font-semibold text-white drop-shadow-md">
                      {text}
                    </p>
                  </div>
                ) : null}
              </div>
              <div
                className={`shrink-0 space-y-3 bg-zinc-950 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] transition-opacity duration-150 ${
                  showChrome ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
              >
                {current.caption ? (
                  <p className="text-sm leading-relaxed text-zinc-100">
                    {current.caption}
                  </p>
                ) : null}
                {link ? (
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center rounded-full bg-teal-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-600"
                  >
                    {link.label}
                  </a>
                ) : null}
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}

function FeedSaxStoriesSkeleton() {
  return (
    <section className="space-y-4">
      <div className="h-7 w-36 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="flex gap-4">
        <div className="h-20 w-20 shrink-0 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-20 w-20 shrink-0 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
      </div>
    </section>
  );
}

export default function FeedSaxStories(props: Props) {
  return (
    <Suspense fallback={<FeedSaxStoriesSkeleton />}>
      <FeedSaxStoriesContent {...props} />
    </Suspense>
  );
}
