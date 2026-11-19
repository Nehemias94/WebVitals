"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { payOrderAction } from "@/actions/orders";

// Stripe.js solo se descarga si la API usa PaymentIntents (client_secret).
const StripeElementsForm = dynamic(() => import("./stripe-elements-form"), {
  ssr: false,
  loading: () => <div className="h-40 animate-pulse rounded-lg bg-zinc-100" />,
});

export function PayButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  function pay() {
    setError(null);
    startTransition(async () => {
      // Si la API devuelve una URL de Stripe Checkout, la acción redirige.
      const res = await payOrderAction(orderId);
      if (!res) return;
      if (!res.ok) {
        if (res.unauthorized) router.push(`/login?next=/checkout/${orderId}`);
        else setError(res.error);
        return;
      }
      setClientSecret(res.clientSecret);
    });
  }

  if (clientSecret) {
    return <StripeElementsForm clientSecret={clientSecret} orderId={orderId} />;
  }

  return (
    <div className="space-y-3">
      {error && (
        <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
          {error}
        </p>
      )}
      <button
        type="button"
        onClick={pay}
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-stone-900 px-4 py-3 font-semibold text-white hover:bg-stone-700 disabled:opacity-60"
      >
        {pending ? "Conectando con Stripe…" : "Pagar con Stripe"}
      </button>
      <p className="text-center text-xs text-zinc-500">
        Modo prueba: usa la tarjeta 4242 4242 4242 4242, cualquier fecha futura y CVC.
      </p>
    </div>
  );
}
