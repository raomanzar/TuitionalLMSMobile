import { Dimensions, type TextStyle } from 'react-native';
import { Colors } from './colors';

/**
 * Typography — mirrors the web's font-family + fluid type scale tokens.
 *
 * Web uses `clamp(min, fluid, max)` to scale between viewport sizes.
 * RN doesn't support clamp, so we expose:
 *   - FontFamily: the 6 League Spartan weights (mirrors --leagueSpartan-*)
 *   - FontSize  : a fluid scale function bound to the device width
 *   - FontRole  : semantic roles (display / heading / body / caption)
 *   - TextStyles: pre-baked styles matching web's <h1>, <h2>, <p>, etc.
 */

// ─── Font families (matches --leagueSpartan-* CSS vars) ───
export const FontFamily = {
  thin:     'LeagueSpartan-Thin',     // 100
  light:    'LeagueSpartan-Light',    // 300
  regular:  'LeagueSpartan-Regular',  // 400
  medium:   'LeagueSpartan-Medium',   // 500
  semibold: 'LeagueSpartan-SemiBold', // 600
  bold:     'LeagueSpartan-Bold',     // 700
} as const;

/**
 * Asset map for `expo-font` — pairs each family key with its .ttf bundle.
 * Pass straight to `useFonts(FontAssets)` from the root layout so the
 * family-name strings stay single-sourced.
 */
export const FontAssets = {
  [FontFamily.thin]:     require('../../../assets/fonts/LeagueSpartan-Thin.ttf'),
  [FontFamily.light]:    require('../../../assets/fonts/LeagueSpartan-Light.ttf'),
  [FontFamily.regular]:  require('../../../assets/fonts/LeagueSpartan-Regular.ttf'),
  [FontFamily.medium]:   require('../../../assets/fonts/LeagueSpartan-Medium.ttf'),
  [FontFamily.semibold]: require('../../../assets/fonts/LeagueSpartan-SemiBold.ttf'),
  [FontFamily.bold]:     require('../../../assets/fonts/LeagueSpartan-Bold.ttf'),
} as const;

// ─── Semantic font roles (matches --font-* CSS vars) ───
export const FontRole = {
  display: FontFamily.bold,      // --font-display   22–28px
  heading: FontFamily.semibold,  // --font-heading   16–22px
  body:    FontFamily.medium,    // --font-body      14–16px (default)
  bodyAlt: FontFamily.regular,   // --font-body-alt  14–16px (tables)
  caption: FontFamily.light,     // --font-caption   12px
} as const;

/**
 * Fluid scaler — port of the web's `clamp(min, slope+vw, max)` formula.
 *
 * On phones (~320–500px) most tokens land near `min`; on tablets they
 * scale up toward `max`. Mirrors what the web shows at the same width.
 */
const SCREEN_W = Dimensions.get('window').width;
const fluid = (min: number, max: number) => {
  // base is 320px (smallest reasonable viewport), 1920px hits max
  const t = Math.min(Math.max((SCREEN_W - 320) / (1920 - 320), 0), 1);
  return Math.round(min + (max - min) * t);
};

/**
 * Fluid font sizes — keys mirror the CSS `--regular14-` / `--medium24-` /
 * `--large32-` / `--xLarge40-` / `--xxLarge48-` token names.
 *
 * Each value is the resolved px on the current device. Re-evaluate at
 * runtime if you need responsive recalculation (rare on a phone).
 */
export const FontSize = {
  // Regular body sizes
  regular14: fluid(10, 14),
  regular16: fluid(12, 16),
  regular18: fluid(14, 18), // default body
  regular20: fluid(16, 20),
  regular22: fluid(18, 22), // page titles

  // Medium scale
  medium24: fluid(20, 24),
  medium26: fluid(22, 26),
  medium28: fluid(24, 28),
  medium30: fluid(26, 30),

  // Large — dashboard metrics, hero numbers
  large32: fluid(28, 32),
  large34: fluid(30, 34),
  large36: fluid(32, 36),
  large38: fluid(34, 38),

  // X-large and up — splash / marketing
  xLarge40:  fluid(36, 40),
  xLarge42:  fluid(38, 42),
  xLarge44:  fluid(40, 44),
  xLarge46:  fluid(42, 46),
  xxLarge48: fluid(44, 48),
  xxLarge50: fluid(46, 50),
  xxLarge52: fluid(48, 52),
} as const;

// ─── Letter spacing scale (web defaults to 0.8px on body) ───
export const LetterSpacing = {
  tight:  0.4,
  normal: 0.5,
  wide:   0.6,
  body:   0.8, // web default
  display: 1,
} as const;

/**
 * Pre-baked semantic text styles — match the web's CSS element defaults.
 * Use these for h1/h2/h3/h4, paragraph, caption — same as the web cascade.
 */
export const TextStyles = {
  h1: {
    fontFamily: FontRole.display,
    fontSize: FontSize.regular22,
    color: Colors.text,
    letterSpacing: LetterSpacing.display,
  },
  h2: {
    fontFamily: FontRole.heading,
    fontSize: FontSize.regular22,
    color: Colors.text,
  },
  h3: {
    fontFamily: FontRole.heading,
    fontSize: FontSize.regular20,
    color: Colors.text,
  },
  h4: {
    fontFamily: FontRole.heading,
    fontSize: FontSize.regular18,
    color: Colors.text,
  },
  body: {
    fontFamily: FontRole.body,
    fontSize: FontSize.regular18,
    color: Colors.text,
    letterSpacing: LetterSpacing.body,
    lineHeight: Math.round(FontSize.regular18 * 1.35),
  },
  bodyAlt: {
    fontFamily: FontRole.bodyAlt,
    fontSize: FontSize.regular18,
    color: Colors.text,
  },
  caption: {
    fontFamily: FontRole.caption,
    fontSize: FontSize.regular16,
    color: Colors.textMuted,
  },
} as const satisfies Record<string, TextStyle>;

// ─── Backwards-compat alias for existing imports ───
export const Fonts = FontFamily;
