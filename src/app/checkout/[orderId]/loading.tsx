export default function Loading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Cargando checkout">
      <div className="h-9 w-40 animate-pulse rounded bg-zinc-200" />
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="h-72 animate-pulse rounded-md bg-zinc-100" />
        <div className="h-48 animate-pulse rounded-md bg-zinc-100" />
      </div>
    </div>
  );
}
