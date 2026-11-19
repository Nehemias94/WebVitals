"use client";

import Link from "next/link";
import { useCart } from "./cart-store";

export function CartBadge() {
  const { count } = useCart();
  return (
    <Link
      href="/cart"
      className="relative inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium hover:bg-zinc-100"
    >
      <svg aria-hidden width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" />
      </svg>
      <span className="hidden sm:inline">Carrito</span>
      <span
        className="min-w-5 rounded-full bg-stone-900 px-1.5 text-center text-xs leading-5 text-white tabular-nums"
        suppressHydrationWarning
      >
        {count}
      </span>
      <span className="sr-only"> artículos</span>
    </Link>
  );
}
