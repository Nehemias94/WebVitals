import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-16 text-center">
      <p className="text-5xl font-bold text-amber-800">404</p>
      <h1 className="mt-2 text-2xl font-bold">Página no encontrada</h1>
      <Link href="/products" className="mt-6 inline-block font-semibold text-amber-800 hover:underline">
        Ir al catálogo
      </Link>
    </div>
  );
}
