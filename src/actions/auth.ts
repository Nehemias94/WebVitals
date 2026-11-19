"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ApiError, apiFetch } from "@/lib/api";
import { endpoints } from "@/lib/endpoints";
import { extractAuth } from "@/lib/normalize";
import { createSession, destroySession, getToken } from "@/lib/session";
import type { FormState } from "@/lib/types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Evita open-redirects: solo rutas internas. */
function safeNext(value: FormDataEntryValue | null) {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/") && !next.startsWith("//") ? next : "/products";
}

function fail(err: unknown, values: Record<string, string>): FormState {
  if (err instanceof ApiError) {
    return { error: err.message, fieldErrors: err.fieldErrors, values };
  }
  console.error("[auth]", err);
  return { error: "Ocurrió un error inesperado. Intenta de nuevo.", values };
}

export async function loginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const values = { email };

  const fieldErrors: Record<string, string[]> = {};
  if (!EMAIL_RE.test(email)) fieldErrors.email = ["Ingresa un correo válido."];
  if (!password) fieldErrors.password = ["Ingresa tu contraseña."];
  if (Object.keys(fieldErrors).length) return { fieldErrors, values };

  try {
    const json = await apiFetch(endpoints.login, { method: "POST", body: { email, password } });
    const { token, user } = extractAuth(json);
    if (!token) return { error: "La API no devolvió un token de acceso.", values };
    await createSession(token, user);
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      return { error: "Correo o contraseña incorrectos.", values };
    }
    return fail(err, values);
  }

  revalidatePath("/", "layout");
  redirect(safeNext(formData.get("next")));
}

export async function registerAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const passwordConfirmation = String(formData.get("password_confirmation") ?? "");
  const values = { name, email };

  const fieldErrors: Record<string, string[]> = {};
  if (name.length < 2) fieldErrors.name = ["El nombre debe tener al menos 2 caracteres."];
  if (!EMAIL_RE.test(email)) fieldErrors.email = ["Ingresa un correo válido."];
  if (password.length < 8) fieldErrors.password = ["La contraseña debe tener al menos 8 caracteres."];
  if (password !== passwordConfirmation)
    fieldErrors.password_confirmation = ["Las contraseñas no coinciden."];
  if (Object.keys(fieldErrors).length) return { fieldErrors, values };

  try {
    const json = await apiFetch(endpoints.register, {
      method: "POST",
      body: { name, email, password, password_confirmation: passwordConfirmation },
    });
    let { token, user } = extractAuth(json);

    // Algunas APIs no devuelven token al registrar: iniciamos sesión a continuación.
    if (!token) {
      const login = extractAuth(
        await apiFetch(endpoints.login, { method: "POST", body: { email, password } }),
      );
      token = login.token;
      user = login.user ?? user;
    }
    if (!token) return { error: "Cuenta creada, pero no se pudo iniciar sesión.", values };
    await createSession(token, user);
  } catch (err) {
    return fail(err, values);
  }

  revalidatePath("/", "layout");
  redirect(safeNext(formData.get("next")));
}

export async function logoutAction() {
  const token = await getToken();
  if (token) {
    // Revoca el token en la API; si falla, igual cerramos la sesión local.
    await apiFetch(endpoints.logout, { method: "POST", token }).catch(() => null);
  }
  await destroySession();
  revalidatePath("/", "layout");
  redirect("/products");
}
