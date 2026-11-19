import type { Metadata } from "next";
import Link from "next/link";
import { ClearCart } from "@/components/cart/clear-cart";
import { OrderSummary } from "@/components/order-summary";
import { getOrder } from "@/lib/data";
import { isPaid } from "@/lib/format";

export const metadata: Metadata = { title: "Compra confirmada", robots: { index: false } };

export default async function SuccessPage({ searchParams }: PageProps<"/checkout/success">) {
  const { order: rawId } = await searchParams;
  const orderId = typeof rawId === "string" ? rawId : null;
  const order = orderId ? await getOrder(orderId, `/checkout/success?order=${orderId}`) : null;
  const paid = order ? isPaid(order.status) : false;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <ClearCart />
      <div className="rounded-md border border-emerald-200 bg-emerald-50 p-8 text-center">
        <h1 className="text-2xl font-bold text-emerald-900">¡Gracias por tu compra!</h1>
        <p className="mt-2 text-emerald-800">
          {paid
            ? "Tu pago fue confirmado correctamente."
            : "Recibimos tu pago. Stripe está terminando de confirmarlo; el estado se actualizará en tu historial en unos segundos."}
        </p>
      </div>
      {order && <OrderSummary order={order} />}
      <div className="flex justify-center gap-3">
        <Link href="/orders" className="rounded-lg bg-stone-900 px-4 py-2.5 font-semibold text-white hover:bg-stone-700">
          Ver mis compras
        </Link>
        <Link href="/products" className="rounded-lg px-4 py-2.5 font-semibold text-amber-800 hover:bg-stone-100">
          Seguir comprando
        </Link>
      </div>
    </div>
  );
}
