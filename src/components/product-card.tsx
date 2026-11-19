import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";
import { AddToCartButton } from "./cart/add-to-cart-button";

export function ProductCard({ product, preload = false }: { product: Product; preload?: boolean }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-md border border-zinc-200 bg-white transition hover:shadow-md">
      <Link href={`/products/${product.id}`} className="relative block aspect-square bg-zinc-100">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            // Los primeros productos son candidatos a LCP: se precargan.
            preload={preload}
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <span className="absolute inset-0 grid place-items-center text-xs uppercase tracking-widest text-zinc-400">
            Sin imagen
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        {product.category && (
          <p className="text-xs font-medium uppercase tracking-wide text-amber-800">{product.category}</p>
        )}
        <h3 className="line-clamp-2 font-medium">
          <Link href={`/products/${product.id}`} className="hover:underline">
            {product.name}
          </Link>
        </h3>
        <p className="mt-auto text-lg font-semibold tabular-nums">{formatPrice(product.price)}</p>
        <AddToCartButton product={product} />
      </div>
    </article>
  );
}
