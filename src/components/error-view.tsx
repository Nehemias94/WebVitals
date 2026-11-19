"use client";

import Link from "next/link";
import { useEffect } from "react";

export type ErrorProps = {
  error: unknown;
  retry: () => void;
};

/** UI compartida por los error.tsx de cada segmento. */
export function ErrorView({ error, retry, title = "Algo salió mal" }: ErrorProps & { title?: string }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const digest = error instanceof Error ? (error as Error & { digest?: string }).digest : undefined;

  return (
    <div role="alert" className="mx-auto max-w-lg rounded-md border border-rose-200 bg-rose-50 p-8 text-center">
      <h2 className="mt-2 text-xl font-semibold text-rose-900">{title}</h2>
      <p className="mt-2 text-sm text-rose-800">
        No pudimos cargar esta sección. Puede que la API no esté disponible en este momento.
      </p>
      {digest && <p className="mt-2 font-mono text-xs text-rose-500">Ref: {digest}</p>}
      <div className="mt-6 flex justify-center gap-3">
        <button
          type="button"
          onClick={() => retry()}
          className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-500"
        >
          Reintentar
        </button>
        <Link href="/products" className="rounded-lg px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100">
          Ir al catálogo
        </Link>
      </div>
    </div>
  );
}
