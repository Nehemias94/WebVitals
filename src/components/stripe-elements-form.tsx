"use client";

import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useState, type FormEvent } from "react";

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

export default function StripeElementsForm({
  clientSecret,
  orderId,
}: {
  clientSecret: string;
  orderId: string;
}) {
  if (!stripePromise) {
    return (
      <p role="alert" className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
        Falta configurar <code>NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> para completar el pago.
      </p>
    );
  }
  return (
    <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: "stripe" } }}>
      <InnerForm orderId={orderId} />
    </Elements>
  );
}

function InnerForm({ orderId }: { orderId: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setError(null);
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success?order=${encodeURIComponent(orderId)}`,
      },
    });
    // Solo llegamos aquí si hubo un error; si no, Stripe redirige a return_url.
    setError(error?.message ?? "No se pudo procesar el pago.");
    setLoading(false);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <PaymentElement />
      {error && (
        <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full rounded-lg bg-stone-900 px-4 py-3 font-semibold text-white hover:bg-stone-700 disabled:opacity-60"
      >
        {loading ? "Procesando pago…" : "Confirmar pago"}
      </button>
    </form>
  );
}
