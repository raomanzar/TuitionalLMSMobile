import type { GetAllUsers_Api_Payload_Type } from "@/types/users.types";

/**
 * Path-only endpoint builders. The shared axios instance prepends `baseURL`,
 * so we don't repeat `BASE_URL` here.
 */

const getUsersByGroupApi = () => `/api/user/getAllUsersGroupBy`;

const getAllUsersApi = (options: GetAllUsers_Api_Payload_Type = {}) => {
  const params = new URLSearchParams();
  if (options.limit) params.append("limit", options.limit.toString());
  if (options.page) params.append("page", options.page.toString());
  if (options.startDate) params.append("startDate", options.startDate);
  if (options.endDate) params.append("endDate", options.endDate);
  if (options.userType !== undefined && options.userType !== null)
    params.append("userType", options.userType.toString());
  if (options.name) params.append("name", options.name);
  if (options.countryCode) params.append("countryCode", options.countryCode);
  if (options.email) params.append("email", options.email);
  if (options.exportData)
    params.append("exportData", options.exportData.toString());
  if (options.status !== undefined && options.status !== "")
    params.append("status", options.status.toString());

  const qs = params.toString();
  return qs ? `/api/user/getAllUsers?${qs}` : `/api/user/getAllUsers`;
};

const addUserApi = () => `/api/user/signUp`;
const deactivateUserApi = () => `/api/user/deactivate`;
const deleteUserApi = (id: string) => `/api/user/${id}`;
const updateUserApi = () => `/api/user/update`;

const getUserByIdApi = (options: { id: string }) => {
  const params = new URLSearchParams({ id: options.id.toString() });
  return `/api/user/getUserById?${params.toString()}`;
};

const addUserGmailApi = (options: { id: string }) =>
  `/api/user/${options.id}/add-gmail`;

const removeUserGmailApi = (options: { id: string }) =>
  `/api/user/${options.id}/remove-gmail`;

const addRelationApi = () => `/api/guardians/relationships`;

export {
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
};
