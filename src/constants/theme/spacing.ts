/** Spacing scale — mirrors --space-* CSS vars (observed scale). */
export const Spacing = {
  s1: 4,    // --space-1
  s2: 7.5,  // --space-2  table cell padding Y
  s3: 10,   // --space-3  default gap
  s4: 15,   // --space-4  screen padding
  s5: 20,   // --space-5
  s6: 30,   // --space-6
} as const;

/** Control sizing — mirrors --control-height / --control-min/max. */
export const Control = {
  heightMin: 45, // --control-min
  heightMax: 50, // --control-max
} as const;
