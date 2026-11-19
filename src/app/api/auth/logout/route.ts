import { NextResponse, type NextRequest } from "next/server";
import { TOKEN_COOKIE, USER_COOKIE } from "@/lib/session";

/**
 * Route Handler que elimina las cookies httpOnly de sesión.
 * Se usa cuando la API responde 401 durante el render de un Server Component
 * (donde no se pueden modificar cookies) y redirige al login.
 */
export function GET(request: NextRequest) {
  const next = request.nextUrl.searchParams.get("next") ?? "/products";
  const safe = next.startsWith("/") && !next.startsWith("//") ? next : "/products";

  const url = new URL("/login", request.url);
  url.searchParams.set("next", safe);
  url.searchParams.set("expired", "1");

  const res = NextResponse.redirect(url);
  res.cookies.delete(TOKEN_COOKIE);
  res.cookies.delete(USER_COOKIE);
  return res;
}
