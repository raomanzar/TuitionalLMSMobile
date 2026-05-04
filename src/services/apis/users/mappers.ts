/**
 * Maps API user objects → the UI `User` shape consumed by components
 * (`UserCard`, `UserDetailSheet`, etc.).
 *
 * The backend returns a flat record keyed by snake_case (`User_Object_Type`),
 * the UI expects split first/last names, a normalized role, a short date,
 * and a deterministic avatar color. This file owns that translation so
 * components stay backend-agnostic.
 */
import type { Role, User as UiUser } from "@/constants/users";
import type {
  Get_User_By_Id_ApiResponse_Type,
  User_Object_Type,
} from "@/types/users.types";

const AVATAR_PALETTE = [
  "#FFD3B6",
  "#C7F2D2",
  "#FFE4B5",
  "#D6CDF7",
  "#C7E0FF",
  "#FFD6E7",
  "#FFE0AC",
  "#D9E8FF",
  "#FFD0D0",
  "#C9F0E5",
  "#E8D7FF",
  "#FFE9C4",
  "#D2EBFF",
];

/** Deterministic avatar tint so the same id always renders the same color. */
export const pickAvatarColor = (id: number | string): string => {
  const n = typeof id === "number" ? id : Number(id) || 0;
  return AVATAR_PALETTE[Math.abs(n) % AVATAR_PALETTE.length];
};

/** Maps backend role names to the UI `Role` union. Unknown roles fall back to "Student". */
export const normalizeRole = (apiRoleName?: string): Role => {
  switch (apiRoleName?.toLowerCase()) {
    case "teacher":
    case "tutor":
      return "Teacher";
    case "admin":
    case "superadmin":
      return "Admin";
    case "parent":
    case "guardian":
      return "Parent";
    case "student":
    default:
      return "Student";
  }
};

/** Formats `2026-04-27T...` → `27 Apr` (matches design). */
export const formatShortDate = (input?: string | Date | null): string => {
  if (!input) return "";
  const d = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
};

/** Splits "Maria Clara" → { first: "Maria", last: "Clara" }. */
const splitName = (name?: string) => {
  const parts = (name ?? "").trim().split(/\s+/);
  const first = parts[0] ?? "";
  const last = parts.slice(1).join(" ");
  return { first, last };
};

type AnyApiUser = User_Object_Type | Get_User_By_Id_ApiResponse_Type;

/** Map a single API user record to the UI shape. */
export const toUiUser = (api: AnyApiUser): UiUser => {
  const { first, last } = splitName(api.name);
  const roleName = "role" in api ? api.role?.name : undefined;
  return {
    id: api.id,
    first,
    last,
    email: api.email,
    role: normalizeRole(roleName),
    date: formatShortDate(api.createdAt),
    active: Boolean(api.status),
    synced: Boolean(api.isSync),
    color: pickAvatarColor(api.id),
  };
};

/** Map a list response. */
export const toUiUsers = (list: ReadonlyArray<User_Object_Type>): UiUser[] =>
  list.map(toUiUser);
