"use client";

import { useEffect, useState } from "react";
import {
  FIXED_PROPERTY_TYPES,
  fetchPropertyTypes,
  type PropertyTypeOption,
} from "@/lib/property-types";

/**
 * Returns the merged list of fixed + dynamic property types.
 * Starts with the fixed list immediately (no loading flash),
 * then enriches with dynamic types fetched from the API.
 */
export function usePropertyTypes(): PropertyTypeOption[] {
  const [types, setTypes] =
    useState<PropertyTypeOption[]>(FIXED_PROPERTY_TYPES);

  useEffect(() => {
    fetchPropertyTypes().then(setTypes);
  }, []);

  return types;
}
