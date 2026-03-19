"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { trackEvent } from "@/lib/analytics";

/** Evita duplicar evento quando o effect roda duas vezes (ex.: React Strict Mode em dev). */
export function PropertyViewAnalytics({ propertySlug }: { propertySlug: string }) {
  const pathname = usePathname();
  const sentKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const key = `${pathname ?? ""}|${propertySlug}`;
    if (sentKeyRef.current === key) return;
    sentKeyRef.current = key;
    trackEvent("property_view", pathname || undefined, { propertySlug });
  }, [pathname, propertySlug]);

  return null;
}
