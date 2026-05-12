import {
  addUser,
  deleteUser,
  getAllUsers,
  getUserById,
  toUiUserDetail,
  toUiUsers,
  updateUser,
} from "@/services/apis/users";
import type { GetAllUsers_Api_Payload_Type } from "@/types/users.types";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

const DEFAULT_PAGE_SIZE = 15;

/** Stable key factory — handy for invalidations after mutations. */
export const usersQueryKeys = {
  all: ["users"] as const,
  list: (params: GetAllUsers_Api_Payload_Type) =>
    [...usersQueryKeys.all, "list", params] as const,
  infiniteList: (params: GetAllUsers_Api_Payload_Type) =>
    [...usersQueryKeys.all, "infinite", params] as const,
  detail: (id: string) => [...usersQueryKeys.all, "detail", id] as const,
};

/**
 * Infinite-paginated users query. Loads `limit` records per page (default 15)
 * and walks `currentPage` → `totalPages` returned by the backend. Mappers run
 * inside `queryFn` so screens consume UI-shaped data.
 *
 * Consumer flattens pages with `data.pages.flatMap(p => p.users)` and triggers
 * `fetchNextPage()` from `onEndReached` on the FlatList.
 */
export function useUsersQuery(
  params: GetAllUsers_Api_Payload_Type = {},
  token: string | null,
) {
  const limit = params.limit ?? DEFAULT_PAGE_SIZE;

  return useInfiniteQuery({
    queryKey: usersQueryKeys.infiniteList({ ...params, limit }),
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const res = await getAllUsers({ ...params, limit, page: pageParam });
      return {
        users: toUiUsers(res.users),
        total: res.totalCount,
        page: res.currentPage,
        totalPages: res.totalPages,
      };
    },
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    // Gate on token — defends against the brief window after sign-out where
    // the screen is still mounted but the interceptor has no token to attach.
    enabled: Boolean(token),
  });
}

/**
 * Detail query — fetches a single user by id and maps to the UI `UserDetail`
 * shape (which adds pseudo / phone / country on top of the list shape).
 * Gated by `enabled` so it no-ops while the route param is undefined or the
 * user has signed out (token cleared).
 */
export function useUserByIdQuery(id: string | undefined, token: string | null) {
  return useQuery({
    queryKey: usersQueryKeys.detail(id ?? ""),
    queryFn: () => getUserById({ id: id! }).then(toUiUserDetail),
    enabled: Boolean(id) && Boolean(token),
  });
}

/**
 * Creates a user. On success, invalidates every users query so the list
 * refetches with the new record.
 *
 * Per skill rules: this hook surfaces `mutation.error` to the screen — the
 * screen decides how to display (Alert / Toast / inline) and whether to navigate.
 */
export function useCreateUserMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: addUser,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: usersQueryKeys.all });
    },
  });
}

/** Updates a user. Hierarchical invalidation refetches list + detail in one call. */
export function useUpdateUserMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: usersQueryKeys.all });
    },
  });
}

/** Deletes a user by id. Same invalidation pattern as the others. */
export function useDeleteUserMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: usersQueryKeys.all });
    },
  });
}
