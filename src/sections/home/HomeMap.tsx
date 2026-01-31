"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { getMapboxToken } from "@/lib/mapbox";
import { getProperties } from "@/services/properties";
import type { Property } from "@/types/realEstate";

export default function HomeMap() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const token = useMemo(() => getMapboxToken(), []);
  const [properties, setProperties] = useState<Property[]>([]);

  useEffect(() => {
    getProperties().then(setProperties);
  }, []);

  useEffect(() => {
    if (!containerRef.current || !token) return;
    if (mapRef.current) return;
    mapboxgl.accessToken = token;
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [-56, -15], // mesmo centro da página /imoveis/mapa
      zoom: 2.1,
      pitch: 0,
      bearing: 0,
      antialias: true,
    });
    map.addControl(
      new mapboxgl.NavigationControl({ showCompass: false }),
      "top-right"
    );
    map.on("style.load", () => {
      const api = map as unknown as {
        setProjection?: (mode: string) => void;
        setFog?: (cfg: Record<string, unknown>) => void;
      };
      api.setProjection?.("globe"); // mesmo comportamento do mapa de /imoveis/mapa
      api.setFog?.({
        color: "rgb(240,240,242)",
        "high-color": "rgb(240,240,242)",
        "space-color": "rgb(230,230,235)",
        "horizon-blend": 0.02,
        "star-intensity": 0,
      });
    });
    mapRef.current = map;
    return () => map.remove();
  }, [token]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    // Renderiza pinos de preço como no teaser/mapa
    properties
      .filter(
        (p) =>
          typeof p.address.lat === "number" &&
          typeof p.address.lng === "number"
      )
      .forEach((p) => {
        const el = document.createElement("button");
        el.type = "button";
        el.className =
          "cursor-pointer select-none rounded-full bg-teal-500 px-3 py-1 text-xs font-semibold text-white shadow-lg ring-1 ring-black/10";
        el.textContent = p.price.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
          maximumFractionDigits: 0,
        });
        new mapboxgl.Marker({ element: el })
          .setLngLat([p.address.lng as number, p.address.lat as number])
          .addTo(map);
      });
  }, [properties]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="h-[calc(100vh-110px)] w-full overflow-hidden rounded-2xl border border-zinc-200 shadow-lg dark:border-zinc-800">
        <div ref={containerRef} className="h-full w-full" />
      </div>
    </section>
  );
}


