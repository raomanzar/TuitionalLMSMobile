/**
 * Path-only endpoint builders. The shared axios instance prepends `baseURL`,
 * so we don't repeat `BASE_URL` here.
 */

const signInApi = () => `/api/user/signIn`;
const requestPasswordResetApi = () => `/api/user/requestPasswordReset`;
const verifyResetTokenApi = () => `/api/user/verifyResetToken`;
const changePasswordApi = () => `/api/user/changePassword`;

export {
  changePasswordApi,
  requestPasswordResetApi,
  signInApi,
  verifyResetTokenApi,
};
