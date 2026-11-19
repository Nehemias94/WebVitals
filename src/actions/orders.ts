"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { ApiError, apiFetch } from "@/lib/api";
import { endpoints } from "@/lib/endpoints";
import { toOrder, unwrap } from "@/lib/normalize";
import { destroySession, getToken } from "@/lib/session";

type CheckoutResult =
  | { ok: true; orderId: string; paid: boolean }
  | { ok: false; error: string; unauthorized?: boolean };

/**
 * Crea la orden y procesa el pago con Stripe.
 * La API hace ambas cosas en POST /orders/checkout: valida stock, crea la orden
 * y cobra con el `payment_method_id` de Stripe.
 */
export async function checkoutAction(
  items: { productId: string | number; quantity: number }[],
  paymentMethodId: string,
): Promise<CheckoutResult> {
  const token = await getToken();
  if (!token) return { ok: false, error: "Inicia sesión para continuar.", unauthorized: true };

  // Nunca confiar en el cliente: validamos la forma del payload.
  const clean = (Array.isArray(items) ? items : [])
    .map((i) => ({ product_id: Number(i?.productId), quantity: Math.floor(Number(i?.quantity)) }))
    .filter(
      (i) => Number.isInteger(i.product_id) && i.product_id > 0 && i.quantity > 0 && i.quantity <= 99,
    );
  if (clean.length === 0) return { ok: false, error: "Tu carrito está vacío." };
  if (typeof paymentMethodId !== "string" || !/^pm_[A-Za-z0-9_]+$/.test(paymentMethodId)) {
    return { ok: false, error: "Método de pago inválido." };
  }

  let result: CheckoutResult;
  try {
    const json = await apiFetch<{ data?: { order?: unknown; payment_status?: string } }>(
      endpoints.checkout,
      {
        method: "POST",
        token,
        body: { items: clean, payment_method_id: paymentMethodId },
      },
    );
    const data = unwrap(json) ?? {};
    const order = toOrder(data.order ?? data);
    result = {
      ok: true,
      orderId: String(order.id),
      paid: data.payment_status === "succeeded" || order.status === "paid",
    };
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.status === 401) {
        await destroySession();
        return { ok: false, error: "Tu sesión expiró. Inicia sesión de nuevo.", unauthorized: true };
      }
      const detail = Object.values(err.fieldErrors).flat()[0];
      return { ok: false, error: detail ?? err.message };
    }
    console.error("[checkout]", err);
    return { ok: false, error: "Ocurrió un error inesperado. Intenta de nuevo." };
  }

  // Evita UI desactualizada: el historial cambia y el stock del catálogo también.
  revalidatePath("/orders");
  revalidateTag("products", "max");

  return result;
}
