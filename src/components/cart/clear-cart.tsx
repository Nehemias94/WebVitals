"use client";

import { useEffect } from "react";
import { cart } from "./cart-store";

/** Vacía el carrito local al montar (p. ej. en la confirmación de compra). */
export function ClearCart() {
  useEffect(() => {
    cart.clear();
  }, []);
  return null;
}
