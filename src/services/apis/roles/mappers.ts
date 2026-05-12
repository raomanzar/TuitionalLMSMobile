/**
 * Maps backend role objects → the UI `Role` shape consumed by components
 * (`RoleCard`, edit/delete screens). Mirrors `services/apis/users/mappers.ts`
 * — components stay backend-agnostic; this file owns the translation.
 */
import { pickAvatarColor } from "@/services/apis/users/mappers";
import type { Role as UiRole } from "@/constants/roles";
import type { Role_Object_Type } from "@/types/roles.types";

/** Formats `2026-04-27T...` → `27-Apr-26`. Same shape as the users formatter. */
const formatDate = (input?: string | Date | null): string => {
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

/** Map a single API role record to the UI shape. */
export const toUiRole = (api: Role_Object_Type): UiRole => ({
  id: api.id,
  name: api.name,
  date: formatDate(api.createdAt),
  color: pickAvatarColor(api.id),
});

/** Map a list response. */
export const toUiRoles = (list: readonly Role_Object_Type[]): UiRole[] =>
  list.map(toUiRole);
