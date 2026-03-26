import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Bath, Bed, MapPin, Ruler } from "lucide-react";
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
        <h3 className="text-sm font-semibold leading-snug">{property.title}</h3>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-zinc-600 dark:text-zinc-400">
          <MapPin className="size-3.5 shrink-0 opacity-70" aria-hidden />
          <span>
            {property.address.city}, {property.address.state}
          </span>
        </p>
        <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-zinc-600 dark:text-zinc-400">
          <li className="inline-flex items-center gap-1">
            <Ruler className="size-3.5 shrink-0 opacity-70" aria-hidden />
            <span>{property.area}m²</span>
          </li>
          <li className="inline-flex items-center gap-1">
            <Bed className="size-3.5 shrink-0 opacity-70" aria-hidden />
            <span>
              {property.bedrooms}{" "}
              {property.bedrooms === 1 ? "dormitório" : "dormitórios"}
            </span>
          </li>
          <li className="inline-flex items-center gap-1">
            <Bath className="size-3.5 shrink-0 opacity-70" aria-hidden />
            <span>
              {property.bathrooms}{" "}
              {property.bathrooms === 1 ? "banheiro" : "banheiros"}
            </span>
          </li>
        </ul>
        <p className="mt-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
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


