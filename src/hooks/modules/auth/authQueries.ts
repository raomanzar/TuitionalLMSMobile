import {
  confirmPassword,
  forgotPassword,
  resetPassword,
  signIn as signInRequest,
} from "@/services/apis/auth";
import type { SignIn_Payload_Type, User_Type } from "@/types/auth.types";
import { useAuthActions } from "@/stores";
import { useMutation } from "@tanstack/react-query";

/**
 * Stable key factory — auth itself is not a TanStack Query resource
 * (the source of truth is the Zustand `authStore`), but the namespace is
 * reserved here for symmetry with other modules and for future use
 * (e.g. invalidating user-scoped caches on sign-out).
 */
export const authQueryKeys = {
  all: ["auth"] as const,
};

/**
 * Signs the user in. On success, persists the token + user into the
 * Zustand `authStore` (which in turn writes to expo-secure-store and
 * primes the axios interceptor). Navigation, error display, and any
 * screen-level UI side effects live in the calling screen.
 *
 * The token is read from `data.token` first, falling back to `data.user.token`
 * — the dev backend has been observed to expose the JWT in both places, and
 * the User envelope's `token` field is canonical. A response with neither is
 * treated as a failure so the screen's `onError` fires instead of silently
 * writing `undefined` into the store.
 */
export function useSignInMutation() {
  const { signIn } = useAuthActions();
  return useMutation({
    mutationFn: async (
      payload: SignIn_Payload_Type,
    ): Promise<{ token: string; user: User_Type | undefined }> => {
      const data = await signInRequest(payload);
      const token = data?.token ?? data?.user?.token;
      if (!token) {
        throw new Error(
          "Sign-in succeeded but the server did not return a token.",
        );
      }
      return { token, user: data?.user };
    },
    onSuccess: ({ token, user }) => {
      signIn(token, user);
    },
  });
}

/** Sends a password-reset code to the user's email. */
export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: forgotPassword,
  });
}

/** Verifies the 6-digit code the user typed against the backend. */
export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: resetPassword,
  });
}

/** Sets a new password using a previously verified reset token. */
export function useConfirmPasswordMutation() {
  return useMutation({
    mutationFn: confirmPassword,
  });
}
