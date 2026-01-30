import React from "react";

type Props = {
  markers?: { id: string; lat: number; lng: number }[];
  className?: string;
};

export default function Globe({ className }: Props) {
  return (
    <div
      className={className}
      style={{
        background:
          "radial-gradient(circle at 30% 30%, rgba(0,0,0,0.06), transparent 60%)",
      }}
      aria-label="Globo decorativo"
    />
  );
}


