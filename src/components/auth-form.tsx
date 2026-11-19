"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction, registerAction } from "@/actions/auth";
import type { FormState } from "@/lib/types";

type Field = { name: string; label: string; type: string; autoComplete: string };

const FIELDS: Record<"login" | "register", Field[]> = {
  login: [
    { name: "email", label: "Correo electrónico", type: "email", autoComplete: "email" },
    { name: "password", label: "Contraseña", type: "password", autoComplete: "current-password" },
  ],
  register: [
    { name: "name", label: "Nombre", type: "text", autoComplete: "name" },
    { name: "email", label: "Correo electrónico", type: "email", autoComplete: "email" },
    { name: "password", label: "Contraseña", type: "password", autoComplete: "new-password" },
    {
      name: "password_confirmation",
      label: "Confirmar contraseña",
      type: "password",
      autoComplete: "new-password",
    },
  ],
};

export function AuthForm({ mode, next }: { mode: "login" | "register"; next?: string }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    mode === "login" ? loginAction : registerAction,
    {},
  );

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <input type="hidden" name="next" value={next ?? "/products"} />

      {state.error && (
        <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
          {state.error}
        </p>
      )}

      {FIELDS[mode].map((f) => {
        const errors = state.fieldErrors?.[f.name];
        return (
          <div key={f.name}>
            <label htmlFor={f.name} className="mb-1 block text-sm font-medium">
              {f.label}
            </label>
            <input
              id={f.name}
              name={f.name}
              type={f.type}
              autoComplete={f.autoComplete}
              defaultValue={f.type === "password" ? undefined : state.values?.[f.name]}
              aria-invalid={Boolean(errors)}
              aria-describedby={errors ? `${f.name}-error` : undefined}
              required
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-stone-600 focus:ring-2 focus:ring-stone-200 aria-invalid:border-rose-400"
            />
            {errors && (
              <p id={`${f.name}-error`} className="mt-1 text-sm text-rose-600">
                {errors[0]}
              </p>
            )}
          </div>
        );
      })}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-stone-900 px-4 py-2.5 font-semibold text-white hover:bg-stone-700 disabled:opacity-60"
      >
        {pending ? "Procesando…" : mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
      </button>

      <p className="text-center text-sm text-zinc-600">
        {mode === "login" ? "¿No tienes cuenta? " : "¿Ya tienes cuenta? "}
        <Link
          href={`/${mode === "login" ? "register" : "login"}${next ? `?next=${encodeURIComponent(next)}` : ""}`}
          className="font-semibold text-amber-800 hover:underline"
        >
          {mode === "login" ? "Regístrate" : "Inicia sesión"}
        </Link>
      </p>
    </form>
  );
}
