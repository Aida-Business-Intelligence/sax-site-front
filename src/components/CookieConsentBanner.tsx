"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { setConsent, setSessionId, trackEvent } from "@/lib/analytics";

const BANNER_STORAGE = "sax.cookies.bannerClosed";

export function CookieConsentBanner() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const consent = window.localStorage.getItem("sax.cookies.consent");
    const hasChoice = consent === "true" || consent === "false";
    setVisible(!hasChoice);
  }, [pathname]);

  const handleAccept = () => {
    if (typeof window === "undefined") return;
    setConsent(true);
    if (!window.localStorage.getItem("sax.analytics.sessionId")) {
      setSessionId(
        `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`
      );
    }
    trackEvent("page_view", pathname);
    window.localStorage.setItem(BANNER_STORAGE, "true");
    setVisible(false);
  };

  const handleDecline = () => {
    if (typeof window === "undefined") return;
    setConsent(false);
    window.localStorage.setItem(BANNER_STORAGE, "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[100] border-t border-white/10 bg-slate-900/95 px-4 py-3 shadow-lg backdrop-blur sm:px-6"
      role="dialog"
      aria-label="Cookies e privacidade"
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-300">
          Usamos cookies para melhorar sua experiência, analisar o uso do site e
          marketing. Nenhum dado pessoal é coletado sem seu consentimento.
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={handleDecline}
            className="rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
          >
            Recusar
          </button>
          <button
            type="button"
            onClick={handleAccept}
            className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-600"
          >
            Aceitar cookies
          </button>
        </div>
      </div>
    </div>
  );
}
