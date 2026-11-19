# Ultramarinos La Ceiba — Frontend E-commerce (Next.js)

Frontend en **Next.js 16 (App Router) + TypeScript + Tailwind CSS** que consume la API REST de e-commerce (**Laravel 12 + Swagger + Stripe**). Implementa el flujo completo de compra: catálogo → carrito → orden → pago con Stripe → confirmación → historial.

## Requisitos

- Node.js 20.9 o superior
- La API de Laravel corriendo (por defecto en `http://127.0.0.1:8000`)

## Configuración (`.env.example`)

Copia el archivo de ejemplo y ajusta los valores:

```bash
cp .env.example .env.local
```

| Variable | Descripción | Ejemplo |
| --- | --- | --- |
| `API_BASE_URL` | URL base de la API (con el prefijo `/api`). Solo se usa en el servidor. | `http://127.0.0.1:8000/api` |
| `NEXT_PUBLIC_APP_URL` | URL de este frontend; se usa en las URLs de retorno de Stripe. | `http://localhost:3000` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Opcional. Solo si la API devuelve un `client_secret` (PaymentIntent). | `pk_test_...` |
| `NEXT_PUBLIC_CURRENCY` / `NEXT_PUBLIC_LOCALE` | Formato de precios. | `USD` / `es-MX` |
| `ALLOW_LOCAL_IMAGES` | Permite optimizar imágenes servidas desde `127.0.0.1`. | `true` |

## Ejecutar el proyecto

```bash
npm install
npm run dev          # desarrollo en http://localhost:3000

# producción (para medir con Lighthouse)
npm run build
npm start
```

## Rutas implementadas

| Ruta | Tipo | Descripción |
| --- | --- | --- |
| `/products` | Pública | Catálogo paginado (`?page=`). Lista transmitida con `Suspense` y skeleton. `loading.tsx` y `error.tsx`. |
| `/products/[id]` | Pública | Detalle del producto, metadatos dinámicos y `not-found.tsx`. |
| `/register` | Solo invitados | Registro con Server Action y validación (incluye errores 422 de Laravel). |
| `/login` | Solo invitados | Login con Server Action; guarda el token en una cookie **httpOnly**. |
| `/cart` | Pública | Carrito en estado local (persistido en `localStorage`); agregar, quitar y cambiar cantidades. Crea la orden mediante mutación. |
| `/checkout` | Protegida | Resumen de la orden y pago con Stripe (crea la orden mediante Server Action). `loading.tsx` y `error.tsx`. |
| `/checkout/success` | Protegida | Confirmación de compra y vaciado del carrito. |
| `/orders` | Protegida | Historial de compras del usuario, transmitido con `Suspense`. `loading.tsx` y `error.tsx`. |
| `/orders/[id]` | Protegida | Detalle de una orden. |
| `/api/auth/logout` | Route Handler | Borra las cookies de sesión cuando la API responde 401 y redirige al login. |

## Endpoints de la API que se consumen

Están todos en [`src/lib/endpoints.ts`](src/lib/endpoints.ts).

| Método | Endpoint | Uso |
| --- | --- | --- |
| `POST` | `/api/register` | Registro |
| `POST` | `/api/login` | Login (devuelve `access_token`) |
| `POST` | `/api/logout` | Cerrar sesión |
| `GET` | `/api/products?page=` | Catálogo paginado |
| `GET` | `/api/products/{id}` | Detalle de producto |
| `POST` | `/api/orders/checkout` | Crea la orden y cobra con Stripe: `{ items: [{ product_id, quantity }], payment_method_id }` |
| `GET` | `/api/orders?page=` | Historial de compras |

Para pagar se usan los métodos de prueba de Stripe (`pm_card_visa`, `pm_card_mastercard` o `pm_card_chargeDeclined` para probar un rechazo). Si se configura `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, el checkout muestra el formulario de tarjeta de Stripe Elements (tarjeta `4242 4242 4242 4242`).

La API debe tener `STRIPE_SECRET` (llave `sk_test_...`) en su `.env`.

## Arquitectura

```
src/
├── actions/            Server Actions (mutaciones): auth.ts, orders.ts
├── app/                Rutas del App Router (loading.tsx / error.tsx por segmento)
│   └── api/auth/logout Route Handler que limpia la cookie httpOnly
├── components/         UI (carrito, formularios, resumen de orden, Stripe)
├── lib/
│   ├── api.ts          Cliente HTTP del servidor (Bearer token, timeout, errores)
│   ├── data.ts         Lecturas en Server Components (`use cache` + cacheTag)
│   ├── endpoints.ts    Rutas de la API
│   ├── normalize.ts    Adaptadores para las respuestas de Laravel
│   └── session.ts      Cookies httpOnly de sesión
└── proxy.ts            Protección de rutas (antes "middleware")
```

### Seguridad

- El token **nunca llega al navegador**: se guarda en una cookie `httpOnly`, `sameSite=lax` y `secure` en producción, y solo se lee en el servidor.
- `proxy.ts` redirige al login si no hay sesión en `/orders` y `/checkout`.
- Las Server Actions validan el payload del carrito (nunca confían en el cliente) y el parámetro `next` para evitar open redirects.
- Si la API responde 401, se cierra la sesión local automáticamente.

### Rendimiento y resiliencia

- **Server Components** para todas las lecturas; el JavaScript del cliente se limita al carrito y a los formularios.
- **Cache Components + Partial Prerendering**: el shell de cada página es estático y los datos se transmiten con `Suspense`.
- El catálogo se cachea con `use cache` + `cacheTag("products")`.
- **Evitar UI desactualizada después de mutaciones**:
  - Comprar → `revalidatePath("/orders")` + `revalidateTag("products", "max")` (el stock cambia).
  - Login/logout → `revalidatePath("/", "layout")`.
- `next/image` con `sizes`, AVIF/WebP y `preload` en las imágenes candidatas a LCP; `next/font` para evitar CLS.
- Stripe.js se carga de forma diferida, solo cuando se necesita.
- `useReportWebVitals` registra LCP, CLS, INP, FCP y TTFB en la consola durante el desarrollo.

## Evidencias

Las capturas están en [`docs/evidencias`](docs/evidencias):

- Swagger: `01-swagger-general.jpg`, `02-swagger-endpoints.jpg`
- Flujo de compra: `03-catalogo.jpg` a `09-historial.jpg`
- Lighthouse: `10-lighthouse-escritorio.jpg`, `11-lighthouse-movil.jpg` y los reportes completos en HTML

| Lighthouse (`/products`) | Performance | Accessibility | Best Practices | SEO |
| --- | --- | --- | --- | --- |
| Escritorio | 100 | 100 | 100 | 100 |
| Móvil | 98 | 100 | 100 | 100 |

El documento de la actividad y la presentación están en [`docs/`](docs/).
