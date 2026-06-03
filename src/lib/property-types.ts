import { getSaxApiBase } from "@/lib/sax-api";

export type PropertyTypeOption = {
  value: string;
  label: string;
};

export const FIXED_PROPERTY_TYPES: PropertyTypeOption[] = [
  { value: "casa", label: "Casa" },
  { value: "casa_condominio", label: "Casa de Condomínio" },
  { value: "apartamento", label: "Apartamento" },
  { value: "duplex", label: "Duplex" },
  { value: "master", label: "Master" },
  { value: "flat", label: "Flat" },
  { value: "cobertura", label: "Cobertura" },
  { value: "terraco", label: "Terraço" },
  { value: "terreno", label: "Terreno" },
  { value: "sala", label: "Sala" },
  { value: "galpao", label: "Galpão" },
  { value: "kitnet", label: "Kitnet" },
  { value: "studio", label: "Studio" },
  { value: "comercial", label: "Comercial" },
];

const FIXED_VALUES = new Set(FIXED_PROPERTY_TYPES.map((t) => t.value));

type RawPropertyType = { value?: string; name?: string };

/**
 * Fetches property types from the backend and merges with fixed types.
 * Fixed types always appear first and cannot be overridden by dynamic types.
 * Safe to call server-side (Next.js server components / Route Handlers).
 */
export async function fetchPropertyTypes(): Promise<PropertyTypeOption[]> {
  const base = getSaxApiBase();
  if (!base) return FIXED_PROPERTY_TYPES;

  try {
    const res = await fetch(`${base}/api/property-types`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return FIXED_PROPERTY_TYPES;

    const data: unknown = await res.json();
    const dynamic = Array.isArray(data)
      ? (data as RawPropertyType[])
          .filter(
            (t) =>
              typeof t.value === "string" &&
              t.value.trim() !== "" &&
              !FIXED_VALUES.has(t.value),
          )
          .map((t) => ({ value: t.value!, label: t.name ?? t.value! }))
      : [];

    return [...FIXED_PROPERTY_TYPES, ...dynamic];
  } catch {
    return FIXED_PROPERTY_TYPES;
  }
}

/**
 * Returns the display label for a given property type value.
 * Falls back to the value itself (capitalized) when not found.
 */
export function getPropertyTypeLabel(
  value: string,
  types: PropertyTypeOption[] = FIXED_PROPERTY_TYPES,
): string {
  const found = types.find((t) => t.value === value);
  if (found) return found.label;
  return value.charAt(0).toUpperCase() + value.slice(1);
}
