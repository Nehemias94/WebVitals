"use client";

import { ErrorView, type ErrorProps } from "@/components/error-view";

export default function ProductsError(props: ErrorProps) {
  return <ErrorView {...props} title="No pudimos cargar el catálogo" />;
}
