import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ProductCard } from "@/components/product-card";
import { ProductGridSkeleton } from "@/components/skeletons";
import { getProducts } from "@/lib/data";

export const metadata: Metadata = {
  title: "Catálogo",
  description: "Explora todos nuestros productos.",
};

export default function ProductsPage({ searchParams }: PageProps<"/products">) {
  return (
    <div className="space-y-6">
      {/* Shell estático: se pinta de inmediato (mejor FCP/LCP). */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Catálogo</h1>
        <p className="mt-1 text-zinc-600">Encuentra lo que necesitas y paga de forma segura con Stripe.</p>
      </div>

      {/* Sección pesada: la lista se transmite (streaming) mientras se muestra el skeleton. */}
      <Suspense fallback={<ProductGridSkeleton />}>
        <ProductGrid searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function ProductGrid({ searchParams }: Pick<PageProps<"/products">, "searchParams">) {
  const { page: rawPage } = await searchParams;
  const page = Math.max(1, Number(Array.isArray(rawPage) ? rawPage[0] : rawPage) || 1);
  const { items, currentPage, lastPage, total } = await getProducts(page);

  if (items.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-zinc-300 p-12 text-center text-zinc-600">
        No hay productos disponibles por ahora.
      </p>
    );
  }

  return (
    <>
      <p className="text-sm text-zinc-500">{total} productos</p>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((p, i) => (
          <ProductCard key={p.id} product={p} preload={i < 4} />
        ))}
      </div>
      {lastPage > 1 && (
        <nav className="flex items-center justify-center gap-2 pt-4" aria-label="Paginación">
          {currentPage > 1 && (
            <Link href={`/products?page=${currentPage - 1}`} className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm hover:bg-zinc-50">
              ← Anterior
            </Link>
          )}
          <span className="px-3 text-sm text-zinc-600">
            Página {currentPage} de {lastPage}
          </span>
          {currentPage < lastPage && (
            <Link href={`/products?page=${currentPage + 1}`} className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm hover:bg-zinc-50">
              Siguiente →
            </Link>
          )}
        </nav>
      )}
    </>
  );
}
