"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { getMapboxToken, siteMapStyle } from "@/lib/mapbox";
import {
  getProperties,
  getSiteConfig,
  getTags,
  type TransactionTypeOption,
} from "@/services/properties";
import type { TagDto } from "@/lib/sax-api";
import type { Property } from "@/types/realEstate";
import { MapPin, ArrowLeftRight, Home, Tag, Bed } from "lucide-react";
import {
  applyFilter,
  normalizeBuilderName,
  type PropertyFilterValues,
} from "@/lib/property-filter";

const FALLBACK_TRANSACTION_TYPES: TransactionTypeOption[] = [
  { value: "venda", label: "Venda" },
  { value: "aluguel", label: "Aluguel" },
  { value: "crowdfunding", label: "Crowdfunding" },
];

/** Só imóveis com coordenadas válidas entram como marcador no mapa. */
function hasValidMapCoords(p: Property): boolean {
  const lat = Number(p.address?.lat);
  const lng = Number(p.address?.lng);
  return Number.isFinite(lat) && Number.isFinite(lng);
}
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
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
import Link from "next/link";
import PropertyDialog from "@/components/modals/PropertyDialog";
import HomeFilter, {
  type FormValues as HomeFilterValues,
} from "@/sections/home/HomeFilter";

const schema = z.object({
  city: z.string().optional(),
  mode: z.string().default("venda"),
  type: z
    .enum([
      "casa",
      "casa_condominio",
      "apartamento",
      "duplex",
      "master",
      "flat",
      "cobertura",
      "terraco",
      "terreno",
      "sala",
      "galpao",
      "kitnet",
      "studio",
      "comercial",
    ])
    .optional(),
  bedrooms: z.string().optional(),
  priceRange: z.enum(["lt500k", "500k-1m", "1m-2m", "gt2m"]).optional(),
  tag: z.string().optional(),
  builder: z.string().optional(),
});
type FormValues = z.input<typeof schema>;

function toFilterPayload(v: FormValues): PropertyFilterValues {
  return {
    city: v.city && v.city !== "__all__" ? v.city : undefined,
    mode: v.mode,
    type: v.type,
    bedrooms: v.bedrooms && v.bedrooms !== "__all__" ? v.bedrooms : undefined,
    priceRange: v.priceRange,
    tag: v.tag && v.tag !== "__all__" ? v.tag : undefined,
    builder:
      v.builder && v.builder !== "__all__" && v.builder !== ""
        ? v.builder
        : undefined,
  };
}

function buildImoveisListHref(v: FormValues): string {
  const params = new URLSearchParams();
  if (v.city && v.city !== "__all__") params.set("city", v.city);
  if (v.mode) params.set("mode", v.mode);
  if (v.type) params.set("type", v.type);
  if (v.bedrooms && v.bedrooms !== "__all__")
    params.set("bedrooms", v.bedrooms);
  if (v.priceRange) params.set("priceRange", v.priceRange);
  if (v.tag && v.tag !== "__all__") params.set("tag", v.tag);
  if (v.builder && v.builder !== "__all__") params.set("builder", v.builder);
  const q = params.toString();
  return q ? `/imoveis?${q}` : "/imoveis";
}

export default function MapaPage() {
  const [transactionTypes, setTransactionTypes] = useState<
    TransactionTypeOption[]
  >(FALLBACK_TRANSACTION_TYPES);
  const defaultMode = transactionTypes[0]?.value ?? "venda";

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      mode: defaultMode,
      city: undefined,
      type: undefined,
      bedrooms: undefined,
      priceRange: undefined,
      tag: undefined,
      builder: undefined,
    },
  });
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [tagsFromApi, setTagsFromApi] = useState<TagDto[]>([]);

  useEffect(() => {
    getProperties().then(setAllProperties);
  }, []);
  useEffect(() => {
    getTags().then(setTagsFromApi);
  }, []);
  useEffect(() => {
    getSiteConfig().then((c) => {
      if (c.transactionTypes?.length) setTransactionTypes(c.transactionTypes);
    });
  }, []);

  /** Mesma origem que /imoveis e HomeFilter: cidades presentes nos imóveis da API (ou fallback mock). */
  const cityOptions = useMemo(() => {
    const set = new Set<string>();
    (allProperties ?? []).forEach((p) => {
      set.add(`${p.address.city}-${p.address.state}`);
    });
    return Array.from(set)
      .sort((a, b) => a.localeCompare(b))
      .map((value) => ({
        value,
        label: value.replace("-", " - "),
      }));
  }, [allProperties]);

  const token = getMapboxToken();
  const INITIAL_CENTER: [number, number] = [-56, -15];
  /** Desktop: continente América do Sul */
  const INITIAL_ZOOM = 2.1;
  /** Mobile: globo inteiro (menos zoom), alinhado à vista “globo” com América do Sul */
  const INITIAL_ZOOM_MOBILE = 1.12;
  const INITIAL_PITCH = 0;
  const INITIAL_BEARING = 0;

  // Initialize map with globe projection (large globe view)
  useEffect(() => {
    if (!token || !mapContainer.current) return;
    mapboxgl.accessToken = token;
    const isMobile =
      typeof window !== "undefined" &&
      window.matchMedia?.("(max-width: 767px)").matches;
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: siteMapStyle,
      center: INITIAL_CENTER, // South America center (globe view)
      zoom: isMobile ? INITIAL_ZOOM_MOBILE : INITIAL_ZOOM,
      pitch: INITIAL_PITCH,
      bearing: INITIAL_BEARING,
      minZoom: isMobile ? 0.85 : undefined,
    });
    mapRef.current = map;
    map.addControl(
      new mapboxgl.NavigationControl({ showCompass: false }),
      "top-right",
    );
    map.on("style.load", () => {
      const mapApi = map as unknown as {
        setProjection?: (mode: string) => void;
        setFog?: (cfg: Record<string, unknown>) => void;
      };
      // Mobile + desktop: globo. No mobile a névoa clara deixava o fundo branco; usamos céu escuro + estrelas (como antes da névoa clara).
      mapApi.setProjection?.("globe");
      // Mesmo céu escuro + estrelas no mobile e no desktop
      mapApi.setFog?.({
        color: "rgb(18, 26, 42)",
        "high-color": "rgb(32, 44, 68)",
        "space-color": "rgb(6, 8, 18)",
        "horizon-blend": 0.14,
        "star-intensity": 0.5,
      });
      if (!isMobile) {
        try {
          const layers = map.getStyle().layers ?? [];
          const labelLayerId = layers.find(
            (l) => l.type === "symbol" && (l.layout as any)?.["text-field"],
          )?.id;
          map.addLayer(
            {
              id: "add-3d-buildings",
              source: "composite",
              "source-layer": "building",
              filter: ["==", ["get", "extrude"], "true"],
              type: "fill-extrusion",
              minzoom: 15,
              paint: {
                "fill-extrusion-color": "#888",
                "fill-extrusion-height": [
                  "interpolate",
                  ["linear"],
                  ["zoom"],
                  15,
                  0,
                  16,
                  ["get", "height"],
                ],
                "fill-extrusion-base": [
                  "interpolate",
                  ["linear"],
                  ["zoom"],
                  15,
                  0,
                  16,
                  ["get", "min_height"],
                ],
                "fill-extrusion-opacity": 0.6,
              },
            },
            labelLayerId ?? undefined,
          );
        } catch {}
      }
    });

    return () => map.remove();
  }, [token]);

  // Format price as pill HTML marker with click handler
  function createPriceMarkerEl(
    property: Property,
    onClick: () => void,
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
    const list = applyFilter(allProperties ?? [], toFilterPayload(watchValues));
    return list.filter(hasValidMapCoords);
  }, [allProperties, watchValues]);

  const builderOptions = useMemo(() => {
    const { city } = watchValues;
    // Dedupe por nome normalizado, mantendo o primeiro rótulo original.
    const byKey = new Map<string, string>();
    (allProperties ?? []).forEach((p) => {
      const name = p.builder?.trim();
      if (!name) return;
      const cityKey = `${p.address.city}-${p.address.state}`;
      if (city && city !== "__all__" && cityKey !== city) return;
      const key = normalizeBuilderName(name);
      if (!byKey.has(key)) byKey.set(key, name);
    });
    return Array.from(byKey.values()).sort((a, b) => a.localeCompare(b));
  }, [allProperties, watchValues.city]);

  const tagOptions = useMemo(() => {
    if (tagsFromApi.length > 0) {
      return [...tagsFromApi]
        .sort(
          (a, b) =>
            (a.sortOrder ?? 0) - (b.sortOrder ?? 0) ||
            a.name.localeCompare(b.name),
        )
        .map((t) => t.name);
    }
    const set = new Set<string>();
    (allProperties ?? []).forEach((p) => {
      (p.tagImovel ?? []).forEach((a) => set.add(a));
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [tagsFromApi, allProperties]);

  const builderSelectItems = useMemo(
    () => [
      { value: "__all__", label: "Todas" },
      ...builderOptions.map((name) => ({ value: name, label: name })),
    ],
    [builderOptions],
  );

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Prefer markers do conjunto filtrado; se vazio mas houver cidade, usamos bounds da cidade
    const addMarkersAndGetBounds = (items: Property[]) => {
      const b = new mapboxgl.LngLatBounds();
      items.forEach((p) => {
        if (!hasValidMapCoords(p)) return;
        const lng = Number(p.address.lng);
        const lat = Number(p.address.lat);
        const marker = new mapboxgl.Marker({
          element: createPriceMarkerEl(p, () => setSelected(p)),
          anchor: "bottom",
        }).setLngLat([lng, lat]);
        markersRef.current.push(marker.addTo(map));
        b.extend([lng, lat]);
      });
      return b;
    };

    let bounds: mapboxgl.LngLatBounds | null = null;
    if (filtered.length) {
      bounds = addMarkersAndGetBounds(filtered);
    } else if (watchValues.city && watchValues.city !== "__all__") {
      // Conjunto base por cidade (ignora outros filtros) para garantir navegação ao trocar apenas a localização
      const [cityName, state] = (watchValues.city ?? "").split("-");
      const cityItems = (allProperties ?? []).filter(
        (p) =>
          p.address.city === cityName &&
          p.address.state === state &&
          hasValidMapCoords(p),
      );
      bounds = cityItems.length ? addMarkersAndGetBounds(cityItems) : null;
    }

    if (
      bounds &&
      !bounds.isEmpty() &&
      watchValues.city &&
      watchValues.city !== "__all__"
    ) {
      const isMobile =
        typeof window !== "undefined" &&
        window.matchMedia?.("(max-width: 767px)").matches;
      const padding = isMobile
        ? { top: 120, bottom: 20, left: 20, right: 20 }
        : { top: 60, bottom: 60, left: 60, right: 60 };
      map.fitBounds(bounds, { padding, duration: 700, maxZoom: 14 });
      // Remove persistent padding after a single frame to manter o globo centralizado ao dar zoom out
      map.once("moveend", () => {
        map.easeTo({ padding: 0, duration: 0 });
      });
    }
  }, [filtered, watchValues.city]);

  // Always return to the initial view when nenhuma cidade está selecionada
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (!watchValues.city || watchValues.city === "__all__") {
      const isMobile =
        typeof window !== "undefined" &&
        window.matchMedia?.("(max-width: 767px)").matches;
      map.easeTo({
        center: INITIAL_CENTER,
        zoom: isMobile ? INITIAL_ZOOM_MOBILE : INITIAL_ZOOM,
        pitch: INITIAL_PITCH,
        bearing: INITIAL_BEARING,
        duration: 400,
      });
    }
  }, [watchValues.city]);

  return (
    <div className="relative min-h-screen">
      {/* Sticky: mesmo padrão visual de /imoveis (grid + label + ícone) */}
      <div className="sticky top-28 z-30 mx-auto hidden max-w-7xl px-4 sm:px-6 2xl:top-32 2xl:block">
        <div className="rounded-2xl border border-zinc-200 bg-white/90 px-4 py-4 shadow-lg backdrop-blur-md ring-1 ring-black/5 dark:border-zinc-800 dark:bg-zinc-900/80">
          <Form {...form}>
            <form className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-8 items-end [&>*]:min-w-0">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <span className="block px-1 text-[10px] font-medium text-black/90 dark:text-white">
                      Localização
                    </span>
                    <FormControl>
                      <div className="flex h-11 min-w-0 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 dark:border-zinc-800 dark:bg-zinc-900">
                        <MapPin className="h-4 w-4 shrink-0 text-black/15" />
                        <Select
                          value={field.value ?? undefined}
                          onValueChange={(val) =>
                            field.onChange(val === "__all__" ? undefined : val)
                          }
                          className="min-w-0 flex-1 border-0 bg-transparent px-0 text-black/80"
                          menuClassName="w-[340px]"
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Localização" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__all__">Todos</SelectItem>
                            {cityOptions.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mode"
                render={({ field }) => (
                  <FormItem>
                    <span className="block px-1 text-[10px] font-medium text-black/90 dark:text-white">
                      Tipo de Transação
                    </span>
                    <FormControl>
                      <div className="flex h-11 min-w-0 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 dark:border-zinc-800 dark:bg-zinc-900">
                        <ArrowLeftRight className="h-4 w-4 shrink-0 text-black/15" />
                        <Select
                          value={field.value ?? defaultMode}
                          onValueChange={field.onChange}
                          className="min-w-0 flex-1 border-0 bg-transparent px-0 text-black/80"
                          menuMinWidth={220}
                          items={transactionTypes.map((opt) => ({
                            value: opt.value,
                            label: opt.label,
                          }))}
                          placeholder="Transação"
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Transação" />
                          </SelectTrigger>
                        </Select>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <span className="block px-1 text-[10px] font-medium text-black/90 dark:text-white">
                      Tipo
                    </span>
                    <FormControl>
                      <div className="flex h-11 min-w-0 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 dark:border-zinc-800 dark:bg-zinc-900">
                        <Home className="h-4 w-4 shrink-0 text-black/15" />
                        <Select
                          value={field.value ?? undefined}
                          onValueChange={(val) =>
                            field.onChange(val === "__all__" ? undefined : val)
                          }
                          className="min-w-0 flex-1 border-0 bg-transparent px-0 text-black/80"
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__all__">Todos</SelectItem>
                            <SelectItem value="casa">Casa</SelectItem>
                            <SelectItem value="casa_condominio">
                              Casa Condomínio
                            </SelectItem>
                            <SelectItem value="apartamento">
                              Apartamento
                            </SelectItem>
                            <SelectItem value="duplex">Duplex</SelectItem>
                            <SelectItem value="master">Master</SelectItem>
                            <SelectItem value="flat">Flat</SelectItem>
                            <SelectItem value="cobertura">Cobertura</SelectItem>
                            <SelectItem value="terraco">Terraço</SelectItem>
                            <SelectItem value="terreno">Terreno</SelectItem>
                            <SelectItem value="sala">Sala</SelectItem>
                            <SelectItem value="galpao">Galpão</SelectItem>
                            <SelectItem value="kitnet">Kitnet</SelectItem>
                            <SelectItem value="studio">Studio</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bedrooms"
                render={({ field }) => (
                  <FormItem>
                    <span className="block px-1 text-[10px] font-medium text-black/90 dark:text-white">
                      Quartos
                    </span>
                    <FormControl>
                      <div className="flex h-11 min-w-0 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 dark:border-zinc-800 dark:bg-zinc-900">
                        <Bed className="h-4 w-4 shrink-0 text-black/15" />
                        <Select
                          value={field.value ?? undefined}
                          onValueChange={(val) =>
                            field.onChange(val === "__all__" ? undefined : val)
                          }
                          className="min-w-0 flex-1 border-0 bg-transparent px-0 text-black/80"
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Quartos" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__all__">Todos</SelectItem>
                            <SelectItem value="1">1+</SelectItem>
                            <SelectItem value="2">2+</SelectItem>
                            <SelectItem value="3">3+</SelectItem>
                            <SelectItem value="4">4+</SelectItem>
                            <SelectItem value="5">5+</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="priceRange"
                render={({ field }) => (
                  <FormItem>
                    <span className="block px-1 text-[10px] font-medium text-black/90 dark:text-white">
                      Preço
                    </span>
                    <FormControl>
                      <div className="flex h-11 min-w-0 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 dark:border-zinc-800 dark:bg-zinc-900">
                        <Tag className="h-4 w-4 shrink-0 text-black/15" />
                        <Select
                          value={field.value ?? undefined}
                          onValueChange={(val) =>
                            field.onChange(val === "__all__" ? undefined : val)
                          }
                          className="min-w-0 flex-1 border-0 bg-transparent px-0 text-black/80"
                          menuClassName="w-[280px]"
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__all__">Todos</SelectItem>
                            <SelectItem value="lt500k">
                              Até R$ 500.000
                            </SelectItem>
                            <SelectItem value="500k-1m">
                              R$ 500.000 - R$ 1.000.000
                            </SelectItem>
                            <SelectItem value="1m-2m">
                              R$ 1.000.000 - R$ 2.000.000
                            </SelectItem>
                            <SelectItem value="2m-4m">
                              R$ 2.000.000 - R$ 4.000.000
                            </SelectItem>
                            <SelectItem value="4m-6m">
                              R$ 4.000.000 - R$ 6.000.000
                            </SelectItem>
                            <SelectItem value="6m-8m">
                              R$ 6.000.000 - R$ 8.000.000
                            </SelectItem>
                            <SelectItem value="gt8m">
                              Acima de R$ 8.000.000
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tag"
                render={({ field }) => (
                  <FormItem>
                    <span className="block px-1 text-[10px] font-medium text-black/90 dark:text-white">
                      Tags
                    </span>
                    <FormControl>
                      <div className="flex h-11 min-w-0 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 dark:border-zinc-800 dark:bg-zinc-900">
                        <Tag className="h-4 w-4 shrink-0 text-black/15" />
                        <Select
                          value={field.value ?? "__all__"}
                          onValueChange={(val) =>
                            field.onChange(val === "__all__" ? undefined : val)
                          }
                          className="min-w-0 flex-1 border-0 bg-transparent px-0 text-black/80"
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__all__">Todas</SelectItem>
                            {tagOptions.map((name) => (
                              <SelectItem key={name} value={name}>
                                {name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="builder"
                render={({ field }) => (
                  <FormItem>
                    <span className="block px-1 text-[10px] font-medium text-black/90 dark:text-white">
                      Construtora
                    </span>
                    <FormControl>
                      <div className="flex h-11 min-w-0 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 dark:border-zinc-800 dark:bg-zinc-900">
                        <Home className="h-4 w-4 shrink-0 text-black/15" />
                        <Select
                          value={field.value ?? "__all__"}
                          onValueChange={(val) =>
                            field.onChange(val === "__all__" ? undefined : val)
                          }
                          className="min-w-0 flex-1 border-0 bg-transparent px-0 text-black/80"
                          items={builderSelectItems}
                          placeholder="Construtora"
                          menuMinWidth={200}
                          disabled={builderOptions.length === 0}
                        >
                          <SelectTrigger
                            className="w-full"
                            disabled={builderOptions.length === 0}
                          >
                            <SelectValue placeholder="Construtora" />
                          </SelectTrigger>
                        </Select>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="flex flex-col justify-end gap-1">
                <span
                  className="block px-1 text-[10px] font-medium text-transparent select-none"
                  aria-hidden
                >
                  .
                </span>
                <Link
                  href={buildImoveisListHref(watchValues)}
                  className="inline-flex h-11 shrink-0 items-center justify-center rounded-lg border border-zinc-300 px-4 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-100 dark:hover:bg-zinc-800"
                >
                  Ver lista
                </Link>
              </div>
            </form>
          </Form>
        </div>
      </div>

      {/* Fullscreen map; mapa-map-root: offset dos +/- no desktop (globals.css) */}
      <div
        ref={mapContainer}
        className="mapa-map-root mt-3 h-[calc(100vh-110px)] w-full 2xl:h-[calc(100vh-118px)]"
      />

      {/* Mobile: usa o mesmo drawer de filtros da Home; o botão da header dispara open-map-filters */}
      <div className="2xl:hidden">
        <HomeFilter
          mobileTriggerPosition="top"
          hideMobileTrigger
          hideStatus
          onSearch={(values: HomeFilterValues) => {
            form.setValue("city", values.city ?? undefined);
            form.setValue("mode", values.mode ?? defaultMode);
            form.setValue(
              "type",
              (values.type ?? undefined) as FormValues["type"],
            );
            form.setValue(
              "bedrooms",
              values.bedrooms && values.bedrooms !== "__all__"
                ? values.bedrooms
                : undefined,
            );
            form.setValue("priceRange", undefined);
            form.setValue(
              "tag",
              values.tag?.length ? values.tag[0] : undefined,
            );
            form.setValue(
              "builder",
              values.builder && values.builder !== "__all__"
                ? values.builder
                : undefined,
            );
            const map = mapRef.current;
            if (!map) return;
            const payload: PropertyFilterValues = {
              city:
                values.city && values.city !== "__all__"
                  ? values.city
                  : undefined,
              mode: values.mode,
              type: values.type,
              bedrooms:
                values.bedrooms && values.bedrooms !== "__all__"
                  ? values.bedrooms
                  : undefined,
              priceMin: values.priceMin,
              priceMax: values.priceMax,
              builder:
                values.builder && values.builder !== "__all__"
                  ? values.builder
                  : undefined,
              tags:
                Array.isArray(values.tag) && values.tag.length
                  ? values.tag
                  : undefined,
            };
            const match = applyFilter(allProperties ?? [], payload).filter(
              hasValidMapCoords,
            );
            if (match.length) {
              const bounds = new mapboxgl.LngLatBounds();
              match.forEach((p) => {
                bounds.extend([Number(p.address.lng), Number(p.address.lat)]);
              });
              map.fitBounds(bounds, {
                padding: 60,
                duration: 700,
                maxZoom: 14,
              });
              map.once("moveend", () =>
                map.easeTo({ padding: 0, duration: 0 }),
              );
            }
            try {
              window.dispatchEvent(new CustomEvent("close-map-filters"));
            } catch {}
          }}
        />
      </div>

      {/* Property preview dialog */}
      <PropertyDialog
        open={!!selected}
        property={selected}
        onOpenChange={(open) => (open ? void 0 : setSelected(null))}
      />
    </div>
  );
}
