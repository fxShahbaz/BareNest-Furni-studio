import { Skeleton } from "@/components/skeleton";

export default function ProductsLoading() {
  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <Skeleton className="h-10 w-full md:max-w-md" rounded="rounded-full" />
        <div className="flex flex-wrap items-center gap-3">
          <Skeleton className="h-10 w-32" rounded="rounded-full" />
          <Skeleton className="h-10 w-36" rounded="rounded-full" />
        </div>
      </div>

      {/* Material pills */}
      <div className="mt-5 flex flex-wrap gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-7 w-20" rounded="rounded-full" />
        ))}
      </div>

      {/* List rows */}
      <div className="mt-6 divide-y divide-ink/10 rounded-3xl border border-ink/10 bg-cream/30">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4">
            <Skeleton className="h-16 w-16 shrink-0" rounded="rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-3 w-64" rounded="rounded-full" />
            </div>
            <div className="flex items-center gap-1">
              <Skeleton className="h-8 w-8" rounded="rounded-full" />
              <Skeleton className="h-8 w-8" rounded="rounded-full" />
              <Skeleton className="h-8 w-8" rounded="rounded-full" />
            </div>
            <Skeleton className="h-4 w-20" rounded="rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
