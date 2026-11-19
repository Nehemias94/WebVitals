/**
 * Rutas de la API REST (relativas a API_BASE_URL).
 * Ajusta este archivo si tu Swagger usa rutas distintas: es el único lugar
 * donde se definen.
 */
export const endpoints = {
  register: "/register",
  login: "/login",
  logout: "/logout",
  me: "/user",

  products: "/products",
  product: (id: string | number) => `/products/${id}`,

  orders: "/orders",
  order: (id: string | number) => `/orders/${id}`,

  /** Inicia el pago con Stripe para una orden existente. */
  pay: (orderId: string | number) => `/orders/${orderId}/pay`,
} as const;
