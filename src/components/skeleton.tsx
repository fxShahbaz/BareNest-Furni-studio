import { cn } from "@/lib/utils";

/**
 * A shimmering placeholder. Use for any rectangular slot that's loading.
 * Drop in alongside layout structure to communicate the eventual shape.
 *
 * <Skeleton className="h-10 w-48" />
 * <Skeleton className="aspect-square w-full" />
 */
export function Skeleton({
  className,
  rounded = "rounded-md",
}: {
  className?: string;
  rounded?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-cream/70",
        rounded,
        className
      )}
      aria-hidden
    >
      <div className="bn-shimmer" />
    </div>
  );
}

/** Multiple skeleton lines for paragraph-style loading. */
export function SkeletonLines({
  count = 3,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)} aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-3"
          rounded="rounded-full"
        />
      ))}
    </div>
  );
}
