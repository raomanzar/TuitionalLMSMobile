import {
  AxiosDelete,
  AxiosGet,
  AxiosPost,
  AxiosPut,
} from "@/services/axios/helpers";
import type {
  AddRole_Api_Payload_Type,
  DeleteRole_Api_Payload_Type,
  GetAllRoles_Api_Response_Type,
  Role_Api_Response_Type,
  UpdateRole_Api_Payload_Type,
} from "@/types/roles.types";
import {
  addRoleApi,
  deleteRoleApi,
  getAllRolesApi,
  getRoleByIdApi,
  updateRoleApi,
} from "./endpoint";

// ─── Reads ─────────────────────────────────────────────────────

export const getAllRoles = () =>
  AxiosGet<GetAllRoles_Api_Response_Type>(getAllRolesApi());

export const getRoleById = (options: { id: string }) =>
  AxiosGet<Role_Api_Response_Type>(getRoleByIdApi(options));

// ─── Writes ────────────────────────────────────────────────────

export const addRole = (payload: AddRole_Api_Payload_Type) =>
  AxiosPost<Role_Api_Response_Type>(addRoleApi(), payload);

export const updateRole = (
  options: { id: string },
  payload: UpdateRole_Api_Payload_Type,
) => AxiosPut<Role_Api_Response_Type>(updateRoleApi(options), payload);

export const deleteRole = (payload: DeleteRole_Api_Payload_Type) =>
  AxiosDelete<{ message: string }>(deleteRoleApi({ id: payload.id }));
