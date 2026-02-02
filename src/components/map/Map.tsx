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
  markerStyle?: "default" | "teal-glow" | "neon-blue";
  projectionGlobe?: boolean;
  minZoom?: number;
  maxZoom?: number;
  showControls?: boolean;
  autoRotate?: boolean;
  autoRotateSpeedDegPerSec?: number; // positive rotates eastward
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
  autoRotate = false,
  autoRotateSpeedDegPerSec = 0.6,
  className,
}: Props) {
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
      pitch,
      bearing,
      antialias: true,
      minZoom,
      maxZoom,
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
  }, [token, styleUrl, center.lng, center.lat, zoom, pitch, bearing, show3DBuildings, projectionGlobe, minZoom, maxZoom]);

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
      el.style.width = "10px";
      el.style.height = "10px";
      el.style.borderRadius = "9999px";
      if (markerStyle === "teal-glow") {
        el.style.background = "#14b8a6";
        el.style.boxShadow = "0 0 0 6px rgba(20,184,166,.2)";
      } else if ((markerStyle as string) === "neon-blue") {
        el.style.background = "#00D8FF"; // neon blue core
        el.style.border = "2px solid rgba(255,255,255,0.95)"; // white contour
        el.style.boxSizing = "border-box";
        el.style.boxShadow =
          "0 0 8px rgba(0,216,255,.9), 0 0 14px rgba(0,216,255,.55), 0 0 22px rgba(0,216,255,.35)";
      } else {
        el.style.background = "#111827";
      }
      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([m.lng, m.lat])
        .addTo(map);
      markerObjs.current.push(marker);
    });
  }, [markers, markerStyle, mapReady]);

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
    const events: (keyof mapboxgl.MapboxEventHandler)[] = [
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


