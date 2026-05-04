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
  Get_User_By_Id_ApiResponse_Type,
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

export const getUserById = (options: { id: string }) =>
  AxiosGet<Get_User_By_Id_ApiResponse_Type>(getUserByIdApi(options));

// ─── Writes ────────────────────────────────────────────────────

export const addUser = (payload: AddUser_Api_Payload_Type) =>
  AxiosPost<User_Object_Type>(addUserApi(), payload);

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
