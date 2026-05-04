---
name: lms-mobile-api-integration
description: >
  Authoritative API integration pipeline for the Tuitional LMS Mobile app —
  the four-layer contract (axios instance + interceptors → URL builders →
  service functions → TanStack Query hooks), token threading via interceptor
  (no per-call config), payload / response typing, mappers (API → UI),
  query-key factories, mutation invalidation, error propagation. Trigger when
  the user asks to wire a new endpoint, add a useQuery / useMutation, shape a
  payload or response type, invalidate a query, or audit existing data-fetching code.
---

# Tuitional LMS Mobile — API Integration Specification

**Version:** 1.0.0 | **Scope:** `src/services/`, `src/types/`, `src/hooks/modules/<module>/`

## Companion assets (load before wiring APIs)

- `rules.toml` — mandatory rules for file placement, naming, error handling, query keys

Reference module (canonical pattern — read when in doubt):

- **Users** — end-to-end CRUD:
  - URL builders: [src/services/apis/users/endpoint.ts](../../../src/services/apis/users/endpoint.ts)
  - Service functions: [src/services/apis/users/helpers.ts](../../../src/services/apis/users/helpers.ts)
  - Mappers: [src/services/apis/users/mappers.ts](../../../src/services/apis/users/mappers.ts)
  - Module barrel: [src/services/apis/users/index.ts](../../../src/services/apis/users/index.ts)
  - Types: [src/types/users.types.ts](../../../src/types/users.types.ts)
  - Hooks: [src/hooks/modules/users/usersQueries.ts](../../../src/hooks/modules/users/usersQueries.ts)
  - Consumer: [src/app/(protected)/users.tsx](../../../src/app/(protected)/users.tsx)

---

## 1. Four-layer architecture

The codebase enforces a strict pipeline between the React tree and the backend. Every call flows top→bottom, with **no shortcuts**:

| Layer | Location | Responsibility |
|-------|----------|----------------|
| **Layer 1 — HTTP** | [src/services/axios/](../../../src/services/axios/) | Single axios instance with `baseURL`, request interceptor (token), response interceptor (errors). Thin `AxiosGet/Post/Put/Patch/Delete<T>(url, data?)` helpers. |
| **Layer 2 — URL builders** | `src/services/apis/<module>/endpoint.ts` | Pure functions returning **path-only** strings (`/api/user/...`). No axios, no state. Accept typed option objects; build `URLSearchParams` for query endpoints. |
| **Layer 3 — Service functions** | `src/services/apis/<module>/helpers.ts` | Typed wrappers calling Layer 1 with a URL from Layer 2. **No `config` arg** — token comes from the interceptor. One named export per endpoint. |
| **Layer 4 — Hooks (consumers)** | `src/hooks/modules/<module>/<module>Queries.ts` | TanStack Query wrappers (`useQuery` / `useMutation`). Apply mappers (Layer 3.5) to convert API → UI shape. |

Plus an optional half-layer between 3 and 4:

- **Layer 3.5 — Mappers** at `src/services/apis/<module>/mappers.ts` — convert backend response shape (`User_Object_Type`) into UI shape (`User` from `@/constants/users`). Keeps screens backend-agnostic.

**Hard rule:** A component **must not** import from `src/services/axios/*` or any internal `src/services/apis/<module>/*` file. Only:
- The hook layer (`src/hooks/modules/<module>/`) for queries / mutations
- The barrel (`src/services/apis/<module>/`) when calling raw service functions outside a hook context (rare)

---

## 2. Layer 1 — HTTP plumbing

### 2.1 Single axios instance

[src/services/axios/config.ts](../../../src/services/axios/config.ts):

```ts
export const BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://dev.tuitionaledu.com';

export const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attaches token if set
api.interceptors.request.use((config) => {
  if (authToken) config.headers.set('Authorization', authToken);
  return config;
});

// Response interceptor — passes errors through as AxiosError
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => Promise.reject(error),
);
```

**Token contract:**

- Token stored in a module-level variable in `services/axios/config.ts`.
- `setAuthToken(jwt)` populates it after login; `setAuthToken(null)` clears on logout.
- The request interceptor reads it on every call. Call sites never pass a `config`.
- Web sends raw token (no `Bearer` prefix) — mobile **matches** that contract for now. If backend changes, flip the line in the interceptor in **one** place.

When auth ships:
- Replace the in-memory variable with `expo-secure-store` for persistence
- Add a 401 response handler that triggers refresh-token flow

### 2.2 Helpers — `AxiosGet/Post/Put/Patch/Delete`

[src/services/axios/helpers.ts](../../../src/services/axios/helpers.ts):

```ts
export const AxiosGet    = <T>(url: string)             => api.get<T>(url).then(r => r.data);
export const AxiosPost   = <T>(url: string, data?: any) => api.post<T>(url, data).then(r => r.data);
export const AxiosPut    = <T>(url: string, data?: any) => api.put<T>(url, data).then(r => r.data);
export const AxiosPatch  = <T>(url: string, data?: any) => api.patch<T>(url, data).then(r => r.data);
export const AxiosDelete = <T>(url: string, data?: any) => api.delete<T>(url, { data }).then(r => r.data);
```

- **Signature:** `(url, data?)` — never a config object. The instance handles `baseURL`, JSON content-type, and token injection.
- **FormData uploads:** axios auto-detects `FormData` and sets the multipart boundary header. No manual content-type override needed. The optional `ConvertObjectToFormData` helper at [payload-conversions.ts](../../../src/services/axios/payload-conversions.ts) is for callers that want the conversion.
- **No try/catch:** errors propagate as `AxiosError`. Consumer hooks decide whether to surface, retry, or invalidate.

**Never** call these directly from screens, components, or hooks. They are Layer-1 primitives consumed only by `services/apis/<module>/helpers.ts`.

---

## 3. Layer 2 — URL builders (path-only)

### 3.1 File placement

```
src/services/apis/<module>/endpoint.ts    ← path builders
```

### 3.2 Export shape

Every URL builder is a **pure function** that returns a **path string** (relative — the axios instance prepends `baseURL`).

```ts
import type { GetAllUsers_Api_Payload_Type } from '@/types/users.types';

// Static path
export const addUserApi = () => `/api/user/signUp`;

// Path-param
export const deleteUserApi = (id: string) => `/api/user/${id}`;

// Query-param — typed options + URLSearchParams
export const getAllUsersApi = (options: GetAllUsers_Api_Payload_Type = {}) => {
  const params = new URLSearchParams();
  if (options.limit) params.append('limit', options.limit.toString());
  if (options.page)  params.append('page',  options.page.toString());
  if (options.name)  params.append('name',  options.name);
  if (options.status !== undefined && options.status !== '')
    params.append('status', options.status.toString());
  const qs = params.toString();
  return qs ? `/api/user/getAllUsers?${qs}` : `/api/user/getAllUsers`;
};
```

### 3.3 Hard rules

- **Path-only:** never concat `BASE_URL` here. The axios instance handles it.
- **Typed options:** the parameter type must come from `src/types/<module>.types.ts`. **No `any`**.
- **Truthy guards:** every `params.append` is guarded — backend treats presence as meaningful.
- **Empty-string guard idiom:** for tri-state booleans (`""` = omit, `"true"` / `"false"` = filter), use `!== undefined && !== ""`.
- **No imports of:** axios, React hooks, Redux, stores, hooks. Pure functions only.
- **Naming:** `{verb}{Resource}Api` — `getAllUsersApi`, `addUserApi`, `deleteUserApi`, `addUserGmailApi`.

---

## 4. Layer 3 — Service functions

### 4.1 File placement

```
src/services/apis/<module>/helpers.ts    ← typed callers
src/services/apis/<module>/mappers.ts    ← API → UI converters
src/services/apis/<module>/index.ts      ← module barrel
```

### 4.2 Export shape

Each service is a typed arrow function. The `<T>` on the Axios helper **must** be a response-type alias from `src/types/<module>.types.ts`.

```ts
import { AxiosDelete, AxiosGet, AxiosPost, AxiosPut } from '@/services/axios/helpers';
import type {
  GetAllUsers_Api_Payload_Type,
  GetAllUsers_Api_Response_Type,
  AddUser_Api_Payload_Type,
  User_Object_Type,
} from '@/types/users.types';
import {
  getAllUsersApi,
  addUserApi,
  deleteUserApi,
} from './endpoint';

// Reads
export const getAllUsers = (options: GetAllUsers_Api_Payload_Type = {}) =>
  AxiosGet<GetAllUsers_Api_Response_Type>(getAllUsersApi(options));

// Writes
export const addUser = (payload: AddUser_Api_Payload_Type) =>
  AxiosPost<User_Object_Type>(addUserApi(), payload);

export const deleteUser = (payload: { id: string }) =>
  AxiosDelete<{ message: string }>(deleteUserApi(payload.id), payload);
```

### 4.3 Parameter order

1. `options` / `payload` / `id` — request data
2. **No `config` arg** — interceptor handles auth

If the endpoint needs both a path param **and** a body (e.g. `addUserGmail`), structure as:

```ts
export const addUserGmail = (
  options: { id: string },
  payload: Gmail_Api_Payload_Type,
) => AxiosPost<...>(addUserGmailApi(options), payload);
```

### 4.4 Naming

- `getX` / `getAllX` — reads (GET)
- `addX` / `createX` — creates (POST)
- `updateX` / `editX` — full updates (PUT)
- `patchX` — partial updates (PATCH)
- `deleteX` / `removeX` — deletes (DELETE)
- `changeXStatus`, `toggleX` — narrow state mutations

Match the module's existing verbs when extending. Inconsistency within one file is a code smell.

### 4.5 Rules

- **Must not** import from `src/components/`, `src/app/`, hooks, or Redux. Services are leaf dependencies.
- **Must not** handle errors, log, or toast. Errors propagate via `Promise.reject`.
- **Never** use `<any>` for `<T>`. Type properly via `src/types/<module>.types.ts`.

---

## 5. Layer 3.5 — Mappers (API → UI shape)

### 5.1 Why

Backend types (snake_case, flat fields, `name: "Maria Clara"`) often don't match UI types (split first/last, normalized roles, deterministic avatar colors, formatted dates). A mapper layer keeps screens backend-agnostic.

### 5.2 File

```
src/services/apis/<module>/mappers.ts
```

### 5.3 Pattern (from [users/mappers.ts](../../../src/services/apis/users/mappers.ts))

```ts
import type { Role, User as UiUser } from '@/constants/users';
import type { User_Object_Type } from '@/types/users.types';

const AVATAR_PALETTE = [/* ... */];

export const pickAvatarColor = (id: number | string): string => {
  const n = typeof id === 'number' ? id : Number(id) || 0;
  return AVATAR_PALETTE[Math.abs(n) % AVATAR_PALETTE.length];
};

export const normalizeRole = (apiRoleName?: string): Role => {
  switch (apiRoleName?.toLowerCase()) {
    case 'teacher': case 'tutor': return 'Teacher';
    case 'admin': case 'superadmin': return 'Admin';
    case 'parent': case 'guardian': return 'Parent';
    default: return 'Student';
  }
};

export const formatShortDate = (input?: string | Date | null): string => {
  if (!input) return '';
  const d = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
};

export const toUiUser = (api: User_Object_Type): UiUser => {
  const [first, ...rest] = (api.name ?? '').trim().split(/\s+/);
  return {
    id: api.id,
    first,
    last: rest.join(' '),
    email: api.email,
    role: normalizeRole(api.role?.name),
    date: formatShortDate(api.createdAt),
    active: Boolean(api.status),
    synced: Boolean(api.isSync),
    color: pickAvatarColor(api.id),
  };
};

export const toUiUsers = (list: ReadonlyArray<User_Object_Type>): UiUser[] =>
  list.map(toUiUser);
```

Each mapper is pure, deterministic, and exported alongside the service functions.

### 5.4 Rules

- **One mapper per resource.** `toUiUser` for a single record, `toUiUsers` for a list.
- **Pure functions.** No side effects, no hooks.
- **Deterministic.** Same input → same output. No `Date.now()` or `Math.random()`.

---

## 6. Layer 4 — Hooks (TanStack Query)

### 6.1 File placement

```
src/hooks/modules/<module>/<module>Queries.ts    ← queries + mutations together
src/hooks/modules/<module>/index.ts              ← barrel
```

One file per module holds all query and mutation hooks. Keeps invalidation key references co-located.

### 6.2 Query key factory

```ts
// usersQueries.ts
import type { GetAllUsers_Api_Payload_Type } from '@/types/users.types';

export const usersQueryKeys = {
  all: ['users'] as const,
  list: (params: GetAllUsers_Api_Payload_Type) =>
    [...usersQueryKeys.all, 'list', params] as const,
  detail: (id: string | number) =>
    [...usersQueryKeys.all, 'detail', id] as const,
};
```

**Hierarchical scoping:** every users-related key starts with `['users', ...]`. Calling `invalidateQueries({ queryKey: usersQueryKeys.all })` invalidates every users query in one line.

### 6.3 `useQuery` — reads

```tsx
import { useQuery } from '@tanstack/react-query';
import { getAllUsers, toUiUsers } from '@/services/apis/users';

export function useUsersQuery(params: GetAllUsers_Api_Payload_Type = {}) {
  return useQuery({
    queryKey: usersQueryKeys.list(params),
    queryFn: async () => {
      const res = await getAllUsers(params);
      return {
        users: toUiUsers(res.users),       // ← apply mapper here, not in screen
        total: res.totalCount,
        page: res.currentPage,
        totalPages: res.totalPages,
      };
    },
  });
}
```

**Rules:**

- **Apply mappers in `queryFn`**, not in the screen. The screen receives UI-shaped data only.
- **`queryKey` must include every input** that changes the response. Missing deps cause stale data.
- **Use the key factory.** Never write `['users', ...]` inline — drift across mutations and queries breaks invalidation.
- **Never fetch in `useEffect`.** Server data belongs in TanStack Query.

### 6.4 `useMutation` — writes

```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addUser, deleteUser } from '@/services/apis/users';

export function useCreateUserMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: addUser,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: usersQueryKeys.all });
    },
  });
}

export function useDeleteUserMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: usersQueryKeys.all });
    },
  });
}
```

**Rules:**

- **Always invalidate** the resource's `all` key on success. Don't `refetch()` — invalidation is hierarchical and cheaper.
- **Don't toast in the hook.** The screen knows the user-facing wording. Hook surfaces `mutation.error`; screen decides how to show it.
- **Don't close modals in the hook.** Same reasoning.

### 6.5 Consumer pattern (screen)

```tsx
// (protected)/users.tsx
import { useUsersQuery, useFilteredUsers, countActiveFilters } from '@/hooks/modules/users';

const { data, isLoading, isError, refetch, isFetching } = useUsersQuery();
const users = data?.users ?? [];
const filtered = useFilteredUsers(users, filters);
```

The screen never imports from `@/services/apis/...` directly. Only `@/hooks/modules/<module>` and `@/constants/<module>`.

### 6.6 Search debouncing

For free-text search, debounce before passing into the query key:

```tsx
const debouncedSearch = useDebounce(search, 400);   // 400ms default for mobile
// pass debouncedSearch into queryKey + params; never the raw search
```

Mobile uses **400ms** (faster than web's 1500ms — typing is slower, but users tap to dismiss, so faster feedback is better).

---

## 7. Types — `src/types/<module>.types.ts`

### 7.1 File placement

```
src/types/<module>.types.ts
```

One file per module holds payload + response types. Co-located with `services/apis/<module>/` only when types are too large to live in one file.

### 7.2 Naming convention (strict — matches web for cross-app grep-ability)

| Shape | Pattern | Example |
|-------|---------|---------|
| Query params for GET | `{Resource}_Api_Payload_Type` | `GetAllUsers_Api_Payload_Type` |
| Response body | `{Resource}_Api_Response_Type` | `GetAllUsers_Api_Response_Type` |
| POST/PUT/PATCH payload | `{Action}_{Resource}_Payload_Type` | `AddUser_Api_Payload_Type` |
| POST/PUT/PATCH response | `{Action}_{Resource}_Api_Response_Type` | `Add_Delete_Gmail_Api_Response_Type` |
| Single object | `{Resource}_Object_Type` | `User_Object_Type` |

PascalCase with underscore segments. Keep the `_Api_` / `_Payload_` infixes — grep across web + mobile depends on them.

### 7.3 Content rules

- Pagination envelope (standard for list endpoints):
  ```ts
  type X_Api_Response_Type = {
    users: User_Object_Type[];
    totalPages: number;
    currentPage: number;
    totalCount: number;
  };
  ```
- Optional fields use `?:`. Never `| undefined` explicitly.
- **Never `any`.** Use `unknown` + narrowing, or extract a union when the shape is variable.

---

## 8. Module barrel

```ts
// src/services/apis/<module>/index.ts
export * from './helpers';
export * from './mappers';
```

Consumers import from `@/services/apis/<module>` — internal files (`endpoint.ts`, `helpers.ts`, `mappers.ts`) stay implementation detail.

---

## 9. Error handling

### 9.1 Current state — passthrough

The response interceptor in `services/axios/config.ts` is a passthrough. Errors propagate as raw `AxiosError`. Consumer hooks/screens read `error.response?.status`, `error.response?.data?.message` directly.

### 9.2 Future — `ApiError` normalization

When auth + production errors land, the response interceptor will convert `AxiosError` → `ApiError { status, message, body, code }`:

```ts
// future shape (not yet implemented)
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status ?? 0;
    const data = error.response?.data;
    const message =
      (typeof data === 'object' && data && 'message' in data && typeof (data as { message: unknown }).message === 'string'
        ? (data as { message: string }).message
        : null) ?? error.message ?? 'Request failed';
    return Promise.reject(new ApiError(status, message, data));
  },
);
```

Screens then do `if (error instanceof ApiError && error.status === 401) ...`.

### 9.3 Surfacing in screens

Toast / alert calls live in the screen, not the hook:

```tsx
const create = useCreateUserMutation();

const handleSubmit = (payload: AddUser_Api_Payload_Type) => {
  create.mutate(payload, {
    onSuccess: () => router.back(),
    onError: (err) => {
      const msg = err instanceof Error ? err.message : 'Failed to create user';
      Alert.alert('Error', msg);
    },
  });
};
```

---

## 10. Module setup checklist (new module)

When adding a new module (e.g. `enrollments`):

```
☐ src/types/enrollments.types.ts                          ← payloads + responses
☐ src/services/apis/enrollments/endpoint.ts               ← path-only URL builders
☐ src/services/apis/enrollments/helpers.ts                ← typed callers (AxiosGet/Post/...)
☐ src/services/apis/enrollments/mappers.ts                ← API → UI shape
☐ src/services/apis/enrollments/index.ts                  ← barrel: export * from './helpers' + './mappers'
☐ src/constants/enrollments.ts                            ← UI types + filter constants + mock
☐ src/hooks/modules/enrollments/enrollmentsQueries.ts     ← useQuery / useMutation + queryKeys factory
☐ src/hooks/modules/enrollments/index.ts                  ← barrel
☐ src/components/ui/enrollments/<Component>.tsx           ← UI components per design
☐ src/components/ui/enrollments/index.ts                  ← barrel
☐ src/app/(protected)/enrollments.tsx                     ← list route (in tabs)
☐ src/app/enrollments/_layout.tsx                         ← Stack for form/detail screens
☐ src/app/enrollments/{add,edit,[id],...}.tsx             ← form/detail routes
```

---

## 11. AI agent rules — STRICT MODE

### Rule 1 — No layer skipping
Components / screens import only from `@/hooks/modules/<module>` (preferred) or `@/services/apis/<module>` (rare, raw service call). **Never** from `@/services/axios/*` directly.

### Rule 2 — Path-only endpoints
`endpoint.ts` returns paths (`/api/user/...`) — never `${BASE_URL}/...`. The axios instance owns the base URL.

### Rule 3 — Config-less helpers
Service functions take only the request data. **No** `config` arg. Token comes from the interceptor.

### Rule 4 — Typed everything
- `endpoint.ts` options: typed via `src/types/<module>.types.ts`
- `helpers.ts` payloads + return types: typed
- `<T>` on Axios helpers: a real type, never `any`

### Rule 5 — Mapper application
Mappers run inside `queryFn`, not in screens. Components consume UI-shaped data.

### Rule 6 — Hierarchical query keys
Use the per-module `queryKeys` factory (`usersQueryKeys`, `enrollmentsQueryKeys`). Never write inline keys.

### Rule 7 — Invalidate, don't refetch
After every mutation `onSuccess`: `qc.invalidateQueries({ queryKey: <module>QueryKeys.all })`.

### Rule 8 — Validation
Run `npx tsc --noEmit` after every change. Zero errors required.

---

## Quick reference

```
HTTP INSTANCE:        src/services/axios/config.ts → api (axios.create)
TOKEN STORE:          setAuthToken(jwt) — interceptor injects it
HELPERS:              AxiosGet/Post/Put/Patch/Delete<T>(url, data?)
URL BUILDERS:         src/services/apis/<module>/endpoint.ts (path-only)
SERVICE FUNCTIONS:    src/services/apis/<module>/helpers.ts (typed, no config)
MAPPERS:              src/services/apis/<module>/mappers.ts (API → UI)
QUERY HOOKS:          src/hooks/modules/<module>/<module>Queries.ts
QUERY KEY FACTORY:    <module>QueryKeys.all / .list(params) / .detail(id)
TYPES:                src/types/<module>.types.ts (PascalCase_With_Underscores)
SCREEN IMPORT:        @/hooks/modules/<module>  AND  @/constants/<module>
NEVER IMPORT:         @/services/axios/*  from screens/components/hooks
ERROR PROPAGATION:    AxiosError (raw) → screen handles surfacing
DEBOUNCE:             400ms for free-text search
INVALIDATION:         qc.invalidateQueries({ queryKey: <module>QueryKeys.all })
```
