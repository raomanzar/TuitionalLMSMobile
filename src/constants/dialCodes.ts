/**
 * Country dial codes for the phone-number country picker.
 *
 * Each entry carries:
 *   - `code` — ISO 3166-1 alpha-2, what the backend stores in `country_code`
 *     (e.g. "PK", "AE"). Distinct from `dial` because `+1` is shared by
 *     US/Canada — the ISO disambiguates.
 *   - `dial` — the international dialling prefix shown in the UI pill and
 *     prepended to `phone_number` before sending.
 *
 * Sorted alphabetically by `name` so the picker reads naturally. Append new
 * entries; the picker filters in-memory so order in the file isn't critical.
 */
export type DialCode = {
  name: string;
  flag: string;
  /** Dialling prefix incl. leading `+`. E.g. `+92`. */
  dial: string;
  /** ISO 3166-1 alpha-2. E.g. `PK`. */
  code: string;
};

export const DIAL_CODES: readonly DialCode[] = [
  { name: 'Australia', flag: '🇦🇺', dial: '+61', code: 'AU' },
  { name: 'Bahrain', flag: '🇧🇭', dial: '+973', code: 'BH' },
  { name: 'Bangladesh', flag: '🇧🇩', dial: '+880', code: 'BD' },
  { name: 'Canada', flag: '🇨🇦', dial: '+1', code: 'CA' },
  { name: 'China', flag: '🇨🇳', dial: '+86', code: 'CN' },
  { name: 'Egypt', flag: '🇪🇬', dial: '+20', code: 'EG' },
  { name: 'France', flag: '🇫🇷', dial: '+33', code: 'FR' },
  { name: 'Germany', flag: '🇩🇪', dial: '+49', code: 'DE' },
  { name: 'India', flag: '🇮🇳', dial: '+91', code: 'IN' },
  { name: 'Indonesia', flag: '🇮🇩', dial: '+62', code: 'ID' },
  { name: 'Iran', flag: '🇮🇷', dial: '+98', code: 'IR' },
  { name: 'Iraq', flag: '🇮🇶', dial: '+964', code: 'IQ' },
  { name: 'Italy', flag: '🇮🇹', dial: '+39', code: 'IT' },
  { name: 'Japan', flag: '🇯🇵', dial: '+81', code: 'JP' },
  { name: 'Jordan', flag: '🇯🇴', dial: '+962', code: 'JO' },
  { name: 'Kuwait', flag: '🇰🇼', dial: '+965', code: 'KW' },
  { name: 'Lebanon', flag: '🇱🇧', dial: '+961', code: 'LB' },
  { name: 'Malaysia', flag: '🇲🇾', dial: '+60', code: 'MY' },
  { name: 'Netherlands', flag: '🇳🇱', dial: '+31', code: 'NL' },
  { name: 'New Zealand', flag: '🇳🇿', dial: '+64', code: 'NZ' },
  { name: 'Nigeria', flag: '🇳🇬', dial: '+234', code: 'NG' },
  { name: 'Oman', flag: '🇴🇲', dial: '+968', code: 'OM' },
  { name: 'Pakistan', flag: '🇵🇰', dial: '+92', code: 'PK' },
  { name: 'Philippines', flag: '🇵🇭', dial: '+63', code: 'PH' },
  { name: 'Qatar', flag: '🇶🇦', dial: '+974', code: 'QA' },
  { name: 'Saudi Arabia', flag: '🇸🇦', dial: '+966', code: 'SA' },
  { name: 'Singapore', flag: '🇸🇬', dial: '+65', code: 'SG' },
  { name: 'South Africa', flag: '🇿🇦', dial: '+27', code: 'ZA' },
  { name: 'South Korea', flag: '🇰🇷', dial: '+82', code: 'KR' },
  { name: 'Spain', flag: '🇪🇸', dial: '+34', code: 'ES' },
  { name: 'Sri Lanka', flag: '🇱🇰', dial: '+94', code: 'LK' },
  { name: 'Switzerland', flag: '🇨🇭', dial: '+41', code: 'CH' },
  { name: 'Thailand', flag: '🇹🇭', dial: '+66', code: 'TH' },
  { name: 'Turkey', flag: '🇹🇷', dial: '+90', code: 'TR' },
  { name: 'United Arab Emirates', flag: '🇦🇪', dial: '+971', code: 'AE' },
  { name: 'United Kingdom', flag: '🇬🇧', dial: '+44', code: 'GB' },
  { name: 'United States', flag: '🇺🇸', dial: '+1', code: 'US' },
  { name: 'Yemen', flag: '🇾🇪', dial: '+967', code: 'YE' },
];

/** Default selection — UAE since the LMS is UAE-first. */
export const DEFAULT_DIAL_CODE_ENTRY: DialCode =
  DIAL_CODES.find((c) => c.code === 'AE') ?? DIAL_CODES[0];

/** Look up an entry by ISO code. Used for pre-filling the Edit screen. */
export const findDialByIso = (iso: string): DialCode | undefined =>
  DIAL_CODES.find((c) => c.code === iso);

/**
 * Strip the dial-code digits (e.g. `92`) from the start of a stored phone
 * number (e.g. `923390747464`) so the user sees just the local digits in
 * the input. Returns the original string if it doesn't start with the prefix.
 */
export const stripDialDigits = (fullPhone: string, dial: string): string => {
  const phoneDigits = fullPhone.replace(/\D/g, '');
  const dialDigits = dial.replace(/\D/g, '');
  if (!dialDigits) return phoneDigits;
  return phoneDigits.startsWith(dialDigits)
    ? phoneDigits.slice(dialDigits.length)
    : phoneDigits;
};
