"use client";

import { ErrorView, type ErrorProps } from "@/components/error-view";

export default function SuccessError(props: ErrorProps) {
  return <ErrorView {...props} title="No pudimos confirmar tu compra" />;
}
