 "use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { getMapboxToken } from "@/lib/mapbox";

type Props = {
  markers?: { id: string; lat: number; lng: number }[];
  className?: string;
};

export default function Globe({ className, markers = [] }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const token = useMemo(() => getMapboxToken(), []);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current || !token) return;
    if (mapRef.current) return;
    mapboxgl.accessToken = token;
    const initialZoom = 0.95;
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [-30, 10],
      zoom: initialZoom,
      bearing: 0,
      pitch: 0,
      antialias: true,
      interactive: true,
      dragPan: true,
      dragRotate: true,
      scrollZoom: false,
      doubleClickZoom: false,
      touchZoomRotate: true,
      minZoom: initialZoom,
      maxZoom: initialZoom,
    });

    map.on("style.load", () => {
      const api = map as unknown as {
        setProjection?: (mode: string) => void;
        setFog?: (cfg: Record<string, unknown>) => void;
      };
      api.setProjection?.("globe");
      api.setFog?.({
        color: "rgb(240,240,242)",
        "high-color": "rgb(238,238,242)",
        "space-color": "rgb(230,230,235)",
        "horizon-blend": 0.02,
        "star-intensity": 0,
      });
      setReady(true);
    });

    mapRef.current = map;

    map.once("load", () => map.resize());
    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => map.resize())
        : null;
    if (ro && containerRef.current) ro.observe(containerRef.current);
    const onWinResize = () => map.resize();
    window.addEventListener("resize", onWinResize);

    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", onWinResize);
      map.remove();
    };
  }, [token]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    markers.forEach((m) => {
      const el = document.createElement("div");
      el.style.width = "8px";
      el.style.height = "8px";
      el.style.borderRadius = "9999px";
      el.style.background = "#14b8a6";
      el.style.boxShadow = "0 0 0 6px rgba(20,184,166,.18)";
      new mapboxgl.Marker({ element: el }).setLngLat([m.lng, m.lat]).addTo(map);
    });
  }, [markers, ready]);

  return <div ref={containerRef} className={className} aria-label="Globo" />;
}
