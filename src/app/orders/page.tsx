import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { OrderStatus } from "@/components/order-status";
import { OrderListSkeleton } from "@/components/skeletons";
import { getOrders } from "@/lib/data";
import { formatDate, formatPrice } from "@/lib/format";

export const metadata: Metadata = { title: "Mis compras", robots: { index: false } };

export default function OrdersPage({ searchParams }: PageProps<"/orders">) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mis compras</h1>
        <p className="mt-1 text-zinc-600">Historial de órdenes asociadas a tu cuenta.</p>
      </div>
      {/* El historial depende del token del usuario: se transmite con Suspense. */}
      <Suspense fallback={<OrderListSkeleton />}>
        <OrderList searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function OrderList({ searchParams }: Pick<PageProps<"/orders">, "searchParams">) {
  const { page: rawPage } = await searchParams;
  const page = Math.max(1, Number(Array.isArray(rawPage) ? rawPage[0] : rawPage) || 1);
  const { items: orders, currentPage, lastPage } = await getOrders(page);

  if (orders.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-zinc-300 p-12 text-center">
        <p className="font-medium">Aún no tienes compras.</p>
        <Link href="/products" className="mt-3 inline-block font-semibold text-amber-800 hover:underline">
          Explorar catálogo →
        </Link>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {orders.map((order) => (
        <li key={order.id}>
          <Link
            href={`/orders/${order.id}`}
            className="flex flex-wrap items-center justify-between gap-4 rounded-md border border-zinc-200 bg-white p-5 transition hover:border-stone-400 hover:shadow-sm"
          >
            <div>
              <p className="font-semibold">Orden #{order.id}</p>
              <p className="text-sm text-zinc-500">
                {formatDate(order.createdAt)} · {order.items.reduce((s, i) => s + i.quantity, 0) || "—"} artículos
              </p>
            </div>
            <div className="flex items-center gap-4">
              <OrderStatus status={order.status} />
              <span className="font-semibold tabular-nums">{formatPrice(order.total)}</span>
            </div>
          </Link>
        </li>
      ))}
      {lastPage > 1 && (
        <li className="flex items-center justify-center gap-3 pt-2 text-sm">
          {currentPage > 1 && (
            <Link href={`/orders?page=${currentPage - 1}`} className="rounded-lg border border-zinc-300 bg-white px-4 py-2">
              ← Anterior
            </Link>
          )}
          <span className="text-zinc-600">Página {currentPage} de {lastPage}</span>
          {currentPage < lastPage && (
            <Link href={`/orders?page=${currentPage + 1}`} className="rounded-lg border border-zinc-300 bg-white px-4 py-2">
              Siguiente →
            </Link>
          )}
        </li>
      )}
    </ul>
  );
}
