"use client";

import { getSaxApiBase } from "@/lib/sax-api";

/** Cookie first-party: sobrevive melhor que só localStorage para o mesmo domínio. */
const COOKIE_VISITOR = "sax_vid";
const STORAGE_VISITOR_ID = "sax.tracking.visitorId";
/** Token de sessão/dispositivo (localStorage); pode renovar se o usuário limpar só o armazenamento local — o servidor une pelo clientVisitorId. */
const STORAGE_FINGERPRINT = "sax.tracking.fingerprint";

function uuid(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function readCookie(name: string): string {
  if (typeof document === "undefined") return "";
  const m = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1].trim()) : "";
}

function setCookie(name: string, value: string): void {
  if (typeof document === "undefined") return;
  const maxAge = 400 * 24 * 60 * 60; // ~400 dias
  const secure =
    typeof window !== "undefined" && window.location?.protocol === "https:"
      ? "; Secure"
      : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax${secure}`;
}

/**
 * ID de visitante persistente (cookie + localStorage).
 * Migra valor legado de `sax.tracking.fingerprint` quando ainda não há visitor id dedicado.
 */
export function getClientVisitorId(): string {
  if (typeof window === "undefined") return "";

  const fromCookie = readCookie(COOKIE_VISITOR).trim();
  const fromLs = window.localStorage.getItem(STORAGE_VISITOR_ID)?.trim() ?? "";
  const legacyFp = window.localStorage.getItem(STORAGE_FINGERPRINT)?.trim() ?? "";

  let id = fromCookie || fromLs || legacyFp;
  if (!id || id.length > 128) {
    id = uuid();
  }

  if (window.localStorage.getItem(STORAGE_VISITOR_ID) !== id) {
    window.localStorage.setItem(STORAGE_VISITOR_ID, id);
  }
  if (fromCookie !== id) {
    setCookie(COOKIE_VISITOR, id);
  }

  return id;
}

/**
 * Fingerprint de sessão (localStorage). Diferente do visitor id quando o usuário limpa só o LS e mantém o cookie.
 */
export function getFingerprint(): string {
  if (typeof window === "undefined") return "";

  getClientVisitorId();

  let fp = window.localStorage.getItem(STORAGE_FINGERPRINT)?.trim() ?? "";
  if (!fp || fp.length > 256) {
    fp = uuid();
    window.localStorage.setItem(STORAGE_FINGERPRINT, fp);
  }
  return fp;
}

/**
 * Envia evento para o CRM (backend tracking). Funciona para todos os visitantes, logados ou não.
 */
export function trackEvent(type: string, data: Record<string, unknown> = {}): void {
  if (typeof window === "undefined") return;
  const base = getSaxApiBase();
  if (!base) return;

  const clientVisitorId = getClientVisitorId();
  const fingerprint = getFingerprint();
  if (!clientVisitorId && !fingerprint) return;

  const payload = {
    clientVisitorId,
    fingerprint,
    type,
    data,
  };

  fetch(`${base}/api/tracking/event`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).catch(() => {
    // ignore network errors
  });
}

export type IdentifyLeadData = {
  name?: string;
  email?: string;
  phone?: string;
};

/** Origem no CRM PDV + metadados (ex.: perfil do Modo Caça). */
export type IdentifyLeadOptions = {
  source?: string;
  crmMetadata?: Record<string, unknown>;
};

/**
 * Identifica o visitante como lead (cria ou atualiza dados no CRM).
 */
export function identifyLead(data: IdentifyLeadData = {}, options?: IdentifyLeadOptions): void {
  if (typeof window === "undefined") return;
  const base = getSaxApiBase();
  if (!base) return;

  const clientVisitorId = getClientVisitorId();
  const fingerprint = getFingerprint();
  if (!clientVisitorId && !fingerprint) return;

  const payload = {
    clientVisitorId,
    fingerprint,
    name: data.name?.trim() || undefined,
    email: data.email?.trim() || undefined,
    phone: data.phone?.trim() || undefined,
    source: options?.source,
    crmMetadata: options?.crmMetadata,
  };

  fetch(`${base}/api/tracking/lead/identify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).catch(() => {
    // ignore network errors
  });
}
