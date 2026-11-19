"use client";

import { useReportWebVitals } from "next/web-vitals";

/**
 * Reporta LCP, CLS, INP, FCP y TTFB de usuarios reales.
 * En desarrollo se imprime en consola; en producción podría enviarse a
 * un endpoint de analítica con navigator.sendBeacon.
 */
export function WebVitals() {
  useReportWebVitals((metric) => {
    if (process.env.NODE_ENV !== "production") {
      console.log(`[web-vitals] ${metric.name}: ${Math.round(metric.value * 100) / 100} (${metric.rating})`);
    }
  });
  return null;
}
