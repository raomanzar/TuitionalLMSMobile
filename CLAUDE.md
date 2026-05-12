# CLAUDE.md

Entry point for Claude Code on the mobile codebase. Mirrors the web project's flows and design system; folder shapes and stack are RN-native.

## Project

Tuitional LMS Mobile — React Native / Expo Router LMS. Multi-role (superAdmin, admin, student, parent, teacher) — same module set as web (auth, users, enrollments, schedule, billing, chat). Most modules are still scaffolds; the **users module** is the one currently fleshed out end-to-end.

## Stack (baseline — always apply)

- **Expo SDK 54** · **React Native 0.81** · **React 19.1** · **TypeScript 5.9**
- **Expo Router 6** — file-based routing under `src/app/`. Typed routes (`experiments.typedRoutes`) enabled. Use the `router` from `expo-router`, never raw `useNavigation`.
- **Navigation primitives:** `Drawer` (from `expo-router/drawer`, custom [AppDrawerContent](src/components/global/AppDrawerContent.tsx)) at the `(protected)/` root + nested `Stack`s per module (e.g. `(protected)/users/_layout.tsx`). Public auth routes live in `(public)/` behind their own `Stack`. `headerShown: false` everywhere — every screen renders its own [TopBar](src/components/global/TopBar.tsx). Never re-enable the native header (introduces a hairline divider that doesn't match the design system).
- **Animations / gestures:** `react-native-reanimated` 4 + `react-native-gesture-handler` 2 (swipe actions on cards, animated headers).
- **Styling:** `StyleSheet.create` only. Tokens from [src/constants/theme/](src/constants/theme/) (colors, typography, radius, spacing, shadows, gradients). No inline arbitrary values, no `sx={}`, no Tailwind, no styled-components.
- **Fonts:** League Spartan (six weights) loaded via `expo-font` from [src/providers/AppProviders.tsx](src/providers/AppProviders.tsx) — asset map lives in [src/constants/theme/typography.ts](src/constants/theme/typography.ts).
- **Server state:** TanStack Query 5 (`@tanstack/react-query`). Query client in [src/lib/queryClient.ts](src/lib/queryClient.ts). Never fetch in `useEffect`.
- **Client state:** Zustand 5 for cross-screen shared state — stores live in [src/stores/](src/stores/), one file per slice (`authStore.ts`, ...). Sensitive slices use the `persist` middleware backed by the [secureStorage](src/stores/middleware/secureStorage.ts) adapter (wraps `expo-secure-store`); non-sensitive slices stay in-memory. Pattern: nest mutators under an `actions` key and export atomic selectors (`useAuthToken`, `useAuthActions`, ...) so components re-render only on the slice they read. Local `useState` for ephemeral UI state — don't reach for Zustand unless the state is shared across screens. Redux not used.
- **HTTP:** Axios via a single shared instance in [src/services/axios/config.ts](src/services/axios/config.ts) with token injection via request interceptor. Helpers (`AxiosGet/Post/Put/Patch/Delete`) in [src/services/axios/helpers.ts](src/services/axios/helpers.ts) — they take only `(url, data?)`, never a `config` object.
- **API pattern (per module):** [src/services/apis/`<module>`/](src/services/apis/) → `endpoint.ts` (path builders, **path-only**, axios instance prepends `baseURL`) + `helpers.ts` (typed callers) + `mappers.ts` (API → UI shape) + `index.ts` barrel.
- **Realtime:** not wired yet. When chat lands, mount Socket.io inside a provider in `AppProviders.tsx`.
- **Paths:** `@/*` alias → `src/*` — never `../../../`.

## Commands

```bash
npm start                        # = npx expo start
npx expo start -c                # clear Metro cache (do this after moving files)
npx tsc --noEmit                 # type check
npm run lint                     # eslint
# Native builds via EAS:
# eas build --profile development --platform ios
# eas build --profile development --platform android
```

## Directory map

```
src/app/                          # routes (Expo Router file-based)
  _layout.tsx                     # fonts + AppProviders + root Stack; gates render on useAuthHasHydrated()
  index.tsx                       # → /users or /signin based on useIsAuthenticated()
  (public)/                       # unauthed routes (redirect to /users if already signed in)
    _layout.tsx                   # Stack
    signin.tsx, forgot-password.tsx, password-reset.tsx, confirm-password.tsx
  (protected)/                    # authed routes — Drawer with custom AppDrawerContent
    _layout.tsx                   # Drawer; redirects to /signin via useIsAuthenticated()
    enrollments.tsx, enrollments-logs.tsx
    users/                        # nested Stack for users module
      _layout.tsx, index.tsx, add.tsx, edit.tsx, add-relation.tsx, deactivate.tsx, delete.tsx, export.tsx, [id].tsx
    cancelled-classes/            # nested Stack for cancelled-classes module
      _layout.tsx, index.tsx, [id].tsx

src/components/
  global/                         # cross-screen (Avatar, Badge, AppTabBar, TopBar, Field, TextField, SelectLook, PrimaryButton, ScreenBg, Placeholder)
  ui/<module>/                    # page-scoped UI (ui/users/UserCard.tsx, etc.)

src/hooks/
  global/                         # cross-cutting (when added)
  modules/<module>/               # module-scoped (queries + filters + future mutations)

src/services/
  axios/                          # config.ts (instance + interceptor), helpers.ts, payload-conversions.ts
  apis/<module>/                  # endpoint.ts + helpers.ts + mappers.ts + index.ts

src/constants/
  theme/                          # colors, typography, radius, spacing, shadows, gradients
  <module>.ts                     # types + filter constants + mock data per module

src/stores/                       # Zustand stores (authStore.ts, ...) + middleware/secureStorage.ts
src/types/                        # API types (`<module>.types.ts`)
src/providers/                    # AppProviders (GestureHandlerRoot + SafeArea + QueryClient)
src/lib/                          # queryClient.ts (and future SDK setup)
assets/fonts/                     # League Spartan .ttf files
```

## Design tokens

Mirrors the web's `globals.css`. Re-export hub: [src/constants/theme/index.ts](src/constants/theme/index.ts).

| Web CSS var       | Mobile token                                            |
| ----------------- | ------------------------------------------------------- |
| `--main-blue-color` | `Colors.mainBlue`                                     |
| `--leagueSpartan-medium-500` | `Fonts.medium` (a.k.a. `FontFamily.medium`)  |
| `--regular18-` (clamp 14–18) | `FontSize.regular18` (JS port of `clamp()`)  |
| `--space-4` (15px) | `Spacing.s4`                                          |
| `--cards--boxShadow-color` | `Shadow.card`                                  |
| element defaults (`h1`, `body`, etc.) | `TextStyles.h1`, `TextStyles.body`  |

`FontSize` reads `Dimensions.get('window').width` once at module load and resolves each `clamp()` to a device-appropriate px (phones land near min, tablets near max).

## Auth

Source of truth is the Zustand [authStore](src/stores/authStore.ts) — `{ token, user, hasHydrated, actions }`. Token + user are persisted to `expo-secure-store` via [secureStorage](src/stores/middleware/secureStorage.ts); `actions` and `hasHydrated` are runtime-only (excluded via `partialize`).

- **Sign in / out:** `useAuthActions().signIn(token, user)` / `.signOut()`. `signIn` calls `setAuthToken(token)` on the axios instance, then sets store state — the request interceptor in [src/services/axios/config.ts](src/services/axios/config.ts) attaches the raw token (no `Bearer` prefix) on every request.
- **Rehydration:** on app start the persist middleware reads from secure-store and `onRehydrateStorage` re-injects the token into axios, then flips `hasHydrated → true`. Gate any auth-dependent UI on `useAuthHasHydrated()` so guarded screens don't flash `/signin` during cold start.
- **Route guard:** [src/app/(protected)/_layout.tsx](src/app/(protected)/_layout.tsx) reads `useIsAuthenticated()` and redirects to `/signin` when false.
- **Selectors:** prefer the atomic exports (`useAuthToken`, `useAuthUser`, `useIsAuthenticated`, `useAuthHasHydrated`, `useAuthActions`) over `useAuthStore(s => ...)` inline — they keep re-renders scoped.

The `let authToken` module variable in `axios/config.ts` is the interceptor's read-side cache, not the source of truth — never write to it from app code; always go through `useAuthActions()`.

## Non-negotiables

- Never push to `main`, never skip hooks, never commit secrets.
- Never hardcode colors, font sizes, letter spacing, radii, or shadows — use tokens (`Colors`, `FontSize`, `LetterSpacing`, `Radius`, `Shadow`, `Spacing`).
- Never modify [src/constants/theme/](src/constants/theme/) without explicit approval — shared source of truth, mirrors web.
- Never use `any` in `endpoint.ts` / `helpers.ts` — types live in `src/types/<module>.types.ts`.
- API helpers are config-less: `getAllUsers(payload)` not `getAllUsers(payload, config)`. The interceptor handles the token.
- Endpoints return paths only (`/api/user/...`); the axios instance prepends `BASE_URL`. Don't concatenate `BASE_URL` in builders.
- Use the `router` from `expo-router`. Wrap screen-level handlers in `useCallback`; memoize `FlatList` items with `React.memo`.
- Imports use `@/*` — never `../../../`.
- Run `npx tsc --noEmit` and `npm run lint` after any change.
