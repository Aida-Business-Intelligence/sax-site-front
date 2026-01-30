import React from "react";
import type { Property } from "@/types/realEstate";

type Props = {
  open: boolean;
  property: Property | null;
  onOpenChange?: (open: boolean) => void;
};

export default function PropertyDialog({ open, property, onOpenChange }: Props) {
  if (!open || !property) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={() => onOpenChange?.(false)}
    >
      <div
        className="w-full max-w-md rounded-xl bg-white p-4 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-2 text-lg font-semibold">{property.title}</div>
        <div className="mb-4 text-sm text-zinc-600">
          {property.address.city}, {property.address.state}
        </div>
        <button
          type="button"
          className="rounded-md bg-zinc-900 px-3 py-2 text-sm text-white"
          onClick={() => onOpenChange?.(false)}
        >
          Fechar
        </button>
      </div>
    </div>
  );
}


