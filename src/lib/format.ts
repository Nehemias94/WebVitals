const currency = process.env.NEXT_PUBLIC_CURRENCY || "USD";
const locale = process.env.NEXT_PUBLIC_LOCALE || "es-MX";

const money = new Intl.NumberFormat(locale, { style: "currency", currency });
const date = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" });

export const formatPrice = (value: number) => money.format(value);

export const formatDate = (value: string | null) => {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : date.format(d);
};

const STATUS_LABELS: Record<string, { label: string; tone: string }> = {
  pending: { label: "Pendiente de pago", tone: "bg-amber-100 text-amber-800" },
  unpaid: { label: "Pendiente de pago", tone: "bg-amber-100 text-amber-800" },
  processing: { label: "Procesando", tone: "bg-sky-100 text-sky-800" },
  paid: { label: "Pagada", tone: "bg-emerald-100 text-emerald-800" },
  completed: { label: "Completada", tone: "bg-emerald-100 text-emerald-800" },
  succeeded: { label: "Pagada", tone: "bg-emerald-100 text-emerald-800" },
  shipped: { label: "Enviada", tone: "bg-stone-200 text-stone-800" },
  cancelled: { label: "Cancelada", tone: "bg-rose-100 text-rose-800" },
  canceled: { label: "Cancelada", tone: "bg-rose-100 text-rose-800" },
  failed: { label: "Pago fallido", tone: "bg-rose-100 text-rose-800" },
};

export const orderStatus = (status: string) =>
  STATUS_LABELS[status.toLowerCase()] ?? { label: status, tone: "bg-zinc-100 text-zinc-800" };

export const isPaid = (status: string) =>
  ["paid", "completed", "succeeded", "shipped"].includes(status.toLowerCase());
