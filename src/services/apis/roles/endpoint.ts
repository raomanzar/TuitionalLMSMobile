/**
 * Path-only endpoint builders. The shared axios instance prepends `baseURL`,
 * so we don't repeat `BASE_URL` here.
 */

const getAllRolesApi = () => `/api/role`;

const getRoleByIdApi = (options: { id: string }) => {
  const params = new URLSearchParams({ id: options.id.toString() });
  return `/api/role?${params.toString()}`;
};

const addRoleApi = () => `/api/role`;

/** PUT /api/role?id=N — body carries `{ name }`. */
const updateRoleApi = (options: { id: string }) => {
  const params = new URLSearchParams({ id: options.id.toString() });
  return `/api/role?${params.toString()}`;
};

const deleteRoleApi = (options: { id: string }) => {
  const params = new URLSearchParams({ id: options.id.toString() });
  return `/api/role?${params.toString()}`;
};

export {
  addRoleApi,
  deleteRoleApi,
  getAllRolesApi,
  getRoleByIdApi,
  updateRoleApi,
};
