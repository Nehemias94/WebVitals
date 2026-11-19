export default function Loading() {
  return (
    <div className="grid gap-8 md:grid-cols-2" aria-busy="true">
      <div className="aspect-square animate-pulse rounded-md bg-zinc-100" />
      <div className="space-y-4">
        <div className="h-8 w-3/4 animate-pulse rounded bg-zinc-200" />
        <div className="h-6 w-1/4 animate-pulse rounded bg-zinc-200" />
        <div className="h-24 animate-pulse rounded bg-zinc-100" />
        <div className="h-10 animate-pulse rounded-lg bg-zinc-200" />
      </div>
    </div>
  );
}
