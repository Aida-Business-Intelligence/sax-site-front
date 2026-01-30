"use client";

import { useEffect } from "react";
import { trackLeadView } from "@/lib/tracking";

export function useLeadView(context?: Record<string, unknown>): void {
  useEffect(() => {
    trackLeadView(context);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
