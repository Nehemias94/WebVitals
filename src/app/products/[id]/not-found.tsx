import Link from "next/link";

export default function ProductNotFound() {
  return (
    <div className="py-16 text-center">
      <h1 className="text-2xl font-bold">Producto no encontrado</h1>
      <p className="mt-2 text-zinc-600">Puede que ya no esté disponible.</p>
      <Link href="/products" className="mt-6 inline-block font-semibold text-amber-800 hover:underline">
        ← Volver al catálogo
      </Link>
    </div>
  );
}
