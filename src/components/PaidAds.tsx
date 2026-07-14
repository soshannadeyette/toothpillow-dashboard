'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { fetchGoogleAds, upsertGoogleAds, todayStr } from '@/lib/api';
import type { GoogleAdsDaily } from '@/lib/types';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler);

/* ────── TP Kids Color Palette ────── */
const TP = {
  blue: '#3A6EA4', skyBlue: '#B6CAE3', lightBlue: '#D6E5F7',
  cream: '#FEF8EE', green: '#8CD1C8', yellow: '#FDBE67',
  peach: '#FBCCC5', red: '#DD5759', darkPurple: '#B26CA6',
  text: '#333333', navy: '#1B2A4A',
};

/* ════════════════════════════════════════════
   TRACKING BLACKOUT — go.toothpillow link was
   broken May 11-20, so lead/conversion fields
   captured in Google Ads daily data during this
   window are unreliable. Spend/impressions/clicks
   from Google are unaffected and always accurate.
   ════════════════════════════════════════════ */
const BLACKOUT_START = '2026-05-11';
const BLACKOUT_END   = '2026-05-20';
const isBlackout = (date: string) => date >= BLACKOUT_START && date <= BLACKOUT_END;

/* ════════════════════════════════════════════
   DATA SOURCE 1: GOOGLE ADS DAILY (Supabase + seed)
   Use ONLY for spend, clicks, impressions.
   Do NOT derive leads/checkouts/conversions from this data —
   the submit/started/finished/treatment fields captured here
   do not reconcile with Salesforce and should only be used
   for the Add/Update Day entry form.
   ════════════════════════════════════════════ */

// Monthly aggregates for months before June (no daily data available).
// Pulled from Google Ads Campaigns view, All Time, Segment: Month — July 14, 2026.
// These are included in KPI totals, monthly summary, and cohort spend calculations
// but do NOT appear in the daily spend chart (no daily granularity available).
const GOOGLE_ADS_PRIOR_MONTHS: { month: string; year: number; monthIdx: number; spend: number; clicks: number; impressions: number }[] = [
  { month: 'Apr 2026', year: 2026, monthIdx: 4, spend: 5021.47, clicks: 1396, impressions: 24974 },
  { month: 'May 2026', year: 2026, monthIdx: 5, spend: 9728.21, clicks: 3093, impressions: 49404 },
];

// Google Ads daily seed data (source of truth — merged with Supabase on load)
// June 1-15 spend/clicks/impressions from Google Ads Report Editor, June 15, 2026
// June 16-22 spend/clicks/impressions from Google Ads Report Editor, June 22, 2026
// June 23-25 spend/clicks/impressions from Google Ads Campaigns view, June 25, 2026
// June 26-29 spend/clicks/impressions from Google Ads Campaigns view, June 30, 2026
// June 30-Jul 5 spend/clicks/impressions from Google Ads Report Editor, July 6, 2026
// July 6-13 spend/clicks/impressions from Google Ads Report Editor, July 13, 2026
// submit/started/finished/treatment fields retained for the entry form only —
// NOT used anywhere in this page's analysis (see Salesforce constants below instead).
const GOOGLE_ADS_SEED: GoogleAdsDaily[] = [
  { date: '2026-06-01', spend: 504.80, clicks: 155, impressions: 2273, submit: 7, started: 7, finished: 6, treatment: 0 },
  { date: '2026-06-02', spend: 489.53, clicks: 137, impressions: 2571, submit: 9, started: 0, finished: 0, treatment: 1 },
  { date: '2026-06-03', spend: 448.76, clicks: 137, impressions: 2074, submit: 5, started: 2, finished: 1, treatment: 0 },
  { date: '2026-06-04', spend: 481.54, clicks: 153, impressions: 2111, submit: 7, started: 4, finished: 3, treatment: 0 },
  { date: '2026-06-05', spend: 433.85, clicks: 126, impressions: 2121, submit: 4, started: 1, finished: 2, treatment: 0 },
  { date: '2026-06-06', spend: 389.20, clicks: 132, impressions: 1649, submit: 8, started: 3, finished: 2, treatment: 0 },
  { date: '2026-06-07', spend: 417.28, clicks: 141, impressions: 1957, submit: 4, started: 1, finished: 0, treatment: 0 },
  { date: '2026-06-08', spend: 508.66, clicks: 159, impressions: 2992, submit: 7, started: 2, finished: 5, treatment: 0 },
  { date: '2026-06-09', spend: 473.13, clicks: 160, impressions: 2324, submit: 4, started: 3, finished: 3, treatment: 0 },
  { date: '2026-06-10', spend: 474.53, clicks: 149, impressions: 2131, submit: 4, started: 4, finished: 3, treatment: 0 },
  { date: '2026-06-11', spend: 431.53, clicks: 128, impressions: 2295, submit: 2, started: 1, finished: 2, treatment: 0 },
  { date: '2026-06-12', spend: 415.48, clicks: 117, impressions: 1773, submit: 7, started: 3, finished: 1, treatment: 0 },
  { date: '2026-06-13', spend: 377.91, clicks: 110, impressions: 1836, submit: 7, started: 3, finished: 1, treatment: 0 },
  { date: '2026-06-14', spend: 393.04, clicks: 113, impressions: 1845, submit: 5, started: 3, finished: 1, treatment: 0 },
  { date: '2026-06-15', spend: 440.35, clicks: 126, impressions: 1975, submit: 3, started: 1, finished: 1, treatment: 0 },
  { date: '2026-06-16', spend: 430.71, clicks: 137, impressions: 2028, submit: 6, started: 2, finished: 6, treatment: 0 },
  { date: '2026-06-17', spend: 421.76, clicks: 135, impressions: 2020, submit: 7, started: 4, finished: 5, treatment: 0 },
  { date: '2026-06-18', spend: 406.56, clicks: 125, impressions: 1816, submit: 6, started: 3, finished: 3, treatment: 0 },
  { date: '2026-06-19', spend: 402.58, clicks: 114, impressions: 1597, submit: 7, started: 4, finished: 4, treatment: 1 },
  { date: '2026-06-20', spend: 374.82, clicks: 106, impressions: 1754, submit: 5, started: 3, finished: 2, treatment: 0 },
  { date: '2026-06-21', spend: 381.71, clicks: 117, impressions: 1419, submit: 3, started: 1, finished: 2, treatment: 0 },
  { date: '2026-06-22', spend: 225.90, clicks: 53, impressions: 746, submit: 5, started: 2, finished: 2, treatment: 0 },
  { date: '2026-06-23', spend: 411.89, clicks: 141, impressions: 1425, submit: 4, started: 4, finished: 1, treatment: 2 },
  { date: '2026-06-24', spend: 411.56, clicks: 134, impressions: 1573, submit: 12, started: 6, finished: 9, treatment: 1 },
  { date: '2026-06-25', spend: 520.28, clicks: 139, impressions: 2190, submit: 6, started: 3, finished: 4, treatment: 3 },
  { date: '2026-06-26', spend: 595.50, clicks: 153, impressions: 3150, submit: 7, started: 2, finished: 0, treatment: 0 },
  { date: '2026-06-27', spend: 593.07, clicks: 145, impressions: 2860, submit: 9, started: 2, finished: 1, treatment: 0 },
  { date: '2026-06-28', spend: 620.15, clicks: 171, impressions: 2382, submit: 8, started: 3, finished: 1, treatment: 0 },
  { date: '2026-06-29', spend: 467.99, clicks: 120, impressions: 2654, submit: 2, started: 1, finished: 5, treatment: 0 },
  { date: '2026-06-30', spend: 544.72, clicks: 142, impressions: 3010, submit: 6, started: 3, finished: 3, treatment: 1 },
  { date: '2026-07-01', spend: 586.05, clicks: 156, impressions: 2952, submit: 6, started: 1, finished: 2, treatment: 0 },
  { date: '2026-07-02', spend: 517.02, clicks: 143, impressions: 2812, submit: 4, started: 1, finished: 1, treatment: 1 },
  { date: '2026-07-03', spend: 440.25, clicks: 119, impressions: 2260, submit: 3, started: 3, finished: 1, treatment: 0 },
  { date: '2026-07-04', spend: 345.97, clicks: 111, impressions: 1992, submit: 3, started: 1, finished: 2, treatment: 0 },
  { date: '2026-07-05', spend: 751.95, clicks: 204, impressions: 3610, submit: 5, started: 5, finished: 1, treatment: 0 },
  { date: '2026-07-06', spend: 938.87, clicks: 207, impressions: 4891, submit: 11, started: 5, finished: 9, treatment: 1 },
  { date: '2026-07-07', spend: 986.45, clicks: 213, impressions: 4440, submit: 8, started: 1, finished: 2, treatment: 0 },
  { date: '2026-07-08', spend: 775.19, clicks: 196, impressions: 4154, submit: 6, started: 6, finished: 6, treatment: 0 },
  { date: '2026-07-09', spend: 742.87, clicks: 206, impressions: 3797, submit: 7, started: 4, finished: 2, treatment: 0 },
  { date: '2026-07-10', spend: 667.42, clicks: 175, impressions: 2571, submit: 3, started: 2, finished: 5, treatment: 2 },
  { date: '2026-07-11', spend: 608.47, clicks: 156, impressions: 3248, submit: 3, started: 2, finished: 0, treatment: 0 },
  { date: '2026-07-12', spend: 656.37, clicks: 172, impressions: 3544, submit: 6, started: 2, finished: 2, treatment: 0 },
  { date: '2026-07-13', spend: 493.87, clicks: 130, impressions: 2689, submit: 4, started: 4, finished: 8, treatment: 0 },
];

// Merge seed data with Supabase data (seed wins on conflict — hardcoded is source of truth)
function mergeWithSeed(apiData: GoogleAdsDaily[]): GoogleAdsDaily[] {
  const byDate = new Map<string, GoogleAdsDaily>();
  // API first (lower priority — fills in dates not in seed)
  apiData.forEach(a => byDate.set(a.date, a));
  // Seed overwrites API (source of truth per CLAUDE.md)
  GOOGLE_ADS_SEED.forEach(s => byDate.set(s.date, s));
  return Array.from(byDate.values());
}

/* ════════════════════════════════════════════
   DATA SOURCE 2: SALESFORCE (hardcoded constants)
   Use for leads, pipeline stages, checkouts, revenue,
   conversion timing, and cohort analysis.
   Source: Salesforce "Google Ads 2026" export, July 14, 2026.
   ════════════════════════════════════════════ */

// Salesforce pipeline totals — from Fable 5 cohort analysis, July 14, 2026.
// 395 total leads created in SF (386 with dates + 9 without). 17 checkouts (16 with dates + 1 without).
const GOOGLE_SF_PIPELINE = {
  total: 395,           // leads created (started form)
  completed: 174,       // all stages except Waiting-Info (44% of started)
  waitingInfo: 221,     // incomplete submissions
  sentCheckout: 109,    // Sent Checkout Link + Checked Out (63% of completed)
  sentToTxP: 26,
  checkedOut: 17,       // 16% of links sent, 4.3% of all leads
  referredOut: 23,      // 13% of completed — spend that cannot convert
  closedLost: 6,
  tempHold: 2,
  formOpens: 1436,      // Google Ads conversions (form opens, Google-only)
};

// 17 checkouts, $27,382 subtotal from Salesforce (avg $1,611/checkout)
const GOOGLE_REVENUE: number = 27382;

// Weekly cohort data — from Fable 5 cohort analysis (Salesforce + Google Ads), July 14, 2026.
// Spend is actual weekly Google Ads spend (not computed/pro-rated).
// Leads = Salesforce leads created that week. Completed = past Waiting-Info stage.
// 9 SF rows with no Created Date excluded from weekly rows; funnel totals on Summary include them.
const SF_WEEKLY_COHORT_DATA: {
  week: string; spend: number; clicks: number; formOpens: number;
  leads: number; completed: number; sentCheckout: number;
  checkouts: number; referredOut: number; revenue: number;
}[] = [
  { week: '2026-03-30', spend: 222.71, clicks: 64, formOpens: 3, leads: 2, completed: 0, sentCheckout: 0, checkouts: 0, referredOut: 0, revenue: 0 },
  { week: '2026-04-06', spend: 1111.73, clicks: 374, formOpens: 46, leads: 12, completed: 5, sentCheckout: 4, checkouts: 1, referredOut: 0, revenue: 1546 },
  { week: '2026-04-13', spend: 1542.38, clicks: 381, formOpens: 55, leads: 18, completed: 7, sentCheckout: 5, checkouts: 1, referredOut: 1, revenue: 1745 },
  { week: '2026-04-20', spend: 1324.33, clicks: 341, formOpens: 46, leads: 11, completed: 4, sentCheckout: 4, checkouts: 0, referredOut: 0, revenue: 0 },
  { week: '2026-04-27', spend: 1458.70, clicks: 395, formOpens: 63, leads: 21, completed: 6, sentCheckout: 3, checkouts: 0, referredOut: 2, revenue: 0 },
  { week: '2026-05-04', spend: 1597.29, clicks: 494, formOpens: 75, leads: 20, completed: 11, sentCheckout: 9, checkouts: 1, referredOut: 1, revenue: 1995 },
  { week: '2026-05-11', spend: 2153.79, clicks: 705, formOpens: 97, leads: 7, completed: 2, sentCheckout: 1, checkouts: 0, referredOut: 1, revenue: 0 },
  { week: '2026-05-18', spend: 2615.05, clicks: 834, formOpens: 94, leads: 10, completed: 3, sentCheckout: 2, checkouts: 1, referredOut: 1, revenue: 1595 },
  { week: '2026-05-25', spend: 2723.69, clicks: 903, formOpens: 127, leads: 36, completed: 13, sentCheckout: 8, checkouts: 2, referredOut: 2, revenue: 3491 },
  { week: '2026-06-01', spend: 3164.96, clicks: 981, formOpens: 140, leads: 44, completed: 21, sentCheckout: 11, checkouts: 3, referredOut: 6, revenue: 5187 },
  { week: '2026-06-08', spend: 3074.27, clicks: 936, formOpens: 127, leads: 36, completed: 19, sentCheckout: 16, checkouts: 2, referredOut: 2, revenue: 3092 },
  { week: '2026-06-15', spend: 2858.49, clicks: 860, formOpens: 114, leads: 37, completed: 18, sentCheckout: 11, checkouts: 3, referredOut: 3, revenue: 5286 },
  { week: '2026-06-22', spend: 3641.59, clicks: 1016, formOpens: 131, leads: 51, completed: 21, sentCheckout: 17, checkouts: 2, referredOut: 2, revenue: 3445 },
  { week: '2026-06-29', spend: 3653.95, clicks: 995, formOpens: 134, leads: 29, completed: 12, sentCheckout: 7, checkouts: 0, referredOut: 1, revenue: 0 },
  { week: '2026-07-06', spend: 5375.66, clicks: 1325, formOpens: 159, leads: 44, completed: 22, sentCheckout: 9, checkouts: 0, referredOut: 0, revenue: 0 },
  { week: '2026-07-13', spend: 824.82, clicks: 226, formOpens: 25, leads: 8, completed: 2, sentCheckout: 0, checkouts: 0, referredOut: 0, revenue: 0 },
];

// Lead → checkout timing, all 16 dated checkouts from Salesforce.
// 6, 7, 8, 10, 10, 11, 13, 14, 14, 18, 19, 23, 24, 28, 31, 32 days.
// Nothing has ever closed under 6 days or after 32.
const CONVERSION_TIMING = {
  median: 14,
  mean: 17,
  min: 6,
  max: 32,
  count: 16,
};

/* ════════════════════════════════════════════
   COHORT MATURITY CURVE — Observed from 16 actual checkouts
   Built from checkout timing: 6,7,8,10,10,11,13,14,14,18,19,23,24,28,31,32 days.
   No checkout has ever closed under 6 days or after 32.
   Practical rule: <2 weeks tells you nothing; ~5 weeks = fully mature.
   ════════════════════════════════════════════ */
const MATURITY_CURVE = [
  { days: 0, pct: 0 },
  { days: 7, pct: 0.125 },   // 2 of 16 by day 7
  { days: 14, pct: 0.5625 },  // 9 of 16 by day 14 (median)
  { days: 21, pct: 0.6875 },  // 11 of 16 by day 21
  { days: 28, pct: 0.875 },   // 14 of 16 by day 28
  { days: 35, pct: 1.0 },     // all 16 by day 35 (max observed = 32 + buffer)
];

function getMaturity(ageDays: number): number {
  if (ageDays >= 35) return 1.0;
  if (ageDays <= 0) return 0;
  for (let i = 0; i < MATURITY_CURVE.length - 1; i++) {
    const curr = MATURITY_CURVE[i];
    const next = MATURITY_CURVE[i + 1];
    if (ageDays <= next.days) {
      const ratio = (ageDays - curr.days) / (next.days - curr.days);
      return curr.pct + ratio * (next.pct - curr.pct);
    }
  }
  return 1.0;
}

/* ════════════════════════════════════════════
   SUBMISSION COMPLETION MATURITY — by weekly cohort
   How quickly leads complete the assessment after opening the form.
   Source: Salesforce "Google Ads 2026" export, July 14, 2026.
   d1/d3/d7/d14 = cumulative completion rate within that many days of Created Date.
   null = cohort too young to measure at that threshold.
   ════════════════════════════════════════════ */
const SF_COMPLETION_MATURITY: { week: string; leads: number; ageDays: number; d1: number | null; d3: number | null; d7: number | null; d14: number | null }[] = [
  { week: '2026-03-30', leads: 2, ageDays: 106, d1: 0.0, d3: 0.0, d7: 0.0, d14: 0.0 },
  { week: '2026-04-06', leads: 12, ageDays: 99, d1: 33.3, d3: 33.3, d7: 41.7, d14: 41.7 },
  { week: '2026-04-13', leads: 18, ageDays: 92, d1: 27.8, d3: 27.8, d7: 33.3, d14: 38.9 },
  { week: '2026-04-20', leads: 11, ageDays: 85, d1: 36.4, d3: 36.4, d7: 36.4, d14: 36.4 },
  { week: '2026-04-27', leads: 21, ageDays: 78, d1: 23.8, d3: 28.6, d7: 28.6, d14: 28.6 },
  { week: '2026-05-04', leads: 20, ageDays: 71, d1: 50.0, d3: 50.0, d7: 50.0, d14: 50.0 },
  { week: '2026-05-11', leads: 7, ageDays: 64, d1: 28.6, d3: 28.6, d7: 28.6, d14: 28.6 },
  { week: '2026-05-18', leads: 10, ageDays: 57, d1: 20.0, d3: 30.0, d7: 30.0, d14: 30.0 },
  { week: '2026-05-25', leads: 36, ageDays: 50, d1: 25.0, d3: 27.8, d7: 27.8, d14: 30.6 },
  { week: '2026-06-01', leads: 44, ageDays: 43, d1: 38.6, d3: 40.9, d7: 43.2, d14: 45.5 },
  { week: '2026-06-08', leads: 36, ageDays: 36, d1: 41.7, d3: 47.2, d7: 50.0, d14: 52.8 },
  { week: '2026-06-15', leads: 37, ageDays: 29, d1: 43.2, d3: 43.2, d7: 45.9, d14: 45.9 },
  { week: '2026-06-22', leads: 51, ageDays: 22, d1: 37.3, d3: 37.3, d7: 39.2, d14: 41.2 },
  { week: '2026-06-29', leads: 29, ageDays: 15, d1: 41.4, d3: 41.4, d7: 41.4, d14: 41.4 },
  { week: '2026-07-06', leads: 44, ageDays: 8, d1: 43.2, d3: 47.7, d7: 50.0, d14: null },
  { week: '2026-07-13', leads: 8, ageDays: 1, d1: 25.0, d3: null, d7: null, d14: null },
];

/* ════════════════════════════════════════════
   PIPELINE AGING — leads at "Sent Checkout Link" stage
   Bucketed by days since Created Date. No checkout has
   ever taken longer than 32 days, so 33+ is effectively dead.
   Source: Salesforce "Google Ads 2026" export, July 14, 2026.
   ════════════════════════════════════════════ */
const SF_PIPELINE_AGING = {
  fresh: 15,      // 0-14 days — newest, expect checkouts in 1-2 weeks
  maturing: 32,   // 15-32 days — mid-process, most checkouts happen here
  stale: 44,      // 33+ days — no checkout has ever taken longer than 32 days
  total: 91,
};

const MONTH_SHORT = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface CohortRow {
  label: string;
  spend: number;
  leads: number;
  completed: number;
  sentCheckout: number;
  checkouts: number;
  referredOut: number;
  completionRate: number;
  ageDays: number;
  maturity: number;
  projectedFinal: number;
  rawCAC: number | null;
  adjCAC: number | null;
}

/* ════════════════════════════════════════════
   META ADS (Paused — Historical)
   ════════════════════════════════════════════ */

const META_MONTHLY = [
  { month: 'Mar 2025', spend: 838.67, leads: 0 },
  { month: 'Apr 2025', spend: 170.97, leads: 0 },
  { month: 'May 2025', spend: 45.49, leads: 0 },
  { month: 'Aug 2025', spend: 1065.00, leads: 0 },
  { month: 'Sep 2025', spend: 2830.42, leads: 1 },
  { month: 'Oct 2025', spend: 3082.34, leads: 0 },
  { month: 'Nov 2025', spend: 5602.58, leads: 0 },
  { month: 'Dec 2025', spend: 3340.87, leads: 17 },
  { month: 'Jan 2026', spend: 5138.82, leads: 24 },
  { month: 'Feb 2026', spend: 2444.53, leads: 9 },
  { month: 'Mar 2026', spend: 1024.00, leads: 7 },
  { month: 'Apr 2026', spend: 72.42, leads: 0 },
];

const META_FUNNEL = { entered: 58, waitingInfo: 30, sentCheckout: 13, checkedOut: 0, amountReceived: 0, denied: 7, closedLost: 8 };

/* ════════════════════════════════════════════
   COMPONENT
   ════════════════════════════════════════════ */

export default function PaidAds() {
  const [entries, setEntries] = useState<GoogleAdsDaily[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMaturityRef, setShowMaturityRef] = useState(false);
  const [showMeta, setShowMeta] = useState(false);

  // Form state
  const [formDate, setFormDate] = useState(todayStr());
  const [formSpend, setFormSpend] = useState('');
  const [formImpressions, setFormImpressions] = useState('');
  const [formClicks, setFormClicks] = useState('');
  const [formSubmit, setFormSubmit] = useState('');
  const [formStarted, setFormStarted] = useState('');
  const [formFinished, setFormFinished] = useState('');
  const [formTreatment, setFormTreatment] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchGoogleAds(2026);
      setEntries(mergeWithSeed(data));
    } catch (e) {
      // If API fails, use seed data as fallback
      setEntries(mergeWithSeed([]));
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSave = async () => {
    if (!formDate) return;
    setSaving(true);
    setError(null);
    try {
      await upsertGoogleAds({
        date: formDate,
        spend: parseFloat(formSpend) || 0,
        impressions: parseInt(formImpressions) || 0,
        clicks: parseInt(formClicks) || 0,
        submit: parseInt(formSubmit) || 0,
        started: parseInt(formStarted) || 0,
        finished: parseInt(formFinished) || 0,
        treatment: parseInt(formTreatment) || 0,
      });
      setFormSpend(''); setFormImpressions(''); setFormClicks('');
      setFormSubmit(''); setFormStarted(''); setFormFinished(''); setFormTreatment('');
      await loadData();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleRowClick = (e: GoogleAdsDaily) => {
    setFormDate(e.date);
    setFormSpend(String(e.spend));
    setFormImpressions(String(e.impressions));
    setFormClicks(String(e.clicks));
    setFormSubmit(String(e.submit));
    setFormStarted(String(e.started));
    setFormFinished(String(e.finished));
    setFormTreatment(String(e.treatment));
  };

  /* ──── Google Ads daily aggregates (spend/clicks/impressions ONLY) ──── */

  const sorted = useMemo(() => [...entries].sort((a, b) => a.date.localeCompare(b.date)), [entries]);

  const gT = useMemo(() => {
    const t = { spend: 0, impressions: 0, clicks: 0 };
    // Daily data (June+)
    sorted.forEach((e) => {
      t.spend += e.spend || 0;
      t.impressions += e.impressions || 0;
      t.clicks += e.clicks || 0;
    });
    // Prior months without daily data (Apr, May)
    GOOGLE_ADS_PRIOR_MONTHS.forEach((m) => {
      // Only add if no daily data exists for this month (avoid double-counting)
      const hasDailyData = sorted.some((e) => {
        const [y, mo] = e.date.split('-').map(Number);
        return y === m.year && mo === m.monthIdx;
      });
      if (!hasDailyData) {
        t.spend += m.spend;
        t.impressions += m.impressions;
        t.clicks += m.clicks;
      }
    });
    return t;
  }, [sorted]);

  const googleTotalSpend = gT.spend;
  const googleDays = sorted.length || 1;

  /* ──── KPIs (Salesforce for submissions/pipeline/checkouts/revenue, Google Ads for spend) ──── */

  const totalLeadsCreated = GOOGLE_SF_PIPELINE.total;
  const totalIncomplete = GOOGLE_SF_PIPELINE.waitingInfo;
  const totalCompleted = GOOGLE_SF_PIPELINE.completed;
  const totalCheckouts = GOOGLE_SF_PIPELINE.checkedOut;
  const totalReferredOut = GOOGLE_SF_PIPELINE.referredOut;
  const totalFormOpens = GOOGLE_SF_PIPELINE.formOpens;
  const costPerLead = totalLeadsCreated > 0 ? googleTotalSpend / totalLeadsCreated : 0;
  const costPerFormOpen = totalFormOpens > 0 ? googleTotalSpend / totalFormOpens : 0;
  const cac = totalCheckouts > 0 ? googleTotalSpend / totalCheckouts : 0;
  const completionRate = totalLeadsCreated > 0 ? (totalCompleted / totalLeadsCreated) * 100 : 0;
  const completedToCheckoutRate = totalCompleted > 0 ? (totalCheckouts / totalCompleted) * 100 : 0;

  /* ──── Salesforce pipeline funnel bar ──── */
  const pipelineBar = useMemo(() => ([
    { label: 'Waiting Info', val: GOOGLE_SF_PIPELINE.waitingInfo, color: '#999' },
    { label: 'Sent Checkout Link', val: GOOGLE_SF_PIPELINE.sentCheckout, color: TP.yellow },
    { label: 'Sent to TxP', val: GOOGLE_SF_PIPELINE.sentToTxP, color: TP.darkPurple },
    { label: 'Checked Out', val: GOOGLE_SF_PIPELINE.checkedOut, color: '#00C853' },
    { label: 'Referred Out', val: GOOGLE_SF_PIPELINE.referredOut, color: TP.blue },
    { label: 'Closed Lost', val: GOOGLE_SF_PIPELINE.closedLost, color: TP.red },
    { label: 'Temp Hold', val: GOOGLE_SF_PIPELINE.tempHold, color: TP.skyBlue },
  ]), []);

  /* ──── Weekly cohort maturity analysis ──── */
  // Spend comes directly from SF_WEEKLY_COHORT_DATA (Fable's Google Ads weekly totals).
  // No need to compute from daily data — actual weekly spend is more accurate.

  // Compute historical checkout rate from mature cohorts (>35 days old = fully mature)
  // Used as fallback for young cohorts with zero checkouts
  const matureCheckoutRate = useMemo(() => {
    const now = new Date();
    let matureCompleted = 0;
    let matureCheckouts = 0;
    SF_WEEKLY_COHORT_DATA.forEach((c) => {
      const ws = new Date(c.week);
      const mid = new Date(ws);
      mid.setDate(ws.getDate() + 3);
      const age = Math.floor((now.getTime() - mid.getTime()) / (1000 * 60 * 60 * 24));
      if (age >= 35) {
        matureCompleted += c.completed;
        matureCheckouts += c.checkouts;
      }
    });
    return matureCompleted > 0 ? matureCheckouts / matureCompleted : 0;
  }, []);

  const cohortData = useMemo((): CohortRow[] => {
    const now = new Date();

    return SF_WEEKLY_COHORT_DATA.map((c) => {
      // Midpoint = Wednesday of the week
      const ws = new Date(c.week);
      const midpoint = new Date(ws);
      midpoint.setDate(ws.getDate() + 3);
      const ageDays = Math.floor((now.getTime() - midpoint.getTime()) / (1000 * 60 * 60 * 24));
      const maturity = getMaturity(ageDays);

      let projectedFinal: number;
      if (c.checkouts > 0 && maturity > 0.05) {
        // Has checkouts — extend by maturity curve
        projectedFinal = c.checkouts / maturity;
      } else if (c.completed > 0 && maturity < 1.0) {
        // No checkouts yet but has completed subs — use historical rate
        projectedFinal = c.completed * matureCheckoutRate;
      } else {
        projectedFinal = c.checkouts; // fully mature with whatever it has
      }

      const rawCAC = c.checkouts > 0 ? c.spend / c.checkouts : null;
      // Don't show adjusted CAC for cohorts under 14 days — too young to have checkouts (median = 14d)
      const adjCAC = (projectedFinal > 0 && ageDays >= 14) ? c.spend / projectedFinal : null;
      const compRate = c.leads > 0 ? c.completed / c.leads : 0;

      // Label: "Apr 7" format
      const d = new Date(c.week);
      const label = `${MONTH_SHORT[d.getMonth() + 1]} ${d.getDate()}`;

      return {
        label,
        spend: c.spend,
        leads: c.leads,
        completed: c.completed,
        sentCheckout: c.sentCheckout,
        checkouts: c.checkouts,
        referredOut: c.referredOut,
        completionRate: compRate,
        ageDays,
        maturity,
        projectedFinal,
        rawCAC,
        adjCAC,
      };
    });
  }, [matureCheckoutRate]);

  const cohortTotals = useMemo(() => {
    const tSpend = cohortData.reduce((s, c) => s + c.spend, 0);
    const tCheckouts = cohortData.reduce((s, c) => s + c.checkouts, 0);
    const tProjected = cohortData.reduce((s, c) => s + c.projectedFinal, 0);
    const tLeads = cohortData.reduce((s, c) => s + c.leads, 0);
    const tCompleted = cohortData.reduce((s, c) => s + c.completed, 0);
    const avgRevPerCheckout = tCheckouts > 0 ? GOOGLE_REVENUE / tCheckouts : 0;
    const additionalCheckouts = Math.max(0, tProjected - tCheckouts);
    const projectedRevenue = GOOGLE_REVENUE + (additionalCheckouts * avgRevPerCheckout);
    return {
      totalSpend: tSpend,
      totalCheckouts: tCheckouts,
      totalLeads: tLeads,
      totalCompleted: tCompleted,
      totalProjected: tProjected,
      additionalCheckouts,
      avgRevPerCheckout,
      projectedRevenue,
      overallRawCAC: tCheckouts > 0 ? tSpend / tCheckouts : null,
      overallAdjCAC: tProjected > 0 ? tSpend / tProjected : null,
    };
  }, [cohortData]);

  /* ──── Daily spend trend + 7-day moving average ──── */
  const spendTrend = useMemo(() => {
    const labels = sorted.map((e) => e.date.substring(5).replace('-', '/'));
    const spendVals = sorted.map((e) => e.spend || 0);
    const movingAvg: (number | null)[] = sorted.map((_, i) => {
      const start = Math.max(0, i - 6);
      const window = spendVals.slice(start, i + 1);
      const sum = window.reduce((s, v) => s + v, 0);
      return parseFloat((sum / window.length).toFixed(2));
    });
    return { labels, spendVals, movingAvg };
  }, [sorted]);

  const blackoutAnnotation = useMemo(() => ({
    id: 'blackoutAnnotation',
    afterDraw(chart: ChartJS) {
      const xScale = chart.scales.x;
      const yScale = chart.scales.y;
      const ctx = chart.ctx;
      const chartLabels = (chart.data.labels || []) as string[];
      const blStart = chartLabels.indexOf('05/11');
      const blEnd = chartLabels.indexOf('05/20');
      if (blStart >= 0 && blEnd >= 0) {
        const half = (xScale.getPixelForValue(1) - xScale.getPixelForValue(0)) / 2;
        const x0 = xScale.getPixelForValue(blStart) - half;
        const x1 = xScale.getPixelForValue(blEnd) + half;
        ctx.save();
        ctx.fillStyle = 'rgba(221,87,89,0.08)';
        ctx.fillRect(x0, yScale.top, x1 - x0, yScale.bottom - yScale.top);
        ctx.fillStyle = TP.red;
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Tracking Blackout', (x0 + x1) / 2, yScale.top + 12);
        ctx.restore();
      }
    },
  }), []);

  const blackoutDays = useMemo(() => sorted.filter((e) => isBlackout(e.date)).length, [sorted]);

  /* ──── Monthly spend summary table ──── */
  const monthlySpend = useMemo(() => {
    const byMonth = new Map<string, { spend: number; clicks: number; impressions: number }>();
    // Prior months (Apr, May) — added first so daily data can override if it exists
    GOOGLE_ADS_PRIOR_MONTHS.forEach((m) => {
      const hasDailyData = sorted.some((e) => {
        const [y, mo] = e.date.split('-').map(Number);
        return y === m.year && mo === m.monthIdx;
      });
      if (!hasDailyData) {
        byMonth.set(m.month, { spend: m.spend, clicks: m.clicks, impressions: m.impressions });
      }
    });
    // Daily data (June+)
    sorted.forEach((e) => {
      const [y, m] = e.date.split('-');
      const key = `${MONTH_SHORT[parseInt(m, 10)]} ${y}`;
      if (!byMonth.has(key)) byMonth.set(key, { spend: 0, clicks: 0, impressions: 0 });
      const bucket = byMonth.get(key)!;
      bucket.spend += e.spend || 0;
      bucket.clicks += e.clicks || 0;
      bucket.impressions += e.impressions || 0;
    });
    return Array.from(byMonth.entries()).map(([label, v]) => ({
      label,
      spend: v.spend,
      clicks: v.clicks,
      impressions: v.impressions,
      cpc: v.clicks > 0 ? v.spend / v.clicks : 0,
      ctr: v.impressions > 0 ? (v.clicks / v.impressions) * 100 : 0,
    }));
  }, [sorted]);

  /* ──── Meta historical stats ──── */
  const metaTotalSpend = META_MONTHLY.reduce((s, m) => s + m.spend, 0);
  const metaTotalLeads = META_MONTHLY.reduce((s, m) => s + m.leads, 0);
  const metaCPL = metaTotalLeads > 0 ? metaTotalSpend / metaTotalLeads : 0;

  /* ──── RENDER ──── */

  if (loading) {
    return <div style={{ color: '#999', padding: '48px 0', textAlign: 'center' }}>Loading paid ads data...</div>;
  }

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '12px 16px', borderRadius: 8, fontSize: 14, marginBottom: 16 }}>{error}</div>
      )}

      {/* ═══════ KPI CARDS ═══════ */}
      <div style={{ fontSize: 16, fontWeight: 700, color: '#E57373', borderBottom: '2px solid #E57373', paddingBottom: 8, marginBottom: 16 }}>
        Google Ads — Overview
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 8 }}>
        <KPICard color="#E57373" label="Total Spend" value={`$${googleTotalSpend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} sub="Source: Google Ads" />
        <KPICard color={TP.darkPurple} label="Form Opens" value={`${totalFormOpens.toLocaleString()}`} sub={`$${Math.round(costPerFormOpen)} per open`} />
        <KPICard color={TP.yellow} label="Leads Created" value={`${totalLeadsCreated}`} sub={`$${Math.round(costPerLead)} per lead`} />
        <KPICard color={TP.blue} label="Completion" value={`${completionRate.toFixed(0)}%`} sub={`${totalCompleted} of ${totalLeadsCreated} completed`} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 8 }}>
        <KPICard color="#00C853" label="Checkouts" value={`${totalCheckouts}`} sub={`${completedToCheckoutRate.toFixed(1)}% of completed`} />
        <KPICard color="#E57373" label="CAC" value={totalCheckouts > 0 ? `$${Math.round(cac).toLocaleString()}` : '—'} sub="Spend ÷ checkouts" />
        <KPICard color={TP.green} label="Revenue" value={`$${GOOGLE_REVENUE.toLocaleString()}`} sub={`$${Math.round(GOOGLE_REVENUE / totalCheckouts).toLocaleString()} avg order`} />
      </div>
      <div style={{ fontSize: '0.78em', color: '#888', marginBottom: 28, fontStyle: 'italic' }}>
        Form opens from Google Ads. Lead and checkout counts from Salesforce. {totalReferredOut} referred out (13% of completed — cannot convert).
      </div>

      {/* ═══════ SALESFORCE PIPELINE ═══════ */}
      <div style={{ fontSize: 16, fontWeight: 700, color: TP.navy, borderBottom: `2px solid ${TP.navy}`, paddingBottom: 8, marginBottom: 16 }}>
        Salesforce Pipeline
      </div>
      <div style={{ fontSize: '0.8em', color: '#888', marginBottom: 12 }}>Source: Salesforce</div>

      <ChartCard>
        <div style={{ height: 260 }}>
          <Bar
            data={{
              labels: pipelineBar.map(s => s.label),
              datasets: [{
                data: pipelineBar.map(s => s.val),
                backgroundColor: pipelineBar.map(s => s.color),
                borderColor: pipelineBar.map(s => s.color),
                borderWidth: 1,
                borderRadius: 6,
                barPercentage: 0.7,
              }],
            }}
            options={{
              indexAxis: 'y' as const,
              responsive: true, maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
                tooltip: {
                  callbacks: {
                    label: (ctx) => {
                      const val = ctx.parsed.x ?? 0;
                      const pct = totalLeadsCreated > 0 ? (val / totalLeadsCreated * 100).toFixed(1) : '0';
                      return `${val} (${pct}% of leads)`;
                    },
                  },
                },
              },
              scales: {
                x: { beginAtZero: true, title: { display: true, text: 'Count', font: { size: 10 } } },
                y: { ticks: { font: { size: 12, weight: 'bold' } } },
              },
            }}
          />
        </div>
      </ChartCard>

      <div style={{ background: '#f0f7ed', borderLeft: '4px solid #5BA88C', borderRadius: 8, padding: '14px 18px', marginBottom: 32 }}>
        <div style={{ fontWeight: 700, color: TP.navy }}>
          {totalFormOpens.toLocaleString()} form opens → {totalLeadsCreated} leads → {totalCompleted} completed ({completionRate.toFixed(0)}%) → {totalCheckouts} checkouts ({completedToCheckoutRate.toFixed(1)}% of completed).
        </div>
        <div style={{ fontSize: '0.85em', color: '#555', marginTop: 6 }}>
          {totalIncomplete} still incomplete (Waiting Info). {totalReferredOut} referred out. {GOOGLE_SF_PIPELINE.sentCheckout - GOOGLE_SF_PIPELINE.checkedOut} sitting at Sent Checkout Link.
        </div>
      </div>

      {/* ═══════ COHORT MATURITY ANALYSIS ═══════ */}
      <div style={{ fontSize: 16, fontWeight: 700, color: TP.navy, borderBottom: `2px solid ${TP.navy}`, paddingBottom: 8, marginBottom: 16 }}>
        Cohort Maturity Analysis
      </div>
      <div style={{ fontSize: '0.8em', color: '#888', marginBottom: 8 }}>Source: Salesforce (subs/checkouts) + Google Ads (spend). Weekly cohorts by submission date.</div>

      <div style={{ fontSize: '0.85em', color: '#555', marginBottom: 12, lineHeight: 1.6 }}>
        Adjusted CAC projects forward using observed checkout timing (median {CONVERSION_TIMING.median}d, max {CONVERSION_TIMING.max}d). Cohorts under 2 weeks are too young to show meaningful checkout data.
        Checkout rate (CO %) = checkouts / completed subs.
      </div>

      <div style={{ marginBottom: 16 }}>
        <button
          onClick={() => setShowMaturityRef(!showMaturityRef)}
          style={{
            background: 'none', border: 'none', color: TP.blue, cursor: 'pointer',
            fontSize: '0.82em', fontWeight: 600, padding: 0, textDecoration: 'underline',
          }}
        >
          {showMaturityRef ? 'Hide' : 'Show'} maturity curve reference
        </button>
        {showMaturityRef && (
          <div style={{
            background: '#f8f9fa', borderRadius: 8, padding: '12px 16px', marginTop: 8,
            fontSize: '0.82em', color: '#555', border: '1px solid #e8e8e8',
          }}>
            <div style={{ fontWeight: 600, marginBottom: 6, color: TP.navy }}>Checkout Maturity Curve (observed from {CONVERSION_TIMING.count} checkouts)</div>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              {MATURITY_CURVE.filter(p => p.days > 0).map(p => (
                <span key={p.days}>{p.days}d = {Math.round(p.pct * 100)}%</span>
              ))}
            </div>
            <div style={{ marginTop: 6, color: '#888', fontSize: '0.9em' }}>
              Built from actual checkout timing: median {CONVERSION_TIMING.median}d, range {CONVERSION_TIMING.min}–{CONVERSION_TIMING.max}d. A cohort under 2 weeks tells you nothing; at ~5 weeks it is fully mature.
            </div>
          </div>
        )}
      </div>

      <div style={{ overflowX: 'auto', marginBottom: 20 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82em', background: '#fff', borderRadius: 10, overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }}>
          <thead>
            <tr style={{ background: TP.navy }}>
              {['Week', 'Spend', 'Leads', 'Completed', 'Comp %', 'Checkouts', 'CO %', 'Age', 'Maturity', 'Projected', 'Adj CAC'].map(h => (
                <th key={h} style={{ padding: '8px 10px', textAlign: h === 'Week' ? 'left' : 'right', color: '#fff', whiteSpace: 'nowrap', fontSize: '0.85em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cohortData.map((c, idx) => (
              <tr key={c.label} style={{
                background: idx % 2 === 0 ? '#f9f9f9' : '#fff',
                opacity: c.maturity < 0.40 ? 0.6 : 1,
              }}>
                <td style={{ padding: '6px 8px', fontWeight: 600, whiteSpace: 'nowrap' }}>{c.label}</td>
                <td style={{ padding: '6px 8px', textAlign: 'right' }}>${Math.round(c.spend).toLocaleString()}</td>
                <td style={{ padding: '6px 8px', textAlign: 'right' }}>{c.leads}</td>
                <td style={{ padding: '6px 8px', textAlign: 'right' }}>{c.completed}</td>
                <td style={{ padding: '6px 8px', textAlign: 'right', color: c.completionRate >= 0.45 ? '#00C853' : (c.completionRate >= 0.35 ? TP.yellow : '#E57373') }}>
                  {c.leads > 0 ? `${Math.round(c.completionRate * 100)}%` : '—'}
                </td>
                <td style={{ padding: '6px 8px', textAlign: 'right' }}>{c.checkouts}</td>
                <td style={{ padding: '6px 8px', textAlign: 'right', color: c.completed > 0 && c.checkouts > 0 ? '#00C853' : '#888' }}>
                  {c.completed > 0 && c.ageDays >= 14 ? (c.checkouts > 0 ? `${Math.round(c.checkouts / c.completed * 100)}%` : '0%') : (c.ageDays < 14 ? <span style={{ fontSize: '0.8em' }}>too early</span> : '—')}
                </td>
                <td style={{ padding: '6px 8px', textAlign: 'right' }}>{c.ageDays}d</td>
                <td style={{ padding: '6px 8px', textAlign: 'right' }}>{Math.round(c.maturity * 100)}%</td>
                <td style={{ padding: '6px 8px', textAlign: 'right' }}>{c.ageDays >= 14 && c.projectedFinal > 0 ? c.projectedFinal.toFixed(1) : (c.ageDays < 14 ? <span style={{ fontSize: '0.8em', color: '#aaa' }}>too early</span> : '—')}</td>
                <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 600, color: c.adjCAC !== null && c.adjCAC <= 1711 ? '#00C853' : (c.adjCAC !== null ? '#E57373' : '#888') }}>
                  {c.adjCAC !== null ? `$${Math.round(c.adjCAC).toLocaleString()}` : (c.ageDays < 14 ? <span style={{ fontSize: '0.8em', fontWeight: 400, color: '#aaa' }}>too early</span> : '—')}
                </td>
              </tr>
            ))}
            <tr style={{ background: TP.navy, color: '#fff', fontWeight: 700 }}>
              <td style={{ padding: '8px 10px' }}>Total</td>
              <td style={{ padding: '8px 10px', textAlign: 'right' }}>${Math.round(cohortTotals.totalSpend).toLocaleString()}</td>
              <td style={{ padding: '8px 10px', textAlign: 'right' }}>{cohortTotals.totalLeads}</td>
              <td style={{ padding: '8px 10px', textAlign: 'right' }}>{cohortTotals.totalCompleted}</td>
              <td style={{ padding: '8px 10px', textAlign: 'right' }}>{cohortTotals.totalLeads > 0 ? `${Math.round(cohortTotals.totalCompleted / cohortTotals.totalLeads * 100)}%` : '—'}</td>
              <td style={{ padding: '8px 10px', textAlign: 'right' }}>{cohortTotals.totalCheckouts}</td>
              <td style={{ padding: '8px 10px', textAlign: 'right' }}>{cohortTotals.totalCompleted > 0 ? `${Math.round(cohortTotals.totalCheckouts / cohortTotals.totalCompleted * 100)}%` : '—'}</td>
              <td style={{ padding: '8px 10px', textAlign: 'right' }}></td>
              <td style={{ padding: '8px 10px', textAlign: 'right' }}></td>
              <td style={{ padding: '8px 10px', textAlign: 'right' }}>{cohortTotals.totalProjected > 0 ? cohortTotals.totalProjected.toFixed(1) : '—'}</td>
              <td style={{ padding: '8px 10px', textAlign: 'right' }}>{cohortTotals.overallAdjCAC !== null ? `$${Math.round(cohortTotals.overallAdjCAC).toLocaleString()}` : '—'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ─── Maturity Projection Summary ─── */}
      <div style={{ background: '#f0f4ff', border: '1px solid #c7d2fe', borderRadius: 10, padding: '20px 24px', marginBottom: 28 }}>
        <div style={{ fontWeight: 700, fontSize: '0.95em', color: TP.navy, marginBottom: 14 }}>
          Maturity Projection — What the Data Says When You Let It Settle
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 16 }}>
          <div style={{ background: '#fff', borderRadius: 8, padding: '14px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75em', color: '#888', marginBottom: 4 }}>Actual Checkouts</div>
            <div style={{ fontSize: '1.6em', fontWeight: 700, color: '#888' }}>{cohortTotals.totalCheckouts}</div>
            <div style={{ fontSize: '0.75em', color: '#aaa' }}>as of today</div>
          </div>
          <div style={{ background: '#fff', borderRadius: 8, padding: '14px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75em', color: '#888', marginBottom: 4 }}>Projected Total</div>
            <div style={{ fontSize: '1.6em', fontWeight: 700, color: TP.navy }}>{cohortTotals.totalProjected.toFixed(1)}</div>
            <div style={{ fontSize: '0.75em', color: '#aaa' }}>when all cohorts mature</div>
          </div>
          <div style={{ background: '#fff', borderRadius: 8, padding: '14px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75em', color: '#888', marginBottom: 4 }}>Still Coming</div>
            <div style={{ fontSize: '1.6em', fontWeight: 700, color: '#00C853' }}>+{cohortTotals.additionalCheckouts.toFixed(1)}</div>
            <div style={{ fontSize: '0.75em', color: '#aaa' }}>from existing pipeline</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 16 }}>
          <div style={{ background: '#fff', borderRadius: 8, padding: '14px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
              <span style={{ fontSize: '0.82em', color: '#888' }}>Raw CAC (today)</span>
              <span style={{ fontSize: '1.3em', fontWeight: 700, color: '#E57373' }}>
                {cohortTotals.overallRawCAC !== null ? `$${Math.round(cohortTotals.overallRawCAC).toLocaleString()}` : '—'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: '0.82em', color: '#888' }}>Maturity-Adj CAC</span>
              <span style={{ fontSize: '1.3em', fontWeight: 700, color: '#00C853' }}>
                {cohortTotals.overallAdjCAC !== null ? `$${Math.round(cohortTotals.overallAdjCAC).toLocaleString()}` : '—'}
              </span>
            </div>
          </div>
          <div style={{ background: '#fff', borderRadius: 8, padding: '14px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
              <span style={{ fontSize: '0.82em', color: '#888' }}>Checkout Rate</span>
              <span style={{ fontSize: '1.3em', fontWeight: 700, color: TP.navy }}>
                {cohortTotals.totalCompleted > 0 ? `${Math.round(cohortTotals.totalCheckouts / cohortTotals.totalCompleted * 100)}%` : '—'}
              </span>
            </div>
            <div style={{ fontSize: '0.75em', color: '#aaa' }}>
              {cohortTotals.totalCheckouts} of {cohortTotals.totalCompleted} completed subs
            </div>
          </div>
          <div style={{ background: '#fff', borderRadius: 8, padding: '14px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
              <span style={{ fontSize: '0.82em', color: '#888' }}>Actual Revenue</span>
              <span style={{ fontSize: '1.3em', fontWeight: 700, color: '#888' }}>${GOOGLE_REVENUE.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: '0.82em', color: '#888' }}>Projected Revenue</span>
              <span style={{ fontSize: '1.3em', fontWeight: 700, color: '#00C853' }}>
                ${Math.round(cohortTotals.projectedRevenue).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div style={{ fontSize: '0.78em', color: '#666', lineHeight: 1.6 }}>
          Based on observed checkout timing ({CONVERSION_TIMING.count} checkouts, median {CONVERSION_TIMING.median}d, max {CONVERSION_TIMING.max}d). Cohorts under ~5 weeks have not fully converted yet.
          Projected values estimate additional checkouts from leads already in the pipeline as those cohorts age.
          Avg revenue per checkout: ${Math.round(cohortTotals.avgRevPerCheckout).toLocaleString()}.
        </div>
      </div>

      <ChartLabel>Adjusted CAC Trend (cohorts ≥ 14 days old)</ChartLabel>
      <ChartCard>
        <div style={{ height: 300 }}>
          {cohortData.filter(c => c.ageDays >= 14).length > 0 ? (
            <Bar
              data={{
                labels: cohortData.filter(c => c.ageDays >= 14).map(c => c.label),
                datasets: [
                  {
                    label: 'Adj CAC',
                    data: cohortData.filter(c => c.ageDays >= 14).map(c => c.adjCAC),
                    backgroundColor: cohortData.filter(c => c.ageDays >= 14).map(c =>
                      c.adjCAC !== null && c.adjCAC <= 1711 ? '#00C853' : TP.blue
                    ),
                    borderColor: TP.navy,
                    borderWidth: 1,
                    borderRadius: 4,
                    barPercentage: 0.7,
                    categoryPercentage: 0.8,
                  },
                  {
                    label: `$${Math.round(cohortTotals.avgRevPerCheckout).toLocaleString()} Avg Order (break-even)`,
                    data: cohortData.filter(c => c.ageDays >= 14).map(() => cohortTotals.avgRevPerCheckout),
                    type: 'line',
                    borderColor: TP.red,
                    borderWidth: 2,
                    borderDash: [8, 4],
                    pointRadius: 0,
                    fill: false,
                  } as never,
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'top', labels: { usePointStyle: true, padding: 14, font: { size: 11 } } },
                  tooltip: {
                    callbacks: {
                      label: (ctx) => {
                        if (ctx.dataset.label === '$500 Target') return '$500 Target';
                        const val = ctx.parsed.y;
                        return val !== null ? `${ctx.dataset.label}: $${Math.round(val).toLocaleString()}` : `${ctx.dataset.label}: --`;
                      },
                    },
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: { callback: (v) => `$${Number(v).toLocaleString()}` },
                    title: { display: true, text: 'Cost per Checkout', font: { size: 10 } },
                  },
                },
              }}
            />
          ) : <NoData />}
        </div>
      </ChartCard>

      {/* ═══════ CONVERSION TIMING ═══════ */}
      <div style={{ fontSize: 16, fontWeight: 700, color: TP.navy, borderBottom: `2px solid ${TP.navy}`, paddingBottom: 8, marginBottom: 16 }}>
        Conversion Timing
      </div>
      <div style={{
        background: '#fff', borderRadius: 12, padding: '20px 24px', marginBottom: 32,
        boxShadow: '0 4px 15px rgba(0,0,0,0.08)', borderTop: `3px solid ${TP.blue}`,
      }}>
        <div style={{ fontSize: '1.3em', fontWeight: 'bold', color: TP.navy, marginBottom: 6 }}>
          Median {CONVERSION_TIMING.median} days from lead to checkout
        </div>
        <div style={{ fontSize: '0.9em', color: '#666' }}>
          Range: {CONVERSION_TIMING.min}–{CONVERSION_TIMING.max} days (average {CONVERSION_TIMING.mean} days), n={CONVERSION_TIMING.count}
        </div>
        <div style={{ fontSize: '0.75em', color: '#aaa', marginTop: 8 }}>Source: Salesforce</div>
      </div>

      {/* ═══════ SUBMISSION COMPLETION MATURITY ═══════ */}
      <div style={{ fontSize: 16, fontWeight: 700, color: TP.navy, borderBottom: `2px solid ${TP.navy}`, paddingBottom: 8, marginBottom: 16 }}>
        Submission Completion Maturity
      </div>
      <div style={{ fontSize: '0.8em', color: '#888', marginBottom: 8 }}>Source: Salesforce. How quickly leads complete the assessment after opening the form, by weekly cohort.</div>
      <div style={{ fontSize: '0.85em', color: '#555', marginBottom: 16, lineHeight: 1.6 }}>
        Each column shows the cumulative % of leads that finished their submission within that many days of starting. Most who complete do so within the first day. The gap between ≤1d and ≤14d tells you how many return later to finish.
      </div>

      <div style={{ overflowX: 'auto', marginBottom: 20 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82em', background: '#fff', borderRadius: 10, overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }}>
          <thead>
            <tr style={{ background: TP.navy }}>
              {['Week', 'Leads', 'Age', '≤ 1 day', '≤ 3 days', '≤ 7 days', '≤ 14 days'].map(h => (
                <th key={h} style={{ padding: '8px 10px', textAlign: h === 'Week' ? 'left' : 'right', color: '#fff', whiteSpace: 'nowrap', fontSize: '0.85em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SF_COMPLETION_MATURITY.map((c, idx) => {
              const d = new Date(c.week);
              const label = `${MONTH_SHORT[d.getMonth() + 1]} ${d.getDate()}`;
              const cellStyle = (val: number | null) => ({
                padding: '6px 8px' as const,
                textAlign: 'right' as const,
                color: val === null ? '#ccc' : (val >= 45 ? '#00C853' : (val >= 30 ? TP.yellow : '#E57373')),
                fontWeight: (val !== null && val >= 45 ? 600 : 400) as number,
              });
              return (
                <tr key={c.week} style={{ background: idx % 2 === 0 ? '#f9f9f9' : '#fff' }}>
                  <td style={{ padding: '6px 8px', fontWeight: 600, whiteSpace: 'nowrap' }}>{label}</td>
                  <td style={{ padding: '6px 8px', textAlign: 'right' }}>{c.leads}</td>
                  <td style={{ padding: '6px 8px', textAlign: 'right', color: '#888' }}>{c.ageDays}d</td>
                  <td style={cellStyle(c.d1)}>{c.d1 !== null ? `${c.d1.toFixed(1)}%` : '—'}</td>
                  <td style={cellStyle(c.d3)}>{c.d3 !== null ? `${c.d3.toFixed(1)}%` : '—'}</td>
                  <td style={cellStyle(c.d7)}>{c.d7 !== null ? `${c.d7.toFixed(1)}%` : '—'}</td>
                  <td style={cellStyle(c.d14)}>{c.d14 !== null ? `${c.d14.toFixed(1)}%` : '—'}</td>
                </tr>
              );
            })}
            {(() => {
              const mature = SF_COMPLETION_MATURITY.filter(c => c.d14 !== null && c.ageDays >= 14);
              if (mature.length === 0) return null;
              const avgD1 = mature.reduce((s, c) => s + (c.d1 ?? 0), 0) / mature.length;
              const avgD3 = mature.reduce((s, c) => s + (c.d3 ?? 0), 0) / mature.length;
              const avgD7 = mature.reduce((s, c) => s + (c.d7 ?? 0), 0) / mature.length;
              const avgD14 = mature.reduce((s, c) => s + (c.d14 ?? 0), 0) / mature.length;
              const totalLeads = mature.reduce((s, c) => s + c.leads, 0);
              return (
                <tr style={{ background: TP.navy, color: '#fff', fontWeight: 700 }}>
                  <td style={{ padding: '8px 10px' }}>Avg</td>
                  <td style={{ padding: '8px 10px', textAlign: 'right' }}>{totalLeads}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'right' }}></td>
                  <td style={{ padding: '8px 10px', textAlign: 'right' }}>{avgD1.toFixed(1)}%</td>
                  <td style={{ padding: '8px 10px', textAlign: 'right' }}>{avgD3.toFixed(1)}%</td>
                  <td style={{ padding: '8px 10px', textAlign: 'right' }}>{avgD7.toFixed(1)}%</td>
                  <td style={{ padding: '8px 10px', textAlign: 'right' }}>{avgD14.toFixed(1)}%</td>
                </tr>
              );
            })()}
          </tbody>
        </table>
      </div>

      <div style={{ background: '#f0f7ed', borderLeft: '4px solid #5BA88C', borderRadius: 8, padding: '14px 18px', marginBottom: 32, fontSize: '0.85em', color: '#555', lineHeight: 1.6 }}>
        Most completions happen same-day. The small gap between ≤1d and ≤14d means very few leads come back to finish later — if they don't complete right away, they probably won't.
      </div>

      {/* ═══════ PIPELINE AGING ═══════ */}
      <div style={{ fontSize: 16, fontWeight: 700, color: TP.navy, borderBottom: `2px solid ${TP.navy}`, paddingBottom: 8, marginBottom: 16 }}>
        Pipeline Aging — Sent Checkout Link
      </div>
      <div style={{ fontSize: '0.8em', color: '#888', marginBottom: 8 }}>Source: Salesforce. {SF_PIPELINE_AGING.total} leads currently at &quot;Sent Checkout Link&quot; stage, bucketed by days since Created Date.</div>
      <div style={{ fontSize: '0.85em', color: '#555', marginBottom: 16, lineHeight: 1.6 }}>
        No checkout has ever taken longer than {CONVERSION_TIMING.max} days. Leads in the 33+ bucket are effectively dead — they will not convert without direct re-engagement.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
        <div style={{ background: '#fff', borderRadius: 10, padding: '14px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderTop: '3px solid #00C853', textAlign: 'center' }}>
          <div style={{ fontSize: '0.65em', color: '#666', textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: 4 }}>Fresh (0–14 days)</div>
          <div style={{ fontSize: '1.8em', fontWeight: 'bold', color: '#00C853' }}>{SF_PIPELINE_AGING.fresh}</div>
          <div style={{ fontSize: '0.72em', color: '#888', marginTop: 4 }}>Expect checkouts in 1–2 weeks</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 10, padding: '14px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderTop: `3px solid ${TP.yellow}`, textAlign: 'center' }}>
          <div style={{ fontSize: '0.65em', color: '#666', textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: 4 }}>Maturing (15–32 days)</div>
          <div style={{ fontSize: '1.8em', fontWeight: 'bold', color: TP.yellow }}>{SF_PIPELINE_AGING.maturing}</div>
          <div style={{ fontSize: '0.72em', color: '#888', marginTop: 4 }}>Mid-process, most checkouts happen here</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 10, padding: '14px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderTop: '3px solid #E57373', textAlign: 'center' }}>
          <div style={{ fontSize: '0.65em', color: '#666', textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: 4 }}>Stale (33+ days)</div>
          <div style={{ fontSize: '1.8em', fontWeight: 'bold', color: '#E57373' }}>{SF_PIPELINE_AGING.stale}</div>
          <div style={{ fontSize: '0.72em', color: '#888', marginTop: 4 }}>Past max observed checkout time</div>
        </div>
      </div>

      {/* Pipeline aging stacked bar */}
      <ChartCard>
        <div style={{ height: 80 }}>
          <div style={{ display: 'flex', height: '100%', borderRadius: 8, overflow: 'hidden' }}>
            {[
              { label: 'Fresh', count: SF_PIPELINE_AGING.fresh, color: '#00C853' },
              { label: 'Maturing', count: SF_PIPELINE_AGING.maturing, color: TP.yellow },
              { label: 'Stale', count: SF_PIPELINE_AGING.stale, color: '#E57373' },
            ].map((b) => (
              <div key={b.label} style={{
                width: `${(b.count / SF_PIPELINE_AGING.total) * 100}%`,
                background: b.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 700, fontSize: '0.9em',
                minWidth: b.count > 0 ? 60 : 0,
              }}>
                {b.count > 0 && `${b.count} (${Math.round(b.count / SF_PIPELINE_AGING.total * 100)}%)`}
              </div>
            ))}
          </div>
        </div>
      </ChartCard>

      <div style={{ background: '#fef2f2', borderLeft: '4px solid #E57373', borderRadius: 8, padding: '14px 18px', marginBottom: 32, fontSize: '0.85em', color: '#555', lineHeight: 1.6 }}>
        {SF_PIPELINE_AGING.stale} of {SF_PIPELINE_AGING.total} checkout links ({Math.round(SF_PIPELINE_AGING.stale / SF_PIPELINE_AGING.total * 100)}%) are past the point where any checkout has ever converted.
        {SF_PIPELINE_AGING.fresh + SF_PIPELINE_AGING.maturing} are still within the conversion window.
      </div>

      {/* ═══════ DAILY SPEND TREND ═══════ */}
      <div style={{ fontSize: 16, fontWeight: 700, color: '#E57373', borderBottom: '2px solid #E57373', paddingBottom: 8, marginBottom: 16 }}>
        Daily Spend Trend
      </div>
      <div style={{ fontSize: '0.8em', color: '#888', marginBottom: 12 }}>Source: Google Ads</div>

      <ChartCard>
        <div style={{ height: 320 }}>
          {sorted.length > 1 ? (
            <Line
              data={{
                labels: spendTrend.labels,
                datasets: [
                  { label: 'Daily Spend ($)', data: spendTrend.spendVals, borderColor: '#E57373', borderWidth: 2, tension: 0.3, fill: false, pointRadius: 2, pointBackgroundColor: '#E57373' },
                  { label: '7-Day Avg', data: spendTrend.movingAvg, borderColor: TP.blue, borderWidth: 2.5, tension: 0.3, fill: false, pointRadius: 0, borderDash: [5, 3] },
                ],
              }}
              options={{
                responsive: true, maintainAspectRatio: false,
                layout: { padding: { top: 24 } },
                plugins: {
                  legend: { position: 'top', labels: { usePointStyle: true, padding: 16, font: { size: 11 } } },
                  tooltip: { mode: 'index' as const, intersect: false, callbacks: { label: (ctx) => `${ctx.dataset.label}: $${ctx.parsed.y !== null ? ctx.parsed.y.toFixed(2) : '--'}` } },
                },
                scales: {
                  y: { beginAtZero: true, ticks: { callback: (v) => `$${Number(v).toFixed(0)}` }, title: { display: true, text: 'Spend', font: { size: 10 } } },
                },
                interaction: { mode: 'nearest' as const, axis: 'x' as const, intersect: false },
              }}
              plugins={[blackoutAnnotation as never]}
            />
          ) : <NoData />}
        </div>
      </ChartCard>
      {blackoutDays > 0 && (
        <div style={{ fontSize: '0.78em', color: '#888', marginTop: -16, marginBottom: 32, fontStyle: 'italic' }}>
          May 11–20 shaded above: the go.toothpillow tracking link was broken during this window. Spend shown here is unaffected.
        </div>
      )}

      {/* ═══════ MONTHLY SPEND SUMMARY ═══════ */}
      <div style={{ fontSize: 16, fontWeight: 700, color: TP.navy, borderBottom: `2px solid ${TP.navy}`, paddingBottom: 8, marginBottom: 16 }}>
        Monthly Spend Summary
      </div>
      <div style={{ fontSize: '0.8em', color: '#888', marginBottom: 12 }}>Source: Google Ads</div>

      <div style={{ overflowX: 'auto', marginBottom: 32 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85em', background: '#fff', borderRadius: 10, overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }}>
          <thead>
            <tr style={{ background: TP.navy }}>
              {['Month', 'Spend', 'Clicks', 'Impressions', 'CPC', 'CTR'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: h === 'Month' ? 'left' : 'right', color: '#fff' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {monthlySpend.map((m, idx) => (
              <tr key={m.label} style={{ background: idx % 2 === 0 ? '#f9f9f9' : '#fff' }}>
                <td style={{ padding: '8px 14px', fontWeight: 600 }}>{m.label}</td>
                <td style={{ padding: '8px 14px', textAlign: 'right' }}>${m.spend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td style={{ padding: '8px 14px', textAlign: 'right' }}>{m.clicks.toLocaleString()}</td>
                <td style={{ padding: '8px 14px', textAlign: 'right' }}>{m.impressions.toLocaleString()}</td>
                <td style={{ padding: '8px 14px', textAlign: 'right' }}>${m.cpc.toFixed(2)}</td>
                <td style={{ padding: '8px 14px', textAlign: 'right' }}>{m.ctr.toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ═══════ ADD / UPDATE DAY ═══════ */}
      <div style={{ fontSize: 16, fontWeight: 700, color: '#E57373', borderBottom: '2px solid #E57373', paddingBottom: 8, marginBottom: 16 }}>
        Google Ads — Daily Entry
      </div>

      <div style={{ background: '#fff', borderRadius: 12, padding: '16px 20px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', marginBottom: 16 }}>
        <div style={{ fontWeight: 600, color: TP.navy, marginBottom: 12, fontSize: 14 }}>Add / Update Day</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'end' }}>
          <FormField label="Date"><input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} style={inputStyle} /></FormField>
          <FormField label="Spend"><input type="number" step="0.01" value={formSpend} onChange={(e) => setFormSpend(e.target.value)} placeholder="0.00" style={{ ...inputStyle, width: 80 }} /></FormField>
          <FormField label="Impressions"><input type="number" value={formImpressions} onChange={(e) => setFormImpressions(e.target.value)} placeholder="0" style={{ ...inputStyle, width: 70 }} /></FormField>
          <FormField label="Clicks"><input type="number" value={formClicks} onChange={(e) => setFormClicks(e.target.value)} placeholder="0" style={{ ...inputStyle, width: 60 }} /></FormField>
          <FormField label="Opened"><input type="number" value={formSubmit} onChange={(e) => setFormSubmit(e.target.value)} placeholder="0" style={{ ...inputStyle, width: 60 }} /></FormField>
          <FormField label="Started"><input type="number" value={formStarted} onChange={(e) => setFormStarted(e.target.value)} placeholder="0" style={{ ...inputStyle, width: 60 }} /></FormField>
          <FormField label="Completed"><input type="number" value={formFinished} onChange={(e) => setFormFinished(e.target.value)} placeholder="0" style={{ ...inputStyle, width: 60 }} /></FormField>
          <FormField label="Tx"><input type="number" value={formTreatment} onChange={(e) => setFormTreatment(e.target.value)} placeholder="0" style={{ ...inputStyle, width: 50 }} /></FormField>
          <button onClick={handleSave} disabled={saving || !formDate} style={{
            padding: '6px 14px', fontSize: '0.85em', background: TP.blue, color: '#fff',
            border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, opacity: saving ? 0.5 : 1, marginBottom: 1,
          }}>
            {saving ? 'Saving...' : 'Add'}
          </button>
        </div>
        <div style={{ fontSize: '0.72em', color: '#aaa', marginTop: 10 }}>
          Opened/Started/Completed/Tx are recorded here for reference only — they are not used in any calculation on this page. Leads and checkouts come from Salesforce.
        </div>
      </div>

      {/* Recent entries, click to edit */}
      <div style={{ overflowX: 'auto', marginBottom: 24 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8em', background: '#fff', borderRadius: 10, overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }}>
          <thead>
            <tr style={{ background: TP.navy }}>
              {['Date', 'Spend', 'Impressions', 'Clicks'].map((h) => (
                <th key={h} style={{ padding: '8px 10px', textAlign: h === 'Date' ? 'left' : 'right', color: '#fff' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...sorted].reverse().slice(0, 10).map((e, idx) => (
              <tr key={e.date} onClick={() => handleRowClick(e)} style={{
                background: idx % 2 === 0 ? '#f9f9f9' : '#fff', cursor: 'pointer',
              }}>
                <td style={{ padding: '6px 10px', whiteSpace: 'nowrap' }}>{e.date}</td>
                <td style={{ padding: '6px 10px', textAlign: 'right' }}>${(e.spend || 0).toFixed(2)}</td>
                <td style={{ padding: '6px 10px', textAlign: 'right' }}>{(e.impressions || 0).toLocaleString()}</td>
                <td style={{ padding: '6px 10px', textAlign: 'right' }}>{e.clicks || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ fontSize: '0.75em', color: '#aaa', marginTop: 6 }}>Showing most recent 10 days. Click a row to edit it above.</div>
      </div>

      {/* ═══════ META ADS (PAUSED — HISTORICAL) ═══════ */}
      <div style={{ marginTop: 32 }}>
        <button
          onClick={() => setShowMeta(!showMeta)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            fontSize: 16, fontWeight: 700, color: '#999', borderBottom: '2px solid #ccc',
            paddingBottom: 8, marginBottom: 12, width: '100%', textAlign: 'left',
          }}
        >
          {showMeta ? '▾' : '▸'} Meta Ads (Paused — Historical)
        </button>
        {showMeta && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
              <KPICard color="#999" label="Total Spend" value={`$${Math.round(metaTotalSpend).toLocaleString()}`} sub="Mar 2025–Apr 2026" />
              <KPICard color="#999" label="Total Leads" value={`${metaTotalLeads}`} sub="Mar 2025–Apr 2026" />
              <KPICard color="#999" label="Cost per Lead" value={metaCPL > 0 ? `$${Math.round(metaCPL).toLocaleString()}` : '—'} sub="Historical" />
            </div>
            <div style={{ overflowX: 'auto', marginBottom: 16 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82em', background: '#fff', borderRadius: 10, overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }}>
                <thead>
                  <tr style={{ background: '#999' }}>
                    <th style={{ padding: '8px 12px', textAlign: 'left', color: '#fff' }}>Month</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right', color: '#fff' }}>Spend</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right', color: '#fff' }}>Leads</th>
                  </tr>
                </thead>
                <tbody>
                  {META_MONTHLY.map((m, idx) => (
                    <tr key={m.month} style={{ background: idx % 2 === 0 ? '#f9f9f9' : '#fff' }}>
                      <td style={{ padding: '6px 12px' }}>{m.month}</td>
                      <td style={{ padding: '6px 12px', textAlign: 'right' }}>${m.spend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td style={{ padding: '6px 12px', textAlign: 'right' }}>{m.leads}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ fontSize: '0.82em', color: '#888' }}>
              Final funnel snapshot: {META_FUNNEL.entered} entered, {META_FUNNEL.waitingInfo} waiting on info, {META_FUNNEL.sentCheckout} sent checkout, {META_FUNNEL.checkedOut} checked out, {META_FUNNEL.denied} denied, {META_FUNNEL.closedLost} closed lost. Campaigns paused — budget moved to Google Ads.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   Reusable Sub-Components
   ════════════════════════════════════════════ */

const inputStyle: React.CSSProperties = {
  padding: '5px 8px', border: '1px solid #ddd', borderRadius: 6, fontSize: '0.85em',
};

function KPICard({ color, label, value, sub }: { color: string; label: string; value: string; sub: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', borderRadius: 10, padding: '14px 12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderTop: `3px solid ${color}` }}>
      <div style={{ fontSize: '0.65em', color: '#666', textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: '1.4em', fontWeight: 'bold', color: '#1B2A4A' }}>{value}</div>
      <div style={{ fontSize: '0.72em', color: '#888', marginTop: 4 }}>{sub}</div>
    </div>
  );
}

function ChartLabel({ children }: { children: React.ReactNode }) {
  return <div style={{ fontWeight: 600, color: '#1B2A4A', fontSize: '0.95em', margin: '16px 0 8px' }}>{children}</div>;
}

function ChartCard({ children }: { children: React.ReactNode }) {
  return <div style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 4px 15px rgba(0,0,0,0.08)', marginBottom: 24 }}>{children}</div>;
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ fontSize: '0.75em', color: '#888', display: 'block' }}>{label}</label>
      {children}
    </div>
  );
}

function NoData() {
  return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999' }}>Not enough data yet</div>;
}
