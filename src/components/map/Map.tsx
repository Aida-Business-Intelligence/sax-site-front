import React from "react";

type Props = {
  center?: { lat: number; lng: number };
  markers?: { id: string; lat: number; lng: number }[];
  className?: string;
};

export default function Map({ className }: Props) {
  return (
    <div
      className={className}
      style={{
        width: "100%",
        height: "360px",
        background:
          "linear-gradient(180deg, rgba(230,230,235,.6), rgba(220,220,230,.6))",
      }}
      aria-label="Mapa (placeholder)"
    />
  );
}


