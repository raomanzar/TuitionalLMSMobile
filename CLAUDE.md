# CLAUDE.md

Entry point for Claude Code on the mobile codebase. Mirrors the web project's flows and design system; folder shapes and stack are RN-native.

## Project

Tuitional LMS Mobile — React Native / Expo Router LMS. Multi-role (superAdmin, admin, student, parent, teacher) — same module set as web (auth, users, enrollments, schedule, billing, chat). Most modules are still scaffolds; the **users module** is the one currently fleshed out end-to-end.

## Stack (baseline — always apply)

- **Expo SDK 54** · **React Native 0.81** · **React 19.1** · **TypeScript 5.9**
- **Expo Router 6** — file-based routing under `src/app/`. Typed routes (`experiments.typedRoutes`) enabled. Use the `router` from `expo-router`, never raw `useNavigation`.
- **Navigation primitives:** `Tabs` (custom `tabBar`) + `Stack`. `headerShown: false` everywhere — every screen renders its own [TopBar](src/components/global/TopBar.tsx). Never re-enable the native header (introduces a hairline divider that doesn't match the design system).
- **Animations / gestures:** `react-native-reanimated` 4 + `react-native-gesture-handler` 2 (swipe actions on cards, animated headers).
- **Styling:** `StyleSheet.create` only. Tokens from [src/constants/theme/](src/constants/theme/) (colors, typography, radius, spacing, shadows, gradients). No inline arbitrary values, no `sx={}`, no Tailwind, no styled-components.
- **Fonts:** League Spartan (six weights) loaded via `expo-font` from [src/providers/AppProviders.tsx](src/providers/AppProviders.tsx) — asset map lives in [src/constants/theme/typography.ts](src/constants/theme/typography.ts).
- **Server state:** TanStack Query 5 (`@tanstack/react-query`). Query client in [src/lib/queryClient.ts](src/lib/queryClient.ts). Never fetch in `useEffect`.
- **Client state:** local `useState` for now. Redux not introduced yet — only add when shared cross-screen state is real.
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
  _layout.tsx                     # fonts + AppProviders + root Stack
  index.tsx                       # → /users redirect
  (protected)/                    # bottom-tabs group
    _layout.tsx                   # Tabs(custom AppTabBar)
    users.tsx, enrollments.tsx, enrollments-logs.tsx
  users/                          # full-screen module routes (tabs hidden)
    _layout.tsx                   # Stack — sibling of (protected) so tabs disappear
    add.tsx, edit.tsx, add-relation.tsx, deactivate.tsx, delete.tsx, export.tsx, [id].tsx

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

## Auth (one-liner)

Not yet wired. Token lives in a module-level variable in [src/services/axios/config.ts](src/services/axios/config.ts) — call `setAuthToken(jwt)` after login and the request interceptor attaches it. Replace the in-memory store with `expo-secure-store` when the auth flow ships, and add a `withAuth`-style guard at `(protected)/_layout.tsx`.

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
