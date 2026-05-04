/**
 * Theme barrel — single source of truth for design tokens.
 * Mirrors the web's `colors_and_type.css`. Import as:
 *
 *   import { Colors, Fonts, FontSize, TextStyles } from '@/constants/theme';
 */
export { Colors } from './colors';
export type { ColorToken } from './colors';

export {
  FontAssets,
  FontFamily,
  FontRole,
  FontSize,
  LetterSpacing,
  TextStyles,
  Fonts,           // alias of FontFamily — kept for existing call sites
} from './typography';

export { Radius } from './radius';
export { Spacing, Control } from './spacing';
export { Shadow, InnerShadowToken } from './shadows';
export { Gradients } from './gradients';
