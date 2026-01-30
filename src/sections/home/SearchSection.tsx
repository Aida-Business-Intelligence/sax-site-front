"use client";

import SearchBar from "@/components/forms/SearchBar";

export default function SearchSection() {
  return (
    <section className="mx-auto -mt-10 max-w-7xl px-4 pb-10 sm:px-6 md:-mt-24 lg:-mt-28">
      {/* Offset negativo para aproximar do Hero, mantendo boa distância da seção de Destaques */}
      <SearchBar />
    </section>
  );
}
