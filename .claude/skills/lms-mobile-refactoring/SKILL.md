---
name: lms-mobile-refactoring
description: >
  Refactoring + codebase-cleanup skill for the Tuitional LMS Mobile app —
  forward-scaffolding the four stub modules (auth / enrollments / schedule /
  billing / chat) to match the canonical `users` pattern, **running** layer-skip
  detection greps (the recipes themselves live in `lms-mobile-api-integration`
  and `lms-mobile-ui-pipeline` — this skill executes them, does not redefine
  them), type tightening (`any` → `src/types/<module>.types.ts`), ScrollView →
  FlatList migration when content becomes server-driven, dead-code removal
  (unused exports, scaffold stubs), naming convention enforcement, and
  import-boundary cleanup. Trigger when the user asks to "clean up", "make
  this match the users pattern", "remove dead code", "tighten types", "audit
  for layer skips", or migrate a module from scaffold to canonical. Posture:
  forward-scaffolding (stubs → canonical), NOT legacy debt reduction. Do not
  touch the canonical `users` module without explicit approval — it is the
  source of truth.
defers_to:
  - skill: lms-mobile-platform
    for: file-creation order during bootstrap (canonical owner of the order)
  - skill: lms-mobile-api-integration
    for: layer-skip grep recipes ([validate]), endpoint / helper / mapper / hook shape
  - skill: lms-mobile-ui-pipeline
    for: token-discipline grep recipes ([validate]), component placement, FlatList prop contract
  - skill: lms-mobile-performance
    for: FlatList tuning values, perceived-perf overlays
  - skill: lms-mobile-security
    for: any change touching auth, token, or deep-link surface
  - skill: lms-mobile-ui-testing
    for: device spot-check after refactor lands
---

# Tuitional LMS Mobile — Refactoring & Cleanup

**Version:** 1.0.0 | **Posture:** forward-scaffolding (stubs → canonical), not legacy debt

This codebase is mostly **scaffolds**, not technical debt. The job is migrating four stub modules to match the `users` pattern — not "cleaning up" code that already conforms.

---

## 1. Refactoring posture

### 1.1 Two distinct refactor modes

| Mode | When | Risk |
|---|---|---|
| **Forward-scaffolding** | Stub module → canonical pattern (90% of work) | Low — the target shape is fixed by `users` |
| **Pattern-drift correction** | Existing code that violates a rules.toml line | Medium — read the rule, fix the violation |
| **Legacy refactor** | Premature for this codebase | High — defer until a real consumer signal |

If the user asks to "clean up the codebase" without naming a module, the answer is: **first verify which modules are scaffolds** vs canonical, and run forward-scaffolding on the scaffolds.

### 1.2 The "users module is canonical" rule

`src/services/apis/users/`, `src/hooks/modules/users/`, `src/components/ui/users/`, `src/app/(protected)/users.tsx`, `src/app/users/...` collectively define the pattern. **Do not refactor any of them** without explicit approval — drift in the canonical reference cascades into every future module.

### 1.3 Out-of-scope for this skill

- Adding new features → use `lms-mobile-platform` for orchestration.
- Changing the API contract → `lms-mobile-api-integration` owns it.
- Changing tokens / design system → `lms-mobile-ui-pipeline` owns it; needs explicit approval.
- Performance tuning → `lms-mobile-performance`.
- Security hardening → `lms-mobile-security`.

---

## 2. Layer-skip detection — defer to canonical greps

The canonical layer-skip grep set lives in [api-integration/rules.toml `[validate]`](../lms-mobile-api-integration/rules.toml) (axios in components, inline query keys, `any` in helpers / endpoints, BASE_URL concat, React in mappers, raw axios/fetch in screens). Token-discipline greps (hex / rgba / bare fontSize) live in [ui-pipeline/rules.toml `[validate]`](../lms-mobile-ui-pipeline/rules.toml).

This skill **does not** redefine those recipes — that produces drift. Instead:

1. Load `lms-mobile-api-integration` for the **layer** grep set.
2. Load `lms-mobile-ui-pipeline` for the **token** grep set.
3. Run all of them in `scripts/audit-layer-skips.sh` — fail-closed in CI before merge.

If a recipe is missing, add it to the **canonical owner's** `rules.toml` (api-integration or ui-pipeline) — never duplicate it here.

---

## 3. Forward-scaffolding workflow (stub module → canonical)

When migrating `enrollments` (or any other stub) to the `users` shape:

### Step 1 — Diff the file tree

```bash
diff -r --brief src/services/apis/users src/services/apis/enrollments
diff -r --brief src/hooks/modules/users src/hooks/modules/enrollments
diff -r --brief src/components/ui/users src/components/ui/enrollments
```

Anything missing in `enrollments/` that exists in `users/` is a TODO.

### Step 2 — Use the api-integration skill's bootstrap order

Defer to `lms-mobile-api-integration` §10 (module setup checklist) — it is the source of truth for file order and naming.

### Step 3 — Use the platform skill for routing

Defer to `lms-mobile-platform` §1 — it owns the route layout (`(protected)/<module>.tsx` + sibling Stack).

### Step 4 — Run the layer-skip greps from §2

Catches violations introduced during scaffolding before they land.

### Step 5 — Validate

```bash
npx tsc --noEmit && npm run lint
```

---

## 4. Type tightening — `any` → typed

Every `any` in `src/services/apis/<module>/{endpoint,helpers}.ts` is a violation per the api-integration `rules.toml`. Migration:

```ts
// ❌ Before
export const getEnrollments = (options: any) =>
  AxiosGet<any>(getEnrollmentsApi(options));

// ✅ After — types live in src/types/enrollments.types.ts
import type {
  GetAllEnrollments_Api_Payload_Type,
  GetAllEnrollments_Api_Response_Type,
} from '@/types/enrollments.types';

export const getAllEnrollments = (options: GetAllEnrollments_Api_Payload_Type = {}) =>
  AxiosGet<GetAllEnrollments_Api_Response_Type>(getAllEnrollmentsApi(options));
```

If the type doesn't exist yet, **stop and create it** in `src/types/<module>.types.ts` first. Do not introduce `unknown` as a workaround.

---

## 5. ScrollView → FlatList migration

Trigger: a `ScrollView` is rendering `.map()` over server-driven data.

```tsx
// ❌ Before — virtualization gone, bad on long lists
<ScrollView>
  {data.map((item) => <Card key={item.id} item={item} />)}
</ScrollView>

// ✅ After — virtualized, paginated, refresh-aware
<FlatList
  data={data}
  keyExtractor={keyExtractor}        // module-level
  renderItem={renderItem}            // useCallback
  removeClippedSubviews
  initialNumToRender={10}
  refreshing={isFetching && !isLoading}
  onRefresh={refetch}
/>
```

For tuning numbers, defer to `lms-mobile-performance` §2.2.

If the screen also has fixed header content, move it to `ListHeaderComponent` — never wrap a `FlatList` in a `ScrollView` (defeats virtualization, triggers Reanimated warnings).

---

## 6. Dead-code detection

```bash
# Unused exports (requires ts-prune or knip)
npx ts-prune --error            # add to CI

# Unreferenced barrel exports
for f in src/services/apis/*/index.ts; do
  echo "=== $f ==="
  grep -h "export" "$f"
done

# Files that haven't been touched since the initial scaffold (likely stubs)
git log --diff-filter=A --pretty=format: --name-only | sort -u | xargs -I{} git log -1 --format="%ai {}" {} 2>/dev/null | sort | head -20
```

**Don't auto-delete.** Surface findings; the user decides which stubs are abandoned vs in-progress.

---

## 7. Naming convention enforcement

| Item | Rule | Source |
|---|---|---|
| Component file | `PascalCase.tsx` | ui-pipeline §2 |
| Route file | `kebab-case.tsx` | Expo Router |
| Hook file | `camelCase.ts` with `use` prefix | ui-pipeline §2 |
| URL builder | `{verb}{Resource}Api` (`getAllUsersApi`) | api-integration §3.3 |
| Service function | `{verb}{Resource}` (`getAllUsers`) | api-integration §4.4 |
| Type | `{Resource}_Api_Payload_Type` etc. | api-integration §7.2 |

Drift between modules within these conventions is a code smell — fix on sight (within the target module, not in `users`).

---

## 8. Import-boundary cleanup

The `lms-mobile-api-integration` `rules.toml` defines exact import boundaries. Common cleanup work:

| Found in | Allowed | Forbidden |
|---|---|---|
| Screen / component | `@/hooks/modules/<module>`, `@/components/global`, `@/components/ui/<module>`, `@/constants/<module>` | `@/services/axios/*`, `@/services/apis/<module>/{endpoint,helpers,mappers}` (use the barrel) |
| Hook | `@/services/apis/<module>` (barrel), `@/types/<module>.types`, `@/constants/<module>` | React-DOM-only APIs, Redux (until introduced) |
| Service | none of: `@/components`, `@/app`, `@/hooks`, `react` | React hooks in services, Redux access |
| Mapper | only `@/types/<module>.types` and `@/constants/<module>` | Anything from React, hooks, stores |

Refactor target: every offending import flagged. Replace with the allowed alternative.

---

## 9. Backwards-compat hygiene (matches CLAUDE.md)

When deleting code:

- **Delete it.** Do not rename to `_unusedFoo` "just in case".
- **No `// removed for X` comments** — git log knows what was removed.
- **No re-exports** of removed types from a barrel — break the import; let `tsc` find every consumer.
- **No feature flags** for code that's truly gone.

When changing a public-shape (a barrel export):

- Update every consumer in the same change. Don't leave dangling imports for "the next PR".

---

## 10. Refactor checklist (per module)

When scaffolding a stub module (e.g. `enrollments`) to the canonical pattern:

1. **Diff** file tree against `users/` (§3.1).
2. **Bootstrap** in fixed order — use [`lms-mobile-platform §1`](../lms-mobile-platform/SKILL.md) (canonical owner of the file-creation order). This skill does **not** redefine the order.
3. **Tighten types** — replace every `any` with the right type from `src/types/<module>.types.ts` (§4).
4. **Migrate** `ScrollView` over server-driven data → `FlatList` (§5).
5. **Run layer-skip greps** (§2 → defers to api-integration / ui-pipeline / platform — must return zero matches).
6. **Verify import boundaries** (§8).
7. **Verify naming conventions** (§7).
8. **Dead-code surface** — `ts-prune` (§6); do not auto-delete.
9. **Validate** — `npx tsc --noEmit && npm run lint`.
10. **Device spot-check** — defer to `lms-mobile-ui-testing`.

---

## 11. AI agent rules — STRICT MODE

### Rule 1 — Never refactor the canonical `users` module without approval
It is the reference shape. Drift cascades.

### Rule 2 — Forward-scaffolding, not legacy debt
This codebase is young. Don't invent debt to refactor. Migrate stubs; leave canonical code alone.

### Rule 3 — One module at a time
Refactor `enrollments` to canonical, validate, ship. Then `schedule`. Don't touch four modules in one PR.

### Rule 4 — Layer-skip greps are fail-closed
The §2 grep set must return empty. Any violation blocks the refactor.

### Rule 5 — `any` → typed in one motion
If the type doesn't exist, create it in `src/types/<module>.types.ts` first. Don't widen with `unknown` as a workaround.

### Rule 6 — Delete; don't deprecate
No `_unused` prefixes, no `// removed` comments, no re-exports of dead code. Match CLAUDE.md.

### Rule 7 — Validate after every refactor step
`npx tsc --noEmit && npm run lint`. Both must pass.

---

## Quick reference

```
POSTURE:                forward-scaffolding (stubs → canonical), not debt reduction
CANONICAL MODULE:       users (do not modify without approval)
STUB MODULES:           auth, enrollments, schedule, billing, chat
GREP RECIPES:           §2 — layer-skip detection (fail-closed)
TYPE TIGHTENING:        any → src/types/<module>.types.ts
SCROLLVIEW → FLATLIST:  when content becomes server-driven
DEAD CODE:              ts-prune, surface only, do not auto-delete
NAMING:                 see §7 cross-module table
IMPORT BOUNDARIES:      see §8 cross-module table
DELETE; DON'T DEPRECATE: matches CLAUDE.md non-negotiables
VALIDATION:             npx tsc --noEmit  &&  npm run lint
DEFER TO:               ui-pipeline | api-integration | platform | performance | security
```
