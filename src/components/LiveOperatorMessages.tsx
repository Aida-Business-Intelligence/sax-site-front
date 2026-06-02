"use client";

import { useEffect, useRef, useState, useCallback, type ReactNode } from "react";
import { toast } from "sonner";
import { getSaxApiBase } from "@/lib/sax-api";
import { getSessionId } from "@/lib/analytics";
import { cn } from "@/lib/utils";

type ThreadMsg = {
  id: string;
  from: "operator" | "visitor";
  kind?: "popup" | "chat";
  body: string;
  createdAt: string;
};

const POLL_MS = 2800;

const URL_RE = /https?:\/\/[^\s<]+/gi;

/** Remove URLs do texto e devolve lista única de links para renderizar como botões. */
function extractUrls(body: string): { text: string; urls: string[] } {
  const found = body.match(URL_RE);
  const urls = found ? [...new Set(found)] : [];
  let text = body;
  for (const u of urls) {
    text = text.split(u).join("");
  }
  text = text.replace(/\n{3,}/g, "\n\n").trim();
  return { text, urls };
}

function labelForUrl(url: string): string {
  const u = url.toLowerCase();
  if (u.includes("wa.me") || u.includes("whatsapp.com") || u.includes("api.whatsapp")) {
    return "Falar no WhatsApp";
  }
  if (u.includes("instagram.com") || u.includes("instagr.am")) {
    return "Ver no Instagram";
  }
  if (u.includes("facebook.com") || u.includes("fb.com") || u.includes("messenger.com")) {
    return "Abrir Facebook";
  }
  if (u.includes("linkedin.com")) {
    return "LinkedIn";
  }
  if (u.includes("tel:") || u.includes("sms:")) {
    return "Ligar / SMS";
  }
  return "Saiba mais";
}

function linkifyPlain(text: string): ReactNode {
  const parts = text.split(/(https?:\/\/[^\s<]+)/gi);
  return parts.map((part, i) => {
    if (/^https?:\/\//i.test(part)) {
      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="break-all font-medium text-emerald-700 underline underline-offset-2 hover:text-emerald-800 dark:text-emerald-300"
        >
          {part}
        </a>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

type BubbleVariant = "operator" | "visitor";

function ChatMessageBody({ body, variant }: { body: string; variant: BubbleVariant }) {
  const { text, urls } = extractUrls(body);
  const onlyLinks = !text && urls.length > 0;
  const noUrls = urls.length === 0;

  if (noUrls) {
    return <div className="whitespace-pre-wrap break-words">{linkifyPlain(body)}</div>;
  }

  return (
    <div className="space-y-2.5">
      {text ? (
        <div className="whitespace-pre-wrap break-words text-[0.9375rem] leading-relaxed">{text}</div>
      ) : null}
      <div className={cn("flex flex-col gap-2", onlyLinks && "pt-0")}>
        {urls.map((u) => (
          <a
            key={u}
            href={u}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "inline-flex w-full items-center justify-center rounded-xl px-3 py-2.5 text-center text-sm font-semibold shadow-sm transition active:scale-[0.99]",
              variant === "operator"
                ? "bg-emerald-600 text-white hover:bg-emerald-500 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                : "bg-amber-600 text-white hover:bg-amber-500 dark:bg-amber-600 dark:hover:bg-amber-500"
            )}
          >
            {labelForUrl(u)}
          </a>
        ))}
      </div>
    </div>
  );
}

function PopupToastContent({ body }: { body: string }) {
  const { text, urls } = extractUrls(body);
  const noUrls = urls.length === 0;
  if (noUrls) {
    return (
      <div className="max-w-[min(88vw,300px)]">
        <p className="text-sm font-semibold leading-snug text-zinc-900 dark:text-zinc-50">{body}</p>
      </div>
    );
  }
  return (
    <div className="flex max-w-[min(88vw,300px)] flex-col gap-2.5">
      {text ? (
        <p className="text-sm font-semibold leading-snug text-zinc-900 dark:text-zinc-50">{text}</p>
      ) : null}
      <div className="flex flex-col gap-2">
        {urls.map((u) => (
          <a
            key={u}
            href={u}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500"
          >
            {labelForUrl(u)}
          </a>
        ))}
      </div>
    </div>
  );
}

/**
 * Pop-ups (toast) + painel de chat quando há mensagens tipo chat ou respostas do visitante.
 * Thread completo via GET /api/public/live-chat/thread; toasts só para kind=popup em /api/public/live-messages.
 */
export function LiveOperatorMessages() {
  const seenPopupRef = useRef<Set<string>>(new Set());
  const [thread, setThread] = useState<ThreadMsg[]>([]);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [chatClosed, setChatClosed] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const showChatPanel = thread.some(
    (m) => m.from === "visitor" || (m.from === "operator" && m.kind === "chat")
  );

  const poll = useCallback(async () => {
    const base = getSaxApiBase();
    if (!base) return;
    const sid = getSessionId();
    if (!sid) return;

    try {
      const popUrl = `${base}/api/public/live-messages?sessionId=${encodeURIComponent(sid)}`;
      const popRes = await fetch(popUrl, { method: "GET", cache: "no-store" });
      if (popRes.ok) {
        const data = (await popRes.json()) as { messages?: { id: string; body: string }[] };
        const list = Array.isArray(data.messages) ? data.messages : [];
        for (const m of list) {
          if (seenPopupRef.current.has(m.id)) continue;
          seenPopupRef.current.add(m.id);
          toast(<PopupToastContent body={m.body} />, {
            duration: 16_000,
            description: "Mensagem da imobiliária",
            position: "bottom-right",
            closeButton: true,
            dismissible: true,
            classNames: {
              toast:
                "group !items-start !border-emerald-200/90 !bg-white !py-3 !shadow-2xl dark:!border-emerald-800/80 dark:!bg-zinc-900",
              title: "!w-full !font-normal !text-zinc-900 dark:!text-zinc-50",
              description: "!mt-1 !text-xs !text-emerald-800/90 dark:!text-emerald-300/90",
              closeButton:
                "!border-zinc-300 !bg-white !text-zinc-600 hover:!bg-zinc-100 dark:!border-zinc-600 dark:!bg-zinc-800 dark:!text-zinc-200",
            },
          });
        }
      }

      const thUrl = `${base}/api/public/live-chat/thread?sessionId=${encodeURIComponent(sid)}`;
      const thRes = await fetch(thUrl, { method: "GET", cache: "no-store" });
      if (thRes.ok) {
        const td = (await thRes.json()) as { messages?: ThreadMsg[] };
        setThread(Array.isArray(td.messages) ? td.messages : []);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined" && document.visibilityState === "visible") {
      void poll();
    }
    const id = setInterval(() => {
      if (typeof document !== "undefined" && document.hidden) return;
      void poll();
    }, POLL_MS);
    const onVis = () => {
      if (document.visibilityState === "visible") void poll();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [poll]);

  useEffect(() => {
    endRef.current?.scrollIntoView?.({ behavior: "smooth" });
  }, [thread]);

  useEffect(() => {
    if (!showChatPanel || chatClosed) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setChatClosed(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showChatPanel, chatClosed]);

  /** Nova mensagem no thread enquanto o painel estava fechado → reabre para o visitante ver. */
  const threadSigRef = useRef<string>("");
  useEffect(() => {
    const sig = thread.map((m) => m.id).join("|");
    if (!chatClosed) {
      threadSigRef.current = sig;
      return;
    }
    if (threadSigRef.current !== "" && sig !== threadSigRef.current) {
      setChatClosed(false);
    }
    threadSigRef.current = sig;
  }, [thread, chatClosed]);

  const sendReply = async () => {
    const base = getSaxApiBase();
    const sid = getSessionId();
    const t = reply.trim();
    if (!base || !sid || !t) return;
    setSending(true);
    try {
      const res = await fetch(`${base}/api/public/live-chat/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sid, body: t }),
      });
      if (res.ok) {
        setReply("");
        void poll();
      }
    } catch {
      /* ignore */
    } finally {
      setSending(false);
    }
  };

  if (!showChatPanel) return null;

  if (chatClosed) {
    return (
      <button
        type="button"
        className="pointer-events-auto fixed right-4 z-[130] flex max-w-[calc(100vw-2rem)] items-center gap-2 rounded-full border-2 border-emerald-500/40 bg-white py-2.5 pl-3 pr-4 text-sm font-semibold text-emerald-900 shadow-xl ring-1 ring-black/5 hover:bg-emerald-50 dark:border-emerald-600/50 dark:bg-zinc-900 dark:text-emerald-100 dark:hover:bg-emerald-950/50"
        style={{
          bottom: "max(6.25rem, calc(env(safe-area-inset-bottom, 0px) + 5.5rem))",
        }}
        onClick={() => setChatClosed(false)}
        aria-label="Abrir chat com a imobiliária"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white" aria-hidden>
          💬
        </span>
        Chat com a imobiliária
      </button>
    );
  }

  return (
    <div
      className="pointer-events-auto fixed right-4 z-[130] flex w-[min(100vw-2rem,24rem)] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border-2 border-emerald-500/35 bg-white shadow-2xl ring-1 ring-black/5 dark:border-emerald-500/30 dark:bg-zinc-900 dark:ring-white/10"
      style={{
        bottom: "max(6.25rem, calc(env(safe-area-inset-bottom, 0px) + 5.5rem))",
      }}
      role="dialog"
      aria-label="Chat com a imobiliária"
    >
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-zinc-200/90 bg-gradient-to-r from-emerald-600/95 to-teal-700/95 px-2 py-2 pl-3 text-white dark:border-zinc-700">
        <p className="text-sm font-semibold tracking-tight">Chat com a imobiliária</p>
        <button
          type="button"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white/95 hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/50"
          onClick={() => setChatClosed(true)}
          aria-label="Fechar chat"
        >
          <span className="text-xl leading-none" aria-hidden>
            ×
          </span>
        </button>
      </div>
      <div className="max-h-[min(50dvh,18rem)] space-y-2 overflow-y-auto overscroll-contain px-3 py-3 text-sm leading-relaxed">
        {thread.map((m) => {
          const op = m.from === "operator";
          if (m.kind === "popup" && op) {
            return null;
          }
          return (
            <div
              key={m.id}
              className={`max-w-[95%] rounded-xl border px-3 py-2 text-[0.9375rem] shadow-sm ${
                op
                  ? "ml-auto border-emerald-200/80 bg-emerald-50/95 text-zinc-900 dark:border-emerald-800/50 dark:bg-emerald-950/40 dark:text-zinc-100"
                  : "mr-auto border-amber-200/80 bg-amber-50/95 text-zinc-900 dark:border-amber-800/50 dark:bg-amber-950/50 dark:text-zinc-100"
              }`}
            >
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                {op ? "Imobiliária" : "Você"}
              </p>
              <ChatMessageBody body={m.body} variant={op ? "operator" : "visitor"} />
            </div>
          );
        })}
        <div ref={endRef} />
      </div>
      <div className="border-t border-zinc-200 p-2 dark:border-zinc-700">
        <textarea
          className="mb-2 max-h-24 w-full resize-none rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          rows={2}
          placeholder="Escreva sua mensagem…"
          value={reply}
          disabled={sending}
          onChange={(e) => setReply(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void sendReply();
            }
          }}
        />
        <button
          type="button"
          className="w-full rounded-lg bg-emerald-600 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
          disabled={sending || !reply.trim()}
          onClick={() => void sendReply()}
        >
          {sending ? "Enviando…" : "Enviar"}
        </button>
      </div>
    </div>
  );
}
