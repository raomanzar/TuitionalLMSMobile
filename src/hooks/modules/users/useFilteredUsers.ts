import { useMemo } from 'react';
import type { User, UserFilters } from '@/constants/users';

/**
 * Final client-side pass over results that came back from the server.
 * Only the `sync` filter runs here — the backend has no equivalent param.
 * Everything else (search / role / status / countryCode) is applied server-side
 * via `uiFiltersToApiPayload` so the list shows the server's filtered total
 * and pagination stays meaningful.
 */
export function useFilteredUsers(users: readonly User[], filters: UserFilters) {
  const { sync } = filters;

  return useMemo(() => {
    if (sync === 'All') return users as User[];
    return users.filter((u) => {
      if (sync === 'Synced' && !u.synced) return false;
      if (sync === 'Unsynced' && u.synced) return false;
      return true;
    });
  }, [users, sync]);
}

/** Counts how many filters differ from the "All" / empty defaults. */
export function countActiveFilters(filters: UserFilters): number {
  return (
    (filters.role !== 'All' ? 1 : 0) +
    (filters.status !== 'All' ? 1 : 0) +
    (filters.sync !== 'All' ? 1 : 0) +
    (filters.countryCode ? 1 : 0)
  );
}
