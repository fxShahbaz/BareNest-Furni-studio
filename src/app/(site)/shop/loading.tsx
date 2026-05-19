import { Skeleton } from "@/components/skeleton";

export default function ShopLoading() {
  return (
    <div className="pt-28 pb-24">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <Skeleton className="h-3 w-20" rounded="rounded-full" />
        <Skeleton className="mt-4 h-12 w-3/4 max-w-xl md:h-16" />
        <Skeleton className="mt-3 h-4 w-2/3 max-w-md" rounded="rounded-full" />

        {/* Category pills */}
        <div className="mt-10 flex flex-wrap gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-24" rounded="rounded-full" />
          ))}
        </div>

        {/* Product grid */}
        <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="aspect-[4/5] w-full" rounded="rounded-2xl" />
              <div className="mt-4 flex items-baseline justify-between gap-3">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="mt-2 h-3 w-40" rounded="rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
