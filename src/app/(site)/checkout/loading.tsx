import { Skeleton } from "@/components/skeleton";

export default function CheckoutLoading() {
  return (
    <div className="pt-28 pb-32 md:pt-32">
      <div className="mx-auto max-w-[1280px] px-6 md:px-10">
        <Skeleton className="h-3 w-20" rounded="rounded-full" />
        <Skeleton className="mt-3 h-12 w-56 md:h-16" />

        <div className="mt-10 grid gap-10 md:grid-cols-12">
          {/* Form */}
          <div className="md:col-span-7 space-y-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-3 w-20" rounded="rounded-full" />
                <Skeleton className="h-12 w-full" rounded="rounded-full" />
              </div>
            ))}
            <Skeleton className="h-24 w-full" rounded="rounded-2xl" />
            <Skeleton className="h-14 w-48" rounded="rounded-full" />
          </div>

          {/* Summary */}
          <aside className="md:col-span-5 space-y-3 rounded-3xl border border-ink/10 bg-cream/30 p-6">
            <Skeleton className="h-3 w-16" rounded="rounded-full" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between gap-3">
                <Skeleton className="h-4 w-40" rounded="rounded-full" />
                <Skeleton className="h-4 w-16" rounded="rounded-full" />
              </div>
            ))}
            <div className="hairline my-4" />
            <div className="flex items-baseline justify-between">
              <Skeleton className="h-4 w-16" rounded="rounded-full" />
              <Skeleton className="h-8 w-32" />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
