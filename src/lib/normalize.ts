import "server-only";
import { API_BASE_URL } from "./api";
import type { Order, OrderItem, Paginated, Product, User } from "./types";

/**
 * Adaptadores entre las respuestas de Laravel (API Resources, paginadores,
 * distintos nombres de campos) y los tipos del frontend.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Json = any;

const API_ORIGIN = new URL(API_BASE_URL).origin;

/** Laravel API Resources envuelven la respuesta en `data`. */
export const unwrap = (json: Json): Json =>
  json && typeof json === "object" && !Array.isArray(json) && "data" in json ? json.data : json;

const num = (v: unknown, fallback = 0) => {
  const n = typeof v === "string" ? parseFloat(v) : Number(v);
  return Number.isFinite(n) ? n : fallback;
};

function imageUrl(raw: unknown): string | null {
  if (typeof raw !== "string" || !raw.trim()) return null;
  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.startsWith("/")) return API_ORIGIN + raw;
  return `${API_ORIGIN}/storage/${raw}`;
}

export function toProduct(p: Json): Product {
  return {
    id: p.id,
    name: String(p.name ?? p.title ?? "Producto"),
    description: String(p.description ?? ""),
    price: num(p.price ?? p.unit_price),
    image: imageUrl(p.image_url ?? p.image ?? p.thumbnail ?? p.images?.[0]?.url ?? p.images?.[0]),
    stock: p.stock == null && p.quantity == null ? null : num(p.stock ?? p.quantity),
    category:
      typeof p.category === "string" ? p.category : (p.category?.name ?? p.category_name ?? null),
  };
}

/**
 * La API responde `{ success, data: <paginador de Laravel> }`, donde el paginador
 * trae `data` (lista), `current_page`, `last_page` y `total`.
 */
function paginator(json: Json): { list: Json[]; meta: Json } {
  let node = json;
  for (let i = 0; i < 3 && node && !Array.isArray(node); i++) {
    if (Array.isArray(node.data)) return { list: node.data, meta: node.meta ?? node };
    node = node.data;
  }
  return { list: Array.isArray(node) ? node : [], meta: {} };
}

export function toProductPage(json: Json, page: number): Paginated<Product> {
  const { list, meta } = paginator(json);
  return {
    items: list.map(toProduct),
    currentPage: num(meta.current_page, page),
    lastPage: num(meta.last_page, 1),
    total: num(meta.total, list.length),
  };
}

export const toUser = (u: Json): User => ({
  id: u?.id ?? "",
  name: String(u?.name ?? u?.email ?? "Usuario"),
  email: String(u?.email ?? ""),
});

function toOrderItem(i: Json): OrderItem {
  return {
    productId: i.product_id ?? i.product?.id ?? i.id,
    name: String(i.product?.name ?? i.name ?? i.product_name ?? `Producto #${i.product_id}`),
    quantity: num(i.quantity ?? i.qty, 1),
    price: num(i.price ?? i.unit_price ?? i.product?.price),
  };
}

export function toOrder(o: Json): Order {
  const items: OrderItem[] = (o.items ?? o.order_items ?? o.products ?? []).map(toOrderItem);
  const computed = items.reduce((s, i) => s + i.price * i.quantity, 0);
  return {
    id: o.id,
    status: String(o.status ?? o.payment_status ?? "pending"),
    total: num(o.total ?? o.total_amount ?? o.amount, computed),
    createdAt: o.created_at ?? o.createdAt ?? null,
    items,
  };
}

export function toOrderPage(json: Json, page: number): Paginated<Order> {
  const { list, meta } = paginator(json);
  return {
    items: list.map(toOrder),
    currentPage: num(meta.current_page, page),
    lastPage: num(meta.last_page, 1),
    total: num(meta.total, list.length),
  };
}

/** Sanctum/Passport/JWT devuelven el token con distintos nombres. */
export function extractAuth(json: Json): { token: string | null; user: User | null } {
  const root = json ?? {};
  const data = root.data ?? {};
  const token =
    root.token ?? root.access_token ?? root.plainTextToken ?? data.token ?? data.access_token ?? null;
  const rawUser = root.user ?? data.user ?? null;
  return { token: typeof token === "string" ? token : null, user: rawUser ? toUser(rawUser) : null };
}
