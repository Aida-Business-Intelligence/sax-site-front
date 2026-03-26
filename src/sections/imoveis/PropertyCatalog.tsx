"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { trackEvent } from "@/lib/analytics";
import { trackEvent as trackCrm } from "@/lib/tracking-crm";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Property } from "@/types/realEstate";
import type { SectionDto } from "@/lib/sax-api";
import type { TransactionTypeOption } from "@/services/properties";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import HomeFilter from "@/sections/home/HomeFilter";
import PropertySection from "./PropertySection";
import RecommendationsSection from "./RecommendationsSection";
import FeaturedBanner from "./FeaturedBanner";
import FeaturedCarousel from "./FeaturedCarousel";
import MapTeaser from "./MapTeaser";
import PartnersSection from "./PartnersSection";
import { MapPin, ArrowLeftRight, Home, Tag, Bed } from "lucide-react";
import { cn } from "@/lib/utils";
import { applyFilter } from "@/lib/property-filter";

function getParam(
  params: Record<string, string | string[] | undefined> | undefined,
  key: string
): string | undefined {
  if (!params || !(key in params)) return undefined;
  const v = params[key];
  return Array.isArray(v) ? v[0] : (v as string | undefined);
}

function buildVerTodosHref(sectionSlug: string, filters: FormValues): string {
  const q = new URLSearchParams();
  q.set("secao", sectionSlug);
  const mode = filters.mode ?? "venda";
  q.set("mode", mode);
  if (filters.city && filters.city !== "__all__") q.set("city", filters.city);
  if (filters.type) q.set("type", filters.type);
  if (filters.bedrooms) q.set("bedrooms", filters.bedrooms);
  if (filters.priceRange) q.set("priceRange", filters.priceRange);
  if (filters.tag && filters.tag !== "__all__") q.set("tag", filters.tag);
  if (filters.builder && filters.builder !== "__all__")
    q.set("builder", filters.builder);
  return `/imoveis?${q.toString()}`;
}

const schema = z.object({
  city: z.string().optional(),
  mode: z.string().default("venda"),
  type: z.enum(["casa", "apartamento", "terreno", "comercial"]).optional(),
  bedrooms: z.string().optional(),
  priceRange: z.enum(["lt500k", "500k-1m", "1m-2m", "gt2m"]).optional(),
  tag: z.string().optional(),
  builder: z.string().optional(),
});
type FormValues = z.input<typeof schema>;

type SectionWithProperties = { section: SectionDto; properties: Property[] };

const FALLBACK_TRANSACTION_TYPES: TransactionTypeOption[] = [
  { value: "venda", label: "Venda" },
  { value: "aluguel", label: "Aluguel" },
  { value: "crowdfunding", label: "Crowdfunding" },
];

function PropertyCatalog({
  properties,
  sectionsWithProperties = [],
  tags = [],
  initialSearchParams,
  featuredPropertyIds = [],
  partnerLogos = [],
  transactionTypes = [],
}: {
  properties: Property[];
  sectionsWithProperties?: SectionWithProperties[];
  tags?: { id: string; name: string; slug: string; sortOrder?: number }[];
  initialSearchParams?: Record<string, string | string[] | undefined>;
  featuredPropertyIds?: string[];
  partnerLogos?: { url: string; name?: string }[];
  transactionTypes?: TransactionTypeOption[];
}) {
  const typeOptions =
    transactionTypes.length > 0 ? transactionTypes : FALLBACK_TRANSACTION_TYPES;
  const defaultMode = typeOptions[0]?.value ?? "venda";

  const defaultValuesFromParams = useMemo(() => {
    const modeParam = getParam(initialSearchParams, "mode");
    const modeMapped =
      modeParam === "comprar"
        ? "venda"
        : modeParam === "alugar"
          ? "aluguel"
          : modeParam;
    const mode =
      modeMapped && typeOptions.some((t) => t.value === modeMapped)
        ? modeMapped
        : defaultMode;
    return {
      mode,
      tag: getParam(initialSearchParams, "tag") ?? "__all__",
      builder: getParam(initialSearchParams, "builder") ?? "__all__",
      city: getParam(initialSearchParams, "city"),
      type: getParam(initialSearchParams, "type") as FormValues["type"],
      bedrooms: getParam(initialSearchParams, "bedrooms"),
      priceRange: getParam(
        initialSearchParams,
        "priceRange"
      ) as FormValues["priceRange"],
    };
  }, [initialSearchParams, typeOptions, defaultMode]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultValuesFromParams,
  });

  const sectionSlugFromUrl = getParam(initialSearchParams, "secao");

  useEffect(() => {
    if (!initialSearchParams) return;
    form.reset(defaultValuesFromParams);
  }, [initialSearchParams, form, defaultValuesFromParams]);

  const [selected, setSelected] = useState<Property | null>(null);

  const cities = useMemo(() => {
    const set = new Set<string>();
    (properties ?? []).forEach((p) => {
      set.add(`${p.address.city}-${p.address.state}`);
    });
    return Array.from(set)
      .sort((a, b) => a.localeCompare(b))
      .map((value) => ({ value, label: value.replace("-", " - ") }));
  }, [properties]);

  const watchValues = form.watch();
  const watchMode = form.watch("mode");
  const searchTrackRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (searchTrackRef.current) clearTimeout(searchTrackRef.current);
    searchTrackRef.current = setTimeout(() => {
      searchTrackRef.current = null;
      const payload = {
        city: watchValues.city,
        mode: watchValues.mode,
        type: watchValues.type,
        bedrooms: watchValues.bedrooms,
        priceRange: watchValues.priceRange,
        tag: watchValues.tag,
        builder: watchValues.builder,
      };
      trackEvent("search", "/imoveis", payload);
      trackCrm("SEARCH", payload);
    }, 800);
    return () => {
      if (searchTrackRef.current) clearTimeout(searchTrackRef.current);
    };
  }, [
    watchValues.city,
    watchValues.mode,
    watchValues.type,
    watchValues.bedrooms,
    watchValues.priceRange,
    watchValues.tag,
    watchValues.builder,
  ]);

  const builderOptions = useMemo(() => {
    const { city } = watchValues;
    const set = new Set<string>();
    (properties ?? []).forEach((p) => {
      const cityKey = `${p.address.city}-${p.address.state}`;
      if (!p.builder) return;
      if (city && cityKey !== city) return;
      set.add(p.builder);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [properties, watchValues.city]);

  const builderSelectItems = useMemo(
    () => [
      { value: "__all__", label: "Todas" },
      ...builderOptions.map((name) => ({ value: name, label: name })),
    ],
    [builderOptions]
  );

  const tagOptions = useMemo(() => {
    if (tags.length > 0) {
      return tags
        .sort(
          (a, b) =>
            (a.sortOrder ?? 0) - (b.sortOrder ?? 0) ||
            a.name.localeCompare(b.name)
        )
        .map((t) => t.name);
    }
    const set = new Set<string>();
    (properties ?? []).forEach((p) => {
      (p.tagImovel ?? []).forEach((a) => set.add(a));
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [tags, properties]);

  const filtered = useMemo(
    () => applyFilter(properties ?? [], watchValues),
    [properties, watchValues, watchMode]
  );

  const filteredSections = useMemo(() => {
    const withFiltered = sectionsWithProperties.map(
      ({ section, properties: sectionProps }) => ({
        section,
        properties: applyFilter(sectionProps, watchValues),
      })
    );
    return withFiltered.filter(({ properties }) => properties.length > 0);
  }, [sectionsWithProperties, watchValues, watchMode]);

  const displaySections = useMemo(() => {
    if (!sectionSlugFromUrl) return filteredSections;
    return filteredSections.filter(
      (s) => s.section.slug === sectionSlugFromUrl
    );
  }, [filteredSections, sectionSlugFromUrl]);

  const featuredProperties = useMemo(() => {
    if (!featuredPropertyIds?.length) return [];
    const idSet = new Set(featuredPropertyIds);
    const byId = new Map((properties ?? []).map((p) => [p.id, p]));
    return featuredPropertyIds
      .map((id) => byId.get(id))
      .filter((p): p is Property => p != null);
  }, [properties, featuredPropertyIds]);

  const bannerProperty = filtered[0] ?? properties[0] ?? null;
  const hasPartners =
    Array.isArray(partnerLogos) && partnerLogos.length > 0;

  return (
    <>
      {/* Filtro só em telas muito grandes; tablet/iPad = fluxo mobile */}
      <div className="sticky top-32 z-40 mb-20 mt-8 relative hidden 2xl:block">
        <Form {...form}>
          <form className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 relative z-40 [&>*]:min-w-0">
            {/* Localização */}
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
                        onValueChange={field.onChange}
                        className="min-w-0 flex-1 text-black/80 border-0 bg-transparent px-0"
                        menuClassName="w-[340px]"
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Localização" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__all__">Todos</SelectItem>
                          {cities.map((opt) => (
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
            {/* Transação */}
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
                        className="min-w-0 flex-1 text-black/80 border-0 bg-transparent px-0"
                        menuMinWidth={220}
                        items={typeOptions.map((opt) => ({
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
            {/* Tipo */}
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
                        className="min-w-0 flex-1 text-black/80 border-0 bg-transparent px-0"
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Tipo" />
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
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
            {/* Quartos */}
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
                        className="min-w-0 flex-1 text-black/80 border-0 bg-transparent px-0"
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
            {/* Preço (faixas) */}
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
                        className="min-w-0 flex-1 text-black/80 border-0 bg-transparent px-0"
                        menuClassName="w-[280px]"
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__all__">Todos</SelectItem>
                          <SelectItem value="lt500k">Até R$ 500.000</SelectItem>
                          <SelectItem value="500k-1m">
                            R$ 500.000 - R$ 1.000.000
                          </SelectItem>
                          <SelectItem value="1m-2m">
                            R$ 1.000.000 - R$ 2.000.000
                          </SelectItem>
                          <SelectItem value="gt2m">
                            Acima de R$ 2.000.000
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
            {/* Tags */}
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
                        onValueChange={field.onChange}
                        className="min-w-0 flex-1 text-black/80 border-0 bg-transparent px-0"
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
            {/* Construtora */}
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
                        onValueChange={field.onChange}
                        className="min-w-0 flex-1 text-black/80 border-0 bg-transparent px-0"
                        items={builderSelectItems}
                        placeholder="Construtora"
                        menuMinWidth={200}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Construtora" />
                        </SelectTrigger>
                      </Select>
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
          </form>
        </Form>
        {/* Top/Bottom fades (desktop only) */}
        <div className="hidden 2xl:block pointer-events-none absolute left-1/2 -translate-x-1/2 -top-40 z-30 h-60 w-screen bg-linear-to-t from-white/98 via-white/95 to-transparent dark:from-zinc-900 dark:via-zinc-900/85" />
        <div className="hidden 2xl:block pointer-events-none absolute left-1/2 -translate-x-1/2 -bottom-1 z-30 h-32 w-screen bg-linear-to-b from-white/98 via-white/85 to-transparent dark:from-zinc-900 dark:via-zinc-900/85" />
      </div>

      {/* Mobile: usa o mesmo HomeFilter com botão no topo */}
      <div className="2xl:hidden">
        <HomeFilter mobileTriggerPosition="top" />
      </div>

      {/* Drawer anterior do mobile removido em favor do HomeFilter compartilhado */}

      {/* Seções vindas do backend (só aparecem as que você cadastrou) */}
      {displaySections.map(({ section, properties: sectionProps }) => (
        <PropertySection
          key={section.id}
          title={section.title}
          href={buildVerTodosHref(section.slug, watchValues)}
          properties={sectionProps}
          showAll={!!sectionSlugFromUrl}
        />
      ))}
      {featuredProperties.length > 0 ? (
        <FeaturedCarousel properties={featuredProperties} />
      ) : bannerProperty ? (
        <FeaturedBanner property={bannerProperty} />
      ) : null}
      {/* Mapa (mesmo ritmo de margem do banner: mb-12 no MapTeaser) → recomendações (grid estático) → parceiros (py-14 + logo rail) */}
      <div className="2xl:hidden">
        <MapTeaser properties={filtered} />
      </div>
      <div className="hidden 2xl:block">
        <div className="relative">
          <div className="sticky top-66 z-10">
            <MapTeaser properties={filtered} />
          </div>
          {/* Com parceiros: faixa longa pro mapa sticky “rolar”; sem parceiros: quase nada — senão fica um vão enorme até as recomendações */}
          <div
            aria-hidden="true"
            className={cn(hasPartners ? "h-[560px]" : "h-px shrink-0")}
          />
        </div>
      </div>
      <RecommendationsSection hasPartnersBelow={hasPartners} />
      <PartnersSection partnerLogos={partnerLogos} />
    </>
  );
}

export default PropertyCatalog;
export { PropertyCatalog };
