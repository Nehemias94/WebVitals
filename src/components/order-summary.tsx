import { formatDate, formatPrice } from "@/lib/format";
import type { Order } from "@/lib/types";
import { OrderStatus } from "./order-status";

export function OrderSummary({ order }: { order: Order }) {
  return (
    <section className="rounded-md border border-zinc-200 bg-white">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 p-5">
        <div>
          <h2 className="font-semibold">Orden #{order.id}</h2>
          <p className="text-sm text-zinc-500">{formatDate(order.createdAt)}</p>
        </div>
        <OrderStatus status={order.status} />
      </header>
      <ul className="divide-y divide-zinc-100">
        {order.items.map((item, idx) => (
          <li key={`${item.productId}-${idx}`} className="flex justify-between gap-4 px-5 py-3 text-sm">
            <span>
              {item.name} <span className="text-zinc-500">× {item.quantity}</span>
            </span>
            <span className="tabular-nums">{formatPrice(item.price * item.quantity)}</span>
          </li>
        ))}
        {order.items.length === 0 && (
          <li className="px-5 py-3 text-sm text-zinc-500">La API no devolvió el detalle de productos.</li>
        )}
      </ul>
      <footer className="flex justify-between border-t border-zinc-200 p-5 font-semibold">
        <span>Total</span>
        <span className="tabular-nums">{formatPrice(order.total)}</span>
      </footer>
    </section>
  );
}
