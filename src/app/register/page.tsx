import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = { title: "Crear cuenta" };

export default function RegisterPage({ searchParams }: PageProps<"/register">) {
  return (
    <div className="mx-auto max-w-md rounded-md border border-zinc-200 bg-white p-8">
      <h1 className="text-2xl font-bold">Crear cuenta</h1>
      <p className="mb-6 mt-1 text-sm text-zinc-600">Regístrate para comprar y llevar el control de tus órdenes.</p>
      <Suspense fallback={<div className="h-80 animate-pulse rounded-lg bg-zinc-50" />}>
        <RegisterForm searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function RegisterForm({ searchParams }: Pick<PageProps<"/register">, "searchParams">) {
  const { next } = await searchParams;
  return <AuthForm mode="register" next={typeof next === "string" ? next : undefined} />;
}
