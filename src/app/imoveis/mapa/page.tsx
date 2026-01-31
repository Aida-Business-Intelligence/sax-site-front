"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { getMapboxToken } from "@/lib/mapbox";
import { getProperties, getCities } from "@/services/properties";
import type { Property, City } from "@/types/realEstate";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import PropertyDialog from "@/components/modals/PropertyDialog";

const schema = z.object({
  city: z.string().optional(),
  mode: z.enum(["comprar", "alugar"]).default("comprar"),
  type: z.enum(["casa", "apartamento", "terreno", "comercial"]).optional(),
  status: z.enum(["na-planta", "em-construcao", "pronto"]).optional(),
  bedrooms: z.string().optional(),
  builder: z.string().optional(),
});
type FormValues = z.input<typeof schema>;

export default function MapaPage() {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      mode: "comprar",
      city: undefined,
      type: undefined,
      status: undefined,
      bedrooms: undefined,
      builder: "",
    },
  });
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [cities, setCities] = useState<City[]>([]);

  useEffect(() => {
    getProperties().then(setAllProperties);
    getCities().then(setCities);
  }, []);

  const cityOptions = useMemo(
    () =>
      cities.map((c) => ({
        value: `${c.name}-${c.state}`,
        label: `${c.name} - ${c.state}`,
      })),
    [cities]
  );

  const token = getMapboxToken();

  // Initialize map with globe projection (large globe view)
  useEffect(() => {
    if (!token || !mapContainer.current) return;
    mapboxgl.accessToken = token;
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [-56, -15], // South America center (globe view)
      zoom: 2.1,
      pitch: 0,
      bearing: 0,
    });
    mapRef.current = map;
    map.addControl(
      new mapboxgl.NavigationControl({ showCompass: false }),
      "top-right"
    );
    map.on("style.load", () => {
      const mapApi = map as unknown as {
        setProjection?: (mode: string) => void;
        setFog?: (cfg: Record<string, unknown>) => void;
      };
      mapApi.setProjection?.("globe");
      mapApi.setFog?.({
        color: "rgb(240,240,242)",
        "high-color": "rgb(240,240,242)",
        "space-color": "rgb(230,230,235)",
        "horizon-blend": 0.02,
        "star-intensity": 0,
      });
    });
    return () => map.remove();
  }, [token]);

  // Format price as pill HTML marker with click handler
  function createPriceMarkerEl(
    property: Property,
    onClick: () => void
  ): HTMLElement {
    const el = document.createElement("button");
    el.type = "button";
    el.className =
      "cursor-pointer select-none rounded-full bg-zinc-900 px-3 py-1 text-xs font-semibold text-white shadow-lg ring-1 ring-black/10 hover:bg-zinc-800";
    el.textContent = property.price.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    });
    el.addEventListener("click", onClick);
    return el;
  }

  // Build filtered set and render markers
  const watchValues = form.watch();
  const [selected, setSelected] = useState<Property | null>(null);
  const filtered = useMemo(() => {
    const { city, mode, bedrooms, type, builder } = watchValues;
    return (allProperties ?? []).filter((p) => {
      if (city) {
        const c = `${p.address.city}-${p.address.state}`;
        if (c !== city) return false;
      }
      if (type && p.type !== type) return false;
      if (bedrooms) {
        const min = Number(bedrooms);
        if (!Number.isNaN(min) && p.bedrooms < min) return false;
      }
      if (builder && p.builder !== builder) return false;
      // mode is not yet split in mocks; accept all for now
      return (
        typeof p.address.lat === "number" && typeof p.address.lng === "number"
      );
    });
  }, [allProperties, watchValues]);

  // Builder options depend on city
  const builderOptions = useMemo(() => {
    const city = watchValues.city;
    if (!city) return [] as string[];
    const [name, state] = city.split("-");
    const set = new Set<string>();
    (allProperties ?? []).forEach((p) => {
      if (p.address.city === name && p.address.state === state && p.builder) {
        set.add(p.builder);
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [allProperties, watchValues.city]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
    if (!filtered.length) return;
    // Fit bounds to markers
    const bounds = new mapboxgl.LngLatBounds();
    filtered.forEach((p) => {
      const marker = new mapboxgl.Marker({
        element: createPriceMarkerEl(p, () => setSelected(p)),
        anchor: "bottom",
      }).setLngLat([p.address.lng as number, p.address.lat as number]);
      markersRef.current.push(marker.addTo(map));
      bounds.extend([p.address.lng as number, p.address.lat as number]);
    });
    // Only auto-zoom when usuário escolhe uma cidade (para preservar o "globo grande" na entrada)
    if (!bounds.isEmpty() && watchValues.city) {
      map.fitBounds(bounds, { padding: 60, duration: 700, maxZoom: 14 });
    }
  }, [filtered, watchValues.city]);

  return (
    <div className="relative min-h-screen">
      {/* Sticky filter bar */}
      <div className="sticky top-24 z-30 mx-auto max-w-7xl px-4 sm:px-6">
        <div className="rounded-full border border-zinc-200 bg-white/80 px-4 py-2 shadow-lg backdrop-blur-md ring-1 ring-black/5 dark:border-zinc-800 dark:bg-zinc-900/70">
          <Form {...form}>
            <form className="flex items-center gap-3 overflow-x-auto">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem className="w-[220px] shrink-0">
                    <FormControl>
                      <Select
                        value={field.value ?? undefined}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Localização" />
                        </SelectTrigger>
                        <SelectContent>
                          {cityOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mode"
                render={({ field }) => (
                  <FormItem className="w-[150px] shrink-0">
                    <FormControl>
                      <Select
                        value={field.value ?? "comprar"}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Transação" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="comprar">Comprar</SelectItem>
                          <SelectItem value="alugar">Alugar</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem className="w-[170px] shrink-0">
                    <FormControl>
                      <Select
                        value={field.value ?? undefined}
                        onValueChange={(val) =>
                          field.onChange(val === "__all__" ? undefined : val)
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__all__">Todos</SelectItem>
                          <SelectItem value="casa">Casa</SelectItem>
                          <SelectItem value="apartamento">
                            Apartamento
                          </SelectItem>
                          <SelectItem value="terreno">Terreno</SelectItem>
                          <SelectItem value="comercial">Comercial</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bedrooms"
                render={({ field }) => (
                  <FormItem className="w-[130px] shrink-0">
                    <FormControl>
                      <Select
                        value={field.value ?? undefined}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Quartos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1+</SelectItem>
                          <SelectItem value="2">2+</SelectItem>
                          <SelectItem value="3">3+</SelectItem>
                          <SelectItem value="4">4+</SelectItem>
                          <SelectItem value="5">5+</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="w-[170px] shrink-0">
                    <FormControl>
                      <Select
                        value={field.value ?? undefined}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="na-planta">Na planta</SelectItem>
                          <SelectItem value="em-construcao">
                            Em construção
                          </SelectItem>
                          <SelectItem value="pronto">Pronto</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="builder"
                render={({ field }) => (
                  <FormItem className="w-[200px] shrink-0">
                    <FormControl>
                      <Select
                        value={field.value ?? undefined}
                        onValueChange={field.onChange}
                        disabled={
                          !watchValues.city || builderOptions.length === 0
                        }
                      >
                        <SelectTrigger
                          className="w-full"
                          disabled={
                            !watchValues.city || builderOptions.length === 0
                          }
                        >
                          <SelectValue placeholder="Construtora" />
                        </SelectTrigger>
                        <SelectContent>
                          {builderOptions.map((name) => (
                            <SelectItem key={name} value={name}>
                              {name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="ml-auto shrink-0">
                <Link
                  href="/imoveis"
                  className="rounded-full border border-zinc-300 px-3 py-1 text-xs text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  Ver lista
                </Link>
              </div>
            </form>
          </Form>
        </div>
      </div>

      {/* Fullscreen map */}
      <div ref={mapContainer} className="mt-3 h-[calc(100vh-110px)] w-full" />

      {/* Property preview dialog */}
      <PropertyDialog
        open={!!selected}
        property={selected}
        onOpenChange={(open) => (open ? void 0 : setSelected(null))}
      />
    </div>
  );
}
