// ─── Types ─────────────────────────────────────────────────────
export type CancelledBy = 'Student' | 'Teacher' | 'Admin';
export type RefundStatus = 'Refunded' | 'Pending' | 'Rescheduled' | 'No Refund';

export type CancelledByFilter = 'All' | CancelledBy;
export type RefundStatusFilter = 'All' | RefundStatus;
export type DateRangeFilter = 'All' | 'Today' | 'Week' | 'Month';

export type CancelledClass = {
  id: number;
  subject: string;
  studentName: string;
  teacherName: string;
  scheduledAt: string;          // display string: "27 Apr · 4:00 PM"
  cancelledAt: string;          // display string: "27 Apr"
  cancelledDaysAgo: number;     // 0 = today, used for date-range filter
  cancelledBy: CancelledBy;
  reason: string;
  refundStatus: RefundStatus;
  durationMinutes: number;
  color: string;                // background color for the avatar
};

export type CancelledClassFilters = {
  search: string;
  cancelledBy: CancelledByFilter;
  refundStatus: RefundStatusFilter;
  dateRange: DateRangeFilter;
};

// ─── Filter options ────────────────────────────────────────────
export const CANCELLED_BY_FILTERS: readonly CancelledByFilter[] = [
  'All',
  'Student',
  'Teacher',
  'Admin',
];
export const REFUND_STATUS_FILTERS: readonly RefundStatusFilter[] = [
  'All',
  'Refunded',
  'Pending',
  'Rescheduled',
  'No Refund',
];
export const DATE_RANGE_FILTERS: readonly DateRangeFilter[] = [
  'All',
  'Today',
  'Week',
  'Month',
];

export const DEFAULT_CANCELLED_CLASS_FILTERS: CancelledClassFilters = {
  search: '',
  cancelledBy: 'All',
  refundStatus: 'All',
  dateRange: 'All',
};

// ─── Mock data (used until the backend is wired) ──────────────
export const TOTAL_CANCELLED_CLASSES = 247;

export const CANCELLED_CLASSES: CancelledClass[] = [
  {
    id: 4012,
    subject: 'Mathematics — Grade 9',
    studentName: 'Maria Clara',
    teacherName: 'Ebad Aziz',
    scheduledAt: '04 May · 4:00 PM',
    cancelledAt: 'Today',
    cancelledDaysAgo: 0,
    cancelledBy: 'Student',
    reason: 'Student fell ill',
    refundStatus: 'Refunded',
    durationMinutes: 60,
    color: '#FFD3B6',
  },
  {
    id: 4011,
    subject: 'Physics — IGCSE',
    studentName: 'Layan Alalawi',
    teacherName: 'Saqib Ali',
    scheduledAt: '03 May · 6:30 PM',
    cancelledAt: 'Yesterday',
    cancelledDaysAgo: 1,
    cancelledBy: 'Teacher',
    reason: 'Teacher emergency',
    refundStatus: 'Rescheduled',
    durationMinutes: 90,
    color: '#C7F2D2',
  },
  {
    id: 4010,
    subject: 'Chemistry — A-Level',
    studentName: 'Al Ghala Saif',
    teacherName: 'Nazish Iqbal',
    scheduledAt: '02 May · 5:00 PM',
    cancelledAt: '2 days ago',
    cancelledDaysAgo: 2,
    cancelledBy: 'Student',
    reason: 'Schedule conflict',
    refundStatus: 'Pending',
    durationMinutes: 60,
    color: '#FFE4B5',
  },
  {
    id: 4009,
    subject: 'English Literature',
    studentName: 'Ahmed Mohamed',
    teacherName: 'Mary Elkess Boles',
    scheduledAt: '30 Apr · 7:00 PM',
    cancelledAt: '4 days ago',
    cancelledDaysAgo: 4,
    cancelledBy: 'Admin',
    reason: 'Platform maintenance',
    refundStatus: 'Refunded',
    durationMinutes: 45,
    color: '#D6CDF7',
  },
  {
    id: 4008,
    subject: 'Biology — Grade 11',
    studentName: 'Hassan Naveed',
    teacherName: 'Diana Gisaire',
    scheduledAt: '28 Apr · 3:30 PM',
    cancelledAt: '6 days ago',
    cancelledDaysAgo: 6,
    cancelledBy: 'Teacher',
    reason: 'Teacher unavailable',
    refundStatus: 'Rescheduled',
    durationMinutes: 60,
    color: '#C7E0FF',
  },
  {
    id: 4007,
    subject: 'Mathematics — A-Level',
    studentName: 'Sara Ahmed',
    teacherName: 'Aneeza Zafar',
    scheduledAt: '25 Apr · 5:30 PM',
    cancelledAt: '9 days ago',
    cancelledDaysAgo: 9,
    cancelledBy: 'Student',
    reason: 'Family emergency',
    refundStatus: 'Refunded',
    durationMinutes: 90,
    color: '#FFD6E7',
  },
  {
    id: 4006,
    subject: 'Computer Science',
    studentName: 'Layan Alalawi',
    teacherName: 'Rabeea Tahir',
    scheduledAt: '22 Apr · 6:00 PM',
    cancelledAt: '12 days ago',
    cancelledDaysAgo: 12,
    cancelledBy: 'Student',
    reason: 'No reason provided',
    refundStatus: 'No Refund',
    durationMinutes: 60,
    color: '#FFE0AC',
  },
  {
    id: 4005,
    subject: 'Physics — Grade 10',
    studentName: 'Maria Clara',
    teacherName: 'Ebad Aziz',
    scheduledAt: '20 Apr · 4:00 PM',
    cancelledAt: '14 days ago',
    cancelledDaysAgo: 14,
    cancelledBy: 'Teacher',
    reason: 'Internet outage',
    refundStatus: 'Rescheduled',
    durationMinutes: 60,
    color: '#D9E8FF',
  },
  {
    id: 4004,
    subject: 'Arabic — Beginner',
    studentName: 'Al Ghala Saif',
    teacherName: 'Diana Gisaire',
    scheduledAt: '15 Apr · 5:00 PM',
    cancelledAt: '19 days ago',
    cancelledDaysAgo: 19,
    cancelledBy: 'Admin',
    reason: 'Class rescheduled by admin',
    refundStatus: 'Rescheduled',
    durationMinutes: 45,
    color: '#FFD0D0',
  },
  {
    id: 4003,
    subject: 'Chemistry — IGCSE',
    studentName: 'Hassan Naveed',
    teacherName: 'Saqib Ali',
    scheduledAt: '12 Apr · 7:30 PM',
    cancelledAt: '22 days ago',
    cancelledDaysAgo: 22,
    cancelledBy: 'Student',
    reason: 'Exam preparation',
    refundStatus: 'Refunded',
    durationMinutes: 60,
    color: '#C9F0E5',
  },
  {
    id: 4002,
    subject: 'English Language',
    studentName: 'Sara Ahmed',
    teacherName: 'Mary Elkess Boles',
    scheduledAt: '08 Apr · 4:30 PM',
    cancelledAt: '26 days ago',
    cancelledDaysAgo: 26,
    cancelledBy: 'Teacher',
    reason: 'Teacher illness',
    refundStatus: 'Pending',
    durationMinutes: 45,
    color: '#E8D7FF',
  },
  {
    id: 4001,
    subject: 'Mathematics — Grade 8',
    studentName: 'Ahmed Mohamed',
    teacherName: 'Aneeza Zafar',
    scheduledAt: '02 Apr · 5:00 PM',
    cancelledAt: '32 days ago',
    cancelledDaysAgo: 32,
    cancelledBy: 'Student',
    reason: 'Personal commitments',
    refundStatus: 'No Refund',
    durationMinutes: 60,
    color: '#FFE9C4',
  },
];

// ─── Helpers ──────────────────────────────────────────────────
/** Maps a refund status to the closest existing Badge kind. */
export const refundStatusBadgeKind = (
  s: RefundStatus,
): 'active' | 'pending' | 'admin' | 'inactive' => {
  switch (s) {
    case 'Refunded':    return 'active';
    case 'Pending':     return 'pending';
    case 'Rescheduled': return 'admin';
    case 'No Refund':   return 'inactive';
  }
};
