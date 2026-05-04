import { useQuery } from "@tanstack/react-query";
import { getAllUsers, toUiUsers } from "@/services/apis/users";
import type { GetAllUsers_Api_Payload_Type } from "@/types/users.types";

/** Stable key factory — handy for invalidations after mutations. */
export const usersQueryKeys = {
  all: ["users"] as const,
  list: (params: GetAllUsers_Api_Payload_Type) =>
    [...usersQueryKeys.all, "list", params] as const,
};

/**
 * Fetches users from `GET /api/user/getAllUsers`, maps the API records
 * into the UI `User` shape via `toUiUsers`, and surfaces pagination meta.
 */
export function useUsersQuery(params: GetAllUsers_Api_Payload_Type = {}) {
  return useQuery({
    queryKey: usersQueryKeys.list(params),
    queryFn: async () => {
      const res = await getAllUsers(params);
      return {
        users: toUiUsers(res.users),
        total: res.totalCount,
        page: res.currentPage,
        totalPages: res.totalPages,
      };
    },
  });
}
