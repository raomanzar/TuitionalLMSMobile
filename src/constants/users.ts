// ─── Types ─────────────────────────────────────────────────────
export type Role = 'Student' | 'Teacher' | 'Admin' | 'Parent';

export type StatusFilter = 'All' | 'Active' | 'Inactive';
export type SyncFilter = 'All' | 'Synced' | 'Unsynced';
export type RoleFilter = 'All' | Role;

export type User = {
  id: number;
  first: string;
  last: string;
  email: string;
  role: Role;
  date: string;
  active: boolean;
  synced: boolean;
  color: string;
  /** Empty string / missing → consumer should render `USER_AVATAR_FALLBACK`. */
  profileImageUrl?: string;
};

/**
 * Detail-screen shape: `User` plus the fields only the detail view needs
 * (pseudo name, phone, country). Lives here so screens stay backend-agnostic;
 * the mapper in `services/apis/users/mappers.ts` is the only thing that knows
 * how the API populates these.
 */
export type UserDetail = User & {
  /** Backend role ID — needed to pre-select the correct chip in the dynamic role picker. */
  roleId: number;
  pseudo: string;
  phone: string;
  city: string;
  country: string;
  countryCode: string;
  gender: string;
  calendarIntegrationEnabled: boolean;
  /**
   * Numeric ticket count, kept as string for the form input. Empty by default —
   * the unified user object returned by `getUserById` doesn't include `ticket`,
   * so the Edit form starts blank and the user re-enters when needed.
   */
  ticket: string;
};

/** Local placeholder shown when `profileImageUrl` is absent or empty. */
export const USER_AVATAR_FALLBACK = require('../../assets/images/demmyPic.png');

export type UserFilters = {
  search: string;
  role: RoleFilter;
  status: StatusFilter;
  sync: SyncFilter;
  /** ISO 3166-1 alpha-2 country code, or empty for "all". */
  countryCode: string;
};

// ─── Filter options ────────────────────────────────────────────
export const ROLE_FILTERS: readonly RoleFilter[] = ['All', 'Student', 'Teacher', 'Admin', 'Parent'];
export const STATUS_FILTERS: readonly StatusFilter[] = ['All', 'Active', 'Inactive'];
export const SYNC_FILTERS: readonly SyncFilter[] = ['All', 'Synced', 'Unsynced'];

export const DEFAULT_USER_FILTERS: UserFilters = {
  search: '',
  role: 'All',
  status: 'All',
  sync: 'All',
  countryCode: '',
};

// ─── Mock data (used by users.api.ts until the backend is wired) ─
export const TOTAL_USERS = 704;

export const USERS: User[] = [
  { id: 830, first: 'Maria',    last: 'Clara',        email: 'rffsalgado7@gmail.com',      role: 'Student', date: '27 Apr', active: true,  synced: false, color: '#FFD3B6' },
  { id: 829, first: 'Layan',    last: 'Alalawi',      email: 'layanalalawi248@gmail.com',  role: 'Student', date: '24 Apr', active: true,  synced: true,  color: '#C7F2D2' },
  { id: 828, first: 'Al Ghala', last: 'Saif',         email: 'alghalasaif97@gmail.com',    role: 'Student', date: '22 Apr', active: true,  synced: false, color: '#FFE4B5' },
  { id: 827, first: 'Ebad',     last: 'Aziz',         email: 'ebad.physicist@outlook.com', role: 'Teacher', date: '20 Apr', active: true,  synced: false, color: '#D6CDF7' },
  { id: 826, first: 'Ahmed',    last: 'Mohamed',      email: 'ahmedmamfr63@gmail.com',     role: 'Teacher', date: '20 Apr', active: true,  synced: false, color: '#C7E0FF' },
  { id: 825, first: 'Nazish',   last: 'Iqbal',        email: 'nazishiqbal_1953@yahoo.com', role: 'Teacher', date: '20 Apr', active: true,  synced: false, color: '#FFD6E7' },
  { id: 824, first: 'Saqib',    last: 'Ali',          email: 'saqib.islamabad@gmail.com',  role: 'Teacher', date: '20 Apr', active: true,  synced: false, color: '#FFE0AC' },
  { id: 823, first: 'Aneeza',   last: 'Zafar',        email: 'aneezazafar150@gmail.com',   role: 'Teacher', date: '20 Apr', active: false, synced: false, color: '#D9E8FF' },
  { id: 822, first: 'Rabeea',   last: 'Tahir',        email: 'itstrts@yahoo.com',          role: 'Teacher', date: '20 Apr', active: true,  synced: false, color: '#FFD0D0' },
  { id: 821, first: 'Diana',    last: 'Gisaire',      email: 'gisairediara71@gmail.com',   role: 'Teacher', date: '20 Apr', active: true,  synced: false, color: '#C9F0E5' },
  { id: 820, first: 'Mary',     last: 'Elkess Boles', email: 'maryelkessboles@gmail.com',  role: 'Teacher', date: '20 Apr', active: true,  synced: false, color: '#E8D7FF' },
  { id: 819, first: 'Hassan',   last: 'Naveed',       email: 'hassan.naveed@gmail.com',    role: 'Student', date: '19 Apr', active: true,  synced: true,  color: '#FFE9C4' },
  { id: 818, first: 'Sara',     last: 'Ahmed',        email: 'sara.ahmed.k@gmail.com',     role: 'Student', date: '19 Apr', active: true,  synced: true,  color: '#D2EBFF' },
];
