"use client";

import { useEffect, type ReactNode } from "react";

/** Remove o gradiente branco global sob o header (só nesta rota). */
export default function ImoveisMapaLayout({
  children,
}: {
  children: ReactNode;
}) {
  useEffect(() => {
    document.documentElement.classList.add("mapa-page-no-header-fade");
    return () => {
      document.documentElement.classList.remove("mapa-page-no-header-fade");
    };
  }, []);
  return <>{children}</>;
}
