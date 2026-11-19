import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { ApiError, apiFetch } from "./api";
import { endpoints } from "./endpoints";
import { toOrder, toOrders, toProduct, toProductPage, unwrap } from "./normalize";
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

export async function getOrders() {
  const token = await requireToken("/orders");
  try {
    const json = await apiFetch(endpoints.orders, { token });
    return toOrders(json).sort((a, b) =>
      String(b.createdAt ?? b.id).localeCompare(String(a.createdAt ?? a.id), undefined, {
        numeric: true,
      }),
    );
  } catch (err) {
    handleAuthError(err, "/orders");
  }
}

export async function getOrder(id: string, from = `/orders/${id}`) {
  const token = await requireToken(from);
  try {
    const json = await apiFetch(endpoints.order(id), { token });
    return toOrder(unwrap(json));
  } catch (err) {
    if (err instanceof ApiError && (err.status === 404 || err.status === 403)) notFound();
    handleAuthError(err, from);
  }
}
