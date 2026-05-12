# `.claude/skills/` — what each skill does and how they differ

Quick reference. One entry per skill. The intent is that any reader (or any future agent) can answer "which skill should I load?" in under 30 seconds.

Each skill exposes a single **verb** on its slice of the codebase. Verbs do not overlap. When two skills *seem* relevant to the same prompt, the verb tells you which one to load.

---

## Skill cards

### 1. `lms-mobile-api-integration` — *wires the data path*

**Verb:** wire / shape / type
**Scope:** `src/services/`, `src/types/`, `src/hooks/modules/<module>/`
**Owns (single source of truth):**
- Four-layer architecture (HTTP instance → URL builders → service functions → TanStack Query hooks)
- Axios instance + request/response interceptor *code*
- `AxiosGet/Post/Put/Patch/Delete` helpers (config-less signature)
- URL builders (path-only)
- Mappers (API → UI shape)
- Query-key factory shape (`<module>QueryKeys.all/list/detail`)
- Type naming convention (`{Resource}_Api_Payload_Type` etc.)
- Layer-skip grep recipes (canonical)
- Mutation invalidation rules ("always invalidate, never refetch")

**Defers to:** performance (perceived-perf overlays), security (token storage / 401 flow), platform (bootstrap orchestration), ui-pipeline (FlatList prop contract on consumer side).

**Trigger:** "wire endpoint", "add useQuery / useMutation", "shape payload / response type", "invalidate", "audit data fetching", "any in helpers", "where does this hook go".

---

### 2. `lms-mobile-ui-pipeline` — *defines the visual + structural contract*

**Verb:** scaffold / pattern / place
**Scope:** `src/app/`, `src/components/`, `src/constants/theme/`
**Owns (single source of truth):**
- Design tokens (Colors, Fonts, FontSize, LetterSpacing, Spacing, Radius, Shadow, Gradients) — every other skill points here
- StyleSheet co-location with components
- Expo Router file-based routing (Stack / Tabs / route groups)
- `headerShown: false` + custom `<TopBar/>` contract
- **FlatList prop *contract*** (which props every list must set — *values* live in performance)
- Modal-based bottom-sheet pattern (scrim + sheet + grabber)
- **Swipe-action *pattern*** (Pan + axis guards + useSharedValue)
- Memoization rules for FlatList items (memo / useCallback / useMemo)
- Component placement (global / ui/<module> / inline)
- Tap-target sizes, accessibility-pair rule (color + text)

**Defers to:** performance (tuning values, worklet correctness), platform (gesture composition), api-integration (TanStack Query wiring), security (route guards), ui-testing (audit), refactoring (scrollview→flatlist migration).

**Trigger:** "styling", "design tokens", "navigation wiring", "list / sheet pattern", "swipe-action scaffold", "where does this component live". **NOT** "what value should `initialNumToRender` be" — that's performance.

---

### 3. `lms-mobile-performance` — *picks tuning values + enforces correctness for the UI thread*

**Verb:** measure / tune / profile / enforce-correctness
**Scope:** measurement, profiling, list tuning, query perceived-perf, CI gates
**Owns (single source of truth):**
- **FlatList tuning matrix** — concrete numeric values for `initialNumToRender`, `maxToRenderPerBatch`, `windowSize` per row-count bucket
- **Reanimated 4 worklet correctness rules** — no `console.log` in worklets, no JS-scope reads, `runOnJS` only at commit (`onEnd` / `onFinalize`, not `onUpdate`)
- TanStack Query *perceived-perf overlays* (`placeholderData: keepPreviousData`, `select` mapper, `prefetchQuery`, optimistic `setQueryData`, per-resource `staleTime`) — correctness rules belong to api-integration
- `expo-image` cache discipline on long lists
- Hermes sampling profiler workflow + `react-native-performance` markers
- `why-did-you-render` dev guard
- JS bundle budget (`expo export` + `source-map-explorer`)
- Flashlight CI gate (FPS / heap)
- Per-screen perf budgets (TTI, scroll FPS, JS heap) — see `BUDGETS.md`

**Defers to:** ui-pipeline (FlatList prop *contract*), api-integration (TanStack Query *correctness*), platform (gesture *composition*), ui-testing (surface perf checklist), security (any perf change touching auth/logging).

**Trigger:** "why is this slow", "jank / dropped frames", "tune a list", "what value for X", "profile a screen", "audit a worklet", "set up CI perf gate".

---

### 4. `lms-mobile-platform` — *orchestrates cross-cutting work*

**Verb:** orchestrate / bootstrap / integrate
**Scope:** cross-cutting RN/Expo concerns + new-module orchestration
**Owns (single source of truth):**
- **New-module bootstrap order** — the fixed file-creation sequence (types → endpoint → helpers → mappers → barrel → constants → hooks → routes → validate)
- Expo SDK package map (which package for which use case)
- **Gesture composition** (Race / Simultaneous / Exclusive, axis guards on Pan + scroll) — worklet *correctness* belongs to performance
- Provider stack + mount order (`AppProviders.tsx`)
- App lifecycle (AppState, deep-link handler, splash hide)
- EAS profiles + OTA channels
- Platform splits (`.ios.tsx` / `.android.tsx`, `Platform.select`)
- Path alias `@/*`, Metro reset protocol after file moves

**Defers to:** ui-pipeline (styling, component placement), api-integration (endpoint / hook wiring), performance (worklet correctness, profiling), security (auth / deep-link validation / pinning), ui-testing (audit), refactoring (forward-scaffolding).

**Trigger:** "scaffold new module", "integrate Expo package", "configure EAS", "set up deep links", "AppState lifecycle", "provider order", "platform-specific code".

---

### 5. `lms-mobile-security` — *guards the auth + transport + linking surface*

**Verb:** guard / validate / redact
**Scope:** auth, transport, linking, env, permissions
**Owns (single source of truth):**
- **Token contract** — raw token in `Authorization`, no `Bearer ` prefix (interceptor *code* lives in api-integration; this skill owns the *contract*)
- Token lifecycle (in-memory now → `expo-secure-store` target)
- 401 single-flight refresh-flow pattern
- Route guards on `(protected)/_layout.tsx`
- **Deep-link allow-list** — schemes / hosts / param regex validation
- Certificate pinning (production-only, two SPKI hashes)
- Env-var exposure rules — `EXPO_PUBLIC_*` is shipped to device
- Secret hygiene CI greps (JWT, API keys, AWS keys in source)
- Permission usage strings (`infoPlist.NSCameraUsageDescription` etc.)
- Log redaction (Authorization, Cookie, password, email)

**Defers to:** api-integration (axios instance code), platform (AuthProvider mount, deep-link handler wiring), ui-pipeline (login screen styling), ui-testing (route-guard behavior audit), refactoring (auth stub forward-scaffold).

**Trigger:** "wire login / logout", "persist token", "gate route", "validate deep link", "harden HTTPS", "audit env vars", "app-store review prep", "security review".

---

### 6. `lms-mobile-refactoring` — *executes cleanup against the canonical pattern*

**Verb:** migrate / tighten / clean
**Scope:** stub modules, layer-skip violations, type tightening, dead-code removal
**Owns (single source of truth):**
- **Forward-scaffolding posture** — stubs become `users`-shaped; do not refactor `users` itself without approval
- Type tightening procedure (`any` → `src/types/<module>.types.ts`, never `unknown` as a workaround)
- ScrollView → FlatList migration trigger + procedure
- Dead-code surfacing (`ts-prune` / `knip`) — surface only, never auto-delete
- Naming convention enforcement (cross-module table)
- Import-boundary cleanup (cross-module table)
- Delete-don't-deprecate hygiene (matches CLAUDE.md non-negotiables)

**Owns *executing* — does NOT redefine:**
- Layer-skip grep recipes — *runs* them, recipes live in api-integration `[validate]`
- Token-discipline grep recipes — *runs* them, recipes live in ui-pipeline `[validate]`
- Bootstrap file-creation order — *follows* it, order lives in platform §1

**Defers to:** platform (bootstrap order), api-integration (layer-skip greps + endpoint shape), ui-pipeline (token greps + component contract), performance (FlatList tuning), security (auth/token changes), ui-testing (device spot-check).

**Trigger:** "clean up", "match users pattern", "tighten types", "audit layer skips", "remove dead code", "migrate stub to canonical", "ScrollView is rendering server data".

---

### 7. `lms-mobile-ui-testing` — *audits whether patterns are wired*

**Verb:** check / verify / flag / confirm-present
**Scope:** structural and functional UI quality audit (does NOT own patterns or values)
**Owns (single source of truth):**
- The audit *protocol* — 14-section checklist (responsive, navigation, typography, layout, images, forms, FlatList presence, sheets/gestures, iOS, Android, accessibility, surface perf, release metadata, structured report format)
- The structured **issue-report format** (Critical / Warning / Minor / Passing)
- The "do not propose design changes" rule — flag contrast failures, defer fix to ui-pipeline

**Owns *checking* — does NOT redefine:**
- FlatList prop *presence* — checks that props are set; values defer to performance, contract defers to ui-pipeline
- Swipe-gesture *presence* — checks `activeOffsetX` + `failOffsetY` + `runOnJS` are wired; pattern defers to ui-pipeline, worklet correctness to performance
- Token *presence* — checks tokens are used (no hex/rgba/bare fontSize); design system itself defers to ui-pipeline
- Surface-perf checklist — defers to performance for anything deeper

**Defers to:** ui-pipeline (tokens, contract, pattern), performance (values, worklet correctness, profiling), platform (gesture composition, Expo packages), api-integration (TanStack Query wiring), security (auth audit), refactoring (type tightening, dead-code).

**Trigger:** "check UI", "audit", "review", "fix UI issues", "something looks off", "share component for review", "responsive on tablet", "keyboard avoidance", "accessibility audit", "release prep checklist".

---

## How they differ — verb table

| Skill | Verb | What it produces |
|---|---|---|
| api-integration | wire / shape / type | code: endpoints, helpers, mappers, hooks, types |
| ui-pipeline | scaffold / pattern / place | code: components, screens, routes, theme tokens |
| performance | measure / tune / profile | numbers + workflows: tuning values, profiles, CI gates, worklet correctness verdicts |
| platform | orchestrate / bootstrap / integrate | sequenced multi-skill work: new module, package install, EAS config |
| security | guard / validate / redact | rules + boundary code: route guards, allow-lists, redaction |
| refactoring | migrate / tighten / clean | diffs against canonical: stubs aligned, `any` removed, dead code surfaced |
| ui-testing | check / verify / flag | audit reports: Critical / Warning / Minor / Passing |

Each verb is exclusive — when in doubt, the verb in the user's prompt picks the skill.

---

## Ownership map — who owns what

Single canonical owner per topic. If you're tempted to write the same thing in two skills, this table tells you which one wins.

| Topic | Owner | Notes |
|---|---|---|
| Design tokens (Colors / Fonts / FontSize / LetterSpacing / Spacing / Radius / Shadow / Gradients) | **ui-pipeline** | Mirrors web's `globals.css`. Every other skill points here. |
| FlatList prop *contract* (which props to set) | **ui-pipeline §5** | The list of required props. |
| FlatList prop *values* (numeric tuning matrix) | **performance §2.2** | The actual `8` / `9` / `10` / etc. per row-count bucket. |
| FlatList prop *presence-check* during audit | **ui-testing §7** | Verifies props are set; doesn't pick values. |
| Reanimated worklet *correctness* (no console.log, no JS-scope reads, runOnJS placement) | **performance §3** | One source. |
| Reanimated *composition* (Race / Simultaneous / Exclusive, axis guards) | **platform §5** | Composition gotchas. |
| Swipe-gesture *pattern* (Pan + activeOffsetX + failOffsetY + useSharedValue) | **ui-pipeline §7** | The recipe. |
| Sheet / Modal pattern (scrim + sheet + grabber) | **ui-pipeline §6** | One recipe. |
| Axios instance + request/response interceptor *code* | **api-integration §2** | Single choke-point. |
| Token *contract* (raw, no Bearer) | **security §1** | Contract; code lives in api-integration. |
| Token storage (in-memory → secure-store) | **security §1** | Storage lifecycle. |
| Query keys + mappers + service helpers | **api-integration §3-§6** | Four-layer canonical shape. |
| TanStack Query perceived-perf (`keepPreviousData`, `select`, `prefetch`, `setQueryData`) | **performance §4** | Overlays only — correctness is api-integration. |
| Mutation invalidation strategy ("always invalidate, never refetch") | **api-integration §6.4** | One rule. |
| 401 single-flight refresh flow | **security §1.3** | Pattern. |
| Layer-skip grep recipes (axios in components, inline keys, `any` in helpers, BASE_URL concat, React in mappers, fetch in screens) | **api-integration `[validate]`** | Canonical. |
| Token-discipline grep recipes (hex, rgba, bare fontSize) | **ui-pipeline `[validate]`** | Canonical. |
| Relative-deep-path grep recipe | **platform `[validate]`** | Canonical. |
| New-module bootstrap order (types → endpoint → … → routes) | **platform §1** | Canonical. Refactoring follows it. |
| Component placement decision (global / ui/<module> / inline) | **ui-pipeline §10 + platform §8** | Decision logic in ui-pipeline; orchestration in platform. |
| Image caching (`expo-image` + cachePolicy + recyclingKey) | **performance §5** | Long-list discipline. |
| `expo-image` vs RN `<Image>` choice | **platform §2** | Package map. |
| Deep-link allow-list + param validation | **security §3** | Untrusted input handling. |
| Deep-link handler *wiring* (where it mounts) | **platform §4.3** | Lifecycle. |
| Route guards on `(protected)/` | **security §2** | Auth surface. |
| Provider mount order (`AppProviders.tsx`) | **platform §4.1** | Lifecycle. |
| EAS profiles + OTA channels + `runtimeVersion` | **platform §6** | Build / release. |
| Hermes / dev-client workflow | **platform §7** | Tooling. |
| Path alias `@/*` + Metro reset | **platform §7** | Tooling. |
| `Platform.select` vs `.ios.tsx` / `.android.tsx` heuristic | **platform §3** | Code-split rule. |
| `KeyboardAvoidingView`, safe-area, autofill, tap-target presence checks | **ui-testing §4-§6** | Audit. |
| `headerShown: false` + custom `<TopBar/>` contract | **ui-pipeline §4.2** | Routing rule. |
| Type naming convention (`{Resource}_Api_Payload_Type` etc.) | **api-integration §7** | Naming. |
| Naming conventions cross-module table (component / route / hook / URL builder / service / type) | **ui-pipeline §2 + api-integration §3-§7** | Two halves. |
| Import-boundary table (screen → hook → service → mapper) | **api-integration `[imports]`** | Canonical. |
| Forward-scaffolding posture ("stubs → canonical, never refactor `users`") | **refactoring §1** | Posture. |
| Type tightening procedure (`any` → real type) | **refactoring §4** | Procedure. |
| ScrollView → FlatList migration | **refactoring §5** | Procedure (defers tuning to performance). |
| Dead-code surfacing | **refactoring §6** | `ts-prune`; surface only. |
| Delete-don't-deprecate hygiene | **refactoring §9** | Matches CLAUDE.md. |
| Env-var exposure rule (`EXPO_PUBLIC_*` is public) | **security §5** | Boundary. |
| Permission usage strings (`infoPlist`, Android manifest) | **security §6** | App-store surface. |
| Log redaction (Authorization, Cookie, password, email) | **security §7** | Hygiene. |
| Secret-hygiene CI greps (JWT, API keys, AWS keys) | **security `[pre_push.greps]`** | Pre-push gate. |
| JS bundle budget (`+50KB soft / +200KB hard`) | **performance §6 + BUDGETS.md** | Budget. |
| Flashlight CI gate (FPS / heap thresholds) | **performance §8** | CI gate. |
| Per-screen perf budgets (TTI, scroll FPS, JS heap) | **performance §7 + BUDGETS.md** | Budget table. |
| Hermes sampling profiler workflow | **performance §1, §9** | Tooling. |
| `why-did-you-render` dev guard | **performance §1** | Tooling. |
| `react-native-performance` markers | **performance §1** | Tooling. |
| 14-section UI audit protocol | **ui-testing** | Whole skill. |
| Structured issue-report format (Critical / Warning / Minor / Passing) | **ui-testing §14** | Output format. |
| Release metadata audit (`app.json`, `eas.json`, store review) | **ui-testing §13 + security §9 + platform §6** | Three concerns: structural (ui-testing) / security strings (security) / EAS profiles (platform). |

---

## Routing rules — what to do when work spans skills

If the user's request hits more than one skill, follow this order:

1. **Identify the verb** in the user's prompt. If they say "wire" → api-integration; "tune" → performance; "audit" → ui-testing; "scaffold a new module" → platform.
2. **Load the primary skill.** Read its `defers_to` block.
3. **Load each deferred skill *only if* the work actually crosses into its territory.** Don't pre-load.
4. **Never paraphrase** a deferred skill's rules. Read the original. Drift is the enemy.

A request like "add the enrollments module end-to-end" hits 3+ skills:
- **platform** drives the orchestration (§1 bootstrap order).
- **api-integration** is invoked for steps 1–8 (types → endpoint → helpers → mappers → barrel → constants → hooks → hook barrel).
- **ui-pipeline** is invoked for steps 9–10 (components → routes).
- **ui-testing** + **performance** run after for spot-check + tuning.
- **refactoring** runs the layer-skip greps.

---

## Maintenance rules

When adding a new rule or pattern to any skill, check this file's ownership map first.

- If the topic already has an owner, **edit the owner's SKILL.md / rules.toml**, not a different skill's.
- If you find yourself writing the same paragraph in two SKILL.md files, one of them is wrong — pick the canonical owner and replace the other with a one-line pointer.
- If a new topic has no clear owner, add a row to the ownership map *first*, then write the content under that owner.
- `defers_to` blocks must be updated symmetrically — if X starts deferring to Y, Y's `defers_to` doesn't need to change but Y's `[scope]` should mention it as territory it owns.
