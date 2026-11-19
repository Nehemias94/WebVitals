"use client";

import { useState } from "react";
import type { Product } from "@/lib/types";
import { cart } from "./cart-store";

type Props = {
  product: Pick<Product, "id" | "name" | "price" | "image" | "stock">;
  withQuantity?: boolean;
  className?: string;
};

export function AddToCartButton({ product, withQuantity = false, className = "" }: Props) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const outOfStock = product.stock !== null && product.stock <= 0;
  const max = Math.min(product.stock ?? 99, 99);

  function handleAdd() {
    cart.add(
      {
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        stock: product.stock,
      },
      qty,
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {withQuantity && !outOfStock && (
        <label className="flex items-center gap-2 text-sm">
          <span className="sr-only">Cantidad</span>
          <input
            type="number"
            min={1}
            max={max}
            value={qty}
            onChange={(e) => setQty(Math.max(1, Math.min(max, Number(e.target.value) || 1)))}
            className="w-20 rounded-lg border border-zinc-300 px-3 py-2"
          />
        </label>
      )}
      <button
        type="button"
        onClick={handleAdd}
        disabled={outOfStock}
        aria-live="polite"
        className="flex-1 rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
      >
        {outOfStock ? "Agotado" : added ? "✓ Agregado" : "Agregar al carrito"}
      </button>
    </div>
  );
}
