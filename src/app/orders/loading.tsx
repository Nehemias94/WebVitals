import { OrderListSkeleton } from "@/components/skeletons";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-9 w-48 animate-pulse rounded bg-zinc-200" />
      <OrderListSkeleton />
    </div>
  );
}
