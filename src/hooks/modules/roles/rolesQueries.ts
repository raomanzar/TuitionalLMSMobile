import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  addRole,
  deleteRole,
  getAllRoles,
  getRoleById,
  toUiRole,
  toUiRoles,
  updateRole,
} from "@/services/apis/roles";

/** Stable key factory — handy for invalidations after mutations. */
export const rolesQueryKeys = {
  all: ["roles"] as const,
  list: () => [...rolesQueryKeys.all, "list"] as const,
  detail: (id: string) => [...rolesQueryKeys.all, "detail", id] as const,
};

/**
 * GET /api/role — full list. The backend has no pagination or search params
 * for roles today, so we fetch the whole set and filter in `useFilteredRoles`.
 * If the list grows past a few hundred we should request a server-side filter.
 */
export function useRolesQuery(token: string | null) {
  return useQuery({
    queryKey: rolesQueryKeys.list(),
    queryFn: () => getAllRoles().then(toUiRoles),
    // Gate on token — defends against the brief window after sign-out where
    // the screen is still mounted but the interceptor has no token to attach.
    enabled: Boolean(token),
  });
}

/** GET /api/role?id=N — single role detail. Gated by `enabled` while id is undefined. */
export function useRoleByIdQuery(id: string | undefined, token: string | null) {
  return useQuery({
    queryKey: rolesQueryKeys.detail(id ?? ""),
    queryFn: () => getRoleById({ id: id! }).then(toUiRole),
    enabled: Boolean(id) && Boolean(token),
  });
}

/**
 * POST /api/role. On success, awaits a fresh GET /api/role so the list shows
 * the new record before navigation runs. Screen owns the error display + nav.
 * Invalidates only the list key (not the detail) so we don't fire a second
 * GET /api/role?id=N for whatever role's detail screen happens to be mounted.
 */
export function useCreateRoleMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: addRole,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: rolesQueryKeys.list() });
    },
  });
}

/** PUT /api/role?id=N — body is `{ name }`. See list-only invalidation note above. */
export function useUpdateRoleMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      updateRole({ id }, { name }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: rolesQueryKeys.list() });
    },
  });
}

/** DELETE /api/role?id=N. See list-only invalidation note above. */
export function useDeleteRoleMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteRole,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: rolesQueryKeys.list() });
    },
  });
}
