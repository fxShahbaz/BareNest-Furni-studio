import { Skeleton } from "@/components/skeleton";

export default function OrdersLoading() {
  return (
    <div>
      {/* Stats strip */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-24" rounded="rounded-2xl" />
        ))}
      </div>

      {/* Toolbar */}
      <div className="mt-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Skeleton className="h-10 w-full md:max-w-md" rounded="rounded-full" />
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-10 w-36" rounded="rounded-full" />
          <Skeleton className="h-10 w-36" rounded="rounded-full" />
          <Skeleton className="h-10 w-32" rounded="rounded-full" />
          <Skeleton className="h-10 w-32" rounded="rounded-full" />
        </div>
      </div>

      {/* Status pills */}
      <div className="mt-4 flex flex-wrap gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-7 w-24" rounded="rounded-full" />
        ))}
      </div>

      {/* Order cards */}
      <div className="mt-6 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-3xl border border-ink/10 bg-cream/30 p-6 space-y-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-16" rounded="rounded-full" />
                  <Skeleton className="h-5 w-20" rounded="rounded-full" />
                  <Skeleton className="h-6 w-32" />
                </div>
                <Skeleton className="h-3 w-40" rounded="rounded-full" />
              </div>
              <div className="flex items-center gap-1">
                <Skeleton className="h-8 w-8" rounded="rounded-full" />
                <Skeleton className="h-8 w-8" rounded="rounded-full" />
              </div>
              <Skeleton className="h-6 w-24" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" rounded="rounded-full" />
              <Skeleton className="h-3 w-1/2" rounded="rounded-full" />
            </div>
            <div className="border-t border-ink/10 pt-4 flex flex-wrap gap-2">
              <Skeleton className="h-9 w-32" rounded="rounded-full" />
              <Skeleton className="h-9 w-28" rounded="rounded-full" />
              <Skeleton className="ml-auto h-9 w-28" rounded="rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
