"use client";

import React, { useMemo, useEffect, useState } from "react";
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
import { getProperties } from "@/services/properties";

const schema = z.object({
  city: z.string().optional(),
  mode: z.enum(["comprar", "alugar"]).default("comprar"),
  type: z.enum(["casa", "apartamento", "terreno", "comercial"]).optional(),
  bedrooms: z.string().optional(),
  priceRange: z.enum(["__all__", "lt500k", "500k-1m", "1m-2m", "gt2m"]).default("__all__"),
  tag: z.string().optional(),
  builder: z.string().optional(),
});
type FormValues = z.input<typeof schema>;

export default function HomeFilter() {
  const [properties, setProperties] = useState<Property[]>([]);
  useEffect(() => {
    getProperties().then(setProperties);
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      mode: "comprar",
      priceRange: "__all__",
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
    (properties ?? []).forEach((p) => (p.amenities ?? []).forEach((a) => set.add(a)));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [properties]);

  const builderOptions = useMemo(() => {
    const set = new Set<string>();
    (properties ?? []).forEach((p) => p.builder && set.add(p.builder));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [properties]);

  return (
    <div>
      <Form {...form}>
        <form className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 items-end">
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
                      onValueChange={(val) => field.onChange(val === "__all__" ? undefined : val)}
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
                      onValueChange={(val) => field.onChange(val === "__all__" ? undefined : val)}
                      className="w-full text-black/80 border-0 bg-transparent px-0"
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__all__">Todos</SelectItem>
                        <SelectItem value="casa">Casa</SelectItem>
                        <SelectItem value="apartamento">Apartamento</SelectItem>
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
                      onValueChange={(val) => field.onChange(val === "__all__" ? undefined : val)}
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
                  <div className="flex h-11 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 dark:border-zinc-800 dark:bg-zinc-900">
                    <Tag className="h-4 w-4 text-black/15" />
                    <Select
                      value={field.value ?? "__all__"}
                      onValueChange={field.onChange}
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
                      <SelectTrigger className="w-full" disabled={tagOptions.length === 0}>
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
                      <SelectTrigger className="w-full" disabled={builderOptions.length === 0}>
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
    </div>
  );
}


