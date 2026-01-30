import React from "react";

export default function SearchBar() {
  return (
    <div className="w-full rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900">
      <input
        type="text"
        placeholder="Busque por cidade, bairro, tipo..."
        className="w-full bg-transparent outline-none"
        aria-label="Buscar imóveis"
      />
    </div>
  );
}


