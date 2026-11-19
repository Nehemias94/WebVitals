import "server-only";
import { cookies } from "next/headers";
import type { User } from "./types";

export const TOKEN_COOKIE = "auth_token";
export const USER_COOKIE = "auth_user";

const MAX_AGE = 60 * 60 * 24 * 7; // 7 días

const cookieOptions = {
  httpOnly: true, // inaccesible desde JavaScript del navegador (mitiga XSS)
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const, // mitiga CSRF en navegaciones cross-site
  path: "/",
  maxAge: MAX_AGE,
};

/** Solo se puede llamar desde Server Actions o Route Handlers. */
export async function createSession(token: string, user: User | null) {
  const store = await cookies();
  store.set(TOKEN_COOKIE, token, cookieOptions);
  if (user) {
    // Datos mínimos para pintar el header sin otra llamada a la API.
    store.set(USER_COOKIE, JSON.stringify({ name: user.name, email: user.email }), cookieOptions);
  }
}

export async function destroySession() {
  const store = await cookies();
  store.delete(TOKEN_COOKIE);
  store.delete(USER_COOKIE);
}

export async function getToken(): Promise<string | null> {
  return (await cookies()).get(TOKEN_COOKIE)?.value ?? null;
}

export async function getSessionUser(): Promise<Pick<User, "name" | "email"> | null> {
  const store = await cookies();
  if (!store.get(TOKEN_COOKIE)) return null;
  const raw = store.get(USER_COOKIE)?.value;
  if (!raw) return { name: "Mi cuenta", email: "" };
  try {
    return JSON.parse(raw);
  } catch {
    return { name: "Mi cuenta", email: "" };
  }
}
