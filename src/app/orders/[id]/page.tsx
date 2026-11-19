import type { Metadata } from "next";
import Link from "next/link";
import { OrderSummary } from "@/components/order-summary";
import { getOrder } from "@/lib/data";

export const metadata: Metadata = { title: "Detalle de orden", robots: { index: false } };

export default async function OrderDetailPage({ params }: PageProps<"/orders/[id]">) {
  const { id } = await params;
  const order = await getOrder(id);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link href="/orders" className="text-sm text-zinc-600 hover:underline">
        ← Volver a mis compras
      </Link>
      <OrderSummary order={order} />
    </div>
  );
}
