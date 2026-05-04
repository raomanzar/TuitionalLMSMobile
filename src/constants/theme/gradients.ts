import { Colors } from './colors';

/**
 * Gradient tokens — mirrors --background-radialgradient,
 * --line-background-gradient-color, --public-right-gradient.
 *
 * RN can't render CSS gradients natively. Feed these stops to
 * `expo-linear-gradient` / `react-native-svg` when needed.
 */
export const Gradients = {
  // --background-radialgradient (radial)
  surfaceRadial: {
    colors: [Colors.blue1, Colors.iconBoxFrost],
    locations: [-1.5, 1] as const,
  },
  // --line-background-gradient-color (linear top→bottom)
  lineHighlight: {
    colors: [Colors.white, Colors.mainBlue, Colors.white],
    locations: [0, 0.5, 1] as const,
  },
  // --public-right-gradient (linear right→left)
  publicRight: {
    colors: [Colors.blue4, Colors.white],
    start: { x: 1, y: 0 },
    end:   { x: 0, y: 0 },
  },
} as const;
