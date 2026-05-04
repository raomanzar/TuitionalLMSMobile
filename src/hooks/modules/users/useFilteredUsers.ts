import { useMemo } from 'react';
import type { User, UserFilters } from '@/constants/users';

/**
 * Returns the subset of `users` matching the active filters.
 * Memoized — only recomputes when `users` or any filter field changes.
 */
export function useFilteredUsers(users: ReadonlyArray<User>, filters: UserFilters) {
  const { search, role, status, sync } = filters;

  return useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      if (role !== 'All' && u.role !== role) return false;
      if (status === 'Active' && !u.active) return false;
      if (status === 'Inactive' && u.active) return false;
      if (sync === 'Synced' && !u.synced) return false;
      if (sync === 'Unsynced' && u.synced) return false;
      if (q && !`${u.first} ${u.last} ${u.email} ${u.id}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [users, search, role, status, sync]);
}

/** Counts how many filters differ from the "All" defaults. */
export function countActiveFilters(filters: UserFilters): number {
  return (
    (filters.role !== 'All' ? 1 : 0) +
    (filters.status !== 'All' ? 1 : 0) +
    (filters.sync !== 'All' ? 1 : 0)
  );
}
