import { NextRequest } from "next/server";

/**
 * Proxy com cache + retry para o backend dev-sax.
 *
 * O navegador chama ESTE endpoint (mesmo domínio) em vez de bater direto no
 * dev-sax, que é um servidor fraco e devolve 502/503 quando recebe várias
 * chamadas simultâneas (mapa + filtros + busca). Aqui a gente:
 *  - tenta de novo (retry) quando ele devolve 5xx;
 *  - guarda a resposta boa por alguns segundos (cache em memória);
 *  - em erro, serve a última resposta boa (stale) pra UI não quebrar.
 */

const BASE = (process.env.NEXT_PUBLIC_SAX_API_URL ?? "")
  .trim()
  .replace(/\/$/, "");
const TTL_MS = 30_000;

type CacheEntry = {
  at: number;
  body: string;
  status: number;
  contentType: string;
};
const memCache = new Map<string, CacheEntry>();

export const dynamic = "force-dynamic";

async function fetchWithRetry(
  url: string,
  init: RequestInit,
  retries = 4,
): Promise<Response | null> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, init);
      if (res.ok) return res;
      if (res.status >= 500 && attempt < retries) {
        await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
        continue;
      }
      return res;
    } catch {
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
        continue;
      }
      return null;
    }
  }
  return null;
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
) {
  const { path } = await ctx.params;
  const suffix = path.join("/") + req.nextUrl.search;
  if (!BASE) {
    return new Response("[]", {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }

  const now = Date.now();
  const cached = memCache.get(suffix);
  if (cached && now - cached.at < TTL_MS) {
    return new Response(cached.body, {
      status: cached.status,
      headers: { "content-type": cached.contentType, "x-sax-cache": "hit" },
    });
  }

  const res = await fetchWithRetry(`${BASE}/${suffix}`, { cache: "no-store" });
  if (!res) {
    if (cached) {
      return new Response(cached.body, {
        status: cached.status,
        headers: { "content-type": cached.contentType, "x-sax-cache": "stale" },
      });
    }
    return new Response("[]", {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }

  const body = await res.text();
  const contentType = res.headers.get("content-type") ?? "application/json";
  if (res.ok) {
    memCache.set(suffix, { at: now, body, status: res.status, contentType });
    return new Response(body, {
      status: res.status,
      headers: { "content-type": contentType, "x-sax-cache": "miss" },
    });
  }
  // backend devolveu erro: serve o cache antigo (se houver) pra não quebrar a UI
  if (cached) {
    return new Response(cached.body, {
      status: cached.status,
      headers: {
        "content-type": cached.contentType,
        "x-sax-cache": "stale-on-error",
      },
    });
  }
  return new Response(body, {
    status: res.status,
    headers: { "content-type": contentType },
  });
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
) {
  const { path } = await ctx.params;
  const suffix = path.join("/") + req.nextUrl.search;
  if (!BASE) return new Response(null, { status: 204 });
  const reqBody = await req.text();
  const res = await fetchWithRetry(`${BASE}/${suffix}`, {
    method: "POST",
    headers: {
      "content-type": req.headers.get("content-type") ?? "application/json",
    },
    body: reqBody,
    cache: "no-store",
  });
  if (!res) return new Response(null, { status: 204 });
  const text = await res.text();
  return new Response(text, {
    status: res.status,
    headers: {
      "content-type": res.headers.get("content-type") ?? "application/json",
    },
  });
}
