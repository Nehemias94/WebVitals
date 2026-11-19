"use client";

import { useSyncExternalStore } from "react";
import type { CartItem } from "@/lib/types";

/**
 * Carrito en estado local del cliente, persistido en localStorage.
 * Se usa useSyncExternalStore para evitar errores de hidratación y
 * sincronizar varias pestañas.
 */
const KEY = "cart:v1";
const EMPTY: CartItem[] = [];
const listeners = new Set<() => void>();
let cache: CartItem[] | null = null;

function read(): CartItem[] {
  if (cache) return cache;
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    cache = Array.isArray(parsed) ? parsed : EMPTY;
  } catch {
    cache = EMPTY;
  }
  return cache;
}

function write(items: CartItem[]) {
  cache = items;
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    /* almacenamiento no disponible: el carrito vive solo en memoria */
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = null;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

const clamp = (qty: number, stock: number | null) =>
  Math.max(1, Math.min(qty, stock ?? 99, 99));

export const cart = {
  add(item: Omit<CartItem, "quantity">, qty = 1) {
    const items = read();
    const existing = items.find((i) => i.productId === item.productId);
    write(
      existing
        ? items.map((i) =>
            i.productId === item.productId ? { ...i, quantity: clamp(i.quantity + qty, i.stock) } : i,
          )
        : [...items, { ...item, quantity: clamp(qty, item.stock) }],
    );
  },
  setQuantity(productId: CartItem["productId"], qty: number) {
    write(
      read().map((i) => (i.productId === productId ? { ...i, quantity: clamp(qty, i.stock) } : i)),
    );
  },
  remove(productId: CartItem["productId"]) {
    write(read().filter((i) => i.productId !== productId));
  },
  clear() {
    write(EMPTY);
  },
};

export function useCart() {
  const items = useSyncExternalStore(subscribe, read, () => EMPTY);
  const count = items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  return { items, count, subtotal };
}
