import { AxiosPost } from "@/services/axios/helpers";
import type {
  ConfirmPassword_Type_Payload,
  ConfirmPassword_Type_Response,
  ForgotPassword_Payload_Type,
  ForgotPassword_Response_Type,
  ResetPasword_Type_Payload,
  ResetPasword_Type_Response,
  SignIn_Payload_Type,
  SignIn_Response_Type,
} from "@/types/auth.types";
import {
  changePasswordApi,
  requestPasswordResetApi,
  signInApi,
  verifyResetTokenApi,
} from "./endpoint";

// ─── Sign in ───────────────────────────────────────────────────

export const signIn = (payload: SignIn_Payload_Type) =>
  AxiosPost<SignIn_Response_Type>(signInApi(), payload);

// ─── Password reset flow ───────────────────────────────────────

export const forgotPassword = (payload: ForgotPassword_Payload_Type) =>
  AxiosPost<ForgotPassword_Response_Type>(requestPasswordResetApi(), payload);

export const resetPassword = (payload: ResetPasword_Type_Payload) =>
  AxiosPost<ResetPasword_Type_Response>(verifyResetTokenApi(), payload);

export const confirmPassword = (payload: ConfirmPassword_Type_Payload) =>
  AxiosPost<ConfirmPassword_Type_Response>(changePasswordApi(), payload);
