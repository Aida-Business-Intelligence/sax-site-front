/**
 * Cliente da API sax-backend para o site público.
 * Use NEXT_PUBLIC_SAX_API_URL (ex: http://localhost:4000) para ativar.
 */

export function getSaxApiBase(): string {
  // No navegador: passa pelo proxy do próprio site (/api/sax) — que tem cache +
  // retry — em vez de bater direto no dev-sax (fraco, devolve 503 sob carga).
  if (typeof window !== "undefined") {
    return "/api/sax";
  }
  // No servidor (SSR): bate direto no dev-sax.
  return (process.env.NEXT_PUBLIC_SAX_API_URL ?? "").trim().replace(/\/$/, "");
}

export function hasSaxApi(): boolean {
  return getSaxApiBase().length > 0;
}

/**
 * fetch com retry para o backend dev-sax, que devolve 502/503/504 quando recebe
 * várias chamadas simultâneas (mapa + filtros). Tenta de novo com um respiro —
 * ele normalmente responde na 2ª/3ª tentativa. Retorna null se falhar de vez.
 */
async function fetchSaxWithRetry(
  url: string,
  init: RequestInit,
  retries = 3,
): Promise<Response | null> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, init);
      if (res.ok) return res;
      if (res.status >= 500 && attempt < retries) {
        await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
        continue;
      }
      return res;
    } catch {
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
        continue;
      }
      return null;
    }
  }
  return null;
}

export type SectionDto = {
  id: string;
  title: string;
  slug: string;
  sortOrder: number;
  active: boolean;
};

export type TagDto = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  active: boolean;
};

export type WarehouseDto = {
  warehouse_id: string;
  warehouse_code: string;
  warehouse_name: string;
  razao_social: string | null;
  type: string | null;
  telefone: string | null;
  email: string | null;
  cidade: string | null;
  estado: string | null;
  cep: string | null;
  address: string | null;
  endereco: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cnpj: string | null;
  ie: string | null;
  im: string | null;
  note: string | null;
  display: string;
};

export async function fetchSections(): Promise<SectionDto[]> {
  const base = getSaxApiBase();
  if (!base) return [];
  try {
    const res = await fetchSaxWithRetry(`${base}/api/sections`, {
      cache: "no-store",
    });
    if (!res || !res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : data?.data ?? [];
  } catch {
    return [];
  }
}

/** Tags cadastradas no PDV (para filtro de imóveis no site). */
export async function fetchTags(): Promise<TagDto[]> {
  const base = getSaxApiBase();
  if (!base) return [];
  try {
    const res = await fetchSaxWithRetry(`${base}/api/tags`, {
      cache: "no-store",
    });
    if (!res || !res.ok) return [];
    const data = await res.json();
    const list = Array.isArray(data) ? data : data?.data ?? [];
    return list.filter((t: TagDto) => t.active !== false);
  } catch {
    return [];
  }
}

export async function fetchWarehouses(): Promise<WarehouseDto[]> {
  const base = getSaxApiBase();
  if (!base) return [];
  try {
    const init: RequestInit =
      typeof window === "undefined"
        ? { next: { revalidate: 60 } }
        : { cache: "no-store" };
    const res = await fetch(`${base}/api/warehouse/list`, init);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : data?.data ?? [];
  } catch {
    return [];
  }
}

export type PartnerLogoItem = { url: string; name?: string };

export type TransactionTypeOption = { value: string; label: string };

const DEFAULT_TRANSACTION_TYPES: TransactionTypeOption[] = [
  { value: "venda", label: "Venda" },
  { value: "aluguel", label: "Aluguel" },
  { value: "crowdfunding", label: "Crowdfunding" },
];

/** Configuração do site (banners, logo, favicon, menu, hero, parceiros, footer, tipos de transação, projetos exclusivos, imóveis). */
export async function fetchSiteConfig(): Promise<{
  featuredPropertyIds: string[];
  logoUrl: string | null;
  faviconUrl: string | null;
  menuItems: string | null;
  heroContent: Record<string, unknown> | null;
  partnerLogos: PartnerLogoItem[];
  aboutContent: Record<string, unknown> | null;
  footerContent: Record<string, unknown> | null;
  transactionTypes: TransactionTypeOption[];
  exclusiveProjectsContent: Record<string, unknown> | null;
  imoveisContent: Record<string, unknown> | null;
  proprietariosContent: Record<string, unknown> | null;
  huntModeEnabled: boolean;
}> {
  const base = getSaxApiBase();
  const empty = {
    featuredPropertyIds: [] as string[],
    logoUrl: null as string | null,
    faviconUrl: null as string | null,
    menuItems: null as string | null,
    heroContent: null as Record<string, unknown> | null,
    partnerLogos: [] as PartnerLogoItem[],
    aboutContent: null as Record<string, unknown> | null,
    footerContent: null as Record<string, unknown> | null,
    transactionTypes: DEFAULT_TRANSACTION_TYPES,
    exclusiveProjectsContent: null as Record<string, unknown> | null,
    imoveisContent: null as Record<string, unknown> | null,
    proprietariosContent: null as Record<string, unknown> | null,
    huntModeEnabled: false,
  };
  if (!base) return empty;
  try {
    const res = await fetchSaxWithRetry(`${base}/api/site-config`, {
      cache: "no-store",
    });
    if (!res || !res.ok) return empty;
    const data = await res.json();
    const ids = Array.isArray(data?.featuredPropertyIds) ? data.featuredPropertyIds : [];
    const partnerLogos = Array.isArray(data?.partnerLogos)
      ? data.partnerLogos.filter((p: unknown) => p && typeof p === "object" && typeof (p as PartnerLogoItem).url === "string")
      : [];
    const transactionTypes = Array.isArray(data?.transactionTypes) && data.transactionTypes.length > 0
      ? data.transactionTypes.filter((t: unknown) => t && typeof t === "object" && typeof (t as TransactionTypeOption).value === "string")
      : DEFAULT_TRANSACTION_TYPES;
    const ex =
      data?.exclusiveProjectsContent != null && typeof data.exclusiveProjectsContent === "object"
        ? (data.exclusiveProjectsContent as Record<string, unknown>)
        : null;
    const imoveisContent =
      data?.imoveisContent != null && typeof data.imoveisContent === "object"
        ? (data.imoveisContent as Record<string, unknown>)
        : null;
    const proprietariosContent =
      data?.proprietariosContent != null &&
      typeof data.proprietariosContent === "object"
        ? (data.proprietariosContent as Record<string, unknown>)
        : null;
    return {
      featuredPropertyIds: ids,
      logoUrl: data?.logoUrl ?? null,
      faviconUrl: data?.faviconUrl ?? null,
      menuItems: data?.menuItems ?? null,
      heroContent: data?.heroContent ?? null,
      partnerLogos,
      aboutContent: data?.aboutContent ?? null,
      footerContent: data?.footerContent ?? null,
      transactionTypes,
      exclusiveProjectsContent: ex,
      imoveisContent,
      proprietariosContent,
      huntModeEnabled: Boolean(data?.huntModeEnabled),
    };
  } catch {
    return empty;
  }
}

/** Imóveis publicados; sectionId opcional para filtrar por seção. */
export async function fetchProperties(options?: {
  sectionId?: string;
}): Promise<unknown[]> {
  const base = getSaxApiBase();
  if (!base) return [];
  try {
    const qs = options?.sectionId
      ? `?sectionId=${encodeURIComponent(options.sectionId)}`
      : "";
    const res = await fetchSaxWithRetry(`${base}/api/properties${qs}`, {
      cache: "no-store",
    });
    if (!res || !res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : data?.data ?? [];
  } catch {
    return [];
  }
}

export async function fetchPropertyBySlug(slug: string): Promise<unknown | null> {
  const base = getSaxApiBase();
  if (!base) return null;
  try {
    const res = await fetch(
      `${base}/api/properties/by-slug/${encodeURIComponent(slug)}`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data ?? null;
  } catch {
    return null;
  }
}

/**
 * Busca imóveis recomendados para o visitante (clientVisitorId + fingerprint).
 * Retorna array no mesmo formato de fetchProperties (para mapApiPropertyToProperty).
 */
export async function fetchRecommendations(
  fingerprint: string,
  clientVisitorId?: string
): Promise<unknown[]> {
  const base = getSaxApiBase();
  if (!base) return [];
  if (!fingerprint && !clientVisitorId?.trim()) return [];
  try {
    const params = new URLSearchParams();
    if (fingerprint) params.set("fingerprint", fingerprint);
    if (clientVisitorId?.trim()) params.set("clientVisitorId", clientVisitorId.trim());
    const res = await fetch(`${base}/api/tracking/recommendations?${params.toString()}`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

/** URL de asset do backend (uploads) — prefixa NEXT_PUBLIC_SAX_API_URL quando relativa. */
export function resolveSaxAssetUrl(url: string | null | undefined): string {
  const s = String(url ?? "").trim();
  if (!s) return "";
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  const base = getSaxApiBase();
  return base ? `${base}${s.startsWith("/") ? s : `/${s}`}` : s;
}

export type SiteStoryOverlays = {
  primaryLink?: { url: string; label: string };
  textOverlay?: { text: string };
} | null;

export type PublicSiteStory = {
  id: string;
  imageUrl: string;
  caption: string | null;
  /** Texto curto abaixo da bolha (estilo nome no Instagram). */
  bubbleLabel?: string | null;
  overlays: SiteStoryOverlays;
  publishedAt: string | null;
  /** Fim da janela de exibição (ex.: 24h após publicar). Null = sem expiração. */
  expiresAt?: string | null;
  sortOrder: number;
};

export type InstagramMediaItemPublic = {
  id: string;
  caption?: string;
  mediaType: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  permalink?: string;
  timestamp?: string;
};

export type PublicFeedResponse = {
  stories: PublicSiteStory[];
  instagram: { items: InstagramMediaItemPublic[] } | null;
};

/**
 * Feed público: stories SAX publicadas + grade Instagram (se configurado no PDV).
 * GET /api/public/feed
 */
export async function fetchPublicFeed(): Promise<PublicFeedResponse> {
  const base = getSaxApiBase();
  const empty: PublicFeedResponse = { stories: [], instagram: null };
  if (!base) return empty;
  try {
    const res = await fetch(`${base}/api/public/feed`, { cache: "no-store" });
    if (!res.ok) return empty;
    const data = (await res.json()) as Partial<PublicFeedResponse>;
    const stories = Array.isArray(data.stories) ? data.stories : [];
    const instagram =
      data.instagram &&
      typeof data.instagram === "object" &&
      Array.isArray((data.instagram as { items?: unknown }).items)
        ? (data.instagram as { items: InstagramMediaItemPublic[] })
        : null;
    return { stories, instagram };
  } catch {
    return empty;
  }
}
