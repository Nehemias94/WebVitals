import "server-only";

export const API_BASE_URL = (process.env.API_BASE_URL || "http://127.0.0.1:8000/api").replace(
  /\/+$/,
  "",
);

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public fieldErrors: Record<string, string[]> = {},
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type ApiOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  token?: string;
  query?: Record<string, string | number | undefined>;
};

/**
 * Cliente HTTP del lado del servidor. El token nunca llega al navegador:
 * se lee desde la cookie httpOnly y se envía como Bearer a la API.
 */
export async function apiFetch<T = unknown>(path: string, opts: ApiOptions = {}): Promise<T> {
  const url = new URL(API_BASE_URL + path);
  for (const [k, v] of Object.entries(opts.query ?? {})) {
    if (v !== undefined && v !== "") url.searchParams.set(k, String(v));
  }

  const headers: Record<string, string> = { Accept: "application/json" };
  if (opts.body !== undefined) headers["Content-Type"] = "application/json";
  if (opts.token) headers.Authorization = `Bearer ${opts.token}`;

  let res: Response;
  try {
    res = await fetch(url, {
      method: opts.method ?? "GET",
      headers,
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
      signal: AbortSignal.timeout(15_000),
    });
  } catch (err) {
    console.error(`[api] ${opts.method ?? "GET"} ${url} falló`, err);
    throw new ApiError(503, "No se pudo conectar con la API. Intenta de nuevo en unos segundos.");
  }

  const text = await res.text();
  let json: unknown = null;
  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      json = null;
    }
  }

  if (!res.ok) {
    const body = (json ?? {}) as { message?: string; error?: string; errors?: Record<string, string[]> };
    throw new ApiError(
      res.status,
      body.message || body.error || defaultMessage(res.status),
      body.errors ?? {},
    );
  }

  return json as T;
}

function defaultMessage(status: number) {
  if (status === 401) return "Tu sesión expiró. Inicia sesión de nuevo.";
  if (status === 403) return "No tienes permiso para realizar esta acción.";
  if (status === 404) return "Recurso no encontrado.";
  if (status === 422) return "Revisa los datos enviados.";
  if (status >= 500) return "La API tuvo un error interno.";
  return `Error inesperado (${status}).`;
}
