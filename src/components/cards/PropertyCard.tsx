import React from "react";
import type { Property } from "@/types/realEstate";
import Link from "next/link";

export default function PropertyCard({ property }: { property: Property }) {
  return (
    <Link
      href={`/imovel/${property.slug}`}
      className="block overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="aspect-[16/10] w-full bg-zinc-200/60 dark:bg-zinc-800/40" />
      <div className="p-4">
        <h3 className="text-sm font-semibold">{property.title}</h3>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {property.address.city}, {property.address.state}
        </p>
        <p className="mt-2 text-sm font-medium">
          {property.price.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
            maximumFractionDigits: 0,
          })}
        </p>
      </div>
    </Link>
  );
}


