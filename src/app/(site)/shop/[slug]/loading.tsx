import { Skeleton, SkeletonLines } from "@/components/skeleton";

export default function ProductDetailLoading() {
  return (
    <div className="pt-28 pb-24">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <Skeleton className="h-3 w-28" rounded="rounded-full" />

        <div className="mt-8 grid gap-10 md:grid-cols-12">
          {/* Gallery */}
          <div className="md:col-span-7">
            <Skeleton className="aspect-[5/4] w-full" rounded="rounded-3xl" />
            <div className="mt-3 grid grid-cols-3 gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="aspect-[4/3] w-full"
                  rounded="rounded-2xl"
                />
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="md:col-span-5 md:pl-6 space-y-5">
            <Skeleton className="h-3 w-16" rounded="rounded-full" />
            <Skeleton className="h-14 w-3/4 md:h-20" />
            <Skeleton className="h-4 w-2/3" rounded="rounded-full" />
            <div className="flex items-end gap-4 pt-4">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-3 w-20" rounded="rounded-full" />
            </div>
            <Skeleton className="h-14 w-48" rounded="rounded-full" />
            <div className="hairline mt-6" />
            <SkeletonLines count={4} className="pt-4" />
            <div className="space-y-2 pt-4">
              <Skeleton className="h-3 w-24" rounded="rounded-full" />
              <SkeletonLines count={3} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
