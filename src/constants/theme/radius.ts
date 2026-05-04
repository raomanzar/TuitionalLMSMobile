/** Corner radii — mirrors --radius-* CSS vars. */
export const Radius = {
  pill:    999, // --radius-pill
  card:    14,  // (mobile-specific — slightly larger than web's 12)
  cardWeb: 12,  // --radius-card (matches web exactly)
  control: 10,  // --radius-input  (buttons, inputs)
  tile:    10,  // --radius-tile
  chip:    6,   // --radius-chip
  sheet:   26,  // bottom sheets (mobile-specific)
} as const;
