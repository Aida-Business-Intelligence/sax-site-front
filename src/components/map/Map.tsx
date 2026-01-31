"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { getMapboxToken } from "@/lib/mapbox";

type Marker = { id: string; lat: number; lng: number };

type Props = {
  center?: { lat: number; lng: number };
  zoom?: number;
  pitch?: number;
  bearing?: number;
  markers?: Marker[];
  show3DBuildings?: boolean;
  styleUrl?: string;
  markerStyle?: "default" | "teal-glow";
  projectionGlobe?: boolean;
  minZoom?: number;
  maxZoom?: number;
  showControls?: boolean;
  className?: string;
};

export default function Map({
  center = { lng: -48.6357, lat: -26.9926 },
  zoom = 12,
  pitch = 0,
  bearing = 0,
  markers = [],
  show3DBuildings = false,
  styleUrl = "mapbox://styles/mapbox/dark-v11",
  markerStyle = "default",
  projectionGlobe = false,
  minZoom,
  maxZoom,
  showControls = true,
  className,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerObjs = useRef<mapboxgl.Marker[]>([]);
  const [mapReady, setMapReady] = useState(false);

  const token = useMemo(() => getMapboxToken(), []);

  useEffect(() => {
    if (!containerRef.current || !token) return;
    if (mapRef.current) return;
    mapboxgl.accessToken = token;
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: styleUrl,
      center: [center.lng, center.lat],
      zoom,
      pitch,
      bearing,
      antialias: true,
      minZoom,
      maxZoom,
      attributionControl: false,
    });
    // Ensure first render paints even if container sizes after mount
    map.once("load", () => {
      map.resize();
      try {
        const root = containerRef.current;
        root?.querySelectorAll(".mapboxgl-ctrl-logo, .mapboxgl-ctrl-attrib")?.forEach((el) => {
          (el as HTMLElement).style.display = "none";
        });
      } catch {}
    });
    if (showControls) {
      map.addControl(
        new mapboxgl.NavigationControl({ showCompass: false }),
        "top-right"
      );
    }
    map.on("style.load", () => {
      if (projectionGlobe) {
        const api = map as unknown as {
          setProjection?: (mode: string) => void;
          setFog?: (cfg: Record<string, unknown>) => void;
        };
        api.setProjection?.("globe");
        api.setFog?.({
          color: "rgb(240,240,242)",
          "high-color": "rgb(240,240,242)",
          "space-color": "rgb(230,230,235)",
          "horizon-blend": 0.02,
          "star-intensity": 0,
        });
      }
      if (show3DBuildings) {
        const layers = map.getStyle().layers ?? [];
        const labelLayerId = layers.find(
          (l) => l.type === "symbol" && (l.layout as any)?.["text-field"]
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
          labelLayerId ?? undefined
        );
      }
      setMapReady(true);
    });
    mapRef.current = map;

    // Resize on layout changes
    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => {
            map.resize();
          })
        : null;
    if (ro && containerRef.current) {
      ro.observe(containerRef.current);
    }
    const onWinResize = () => map.resize();
    window.addEventListener("resize", onWinResize);
    window.addEventListener("orientationchange", onWinResize);

    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", onWinResize);
      window.removeEventListener("orientationchange", onWinResize);
      map.remove();
    };
  }, [token, styleUrl, center.lng, center.lat, zoom, pitch, bearing, show3DBuildings, projectionGlobe, minZoom, maxZoom]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    // Clear old markers
    markerObjs.current.forEach((m) => m.remove());
    markerObjs.current = [];
    if (!markers.length) return;
    markers.forEach((m) => {
      const el = document.createElement("div");
      el.style.width = "10px";
      el.style.height = "10px";
      el.style.borderRadius = "9999px";
      if (markerStyle === "teal-glow") {
        el.style.background = "#14b8a6";
        el.style.boxShadow = "0 0 0 6px rgba(20,184,166,.2)";
      } else {
        el.style.background = "#111827";
      }
      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([m.lng, m.lat])
        .addTo(map);
      markerObjs.current.push(marker);
    });
  }, [markers, markerStyle, mapReady]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: "100%", height: "100%" }}
    />
  );
}


