import { Skeleton, SkeletonLines } from "@/components/skeleton";

export default function SettingsLoading() {
  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-ink/10 bg-cream/30 p-6 md:p-8">
        <div className="flex items-start justify-between gap-6">
          <div className="space-y-3">
            <Skeleton className="h-3 w-24" rounded="rounded-full" />
            <Skeleton className="h-8 w-64" />
            <SkeletonLines count={2} className="max-w-prose pt-2" />
          </div>
          <Skeleton className="h-7 w-12" rounded="rounded-full" />
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Skeleton className="h-24" rounded="rounded-2xl" />
          <Skeleton className="h-24" rounded="rounded-2xl" />
        </div>
      </section>
      <div className="flex justify-end">
        <Skeleton className="h-11 w-36" rounded="rounded-full" />
      </div>
    </div>
  );
}
