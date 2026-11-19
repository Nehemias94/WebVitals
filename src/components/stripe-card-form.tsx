"use client";

import { CardElement, Elements, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useState, type FormEvent } from "react";
import { formatPrice } from "@/lib/format";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "");

type Props = {
  amount: number;
  disabled: boolean;
  onPaymentMethod: (id: string) => void;
  onError: (message: string) => void;
};

/** Captura la tarjeta con Stripe Elements y entrega el payment_method_id a la API. */
export default function StripeCardForm(props: Props) {
  return (
    <Elements stripe={stripePromise}>
      <CardForm {...props} />
    </Elements>
  );
}

function CardForm({ amount, disabled, onPaymentMethod, onError }: Props) {
  const stripe = useStripe();
  const elements = useElements();
  const [creating, setCreating] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const card = elements?.getElement(CardElement);
    if (!stripe || !card) return;
    setCreating(true);
    const { paymentMethod, error } = await stripe.createPaymentMethod({ type: "card", card });
    setCreating(false);
    if (error || !paymentMethod) {
      onError(error?.message ?? "No se pudo validar la tarjeta.");
      return;
    }
    onPaymentMethod(paymentMethod.id);
  }

  const busy = disabled || creating;

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="rounded-md border border-zinc-300 p-3">
        <CardElement options={{ hidePostalCode: true }} />
      </div>
      <p className="text-xs text-zinc-500">Prueba con 4242 4242 4242 4242, cualquier fecha futura y CVC.</p>
      <button
        type="submit"
        disabled={!stripe || busy}
        className="w-full rounded-lg bg-stone-900 px-4 py-3 font-semibold text-white hover:bg-stone-700 disabled:opacity-60"
      >
        {busy ? "Procesando pago…" : `Pagar ${formatPrice(amount)}`}
      </button>
    </form>
  );
}
