"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo } from "react";

export const DEFAULT_PAGE_SIZES = [10, 25, 50, 100] as const;

type Props = {
  /** Total number of items across all pages (post-filter). */
  total: number;
  /** Items per page. */
  pageSize: number;
  /** 1-indexed current page. */
  page: number;
  onPageChange: (next: number) => void;
  onPageSizeChange?: (next: number) => void;
  pageSizes?: readonly number[];
  /** Singular label used in the count: "12 of 47 orders". Defaults to "items". */
  label?: string;
};

/**
 * Builds a compact page range with ellipsis for large counts:
 *   1, 2, 3, …, 12      (when at start)
 *   1, …, 5, 6, 7, …, 12 (when in middle)
 *   1, …, 10, 11, 12    (when at end)
 */
function pageRange(current: number, totalPages: number): (number | "…")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const out: (number | "…")[] = [1];
  const left = Math.max(2, current - 1);
  const right = Math.min(totalPages - 1, current + 1);
  if (left > 2) out.push("…");
  for (let i = left; i <= right; i++) out.push(i);
  if (right < totalPages - 1) out.push("…");
  out.push(totalPages);
  return out;
}

export default function Pagination({
  total,
  pageSize,
  page,
  onPageChange,
  onPageSizeChange,
  pageSizes = DEFAULT_PAGE_SIZES,
  label = "items",
}: Props) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const end = Math.min(total, safePage * pageSize);
  const range = useMemo(() => pageRange(safePage, totalPages), [safePage, totalPages]);

  // Don't show pagination if everything fits on one page AND there's no size selector.
  if (totalPages <= 1 && !onPageSizeChange) return null;

  return (
    <div className="mt-6 flex flex-col items-center justify-between gap-3 sm:flex-row">
      <p className="text-xs text-muted">
        {total === 0
          ? `No ${label}`
          : `${start}–${end} of ${total} ${label}`}
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, safePage - 1))}
          disabled={safePage <= 1}
          aria-label="Previous page"
          className="grid h-8 w-8 place-items-center rounded-full border border-ink/15 text-ink/70 transition-colors hover:bg-ink/5 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-1">
          {range.map((p, i) =>
            p === "…" ? (
              <span
                key={`gap-${i}`}
                className="px-1 text-xs text-muted"
                aria-hidden
              >
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                aria-current={p === safePage ? "page" : undefined}
                className={`grid h-8 min-w-8 place-items-center rounded-full px-2 text-xs transition-colors ${
                  p === safePage
                    ? "bg-ink text-bone"
                    : "border border-ink/15 text-ink/80 hover:bg-ink/5"
                }`}
              >
                {p}
              </button>
            )
          )}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, safePage + 1))}
          disabled={safePage >= totalPages}
          aria-label="Next page"
          className="grid h-8 w-8 place-items-center rounded-full border border-ink/15 text-ink/70 transition-colors hover:bg-ink/5 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        {onPageSizeChange && (
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            aria-label="Page size"
            className="ml-1 rounded-full border border-ink/15 bg-bone px-2 py-1 text-xs focus:border-ink/40 focus:outline-none"
          >
            {pageSizes.map((s) => (
              <option key={s} value={s}>
                {s} / page
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}
