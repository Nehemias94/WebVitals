/**
 * Rutas de la API REST (relativas a API_BASE_URL), tal como aparecen en Swagger.
 */
export const endpoints = {
  register: "/register",
  login: "/login",
  logout: "/logout",

  products: "/products",
  product: (id: string | number) => `/products/${id}`,

  /** Historial paginado de órdenes del usuario autenticado. */
  orders: "/orders",

  /** Crea la orden y procesa el cobro con Stripe en una sola llamada. */
  checkout: "/orders/checkout",
} as const;
