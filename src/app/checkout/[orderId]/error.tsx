"use client";

import { ErrorView, type ErrorProps } from "@/components/error-view";

export default function CheckoutError(props: ErrorProps) {
  return <ErrorView {...props} title="No pudimos cargar el checkout" />;
}
