// ---- Database row types (match Supabase schema) ----

export interface DailySubmission {
  id?: number;
  date: string; // 'YYYY-MM-DD'
  online: number;
  hybrid: number;
  prime: number;
  total?: number; // computed column
  visitors: number;
  income?: number;
  created_at?: string;
  updated_at?: string;
}

export interface GoogleAdsDaily {
  id?: number;
  date: string;
  spend: number;
  impressions: number;
  clicks: number;
  submit: number;
  started: number;
  finished: number;
  treatment: number;
  created_at?: string;
  updated_at?: string;
}

export interface MonthlySummary {
  id?: number;
  year: number;
  month: number;
  month_name: string;
  goal: number;
  total_submissions: number;
  online_submissions: number;
  hybrid_submissions: number;
  prime_submissions: number;
  total_income?: number;
  total_visitors: number;
  usa_visitors: number;
  conversion_rate: number;
  usa_conversion_rate: number;
  days_tracked: number;
  daily_avg: number;
}

export interface MonthlyReferrer {
  id?: number;
  year_month: string; // '2026-01'
  referrer_type: string;
  count: number;
}

export interface AmbassadorCommission {
  id?: number;
  month_name: string;
  amount: number;
}

export interface MetaAdsMonthly {
  id?: number;
  month_label: string; // 'Mar 2025'
  spend: number;
  leads: number;
}

export interface AdFunnel {
  id?: number;
  platform: 'meta' | 'google';
  snapshot_date: string;
  entered: number;
  waiting_info: number;
  sent_to_txp: number;
  txp_approved: number;
  sent_checkout: number;
  checked_out: number;
  amount_received: number;
  denied: number;
  closed_lost: number;
  referred_out: number;
}

export interface AuditPatient {
  id?: number;
  name: string;
  email?: string;
  phone?: string;
  date_started: string;
  stage: string;
  missing?: string;
  assigned_to?: string;
  last_action?: string;
  notes?: string;
  sibling_name?: string;
  sibling_status?: string;
  status: string; // 'open' | 'resolved' | 'contacted'
  created_at?: string;
  updated_at?: string;
}

export const AUDIT_STAGES = [
  'Started',
  'Info Submitted',
  'Waiting for Photos',
  'Photos Uploaded',
  'Under Review',
  'Sent to Provider',
  'Enrolled',
] as const;

export interface Setting {
  key: string;
  value: string;
  updated_at?: string;
}

export interface HistoricalDaily {
  id?: number;
  date: string;
  total: number;
}

// ---- Frontend types ----

export interface MonthGoal {
  month: number;
  year: number;
  online: number;
  hybrid: number;
  prime: number;
  total: number;
}

export const MONTHLY_GOALS_2026: MonthGoal[] = [
  { month: 1, year: 2026, online: 1067, hybrid: 363, prime: 25, total: 1455 },
  { month: 2, year: 2026, online: 1174, hybrid: 401, prime: 25, total: 1600 },
  { month: 3, year: 2026, online: 1291, hybrid: 444, prime: 25, total: 1760 },
  { month: 4, year: 2026, online: 1420, hybrid: 355, prime: 25, total: 1800 },
  { month: 5, year: 2026, online: 1562, hybrid: 405, prime: 25, total: 1992 },
  { month: 6, year: 2026, online: 1718, hybrid: 460, prime: 25, total: 2203 },
  { month: 7, year: 2026, online: 1890, hybrid: 500, prime: 25, total: 2415 },
  { month: 8, year: 2026, online: 2079, hybrid: 500, prime: 25, total: 2604 },
  { month: 9, year: 2026, online: 2287, hybrid: 500, prime: 25, total: 2812 },
  { month: 10, year: 2026, online: 2516, hybrid: 500, prime: 25, total: 3041 },
  { month: 11, year: 2026, online: 2767, hybrid: 500, prime: 25, total: 3292 },
  { month: 12, year: 2026, online: 3044, hybrid: 500, prime: 25, total: 3569 },
];

export const MONTH_NAMES = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// GA4 Monthly Unique Users — worldwide (source of truth for conversion rates)
// Updated May 28, 2026. May is partial (through 5/28).
export const TRAFFIC_2025: Record<number, number> = {
  1: 57814, 2: 58901, 3: 57747, 4: 33895, 5: 31621, 6: 31681,
  7: 73193, 8: 37180, 9: 29179, 10: 28271, 11: 54674, 12: 36031,
};

export const TRAFFIC_2026: Record<number, number> = {
  1: 37320, 2: 51480, 3: 39218, 4: 30311, 5: 26858,
};

// GA4 Monthly Unique Users — USA only
export const TRAFFIC_USA_2026: Record<number, number> = {
  1: 33544, 2: 44756, 3: 33417, 4: 25521, 5: 22214,
};
