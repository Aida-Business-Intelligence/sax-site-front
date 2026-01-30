import React from "react";

export default function Header() {
  return (
    <header className="w-full border-b bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="text-lg font-semibold">SAX Imóveis</div>
        <nav className="text-sm text-gray-600">
          <a href="/" className="hover:text-black">
            Início
          </a>
        </nav>
      </div>
    </header>
  );
}


