"use client";

import React, { useState } from "react";
import { getSessionId, submitLead } from "@/lib/analytics";
import { identifyLead } from "@/lib/tracking-crm";

type Props = {
  context?: Record<string, unknown>;
  source?: string;
};

export default function LeadForm({ context, source = "form" }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;
    const name = (data.name ?? "").trim();
    const email = (data.email ?? "").trim();
    const phone = (data.phone ?? "").trim();
    const cpf = (data.cpf ?? "").trim();
    const message = (data.message ?? "").trim();

    if (!email && !phone && !cpf) {
      setError("Informe ao menos e-mail, telefone ou CPF.");
      return;
    }

    setSubmitting(true);
    const ok = await submitLead({
      name: name || undefined,
      email: email || undefined,
      phone: phone || undefined,
      cpf: cpf || undefined,
      sessionId: getSessionId() || undefined,
      source: (context?.ref as string) || source,
      metadata: { message: message || undefined, ...context },
    });
    setSubmitting(false);
    if (ok) {
      identifyLead({ name: name || undefined, email: email || undefined, phone: phone || undefined });
      setSent(true);
      form.reset();
    } else {
      setError("Não foi possível enviar. Tente de novo.");
    }
  }

  if (sent) {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
        Mensagem enviada! Em breve entraremos em contato.
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <input
        name="name"
        placeholder="Seu nome"
        className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
      />
      <input
        name="email"
        type="email"
        placeholder="E-mail"
        className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
      />
      <input
        name="phone"
        type="tel"
        placeholder="Celular (WhatsApp)"
        className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
      />
      <input
        name="cpf"
        placeholder="CPF (opcional)"
        className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
      />
      <textarea
        name="message"
        placeholder="Como podemos ajudar?"
        className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
        rows={4}
      />
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-zinc-900 px-4 py-2 text-white hover:bg-zinc-800 disabled:opacity-70 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {submitting ? "Enviando…" : "Enviar"}
      </button>
    </form>
  );
}
