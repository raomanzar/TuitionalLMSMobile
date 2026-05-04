/**
 * Color palette — mirrors `colors_and_type.css` from the web app
 * (TuitionalLMSFrontend / src/app/globals.css), grouped by intent so
 * the mobile and web stays in sync 1:1.
 */
export const Colors = {
  // ============ BRAND / PRIMARY ============
  mainBlue: '#38b6ff',   // --main-blue-color  (alias --main-color)
  blue1:    '#afe2ff',   // --blue-color1 / --light-blue / --cards-header-color
  blue2:    '#048cdb',   // --blue-color2  pressed/emphasized brand
  blue3:    '#004687',   // --blue-color3  deep brand — hero
  blue4:    '#c7eaff',   // --blue-color4  gradient ends, soft fills
  blue5:    '#e4f5ff',   // --blue-color5  subtle surface tint

  // ============ SURFACES ============
  white:        '#ffffff',                  // --main-white-color / --pure-white-color
  surfaceTint:  '#ecf8ff',                  // --sidebar / --modal / --toggle / --dMain
  cardBg:       '#f1faff',                  // --cards--background-color
  cardHeader:   '#afe2ff',                  // --cards-header-color
  iconBoxFrost: 'rgba(255,255,255,0.5)',    // --iconBox-background-color

  // ============ TEXT ============
  text:           '#2d2d2d', // --black-color / --pure-black-color
  textSecondary:  '#666666', // --darkGrey-color
  textMuted:      '#8d8d8d', // --text-grey / --text-color
  textTertiary:   '#565656', // --secondary-color
  iconStrong:     '#444444', // --icons-color
  iconMuted:      '#9b9b9b', // --icon-color

  // ============ BORDERS / DIVIDERS ============
  borderSidebar: '#a0afb8',  // --sidebar-border-color
  borderDash:    '#ebebeb',  // --color-dashboard-border / --grey-color1
  border:        '#ebebeb',  // alias
  inputBg:       '#eeeeee',  // --inputBackground-color
  inputShadow:   '#cfcfcf',  // --input-box-shadow-color
  borderSoft:    'rgba(0,0,0,0.06)',
  borderRow:     'rgba(0,0,0,0.05)',

  // ============ STATUS — GREEN (success / conducted / credit) ============
  green:           'rgb(40,167,69)',
  greenText1:      'rgb(15,81,50)',
  greenBg1:        'rgb(209,231,221)',
  greenText2:      'rgb(40,99,32)',
  greenBg2:        'rgb(150,239,207)',
  greenText3:      'rgb(26,71,42)',
  greenBg3:        'rgb(212,237,218)',
  greenBg4:        'rgb(160,255,192)',
  greenBg5:        'rgb(180,255,224)',
  greenBg6:        '#dafff0',
  greenText:       'rgb(40,99,32)',     // semantic alias (text2)
  greenBg:         'rgb(209,231,221)',  // semantic alias (bg1)
  greenTextDark:   'rgb(15,81,50)',     // semantic alias (text1)

  // ============ STATUS — RED (error / cancelled / debit) ============
  red:        '#ff4444',          // --red-color
  red1:       '#d32121',           // --red-color1
  red2:       '#653838',           // --red-color2
  redText1:   'rgb(132,32,41)',
  redText2:   '#842029',
  redBg1:     'rgb(248,215,218)',
  redBg2:     '#ffacac',
  redText:    'rgb(132,32,41)',    // semantic alias
  redBg:      'rgb(248,215,218)',  // semantic alias

  // ============ STATUS — PURPLE (teacher role) ============
  purpleText: 'rgb(47,50,130)',
  purpleBg:   'rgb(219,220,255)',

  // ============ STATUS — ORANGE (warning) ============
  orange:        'rgb(255,165,0)',
  orangeText:    'rgb(204,85,0)',
  orangeBg:      'rgb(249,231,159)',

  // ============ STATUS — INFO BLUE (student-absent / credit blue) ============
  infoText: 'rgb(5,68,94)',
  infoBg:   'rgb(133,221,238)',

  // ============ ACCENTS ============
  purpleAccent: '#7b6cff', // not in CSS — used for "Permissions" tile

  // ============ SCRIM / OVERLAY ============
  scrim:      'rgba(0,0,0,0.45)',
  scrimLight: 'rgba(0,0,0,0.4)',
  blurDim:    'rgba(0,0,0,0.5)', // --transparent-blur-color

  // ============ DECORATIVE WASHES (mobile-only) ============
  // Brand-tint blobs used as page decoration (--blue-color1 with alpha).
  wash1: 'rgba(175,226,255,0.55)',
  wash2: 'rgba(175,226,255,0.25)',

  // ============ FROSTED SURFACES (mobile-only) ============
  // Translucent white tints for app bar, tab bar, icon buttons, frosted tiles.
  frost95: 'rgba(255,255,255,0.95)', // tab bar / pinned bars
  frost92: 'rgba(236,248,255,0.92)', // surfaceTint with alpha — top app bar
  frost85: 'rgba(255,255,255,0.85)', // icon buttons
  frost75: 'rgba(255,255,255,0.75)', // frosted tiles
  frost70: 'rgba(255,255,255,0.7)',  // role chips (off)
  frost50: 'rgba(255,255,255,0.5)',  // alias of iconBoxFrost

  // ============ DIM / DIVIDERS (mobile-only semantic) ============
  dim08:    'rgba(0,0,0,0.08)',  // hairline borders, ghost button bg
  dim10:    'rgba(0,0,0,0.1)',   // chip outlines
  grabber:  'rgba(0,0,0,0.18)',  // bottom-sheet grabber pill
} as const;

export type ColorToken = keyof typeof Colors;
