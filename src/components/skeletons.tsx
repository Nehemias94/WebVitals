export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
      aria-busy="true"
      aria-label="Cargando productos"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-md border border-zinc-200 bg-white">
          <div className="aspect-square animate-pulse bg-zinc-100" />
          <div className="space-y-3 p-4">
            <div className="h-4 w-3/4 animate-pulse rounded bg-zinc-100" />
            <div className="h-5 w-1/3 animate-pulse rounded bg-zinc-100" />
            <div className="h-9 animate-pulse rounded-lg bg-zinc-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function OrderListSkeleton() {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Cargando órdenes">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-20 animate-pulse rounded-md border border-zinc-200 bg-white" />
      ))}
    </div>
  );
}

export function PanelSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true">
      <div className="h-8 w-1/3 animate-pulse rounded bg-zinc-200" />
      <div className="h-64 animate-pulse rounded-md bg-zinc-100" />
    </div>
  );
}
