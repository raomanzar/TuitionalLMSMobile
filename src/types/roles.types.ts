/** Backend role object (matches the `role` shape embedded on every user). */
export type Role_Object_Type = {
  id: number;
  name: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  deletedAt?: string | Date | null;
};

/**
 * GET /api/role — list response. Assumed to be a bare array; if the backend
 * wraps it (e.g. `{ roles: [...] }`), update this type and the `getAllRoles`
 * helper together.
 */
export type GetAllRoles_Api_Response_Type = Role_Object_Type[];

/** POST /api/role payload. */
export type AddRole_Api_Payload_Type = {
  name: string;
};

/** PUT /api/role payload — body matches create; id travels as a query param. */
export type UpdateRole_Api_Payload_Type = {
  name: string;
};

/** DELETE /api/role param. */
export type DeleteRole_Api_Payload_Type = {
  id: string;
};

/** Generic single-role response (POST / PUT / GET-by-id). */
export type Role_Api_Response_Type = Role_Object_Type;
