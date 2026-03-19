"use client";

import { getSaxApiBase } from "@/lib/sax-api";

const STORAGE_CONSENT = "sax.cookies.consent";
const STORAGE_SESSION = "sax.analytics.sessionId";

function randomId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

export function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = window.localStorage.getItem(STORAGE_SESSION);
  if (!id) {
    id = randomId();
    window.localStorage.setItem(STORAGE_SESSION, id);
  }
  return id;
}

export function setSessionId(id: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_SESSION, id);
}

export function hasConsent(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(STORAGE_CONSENT) === "true";
}

export function setConsent(accepted: boolean): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_CONSENT, String(accepted));
  if (accepted && !window.localStorage.getItem(STORAGE_SESSION)) {
    setSessionId(randomId());
  }
}

export function shouldShowBanner(): boolean {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(STORAGE_CONSENT) === null;
}

/** Parâmetros UTM da URL (origem, campanhas, remarketing). */
export function getUtmParams(): {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
} {
  if (typeof window === "undefined") return {};
  const u = new URLSearchParams(window.location.search);
  const utmSource = u.get("utm_source") ?? undefined;
  const utmMedium = u.get("utm_medium") ?? undefined;
  const utmCampaign = u.get("utm_campaign") ?? undefined;
  return { utmSource, utmMedium, utmCampaign };
}

/** Dispositivo, navegador e OS a partir do userAgent. */
export function getDeviceInfo(): {
  userAgent: string;
  deviceType: string;
  browser: string;
  os: string;
} {
  if (typeof window === "undefined" || !window.navigator) {
    return { userAgent: "", deviceType: "unknown", browser: "unknown", os: "unknown" };
  }
  const ua = window.navigator.userAgent;
  let deviceType = "desktop";
  if (/Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
    deviceType = "mobile";
  } else if (/Tablet|iPad/i.test(ua)) {
    deviceType = "tablet";
  }
  let browser = "other";
  if (ua.includes("Chrome") && !ua.includes("Edg")) browser = "Chrome";
  else if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";
  else if (ua.includes("Edg")) browser = "Edge";
  let os = "other";
  if (ua.includes("Win")) os = "Windows";
  else if (ua.includes("Mac")) os = "macOS";
  else if (ua.includes("Linux")) os = "Linux";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iOS") || /iPhone|iPad|iPod/.test(ua)) os = "iOS";
  return { userAgent: ua, deviceType, browser, os };
}

function getTrackingContext(): Record<string, unknown> {
  const utm = getUtmParams();
  const device = getDeviceInfo();
  return {
    referrer: typeof document !== "undefined" ? document.referrer || undefined : undefined,
    ...utm,
    ...device,
  };
}

export type AnalyticsEvent = {
  eventType: string;
  path?: string;
  payload?: Record<string, unknown>;
};

export async function trackEvent(
  eventType: string,
  path?: string,
  payload?: Record<string, unknown>
): Promise<void> {
  if (typeof window === "undefined") return;
  if (!hasConsent()) return;
  const base = getSaxApiBase();
  if (!base) return;
  const sessionId = getSessionId();
  if (!sessionId) return;
  const ctx = getTrackingContext();
  const body: Record<string, unknown> = {
    sessionId,
    eventType,
    path: path || window.location.pathname,
    payload: payload ? JSON.stringify(payload) : undefined,
    userAgent: (ctx.userAgent as string) || undefined,
    referrer: (ctx.referrer as string) || undefined,
    utmSource: (ctx.utmSource as string) || undefined,
    utmMedium: (ctx.utmMedium as string) || undefined,
    utmCampaign: (ctx.utmCampaign as string) || undefined,
    deviceType: (ctx.deviceType as string) || undefined,
    browser: (ctx.browser as string) || undefined,
    os: (ctx.os as string) || undefined,
  };
  try {
    await fetch(`${base}/api/analytics/event`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    // ignore
  }
}

export async function submitLead(data: {
  name?: string;
  email?: string;
  phone?: string;
  cpf?: string;
  sessionId?: string;
  source?: string;
  metadata?: Record<string, unknown>;
}): Promise<boolean> {
  const base = getSaxApiBase();
  if (!base) return false;
  try {
    const body = {
      ...data,
      sessionId: data.sessionId ?? (typeof window !== "undefined" ? getSessionId() : undefined),
    };
    const res = await fetch(`${base}/api/analytics/lead`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return res.ok;
  } catch {
    return false;
  }
}
