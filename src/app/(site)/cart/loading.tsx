import { Skeleton } from "@/components/skeleton";

export default function CartLoading() {
  return (
    <div className="pt-32 pb-24">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <Skeleton className="h-3 w-16" rounded="rounded-full" />
        <Skeleton className="mt-3 h-12 w-48 md:h-16" />

        <div className="mt-12 grid gap-10 md:grid-cols-12">
          <div className="md:col-span-8 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 rounded-3xl border border-ink/10 bg-cream/30 p-4"
              >
                <Skeleton
                  className="h-24 w-24 shrink-0"
                  rounded="rounded-2xl"
                />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-3 w-28" rounded="rounded-full" />
                </div>
                <Skeleton className="h-8 w-20" rounded="rounded-full" />
                <Skeleton className="h-5 w-16" />
              </div>
            ))}
          </div>

          <aside className="md:col-span-4 space-y-3 rounded-3xl border border-ink/10 bg-cream/30 p-6">
            <Skeleton className="h-3 w-16" rounded="rounded-full" />
            <div className="space-y-2 pt-2">
              <Skeleton className="h-4 w-full" rounded="rounded-full" />
              <Skeleton className="h-4 w-5/6" rounded="rounded-full" />
            </div>
            <div className="hairline my-4" />
            <div className="flex items-baseline justify-between">
              <Skeleton className="h-4 w-16" rounded="rounded-full" />
              <Skeleton className="h-8 w-28" />
            </div>
            <Skeleton className="mt-4 h-12 w-full" rounded="rounded-full" />
          </aside>
        </div>
      </div>
    </div>
  );
}
