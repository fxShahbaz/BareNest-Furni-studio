import { Skeleton } from "@/components/skeleton";

export default function SubscribersLoading() {
  return (
    <div>
      {/* Stats strip */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24" rounded="rounded-2xl" />
        ))}
      </div>

      {/* Toolbar */}
      <div className="mt-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Skeleton className="h-10 w-full md:max-w-md" rounded="rounded-full" />
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-10 w-36" rounded="rounded-full" />
          <Skeleton className="h-10 w-32" rounded="rounded-full" />
        </div>
      </div>

      <Skeleton className="mt-3 h-3 w-20" rounded="rounded-full" />

      {/* List rows */}
      <div className="mt-3 divide-y divide-ink/10 rounded-3xl border border-ink/10 bg-cream/30">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-4">
            <Skeleton className="h-9 w-9 shrink-0" rounded="rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-56" />
              <Skeleton className="h-3 w-40" rounded="rounded-full" />
            </div>
            <div className="flex items-center gap-1">
              <Skeleton className="h-8 w-8" rounded="rounded-full" />
              <Skeleton className="h-8 w-8" rounded="rounded-full" />
              <Skeleton className="h-8 w-8" rounded="rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
