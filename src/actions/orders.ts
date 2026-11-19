"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { ApiError, apiFetch } from "@/lib/api";
import { endpoints } from "@/lib/endpoints";
import { toOrder, unwrap } from "@/lib/normalize";
import { destroySession, getToken } from "@/lib/session";

type Result<T = object> = ({ ok: true } & T) | { ok: false; error: string; unauthorized?: boolean };

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/+$/, "");

async function handleError(err: unknown): Promise<{ ok: false; error: string; unauthorized?: boolean }> {
  if (err instanceof ApiError) {
    if (err.status === 401) {
      await destroySession();
      return { ok: false, error: "Tu sesión expiró. Inicia sesión de nuevo.", unauthorized: true };
    }
    const detail = Object.values(err.fieldErrors).flat()[0];
    return { ok: false, error: detail ?? err.message };
  }
  console.error("[orders]", err);
  return { ok: false, error: "Ocurrió un error inesperado. Intenta de nuevo." };
}

/** Crea la orden en la API a partir del carrito local. */
export async function createOrderAction(
  items: { productId: string | number; quantity: number }[],
): Promise<Result<{ orderId: string }>> {
  const token = await getToken();
  if (!token) return { ok: false, error: "Inicia sesión para continuar.", unauthorized: true };

  // Nunca confiar en el cliente: validamos la forma del payload.
  const clean = (Array.isArray(items) ? items : [])
    .map((i) => ({ product_id: i?.productId, quantity: Math.floor(Number(i?.quantity)) }))
    .filter(
      (i) =>
        (typeof i.product_id === "number" || typeof i.product_id === "string") &&
        Number.isFinite(i.quantity) &&
        i.quantity > 0 &&
        i.quantity <= 99,
    );
  if (clean.length === 0) return { ok: false, error: "Tu carrito está vacío." };

  let orderId: string;
  try {
    const json = await apiFetch(endpoints.orders, {
      method: "POST",
      token,
      body: { items: clean },
    });
    const order = unwrap(json);
    orderId = String(order?.id ?? order?.order?.id ?? order?.order_id ?? "");
    if (!orderId) return { ok: false, error: "La API no devolvió el id de la orden." };
  } catch (err) {
    return handleError(err);
  }

  // Evita UI desactualizada: el historial cambia y el stock del catálogo también.
  revalidatePath("/orders");
  revalidateTag("products", "max");

  return { ok: true, orderId };
}

/**
 * Inicia el pago con Stripe. Soporta las dos integraciones más comunes:
 *  - Stripe Checkout: la API devuelve una URL → redirigimos.
 *  - PaymentIntent: la API devuelve `client_secret` → el cliente usa Stripe Elements.
 */
export async function payOrderAction(orderId: string): Promise<Result<{ clientSecret: string }>> {
  const token = await getToken();
  if (!token) return { ok: false, error: "Inicia sesión para continuar.", unauthorized: true };

  const id = encodeURIComponent(String(orderId));
  let redirectTo: string | null = null;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const json = await apiFetch<Record<string, any>>(endpoints.pay(id), {
      method: "POST",
      token,
      body: {
        order_id: orderId,
        success_url: `${APP_URL}/checkout/success?order=${id}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${APP_URL}/checkout/${id}?canceled=1`,
      },
    });
    const data = { ...json, ...(unwrap(json) ?? {}) };

    const url = data.url ?? data.checkout_url ?? data.session_url ?? data.redirect_url;
    const clientSecret = data.client_secret ?? data.clientSecret;

    if (typeof url === "string" && /^https:\/\//.test(url)) {
      redirectTo = url;
    } else if (typeof clientSecret === "string") {
      return { ok: true, clientSecret };
    } else if (data.status || data.order) {
      // La API procesó el pago directamente (p. ej. modo de prueba).
      const order = toOrder(data.order ?? data);
      redirectTo = `/checkout/success?order=${encodeURIComponent(String(order.id ?? orderId))}`;
    } else {
      return { ok: false, error: "Respuesta de pago no reconocida por el frontend." };
    }
  } catch (err) {
    return handleError(err);
  }

  revalidatePath("/orders");
  revalidatePath(`/orders/${id}`);
  redirect(redirectTo);
}
