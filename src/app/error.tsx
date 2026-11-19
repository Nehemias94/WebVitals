"use client";

import { ErrorView, type ErrorProps } from "@/components/error-view";

export default function RootError(props: ErrorProps) {
  return <ErrorView {...props} />;
}
