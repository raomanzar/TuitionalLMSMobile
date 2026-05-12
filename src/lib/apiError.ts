import { AxiosError } from "axios";

/**
 * Pull a user-facing message off whatever the mutation/query rejected with.
 * Canonical screen-layer helper — keeps the AxiosError narrowing in one place
 * so every screen renders the same wording for the same failure mode.
 *
 *  - AxiosError with a JSON body  → `data.message` / `data.error`
 *  - AxiosError without a body    → `error.message` (network/timeout)
 *  - any other Error              → `error.message`
 *  - everything else              → generic fallback
 */
export const getApiErrorMessage = (
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string => {
  if (error instanceof AxiosError) {
    const data = error.response?.data as
      | { message?: string; error?: string }
      | undefined;
    if (data?.message) return data.message;
    if (data?.error) return data.error;
    if (error.message) return error.message;
    return fallback;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
};
