"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getClientVisitorId, getFingerprint } from "@/lib/tracking-crm";
import { fetchRecommendations } from "@/lib/sax-api";
import { mapApiPropertyToProperty } from "@/services/properties";
import type { Property } from "@/types/realEstate";
import PropertyCard from "@/components/cards/PropertyCard";
import { cn } from "@/lib/utils";

type Props = {
  /** Quando false, reduz margem inferior (sem bloco de parceiros abaixo). */
  hasPartnersBelow?: boolean;
};

export default function RecommendationsSection({
  hasPartnersBelow = true,
}: Props) {
  const [properties, setProperties] = useState<Property[]>([]);

  useEffect(() => {
    const fp = getFingerprint();
    const cid = getClientVisitorId();
    if (!fp && !cid) return;
    fetchRecommendations(fp, cid)
      .then((raw) => {
        const list = (Array.isArray(raw) ? raw : [])
          .filter((p): p is Record<string, unknown> => p != null && typeof p === "object")
          .map((p) => mapApiPropertyToProperty(p));
        setProperties(list);
      })
      .catch(() => setProperties([]));
  }, []);

  if (properties.length === 0) return null;

  return (
    <section
      className={cn(
        hasPartnersBelow ? "pt-10 md:pt-14" : "pt-4 md:pt-6",
        hasPartnersBelow ? "mb-12" : "mb-4 md:mb-6"
      )}
    >
      <div className="mb-4 flex items-end justify-between">
        <h2 className="text-xl font-semibold tracking-tight">
          Imóveis que combinam com você
        </h2>
        <Link
          href="/imoveis"
          className="text-sm text-zinc-700 hover:text-black underline-offset-4 hover:underline dark:text-zinc-300 dark:hover:text-white"
        >
          Ver todos os imóveis
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {properties.map((p) => (
          <PropertyCard key={p.id} property={p} />
        ))}
      </div>
    </section>
  );
}
