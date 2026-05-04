import { api } from "./config";

/**
 * Thin typed wrappers around the shared axios instance.
 *
 * The instance handles `baseURL`, JSON `Content-Type`, and bearer-token
 * injection (see `./config.ts`), so call sites don't pass a config object.
 *
 * For multipart uploads pass a `FormData` instance as `data` — axios
 * detects it and sets the boundary header automatically.
 */
export const AxiosGet = <T>(url: string): Promise<T> =>
  api.get<T>(url).then((r) => r.data);

export const AxiosPost = <T>(url: string, data?: unknown): Promise<T> =>
  api.post<T>(url, data).then((r) => r.data);

export const AxiosPut = <T>(url: string, data?: unknown): Promise<T> =>
  api.put<T>(url, data).then((r) => r.data);

export const AxiosPatch = <T>(url: string, data?: unknown): Promise<T> =>
  api.patch<T>(url, data).then((r) => r.data);

/** Some DELETE endpoints accept a body (e.g. removeGmail) — pass it via `data`. */
export const AxiosDelete = <T>(url: string, data?: unknown): Promise<T> =>
  api.delete<T>(url, { data }).then((r) => r.data);
