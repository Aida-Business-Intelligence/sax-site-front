import Image from "next/image";
import Link from "next/link";
import type { Property } from "@/types/realEstate";
import { ArrowRight, BadgeCheck, Bath, Bed, MapPin, Ruler } from "lucide-react";

type Props = {
  property: Property;
};

export default function FeaturedBanner({ property }: Props) {
  return (
    <section className="mb-12">
      <div className="rounded-3xl border border-zinc-200 bg-gradient-to-r from-white to-zinc-50 p-6 shadow-sm dark:border-zinc-800 dark:from-zinc-900 dark:to-zinc-900/60 md:p-8">
        <div className="grid items-center gap-6 md:grid-cols-2">
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl">
            <Image
              src={property.coverImage.url}
              alt={property.coverImage.alt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>

          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:ring-emerald-900/40">
              <BadgeCheck className="size-3.5" />
              Imóvel ranqueado
            </div>
            <h3 className="text-2xl font-semibold leading-snug md:text-3xl">
              {property.title}
            </h3>
            <p className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
              <MapPin className="size-4 opacity-70" />
              {property.address.city}, {property.address.state}
            </p>

            <ul className="mt-2 grid grid-cols-2 gap-3 text-sm text-zinc-700 dark:text-zinc-300 md:grid-cols-3">
              <li className="inline-flex items-center gap-2">
                <Ruler className="size-4 opacity-70" />
                {property.area}m² de área privativa
              </li>
              <li className="inline-flex items-center gap-2">
                <Bed className="size-4 opacity-70" />
                {property.bedrooms} dormitórios
              </li>
              <li className="inline-flex items-center gap-2">
                <Bath className="size-4 opacity-70" />
                {property.bathrooms} banheiros
              </li>
            </ul>

            <div className="pt-2">
              <Link
                href={`/imovel/${property.slug}`}
                className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Saiba mais
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
