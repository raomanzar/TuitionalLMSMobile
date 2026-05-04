---
name: lms-mobile-ui-pipeline
description: >
  Authoritative UI pipeline for the Tuitional LMS Mobile app — React Native +
  Expo Router, StyleSheet (no CSS), JS-based design tokens (mirrors web's
  globals.css), Expo Router file-based routes, FlatList virtualization,
  Modal-based bottom sheets, swipe-actions via Reanimated + GestureHandler,
  and the global/<module> component split. Trigger when the user asks about
  styling architecture, design tokens, navigation, lists, sheets, or how to
  scaffold a new screen / component consistently with the rest of the codebase.
---

# Tuitional LMS Mobile — UI Pipeline Specification

**Version:** 1.0.0 | **Authority:** Senior Mobile Architect
**Scope:** `src/app/`, `src/components/`, `src/constants/theme/` — all UI, navigation, theming, screen patterns

## Companion assets (load before generating UI)

- `DESIGN.md` — design tokens (mobile JS port of web's `globals.css`)
- `rules.toml` — mandatory standards (StyleSheet, theme tokens, navigation)

Read both before producing any component / screen code.

---

## 1. UI architecture — the three layers

| Layer | Technology | Role |
|-------|-----------|------|
| **Layer 1 — Tokens** | TypeScript constants in [src/constants/theme/](../../../src/constants/theme/) | Colors, typography, spacing, radii, shadows. Single source of truth. Mirrors web's `globals.css`. |
| **Layer 2 — Styles** | `StyleSheet.create({...})` co-located with each component | Static styles consume Layer 1 tokens. Cached at module load. |
| **Layer 3 — Runtime values** | Inline `style={{...}}` arrays | Only for values that depend on render-time data (animated styles, computed widths, dynamic colors per-row). |

There is **no CSS, no SCSS, no styled-components, no NativeWind, no Tailwind**. RN does not run a CSS engine — `StyleSheet` is the contract.

The token system mirrors the web's `colors_and_type.css` 1:1 so new design changes flow from one source. JS port of `clamp()` lives in [typography.ts](../../../src/constants/theme/typography.ts) — `FontSize.regular18` resolves to ~14 on a phone, ~18 on a tablet (same as the web's `clamp(0.875rem, …, 1.125rem)`).

---

## 2. Folder structure

```
src/
├── app/                                     # routes (Expo Router file-based)
│   ├── _layout.tsx                          # fonts + AppProviders + root Stack
│   ├── index.tsx                            # redirect to first tab
│   ├── (protected)/                         # bottom-tabs group (route group, parens hide from URL)
│   │   ├── _layout.tsx                      # Tabs(custom AppTabBar)
│   │   ├── users.tsx, enrollments.tsx, …    # one file per tab
│   └── users/                               # full-screen module routes — sibling of (protected) so tabs disappear
│       ├── _layout.tsx                      # Stack
│       ├── add.tsx, edit.tsx, [id].tsx, …   # one file per sub-screen
│
├── components/
│   ├── global/                              # cross-page reusables
│   │   ├── Avatar.tsx, Badge.tsx, AppTabBar.tsx,
│   │   ├── TopBar.tsx, Field.tsx, TextField.tsx,
│   │   ├── SelectLook.tsx, PrimaryButton.tsx,
│   │   ├── ScreenBg.tsx, Placeholder.tsx
│   │   └── index.ts                         # barrel
│   └── ui/<module>/                         # module-scoped UI
│       ├── UserCard.tsx, UserDetailScreen.tsx, …
│       └── index.ts                         # barrel
│
├── constants/
│   ├── theme/                               # design tokens (Layer 1)
│   └── <module>.ts                          # types + filter constants + mock data per module
│
├── hooks/
│   ├── global/                              # cross-cutting hooks
│   └── modules/<module>/                    # module-scoped (queries + filters + mutations)
│
├── providers/AppProviders.tsx               # GestureHandlerRoot + SafeArea + QueryClient
└── lib/queryClient.ts                       # TanStack Query setup
```

### Naming conventions

| Item | Convention | Example |
|------|-----------|---------|
| Component file | `PascalCase.tsx` | `UserCard.tsx`, `AddUserScreen.tsx` |
| Route file | `kebab-case.tsx` (Expo Router contract) | `add-relation.tsx`, `[id].tsx` |
| Hook file | `camelCase.ts` with `use` prefix | `useFilteredUsers.ts`, `usersQueries.ts` |
| Folder | `kebab-case` | `add-relation`, `enrollments-logs` |
| Style key | `camelCase` inside `StyleSheet.create` | `iconBtn`, `searchField` |
| Type | `PascalCase_With_Underscores` (matches API types) | `GetAllUsers_Api_Payload_Type` |

### Co-location rule

Each component is **one `.tsx` file** with its `StyleSheet.create` block at the bottom. No separate style files. Style locality keeps blast radius small: editing the card's avatar size never touches another file.

---

## 3. Component pattern

### 3.1 Mandatory template

```tsx
import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Avatar, Badge, type BadgeKind } from '@/components/global';
import {
  Colors,
  Fonts,
  FontSize,
  LetterSpacing,
  Radius,
  Shadow,
  Spacing,
} from '@/constants/theme';
import type { User } from '@/constants/users';

type Props = {
  user: User;
  onPress: (u: User) => void;
};

function ExampleCardImpl({ user, onPress }: Props) {
  return (
    <Pressable onPress={() => onPress(user)} style={styles.root}>
      <Avatar first={user.first} last={user.last} color={user.color} size={44} />
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>
          {user.first} {user.last}
        </Text>
        <Badge kind={user.role.toLowerCase() as BadgeKind}>{user.role}</Badge>
      </View>
      <Feather name="chevron-right" size={18} color={Colors.textMuted} />
    </Pressable>
  );
}

/** Memoized so a parent re-render doesn't re-render every visible card. */
export const ExampleCard = memo(ExampleCardImpl);

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.s3,
    paddingHorizontal: Spacing.s4,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderRadius: Radius.card,
    ...Shadow.card,
  },
  body: { flex: 1, minWidth: 0 },
  name: {
    fontFamily: Fonts.semibold,
    fontSize: FontSize.regular20,
    color: Colors.text,
    letterSpacing: LetterSpacing.tight,
  },
});
```

### 3.2 Memoization rules

- **Components rendered inside `FlatList`** → wrap with `React.memo`. The parent's state updates re-render the list shell; without `memo`, every visible card re-renders too.
- **Inline functions passed as props** to memoized children → wrap with `useCallback`. New function reference on every render breaks `memo`.
- **Computed objects passed as props** → wrap with `useMemo`. Same reasoning.
- **`renderItem` for FlatList** → wrap with `useCallback`, list its real deps, don't include the entire data array.
- **`keyExtractor`** → hoist to module-level when the key derives only from item props.

### 3.3 Inline styles — when permitted

```tsx
// ✅ Runtime-computed dimensions / animated styles
<Animated.View style={[styles.bar, { width: progressWidth, opacity: fade }]} />

// ✅ Per-row dynamic color
<View style={[styles.dot, { backgroundColor: user.active ? Colors.green : Colors.iconMuted }]} />

// ❌ Token-expressible value
<View style={{ borderRadius: 14, padding: 16 }} />
//      → use Radius.card, Spacing.s4
```

The rule: **every value that exists as a token MUST come from the token**. Inline is reserved for values the renderer can't know at compile time.

---

## 4. Routing (Expo Router)

### 4.1 Two-layer navigation pattern

```
app/_layout.tsx           ← root Stack (loads fonts, mounts AppProviders, hosts every other layout)
├── (protected)/_layout.tsx   ← Tabs (bottom tab bar) — list-style screens live here
│   ├── users.tsx
│   ├── enrollments.tsx
│   └── enrollments-logs.tsx
└── <module>/_layout.tsx      ← Stack — full-screen forms + detail screens
    ├── add.tsx
    ├── edit.tsx
    ├── [id].tsx
    └── …
```

**Why this split:** screens inside `(protected)` show the bottom tab bar; screens inside a sibling stack like `users/` push **above** the tab bar, hiding it. This matches mobile UX expectations — list screens have global nav, form screens are modal-feeling.

### 4.2 `headerShown: false` everywhere

Every layout sets:
```tsx
<Stack screenOptions={{ headerShown: false }} />
<Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <AppTabBar {...props} />} />
```

The native iOS header draws a hairline divider beneath itself that doesn't match the design system's flowing gradients. Every screen renders its own [`TopBar`](../../../src/components/global/TopBar.tsx) component instead.

### 4.3 Navigation primitives

```tsx
import { router } from 'expo-router';

// Push (back button works)
router.push('/users/add');
router.push({ pathname: '/users/edit', params: { id: String(user.id) } });

// Replace (no history entry)
router.replace('/users');

// Back
router.back();
```

**Don't use** raw `useNavigation` from `@react-navigation/native` — it bypasses Expo Router's typed routes (enabled in `app.json` → `experiments.typedRoutes`).

### 4.4 Reading route params

```tsx
import { useLocalSearchParams } from 'expo-router';

const { id } = useLocalSearchParams<{ id?: string }>();
```

`useLocalSearchParams` is hook-stable across re-renders. Don't read from `router.params`.

---

## 5. Lists — FlatList virtualization

### 5.1 Required props (704+ row case)

```tsx
<Animated.FlatList
  data={filtered}
  keyExtractor={keyExtractor}              // hoisted module const
  renderItem={renderItem}                  // useCallback
  ListEmptyComponent={ListEmpty}           // useMemo
  ListFooterComponent={ListFooter}         // useMemo
  contentContainerStyle={listContentStyle} // useMemo
  showsVerticalScrollIndicator={false}
  removeClippedSubviews
  initialNumToRender={10}
  maxToRenderPerBatch={8}
  windowSize={9}
  refreshing={isFetching && !isLoading}
  onRefresh={refetch}
/>
```

| Prop | Why |
|------|-----|
| `removeClippedSubviews` | Drops off-screen views from the native view hierarchy. |
| `initialNumToRender` | First-paint budget. Aim for 1.5 viewport-fulls. |
| `maxToRenderPerBatch` | Keeps frame budget tight during scroll. |
| `windowSize` | Multiplier on initialNumToRender; 9 = ~9 screens of buffer. |
| `refreshing` + `onRefresh` | Pull-to-refresh. Wire to TanStack Query's `refetch`. |

### 5.2 Don't wrap a list in `ScrollView`

`FlatList` already scrolls. Nesting it inside `ScrollView` defeats virtualization and triggers Reanimated warnings.

### 5.3 Animated headers (collapsing title)

Use `useAnimatedScrollHandler` + `useAnimatedStyle` from Reanimated. Drive `interpolate(scrollY, [0, 60], [LARGE, SMALL])` for fontSize/padding/opacity. Do **not** use `scrollY` from `Animated.event` legacy API — it doesn't drive the UI thread.

---

## 6. Sheets — Modal-based bottom sheets

The codebase uses native `Modal` with `animationType="slide"` for bottom sheets. This is a pragmatic choice over `@gorhom/bottom-sheet` for now: zero extra dependency, native feel, back-button support free.

### 6.1 Pattern

```tsx
<Modal visible={open} transparent animationType="slide" onRequestClose={onClose}>
  <Pressable style={styles.scrim} onPress={onClose}>
    <Pressable style={styles.sheet} onPress={() => {}}>
      {/* sheet content */}
    </Pressable>
  </Pressable>
</Modal>
```

The double `Pressable` lets the user tap the scrim (outside the sheet) to dismiss without dismissing on inside-sheet taps.

### 6.2 Standard sheet anatomy

- Grabber pill (`Colors.grabber`, 38×4, `Radius.pill`) at top center
- Header row (cancel button on left, title centered, action on right) — for filter/multi-step sheets
- Body content
- Pinned footer button (when applicable)

### 6.3 When to use a full-screen route vs a sheet

| Use a sheet for | Use a full screen for |
|----------------|----------------------|
| Quick filter selection | Long forms (Add User, Edit User) |
| FAB action menus | Detail views with tabs |
| Confirmation prompts (≤ 1 button) | Anything that benefits from URL-addressable navigation |
| Single-field input | Anything with multi-step state |

**Heuristic:** if the user might want to share a deep link or navigate back to the same place, use a route. If it's modal-feeling and one-shot, use a sheet.

---

## 7. Swipe actions — Reanimated + GestureHandler

Cards in lists support swipe-left to reveal Edit + Delete buttons. The pattern is documented in [UserCard.tsx](../../../src/components/ui/users/UserCard.tsx).

```tsx
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS } from 'react-native-reanimated';

const tx = useSharedValue(0);
const pan = Gesture.Pan()
  .activeOffsetX([-10, 10])     // require 10px horizontal before activating
  .failOffsetY([-12, 12])       // bail if vertical scroll is intended
  .onUpdate((e) => { tx.value = e.translationX; })
  .onEnd((e) => {
    if (e.translationX < -60) {
      tx.value = withSpring(OPEN_OFFSET);
      runOnJS(onOpen)(item.id);
    } else {
      tx.value = withSpring(0);
    }
  });
```

**Critical:** `activeOffsetX` + `failOffsetY` together prevent the swipe gesture from hijacking the FlatList's vertical scroll. Without them, scrolling the list will trigger card swipes.

`runOnJS` is required when calling JS-side state setters from gesture handlers (which run on the UI thread).

---

## 8. Theming

### 8.1 Token import discipline

Always destructure from the barrel:
```tsx
import { Colors, Fonts, FontSize, LetterSpacing, Radius, Shadow, Spacing } from '@/constants/theme';
```

Never deep-import (`@/constants/theme/colors`). The barrel is the public contract.

### 8.2 No dark mode yet

The web app supports dark mode via a `.dark` class. RN doesn't have CSS class cascade — dark mode here will require a `ThemeProvider` exposing the active palette via context, plus all consumers reading from context instead of static `Colors`. This is **deferred** until light-mode UX is locked.

When dark mode arrives:
- `Colors` becomes `useTheme().colors` (hook-based)
- `StyleSheet.create` blocks become factory functions (`(t) => StyleSheet.create({...}))`)
- Static imports stay for non-themeable values (Spacing, Radius)

### 8.3 Fonts

League Spartan is loaded via `expo-font` from [src/providers/AppProviders.tsx](../../../src/providers/AppProviders.tsx) using the asset map in [src/constants/theme/typography.ts](../../../src/constants/theme/typography.ts). The asset paths and family-name strings are single-sourced — if you add a new weight, add it to `FontFamily` and `FontAssets` in one place.

---

## 9. Mobile-specific component patterns

### 9.1 Replace tables with cards

The web has 14+ data-table screens. Tables are an anti-pattern on mobile — they require horizontal scroll, micro tap targets, and lose vertical density. Every table on web maps to a **card list** on mobile.

Card layout pattern (from [UserCard.tsx](../../../src/components/ui/users/UserCard.tsx)):
- Avatar (44pt) on the left
- Name + role badge on row 1
- Email on row 2 (single-line ellipsis)
- Meta row 3: status dot+text · sync state · #ID · date

Tap the card → full-page detail screen. Swipe-left → Edit + Delete actions. **No inline action icon strips** (web table pattern).

### 9.2 SafeAreaInsets

Every full-screen route reads insets:
```tsx
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const insets = useSafeAreaInsets();
// Apply to top of header: paddingTop: insets.top + 6
// Apply to bottom of pinned button: paddingBottom: Math.max(insets.bottom, 14)
```

Don't hardcode `paddingTop: 47` for the iOS notch — devices vary (Dynamic Island, wide-notch, no-notch).

### 9.3 Status text alongside color

Web uses color alone for status (green dot = active). Mobile **always** pairs color with text — accessibility + colorblind support. See `UserCard`'s status row.

### 9.4 Frosted surfaces (no expo-blur yet)

The design wants frosted-glass top app bar / tab bar / icon buttons. We currently use translucent solid backgrounds (`Colors.frost70/75/85/92/95`) instead of `expo-blur`. Visual ~95% match, zero new dependency. When perf and feel matter (large blurred hero areas), drop in `expo-blur`'s `BlurView` and adjust.

---

## 10. AI agent rules — STRICT MODE

### Rule 1 — Component existence check
Before creating any UI element, search:
- `src/components/global/` (cross-page reusables)
- `src/components/ui/<current-module>/` (module-scoped)

**If found → reuse.** **If not found → proceed.**

### Rule 2 — Zero modification guard
If an existing component needs a change to fit your use case:
- **Do not modify it.**
- State the required modification + reason.
- **Wait for explicit approval.**

### Rule 3 — Placement decision
- Used by 2+ modules → `components/global/` (PascalCase file, add to barrel)
- Used by 1 module → `components/ui/<module>/` (PascalCase file, add to barrel)
- Used in 1 screen, < 30 LOC, never imported by sibling screens → inline as a sub-component in the same file

### Rule 4 — Token enforcement
- **Colors:** every color must come from `Colors`. Hex/rgba literals are forbidden.
- **Fonts:** every `fontFamily` must come from `Fonts` (a.k.a. `FontFamily`).
- **FontSize:** every `fontSize` must come from `FontSize` (the fluid scale).
- **LetterSpacing:** every `letterSpacing` must come from `LetterSpacing`.
- **Radius / Shadow / Spacing:** same rule.
- **Numeric exception:** raw padding/margin/gap pixels are permitted **only** when no `Spacing.sN` token matches the design — flag the exception in a comment.

### Rule 5 — Memoization audit
For every `FlatList`-rendered component:
- `React.memo` wraps the export
- `renderItem` is `useCallback`'d in the parent
- `keyExtractor` is module-level
- `ListEmptyComponent` / `ListFooterComponent` are `useMemo`'d
- Handlers passed to memoized children are `useCallback`'d

### Rule 6 — Validation after change
```bash
npx tsc --noEmit   # zero errors
npm run lint       # zero new warnings
```
Run both after every change. Don't ship if either fails.

---

## 11. Component creation workflow

```
┌────────────────────────────────────────────┐
│ STEP 1 — Search existing components        │
│  global/  →  ui/<module>/                  │
│  Found? Reuse, stop.                       │
└────────────────────────────────────────────┘
              │
              ▼
┌────────────────────────────────────────────┐
│ STEP 2 — Decide placement                  │
│  Cross-module → components/global/         │
│  Single module → components/ui/<module>/   │
│  Single screen → inline                    │
└────────────────────────────────────────────┘
              │
              ▼
┌────────────────────────────────────────────┐
│ STEP 3 — Write the .tsx                    │
│  PascalCase filename                       │
│  Token imports from @/constants/theme      │
│  StyleSheet.create at bottom               │
│  React.memo if FlatList-rendered           │
└────────────────────────────────────────────┘
              │
              ▼
┌────────────────────────────────────────────┐
│ STEP 4 — Add to barrel                     │
│  components/global/index.ts  OR            │
│  components/ui/<module>/index.ts           │
└────────────────────────────────────────────┘
              │
              ▼
┌────────────────────────────────────────────┐
│ STEP 5 — Token audit                       │
│  Zero hardcoded colors                     │
│  Zero bare font sizes                      │
│  Zero ad-hoc shadows                       │
└────────────────────────────────────────────┘
              │
              ▼
┌────────────────────────────────────────────┐
│ STEP 6 — Memo audit (for list items)       │
│  memo + useCallback + useMemo where due    │
└────────────────────────────────────────────┘
              │
              ▼
┌────────────────────────────────────────────┐
│ STEP 7 — Validate                          │
│  npx tsc --noEmit  &&  npm run lint        │
└────────────────────────────────────────────┘
```

---

## Quick reference

```
TOKEN SOURCE:           src/constants/theme/  (mirrors web globals.css)
PRIMARY COLOR:          Colors.mainBlue (#38b6ff)
PRIMARY TEXT:           Colors.text (#2d2d2d)
PRIMARY SURFACE:        Colors.white
PRIMARY BODY FONT SIZE: FontSize.regular18
PRIMARY GAP:            Spacing.s3 (10) / Spacing.s4 (15)
PRIMARY RADIUS:         Radius.card (14)
PRIMARY SHADOW:         Shadow.card
ROUTING:                expo-router (router.push, useLocalSearchParams)
HEADERS:                custom <TopBar/>; never enable Stack/Tabs native header
LISTS:                  Animated.FlatList + memo + useCallback renderItem
SHEETS:                 Modal + slide animation + scrim Pressable
SWIPE ACTIONS:          Gesture.Pan + Reanimated useSharedValue + runOnJS
INSETS:                 useSafeAreaInsets (never hardcode notch)
STATE — server:         TanStack Query (hooks/modules/<module>/)
STATE — client:         useState (Redux deferred until cross-screen need)
TOKEN AUDIT (run):      grep -rn 'fontSize:\s*[0-9]\|#[0-9a-fA-F]\{3,8\}\|rgba(' src/
```
