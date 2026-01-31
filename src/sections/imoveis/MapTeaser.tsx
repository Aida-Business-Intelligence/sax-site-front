import Link from "next/link";
import { MapPinned } from "lucide-react";
import Map from "@/components/map/Map";
import type { Property } from "@/types/realEstate";

type Props = {
  properties?: Property[];
};

export default function MapTeaser({ properties = [] }: Props) {
  const markers =
    properties
      .filter(
        (p) =>
          typeof p.address.lat === "number" && typeof p.address.lng === "number"
      )
      .map((p) => ({
        id: p.id,
        lat: p.address.lat as number,
        lng: p.address.lng as number,
      })) ?? [];
  return (
    <section className="mb-16">
      <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h3 className="text-xl font-semibold tracking-tight">
              Navegue pelo mapa
            </h3>
            <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
              Explore imóveis diretamente no mapa e encontre oportunidades por
              região.
            </p>
          </div>
          <Link
            href="/imoveis/mapa"
            className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 self-center md:self-auto"
          >
            <MapPinned className="size-4" />
            Navegar pelo mapa
          </Link>
        </div>
        <div className="mt-6 h-[420px] w-full overflow-hidden rounded-2xl ring-1 ring-black/5 dark:ring-white/5">
          <Map
            center={{ lng: -48.6357, lat: -26.9926 }} // Balneário Camboriú
            zoom={13.5}
            pitch={60}
            bearing={24}
            styleUrl="mapbox://styles/mapbox/dark-v11"
            show3DBuildings
            markers={[{ id: "bc", lng: -48.6357, lat: -26.9926 }]}
            markerStyle="teal-glow"
            className="h-[420px] w-full rounded-2xl"
          />
        </div>
      </div>
    </section>
  );
}
