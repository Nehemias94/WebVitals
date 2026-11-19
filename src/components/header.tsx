import Link from "next/link";
import { Suspense } from "react";
import { logoutAction } from "@/actions/auth";
import { getSessionUser } from "@/lib/session";
import { CartBadge } from "./cart/cart-badge";

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
        <Link href="/products" className="text-lg font-bold tracking-tight">
          <span className="font-serif italic">La Ceiba</span> <span className="ml-1 text-xs font-normal uppercase tracking-[0.2em] text-stone-500">ultramarinos</span>
        </Link>
        <nav className="flex flex-1 items-center gap-1 text-sm">
          <Link href="/products" className="rounded-md px-3 py-2 hover:bg-zinc-100">
            Catálogo
          </Link>
          <Link href="/orders" className="rounded-md px-3 py-2 hover:bg-zinc-100">
            Mis compras
          </Link>
        </nav>
        <CartBadge />
        {/* La sesión depende de cookies: se transmite sin bloquear el shell estático. */}
        <Suspense fallback={<div className="h-9 w-24 animate-pulse rounded-full bg-zinc-100" />}>
          <UserMenu />
        </Suspense>
      </div>
    </header>
  );
}

async function UserMenu() {
  const user = await getSessionUser();

  if (!user) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <Link href="/login" className="rounded-md px-3 py-2 hover:bg-zinc-100">
          Entrar
        </Link>
        <Link
          href="/register"
          className="rounded-md bg-zinc-900 px-4 py-2 font-medium text-white hover:bg-zinc-700"
        >
          Crear cuenta
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="hidden max-w-40 truncate text-zinc-600 md:inline" title={user.email}>
        Hola, {user.name}
      </span>
      <form action={logoutAction}>
        <button type="submit" className="rounded-md px-3 py-2 hover:bg-zinc-100">
          Salir
        </button>
      </form>
    </div>
  );
}
