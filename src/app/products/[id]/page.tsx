import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { getProduct } from "@/lib/data";
import { formatPrice } from "@/lib/format";

export async function generateMetadata({ params }: PageProps<"/products/[id]">): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id).catch(() => null);
  return product
    ? { title: product.name, description: product.description.slice(0, 155) }
    : { title: "Producto" };
}

export default async function ProductPage({ params }: PageProps<"/products/[id]">) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  const inStock = product.stock === null || product.stock > 0;

  return (
    <div className="space-y-6">
      <Link href="/products" className="text-sm text-zinc-600 hover:underline">
        ← Volver al catálogo
      </Link>
      <div className="grid gap-8 md:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-md bg-zinc-100">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              preload // imagen principal = elemento LCP
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          ) : (
            <span className="absolute inset-0 grid place-items-center text-xs uppercase tracking-widest text-zinc-600">
              Sin imagen
            </span>
          )}
        </div>
        <div className="flex flex-col gap-4">
          {product.category && (
            <p className="text-sm font-medium uppercase tracking-wide text-amber-800">{product.category}</p>
          )}
          <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
          <p className="text-2xl font-semibold tabular-nums">{formatPrice(product.price)}</p>
          <p className={`text-sm font-medium ${inStock ? "text-emerald-700" : "text-rose-600"}`}>
            {product.stock === null ? "Disponible" : inStock ? `${product.stock} en stock` : "Agotado"}
          </p>
          {product.description && (
            <p className="whitespace-pre-line leading-relaxed text-zinc-700">{product.description}</p>
          )}
          <AddToCartButton product={product} withQuantity className="mt-4" />
        </div>
      </div>
    </div>
  );
}
