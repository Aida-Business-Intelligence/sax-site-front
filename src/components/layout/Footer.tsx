import React from "react";

export default function Footer() {
  return (
    <footer className="w-full border-t bg-white">
      <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-gray-600">
        © {new Date().getFullYear()} SAX Imóveis. Todos os direitos reservados.
      </div>
    </footer>
  );
}


