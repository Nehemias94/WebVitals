import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = { title: "Iniciar sesión" };

export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <div className="mx-auto max-w-md rounded-md border border-zinc-200 bg-white p-8">
      <h1 className="text-2xl font-bold">Iniciar sesión</h1>
      <p className="mb-6 mt-1 text-sm text-zinc-600">Accede para completar tu compra y ver tu historial.</p>
      <Suspense fallback={<div className="h-64 animate-pulse rounded-lg bg-zinc-50" />}>
        <LoginForm searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function LoginForm({ searchParams }: Pick<PageProps<"/login">, "searchParams">) {
  const { next, expired } = await searchParams;
  return (
    <>
      {expired && (
        <p className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
          Tu sesión expiró. Inicia sesión de nuevo.
        </p>
      )}
      <AuthForm mode="login" next={typeof next === "string" ? next : undefined} />
    </>
  );
}
