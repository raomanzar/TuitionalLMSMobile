import { useMemo } from 'react';
import type {
  CancelledClass,
  CancelledClassFilters,
} from '@/constants/cancelled-classes';

/**
 * Returns the subset of `classes` matching the active filters.
 * Memoized — only recomputes when `classes` or any filter field changes.
 */
export function useFilteredCancelledClasses(
  classes: readonly CancelledClass[],
  filters: CancelledClassFilters,
) {
  const { search, cancelledBy, refundStatus, dateRange } = filters;

  return useMemo(() => {
    const q = search.trim().toLowerCase();
    const dateLimit =
      dateRange === 'Today' ? 0 : dateRange === 'Week' ? 7 : dateRange === 'Month' ? 30 : Infinity;

    return classes.filter((c) => {
      if (cancelledBy !== 'All' && c.cancelledBy !== cancelledBy) return false;
      if (refundStatus !== 'All' && c.refundStatus !== refundStatus) return false;
      if (dateRange === 'Today' ? c.cancelledDaysAgo > 0 : c.cancelledDaysAgo > dateLimit) return false;
      if (
        q &&
        !`${c.subject} ${c.studentName} ${c.teacherName} ${c.id}`.toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [classes, search, cancelledBy, refundStatus, dateRange]);
}

/** Counts how many filters differ from the "All" defaults. */
export function countActiveCancelledClassFilters(filters: CancelledClassFilters): number {
  return (
    (filters.cancelledBy !== 'All' ? 1 : 0) +
    (filters.refundStatus !== 'All' ? 1 : 0) +
    (filters.dateRange !== 'All' ? 1 : 0)
  );
}
