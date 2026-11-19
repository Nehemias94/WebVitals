import type { Metadata } from "next";
import Link from "next/link";
import { OrderSummary } from "@/components/order-summary";
import { PayButton } from "@/components/pay-button";
import { getOrder } from "@/lib/data";
import { isPaid } from "@/lib/format";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default async function CheckoutPage({ params, searchParams }: PageProps<"/checkout/[orderId]">) {
  const [{ orderId }, { canceled }] = await Promise.all([params, searchParams]);
  const order = await getOrder(orderId, `/checkout/${orderId}`);
  const paid = isPaid(order.status);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
      {canceled && (
        <p role="status" className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
          El pago fue cancelado. Tu orden sigue pendiente; puedes intentarlo de nuevo.
        </p>
      )}
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <OrderSummary order={order} />
        <aside className="h-fit rounded-md border border-zinc-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">Pago</h2>
          {paid ? (
            <div className="space-y-3 text-sm">
              <p className="rounded-lg bg-emerald-50 p-3 text-emerald-800">Esta orden ya fue pagada.</p>
              <Link href="/orders" className="font-semibold text-amber-800 hover:underline">
                Ver mis compras →
              </Link>
            </div>
          ) : (
            <PayButton orderId={String(order.id)} />
          )}
        </aside>
      </div>
    </div>
  );
}
