import type { Property } from "@/types/realEstate";

export function propertyHasTransactionType(
  p: Property,
  modeValue: string
): boolean {
  const m = String(modeValue).toLowerCase().trim();
  const types = Array.isArray(p.transactionTypes) ? p.transactionTypes : [];
  const hasType = types.some((t) => String(t).toLowerCase().trim() === m);
  if (hasType) return true;
  if (m === "venda" || m === "compra")
    return typeof p.priceVenda === "number" && p.priceVenda > 0;
  if (["aluguel", "locação", "locacao"].includes(m))
    return typeof p.priceAluguel === "number" && p.priceAluguel > 0;
  if (m === "crowdfunding")
    return typeof p.priceCrowdfunding === "number" && p.priceCrowdfunding > 0;
  return false;
}

/** Alinha ao select de Status do HomeFilter (URL /imoveis). */
export function propertyMatchesStatus(p: Property, status: string): boolean {
  if (!status || status === "__all__") return true;
  const tags = (p.tagImovel ?? []).map((t) => String(t).toLowerCase());
  const has = (s: string) => tags.some((t) => t.includes(s));

  switch (status) {
    case "na-planta":
      return (
        has("planta") ||
        has("lançamento") ||
        has("lancamento") ||
        Boolean(p.dataPrevistaEntrega)
      );
    case "pronto":
      return (
        has("pronto") ||
        (!p.em_construcao && !p.dataPrevistaEntrega)
      );
    case "mobiliado":
      return p.mobiliado === true;
    case "sem-mobilia":
      return p.mobiliado === false;
    case "reformado":
      return has("reformado");
    case "para-reformar":
      return has("reformar");
    default:
      return true;
  }
}

export type PropertyFilterValues = {
  city?: string;
  mode?: string;
  type?: string;
  bedrooms?: string;
  priceRange?: string;
  builder?: string;
  /** Uma tag (lista /imoveis) */
  tag?: string;
  /** Várias tags (drawer HomeFilter) */
  tags?: string[];
  status?: string;
};

export function applyFilter(
  list: Property[],
  {
    city,
    mode,
    type,
    bedrooms,
    priceRange,
    builder,
    tag,
    tags,
    status,
  }: PropertyFilterValues
): Property[] {
  const modeNorm = mode ? String(mode).toLowerCase().trim() : "venda";

  return list.filter((p) => {
    if (modeNorm && !propertyHasTransactionType(p, modeNorm)) return false;

    if (city && city !== "__all__") {
      const c = `${p.address.city}-${p.address.state}`;
      if (c !== city) return false;
    }
    if (type && String(p.type).toLowerCase() !== String(type).toLowerCase())
      return false;
    if (bedrooms) {
      const min = Number(bedrooms);
      if (!Number.isNaN(min) && p.bedrooms < min) return false;
    }
    if (priceRange && priceRange !== "__all__") {
      const m = String(mode ?? "venda").toLowerCase();
      const priceForRange =
        (m === "aluguel" || m === "locação" || m === "locacao") &&
        p.priceAluguel != null &&
        Number(p.priceAluguel) > 0
          ? Number(p.priceAluguel)
          : m === "crowdfunding" &&
              p.priceCrowdfunding != null &&
              Number(p.priceCrowdfunding) > 0
            ? Number(p.priceCrowdfunding)
            : p.priceVenda != null && Number(p.priceVenda) > 0
              ? Number(p.priceVenda)
              : p.price;
      if (priceRange === "lt500k" && !(priceForRange <= 500000)) return false;
      if (
        priceRange === "500k-1m" &&
        !(priceForRange >= 500000 && priceForRange <= 1000000)
      )
        return false;
      if (
        priceRange === "1m-2m" &&
        !(priceForRange >= 1000000 && priceForRange <= 2000000)
      )
        return false;
      if (priceRange === "gt2m" && !(priceForRange > 2000000)) return false;
    }
    if (builder && builder !== "__all__" && p.builder !== builder)
      return false;

    if (tags && tags.length > 0) {
      const tagList = p.tagImovel ?? [];
      for (const req of tags) {
        const rq = String(req).trim();
        if (!rq) continue;
        const hasTag = tagList.some(
          (t) =>
            t === rq ||
            String(t).toLowerCase() === rq.toLowerCase()
        );
        if (!hasTag) return false;
      }
    } else if (tag && tag !== "__all__") {
      const tagList = p.tagImovel ?? [];
      const hasTag =
        tagList.includes(tag) ||
        tagList.some((t) => t.toLowerCase() === tag.toLowerCase());
      if (!hasTag) return false;
    }

    if (status && status !== "__all__" && !propertyMatchesStatus(p, status))
      return false;

    return true;
  });
}
