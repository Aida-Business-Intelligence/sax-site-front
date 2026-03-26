"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { getMapboxToken } from "@/lib/mapbox";

type Marker = { id: string; lat: number; lng: number };

/** Mapbox setFog só aceita cores em formato que o parser deles entende (rgb/hex), não lab()/oklch(). */
function cssColorToMapboxRgb(raw: string): string {
  const trimmed = raw.trim();
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith("#") ||
    lower.startsWith("rgb(") ||
    lower.startsWith("rgba(")
  ) {
    return trimmed;
  }
  if (typeof document === "undefined") return "rgb(255,255,255)";
  try {
    const el = document.createElement("div");
    el.style.position = "absolute";
    el.style.left = "-9999px";
    el.style.visibility = "hidden";
    el.style.pointerEvents = "none";
    el.style.backgroundColor = trimmed;
    document.body.appendChild(el);
    const resolved = getComputedStyle(el).backgroundColor.trim();
    document.body.removeChild(el);
    const rl = resolved.toLowerCase();
    if (
      resolved &&
      resolved !== "transparent" &&
      resolved !== "rgba(0, 0, 0, 0)" &&
      (rl.startsWith("rgb(") || rl.startsWith("rgba("))
    ) {
      return resolved;
    }
  } catch {
    /* ignore */
  }
  return "rgb(255,255,255)";
}

function resolvedPageBackdropColor(): string {
  if (typeof window === "undefined") return "rgb(255,255,255)";
  const pick = (el: Element) => getComputedStyle(el).backgroundColor;
  let raw = pick(document.body);
  if (!raw || raw === "transparent" || raw === "rgba(0, 0, 0, 0)") {
    raw = pick(document.documentElement);
  }
  if (!raw || raw === "transparent" || raw === "rgba(0, 0, 0, 0)") {
    return "rgb(255,255,255)";
  }
  return cssColorToMapboxRgb(raw);
}

type Props = {
  center?: { lat: number; lng: number };
  zoom?: number;
  pitch?: number;
  bearing?: number;
  markers?: Marker[];
  show3DBuildings?: boolean;
  /** Vista inclinada + prédios 3D + controles de rotação/inclinação (ideal para ficha do imóvel) */
  view3D?: boolean;
  styleUrl?: string;
  markerStyle?: "default" | "teal-glow" | "neon-blue";
  projectionGlobe?: boolean;
  /** "dark" = céu como /imoveis/mapa. "light" = névoa clara. "neutral" = sem céu visível (névoa = fundo da página). */
  globeAtmosphere?: "light" | "dark" | "neutral";
  minZoom?: number;
  maxZoom?: number;
  showControls?: boolean;
  autoRotate?: boolean;
  autoRotateSpeedDegPerSec?: number; // positive rotates eastward
  /** Esconde rótulos do estilo Mapbox (cidades/países); mantém só os markers do app */
  hideBasemapLabels?: boolean;
  className?: string;
};

export default function Map({
  center = { lng: -48.6357, lat: -26.9926 },
  zoom = 12,
  pitch = 0,
  bearing = 0,
  markers = [],
  show3DBuildings = false,
  view3D = false,
  styleUrl = "mapbox://styles/mapbox/dark-v11",
  markerStyle = "default",
  projectionGlobe = false,
  globeAtmosphere = "light",
  minZoom,
  maxZoom,
  showControls = true,
  autoRotate = false,
  autoRotateSpeedDegPerSec = 0.6,
  hideBasemapLabels = false,
  className,
}: Props) {
  const effectivePitch = view3D ? 52 : pitch;
  const effectiveBearing = view3D ? -22 : bearing;
  const effectiveShow3DBuildings = view3D || show3DBuildings;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerObjs = useRef<mapboxgl.Marker[]>([]);
  const [mapReady, setMapReady] = useState(false);
  const rotateRaf = useRef<number | null>(null);
  const lastTs = useRef<number>(0);
  const pauseUntil = useRef<number>(0);

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
      pitch: effectivePitch,
      bearing: effectiveBearing,
      antialias: true,
      minZoom,
      maxZoom,
      maxPitch: view3D ? 85 : undefined,
      attributionControl: false,
    });
    // Ensure first render paints even if container sizes after mount
    map.once("load", () => {
      // Force a couple of resizes to cover cases where the container
      // changes size shortly after mount (route transitions, animations)
      map.resize();
      requestAnimationFrame(() => map.resize());
      setTimeout(() => map.resize(), 120);
      try {
        const root = containerRef.current;
        root?.querySelectorAll(".mapboxgl-ctrl-logo, .mapboxgl-ctrl-attrib")?.forEach((el) => {
          (el as HTMLElement).style.display = "none";
        });
      } catch {}
    });
    if (showControls) {
      map.addControl(
        new mapboxgl.NavigationControl({
          showCompass: view3D,
          visualizePitch: view3D,
        }),
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
        if (globeAtmosphere === "dark") {
          api.setFog?.({
            color: "rgb(18, 26, 42)",
            "high-color": "rgb(32, 44, 68)",
            "space-color": "rgb(6, 8, 18)",
            "horizon-blend": 0.14,
            "star-intensity": 0.5,
          });
        } else if (globeAtmosphere === "neutral") {
          const bg = resolvedPageBackdropColor();
          api.setFog?.({
            color: bg,
            "high-color": bg,
            "space-color": bg,
            "horizon-blend": 0,
            "star-intensity": 0,
          });
        } else {
          api.setFog?.({
            color: "rgb(240,240,242)",
            "high-color": "rgb(240,240,242)",
            "space-color": "rgb(230,230,235)",
            "horizon-blend": 0.02,
            "star-intensity": 0,
          });
        }
      }
      if (effectiveShow3DBuildings) {
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
      // Globo/estilo podem ignorar minZoom do construtor; reforça após style.load
      if (minZoom != null) {
        map.setMinZoom(minZoom);
        if (map.getZoom() < minZoom) map.setZoom(minZoom);
      }
      if (maxZoom != null) {
        map.setMaxZoom(maxZoom);
        if (map.getZoom() > maxZoom) map.setZoom(maxZoom);
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
    // Resize when the map becomes visible again (e.g., after route change)
    const onVisibility = () => map.resize();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", onWinResize);
      window.removeEventListener("orientationchange", onWinResize);
      document.removeEventListener("visibilitychange", onVisibility);
      // Properly dispose and reset refs so remounts initialize correctly
      try {
        map.remove();
      } finally {
        mapRef.current = null;
        markerObjs.current.forEach((m) => m.remove());
        markerObjs.current = [];
        setMapReady(false);
        if (rotateRaf.current) cancelAnimationFrame(rotateRaf.current);
        rotateRaf.current = null;
      }
    };
  }, [
    token,
    styleUrl,
    center.lng,
    center.lat,
    zoom,
    effectivePitch,
    effectiveBearing,
    effectiveShow3DBuildings,
    view3D,
    projectionGlobe,
    globeAtmosphere,
    minZoom,
    maxZoom,
  ]);

  useEffect(() => {
    if (!projectionGlobe || globeAtmosphere !== "neutral") return;
    const map = mapRef.current;
    if (!map || !mapReady) return;
    const applyNeutralFog = () => {
      const api = map as unknown as {
        setFog?: (cfg: Record<string, unknown>) => void;
      };
      const bg = resolvedPageBackdropColor();
      api.setFog?.({
        color: bg,
        "high-color": bg,
        "space-color": bg,
        "horizon-blend": 0,
        "star-intensity": 0,
      });
    };
    applyNeutralFog();
    const obs = new MutationObserver(applyNeutralFog);
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => obs.disconnect();
  }, [projectionGlobe, globeAtmosphere, mapReady]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    // Final safety resize after layers/markers adjustments
    map.resize();
    // Clear old markers
    markerObjs.current.forEach((m) => m.remove());
    markerObjs.current = [];
    if (!markers.length) return;
    markers.forEach((m) => {
      const el = document.createElement("div");
      el.style.borderRadius = "9999px";
      if (markerStyle === "teal-glow") {
        el.style.width = "10px";
        el.style.height = "10px";
        el.style.background = "#14b8a6";
        el.style.boxShadow = "0 0 0 6px rgba(20,184,166,.2)";
      } else if ((markerStyle as string) === "neon-blue") {
        // Azul ciano fluorescente (legível no mapa dark-v11)
        const size = "14px";
        el.style.width = size;
        el.style.height = size;
        el.style.background =
          "radial-gradient(circle at 35% 30%, #ffffff 0%, #67e8f9 28%, #06b6d4 55%, #0891b2 100%)";
        el.style.border = "2px solid rgba(255,255,255,0.92)";
        el.style.boxSizing = "border-box";
        el.style.boxShadow =
          "0 0 10px rgba(34,211,238,1), 0 0 20px rgba(6,182,212,0.75), 0 0 32px rgba(8,145,178,0.45), inset 0 0 6px rgba(255,255,255,0.35)";
      } else {
        el.style.width = "10px";
        el.style.height = "10px";
        el.style.background = "#111827";
      }
      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([m.lng, m.lat])
        .addTo(map);
      markerObjs.current.push(marker);
    });
  }, [markers, markerStyle, mapReady]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady || !hideBasemapLabels) return;

    const hideLabels = () => {
      try {
        const layers = map.getStyle()?.layers ?? [];
        for (const layer of layers) {
          if (layer.type !== "symbol") continue;
          const layout = layer.layout as Record<string, unknown> | undefined;
          const tf = layout?.["text-field"];
          if (tf == null || tf === "") continue;
          if (!map.getLayer(layer.id)) continue;
          map.setLayoutProperty(layer.id, "visibility", "none");
        }
      } catch {
        /* ignore */
      }
    };

    hideLabels();
    map.on("style.load", hideLabels);
    return () => {
      map.off("style.load", hideLabels);
    };
  }, [mapReady, hideBasemapLabels]);

  // Soft auto-rotation around the globe (changes longitude), pauses on user interaction
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady || !autoRotate) return;

    let disposed = false;

    const tick = (ts: number) => {
      if (disposed) return;
      if (!lastTs.current) lastTs.current = ts;
      const dt = Math.min(100, ts - lastTs.current); // clamp to avoid jumps when tab inactive
      lastTs.current = ts;

      // If user interacted recently, skip rotation
      if (performance.now() < pauseUntil.current) {
        rotateRaf.current = requestAnimationFrame(tick);
        return;
      }

      const speed = autoRotateSpeedDegPerSec; // deg/sec
      const delta = (speed * dt) / 1000;
      // For distant globe views rotate longitude; when zoomed-in keep center and rotate bearing
      if ((map as any).getProjection?.()?.name === "globe" && map.getZoom() <= 2.6) {
        const c = map.getCenter();
        const nextLng = ((c.lng + delta + 540) % 360) - 180; // wrap to [-180,180]
        map.setCenter([nextLng, c.lat]);
      } else {
        const nextBearing = map.getBearing() + delta;
        map.setBearing(nextBearing);
      }

      rotateRaf.current = requestAnimationFrame(tick);
    };

    // Pause on interactions and resume after 4s idle
    const pause = () => {
      pauseUntil.current = performance.now() + 4000;
    };
    // Avoid relying on mapbox-gl types on Vercel (can differ by version)
    const events: string[] = [
      "dragstart",
      "mousedown",
      "touchstart",
      "wheel",
      "rotatestart",
      "pitchstart",
    ];
    events.forEach((ev) => map.on(ev as any, pause));

    rotateRaf.current = requestAnimationFrame(tick);

    return () => {
      disposed = true;
      events.forEach((ev) => map.off(ev as any, pause));
      if (rotateRaf.current) cancelAnimationFrame(rotateRaf.current);
      rotateRaf.current = null;
      lastTs.current = 0;
    };
  }, [autoRotate, autoRotateSpeedDegPerSec, mapReady]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: "100%", height: "100%" }}
    />
  );
}


