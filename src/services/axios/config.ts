import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";

/**
 * Base URL for every API call. Driven by EAS / .env so dev / staging / prod
 * can swap without code changes. Falls back to dev so local builds keep working.
 */
export const BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "https://dev.tuitionaledu.com";

const DEFAULT_TIMEOUT_MS = 30_000;

// ─── Auth token store ──────────────────────────────────────────
// Module-level for now. When the auth flow ships, swap this for a
// `expo-secure-store` read so the token survives reloads.
let authToken: string | null = null;
export const setAuthToken = (token: string | null) => {
  authToken = token;
};
export const getAuthToken = () => authToken;

// ─── Shared axios instance ─────────────────────────────────────
export const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: DEFAULT_TIMEOUT_MS,
  headers: { "Content-Type": "application/json" },
});

// Request: inject token if present. Match the existing web contract
// (raw token, no `Bearer ` prefix). Adjust here if backend changes.
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (authToken) config.headers.set("Authorization", authToken);
  return config;
});

// Response: pass-through. Errors propagate as AxiosError; call sites
// can `instanceof AxiosError` if they need to inspect status / body.
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => Promise.reject(error),
);
