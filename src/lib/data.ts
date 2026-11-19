import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { ApiError, apiFetch } from "./api";
import { endpoints } from "./endpoints";
import { toOrderPage, toProduct, toProductPage, unwrap } from "./normalize";
import { getToken } from "./session";

/* ------------------------------------------------------------------ */
/* Catálogo público: cacheado y etiquetado. Se invalida con           */
/* revalidateTag("products") cuando una orden modifica el stock.      */
/* ------------------------------------------------------------------ */

export async function getProducts(page = 1) {
  "use cache";
  cacheLife("minutes");
  cacheTag("products", `products-page-${page}`);

  const json = await apiFetch(endpoints.products, { query: { page } });
  return toProductPage(json, page);
}

export async function getProduct(id: string) {
  "use cache";
  cacheLife("minutes");
  cacheTag("products", `product-${id}`);

  try {
    const json = await apiFetch(endpoints.product(id));
    return toProduct(unwrap(json));
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

/* ------------------------------------------------------------------ */
/* Datos privados: dependen de la cookie, no se cachean y se          */
/* transmiten con <Suspense>.                                         */
/* ------------------------------------------------------------------ */

async function requireToken(next: string) {
  const token = await getToken();
  if (!token) redirect(`/login?next=${encodeURIComponent(next)}`);
  return token;
}

/** Si la API responde 401 el token ya no sirve: limpiamos la cookie vía Route Handler. */
function handleAuthError(err: unknown, next: string): never {
  if (err instanceof ApiError && err.status === 401) {
    redirect(`/api/auth/logout?next=${encodeURIComponent(next)}`);
  }
  throw err;
}

export async function getOrders(page = 1) {
  const token = await requireToken("/orders");
  try {
    const json = await apiFetch(endpoints.orders, { token, query: { page } });
    return toOrderPage(json, page);
  } catch (err) {
    handleAuthError(err, "/orders");
  }
}

/**
 * La API no expone GET /orders/{id}: buscamos la orden en el historial
 * paginado del usuario (que ya viene filtrado por su token).
 */
export async function getOrder(id: string, from = `/orders/${id}`) {
  const token = await requireToken(from);
  try {
    for (let page = 1, last = 1; page <= last && page <= 20; page++) {
      const result = toOrderPage(await apiFetch(endpoints.orders, { token, query: { page } }), page);
      const order = result.items.find((o) => String(o.id) === id);
      if (order) return order;
      last = result.lastPage;
    }
  } catch (err) {
    handleAuthError(err, from);
  }
  notFound();
}
