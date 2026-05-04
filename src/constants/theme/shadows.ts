import { Colors } from './colors';

/**
 * Shadows — mirrors --cards--boxShadow-color, --input-box-shadow, etc.
 * iOS keys (shadowColor/Offset/Opacity/Radius) + Android `elevation`.
 */
export const Shadow = {
  // --cards--boxShadow-color: 0 0 7px rgba(0,0,0,0.1)
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 7,
    elevation: 2,
  },
  // --input-box-shadow: 0 1px 4px rgba(0,0,0,0.08)
  input: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
  },
  // Resting elevation on small controls
  control: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  // Brand-tinted FAB shadow
  fab: {
    shadowColor: Colors.mainBlue,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 22,
    elevation: 10,
  },
  // Floating bottom sheet (FAB sheet hovering above the tab bar)
  sheet: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 40,
    elevation: 12,
  },
} as const;

/**
 * Inset / inner shadows from web (--*-inner-boxShadow-color) — RN doesn't
 * support inset shadows natively. Recreate via a thin border + gradient
 * overlay if needed. Kept here as a token reference.
 */
export const InnerShadowToken = {
  iconBox:  '0 -1px 5px 0 rgba(0,0,0,0.3) inset',           // --iconBox-inner-boxShadow
  surface:  '0 -1px 10px 0 var(--blue-color1) inset',       // --main-inner-boxShadow-color
} as const;
