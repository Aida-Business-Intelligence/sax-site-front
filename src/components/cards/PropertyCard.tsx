import React from "react";
import Image from "next/image";
import Link from "next/link";
import type { Property } from "@/types/realEstate";

function hasValidCoverUrl(property: Property): boolean {
  const url = property.coverImage?.url;
  return typeof url === "string" && url.trim() !== "";
}

export default function PropertyCard({ property }: { property: Property }) {
  const showImage = hasValidCoverUrl(property);

  return (
    <Link
      href={`/imovel/${property.slug}`}
      className="block overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-200/60 dark:bg-zinc-800/40">
        {showImage ? (
          <Image
            src={property.coverImage.url}
            alt={property.coverImage.alt || property.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full min-h-[120px] w-full items-center justify-center text-xs text-zinc-400 dark:text-zinc-500">
            Sem imagem
          </div>
        )}
      </div>
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


