"use client";

import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Property } from "@/types/realEstate";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PropertySection from "./PropertySection";
import FeaturedBanner from "./FeaturedBanner";
import MapTeaser from "./MapTeaser";
import PartnersSection from "./PartnersSection";
import { MapPin, ArrowLeftRight, Home, Tag, Bed } from "lucide-react";

const schema = z.object({
  city: z.string().optional(),
  mode: z.enum(["comprar", "alugar"]).default("comprar"),
  type: z.enum(["casa", "apartamento", "terreno", "comercial"]).optional(),
  bedrooms: z.string().optional(),
  priceRange: z.enum(["lt500k", "500k-1m", "1m-2m", "gt2m"]).optional(),
  tag: z.string().optional(),
  builder: z.string().optional(),
});
type FormValues = z.input<typeof schema>;

function PropertyCatalog({ properties }: { properties: Property[] }) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      mode: "comprar",
    },
  });

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

  const tagOptions = useMemo(() => {
    const set = new Set<string>();
    (properties ?? []).forEach((p) => {
      (p.amenities ?? []).forEach((a) => set.add(a));
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [properties]);

  const filtered = useMemo(() => {
    const { city, type, bedrooms, priceRange, builder, tag } = watchValues;
    return (properties ?? []).filter((p) => {
      if (city && city !== "__all__") {
        const c = `${p.address.city}-${p.address.state}`;
        if (c !== city) return false;
      }
      if (type && p.type !== type) return false;
      if (bedrooms) {
        const min = Number(bedrooms);
        if (!Number.isNaN(min) && p.bedrooms < min) return false;
      }
      if (priceRange) {
        if (priceRange === "lt500k" && !(p.price <= 500000)) return false;
        if (priceRange === "500k-1m" && !(p.price >= 500000 && p.price <= 1000000))
          return false;
        if (priceRange === "1m-2m" && !(p.price >= 1000000 && p.price <= 2000000))
          return false;
        if (priceRange === "gt2m" && !(p.price > 2000000)) return false;
      }
      if (builder && p.builder !== builder) return false;
      if (tag) {
        const list = p.amenities ?? [];
        if (!list.includes(tag)) return false;
      }
      return true;
    });
  }, [properties, watchValues]);

  return (
    <>
      {/* Filtro (campos soltos, sem card e sem scroll horizontal) */}
      <div className="sticky top-32 z-40 mb-20 mt-8 relative">
        <Form {...form}>
          <form className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 relative z-40">
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
                    <div className="flex h-11 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 dark:border-zinc-800 dark:bg-zinc-900">
                      <MapPin className="h-4 w-4 text-black/15" />
                      <Select
                        value={field.value ?? undefined}
                        onValueChange={field.onChange}
                        className="w-full text-black/80 border-0 bg-transparent px-0"
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
                    <div className="flex h-11 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 dark:border-zinc-800 dark:bg-zinc-900">
                      <ArrowLeftRight className="h-4 w-4 text-black/15" />
                      <Select
                        value={field.value ?? "comprar"}
                        onValueChange={field.onChange}
                        className="w-full text-black/80 border-0 bg-transparent px-0"
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Transação" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="comprar">Comprar</SelectItem>
                          <SelectItem value="alugar">Alugar</SelectItem>
                        </SelectContent>
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
                    <div className="flex h-11 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 dark:border-zinc-800 dark:bg-zinc-900">
                      <Home className="h-4 w-4 text-black/15" />
                      <Select
                        value={field.value ?? undefined}
                        onValueChange={(val) =>
                          field.onChange(val === "__all__" ? undefined : val)
                        }
                        className="w-full text-black/80 border-0 bg-transparent px-0"
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
                    <div className="flex h-11 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 dark:border-zinc-800 dark:bg-zinc-900">
                      <Bed className="h-4 w-4 text-black/15" />
                      <Select
                        value={field.value ?? undefined}
                        onValueChange={(val) =>
                          field.onChange(val === "__all__" ? undefined : val)
                        }
                        className="w-full text-black/80 border-0 bg-transparent px-0"
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
                    <div className="flex h-11 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 dark:border-zinc-800 dark:bg-zinc-900">
                      <Tag className="h-4 w-4 text-black/15" />
                      <Select
                        value={field.value ?? undefined}
                        onValueChange={(val) =>
                          field.onChange(val === "__all__" ? undefined : val)
                        }
                        className="w-full text-black/80 border-0 bg-transparent px-0"
                        menuClassName="w-[280px]"
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__all__">Todos</SelectItem>
                          <SelectItem value="lt500k">Até R$ 500.000</SelectItem>
                          <SelectItem value="500k-1m">R$ 500.000 - R$ 1.000.000</SelectItem>
                          <SelectItem value="1m-2m">R$ 1.000.000 - R$ 2.000.000</SelectItem>
                          <SelectItem value="gt2m">Acima de R$ 2.000.000</SelectItem>
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
                    <div className="flex h-11 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 dark:border-zinc-800 dark:bg-zinc-900">
                      <Tag className="h-4 w-4 text-black/15" />
                      <Select
                        value={field.value ?? undefined}
                        onValueChange={field.onChange}
                        disabled={tagOptions.length === 0}
                        className="w-full text-black/80 border-0 bg-transparent px-0"
                      >
                        <SelectTrigger
                          className="w-full"
                          disabled={tagOptions.length === 0}
                        >
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
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
                    <div className="flex h-11 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 dark:border-zinc-800 dark:bg-zinc-900">
                      <Home className="h-4 w-4 text-black/15" />
                      <Select
                        value={field.value ?? undefined}
                        onValueChange={field.onChange}
                        disabled={builderOptions.length === 0}
                        className="w-full text-black/80 border-0 bg-transparent px-0"
                      >
                        <SelectTrigger
                          className="w-full"
                          disabled={builderOptions.length === 0}
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
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
          </form>
        </Form>
        {/* Top fade to connect up to header (full viewport width) */}
        <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 -top-40 z-30 h-60 w-screen bg-linear-to-t from-white/98 via-white/95 to-transparent dark:from-zinc-900 dark:via-zinc-900/85" />
        {/* Bottom fade to hide content under the sticky filter (full viewport width) */}
        <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 -bottom-1 z-30 h-32 w-screen bg-linear-to-b from-white/98 via-white/85 to-transparent dark:from-zinc-900 dark:via-zinc-900/85" />
      </div>

      {/* Seções com base no filtro */}
      <PropertySection
        title="Melhores investimentos"
        href="/imoveis?secao=investimentos"
        properties={filtered}
      />
      <PropertySection
        title="Mais procurados"
        href="/imoveis?secao=mais-procurados"
        properties={filtered}
      />
      <PropertySection
        title="Lançamentos"
        href="/imoveis?secao=lancamentos"
        properties={filtered}
      />
      <FeaturedBanner property={filtered[0] ?? properties[0]} />
      <PropertySection
        title="Na planta"
        href="/imoveis?secao=na-planta"
        properties={filtered}
      />
      <PropertySection
        title="Frente mar"
        href="/imoveis?secao=frente-mar"
        properties={filtered}
      />
      <div className="relative">
        <div className="sticky top-66 z-10">
          <MapTeaser properties={filtered} />
        </div>
        <div aria-hidden="true" className="h-[560px]" />
        <PartnersSection />
      </div>
    </>
  );
}

export default PropertyCatalog;
export { PropertyCatalog };
