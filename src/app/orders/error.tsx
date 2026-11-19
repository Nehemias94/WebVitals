"use client";

import { ErrorView, type ErrorProps } from "@/components/error-view";

export default function OrdersError(props: ErrorProps) {
  return <ErrorView {...props} title="No pudimos cargar tu historial" />;
}
