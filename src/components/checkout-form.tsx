"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { checkoutAction } from "@/actions/orders";
import { formatPrice } from "@/lib/format";
import { cart, useCart } from "./cart/cart-store";

// Stripe.js solo se descarga si hay llave publicable configurada.
const StripeCardForm = dynamic(() => import("./stripe-card-form"), {
  ssr: false,
  loading: () => <div className="h-24 animate-pulse rounded-md bg-zinc-100" />,
});

const hasStripeKey = Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

// Métodos de pago de prueba que Stripe acepta sin capturar tarjeta en el navegador.
const TEST_METHODS = [
  { id: "pm_card_visa", label: "Visa de prueba (4242) — pago aprobado" },
  { id: "pm_card_mastercard", label: "Mastercard de prueba (5555) — pago aprobado" },
  { id: "pm_card_chargeDeclined", label: "Tarjeta rechazada — para probar un error" },
];

export function CheckoutForm() {
  const { items, subtotal } = useCart();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [method, setMethod] = useState(TEST_METHODS[0].id);
  const [done, setDone] = useState(false);

  function pay(paymentMethodId: string) {
    setError(null);
    startTransition(async () => {
      const res = await checkoutAction(
        items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        paymentMethodId,
      );
      if (!res.ok) {
        if (res.unauthorized) router.push("/login?next=/checkout");
        else setError(res.error);
        return;
      }
      setDone(true);
      cart.clear();
      router.push(`/checkout/success?order=${encodeURIComponent(res.orderId)}`);
    });
  }

  if (items.length === 0 && !done && !pending) {
    return (
      <div className="rounded-md border border-dashed border-zinc-300 p-12 text-center">
        <p className="text-lg font-medium">No hay productos para pagar</p>
        <Link href="/products" className="mt-4 inline-block font-semibold text-amber-800 hover:underline">
          Ver catálogo →
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <section className="rounded-md border border-zinc-200 bg-white">
        <h2 className="border-b border-zinc-200 p-5 font-semibold">Resumen de tu orden</h2>
        <ul className="divide-y divide-zinc-100">
          {items.map((i) => (
            <li key={i.productId} className="flex justify-between gap-4 px-5 py-3 text-sm">
              <span>
                {i.name} <span className="text-zinc-500">× {i.quantity}</span>
              </span>
              <span className="tabular-nums">{formatPrice(i.price * i.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="flex justify-between border-t border-zinc-200 p-5 font-semibold">
          <span>Total</span>
          <span className="tabular-nums">{formatPrice(subtotal)}</span>
        </div>
      </section>

      <aside className="h-fit space-y-4 rounded-md border border-zinc-200 bg-white p-6">
        <h2 className="text-lg font-semibold">Pago con Stripe</h2>

        {error && (
          <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
            {error}
          </p>
        )}

        {hasStripeKey ? (
          <StripeCardForm amount={subtotal} disabled={pending} onPaymentMethod={pay} onError={setError} />
        ) : (
          <>
            <fieldset className="space-y-2" disabled={pending}>
              <legend className="mb-2 text-sm text-zinc-600">Modo prueba: elige una tarjeta de Stripe</legend>
              {TEST_METHODS.map((m) => (
                <label key={m.id} className="flex cursor-pointer items-center gap-2 rounded-md border border-zinc-200 p-3 text-sm has-checked:border-stone-600">
                  <input
                    type="radio"
                    name="payment_method"
                    value={m.id}
                    checked={method === m.id}
                    onChange={() => setMethod(m.id)}
                  />
                  {m.label}
                </label>
              ))}
            </fieldset>
            <button
              type="button"
              onClick={() => pay(method)}
              disabled={pending}
              className="w-full rounded-lg bg-stone-900 px-4 py-3 font-semibold text-white hover:bg-stone-700 disabled:opacity-60"
            >
              {pending ? "Procesando pago…" : `Pagar ${formatPrice(subtotal)}`}
            </button>
          </>
        )}
        <p className="text-xs text-zinc-500">El total final y el stock los valida la API al procesar la orden.</p>
      </aside>
    </div>
  );
}
