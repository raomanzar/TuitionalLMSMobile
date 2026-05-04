---
name: lms-mobile-ui-testing
description: >
  Structural and functional UI quality audit for the Tuitional LMS Mobile app
  (Expo SDK 54 + React Native 0.81 + Expo Router 6 + StyleSheet + League Spartan
  via expo-font). Trigger when the user asks to check, audit, review, or fix UI
  issues — layout bugs, responsive scaling across phones/tablets, FlatList
  virtualization, swipe gestures, sheet/modal behavior, safe-area handling,
  keyboard avoidance, accessibility basics, or "something looks off". Also
  trigger when the user shares a component / screen file for review.
  **Do not** suggest color, spacing, font-family, radius, or shadow changes —
  those belong to the design system (see `lms-mobile-ui-pipeline` skill). For
  deep performance profiling (Hermes, Reanimated worklets, render budgets, CI
  flashlight gates) defer to `lms-mobile-performance`. For authentication,
  token storage, deep-link safety, certificate pinning, or any security review
  defer to `lms-mobile-security`.
---

# UI QA — Mobile Audit Protocol (Tuitional LMS Mobile)

Full-stack mobile UI audit protocol for the Tuitional LMS Mobile app.
**Stack:** Expo SDK 54 + React Native 0.81 + React 19.1 + Expo Router 6 + TypeScript 5.9.
**Styling:** `StyleSheet.create` only — no CSS, no SCSS, no styled-components, no NativeWind, no Tailwind.
**Tokens:** JS-based design tokens in [src/constants/theme/](../../../src/constants/theme/) (mirrors web's `globals.css`).
**Font:** League Spartan (six weights) loaded via `expo-font` from [src/providers/AppProviders.tsx](../../../src/providers/AppProviders.tsx).
**Target platforms:** iOS 15.1+ (iPhone + iPad) and Android 7.0+ (phones + tablets).

> **Scope of this skill:** Identify and fix functional, structural, and standards-compliance issues only. Do NOT suggest changes to colors, fonts, spacing scale, radii, or shadows — those are governed by the `lms-mobile-ui-pipeline` skill.

---

## How to Use This Skill

When the user asks for a UI check or shares code:

1. Identify the **scope** (single component, full screen, full module).
2. Run through the relevant checklist sections below.
3. Report issues using the **structured output format** at the end.
4. Provide code fixes inline — never just describe the problem.
5. Fix only what is broken — do not alter design choices that are functioning correctly.
6. When in doubt about a design token value, defer to the `lms-mobile-ui-pipeline` skill.

---

## 1. Responsive Audit (phone → tablet)

The app is **phone-first** with fluid clamp-based typography from [typography.ts](../../../src/constants/theme/typography.ts). There is no media-query system — sizing scales via `FontSize` (port of web's `clamp()` bound to `Dimensions.get('window').width`) and `useWindowDimensions()` hook for runtime layout.

### Canonical width buckets

| Bucket          | Range            | Examples                                    |
| --------------- | ---------------- | ------------------------------------------- |
| **Compact**     | 320–399px        | iPhone SE 1st gen, very small Android       |
| **Standard**    | 400–479px        | iPhone 14, iPhone 15, Pixel 7               |
| **Large phone** | 480–599px        | iPhone 14 Pro Max, Galaxy S23 Ultra         |
| **Small tablet**| 600–767px        | iPad Mini portrait, small Android tablets   |
| **Tablet**      | 768–1023px       | iPad portrait, most Android tablets         |
| **Large tablet**| 1024px+          | iPad landscape, iPad Pro                    |

### Checks

- [ ] No horizontal scroll on the document at any width (page-level horizontal scroll is forbidden — see §4)
- [ ] No content clipped or inaccessible at 320px width
- [ ] Layout adapts where it should — multi-column rows collapse on compact widths via `flexWrap` or width-conditional render
- [ ] No fixed pixel widths that exceed the smallest viewport (e.g., `width: 360` on a screen that must render at 320)
- [ ] `useWindowDimensions()` is used for runtime layout decisions — **not** `Dimensions.get('window')` inside render bodies (stale on rotate)
- [ ] Tablet breakpoint (≥ 768px) considered for two-column layouts where appropriate
- [ ] Orientation changes don't break layout (portrait ↔ landscape)
- [ ] Font sizes come from `FontSize` tokens (which already scale from phone → tablet) — no bare `fontSize: 14`

```tsx
// ✅ Correct — runtime layout reactive to rotate
import { useWindowDimensions } from 'react-native';
const { width } = useWindowDimensions();
const isTablet = width >= 768;

// ❌ Wrong — captured at module load, won't react to rotation
import { Dimensions } from 'react-native';
const isTablet = Dimensions.get('window').width >= 768;
```

---

## 2. Navigation Shell Checks

The app uses **Expo Router 6** (file-based routing under `src/app/`) with `headerShown: false` everywhere. Each screen renders its own [TopBar](../../../src/components/global/TopBar.tsx). Bottom tabs are rendered via custom [AppTabBar](../../../src/components/global/AppTabBar.tsx).

- [ ] Every layout sets `screenOptions={{ headerShown: false }}` — **never** re-enable the native header (introduces a hairline divider that breaks the design)
- [ ] Navigation uses `router` from `expo-router` — **not** raw `useNavigation` from `@react-navigation/native` (bypasses typed routes)
- [ ] Back button on Android (hardware + gesture) works on every screen — `router.back()` falls through correctly, no dead-ends
- [ ] iOS swipe-back gesture works on stack screens (not blocked by full-screen `GestureDetector`)
- [ ] Bottom tab bar hides on full-screen module routes (forms, detail screens) — confirm those routes live as **siblings** of `(protected)/`, not children
- [ ] Tab icons meet ≥ 44×44pt touch target
- [ ] Active-tab indication is unambiguous (color + icon weight, not color alone)
- [ ] Deep links resolve to the correct screen (test with `npx uri-scheme open <url> --ios` if relevant)
- [ ] Route params are read via `useLocalSearchParams` — **not** `router.params`
- [ ] No layout shift when navigating between screens (consistent `TopBar` height + safe-area)

```tsx
// ✅ Correct — typed routes via expo-router
import { router } from 'expo-router';
router.push({ pathname: '/users/edit', params: { id: String(user.id) } });

// ❌ Wrong — bypasses Expo Router contract
import { useNavigation } from '@react-navigation/native';
```

---

## 3. Typography & Text Overflow

QA checks only — do not alter font choices, sizes, weights, or colors.

- [ ] Every `fontFamily` references a `Fonts.*` / `FontFamily.*` token (six League Spartan weights) — no bare `'System'`, no bare `'LeagueSpartan-Bold'` string
- [ ] Every `fontSize` references a `FontSize.*` token (the fluid scale) — no bare px, no inline magic numbers
- [ ] Every `letterSpacing` references a `LetterSpacing.*` token
- [ ] Where appropriate, components use the pre-baked `TextStyles.h1` / `TextStyles.body` / etc. instead of re-assembling from atoms
- [ ] Long text uses `numberOfLines={n}` + `ellipsizeMode="tail"` to prevent overflow on compact widths
- [ ] Multi-line text doesn't get cut mid-glyph — verify `lineHeight` is set (RN doesn't infer it from `fontSize`)
- [ ] Text with `flex: 1` parent has `minWidth: 0` siblings or uses `flexShrink: 1` correctly to truncate
- [ ] No `fontWeight: 'bold'` — use the explicit `Fonts.semibold` / `Fonts.bold` family instead (RN's font-weight mapping is unreliable across Android)
- [ ] Custom fonts loaded via `expo-font` in [AppProviders](../../../src/providers/AppProviders.tsx) — **not** baked into native projects, **not** loaded with `@expo-google-fonts/*`

```tsx
// ✅ Correct
<Text style={{ fontFamily: Fonts.semibold, fontSize: FontSize.regular18 }} numberOfLines={1}>
  {user.name}
</Text>

// ❌ Wrong — fontWeight unreliable on Android with custom fonts
<Text style={{ fontFamily: 'LeagueSpartan-Regular', fontWeight: 'bold' }}>
```

---

## 4. Layout & Scroll Context — Project-Critical

React Native does not have a document scroll. The root view is a fixed viewport; scrollable regions must be explicit.

- [ ] No `<View>` is given content taller than the screen without an explicit scroll wrapper (`ScrollView`, `FlatList`, `SectionList`)
- [ ] **Never nest `FlatList` inside `ScrollView`** — defeats virtualization, triggers Reanimated warnings, and breaks performance on 700+ row lists
- [ ] `KeyboardAvoidingView` wraps screens with text inputs — `behavior="padding"` on iOS, `behavior="height"` on Android
- [ ] Long forms use `ScrollView` with `keyboardShouldPersistTaps="handled"` so taps on buttons don't dismiss the keyboard
- [ ] No fixed-height container that would clip on a 320px-wide / 568px-tall device (iPhone SE 1st gen)
- [ ] Modals / sheets use `transparent` + `animationType="slide"` — see §6
- [ ] No `position: absolute` element relies on `top: 0` without accounting for the status bar / safe area — see §10
- [ ] Pull-to-refresh wired via `RefreshControl` or `FlatList`'s `refreshing` + `onRefresh` props
- [ ] No `onPress` lives on a `View` — use `Pressable` (or `TouchableOpacity` only in legacy code)
- [ ] `Pressable` provides visual feedback — `({ pressed }) => [...]` style, or `android_ripple={{ color: ... }}` on Android

```tsx
// ✅ Correct — keyboard-aware form
<KeyboardAvoidingView
  style={{ flex: 1 }}
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  keyboardVerticalOffset={insets.top}
>
  <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 80 }}>
    {/* fields */}
  </ScrollView>
</KeyboardAvoidingView>
```

---

## 5. Image & Media Checks

- [ ] All images use `expo-image`'s `<Image>` (or RN `<Image>` when `expo-image` is unavailable in the file) — never bare `<img>` (HTML, never valid in RN)
- [ ] Network images (avatars, hero images) prefer `expo-image` for built-in caching + faster decode
- [ ] Every image has explicit `width` + `height` — or a parent with explicit dimensions when `style={{ flex: 1 }}` is used
- [ ] `contentFit` (expo-image) / `resizeMode` (RN Image) is set explicitly — `cover` / `contain` / `center`
- [ ] Avatar fallbacks (initials) render when `source.uri` is null/empty — check [Avatar.tsx](../../../src/components/global/Avatar.tsx) is used
- [ ] No inline `Image` of an SVG file — use `react-native-svg` `<SvgUri>` or `@expo/vector-icons` instead
- [ ] Local PNGs are sized appropriately (1x / 2x / 3x in `assets/`) — RN's `require()` picks the right density automatically
- [ ] `placeholder` is set on `expo-image` for slow networks
- [ ] Decorative images have `accessible={false}`; informational images have `accessibilityLabel`

```tsx
// ✅ Correct — expo-image with placeholder + cache
import { Image } from 'expo-image';
<Image
  source={{ uri: user.avatarUrl }}
  contentFit="cover"
  style={{ width: 44, height: 44, borderRadius: Radius.full }}
  placeholder={blurhash}
  transition={150}
/>
```

---

## 6. Forms & Interactive Elements

- [ ] Every input meets the **44×44pt** Apple HIG / **48dp** Material minimum touch target
- [ ] Reuse [TextField](../../../src/components/global/TextField.tsx) / [Field](../../../src/components/global/Field.tsx) / [SelectLook](../../../src/components/global/SelectLook.tsx) / [PrimaryButton](../../../src/components/global/PrimaryButton.tsx) — **do not** inline raw `TextInput`s in screens
- [ ] `TextInput` has `keyboardType` set when appropriate (`email-address`, `numeric`, `phone-pad`)
- [ ] `autoCapitalize="none"` on email / username fields
- [ ] `autoComplete` + `textContentType` set so iOS/Android autofill works (saves password, address, OTP)
- [ ] `returnKeyType` set per field (`next` for non-final, `done` / `send` for final)
- [ ] `onSubmitEditing` chains focus to the next field via `ref.current?.focus()` — multi-field forms feel janky without this
- [ ] Submit button is **not** obscured by the keyboard — verify with the iOS keyboard open at 320×568 (SE 1st gen)
- [ ] Error states reserve vertical space — never let an error message push the form down on appearance (use absolute-positioned helper text or a fixed-height error slot)
- [ ] Controlled inputs don't reset when keyboard opens/closes — state lives outside the keyboard listener
- [ ] No `secureTextEntry` field is missing the show/hide toggle — single-field reveal is mandatory on long passwords
- [ ] `onPress` handlers on screen-level buttons are wrapped in `useCallback` so memoized children don't re-render

```tsx
// ✅ Correct — chained focus + iOS autofill
const passwordRef = useRef<TextInput>(null);
<TextField
  label="Email"
  keyboardType="email-address"
  autoCapitalize="none"
  autoComplete="email"
  textContentType="emailAddress"
  returnKeyType="next"
  onSubmitEditing={() => passwordRef.current?.focus()}
/>
<TextField ref={passwordRef} label="Password" secureTextEntry returnKeyType="done" />
```

---

## 7. FlatList & Virtualization Checks

The Users module renders 700+ rows. List performance is a first-order concern.

- [ ] `data` is passed a stable reference — `useMemo` the filtered/sorted result
- [ ] `keyExtractor` is **module-level** when the key derives only from item props
- [ ] `renderItem` is wrapped in `useCallback` with the right deps (don't include the entire `data` array)
- [ ] List items are wrapped in `React.memo` — see [UserCard.tsx](../../../src/components/ui/users/UserCard.tsx)
- [ ] `ListEmptyComponent` / `ListFooterComponent` are `useMemo`'d (otherwise the list re-mounts them on every render)
- [ ] `removeClippedSubviews` is set on long lists
- [ ] `initialNumToRender` ≈ 1.5× viewport-fulls (default 10 is fine for cards)
- [ ] `maxToRenderPerBatch={8}` and `windowSize={9}` for 500+ row lists
- [ ] `getItemLayout` provided when row height is constant — unlocks instant scroll-to-index
- [ ] Pull-to-refresh wired (`refreshing` + `onRefresh` against TanStack Query's `refetch`)
- [ ] `onEndReached` + `onEndReachedThreshold` for infinite scroll — confirm the loader doesn't flicker on every render
- [ ] No `style={{ flex: 1 }}` parent with no explicit height — list content collapses to 0 height on Android

```tsx
// ✅ Correct — module-level keyExtractor, memoized renderItem
const keyExtractor = (u: User) => String(u.id);

function UsersScreen() {
  const renderItem = useCallback<ListRenderItem<User>>(
    ({ item }) => <UserCard user={item} onPress={handlePress} />,
    [handlePress]
  );
  return (
    <FlatList
      data={filtered}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      removeClippedSubviews
      initialNumToRender={10}
      maxToRenderPerBatch={8}
      windowSize={9}
    />
  );
}
```

---

## 8. Sheets, Modals & Gestures

- [ ] Bottom sheets use the project's pattern: `<Modal transparent animationType="slide" onRequestClose={onClose}>` with double `Pressable` (scrim + sheet body) — **not** `@gorhom/bottom-sheet` unless the user requests it
- [ ] `onRequestClose` is wired on every `Modal` (Android hardware back must dismiss)
- [ ] Sheet has a grabber pill at top center (38×4, `Colors.grabber`, `Radius.pill`)
- [ ] Sheet does not exceed `90%` of screen height — leave room for status bar
- [ ] Swipe-to-dismiss works (or scrim-tap dismiss) — and outside-tap doesn't dismiss accidentally during inside-content interaction
- [ ] Long sheets internally scroll — `ScrollView` inside the sheet body, not the whole sheet flexing past viewport
- [ ] Swipe gestures on cards (Edit / Delete reveal) use `Gesture.Pan` with **`activeOffsetX([-10, 10])` + `failOffsetY([-12, 12])`** — without these, vertical scroll triggers card swipes
- [ ] `runOnJS` wraps any JS-side state setter called from gesture worklets
- [ ] Spring animations use `withSpring` (not `withTiming` for snap-back) for tactile feel
- [ ] Sheet doesn't trap focus from VoiceOver / TalkBack — verify accessibility traversal
- [ ] On Android, status bar color stays correct while sheet is open (`StatusBar` component or `setStatusBarBackgroundColor`)

```tsx
// ✅ Correct — gesture coexists with FlatList vertical scroll
const pan = Gesture.Pan()
  .activeOffsetX([-10, 10])    // require horizontal intent
  .failOffsetY([-12, 12])      // bail on vertical
  .onUpdate((e) => { tx.value = e.translationX; })
  .onEnd((e) => {
    if (e.translationX < -60) tx.value = withSpring(OPEN);
    else tx.value = withSpring(0);
  });
```

---

## 9. iOS-Specific Checks

- [ ] No hardcoded `paddingTop: 47` for the notch — use `useSafeAreaInsets()` from `react-native-safe-area-context`
- [ ] Status bar style toggles correctly per screen (`<StatusBar style="light" />` from `expo-status-bar`)
- [ ] No `100%` height assumption — RN doesn't have viewport-height units; use `flex: 1` chains instead
- [ ] Safe-area is respected on screens with bottom-pinned buttons — `paddingBottom: Math.max(insets.bottom, 14)`
- [ ] iOS swipe-back gesture isn't blocked by full-screen `GestureDetector` overlays
- [ ] Dynamic Island / Wide Notch / no-notch all render correctly — test on iPhone 15 Pro (DI), iPhone 14 (notch), iPhone SE 3rd gen (no notch)
- [ ] iPad rendering works — orientation changes, split-view (if supported), no fixed-width layouts that look stranded at 768px+
- [ ] No `KeyboardAvoidingView behavior="height"` on iOS — use `padding` (height behavior glitches on iOS)
- [ ] Haptics on key actions (`expo-haptics`) — confirm/cancel, swipe-action commit, etc.

---

## 10. Android-Specific Checks

- [ ] Status bar color matches the screen background — `<StatusBar backgroundColor={...} />` or `expo-status-bar`
- [ ] Soft navigation bar (gesture / 3-button) doesn't overlap pinned bottom buttons — use `useSafeAreaInsets().bottom`
- [ ] Hardware back button works on every screen — `BackHandler` listener for non-default behavior
- [ ] `KeyboardAvoidingView behavior="height"` on Android (or `padding` works, but verify per screen)
- [ ] `android_ripple` on `Pressable` — Android users expect Material ripple feedback
- [ ] Text doesn't clip on Android with custom fonts — add `includeFontPadding: false` + explicit `lineHeight` (Android adds extra padding on custom fonts)
- [ ] Elevation-based shadows show correctly — Android uses `elevation`, iOS uses `shadowColor/Offset/Opacity/Radius`. The `Shadow.card` token must include both
- [ ] Modal `onRequestClose` handles the hardware back button (Android-only requirement)
- [ ] Edge-to-edge handling — `<StatusBar translucent />` requires `paddingTop: insets.top` everywhere
- [ ] No `position: 'fixed'` (CSS-only, ignored on RN) — use `position: 'absolute'` inside a `flex: 1` parent

---

## 11. Accessibility — Structural & Functional (Not Design)

QA checks only — do not alter colors or font sizes to meet contrast. Flag contrast failures as issues for the design owner.

- [ ] Every `Pressable` / `TouchableOpacity` has `accessibilityRole` set (`'button'`, `'link'`, `'tab'`, `'switch'`, etc.)
- [ ] Every interactive element has `accessibilityLabel` — VoiceOver / TalkBack reads the label, not the visible text alone
- [ ] State is exposed via `accessibilityState={{ selected, disabled, checked, expanded }}` — not via icon/color alone
- [ ] Form inputs have an associated label (visible label text passed as `accessibilityLabel`)
- [ ] Decorative images / icons have `accessible={false}` — screen readers should skip them
- [ ] Focus order is logical when keyboard / external switch is connected — `accessibilityElementsHidden={true}` on overlay backdrops
- [ ] Touch targets ≥ 44×44pt (iOS) / 48dp (Android) — flag any `Pressable` smaller than this
- [ ] Text scales when the user enables Dynamic Type / Font scaling — confirm with iOS Settings > Accessibility > Display & Text Size > Larger Text. `allowFontScaling={false}` is forbidden except on monospace numerals (timers, counters)
- [ ] Color is never the only state indicator — pair with text or icon (see `UserCard`'s "Active" dot + word)
- [ ] `accessibilityLiveRegion` (Android) / `accessibilityAnnouncement` (iOS) used for async results (success toast, validation error)
- [ ] `Modal` traps focus correctly — sheet content is announced, scrim is silent

```tsx
// ✅ Correct — full a11y on a tappable card
<Pressable
  onPress={onPress}
  accessibilityRole="button"
  accessibilityLabel={`Open ${user.first} ${user.last}'s profile`}
  accessibilityState={{ disabled: !user.active }}
  hitSlop={8}
>
  <UserCard user={user} />
</Pressable>
```

---

## 12. Performance — Surface Checks Only

This section is a **surface-level smoke screen** during a UI audit. For real performance work — profiling, Hermes sampling, FlatList tuning, bundle/budget gates, perceived-perf via TanStack Query placeholders, Reanimated worklet correctness — load the **`lms-mobile-performance`** skill.

- [ ] No `console.log` / debug code in screen / component files (service layer exempt)
- [ ] All exported list-item components are wrapped in `memo()`
- [ ] Event handlers passed to memoized children use `useCallback`
- [ ] Computed objects passed as props use `useMemo`
- [ ] **Never** fetch in `useEffect` — server state belongs in TanStack Query (see `lms-mobile-api-integration` skill)
- [ ] No raw `axios` / `fetch` calls inside components — go through `src/services/apis/<module>/` + TanStack Query hooks
- [ ] No anonymous arrow function as `renderItem` / `keyExtractor` — both hoisted
- [ ] Reanimated worklets are explicit (`'worklet'` directive); JS-side state setters are wrapped in `runOnJS`
- [ ] Animated styles use `useAnimatedStyle` (not legacy `Animated.event`)
- [ ] Images on long lists use `expo-image` for caching

> Anything beyond this list — measurements, budgets, profiling harnesses, render counts — is `lms-mobile-performance` territory. Do not duplicate that depth here.

---

## 13. App Store / Play Store metadata (when shipping)

Replaces web's SEO. Review only when the user is preparing a release.

- [ ] `app.json` has correct `name`, `slug`, `version`, `runtimeVersion`
- [ ] iOS `bundleIdentifier` and Android `package` are correct and stable
- [ ] App icon and splash screen present at all required densities (`assets/`)
- [ ] iOS `infoPlist.NSCameraUsageDescription` / equivalent permission strings are user-readable (not "needed")
- [ ] Android `permissions` list contains only what the app actually uses
- [ ] EAS build profiles in [eas.json](../../../eas.json) have `development` / `preview` / `production` correctly scoped
- [ ] Deep-link URI scheme registered in `app.json` if the app handles links
- [ ] Universal links / app links configured if applicable

> Note: Most of this is governed by `app.json` and `eas.json` — flag mismatches but do not edit unless the user explicitly asks.

---

## 14. Structured Issue Report Format

Always report findings using this format. Do not include suggestions to change design decisions.

```
## UI QA Report — [Component or Screen Name]

### Critical (breaks layout or functionality)
- [iOS @ 320] Submit button hidden behind keyboard → Fix: wrap form in KeyboardAvoidingView with behavior="padding"
- [ALL] FlatList nested inside ScrollView → Fix: remove outer ScrollView, use ListHeaderComponent for the header content
- [ALL] Card swipe gesture hijacks vertical list scroll → Fix: add activeOffsetX([-10, 10]) + failOffsetY([-12, 12]) to Gesture.Pan

### Warning (degrades experience or standards)
- [iOS] Hardcoded paddingTop: 47 for notch → Fix: useSafeAreaInsets().top
- [ANDROID] Modal missing onRequestClose → Fix: pass onClose to onRequestClose so hardware back dismisses
- [PERF] renderItem is anonymous arrow → Fix: useCallback + hoisted keyExtractor
- [A11Y] Avatar Pressable missing accessibilityLabel → Fix: pass `${user.first} ${user.last}'s profile`

### Minor (best practice / standards)
- [PROJECT] Inline TextInput in screen → Fix: use TextField from src/components/global/
- [PROJECT] Magic number padding: 12 → Fix: use Spacing.s3
- [PROJECT] Bare fontSize: 14 → Fix: use FontSize.regular14
- [PROJECT] Image source is `<Image>` (RN) → Fix: prefer expo-image's <Image> for caching

### Passing
- All tokens come from @/constants/theme
- FlatList renderItem and keyExtractor are properly memoized
- KeyboardAvoidingView wired on form screens
- TopBar renders on every screen (no native header leakage)
```

> **Rule for Claude:** When reporting issues, fix only structural or functional problems. Never change colors, font choices, font sizes, spacing-grid values, border radii, or any other visual design value. If a design value appears to violate an accessibility standard (e.g., contrast), flag it and leave the fix to the design owner.

---

## Quick reference — what to grep for

```bash
# Hardcoded colors (any hex / rgba in a style block)
grep -rn -E '#[0-9a-fA-F]{3,8}|rgba?\(' src/components src/app

# Bare font sizes
grep -rn -E 'fontSize:\s*[0-9]' src/components src/app

# Bare font weights (should be a Fonts.* family instead)
grep -rn "fontWeight:" src/components src/app

# Inline TextInput (should use TextField wrapper)
grep -rn "<TextInput" src/app

# Native header leakage (should be false everywhere)
grep -rn "headerShown" src/app

# FlatList without keyExtractor (perf risk)
grep -rn "FlatList" src/components src/app | grep -v keyExtractor

# Hardcoded notch padding
grep -rn -E "paddingTop:\s*(44|47|48|50)" src/

# Raw axios/fetch in components (should be in services)
grep -rn -E "axios\.|fetch\(" src/components src/app
```
