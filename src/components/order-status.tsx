import { orderStatus } from "@/lib/format";

export function OrderStatus({ status }: { status: string }) {
  const { label, tone } = orderStatus(status);
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${tone}`}>{label}</span>;
}
