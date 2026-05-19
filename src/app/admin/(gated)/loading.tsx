import { Skeleton, SkeletonLines } from "@/components/skeleton";

// Generic admin loading skeleton. Per-section files override this with a
// shape closer to the actual page; this one covers Overview and any new
// pages that haven't shipped a dedicated loading.tsx yet.
export default function AdminLoading() {
  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32" rounded="rounded-3xl" />
        ))}
      </div>
      <div className="mt-10">
        <Skeleton className="h-3 w-24" rounded="rounded-full" />
        <SkeletonLines count={6} className="mt-4 max-w-prose" />
      </div>
    </div>
  );
}
