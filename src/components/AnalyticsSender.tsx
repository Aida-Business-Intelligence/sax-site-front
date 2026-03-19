"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { trackEvent } from "@/lib/analytics";
import { trackEvent as trackCrm } from "@/lib/tracking-crm";

/** Intervalo (ms) para enviar time_on_page enquanto a página está visível. */
const TIME_ON_PAGE_INTERVAL_MS = 30_000;
/** Profundidades de scroll (%) que disparam evento. */
const SCROLL_DEPTHS = [25, 50, 75, 100];

/**
 * Envia page_view ao mudar de rota; time_on_page a cada intervalo e ao sair; scroll (profundidade) por página.
 */
export function AnalyticsSender() {
  const pathname = usePathname();
  const pageEnteredAt = useRef<number>(0);
  const scrollDepthsSent = useRef<Set<number>>(new Set());
  const timeInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // page_view + inicia tempo e reseta scroll (ref evita duplicar no Strict Mode / double-invoke)
  const sentPageViewRef = useRef<string | null>(null);
  useEffect(() => {
    if (!pathname) return;
    if (sentPageViewRef.current === pathname) return;
    sentPageViewRef.current = pathname;
    trackEvent("page_view", pathname);
    trackCrm("PAGE_VIEW", { path: pathname });
    pageEnteredAt.current = Date.now();
    scrollDepthsSent.current = new Set();

    const sendTimeOnPage = () => {
      const seconds = Math.round((Date.now() - pageEnteredAt.current) / 1000);
      if (seconds > 0) {
        trackEvent("time_on_page", pathname, { seconds, path: pathname });
      }
    };

    // A cada X segundos enquanto a aba está ativa
    timeInterval.current = setInterval(sendTimeOnPage, TIME_ON_PAGE_INTERVAL_MS);

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        sendTimeOnPage();
        if (timeInterval.current) {
          clearInterval(timeInterval.current);
          timeInterval.current = null;
        }
      }
    };
    const onBeforeUnload = () => sendTimeOnPage();
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("beforeunload", onBeforeUnload);

    return () => {
      sendTimeOnPage();
      if (timeInterval.current) {
        clearInterval(timeInterval.current);
        timeInterval.current = null;
      }
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, [pathname]);

  // Scroll depth (uma vez por profundidade por página)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight <= 0) return;
      const pct = Math.round((window.scrollY / scrollHeight) * 100);
      for (const depth of SCROLL_DEPTHS) {
        if (pct >= depth && !scrollDepthsSent.current.has(depth)) {
          scrollDepthsSent.current.add(depth);
          trackEvent("scroll", window.location.pathname, { depthPercent: depth, path: window.location.pathname });
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  return null;
}
