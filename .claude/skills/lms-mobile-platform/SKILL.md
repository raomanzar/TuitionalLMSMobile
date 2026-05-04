---
name: lms-mobile-platform
description: >
  Cross-cutting Expo + React Native platform skill for the Tuitional LMS Mobile
  app — end-to-end module bootstrapping, Expo SDK packages (expo-image,
  expo-haptics, expo-linking, expo-secure-store, expo-symbols, expo-font,
  expo-status-bar, expo-splash-screen), Reanimated 4 + Gesture Handler 2
  composition, platform splits (.ios.tsx / .android.tsx, Platform.select),
  app lifecycle (AppState, deep-link handler, splash screen), EAS profiles,
  Hermes / dev-client workflow, path aliases (@/*), and the Metro reset
  protocol after file moves. Trigger when the user wants to scaffold a new
  module, integrate an Expo native package, configure EAS, set up deep links,
  or coordinate work that spans UI + API + routing layers. Defer styling and
  component placement to `lms-mobile-ui-pipeline`; defer endpoint wiring and
  TanStack Query hooks to `lms-mobile-api-integration`; defer profiling and
  budgets to `lms-mobile-performance`; defer auth, token storage, deep-link
  validation, and cert pinning to `lms-mobile-security`.
---

# Tuitional LMS Mobile — Platform & Feature Scaffolding

**Version:** 1.0.0 | **Scope:** cross-cutting RN/Expo concerns + new-module orchestration

This skill is the **glue layer** between the existing skills. When work touches more than one of UI / API / styling / routing at once, this is where the orchestration sits. When work fits cleanly inside one of those, defer.

---

## 0. Boundary table — when to defer

| Question | Defer to |
|---|---|
| Where does this component go? What tokens? StyleSheet shape? | `lms-mobile-ui-pipeline` |
| How do I wire this endpoint / hook / mapper? | `lms-mobile-api-integration` |
| Is this layout / FlatList / sheet correct? | `lms-mobile-ui-testing` |
| Is this fast enough? Hermes / Reanimated / FlatList tuning? | `lms-mobile-performance` |
| Is this safe? Token / deep-link / pinning / env? | `lms-mobile-security` |
| Anything else (Expo packages, EAS, lifecycle, platform splits, scaffolds) | **this skill** |

If a request straddles two skills (e.g. "add the enrollments module"), this skill drives the orchestration and calls the others in sequence.

---

## 1. New-module bootstrap (the orchestration the user actually pays for)

Order matters. Doing layers out of order produces orphan code that fails `tsc`.

```
Step 1 — Types        →  src/types/<module>.types.ts
Step 2 — Endpoints    →  src/services/apis/<module>/endpoint.ts        (api-integration)
Step 3 — Helpers      →  src/services/apis/<module>/helpers.ts         (api-integration)
Step 4 — Mappers      →  src/services/apis/<module>/mappers.ts         (api-integration)
Step 5 — Barrel       →  src/services/apis/<module>/index.ts           (api-integration)
Step 6 — Constants    →  src/constants/<module>.ts                     (UI types + filters)
Step 7 — Hooks        →  src/hooks/modules/<module>/<module>Queries.ts (api-integration)
Step 8 — Hook barrel  →  src/hooks/modules/<module>/index.ts
Step 9 — Components   →  src/components/ui/<module>/<Component>.tsx    (ui-pipeline)
Step 10 — Routes      →  src/app/(protected)/<module>.tsx              (list, in tabs)
                         src/app/<module>/_layout.tsx                  (Stack — sibling of (protected))
                         src/app/<module>/{add,edit,[id]}.tsx          (full-screen)
Step 11 — Validate    →  npx tsc --noEmit  &&  npm run lint
```

**Canonical reference:** `users` module — every new module should match its shape exactly.

When generating, **invoke `lms-mobile-api-integration` for steps 1–8** and **`lms-mobile-ui-pipeline` for steps 9–10**. Do not paraphrase those skills here — they are the source of truth.

---

## 2. Expo SDK package map (what's installed, what to use it for)

| Package | Use case | Notes |
|---|---|---|
| `expo-font` | Font loading | Six League Spartan weights via [`AppProviders.tsx`](../../../src/providers/AppProviders.tsx). Asset map single-sourced in [`typography.ts`](../../../src/constants/theme/typography.ts). |
| `expo-image` | Network + local images | Prefer over RN `<Image>` for caching, `placeholder`, `transition`. Mandatory on long lists with avatars. |
| `expo-haptics` | Tactile feedback | Confirm/cancel actions, swipe-action commit. iOS only by default — Android falls back silently. |
| `expo-linking` | Deep links + URL parse | Handler config in `app.json` → `scheme`. **Validate** params before routing — see `lms-mobile-security`. |
| `expo-router` | File-based routing | Typed routes enabled (`experiments.typedRoutes`). Always use `router` from `expo-router`, never raw `useNavigation`. |
| `expo-status-bar` | Status bar | `<StatusBar style="dark" />` per screen; never re-enable native header. |
| `expo-splash-screen` | Splash | Hide after fonts load in `_layout.tsx`. Native splash configured in `app.json`. |
| `expo-symbols` | iOS SF Symbols | Use `@expo/vector-icons` for cross-platform; `expo-symbols` only when iOS-specific look matters. |
| `expo-system-ui` | Edge-to-edge background | Set Android root background color to match `Colors.bg` to avoid black flash. |
| `expo-web-browser` | OAuth / external links | In-app browser. **Not** `react-native-webview` — repo doesn't ship it. |
| `expo-constants` | Build-time constants | Read app version, EAS update channel, deviceName. |

When asked to integrate a new Expo package, use `npx expo install <pkg>` — it pins the version compatible with SDK 54. Never `npm i` an Expo package directly.

---

## 3. Platform-specific code splits

```
File layout:
  TopBar.tsx          ← shared
  TopBar.ios.tsx      ← iOS override (Metro picks automatically)
  TopBar.android.tsx  ← Android override
```

Or inline:

```tsx
import { Platform } from 'react-native';

const padTop = Platform.select({ ios: insets.top + 6, android: insets.top + 4 });
```

**Rule:** prefer inline `Platform.select` for one-off values; reach for `.ios.tsx` / `.android.tsx` only when 30%+ of the file is platform-specific.

---

## 4. App lifecycle

### 4.1 Top-level providers

[`src/providers/AppProviders.tsx`](../../../src/providers/AppProviders.tsx) is the single mount point. Order from outermost in:

```
GestureHandlerRootView
└── SafeAreaProvider
    └── QueryClientProvider
        └── (future) AuthProvider          ← when auth lands
            └── (future) SocketProvider    ← when chat lands
                └── children
```

Add new providers here, never in `_layout.tsx`. Keep the root layout focused on font loading + splash hide + Stack.

### 4.2 AppState (foreground / background)

When auth ships, listen for `AppState` change to invalidate stale queries on resume:

```tsx
import { AppState } from 'react-native';
useEffect(() => {
  const sub = AppState.addEventListener('change', (state) => {
    if (state === 'active') queryClient.invalidateQueries();
  });
  return () => sub.remove();
}, []);
```

Wire this in `AppProviders.tsx` next to the QueryClientProvider.

### 4.3 Deep links

Handler lives in `_layout.tsx` via `expo-linking`. Validation rules belong to `lms-mobile-security` — call into that skill.

---

## 5. Reanimated 4 + Gesture Handler 2 — composition rules

The codebase uses Reanimated 4 (with Worklets 0.5) for swipe-action cards and animated headers. UI-pipeline §7 covers the basic pattern — this skill covers composition gotchas.

### 5.1 Worklet boundary rules

- Every worklet body needs the `'worklet'` directive (or use `useAnimatedStyle` / `useAnimatedScrollHandler` which mark it implicitly).
- **Never** read JS-scope state inside a worklet — captured at registration, not refreshed. Pass via `useSharedValue`.
- **Never** `console.log` inside a worklet — every call serializes through the bridge.
- JS-side state setters call sites: wrap in `runOnJS(setter)(arg)`.
- `runOnJS` on every `onEnd` commit, not on every `onUpdate` (which fires per frame).

### 5.2 Composing Pan with vertical scroll

Required to avoid hijacking FlatList scroll:

```ts
Gesture.Pan()
  .activeOffsetX([-10, 10])
  .failOffsetY([-12, 12])
```

Without `failOffsetY`, every vertical scroll triggers card swipes. Without `activeOffsetX`, the gesture activates on touch-down before the user signals horizontal intent.

### 5.3 Combining gestures

Use `Gesture.Race(...)`, `Gesture.Simultaneous(...)`, or `Gesture.Exclusive(...)` instead of mounting multiple `<GestureDetector>` siblings. RN's gesture system can't disambiguate sibling detectors reliably.

---

## 6. EAS — build profiles + workflow

### 6.1 Profiles (eas.json)

| Profile | Distribution | Channel | Use |
|---|---|---|---|
| `development` | internal (dev-client) | `development` | Daily dev work, Metro attached |
| `preview` | internal (standalone) | `preview` | QA, stakeholder demos |
| `production` | store / TestFlight | `production` | App Store + Play Store releases |

### 6.2 Common commands

```bash
# Local dev
npm start                      # = npx expo start
npx expo start -c              # clear Metro cache (run after every file move/rename)
npx expo prebuild --clean      # regenerate native projects (rare)

# Builds (require `eas login` once)
eas build --profile development --platform ios
eas build --profile development --platform android
eas build --profile production --platform all

# OTA updates (skip native build — JS only)
eas update --branch production --message "fix users filter regression"

# Submit to stores
eas submit --profile production --platform ios
eas submit --profile production --platform android
```

### 6.3 Update channel discipline

- `runtimeVersion` in `app.json` must bump on **every native change** (new package with native code, SDK upgrade, native config change). OTA updates **only** ship to matching `runtimeVersion`.
- Don't ship JS-only fixes via EAS submit — use `eas update`.

---

## 7. Metro / dev-client workflow

### 7.1 Reset cache after file moves

```bash
npx expo start -c
```

Required after:
- Renaming a route file (Expo Router caches the route map)
- Moving a component between `global/` and `ui/<module>/`
- Adding/removing a font weight
- Editing `tsconfig.json` paths

### 7.2 Hermes

Hermes is on by default in Expo SDK 54. Don't toggle it off without a real reason. Hermes-only:
- Stable `Promise.allSettled`
- Faster cold start
- Sampling profiler (see `lms-mobile-performance`)

### 7.3 Path alias

`@/*` resolves to `src/*` via [`tsconfig.json`](../../../tsconfig.json). **Always** use `@/*` — never relative `../../../`. Metro respects the tsconfig paths via the Expo defaults.

---

## 8. Component visibility — global vs module

| Used by 2+ modules | Used by 1 module | Used in 1 screen, < 30 LOC |
|---|---|---|
| `src/components/global/` | `src/components/ui/<module>/` | inline as sub-component |

This decision is part of the bootstrap orchestration. UI-pipeline §10 enforces token usage; this skill picks the **placement**.

---

## 9. Validation gates (run after every change)

```bash
npx tsc --noEmit       # zero errors required
npm run lint           # zero new warnings

# Spot-checks (the api-integration skill's grep recipes still apply)
grep -rn '@/services/axios' src/components src/app                # must be empty
grep -rn 'queryKey:\s*\[' src/components src/app                  # must be empty
```

If `tsc` fails after you ran `npx expo start -c`, the failure is real — not a Metro cache stale.

---

## 10. AI agent rules — STRICT MODE

### Rule 1 — Don't paraphrase sister skills
When the work hits API integration or UI styling, **load and follow** that skill's SKILL.md directly. Do not summarize, restate, or "interpret" it here — drift is the enemy.

### Rule 2 — Module bootstrap order is fixed
Steps 1–11 in §1. Going out of order produces TS errors and forces backtracking.

### Rule 3 — Add providers in `AppProviders.tsx`, not in routes
Every new global concern (auth, socket, theme, error boundary) is a provider mounted there.

### Rule 4 — `npx expo install`, never `npm install` for Expo packages
Version-compat enforcement.

### Rule 5 — Reset Metro cache after moves
`npx expo start -c`. Failing to do so produces "module not found" errors that look like bugs.

### Rule 6 — Validate after every change
`npx tsc --noEmit && npm run lint`. Both must pass. The CLAUDE.md non-negotiable.

---

## Quick reference

```
NEW MODULE ORDER:        types → endpoint → helpers → mappers → barrel → constants
                         → hooks → hook barrel → components → routes → validate
PROVIDER MOUNT POINT:    src/providers/AppProviders.tsx
EXPO INSTALL:            npx expo install <pkg>
METRO RESET:             npx expo start -c   (after every file move)
PATH ALIAS:              @/*  →  src/*       (NEVER ../../../)
PLATFORM SPLIT:          File.ios.tsx / File.android.tsx, OR Platform.select
EAS BUILD:               eas build --profile {development|preview|production}
EAS UPDATE (OTA):        eas update --branch <channel>
RUNTIME VERSION:         bump in app.json on every native change
GESTURE PAN GUARD:       activeOffsetX([-10, 10]) + failOffsetY([-12, 12])
WORKLET HYGIENE:         no JS-scope reads, no console.log, runOnJS on commit
VALIDATION:              npx tsc --noEmit  &&  npm run lint
DEFER TO:                ui-pipeline | api-integration | ui-testing | performance | security
```
