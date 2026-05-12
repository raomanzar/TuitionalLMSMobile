/** UI-shaped role record consumed by `RoleCard`, edit/delete screens. */
export type Role = {
  id: number;
  name: string;
  /** Pre-formatted createdAt date (e.g. "27-Apr-26"). */
  date: string;
  /** Deterministic avatar tint derived from `id`. */
  color: string;
};
