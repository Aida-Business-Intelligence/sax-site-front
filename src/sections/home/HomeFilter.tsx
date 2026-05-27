"use client";

import React, { useMemo, useEffect, useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Property } from "@/types/realEstate";
import { MapPin, ArrowLeftRight, Home, Tag, Bed } from "lucide-react";
import {
  getProperties,
  getSiteConfig,
  type TransactionTypeOption,
} from "@/services/properties";

const FALLBACK_TRANSACTION_TYPES: TransactionTypeOption[] = [
  { value: "venda", label: "Venda" },
  { value: "aluguel", label: "Aluguel" },
  { value: "crowdfunding", label: "Crowdfunding" },
];

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
  priceRange: z
    .enum(["__all__", "lt500k", "500k-1m", "1m-2m", "gt2m"])
    .default("__all__"),
  // Sliders (mobile drawer)
  priceMin: z.number().optional(),
  priceMax: z.number().optional(),
  areaMin: z.number().optional(),
  areaMax: z.number().optional(),
  status: z
    .enum([
      "__all__",
      "na-planta",
      "pronto",
      "mobiliado",
      "sem-mobilia",
      "reformado",
      "para-reformar",
    ])
    .default("__all__"),
  tag: z.array(z.string()).optional(),
  builder: z.string().optional(),
});
export type FormValues = z.input<typeof schema>;

type HomeFilterProps = {
  // Controls where the mobile trigger button appears. Default is 'bottom' (floating)
  mobileTriggerPosition?: "top" | "bottom";
  // On some pages (e.g., /imoveis/mapa) we open the drawer via header button,
  // so we hide the trigger but keep the drawer logic mounted.
  hideMobileTrigger?: boolean;
  /** Oculta o filtro de status (ex.: /imoveis/mapa — ainda sem dados consistentes). */
  hideStatus?: boolean;
  // Optional override to handle the search action externally (e.g., /imoveis/mapa)
  onSearch?: (values: FormValues) => void;
};

export default function HomeFilter({
  mobileTriggerPosition = "bottom",
  hideMobileTrigger = false,
  hideStatus = false,
  onSearch: onSearchOverride,
}: HomeFilterProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [transactionTypes, setTransactionTypes] = useState<
    TransactionTypeOption[]
  >(FALLBACK_TRANSACTION_TYPES);
  useEffect(() => {
    getProperties().then(setProperties);
  }, []);
  useEffect(() => {
    getSiteConfig().then((c) => {
      if (c.transactionTypes?.length) setTransactionTypes(c.transactionTypes);
    });
  }, []);
  const router = useRouter();
  const tagsMenuRef = useRef<HTMLDivElement | null>(null);
  const [tagsOpen, setTagsOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!tagsMenuRef.current) return;
      if (e.target instanceof Node && !tagsMenuRef.current.contains(e.target)) {
        setTagsOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);
  // Allow other parts of the app (e.g., header button) to open/close this drawer
  useEffect(() => {
    const open = () => setMobileOpen(true);
    const close = () => setMobileOpen(false);
    const win = window as unknown as {
      addEventListener: (type: string, listener: () => void) => void;
      removeEventListener: (type: string, listener: () => void) => void;
    };
    win.addEventListener("open-map-filters", open);
    win.addEventListener("close-map-filters", close);
    return () => {
      win.removeEventListener("open-map-filters", open);
      win.removeEventListener("close-map-filters", close);
    };
  }, []);

  const defaultMode = transactionTypes[0]?.value ?? "venda";
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      mode: defaultMode,
      priceRange: "__all__",
      status: "__all__",
    },
  });
  // Re-render on any field change so Select labels update correctly
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _watchAll = form.watch();

  const cities = useMemo(() => {
    const set = new Set<string>();
    (properties ?? []).forEach((p) => {
      set.add(`${p.address.city}-${p.address.state}`);
    });
    return Array.from(set)
      .sort((a, b) => a.localeCompare(b))
      .map((value) => ({ value, label: value.replace("-", " - ") }));
  }, [properties]);

  const tagOptions = useMemo(() => {
    const set = new Set<string>();
    (properties ?? []).forEach((p) =>
      (p.amenities ?? []).forEach((a) => set.add(a)),
    );
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [properties]);

  const builderOptions = useMemo(() => {
    const set = new Set<string>();
    (properties ?? []).forEach((p) => p.builder && set.add(p.builder));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [properties]);

  const builderSelectItems = useMemo(
    () => [
      { value: "__all__", label: "Todas" },
      ...builderOptions.map((name) => ({ value: name, label: name })),
    ],
    [builderOptions],
  );

  // Labels para barra compacta (mobile)
  const typeLabel = useMemo(() => {
    const v = form.watch("type");
    if (!v) return "Tipo";
    return v.charAt(0).toUpperCase() + v.slice(1);
  }, [form]);
  const priceLabel = useMemo(() => {
    const v = form.watch("priceRange");
    switch (v) {
      case "lt500k":
        return "Até 500k";
      case "500k-1m":
        return "500k–1M";
      case "1m-2m":
        return "1M–2M";
      case "gt2m":
        return "+2M";
      default:
        return "Preço";
    }
  }, [form]);
  const cityLabel = useMemo(() => {
    const v = form.watch("city");
    const found = cities.find((c) => c.value === v)?.label;
    return found
      ? found.length > 16
        ? found.slice(0, 16) + "…"
        : found
      : "Localização";
  }, [form, cities]);
  const modeLabel = useMemo(() => {
    const v = form.watch("mode");
    const opt = transactionTypes.find((t) => t.value === v);
    return opt?.label ?? "Transação";
  }, [form, transactionTypes]);
  const builderLabel = useMemo(() => {
    const v = form.watch("builder");
    return v ? (v.length > 16 ? v.slice(0, 16) + "…" : v) : "Construtora";
  }, [form]);

  // Helpers
  const formatBRL = (n: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(n);
  const clamp = (v: number, min: number, max: number) =>
    Math.min(max, Math.max(min, v));

  function onSearch() {
    const values = form.getValues();
    if (onSearchOverride) {
      onSearchOverride(values);
    } else {
      const params = new URLSearchParams();
      if (values.city) params.set("city", values.city);
      if (values.mode) params.set("mode", values.mode);
      if (values.type) params.set("type", values.type);
      if (values.bedrooms) params.set("bedrooms", values.bedrooms);
      if (values.priceRange && values.priceRange !== "__all__")
        params.set("priceRange", values.priceRange);
      if (typeof values.priceMin === "number")
        params.set("priceMin", String(values.priceMin));
      if (typeof values.priceMax === "number")
        params.set("priceMax", String(values.priceMax));
      if (typeof values.areaMin === "number")
        params.set("areaMin", String(values.areaMin));
      if (typeof values.areaMax === "number")
        params.set("areaMax", String(values.areaMax));
      if (values.status && values.status !== "__all__")
        params.set("status", values.status);
      if (values.tag && values.tag.length)
        params.set("tag", values.tag.join(","));
      if (values.builder && values.builder !== "__all__")
        params.set("builder", values.builder);
      router.push(`/imoveis?${params.toString()}`);
    }
  }

  return (
    <>
      {/* Desktop/Tablet card */}
      <div className="hidden 2xl:block rounded-2xl border border-zinc-200 bg-white/90 px-4 py-4 shadow-md backdrop-blur-md ring-1 ring-black/5 dark:border-zinc-800 dark:bg-zinc-900/80">
        {/* Título dentro do filtro (exibido no mobile/tablet para seguir o modelo) */}
        <div className="mb-3 text-center 2xl:hidden">
          <h2 className="text-base font-semibold leading-snug text-zinc-900 dark:text-white">
            Imóveis selecionados para um estilo de vida premium
          </h2>
        </div>
        <Form {...form}>
          <form className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-8 items-end [&>*]:min-w-0">
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
                      <MapPin
                        className="h-4 w-4 text-black/15 shrink-0"
                        strokeWidth={2.25}
                      />
                      <Select
                        value={field.value ?? undefined}
                        onValueChange={(val) =>
                          field.onChange(val === "__all__" ? undefined : val)
                        }
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
                      <Home
                        className="text-black/15 shrink-0"
                        strokeWidth={2.25}
                        size={18}
                      />
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
                        menuClassName="w-[184px]"
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
            {/* Preço */}
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
                        value={field.value ?? "__all__"}
                        onValueChange={field.onChange}
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
            {!hideStatus ? (
              <>
                {/* Status */}
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <span className="block px-1 text-[10px] font-medium text-black/90 dark:text-white">
                        Status
                      </span>
                      <FormControl>
                        <div className="flex h-11 min-w-0 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 dark:border-zinc-800 dark:bg-zinc-900">
                          <Tag className="h-4 w-4 shrink-0 text-black/30" />
                          <Select
                            value={field.value ?? "__all__"}
                            onValueChange={field.onChange}
                            className="min-w-0 flex-1 text-black/80 border-0 bg-transparent px-0"
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="__all__">Todos</SelectItem>
                              <SelectItem value="na-planta">
                                Na planta
                              </SelectItem>
                              <SelectItem value="pronto">Pronto</SelectItem>
                              <SelectItem value="mobiliado">
                                Mobiliado
                              </SelectItem>
                              <SelectItem value="sem-mobilia">
                                Sem mobília
                              </SelectItem>
                              <SelectItem value="reformado">
                                Reformado
                              </SelectItem>
                              <SelectItem value="para-reformar">
                                Para reformar
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </>
            ) : null}
            {/* Tags (multi-select compacto: mostra 1 + contador; seleção/deseleção no menu) */}
            <FormField
              control={form.control}
              name="tag"
              render={({ field }) => {
                const selected = field.value ?? [];
                return (
                  <FormItem>
                    <span className="block px-1 text-[10px] font-medium text-black/90 dark:text-white">
                      Tags
                    </span>
                    <FormControl>
                      <div ref={tagsMenuRef} className="relative">
                        <button
                          type="button"
                          onClick={() => setTagsOpen((v) => !v)}
                          className="flex h-11 w-full items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 text-left dark:border-zinc-800 dark:bg-zinc-900"
                        >
                          <Tag className="h-4 w-4 text-black/15" />
                          <span
                            className={[
                              "block w-full truncate",
                              selected.length === 0
                                ? "text-black/40"
                                : "text-black/80",
                            ].join(" ")}
                          >
                            {selected.length === 0
                              ? "Tags"
                              : `${selected[0]}${
                                  selected.length > 1
                                    ? ` +${selected.length - 1}`
                                    : ""
                                }`}
                          </span>
                          <svg
                            aria-hidden="true"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            className="ml-2 text-black/40"
                          >
                            <path fill="currentColor" d="M7 10l5 5 5-5z" />
                          </svg>
                        </button>

                        {tagsOpen ? (
                          <div className="absolute z-50 mt-2 max-h-60 w-[260px] overflow-auto rounded-lg border border-zinc-200 bg-white p-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
                            {tagOptions.map((name) => {
                              const active = selected.includes(name);
                              return (
                                <button
                                  type="button"
                                  key={name}
                                  onClick={() => {
                                    if (active) {
                                      field.onChange(
                                        selected.filter(
                                          (t: string) => t !== name,
                                        ),
                                      );
                                    } else {
                                      field.onChange([
                                        ...(selected as string[]),
                                        name,
                                      ]);
                                    }
                                  }}
                                  className={[
                                    "flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition",
                                    active
                                      ? "bg-zinc-100 font-medium dark:bg-zinc-800"
                                      : "hover:bg-zinc-100 dark:hover:bg-zinc-800",
                                  ].join(" ")}
                                >
                                  <span>{name}</span>
                                  {active ? (
                                    <svg
                                      width="16"
                                      height="16"
                                      viewBox="0 0 24 24"
                                      className="text-teal-600"
                                    >
                                      <path
                                        fill="currentColor"
                                        d="M9 16.2l-3.5-3.5L4 14.2 9 19l12-12-1.5-1.5z"
                                      />
                                    </svg>
                                  ) : null}
                                </button>
                              );
                            })}
                          </div>
                        ) : null}
                      </div>
                    </FormControl>
                  </FormItem>
                );
              }}
            />

            {/* Buscar */}
            <div className="col-span-full flex justify-center">
              <button
                type="button"
                onClick={onSearch}
                className="h-11 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Buscar Imóvel
              </button>
            </div>
          </form>
        </Form>
      </div>

      {/* Mobile: botão único + drawer lateral */}
      <div className="2xl:hidden">
        {!hideMobileTrigger &&
          (mobileTriggerPosition === "bottom" ? (
            <div className="fixed inset-x-0 bottom-36 z-[55] flex justify-center px-4">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="w-full max-w-xs rounded-full bg-zinc-900 px-5 py-3 text-sm font-medium text-white shadow-md ring-1 ring-black/5 dark:bg-white dark:text-zinc-900"
              >
                Filtrar Imóveis
              </button>
            </div>
          ) : (
            <div className="px-4 mt-0 mb-4">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="w-full rounded-full bg-zinc-900 px-5 py-3 text-sm font-medium text-white shadow-md ring-1 ring-black/5 dark:bg-white dark:text-zinc-900"
              >
                Filtrar Imóveis
              </button>
            </div>
          ))}

        <AnimatePresence>
          {mobileOpen ? (
            <motion.div
              className="fixed inset-0 z-[90]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="absolute inset-0 bg-black/40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileOpen(false)}
              />
              <motion.div
                className="absolute right-0 top-0 h-full w-80 max-w-[90%] rounded-l-2xl border border-white/30 bg-white/20 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-zinc-800/25"
                initial={{ x: 320 }}
                animate={{ x: 0 }}
                exit={{ x: 320 }}
                transition={{ type: "spring", stiffness: 320, damping: 28 }}
              >
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/20 px-4 py-3 rounded-tl-2xl text-white">
                  <span className="text-sm font-semibold tracking-wide">
                    Filtros
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        form.reset({
                          mode: defaultMode,
                          priceRange: "__all__",
                          status: "__all__",
                        })
                      }
                      className="rounded-md px-2 py-1 text-xs text-white/80 hover:bg-white/20"
                    >
                      Limpar
                    </button>
                    <button
                      type="button"
                      onClick={() => setMobileOpen(false)}
                      className="rounded-md px-2 py-1 text-xs text-white/80 hover:bg-white/20"
                    >
                      Fechar
                    </button>
                  </div>
                </div>
                <div className="h-[calc(100dvh-112px)] overflow-y-auto px-4 py-4">
                  <Form {...form}>
                    <form className="grid grid-cols-1 gap-3">
                      {/* Localização */}
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <span className="block px-1 text-[10px] font-medium text-white">
                              Localização
                            </span>
                            <FormControl>
                              <div className="flex h-11 min-w-0 items-center gap-2 rounded-lg border border-white/30 bg-white/15 px-3 backdrop-blur-sm">
                                <MapPin
                                  className="h-4 w-4 text-white/70 shrink-0"
                                  strokeWidth={2.25}
                                />
                                <Select
                                  value={field.value ?? undefined}
                                  onValueChange={(val) =>
                                    field.onChange(
                                      val === "__all__" ? undefined : val,
                                    )
                                  }
                                  className="min-w-0 flex-1 text-white border-0 bg-transparent px-0"
                                  placeholderClassName="text-white/70"
                                  valueClassName="text-white"
                                  caretClassName="text-white/60"
                                  menuClassName="z-[95] w-[340px] bg-white"
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Localização" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="__all__">
                                      Todos
                                    </SelectItem>
                                    {cities.map((opt) => (
                                      <SelectItem
                                        key={opt.value}
                                        value={opt.value}
                                      >
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
                      {/* Construtora */}
                      <FormField
                        control={form.control}
                        name="builder"
                        render={({ field }) => (
                          <FormItem>
                            <span className="block px-1 text-[10px] font-medium text-white">
                              Construtora
                            </span>
                            <FormControl>
                              <div className="flex h-11 min-w-0 items-center gap-2 rounded-lg border border-white/30 bg-white/15 px-3 backdrop-blur-sm">
                                <Home
                                  className="text-white/70 shrink-0"
                                  strokeWidth={2.25}
                                  size={18}
                                />
                                <Select
                                  value={field.value ?? "__all__"}
                                  onValueChange={field.onChange}
                                  className="min-w-0 flex-1 text-white border-0 bg-transparent px-0"
                                  placeholderClassName="text-white/70"
                                  valueClassName="text-white"
                                  caretClassName="text-white/60"
                                  menuClassName="z-[95] w-[min(100vw-2rem,320px)] bg-white"
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
                      {/* Transação */}
                      <FormField
                        control={form.control}
                        name="mode"
                        render={({ field }) => (
                          <FormItem>
                            <span className="block px-1 text-[10px] font-medium text-white">
                              Tipo de Transação
                            </span>
                            <FormControl>
                              <div className="flex h-11 min-w-0 items-center gap-2 rounded-lg border border-white/30 bg-white/15 px-3 backdrop-blur-sm">
                                <ArrowLeftRight className="h-4 w-4 shrink-0 text-white/70" />
                                <Select
                                  value={field.value ?? defaultMode}
                                  onValueChange={field.onChange}
                                  className="min-w-0 flex-1 text-white border-0 bg-transparent px-0"
                                  placeholderClassName="text-white/70"
                                  valueClassName="text-white"
                                  caretClassName="text-white/60"
                                  menuClassName="z-[95] w-[min(100vw-2rem,280px)] bg-white"
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
                      {/* Tipo */}
                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <span className="block px-1 text-[10px] font-medium text-white">
                              Tipo
                            </span>
                            <FormControl>
                              <div className="flex h-11 min-w-0 items-center gap-2 rounded-lg border border-white/30 bg-white/15 px-3 backdrop-blur-sm">
                                <Home className="h-4 w-4 shrink-0 text-white/70" />
                                <Select
                                  value={field.value ?? undefined}
                                  onValueChange={(val) =>
                                    field.onChange(
                                      val === "__all__" ? undefined : val,
                                    )
                                  }
                                  className="min-w-0 flex-1 text-white border-0 bg-transparent px-0"
                                  placeholderClassName="text-white/70"
                                  valueClassName="text-white"
                                  caretClassName="text-white/60"
                                  menuClassName="z-[95] w-[184px] bg-white"
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Tipo" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="__all__">
                                      Todos
                                    </SelectItem>
                                    <SelectItem value="casa">Casa</SelectItem>
                                    <SelectItem value="apartamento">
                                      Apartamento
                                    </SelectItem>
                                    <SelectItem value="terreno">
                                      Terreno
                                    </SelectItem>
                                    <SelectItem value="comercial">
                                      Comercial
                                    </SelectItem>
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
                            <span className="block px-1 text-[10px] font-medium text-white">
                              Quartos
                            </span>
                            <FormControl>
                              <div className="flex h-11 min-w-0 items-center gap-2 rounded-lg border border-white/30 bg-white/15 px-3 backdrop-blur-sm">
                                <Bed className="h-4 w-4 shrink-0 text-white/70" />
                                <Select
                                  value={field.value ?? undefined}
                                  onValueChange={(val) =>
                                    field.onChange(
                                      val === "__all__" ? undefined : val,
                                    )
                                  }
                                  className="min-w-0 flex-1 text-white border-0 bg-transparent px-0"
                                  placeholderClassName="text-white/70"
                                  valueClassName="text-white"
                                  caretClassName="text-white/60"
                                  menuClassName="z-[95] w-full bg-white"
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Quartos" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="__all__">
                                      Todos
                                    </SelectItem>
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
                      {/* Preço (slider duplo) */}
                      <div>
                        <span className="block px-1 text-[10px] font-medium text-white">
                          Preço
                        </span>
                        <div className="rounded-lg border border-white/30 bg-white/15 px-3 py-3 text-white backdrop-blur-sm">
                          {(() => {
                            const min = 0;
                            const max = 3000000;
                            const step = 50000;
                            const vMin = form.watch("priceMin") ?? 0;
                            const vMax = form.watch("priceMax") ?? 1500000;
                            const left = ((vMin - min) / (max - min)) * 100;
                            const right =
                              100 - ((vMax - min) / (max - min)) * 100;
                            return (
                              <div>
                                <div className="relative h-24">
                                  {/* Ícone decorativo sobre a faixa selecionada */}
                                  <div className="pointer-events-none absolute bottom-7 left-1/2 -translate-x-1/2">
                                    <img
                                      src="/assets/icons/Union.png"
                                      alt="Distribuição de preços"
                                      className="h-10 w-[180px] object-contain opacity-95 dark:opacity-90"
                                      style={{
                                        filter: "brightness(0) saturate(100%)",
                                      }}
                                      draggable={false}
                                    />
                                  </div>
                                  <div className="absolute left-0 right-0 bottom-5 h-[1px] bg-zinc-300 dark:bg-zinc-700" />
                                  <div
                                    className="absolute bottom-5 h-[2px] rounded bg-teal-500"
                                    style={{
                                      left: `${left}%`,
                                      right: `${right}%`,
                                    }}
                                  />
                                  <input
                                    type="range"
                                    min={min}
                                    max={max}
                                    step={step}
                                    value={vMin}
                                    onChange={(e) => {
                                      const n = clamp(
                                        parseInt(e.target.value, 10),
                                        min,
                                        max,
                                      );
                                      const adjusted = Math.min(
                                        n,
                                        (form.getValues("priceMax") ?? vMax) -
                                          step,
                                      );
                                      form.setValue("priceMin", adjusted, {
                                        shouldDirty: true,
                                      });
                                    }}
                                    className="range-thumb-price pointer-events-auto absolute left-0 bottom-5 h-6 w-full appearance-none bg-transparent"
                                  />
                                  <input
                                    type="range"
                                    min={min}
                                    max={max}
                                    step={step}
                                    value={vMax}
                                    onChange={(e) => {
                                      const n = clamp(
                                        parseInt(e.target.value, 10),
                                        min,
                                        max,
                                      );
                                      const adjusted = Math.max(
                                        n,
                                        (form.getValues("priceMin") ?? vMin) +
                                          step,
                                      );
                                      form.setValue("priceMax", adjusted, {
                                        shouldDirty: true,
                                      });
                                    }}
                                    className="range-thumb-price pointer-events-auto absolute left-0 bottom-5 h-6 w-full appearance-none bg-transparent"
                                  />
                                </div>
                                <div className="mt-2 flex justify-between text-[12px]">
                                  <span className="text-white/80">
                                    {formatBRL(vMin)}
                                  </span>
                                  <span className="font-semibold text-white">
                                    {formatBRL(vMax)}
                                  </span>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Tamanho do imóvel (slider duplo) */}
                      <div>
                        <span className="block px-1 text-[10px] font-medium text-white">
                          Tamanho do imóvel
                        </span>
                        <div className="rounded-lg border border-white/30 bg-white/15 px-3 py-3 text-white backdrop-blur-sm">
                          {(() => {
                            const min = 30;
                            const max = 500;
                            const step = 5;
                            const vMin = form.watch("areaMin") ?? min;
                            const vMax = form.watch("areaMax") ?? 200;
                            const left = ((vMin - min) / (max - min)) * 100;
                            const right =
                              100 - ((vMax - min) / (max - min)) * 100;
                            return (
                              <div>
                                <div className="mb-2 flex justify-between text-[12px] text-white/90">
                                  <span>{vMin} m²</span>
                                  <span className="font-medium text-white">
                                    {vMax} m²
                                  </span>
                                </div>
                                <div className="relative h-10">
                                  <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-zinc-300 dark:bg-zinc-700" />
                                  <div
                                    className="absolute top-1/2 h-px -translate-y-1/2 rounded bg-teal-500"
                                    style={{
                                      left: `${left}%`,
                                      right: `${right}%`,
                                    }}
                                  />
                                  <input
                                    type="range"
                                    min={min}
                                    max={max}
                                    step={step}
                                    value={vMin}
                                    onChange={(e) => {
                                      const n = clamp(
                                        parseInt(e.target.value, 10),
                                        min,
                                        max,
                                      );
                                      const adjusted = Math.min(
                                        n,
                                        (form.getValues("areaMax") ?? vMax) -
                                          step,
                                      );
                                      form.setValue("areaMin", adjusted, {
                                        shouldDirty: true,
                                      });
                                    }}
                                    className="range-thumb-area pointer-events-auto absolute left-0 top-1/2 -translate-y-1/2 h-6 w-full appearance-none bg-transparent"
                                  />
                                  <input
                                    type="range"
                                    min={min}
                                    max={max}
                                    step={step}
                                    value={vMax}
                                    onChange={(e) => {
                                      const n = clamp(
                                        parseInt(e.target.value, 10),
                                        min,
                                        max,
                                      );
                                      const adjusted = Math.max(
                                        n,
                                        (form.getValues("areaMin") ?? vMin) +
                                          step,
                                      );
                                      form.setValue("areaMax", adjusted, {
                                        shouldDirty: true,
                                      });
                                    }}
                                    className="range-thumb-area pointer-events-auto absolute left-0 top-1/2 -translate-y-1/2 h-6 w-full appearance-none bg-transparent"
                                  />
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </div>

                      {!hideStatus ? (
                        <FormField
                          control={form.control}
                          name="status"
                          render={({ field }) => (
                            <FormItem>
                              <span className="block px-1 text-[10px] font-medium text-white">
                                Status
                              </span>
                              <FormControl>
                                <div className="flex h-11 min-w-0 items-center gap-2 rounded-lg border border-white/30 bg-white/15 px-3 backdrop-blur-sm">
                                  <Tag className="h-4 w-4 text-white/70" />
                                  <Select
                                    value={field.value ?? "__all__"}
                                    onValueChange={field.onChange}
                                    className="min-w-0 flex-1 text-white border-0 bg-transparent px-0"
                                    placeholderClassName="text-white/70"
                                    caretClassName="text-white/60"
                                    menuClassName="z-[95] w-full bg-white"
                                  >
                                    <SelectTrigger className="w-full">
                                      <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="__all__">
                                        Todos
                                      </SelectItem>
                                      <SelectItem value="na-planta">
                                        Na planta
                                      </SelectItem>
                                      <SelectItem value="pronto">
                                        Pronto
                                      </SelectItem>
                                      <SelectItem value="mobiliado">
                                        Mobiliado
                                      </SelectItem>
                                      <SelectItem value="sem-mobilia">
                                        Sem mobília
                                      </SelectItem>
                                      <SelectItem value="reformado">
                                        Reformado
                                      </SelectItem>
                                      <SelectItem value="para-reformar">
                                        Para reformar
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      ) : null}
                      {/* Tags (multi-select) */}
                      <FormField
                        control={form.control}
                        name="tag"
                        render={({ field }) => {
                          const selected = field.value ?? [];
                          return (
                            <FormItem>
                              <span className="block px-1 text-[10px] font-medium text-white">
                                Tags
                              </span>
                              <FormControl>
                                <div ref={tagsMenuRef} className="relative">
                                  <button
                                    type="button"
                                    onClick={() => setTagsOpen((v) => !v)}
                                    className="flex h-11 w-full items-center gap-2 rounded-lg border border-white/30 bg-white/15 px-3 text-left text-white backdrop-blur-sm"
                                  >
                                    <Tag className="h-4 w-4 text-white/70" />
                                    <span
                                      className={[
                                        "block w-full truncate",
                                        selected.length === 0
                                          ? "text-white/60"
                                          : "text-white",
                                      ].join(" ")}
                                    >
                                      {selected.length === 0
                                        ? "Tags"
                                        : `${selected[0]}${
                                            selected.length > 1
                                              ? ` +${selected.length - 1}`
                                              : ""
                                          }`}
                                    </span>
                                    <svg
                                      aria-hidden="true"
                                      width="16"
                                      height="16"
                                      viewBox="0 0 24 24"
                                      className="ml-2 text-white/60"
                                    >
                                      <path
                                        fill="currentColor"
                                        d="M7 10l5 5 5-5z"
                                      />
                                    </svg>
                                  </button>

                                  {tagsOpen ? (
                                    <div className="absolute z-[95] mt-2 max-h-60 w-[260px] overflow-auto rounded-lg border border-zinc-200 bg-white p-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
                                      {tagOptions.map((name) => {
                                        const active = selected.includes(name);
                                        return (
                                          <button
                                            type="button"
                                            key={name}
                                            onClick={() => {
                                              if (active) {
                                                field.onChange(
                                                  selected.filter(
                                                    (t: string) => t !== name,
                                                  ),
                                                );
                                              } else {
                                                field.onChange([
                                                  ...(selected as string[]),
                                                  name,
                                                ]);
                                              }
                                            }}
                                            className={[
                                              "flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition",
                                              active
                                                ? "bg-zinc-100 font-medium dark:bg-zinc-800"
                                                : "hover:bg-zinc-100 dark:hover:bg-zinc-800",
                                            ].join(" ")}
                                          >
                                            <span>{name}</span>
                                            {active ? (
                                              <svg
                                                width="16"
                                                height="16"
                                                viewBox="0 0 24 24"
                                                className="text-teal-600"
                                              >
                                                <path
                                                  fill="currentColor"
                                                  d="M9 16.2l-3.5-3.5L4 14.2 9 19l12-12-1.5-1.5z"
                                                />
                                              </svg>
                                            ) : null}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  ) : null}
                                </div>
                              </FormControl>
                            </FormItem>
                          );
                        }}
                      />
                    </form>
                  </Form>
                </div>
                <div className="sticky bottom-0 border-t border-white/20 bg-white/15 p-3 text-white backdrop-blur-sm">
                  <button
                    type="button"
                    onClick={() => {
                      onSearch();
                      setMobileOpen(false);
                    }}
                    className="h-11 w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                  >
                    Buscar Imóvel
                  </button>
                </div>
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
      <style jsx global>{`
        .range-thumb-price,
        .range-thumb-area {
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
          height: 28px;
          accent-color: transparent;
          outline: none;
        }
        /* PRICE slider thumbs (track near bottom) */
        .range-thumb-price::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          height: 18px;
          width: 18px;
          border-radius: 50%;
          background: #00c8b3;
          border: 2px solid #ffffff;
          margin-top: 5px;
        }
        .range-thumb-price::-moz-range-thumb {
          height: 18px;
          width: 18px;
          border-radius: 50%;
          background: #000;
          border: 2px solid #ffffff;
        }
        .range-thumb-price::-webkit-slider-runnable-track {
          background: transparent;
          height: 2px;
        }
        .range-thumb-price::-moz-range-track {
          background: transparent;
          height: 2px;
        }
        /* AREA slider thumbs (track centered vertically) */
        .range-thumb-area::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          height: 18px;
          width: 18px;
          border-radius: 50%;
          background: #00c8b3;
          border: 2px solid #ffffff;
          margin-top: -10px;
        }
        .range-thumb-area::-moz-range-thumb {
          height: 18px;
          width: 18px;
          border-radius: 50%;
          background: #000;
          border: 2px solid #ffffff;
        }
        .range-thumb-area::-webkit-slider-runnable-track {
          background: transparent;
          height: 2px;
        }
        .range-thumb-area::-moz-range-track {
          background: transparent;
          height: 2px;
        }
      `}</style>
    </>
  );
}
