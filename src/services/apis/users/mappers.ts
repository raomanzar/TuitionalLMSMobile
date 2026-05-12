/**
 * Maps API user objects → the UI `User` shape consumed by components
 * (`UserCard`, `UserDetailSheet`, etc.).
 *
 * The backend returns a flat record keyed by snake_case (`User_Object_Type`),
 * the UI expects split first/last names, a normalized role, a short date,
 * and a deterministic avatar color. This file owns that translation so
 * components stay backend-agnostic.
 */
import type {
  Role,
  User as UiUser,
  UserDetail,
  UserFilters,
} from "@/constants/users";
import type {
  GetAllUsers_Api_Payload_Type,
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

/**
 * UI Role → backend `roleId`. Inverse of `normalizeRole` (which is name-based).
 *
 * NOTE: confirm these IDs against the backend before shipping. They match the
 * web app's current convention (1=Admin, 2=Teacher, 3=Student, 4=Parent).
 */
export const uiRoleToRoleId = (role: Role): number => {
  switch (role) {
    case "Admin":   return 1;
    case "Teacher": return 2;
    case "Student": return 3;
    case "Parent":  return 4;
  }
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

/**
 * Formats `2026-05-07T...` → `07-May-26`. Single date format used everywhere
 * a user's `date` field is shown (list cards, detail screen, any future surface).
 */
export const formatShortDate = (input?: string | Date | null): string => {
  if (!input) return "";
  const d = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(d.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  }).formatToParts(d);
  const day = parts.find((p) => p.type === "day")?.value ?? "";
  const month = parts.find((p) => p.type === "month")?.value ?? "";
  const year = parts.find((p) => p.type === "year")?.value ?? "";
  return `${day}-${month}-${year}`;
};

/** Splits "Maria Clara" → { first: "Maria", last: "Clara" }. */
const splitName = (name?: string) => {
  const parts = (name ?? "").trim().split(/\s+/);
  const first = parts[0] ?? "";
  const last = parts.slice(1).join(" ");
  return { first, last };
};

/**
 * Map a single API user record to the UI shape. Both `getAllUsers` and
 * `getUserById` now return the same `User_Object_Type` payload, so the mapper
 * has one input shape and no per-endpoint branching.
 */
export const toUiUser = (api: User_Object_Type): UiUser => {
  const { first, last } = splitName(api.name);
  const trimmedImage = api.profileImageUrl?.trim();
  return {
    id: api.id,
    first,
    last,
    email: api.email,
    role: normalizeRole(api.role?.name),
    date: formatShortDate(api.createdAt),
    active: Boolean(api.status),
    synced: Boolean(api.isSync),
    color: pickAvatarColor(api.id),
    profileImageUrl: trimmedImage ? trimmedImage : undefined,
  };
};

/** Map a list response. */
export const toUiUsers = (list: readonly User_Object_Type[]): UiUser[] =>
  list.map(toUiUser);

/**
 * UI filter state → API payload. Translates everything the server can filter
 * on so `useUsersQuery` ships filtered requests instead of fetching the full
 * dataset and filtering client-side.
 *
 * Search routing: a value containing `@` is sent as `email` (partial match),
 * otherwise as `name`. This sidesteps the question of whether the backend
 * ANDs or ORs the two params — we only send one per request.
 *
 * `sync` is intentionally absent: the backend has no equivalent filter, so
 * `useFilteredUsers` keeps that one on the client.
 */
export const uiFiltersToApiPayload = (
  filters: UserFilters,
): GetAllUsers_Api_Payload_Type => {
  const payload: GetAllUsers_Api_Payload_Type = {};

  const trimmedSearch = filters.search.trim();
  if (trimmedSearch) {
    if (trimmedSearch.includes("@")) {
      payload.email = trimmedSearch;
    } else {
      payload.name = trimmedSearch;
    }
  }

  if (filters.role !== "All") {
    payload.userType = uiRoleToRoleId(filters.role);
  }

  if (filters.status === "Active") payload.status = true;
  else if (filters.status === "Inactive") payload.status = false;

  if (filters.countryCode) {
    payload.countryCode = filters.countryCode;
  }

  return payload;
};

/**
 * Map the `getUserById` response to the detail-screen shape. The endpoint now
 * returns the same `User_Object_Type` as the list endpoint, so this is just
 * `toUiUser` plus the extra fields the detail screen needs (pseudo / phone /
 * city / country / gender / roleId).
 *
 * `ticket` defaults to empty — it isn't part of the unified shape; the Edit
 * form's input lets the user set it on demand for Student-role updates.
 */
export const toUiUserDetail = (api: User_Object_Type): UserDetail => ({
  ...toUiUser(api),
  roleId: api.roleId,
  pseudo: api.pseudo_name ?? "",
  phone: api.phone_number ?? "",
  city: api.city ?? "",
  country: api.country ?? "",
  countryCode: api.country_code ?? "",
  gender: api.gender ?? "",
  calendarIntegrationEnabled: Boolean(api.calendar_integration_enabled),
  ticket: "",
});
