import axios, {
  type AxiosError,
  type AxiosInstance,
} from "axios";

/**
 * Base URL for every API call. Driven by EAS / .env so dev / staging / prod
 * can swap without code changes. Falls back to dev so local builds keep working.
 */
export const BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "https://dev.tuitionaledu.com";

const DEFAULT_TIMEOUT_MS = 30_000;

// ─── Auth token (interceptor read-cache) ───────────────────────
// Source of truth is the Zustand `authStore` (persisted to expo-secure-store).
// This is the hot read for the request interceptor — kept module-local so the
// interceptor stays synchronous. The store calls `setAuthToken` from `signIn`,
// `signOut`, and `onRehydrateStorage`. Do NOT write to this from app code;
// always go through `useAuthActions()` so persistence stays in sync.
let authToken: string | null = null;
export const setAuthToken = (token: string | null) => {
  authToken = token;
};
export const getAuthToken = () => authToken;

// ─── 401 / session-expiry handler ──────────────────────────────
// Registered by `authStore` at module load (avoids a circular import).
// Called by the response interceptor when a request that carried a token
// comes back 401 — i.e. the token was rejected mid-session. The handler
// is expected to clear the session; the route guard reacts to that and
// redirects to `/signin`. Sign-in attempts with bad credentials never
// fire this because the request has no Authorization header.
let onUnauthorized: (() => void) | null = null;
export const setUnauthorizedHandler = (fn: (() => void) | null) => {
  onUnauthorized = fn;
};

// ─── Public (unauthenticated) endpoints ────────────────────────
// Endpoints that must NEVER carry an Authorization header — they're called
// before the user has a session (sign-in) or as part of recovering a session
// (password-reset chain). The interceptor skips token injection for these
// paths so a stale token left in the read-cache (e.g. after a 401 / sign-out
// that hasn't propagated yet) can't accidentally be sent. Keep in sync with
// `src/services/apis/auth/endpoint.ts` — the source of truth for these paths.
const PUBLIC_AUTH_PATHS: readonly string[] = [
  "/api/user/signIn",
  "/api/user/requestPasswordReset",
  "/api/user/verifyResetToken",
  "/api/user/changePassword",
];

const isPublicAuthRequest = (url: string | undefined): boolean => {
  if (!url) return false;
  // `config.url` is the path that was passed to AxiosPost/Get/... — strip any
  // accidental query string before matching so `?foo=bar` doesn't defeat the
  // check.
  const path = url.split("?")[0];
  return PUBLIC_AUTH_PATHS.includes(path);
};

// ─── Shared axios instance ─────────────────────────────────────
export const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: DEFAULT_TIMEOUT_MS,
  headers: { "Content-Type": "application/json" },
});

// Request: inject token if present, EXCEPT for the public auth endpoints
// above. Match the existing web contract (raw token, no `Bearer ` prefix).
api.interceptors.request.use((config) => {
  if (authToken && !isPublicAuthRequest(config.url)) {
    config.headers.set("Authorization", authToken);
  }
  return config;
});

// Response: forward the error untouched (call sites still see the rejection).
// 401 on a request that carried an auth header pings the session-expiry
// handler so the store can clear auth and the route guard can redirect.
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const wasAuthenticated = Boolean(
      error.config?.headers?.Authorization ?? error.config?.headers?.authorization,
    );
    if (error.response?.status === 401 && wasAuthenticated) {
      onUnauthorized?.();
    }
    return Promise.reject(error);
  },
);
