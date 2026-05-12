import { ConvertObjectToFormData } from "@/services/axios/payload-conversions";
import {
  AxiosDelete,
  AxiosGet,
  AxiosPost,
  AxiosPut,
} from "@/services/axios/helpers";
import type {
  AddRelation_Api_Payload_Type,
  AddRelation_Api_Response_Type,
  AddUser_Api_Payload_Type,
  Add_Delete_Gmail_Api_Response_Type,
  DeactivateUser_Api_Payload_Type,
  GetAllUsers_Api_Payload_Type,
  GetAllUsers_Api_Response_Type,
  GetAllUsersByGroup_ApiResponse_Type,
  GetUserById_Api_Response_Type,
  Gmail_Api_Payload_Type,
  UpdateUser_Api_Payload_Type,
  UpdateUser_ApiResponse_Type,
  User_Object_Type,
} from "@/types/users.types";
import {
  addRelationApi,
  addUserApi,
  addUserGmailApi,
  deactivateUserApi,
  deleteUserApi,
  getAllUsersApi,
  getUserByIdApi,
  getUsersByGroupApi,
  removeUserGmailApi,
  updateUserApi,
} from "./endpoint";

// ─── Reads ─────────────────────────────────────────────────────

export const getAllUsersByGroup = () =>
  AxiosGet<GetAllUsersByGroup_ApiResponse_Type>(getUsersByGroupApi());

export const getAllUsers = (options: GetAllUsers_Api_Payload_Type = {}) =>
  AxiosGet<GetAllUsers_Api_Response_Type>(getAllUsersApi(options));

/**
 * Returns the same `User_Object_Type` shape as `getAllUsers`. Backend wraps
 * the response in `{ user: ... }` — we unwrap here so the mapper / hooks
 * downstream don't need to know about the envelope.
 */
export const getUserById = (options: { id: string }): Promise<User_Object_Type> =>
  AxiosGet<GetUserById_Api_Response_Type>(getUserByIdApi(options)).then(
    (r) => r.user,
  );

// ─── Writes ────────────────────────────────────────────────────

/**
 * Sends as multipart/form-data per the swagger spec — `profileImage` ships as
 * a binary file part, every other field as a string. Axios sets the boundary
 * header automatically once it sees a `FormData` instance.
 */
export const addUser = (payload: AddUser_Api_Payload_Type) =>
  AxiosPost<User_Object_Type>(addUserApi(), ConvertObjectToFormData(payload));

export const addRelation = (payload: AddRelation_Api_Payload_Type) =>
  AxiosPost<AddRelation_Api_Response_Type>(addRelationApi(), payload);

export const deactivateUser = (payload: DeactivateUser_Api_Payload_Type) =>
  AxiosPut<{ message: string }>(deactivateUserApi(), payload);

export const deleteUser = (payload: { id: string }) =>
  AxiosDelete<{ message: string }>(deleteUserApi(payload.id), payload);

export const updateUser = (payload: UpdateUser_Api_Payload_Type) =>
  AxiosPut<UpdateUser_ApiResponse_Type>(updateUserApi(), payload);

// ─── Gmail attachments ─────────────────────────────────────────

export const addUserGmail = (
  options: { id: string },
  payload: Gmail_Api_Payload_Type,
) =>
  AxiosPost<Add_Delete_Gmail_Api_Response_Type>(
    addUserGmailApi(options),
    payload,
  );

export const removeUserGmail = (
  options: { id: string },
  payload: Gmail_Api_Payload_Type,
) =>
  AxiosDelete<Add_Delete_Gmail_Api_Response_Type>(
    removeUserGmailApi(options),
    payload,
  );
