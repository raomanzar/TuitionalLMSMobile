---
name: lms-mobile-performance
description: >
  Mobile performance skill for the Tuitional LMS Mobile app — Hermes sampling
  profiler, react-native-performance markers, why-did-you-render dev guard,
  FlatList virtualization **tuning values** (the numeric matrix:
  initialNumToRender / windowSize / maxToRenderPerBatch / getItemLayout /
  removeClippedSubviews), **Reanimated 4 worklet correctness rules** (no
  console.log, no JS-scope reads, runOnJS placement), TanStack Query
  perceived-perf overlays only (keepPreviousData, select-as-mapper,
  prefetchQuery, optimistic via setQueryData, per-resource staleTime),
  expo-image cache discipline on long lists, JS bundle size budget via
  expo export + source-map-explorer, flashlight FPS / memory CI gate, and
  per-screen perf budgets (TTI, scroll FPS, JS heap). Trigger when the user
  asks "why is this slow", reports jank / dropped frames, asks for a tuning
  value, profiles a screen, audits Reanimated worklets, or sets up a CI perf
  gate. Defer the *prop contract* (which props every list must set) to
  `lms-mobile-ui-pipeline`; defer the surface-level perf checklist used during
  a UI audit to `lms-mobile-ui-testing`; defer TanStack Query *correctness*
  rules to `lms-mobile-api-integration`; defer gesture *composition* to
  `lms-mobile-platform`.
defers_to:
  - skill: lms-mobile-ui-pipeline
    for: FlatList prop *contract* (which props to set), swipe-gesture pattern, sheet pattern, design tokens
  - skill: lms-mobile-api-integration
    for: TanStack Query correctness rules (query-key factory, mappers in queryFn, mutation invalidation, enabled gating)
  - skill: lms-mobile-platform
    for: gesture composition (Race / Simultaneous / Exclusive, axis guards on Pan + scroll)
  - skill: lms-mobile-ui-testing
    for: surface-level UI perf checklist during an audit (§12 of that skill)
  - skill: lms-mobile-security
    for: any perf change that touches auth or token logging
---

# Tuitional LMS Mobile — Performance Specification

**Version:** 1.0.0 | **Scope:** measurement, profiling, list tuning, query perceived-perf, CI gates

This skill is the **deep** perf playbook. The shallow checklist in `lms-mobile-ui-testing` §12 is the entry door — anything that needs measurement comes here.

---

## 1. Tooling — what to install and why

The repo currently has **no profiling harness**. Without these, perf advice is theoretical.

```bash
# Install (pinned to SDK 54 compat)
npx expo install react-native-performance
npm i -D @welldone-software/why-did-you-render @bam.tech/flashlight
```

| Tool | Purpose | Where it runs |
|---|---|---|
| **`react-native-performance`** | `mark()` / `measure()` for screen TTI, route transitions | App + dev-client; reports via PerformanceObserver |
| **Hermes sampling profiler** | CPU profile (.cpuprofile) — built-in, already on | `Cmd+D` → Start Sampling Profiler in dev client |
| **`why-did-you-render`** | Catches needless re-renders in dev | Mounted in `AppProviders.tsx` behind `__DEV__` |
| **`@bam.tech/flashlight`** | Headless Android FPS / memory measurement | CI on Android emulator; produces HTML report |
| **`source-map-explorer`** | JS bundle composition (per-PR delta) | CI after `expo export` |

Mounting `why-did-you-render`:

```tsx
// src/providers/AppProviders.tsx (top of file, dev-only)
if (__DEV__) {
  const wdyr = require('@welldone-software/why-did-you-render');
  wdyr(React, { trackAllPureComponents: true });
}
```

---

## 2. Repo hot-files — concrete audit targets

Generic perf advice doesn't move numbers. These are the files where measurable wins exist today.

### 2.1 [`src/constants/theme/typography.ts:54`](../../../src/constants/theme/typography.ts) — one-shot `Dimensions` read

```ts
const SCREEN_W = Dimensions.get('window').width;     // resolved at MODULE LOAD
```

Every `FontSize.*` token is computed once. Rotation, foldables, iPad split-view, Android multi-window all break silently.

**Migration:**

```ts
import { useWindowDimensions } from 'react-native';

export const useFontSize = () => {
  const { width } = useWindowDimensions();
  const fluid = (min: number, max: number) => {
    const t = Math.min(Math.max((width - 320) / (1920 - 320), 0), 1);
    return Math.round(min + (max - min) * t);
  };
  return useMemo(() => ({
    regular18: fluid(14, 18),
    /* ...rest... */
  }), [width]);
};
```

Keep the static `FontSize` export for `StyleSheet.create` (cached at module load is fine for 90% of cases) but expose `useFontSize()` for screens that need responsiveness on rotate.

> Token-shape changes touch `src/constants/theme/`. Per CLAUDE.md, that requires explicit approval.

### 2.2 [`src/app/(protected)/users/index.tsx:262`](../../../src/app/(protected)/users/index.tsx) — `Animated.FlatList`

The only real list in the codebase today; reference for every future module list.

Audit checklist (cross-link to ui-pipeline §5.1, deeper here):

- `keyExtractor` is **module-level** (not `(item) => String(item.id)` inline).
- `renderItem` is `useCallback`'d with the smallest deps (handlers only, never the data array).
- `getItemLayout` is provided once row height is fixed — unlocks `scrollToIndex` and skips per-row measurement.
- `removeClippedSubviews={true}` on Android (helps; sometimes hurts on iOS — A/B per screen).
- `maintainVisibleContentPosition` is set when prepending items (chat, logs).
- Tuning matrix (start, then measure):

  | Row count | `initialNumToRender` | `maxToRenderPerBatch` | `windowSize` |
  |---|---|---|---|
  | < 50 | 10 | 10 | 21 (default) |
  | 50–200 | 10 | 8 | 11 |
  | 200–700 | 12 | 8 | 9 |
  | 700+ | 14 | 6 | 7 |

### 2.3 [`src/components/ui/users/UserCard.tsx`](../../../src/components/ui/users/UserCard.tsx) — `memo` boundary

Already `memo`'d. The common regression: parent passes a fresh callback each render. Confirm:

- Every `onPress` / `onLongPress` from the screen is `useCallback`'d.
- Every object prop (`style={[...]}` arrays!) is `useMemo`'d if memo'd children depend on it.
- `useEffect` inside the card has a stable dependency array — no `[user]` (the whole object), use `[user.id]`.

### 2.4 [`src/lib/queryClient.ts`](../../../src/lib/queryClient.ts) — defaults are sensible, not enough

Current: `staleTime: 60_000, gcTime: 5 * 60_000, retry: 1, refetchOnWindowFocus: false`.

Missing per-resource overrides:

```ts
useQuery({
  queryKey: usersQueryKeys.list(params),
  queryFn: ...,
  placeholderData: keepPreviousData,         // ← stops list flicker on filter change
  select: ({ users, total }) => ({           // ← runs in cache, not in render
    users: toUiUsers(users),
    total,
  }),
});
```

**Rules:**
- `placeholderData: keepPreviousData` on every paginated/filtered list query. Without it, the screen unmounts the list every key change.
- Apply mappers via `select` (TanStack v5) when the screen consumes a derived shape — runs once per cache update, not per render. Cross-link to `lms-mobile-api-integration` §6.3 — that skill applies mappers in `queryFn`; `select` is the second-stage optimization.

---

## 3. Reanimated 4 — worklet correctness

UI-pipeline §7 covers the surface pattern. Perf-side rules:

- **No `console.log` inside a worklet.** Each call serializes through the bridge, costs frame budget.
- **No JS-scope reads.** `useSharedValue` is the only legal channel.
- **`runOnJS` only at commit.** Calling `runOnJS(setState)(value)` inside `onUpdate` (60×/sec) drowns the JS thread.
- **`useAnimatedStyle`, not `Animated.event`.** Legacy `Animated.event` doesn't run on the UI thread.
- **`useAnimatedScrollHandler`** for collapsing-header animation, not `onScroll={Animated.event(...)}`.
- **Worklet entrypoints are recompiled on every render.** Define them outside render, or accept the cost.

Quick Reanimated audit grep:

```bash
grep -rn "console\." src/ --include='*.tsx' | grep -v '//'
grep -rn "runOnJS" src/ --include='*.tsx'      # check it's only in onEnd / onFinalize
```

---

## 4. TanStack Query — perceived-perf overlays only

Correctness rules (query-key factory, mappers in `queryFn`, never fetch in `useEffect`, mutation invalidation, `enabled: !!id` for detail queries before id is known) are owned by **[`lms-mobile-api-integration §6`](../lms-mobile-api-integration/SKILL.md)** — do not redefine here. This section adds *only* perceived-perf overlays on top of those correctness rules:

| Overlay | Why | Where |
|---|---|---|
| `placeholderData: keepPreviousData` | List doesn't unmount on filter / page change | All paginated reads |
| `select` mapper | Derivation runs once per cache, not per render | When screens read derived shape (the *primary* mapper still runs in `queryFn` per api-integration §6.3) |
| Per-resource `staleTime` | Hot resources don't refetch on every focus | `users` 60s, reference data 24h |
| `prefetchQuery` on row tap | Detail screen is warm before it mounts | List → detail navigations |
| `setQueryData` in `onSuccess` | Optimistic UI without invalidation latency | Mutations on visible list rows |

---

## 5. Images — `expo-image` discipline on lists

The users list will grow toward 700+ rows × 1 avatar each. Without caching, each scroll-back triggers a re-decode.

```tsx
import { Image } from 'expo-image';

<Image
  source={{ uri: user.avatarUrl }}
  contentFit="cover"
  cachePolicy="memory-disk"                 // default; verify it's not overridden
  transition={150}
  placeholder={blurhash}                    // perceived-perf win
  recyclingKey={String(user.id)}            // helps virtualization recycle correctly
  style={{ width: 44, height: 44, borderRadius: 22 }}
/>
```

Forbidden: RN's `<Image>` for network sources on long lists — no cache.

---

## 6. Bundle size budget

Run after every meaningful PR:

```bash
npx expo export --platform ios --output-dir dist
npx source-map-explorer dist/_expo/static/js/*.js
```

Track the **delta** vs main. Soft budget: **+50 KB per PR**. Hard budget: hold the line — anything that adds > 200 KB needs a justification.

Common bloat sources:
- `lodash` whole-package import (`import _ from 'lodash'`) → import per-method.
- `moment` (forbidden) → use native `Intl.DateTimeFormat` or `date-fns/...` per-method.
- Unused `react-native-vector-icons` glyph sets — use `@expo/vector-icons` selectively.
- Sourcemaps left on in production builds.

---

## 7. Per-screen perf budgets

See [`BUDGETS.md`](BUDGETS.md) for the live table. Initial baselines:

| Screen | TTI | Scroll FPS | JS heap |
|---|---|---|---|
| `users` list | ≤ 600 ms | ≥ 58 (Pixel 4a) | ≤ 80 MB |
| `users/[id]` detail | ≤ 400 ms | n/a | ≤ 60 MB |
| Future: `enrollments` list | ≤ 700 ms | ≥ 58 | ≤ 90 MB |

Measure on a **mid-tier Android device** — Pixel 4a is the canonical target. iOS is faster across the board; if Android passes, iOS passes.

---

## 8. CI flashlight gate

```yaml
# .github/workflows/perf.yml (sketch)
- run: npx @bam.tech/flashlight test --bundleId com.tuitional.lms --testCommand 'npx maestro test users-scroll.yaml' --duration 30000
- run: npx @bam.tech/flashlight report perf-results.json --output report.html
- uses: actions/upload-artifact@v4
  with: { name: flashlight-report, path: report.html }
```

Fail the job if:
- Average FPS < 55 over 30s scroll.
- JS heap delta > 20 MB across the run.

---

## 9. Profiling workflow — when something *is* slow

1. Reproduce with the dev client (debug build is misleading; run in release-mode dev client).
2. Hermes sampling profiler: dev menu → Start Sampling Profiler → reproduce → Stop → save `.cpuprofile`.
3. Open in Chrome DevTools (Performance tab → Load profile).
4. Look for: long JS-thread blocks > 16 ms, garbage-collection clusters, layout-pass dominance.
5. If FlatList is the culprit, run flashlight to confirm FPS regression and bisect props.
6. If Reanimated is the culprit, look for JS-thread frames during gesture (means a worklet is calling JS).

---

## 10. AI agent rules — STRICT MODE

### Rule 1 — Measure before optimizing
Don't apply tuning matrix values without a baseline measurement. Numbers without a profile are guesses.

### Rule 2 — Don't touch tokens for perf reasons
The typography one-shot `Dimensions` issue is real, but `src/constants/theme/` changes need explicit approval.

### Rule 3 — One change per measurement
When tuning a FlatList, change **one** prop at a time and re-measure. Otherwise you can't tell what helped.

### Rule 4 — Production-mode for benchmarks
Hermes + Production JS bundle. Dev mode is 3–10× slower and not representative.

### Rule 5 — Mid-tier Android is the canonical target
Pixel 4a (or equivalent). iOS is the easy mode.

### Rule 6 — `placeholderData: keepPreviousData` on every paginated list
List flicker on filter change is the #1 perceived-perf bug; this fixes it for free.

### Rule 7 — Flashlight CI gate is non-negotiable once wired
Anything that fails the gate gets fixed or reverted, not waived.

---

## Quick reference

```
TOOLS:                  react-native-performance | hermes profiler | why-did-you-render | flashlight | source-map-explorer
HOT FILES:              typography.ts:54 (Dimensions one-shot)
                        users/index.tsx:262 (Animated.FlatList tuning)
                        UserCard.tsx (memo boundary integrity)
                        queryClient.ts (per-resource staleTime + select)
FLATLIST TUNING:        initialNumToRender × maxToRenderPerBatch × windowSize × getItemLayout
WORKLET RULES:          no console.log, no JS-scope reads, runOnJS on commit only
QUERY PERCEIVED PERF:   placeholderData: keepPreviousData + select mapper + prefetchQuery on tap
IMAGE ON LISTS:         expo-image + cachePolicy + recyclingKey + placeholder
BUNDLE BUDGET:          +50 KB soft, +200 KB hard per PR
SCREEN BUDGET (USERS):  TTI ≤ 600ms · scroll FPS ≥ 58 · heap ≤ 80MB on Pixel 4a
CI GATE:                flashlight (FPS / heap) + source-map-explorer (bundle delta)
PROFILE WORKFLOW:       reproduce → Hermes sampling → Chrome DevTools → bisect
```
