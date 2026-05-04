# Tuitional LMS Mobile — Design Tokens

**Version:** 1.0.0 | **Mirrors:** web `colors_and_type.css`
**Single source:** [src/constants/theme/](../../../src/constants/theme/) — modular re-exports, all tokens.

This file enumerates every token. The web has CSS custom properties under `:root`; mobile has TypeScript constants. Names map 1:1 — the same brand decision made for the web propagates to mobile by editing both files together.

---

## 1. Imports

Always import from the barrel:

```ts
import {
  Colors,
  Fonts,         // a.k.a. FontFamily
  FontFamily,
  FontRole,
  FontSize,
  LetterSpacing,
  TextStyles,
  Radius,
  Spacing,
  Control,
  Shadow,
  Gradients,
} from '@/constants/theme';
```

The barrel is [src/constants/theme/index.ts](../../../src/constants/theme/index.ts). Per-token modules:

| Module | Exports |
|--------|---------|
| `colors.ts` | `Colors` (full palette) |
| `typography.ts` | `FontFamily`, `Fonts` (alias), `FontRole`, `FontSize`, `LetterSpacing`, `TextStyles`, `FontAssets` |
| `radius.ts` | `Radius` |
| `spacing.ts` | `Spacing`, `Control` |
| `shadows.ts` | `Shadow`, `InnerShadowToken` |
| `gradients.ts` | `Gradients` |

---

## 2. Colors

### 2.1 Brand / primary

| Token | Value | Use |
|-------|-------|-----|
| `Colors.mainBlue` | `#38b6ff` | Primary brand — buttons, links, active states |
| `Colors.blue1` | `#afe2ff` | Card header accent / soft brand |
| `Colors.blue2` | `#048cdb` | Pressed / emphasized brand |
| `Colors.blue3` | `#004687` | Deep brand — hero accents |
| `Colors.blue4` | `#c7eaff` | Gradient ends, soft fills |
| `Colors.blue5` | `#e4f5ff` | Subtle surface tint |

### 2.2 Surfaces

| Token | Value | Use |
|-------|-------|-----|
| `Colors.white` | `#ffffff` | Card backgrounds, inputs |
| `Colors.surfaceTint` | `#ecf8ff` | Page wash, modal background |
| `Colors.cardBg` | `#f1faff` | Card interior |
| `Colors.cardHeader` | `#afe2ff` | Card header band |
| `Colors.iconBoxFrost` | `rgba(255,255,255,0.5)` | Frosted icon tile background |

### 2.3 Text

| Token | Value | Use |
|-------|-------|-----|
| `Colors.text` | `#2d2d2d` | Primary text |
| `Colors.textSecondary` | `#666666` | Strong secondary |
| `Colors.textMuted` | `#8d8d8d` | Placeholders, subtle labels |
| `Colors.textTertiary` | `#565656` | Section subtitles |
| `Colors.iconStrong` | `#444444` | Filled icons |
| `Colors.iconMuted` | `#9b9b9b` | Outline icons / inactive states |

### 2.4 Borders / dividers

| Token | Value | Use |
|-------|-------|-----|
| `Colors.border` | `#ebebeb` | Standard border |
| `Colors.borderDash` | `#ebebeb` | Dashed dividers |
| `Colors.borderSidebar` | `#a0afb8` | Strong divider |
| `Colors.borderSoft` | `rgba(0,0,0,0.06)` | Subtle hairline |
| `Colors.borderRow` | `rgba(0,0,0,0.05)` | Row separators in cards |

### 2.5 Status palettes

#### Green (success / active / synced)

`green`, `greenText`, `greenBg`, `greenTextDark`, plus indexed variants `greenText1..3`, `greenBg1..6` for each card style.

#### Red (error / inactive / unsynced)

`red`, `red1` (`#d32121`), `red2` (`#653838`), `redText`, `redBg`, plus `redText1..2`, `redBg1..2`.

#### Purple (teacher / specialty)

`purpleText`, `purpleBg`.

#### Orange (warning)

`orange`, `orangeText`, `orangeBg`.

#### Info blue

`infoText`, `infoBg`.

### 2.6 Frosted surfaces (mobile-only)

Translucent white tints used for app bar, tab bar, icon buttons, frosted tiles.

| Token | Value | Use |
|-------|-------|-----|
| `Colors.frost95` | `rgba(255,255,255,0.95)` | Tab bar / pinned bars |
| `Colors.frost92` | `rgba(236,248,255,0.92)` | Top app bar background |
| `Colors.frost85` | `rgba(255,255,255,0.85)` | Icon button background |
| `Colors.frost75` | `rgba(255,255,255,0.75)` | Frosted tiles |
| `Colors.frost70` | `rgba(255,255,255,0.7)` | Role chips (off state) |
| `Colors.frost50` | `rgba(255,255,255,0.5)` | Alias of `iconBoxFrost` |

### 2.7 Dim / overlay

| Token | Value | Use |
|-------|-------|-----|
| `Colors.dim08` | `rgba(0,0,0,0.08)` | Hairline borders, ghost button bg |
| `Colors.dim10` | `rgba(0,0,0,0.1)` | Chip outlines |
| `Colors.grabber` | `rgba(0,0,0,0.18)` | Bottom-sheet grabber pill |
| `Colors.scrim` | `rgba(0,0,0,0.45)` | Modal scrim |
| `Colors.scrimLight` | `rgba(0,0,0,0.4)` | Lighter modal scrim |

### 2.8 Decorative washes (page-level)

| Token | Value | Use |
|-------|-------|-----|
| `Colors.wash1` | `rgba(175,226,255,0.55)` | Top-right brand blob |
| `Colors.wash2` | `rgba(175,226,255,0.25)` | Mid-left brand blob |

---

## 3. Typography

### 3.1 FontFamily / Fonts

Six League Spartan weights — loaded via `expo-font` from [src/providers/AppProviders.tsx](../../../src/providers/AppProviders.tsx).

| Token | Family | Weight |
|-------|--------|--------|
| `Fonts.thin` | LeagueSpartan-Thin | 100 |
| `Fonts.light` | LeagueSpartan-Light | 300 |
| `Fonts.regular` | LeagueSpartan-Regular | 400 |
| `Fonts.medium` | LeagueSpartan-Medium | 500 |
| `Fonts.semibold` | LeagueSpartan-SemiBold | 600 |
| `Fonts.bold` | LeagueSpartan-Bold | 700 |

`Fonts` is an alias for `FontFamily`. New code may use either.

### 3.2 FontRole — semantic roles

```ts
FontRole.display = Fonts.bold      // 22–28 (h1)
FontRole.heading = Fonts.semibold  // 16–22 (h2/h3/h4)
FontRole.body    = Fonts.medium    // 14–16 (default body)
FontRole.bodyAlt = Fonts.regular   // 14–16 (table cells)
FontRole.caption = Fonts.light     // 12 (small labels)
```

### 3.3 FontSize — fluid scale (port of CSS `clamp()`)

Each token resolves at module load via `Dimensions.get('window').width`. Phones (~375px) land near `min`; tablets (~768px+) scale toward `max`.

| Token | min → max | Web equivalent | Use |
|-------|-----------|----------------|-----|
| `FontSize.regular14` | 10 → 14 | `--regular14-` | Micro labels, badge text, caption |
| `FontSize.regular16` | 12 → 16 | `--regular16-` | Footnotes, secondary body |
| `FontSize.regular18` | 14 → 18 | `--regular18-` | **Default body, buttons** |
| `FontSize.regular20` | 16 → 20 | `--regular20-` | Card titles |
| `FontSize.regular22` | 18 → 22 | `--regular22-` | Section headings |
| `FontSize.medium24` | 20 → 24 | `--medium24-` | Sheet titles |
| `FontSize.medium26` | 22 → 26 | `--medium26-` | Sub-headings |
| `FontSize.medium28` | 24 → 28 | `--medium28-` | Page sub-headings |
| `FontSize.medium30` | 26 → 30 | `--medium30-` | **Page titles (large)** |
| `FontSize.large32..38` | 28..34 → 32..38 | `--large32..38-` | Large display |
| `FontSize.xLarge40..46` | 36..42 → 40..46 | `--xLarge40..46-` | Hero |
| `FontSize.xxLarge48..52` | 44..50 → 48..52 | `--xxLarge48..52-` | Splash |

**Rule:** every `fontSize:` in `StyleSheet.create` MUST come from this scale. Bare numbers (`fontSize: 14`) are forbidden in committed code.

### 3.4 LetterSpacing

| Token | Value | Use |
|-------|-------|-----|
| `LetterSpacing.tight` | `0.4` | Names, dense rows |
| `LetterSpacing.normal` | `0.5` | Default for most text |
| `LetterSpacing.wide` | `0.6` | Labels, action text |
| `LetterSpacing.body` | `0.8` | Web global default — match for body text |
| `LetterSpacing.display` | `1` | Page titles |

### 3.5 TextStyles — semantic pre-baked

```ts
TextStyles.h1       // bold + regular22 + LetterSpacing.display
TextStyles.h2       // semibold + regular22
TextStyles.h3       // semibold + regular20
TextStyles.h4       // semibold + regular18
TextStyles.body     // medium + regular18 + LetterSpacing.body + lineHeight
TextStyles.bodyAlt  // regular + regular18
TextStyles.caption  // light + regular16 + textMuted
```

Use these for one-off `<Text style={TextStyles.h2}>` rather than reinventing fontFamily + size + letterSpacing.

---

## 4. Spacing

5px base grid (matches web).

| Token | Value | Use |
|-------|-------|-----|
| `Spacing.s1` | `4` | Required asterisk margin, micro |
| `Spacing.s2` | `7.5` | Text-adjacent spacing |
| `Spacing.s3` | `10` | **Default gap** between elements |
| `Spacing.s4` | `15` | **Screen / card padding** |
| `Spacing.s5` | `20` | Large section gap |
| `Spacing.s6` | `30` | Generous section spacing |

**Rule:** prefer `Spacing.sN` over raw numbers. Adjacent values like `Spacing.s4 + 1` are acceptable when the design is 16 (one off from 15).

---

## 5. Radius

| Token | Value | Use |
|-------|-------|-----|
| `Radius.pill` | `999` | Chips, pills, role tabs |
| `Radius.card` | `14` | **Default card** (mobile is slightly larger than web's 12) |
| `Radius.cardWeb` | `12` | Use only when matching web exactly |
| `Radius.control` | `10` | Buttons, inputs |
| `Radius.tile` | `10` | Action tiles |
| `Radius.chip` | `6` | Small badges |
| `Radius.sheet` | `26` | Bottom-sheet top corners |

---

## 6. Shadow

| Token | iOS / Android | Use |
|-------|--------------|-----|
| `Shadow.card` | `0 0 7 rgba(0,0,0,0.08)` / elevation 2 | Card float |
| `Shadow.input` | `0 1 4 rgba(0,0,0,0.08)` / elevation 1 | Input resting |
| `Shadow.control` | `0 1 3 rgba(0,0,0,0.05)` / elevation 1 | Small buttons |
| `Shadow.fab` | `mainBlue 0 8 22 0.45` / elevation 10 | FAB (brand-tinted) |
| `Shadow.sheet` | `0 10 40 rgba(0,0,0,0.18)` / elevation 12 | Floating bottom sheet |

`InnerShadowToken` exists as a string reference for the web's `inset` shadows. RN doesn't support inset shadows — recreate visually with a thin border or gradient if needed.

---

## 7. Gradients

`Gradients` exposes color stops + locations as plain data. Feed to `expo-linear-gradient` when needed (not currently installed).

```ts
Gradients.surfaceRadial   // matches web's --background-radialgradient
Gradients.lineHighlight   // matches --line-background-gradient-color
Gradients.publicRight     // matches --public-right-gradient
```

---

## 8. Control sizing

```ts
Control.heightMin = 45  // matches web's --control-min
Control.heightMax = 50  // matches web's --control-max
```

Use for input/button heights when the design specifies a specific control size.

---

## 9. Token discipline — checklist

Before committing any styled component:

- [ ] No hardcoded hex (`#abcdef`) outside `colors.ts` — grep: `#[0-9a-fA-F]{3,8}`
- [ ] No `rgba(...)` outside theme files — grep: `rgba\(`
- [ ] No bare `fontSize: <number>` — grep: `fontSize:\s*[0-9]`
- [ ] No bare `fontFamily: '...'` — must come from `Fonts`
- [ ] No ad-hoc `shadowColor/Offset/Opacity/Radius` — must come from `Shadow.*`
- [ ] No raw radius numbers > 6 except documented exceptions

The first three are project-wide invariants that have been audited to zero.

---

## Quick reference

```
PRIMARY COLOR:      Colors.mainBlue (#38b6ff)
PRIMARY TEXT:       Colors.text (#2d2d2d)
PRIMARY SURFACE:    Colors.white
PAGE WASH:          Colors.surfaceTint (#ecf8ff)
PRIMARY FONT:       Fonts.medium
PRIMARY FONT SIZE:  FontSize.regular18
PAGE TITLE SIZE:    FontSize.medium30
DEFAULT GAP:        Spacing.s3 (10)
DEFAULT PADDING:    Spacing.s4 (15)
DEFAULT RADIUS:     Radius.card (14)
DEFAULT SHADOW:     ...Shadow.card
ICON BUTTON BG:     Colors.frost85
ROLE CHIP (off):    Colors.frost70 + Colors.dim10 border
```
