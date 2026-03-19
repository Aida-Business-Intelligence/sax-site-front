"use client";

import { getSaxApiBase } from "@/lib/sax-api";

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

/**
 * Fingerprint persistente (UUID salvo no localStorage) para identificar o visitante.
 */
export function getFingerprint(): string {
  if (typeof window === "undefined") return "";
  let fp = window.localStorage.getItem(STORAGE_FINGERPRINT);
  if (!fp) {
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

  const fingerprint = getFingerprint();
  if (!fingerprint) return;

  const payload = {
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

/**
 * Identifica o visitante como lead (cria ou atualiza dados no CRM).
 * Chamar no envio do formulário de contato e, se tiver dados, no clique em WhatsApp.
 */
export function identifyLead(data: IdentifyLeadData = {}): void {
  if (typeof window === "undefined") return;
  const base = getSaxApiBase();
  if (!base) return;

  const fingerprint = getFingerprint();
  if (!fingerprint) return;

  const payload = {
    fingerprint,
    name: data.name?.trim() || undefined,
    email: data.email?.trim() || undefined,
    phone: data.phone?.trim() || undefined,
  };

  fetch(`${base}/api/tracking/lead/identify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).catch(() => {
    // ignore network errors
  });
}
