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
};

export type UserFilters = {
  search: string;
  role: RoleFilter;
  status: StatusFilter;
  sync: SyncFilter;
};

// ─── Filter options ────────────────────────────────────────────
export const ROLE_FILTERS: ReadonlyArray<RoleFilter> = ['All', 'Student', 'Teacher', 'Admin', 'Parent'];
export const STATUS_FILTERS: ReadonlyArray<StatusFilter> = ['All', 'Active', 'Inactive'];
export const SYNC_FILTERS: ReadonlyArray<SyncFilter> = ['All', 'Synced', 'Unsynced'];

export const DEFAULT_USER_FILTERS: UserFilters = {
  search: '',
  role: 'All',
  status: 'All',
  sync: 'All',
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
