import React from "react";

export default function Footer() {
  return (
    <footer className="fixed bottom-0 inset-x-0 z-50 w-full border-t bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-4 text-sm text-gray-600">
        © {new Date().getFullYear()} SAX Imóveis. Todos os direitos reservados.
      </div>
    </footer>
  );
}


