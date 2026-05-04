---
name: lms-mobile-security
description: >
  Mobile security skill for the Tuitional LMS Mobile app — auth token lifecycle,
  expo-secure-store migration, route guards on (protected)/, 401 refresh-flow
  pattern, deep-link allow-list validation, certificate pinning on the axios
  instance, env-var exposure rules (EXPO_PUBLIC_*), permission usage strings
  (Info.plist / Android manifest), secret hygiene, log redaction. Trigger when
  the user asks to wire login/logout, persist tokens, gate routes, validate
  deep links, harden HTTPS, audit env vars, prepare for app-store review, or
  do a security review on the auth / network / linking surface. Do NOT modify
  the axios interceptor or token contract without explicit approval — see the
  `lms-mobile-api-integration` skill's permission rules.
---

# Tuitional LMS Mobile — Security Specification

**Version:** 1.0.0 | **Scope:** auth, transport, linking, env, permissions

This skill owns the security boundary. Adjacent skills:
- **`lms-mobile-api-integration`** owns the axios instance contract — token contract changes need its approval.
- **`lms-mobile-platform`** owns the provider stack — `AuthProvider` mounts there.

---

## 1. Auth token — current state and target

### 1.1 Current (in-memory, deferred persistence)

[`src/services/axios/config.ts`](../../../src/services/axios/config.ts):

```ts
let authToken: string | null = null;
export const setAuthToken = (token: string | null) => { authToken = token; };
export const getAuthToken = () => authToken;

api.interceptors.request.use((config) => {
  if (authToken) config.headers.set('Authorization', authToken);
  return config;
});
```

**Contract — verified, do not break:**
- **Raw token** is sent as `Authorization` header. **No `Bearer ` prefix.** This matches the web client's contract. Do not "fix" this without backend confirmation.
- **No per-call `config`** arg. Token threading is the interceptor's job — see `lms-mobile-api-integration` Layer 3.
- Token reset: `setAuthToken(null)` on logout.

### 1.2 Target (expo-secure-store, persistent)

When auth ships, swap the in-memory store for `expo-secure-store`:

```ts
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'tuitional.auth.token';
const REFRESH_KEY = 'tuitional.auth.refresh';

let cachedToken: string | null = null;

export const loadAuthToken = async () => {
  cachedToken = await SecureStore.getItemAsync(TOKEN_KEY);
  return cachedToken;
};

export const setAuthToken = async (token: string | null) => {
  cachedToken = token;
  if (token) await SecureStore.setItemAsync(TOKEN_KEY, token, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
  else await SecureStore.deleteItemAsync(TOKEN_KEY);
};

export const getAuthToken = () => cachedToken;
```

**Rules:**
- `keychainAccessible: WHEN_UNLOCKED_THIS_DEVICE_ONLY` — token never leaves the device (no iCloud Keychain sync).
- Cache in memory after first read so the request interceptor stays sync.
- Call `loadAuthToken()` once at app boot inside `AppProviders.tsx` *before* mounting `QueryClientProvider`.
- **Don't** read SecureStore inside the interceptor (interceptor is sync).

### 1.3 Refresh flow (deferred — pattern when ready)

Single-flight 401 handler in the response interceptor:

```ts
let refreshing: Promise<string> | null = null;

api.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const original = error.config as InternalAxiosRequestConfig & { _retried?: boolean };

    if (status !== 401 || original._retried) return Promise.reject(error);
    original._retried = true;

    refreshing ??= refreshAccessToken();             // single-flight
    try {
      const newToken = await refreshing;
      await setAuthToken(newToken);
      original.headers.set('Authorization', newToken);
      return api(original);
    } finally {
      refreshing = null;
    }
  },
);
```

- One in-flight refresh shared across all 401s — never N parallel refreshes.
- `_retried` flag prevents infinite loop if refresh itself returns 401.
- On refresh failure, `setAuthToken(null)` and route to `/login`.

---

## 2. Route guard — `(protected)/_layout.tsx`

Pattern (when auth lands):

```tsx
import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@/hooks/global/useAuth';

export default function ProtectedLayout() {
  const { status, role } = useAuth();
  if (status === 'loading') return <SplashShell />;
  if (status === 'unauthenticated') return <Redirect href="/login" />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
```

**Rules:**
- Guard at the **layout** level, not per-screen. One check, one redirect, no flicker.
- `loading` state shows a splash shell — never the protected route, even briefly.
- Role-based screens (admin-only, parent-only) get a second guard inside the screen using the same `useAuth().role`.

---

## 3. Deep-link safety — `expo-linking`

The repo uses `expo-linking` for incoming URLs. Every deep link is **untrusted input**.

### 3.1 Allow-list scheme + host

In `app.json`:
```json
{ "expo": { "scheme": "tuitional", "ios": { "associatedDomains": ["applinks:app.tuitionaledu.com"] } } }
```

Validate every incoming URL:

```ts
import * as Linking from 'expo-linking';

const ALLOWED_HOSTS = new Set(['app.tuitionaledu.com']);
const ALLOWED_SCHEMES = new Set(['tuitional', 'https']);

const isSafeIncoming = (url: string) => {
  try {
    const parsed = Linking.parse(url);
    if (parsed.scheme && !ALLOWED_SCHEMES.has(parsed.scheme)) return false;
    if (parsed.hostname && !ALLOWED_HOSTS.has(parsed.hostname)) return false;
    return true;
  } catch { return false; }
};
```

### 3.2 Sanitize params before routing

Never `router.push(url)` raw. Pull only the fields you expect, type them, validate them:

```ts
const { path, queryParams } = Linking.parse(url);
const id = String(queryParams?.id ?? '');
if (!/^[a-zA-Z0-9_-]{1,64}$/.test(id)) return;       // strict allow-list
router.push({ pathname: '/users/[id]', params: { id } });
```

### 3.3 Forbidden patterns

- **Never** pass an arbitrary URL to `expo-web-browser` from a deep link without scheme/host validation — phishing surface.
- **Never** route to `/login` with a `redirect=` param without validating that `redirect` is an internal path.
- **Never** auto-execute a mutation from a deep link — confirm with the user first.

---

## 4. Certificate pinning (production-only — pattern)

Until the app handles money/PII, plain HTTPS via the system trust store is acceptable. When pinning lands:

- Use `react-native-ssl-pinning` or implement at the native layer (Expo dev-client + config plugin).
- Pin **two** SHA-256 SPKI hashes (current + backup) so a cert rotation doesn't brick installed apps.
- Apply only in `production` EAS profile — dev/preview keep system trust to allow Charles/mitmproxy debugging.
- Pinning happens at the axios *instance*, not in helpers — single point of enforcement.

---

## 5. Environment variables

### 5.1 Exposure rule

| Prefix | Visible to JS bundle | Use for |
|---|---|---|
| `EXPO_PUBLIC_*` | **YES** | Public config: API base URL, public keys, feature flags |
| anything else | NO | Native build args only |

**`EXPO_PUBLIC_*` is shipped to the device.** Anything that ends up in this prefix is effectively public. Never put a secret there. Confirmed safe today: `EXPO_PUBLIC_API_BASE_URL`.

### 5.2 Forbidden in env

- API secrets, JWT signing keys, third-party private keys → these belong on the **backend**.
- Service-account JSON, signing certs → EAS secrets only (`eas secret:create`), never in `.env`.

### 5.3 `.env` hygiene

- `.env` is `.gitignore`d (verify).
- Per-environment: `.env.development`, `.env.preview`, `.env.production` — selected by EAS profile.
- `expo-constants` exposes `EXPO_PUBLIC_*` at runtime; don't read `process.env` directly outside `axios/config.ts`.

---

## 6. Permissions (Info.plist / Android manifest)

When integrating native capability (camera, location, contacts, mic), the user-facing string is part of the security surface — App Store rejects unclear strings.

### 6.1 iOS — `app.json` → `expo.ios.infoPlist`

Use plain English with the specific reason:

| Key | Bad | Good |
|---|---|---|
| `NSCameraUsageDescription` | "Camera" | "Tuitional uses your camera to take a profile photo or scan an enrollment QR code." |
| `NSPhotoLibraryUsageDescription` | "Photos" | "Tuitional accesses your photo library so you can pick a profile photo." |
| `NSMicrophoneUsageDescription` | "Mic" | "Tuitional uses the microphone during live tutoring sessions." |

### 6.2 Android — `app.json` → `expo.android.permissions`

- List **only** what the app actually uses — every extra permission triggers Play Store review questions.
- Background location and SMS reading require justification screens; avoid unless the feature genuinely needs them.

---

## 7. Logging hygiene

- **Never** log the auth token. Not in dev, not in prod, not at info, not at debug.
- **Never** log full request bodies of mutation endpoints (passwords, tokens, PII).
- Axios response logging in dev is fine; **strip headers** before logging.
- Crash reporters (when wired): scrub `Authorization`, `Cookie`, `password`, `token`, `email` from breadcrumbs.

```ts
// ❌ leaks token
console.log('config', config);

// ✅ redact
const { Authorization, Cookie, ...safe } = config.headers ?? {};
console.log('config (redacted)', { ...config, headers: safe });
```

---

## 8. Secret hygiene checklist (pre-push gate)

```bash
# Tracked .env (must be empty)
git ls-files | grep -E '\.env(\.|$)' | grep -v example

# Hardcoded JWT-looking strings
grep -rn -E 'eyJ[A-Za-z0-9_-]{20,}\.eyJ[A-Za-z0-9_-]+\.' src/

# Hardcoded API keys
grep -rn -E '(api[_-]?key|secret|token|bearer)\s*[:=]\s*["\x27][A-Za-z0-9_-]{16,}' src/

# AWS-style keys
grep -rn -E 'AKIA[0-9A-Z]{16}|aws_secret_access_key' src/
```

All four must return zero matches. Add to CI as a fail-closed step before EAS submit.

---

## 9. App-store review prep — security surface

| Item | Where | Status |
|---|---|---|
| Privacy policy URL | `app.json` → `privacy` | Required for store submission |
| Permission usage strings | `app.json` → `infoPlist` / `permissions` | Plain English, specific reason |
| Tracking transparency (iOS 14.5+) | If using analytics → `expo-tracking-transparency` | Currently not used |
| Encryption export compliance | `app.json` → `ios.config.usesNonExemptEncryption: false` | False unless adding custom crypto |
| Backgrounding behaviour | Network state on app resume | Invalidate stale TanStack Query data — see `lms-mobile-platform` §4.2 |

---

## 10. AI agent rules — STRICT MODE

### Rule 1 — Token contract is locked
The `Authorization` header sends the **raw token**, no `Bearer ` prefix. Do not change this without a backend-side confirmation captured in the conversation.

### Rule 2 — Never modify the axios interceptor without approval
The interceptor is the single security choke-point. The `lms-mobile-api-integration` skill flags it as `require_explicit_approval_to_modify_axios_instance = true`.

### Rule 3 — Deep links are untrusted
Every incoming URL is parsed, scheme + host allow-listed, params validated by regex/type before routing.

### Rule 4 — Secrets never enter `EXPO_PUBLIC_*`
That prefix is shipped to the device. Anything secret stays server-side or in EAS secrets.

### Rule 5 — Permission strings ship with the build
Plain-English, specific-purpose strings in `infoPlist` / `permissions`. App Store rejects vague ones.

### Rule 6 — Logging redaction
Token, Cookie, password, email scrubbed before any log call. Always.

### Rule 7 — Run the secret-hygiene grep before EAS submit
The §8 checklist must pass clean.

---

## Quick reference

```
TOKEN HEADER:            Authorization: <raw token>     (NO 'Bearer ')
TOKEN STORAGE NOW:       module-level var in src/services/axios/config.ts
TOKEN STORAGE TARGET:    expo-secure-store, WHEN_UNLOCKED_THIS_DEVICE_ONLY
ROUTE GUARD:             src/app/(protected)/_layout.tsx — Redirect on unauthenticated
401 FLOW:                single-flight refresh in response interceptor + _retried flag
DEEP LINK ALLOW-LIST:    schemes ⊆ {tuitional, https}; hosts ⊆ {app.tuitionaledu.com}
ENV PREFIX:              EXPO_PUBLIC_* is PUBLIC — secrets forbidden
SECRETS BACKEND:         EAS secrets (`eas secret:create`), never .env
LOG REDACT:              Authorization, Cookie, password, email → stripped
PINNING:                 production-only; pin two SPKI SHA-256 hashes
PERMISSION STRINGS:      plain English, specific purpose, no vague "for app use"
PRE-PUSH GREP:           §8 checklist — all four greps return zero
```
