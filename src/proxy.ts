import { NextResponse, type NextRequest } from "next/server";

const TOKEN_COOKIE = "auth_token";
const PROTECTED = ["/orders", "/checkout"];
const GUEST_ONLY = ["/login", "/register"];

/**
 * Proxy (antes "middleware"): protege rutas privadas antes de renderizar.
 * La verificación real del token la hace la API; aquí solo evitamos
 * renderizar páginas privadas sin sesión.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(TOKEN_COOKIE)?.value);

  if (!hasSession && PROTECTED.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }

  if (hasSession && GUEST_ONLY.includes(pathname) && !request.nextUrl.searchParams.has("expired")) {
    return NextResponse.redirect(new URL("/products", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/orders/:path*", "/checkout/:path*", "/login", "/register"],
};
