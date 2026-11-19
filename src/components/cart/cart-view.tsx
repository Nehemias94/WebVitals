"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createOrderAction } from "@/actions/orders";
import { formatPrice } from "@/lib/format";
import { cart, useCart } from "./cart-store";

export function CartView() {
  const { items, subtotal } = useCart();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function checkout() {
    setError(null);
    startTransition(async () => {
      const res = await createOrderAction(
        items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      );
      if (!res.ok) {
        if (res.unauthorized) {
          router.push("/login?next=/cart");
          return;
        }
        setError(res.error);
        return;
      }
      // La orden ya existe en la API: el carrito local deja de ser necesario.
      cart.clear();
      router.push(`/checkout/${res.orderId}`);
    });
  }

  if (items.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-zinc-300 p-12 text-center">
        <p className="text-lg font-medium">Tu carrito está vacío</p>
        <Link href="/products" className="mt-4 inline-block font-semibold text-amber-800 hover:underline">
          Ver catálogo →
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <ul className="divide-y divide-zinc-200 rounded-md border border-zinc-200 bg-white">
        {items.map((item) => (
          <li key={item.productId} className="flex items-center gap-4 p-4">
            <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-zinc-100">
              {item.image && (
                <Image src={item.image} alt="" fill sizes="80px" className="object-cover" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <Link href={`/products/${item.productId}`} className="font-medium hover:underline">
                {item.name}
              </Link>
              <p className="text-sm text-zinc-500">{formatPrice(item.price)} c/u</p>
            </div>
            <div className="flex items-center rounded-lg border border-zinc-300">
              <button
                type="button"
                aria-label={`Quitar una unidad de ${item.name}`}
                onClick={() => cart.setQuantity(item.productId, item.quantity - 1)}
                disabled={item.quantity <= 1 || pending}
                className="px-3 py-1.5 disabled:opacity-40"
              >
                −
              </button>
              <span className="w-8 text-center tabular-nums">{item.quantity}</span>
              <button
                type="button"
                aria-label={`Agregar una unidad de ${item.name}`}
                onClick={() => cart.setQuantity(item.productId, item.quantity + 1)}
                disabled={pending || (item.stock !== null && item.quantity >= item.stock)}
                className="px-3 py-1.5 disabled:opacity-40"
              >
                +
              </button>
            </div>
            <p className="w-24 text-right font-semibold tabular-nums">
              {formatPrice(item.price * item.quantity)}
            </p>
            <button
              type="button"
              onClick={() => cart.remove(item.productId)}
              disabled={pending}
              className="text-sm text-rose-600 hover:underline disabled:opacity-40"
            >
              Quitar
            </button>
          </li>
        ))}
      </ul>

      <aside className="h-fit rounded-md border border-zinc-200 bg-white p-6">
        <h2 className="text-lg font-semibold">Resumen</h2>
        <dl className="mt-4 flex justify-between text-sm">
          <dt className="text-zinc-600">Subtotal</dt>
          <dd className="font-semibold tabular-nums">{formatPrice(subtotal)}</dd>
        </dl>
        <p className="mt-2 text-xs text-zinc-500">
          El total final lo calcula la API al crear la orden.
        </p>
        {error && (
          <p role="alert" className="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
            {error}
          </p>
        )}
        <button
          type="button"
          onClick={checkout}
          disabled={pending}
          className="mt-6 w-full rounded-lg bg-stone-900 px-4 py-3 font-semibold text-white hover:bg-stone-700 disabled:opacity-60"
        >
          {pending ? "Creando orden…" : "Crear orden y pagar"}
        </button>
        <button
          type="button"
          onClick={() => cart.clear()}
          disabled={pending}
          className="mt-3 w-full text-sm text-zinc-500 hover:underline"
        >
          Vaciar carrito
        </button>
      </aside>
    </div>
  );
}
