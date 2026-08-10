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
import { Line } from 'react-chartjs-2';
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
// July 14-19 spend/clicks/impressions from Google Ads Campaigns > Day segment, July 20, 2026
// July 6-24 spend/clicks/impressions refreshed from Google Ads Report Editor, July 24, 2026
// July 24 (full day) + July 25-30 spend/clicks/impressions from Google Ads Report Editor, July 30, 2026
// Aug 5 corrected to final + Aug 6 partial added from Google Ads Report Editor, August 6, 2026
// Aug 6 corrected to final + Aug 7-9 added from Google Ads Campaigns view (day-by-day), August 10, 2026
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
  { date: '2026-07-06', spend: 936.89, clicks: 206, impressions: 4891, submit: 11, started: 5, finished: 9, treatment: 1 },
  { date: '2026-07-07', spend: 986.45, clicks: 213, impressions: 4440, submit: 8, started: 1, finished: 2, treatment: 0 },
  { date: '2026-07-08', spend: 775.20, clicks: 196, impressions: 4154, submit: 6, started: 6, finished: 6, treatment: 0 },
  { date: '2026-07-09', spend: 742.87, clicks: 206, impressions: 3795, submit: 7, started: 4, finished: 2, treatment: 0 },
  { date: '2026-07-10', spend: 667.43, clicks: 175, impressions: 2571, submit: 3, started: 2, finished: 5, treatment: 2 },
  { date: '2026-07-11', spend: 608.47, clicks: 156, impressions: 3248, submit: 3, started: 2, finished: 0, treatment: 0 },
  { date: '2026-07-12', spend: 656.37, clicks: 172, impressions: 3544, submit: 6, started: 2, finished: 2, treatment: 0 },
  { date: '2026-07-13', spend: 670.16, clicks: 184, impressions: 3925, submit: 4, started: 4, finished: 8, treatment: 0 },
  { date: '2026-07-14', spend: 675.54, clicks: 174, impressions: 3095, submit: 0, started: 0, finished: 0, treatment: 0 },
  { date: '2026-07-15', spend: 664.07, clicks: 187, impressions: 2558, submit: 0, started: 0, finished: 0, treatment: 0 },
  { date: '2026-07-16', spend: 599.98, clicks: 160, impressions: 3256, submit: 0, started: 0, finished: 0, treatment: 0 },
  { date: '2026-07-17', spend: 515.77, clicks: 134, impressions: 2620, submit: 0, started: 0, finished: 0, treatment: 0 },
  { date: '2026-07-18', spend: 514.45, clicks: 126, impressions: 1932, submit: 0, started: 0, finished: 0, treatment: 0 },
  { date: '2026-07-19', spend: 550.05, clicks: 142, impressions: 2525, submit: 0, started: 0, finished: 0, treatment: 0 },
  { date: '2026-07-20', spend: 653.31, clicks: 172, impressions: 2558, submit: 0, started: 0, finished: 0, treatment: 0 },
  { date: '2026-07-21', spend: 656.91, clicks: 162, impressions: 2514, submit: 0, started: 0, finished: 0, treatment: 0 },
  { date: '2026-07-22', spend: 643.76, clicks: 161, impressions: 2536, submit: 0, started: 0, finished: 0, treatment: 0 },
  { date: '2026-07-23', spend: 605.30, clicks: 144, impressions: 2383, submit: 0, started: 0, finished: 0, treatment: 0 },
  { date: '2026-07-24', spend: 545.50, clicks: 147, impressions: 2107, submit: 0, started: 0, finished: 0, treatment: 0 },
  { date: '2026-07-25', spend: 462.41, clicks: 145, impressions: 2090, submit: 2, started: 0, finished: 0, treatment: 0 },
  { date: '2026-07-26', spend: 502.61, clicks: 147, impressions: 1997, submit: 18, started: 0, finished: 0, treatment: 0 },
  { date: '2026-07-27', spend: 493.26, clicks: 163, impressions: 2183, submit: 6, started: 0, finished: 0, treatment: 0 },
  { date: '2026-07-28', spend: 279.01, clicks: 106, impressions: 1502, submit: 5, started: 0, finished: 0, treatment: 0 },
  { date: '2026-07-29', spend: 383.28, clicks: 124, impressions: 1686, submit: 9, started: 0, finished: 0, treatment: 0 },
  { date: '2026-07-30', spend: 237.62, clicks: 96, impressions: 1423, submit: 18, started: 0, finished: 0, treatment: 0 },
  { date: '2026-07-31', spend: 160.32, clicks: 60, impressions: 1232, submit: 7, started: 0, finished: 0, treatment: 0 },
  { date: '2026-08-01', spend: 146.94, clicks: 66, impressions: 964, submit: 14, started: 0, finished: 0, treatment: 0 },
  { date: '2026-08-02', spend: 295.43, clicks: 111, impressions: 1384, submit: 15, started: 0, finished: 0, treatment: 0 },
  { date: '2026-08-03', spend: 357.80, clicks: 122, impressions: 1879, submit: 12, started: 0, finished: 0, treatment: 0 },
  { date: '2026-08-04', spend: 566.39, clicks: 177, impressions: 2662, submit: 27, started: 0, finished: 0, treatment: 0 },
  { date: '2026-08-05', spend: 696.78, clicks: 183, impressions: 2774, submit: 24, started: 0, finished: 0, treatment: 0 },
  { date: '2026-08-06', spend: 522.13, clicks: 149, impressions: 2837, submit: 24, started: 0, finished: 0, treatment: 0 },
  { date: '2026-08-07', spend: 589.83, clicks: 156, impressions: 2174, submit: 22, started: 0, finished: 0, treatment: 0 },
  { date: '2026-08-08', spend: 484.57, clicks: 145, impressions: 1895, submit: 22, started: 0, finished: 0, treatment: 0 },
  { date: '2026-08-09', spend: 587.95, clicks: 168, impressions: 2554, submit: 16, started: 0, finished: 0, treatment: 0 },
];

// Merge seed data with Supabase data (seed wins on conflict — hardcoded is source of truth)
function mergeWithSeed(apiData: GoogleAdsDaily[]): GoogleAdsDaily[] {
  const byDate = new Map<string, GoogleAdsDaily>();
  apiData.forEach(a => byDate.set(a.date, a));
  GOOGLE_ADS_SEED.forEach(s => byDate.set(s.date, s));
  return Array.from(byDate.values());
}

/* ════════════════════════════════════════════
   DATA SOURCE 2: SALESFORCE (hardcoded constants)
   Source: Salesforce "Google Ads 2026" export, August 10, 2026.
   Note: Export filter includes "Up 1 equals Google Ads,Meta Ads"
   but Apr–Jun numbers are unchanged from Google-only pulls,
   so Meta contribution is negligible in those months.
   ════════════════════════════════════════════ */

// Pipeline totals — Salesforce export Aug 10, 2026
const GOOGLE_SF_PIPELINE = {
  total: 545,           // leads created (started form)
  completed: 243,       // all stages except Waiting-Info (45%)
  waitingInfo: 297,     // incomplete submissions
  sentCheckout: 140,    // Sent Checkout Link (114) + SCL-Temp Hold (1) + Checked Out (25)
  sentToTxP: 18,        // at Sent to TxP stage
  txpApproved: 9,
  checkedOut: 25,
  referredOut: 29,
  closedLost: 22,       // 16 Closed Lost + 6 Do Not Contact
  tempHold: 3,          // 2 Temp Hold + 1 SCL-Temp Hold
  formOpens: 1436,      // Google Ads conversions (form opens, Google-only)
};

// Revenue from checkouts — 25 checkouts at $44,991
const GOOGLE_REVENUE: number = 44991;

// Monthly breakdown from Salesforce (by Created Date)
// Used in the monthly summary table alongside Google Ads spend data
const SF_MONTHLY: { month: string; monthKey: string; leads: number; completed: number; checkouts: number; revenue: number }[] = [
  { month: 'Apr 2026', monthKey: 'Apr 2026', leads: 57, completed: 22, checkouts: 2, revenue: 3291 },
  { month: 'May 2026', monthKey: 'May 2026', leads: 80, completed: 31, checkouts: 5, revenue: 8676 },
  { month: 'Jun 2026', monthKey: 'Jun 2026', leads: 176, completed: 85, checkouts: 12, revenue: 21000 },
  { month: 'Jul 2026', monthKey: 'Jul 2026', leads: 184, completed: 85, checkouts: 6, revenue: 12024 },
  { month: 'Aug 2026', monthKey: 'Aug 2026', leads: 48, completed: 19, checkouts: 0, revenue: 0 },
];

/* ════════════════════════════════════════════
   MATURITY CURVE — from Enrollment Timing Analysis
   Cumulative % of eventual checkouts by cohort age.
   Source: Enrollment (Conversion) Timing Analysis, 2,657 enrollments
   across all channels (Jan–Jul 2026). Updated July 24, 2026.
   Same Day 4.3%, 1-15d 36.7%, 16-30d 25.0%, 31-45d 10.8%,
   46-60d 5.3%, 61-90d 6.2%, 91+d 10.8%, Unknown 0.9%.
   ════════════════════════════════════════════ */
const ENROLLMENT_MATURITY = [
  { days: 0, pct: 0 },
  { days: 1, pct: 0.043 },
  { days: 15, pct: 0.41 },
  { days: 30, pct: 0.66 },
  { days: 45, pct: 0.768 },
  { days: 60, pct: 0.821 },
  { days: 90, pct: 0.883 },
  { days: 120, pct: 0.95 },
  { days: 150, pct: 1.0 },
];

const CAC_TARGET = 500;

function getMaturity(ageDays: number): number {
  if (ageDays >= 150) return 1.0;
  if (ageDays <= 0) return 0;
  for (let i = 0; i < ENROLLMENT_MATURITY.length - 1; i++) {
    const curr = ENROLLMENT_MATURITY[i];
    const next = ENROLLMENT_MATURITY[i + 1];
    if (ageDays <= next.days) {
      const ratio = (ageDays - curr.days) / (next.days - curr.days);
      return curr.pct + ratio * (next.pct - curr.pct);
    }
  }
  return 1.0;
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

const MONTH_SHORT = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/* ════════════════════════════════════════════
   COMPONENT
   ════════════════════════════════════════════ */

export default function PaidAds() {
  const [entries, setEntries] = useState<GoogleAdsDaily[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  /* ──── Sorted daily data ──── */
  const sorted = useMemo(() => [...entries].sort((a, b) => a.date.localeCompare(b.date)), [entries]);

  /* ──── Total spend from Google Ads (daily + prior months) ──── */
  const googleTotalSpend = useMemo(() => {
    let spend = 0;
    sorted.forEach((e) => { spend += e.spend || 0; });
    GOOGLE_ADS_PRIOR_MONTHS.forEach((m) => {
      const hasDailyData = sorted.some((e) => {
        const [y, mo] = e.date.split('-').map(Number);
        return y === m.year && mo === m.monthIdx;
      });
      if (!hasDailyData) spend += m.spend;
    });
    return spend;
  }, [sorted]);

  /* ──── Monthly spend from Google Ads ──── */
  const monthlySpend = useMemo(() => {
    const byMonth = new Map<string, { spend: number; clicks: number; impressions: number }>();
    GOOGLE_ADS_PRIOR_MONTHS.forEach((m) => {
      const hasDailyData = sorted.some((e) => {
        const [y, mo] = e.date.split('-').map(Number);
        return y === m.year && mo === m.monthIdx;
      });
      if (!hasDailyData) byMonth.set(m.month, { spend: m.spend, clicks: m.clicks, impressions: m.impressions });
    });
    sorted.forEach((e) => {
      const [y, m] = e.date.split('-');
      const key = `${MONTH_SHORT[parseInt(m, 10)]} ${y}`;
      if (!byMonth.has(key)) byMonth.set(key, { spend: 0, clicks: 0, impressions: 0 });
      const bucket = byMonth.get(key)!;
      bucket.spend += e.spend || 0;
      bucket.clicks += e.clicks || 0;
      bucket.impressions += e.impressions || 0;
    });
    return Array.from(byMonth.entries()).map(([label, v]) => ({ label, ...v }));
  }, [sorted]);

  /* ──── Daily spend trend ──── */
  const spendTrend = useMemo(() => {
    const labels = sorted.map((e) => e.date.substring(5).replace('-', '/'));
    const spendVals = sorted.map((e) => e.spend || 0);
    const movingAvg: (number | null)[] = sorted.map((_, i) => {
      const start = Math.max(0, i - 6);
      const window = spendVals.slice(start, i + 1);
      return parseFloat((window.reduce((s, v) => s + v, 0) / window.length).toFixed(2));
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
      // Conversion action broke ~July 14, 2026 (zeros in seed). Fixed ~July 25-26, 2026 (conversions resumed).
      // Jul 25-Aug 9 conversion totals stored in submit field (per-action breakdown unavailable).
      const convIdx = chartLabels.indexOf('07/22');
      if (convIdx >= 0) {
        const cx = xScale.getPixelForValue(convIdx);
        ctx.save();
        ctx.strokeStyle = '#FF9800';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.moveTo(cx, yScale.top);
        ctx.lineTo(cx, yScale.bottom);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#FF9800';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Conv. Action Changed', cx, yScale.top + 12);
        ctx.restore();
      }
    },
  }), []);

  /* ──── Meta historical stats ──── */
  const metaTotalSpend = META_MONTHLY.reduce((s, m) => s + m.spend, 0);
  const metaTotalLeads = META_MONTHLY.reduce((s, m) => s + m.leads, 0);
  const metaCPL = metaTotalLeads > 0 ? metaTotalSpend / metaTotalLeads : 0;

  /* ──── Derived KPIs ──── */
  const net = GOOGLE_REVENUE - googleTotalSpend;
  const costPerCheckout = GOOGLE_SF_PIPELINE.checkedOut > 0 ? googleTotalSpend / GOOGLE_SF_PIPELINE.checkedOut : 0;

  /* ──── Maturity-adjusted CAC ──── */
  const maturityAdjCAC = useMemo(() => {
    const now = new Date();
    let totalProjected = 0;
    let totalSpendForProj = 0;

    // Checkout rate from months ≥60 days old
    const matureMonths = SF_MONTHLY.filter(sf => {
      const parts = sf.monthKey.split(' ');
      const mi = MONTH_SHORT.indexOf(parts[0]);
      const yr = parseInt(parts[1]);
      const mid = new Date(yr, mi - 1, 15);
      const age = Math.floor((now.getTime() - mid.getTime()) / (1000 * 60 * 60 * 24));
      return age >= 60 && sf.completed > 0;
    });
    const histCheckoutRate = matureMonths.length > 0
      ? matureMonths.reduce((s, m) => s + m.checkouts, 0) / matureMonths.reduce((s, m) => s + m.completed, 0)
      : 0;

    monthlySpend.forEach(m => {
      const sf = SF_MONTHLY.find(s => s.monthKey === m.label);
      if (!sf) return;
      const parts = m.label.split(' ');
      const monthIdx = MONTH_SHORT.indexOf(parts[0]);
      const year = parseInt(parts[1]);
      const midpoint = new Date(year, monthIdx - 1, 15);
      const ageDays = Math.floor((now.getTime() - midpoint.getTime()) / (1000 * 60 * 60 * 24));
      const maturity = getMaturity(ageDays);

      let projected = 0;
      if (sf.checkouts > 0 && maturity > 0.05) {
        projected = sf.checkouts / maturity;
      } else if (sf.completed > 0 && histCheckoutRate > 0) {
        projected = sf.completed * histCheckoutRate;
      }
      totalProjected += projected;
      totalSpendForProj += m.spend;
    });

    return totalProjected > 0 ? totalSpendForProj / totalProjected : null;
  }, [monthlySpend]);

  /* ──── RENDER ──── */

  if (loading) {
    return <div style={{ color: '#999', padding: '48px 0', textAlign: 'center' }}>Loading paid ads data...</div>;
  }

  // Funnel steps
  const funnel = [
    { label: 'Started Assessment', count: GOOGLE_SF_PIPELINE.total, color: TP.skyBlue },
    { label: 'Completed Submission', count: GOOGLE_SF_PIPELINE.completed, color: TP.blue },
    { label: 'Sent Checkout Link', count: GOOGLE_SF_PIPELINE.sentCheckout, color: TP.yellow },
    { label: 'Checked Out', count: GOOGLE_SF_PIPELINE.checkedOut, color: '#00C853' },
  ];
  const maxFunnel = funnel[0].count;

  // Current pipeline status
  const pipelineStatus = [
    { label: 'Still filling out form', count: GOOGLE_SF_PIPELINE.waitingInfo, color: '#999', note: 'incomplete' },
    { label: 'Waiting at checkout link', count: GOOGLE_SF_PIPELINE.sentCheckout - GOOGLE_SF_PIPELINE.checkedOut, color: TP.yellow, note: 'sent link, haven\'t bought' },
    { label: 'Checked out', count: GOOGLE_SF_PIPELINE.checkedOut, color: '#00C853', note: `$${GOOGLE_REVENUE.toLocaleString()} revenue` },
    { label: 'Sent to provider', count: GOOGLE_SF_PIPELINE.sentToTxP + GOOGLE_SF_PIPELINE.txpApproved, color: TP.darkPurple, note: 'in review' },
    { label: 'Referred out', count: GOOGLE_SF_PIPELINE.referredOut, color: TP.blue, note: 'outside network' },
    { label: 'Closed / lost', count: GOOGLE_SF_PIPELINE.closedLost + GOOGLE_SF_PIPELINE.tempHold, color: TP.red, note: '' },
  ];

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '12px 16px', borderRadius: 8, fontSize: 14, marginBottom: 16 }}>{error}</div>
      )}

      {/* ═══════ TOP SUMMARY ═══════ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
        <SummaryCard label="Total Spend" value={`$${Math.round(googleTotalSpend).toLocaleString()}`} color="#E57373" sub="Google Ads, Apr–present" />
        <SummaryCard label="Revenue" value={`$${GOOGLE_REVENUE.toLocaleString()}`} color="#00C853" sub={`${GOOGLE_SF_PIPELINE.checkedOut} checkouts`} />
        <SummaryCard
          label="Net"
          value={`${net >= 0 ? '+' : ''}$${Math.round(Math.abs(net)).toLocaleString()}`}
          color={net >= 0 ? '#00C853' : '#E57373'}
          sub={net >= 0 ? 'Revenue exceeds spend' : 'Spend exceeds revenue'}
        />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 32 }}>
        <SummaryCard label="Raw CAC" value={costPerCheckout > 0 ? `$${Math.round(costPerCheckout).toLocaleString()}` : '—'} color="#E57373" sub={`${GOOGLE_SF_PIPELINE.checkedOut} checkouts so far`} />
        <SummaryCard
          label="Adjusted CAC"
          value={maturityAdjCAC ? `$${Math.round(maturityAdjCAC).toLocaleString()}` : '—'}
          color={maturityAdjCAC && maturityAdjCAC <= CAC_TARGET ? '#00C853' : '#FF9800'}
          sub="Maturity-projected"
        />
        <SummaryCard label="Target CAC" value={`$${CAC_TARGET}`} color={TP.navy} sub={`Need ${Math.round(googleTotalSpend / CAC_TARGET)} checkouts at current spend`} />
        <SummaryCard label="Completion Rate" value={`${Math.round(GOOGLE_SF_PIPELINE.completed / GOOGLE_SF_PIPELINE.total * 100)}%`} color={TP.navy} sub={`${GOOGLE_SF_PIPELINE.completed} of ${GOOGLE_SF_PIPELINE.total} finished the form`} />
      </div>

      {/* ═══════ FUNNEL ═══════ */}
      <SectionHeader>Where People Drop Off</SectionHeader>
      <div style={{ background: '#fff', borderRadius: 12, padding: '24px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', marginBottom: 32 }}>
        {funnel.map((step, i) => {
          const pct = maxFunnel > 0 ? (step.count / maxFunnel) * 100 : 0;
          const prevCount = i > 0 ? funnel[i - 1].count : null;
          const dropPct = prevCount && prevCount > 0 ? Math.round((1 - step.count / prevCount) * 100) : null;
          return (
            <div key={step.label} style={{ marginBottom: i < funnel.length - 1 ? 12 : 0 }}>
              {dropPct !== null && (
                <div style={{ fontSize: '0.75em', color: '#E57373', marginBottom: 4, paddingLeft: 4 }}>
                  ↓ {dropPct}% drop
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 160, fontSize: '0.85em', color: TP.navy, fontWeight: 600, flexShrink: 0 }}>{step.label}</div>
                <div style={{ flex: 1, background: '#f0f0f0', borderRadius: 6, height: 32, position: 'relative', overflow: 'hidden' }}>
                  <div style={{
                    width: `${Math.max(pct, 2)}%`, height: '100%', background: step.color, borderRadius: 6,
                    display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 8,
                    transition: 'width 0.3s',
                  }}>
                    <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.85em', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>{step.count}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div style={{ fontSize: '0.78em', color: '#888', marginTop: 16 }}>
          Source: Salesforce. Every person who opened the assessment form through a Google Ad.
        </div>
      </div>

      {/* ═══════ WHERE LEADS ARE NOW ═══════ */}
      <SectionHeader>Where Your {GOOGLE_SF_PIPELINE.total} Leads Are Right Now</SectionHeader>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 32 }}>
        {pipelineStatus.map((s) => (
          <div key={s.label} style={{
            background: '#fff', borderRadius: 10, padding: '14px 16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderLeft: `4px solid ${s.color}`,
          }}>
            <div style={{ fontSize: '1.5em', fontWeight: 'bold', color: TP.navy }}>{s.count}</div>
            <div style={{ fontSize: '0.82em', color: '#555', fontWeight: 600, marginTop: 2 }}>{s.label}</div>
            {s.note && <div style={{ fontSize: '0.72em', color: '#999', marginTop: 4 }}>{s.note}</div>}
          </div>
        ))}
      </div>

      {/* ═══════ MONTHLY SUMMARY ═══════ */}
      <SectionHeader>Month by Month</SectionHeader>
      <div style={{ fontSize: '0.8em', color: '#888', marginBottom: 12 }}>Google Ads spend + Salesforce leads/checkouts/revenue</div>

      <div style={{ overflowX: 'auto', marginBottom: 32 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85em', background: '#fff', borderRadius: 10, overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }}>
          <thead>
            <tr style={{ background: TP.navy }}>
              {['Month', 'Spend', 'Clicks', 'Leads', 'Completed', 'Checkouts', 'Revenue', 'Net'].map(h => (
                <th key={h} style={{ padding: '10px 12px', textAlign: h === 'Month' ? 'left' : 'right', color: '#fff', fontSize: '0.9em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {monthlySpend.map((m, idx) => {
              const sf = SF_MONTHLY.find(s => s.monthKey === m.label);
              const rev = sf?.revenue ?? 0;
              const monthNet = rev - m.spend;
              return (
                <tr key={m.label} style={{ background: idx % 2 === 0 ? '#f9f9f9' : '#fff' }}>
                  <td style={{ padding: '8px 12px', fontWeight: 600 }}>{m.label}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'right' }}>${Math.round(m.spend).toLocaleString()}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'right' }}>{m.clicks.toLocaleString()}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'right' }}>{sf?.leads ?? '—'}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'right' }}>{sf?.completed ?? '—'}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'right' }}>{sf?.checkouts ?? '—'}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'right' }}>{rev > 0 ? `$${rev.toLocaleString()}` : '$0'}</td>
                  <td style={{
                    padding: '8px 12px', textAlign: 'right', fontWeight: 600,
                    color: monthNet >= 0 ? '#00C853' : '#E57373',
                  }}>
                    {monthNet >= 0 ? '+' : ''}{`$${Math.round(Math.abs(monthNet)).toLocaleString()}`}
                  </td>
                </tr>
              );
            })}
            {/* Total row */}
            <tr style={{ background: TP.navy, color: '#fff', fontWeight: 700 }}>
              <td style={{ padding: '10px 12px' }}>Total</td>
              <td style={{ padding: '10px 12px', textAlign: 'right' }}>${Math.round(googleTotalSpend).toLocaleString()}</td>
              <td style={{ padding: '10px 12px', textAlign: 'right' }}>{monthlySpend.reduce((s, m) => s + m.clicks, 0).toLocaleString()}</td>
              <td style={{ padding: '10px 12px', textAlign: 'right' }}>{GOOGLE_SF_PIPELINE.total}</td>
              <td style={{ padding: '10px 12px', textAlign: 'right' }}>{GOOGLE_SF_PIPELINE.completed}</td>
              <td style={{ padding: '10px 12px', textAlign: 'right' }}>{GOOGLE_SF_PIPELINE.checkedOut}</td>
              <td style={{ padding: '10px 12px', textAlign: 'right' }}>${GOOGLE_REVENUE.toLocaleString()}</td>
              <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                {net >= 0 ? '+' : ''}${Math.round(Math.abs(net)).toLocaleString()}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ═══════ MATURITY-ADJUSTED CAC (Kenny's model) ═══════ */}
      <SectionHeader>What Google Ads Actually Costs (Maturity-Adjusted)</SectionHeader>
      <div style={{ fontSize: '0.85em', color: '#555', marginBottom: 16, lineHeight: 1.6 }}>
        Raw CAC (spend ÷ checkouts) overstates the true cost because recent months haven&#39;t finished converting. Leads take up to 150 days to fully settle. This table projects how many checkouts each month will end up with based on how far along it is. <strong style={{ color: TP.navy }}>Target: ${CAC_TARGET} CAC.</strong>
      </div>

      <div style={{ overflowX: 'auto', marginBottom: 16 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85em', background: '#fff', borderRadius: 10, overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }}>
          <thead>
            <tr style={{ background: TP.navy }}>
              {['Month', 'Spend', 'Checkouts', 'Revenue', 'Age', 'Maturity', 'Projected', 'Raw CAC', 'Adj CAC'].map(h => (
                <th key={h} style={{ padding: '10px 12px', textAlign: h === 'Month' ? 'left' : 'right', color: '#fff', fontSize: '0.9em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(() => {
              const now = new Date();

              // Checkout rate from months ≥60 days old (mature enough to be meaningful)
              // Used to estimate months that have 0 checkouts because they're too young
              const matureMonths = SF_MONTHLY.filter(sf => {
                const parts = sf.monthKey.split(' ');
                const mi = MONTH_SHORT.indexOf(parts[0]);
                const yr = parseInt(parts[1]);
                const mid = new Date(yr, mi - 1, 15);
                const age = Math.floor((now.getTime() - mid.getTime()) / (1000 * 60 * 60 * 24));
                return age >= 60 && sf.completed > 0;
              });
              const histCheckoutRate = matureMonths.length > 0
                ? matureMonths.reduce((s, m) => s + m.checkouts, 0) / matureMonths.reduce((s, m) => s + m.completed, 0)
                : 0;

              return monthlySpend.map((m, idx) => {
                const sf = SF_MONTHLY.find(s => s.monthKey === m.label);
                if (!sf) return null;
                // Cohort midpoint = 15th of the month
                const parts = m.label.split(' ');
                const monthIdx = MONTH_SHORT.indexOf(parts[0]);
                const year = parseInt(parts[1]);
                const midpoint = new Date(year, monthIdx - 1, 15);
                const ageDays = Math.floor((now.getTime() - midpoint.getTime()) / (1000 * 60 * 60 * 24));
                const maturity = getMaturity(ageDays);

                let projected: number | null;
                let isEstimate = false;
                if (sf.checkouts > 0 && maturity > 0.05) {
                  // Has checkouts — project by dividing by maturity
                  projected = sf.checkouts / maturity;
                } else if (sf.completed > 0 && histCheckoutRate > 0) {
                  // No checkouts yet but has completed subs — estimate from historical rate
                  projected = sf.completed * histCheckoutRate;
                  isEstimate = true;
                } else {
                  projected = null;
                }

                const rawCAC = sf.checkouts > 0 ? m.spend / sf.checkouts : null;
                const adjCAC = projected && projected > 0 ? m.spend / projected : null;

                return (
                  <tr key={m.label} style={{ background: idx % 2 === 0 ? '#f9f9f9' : '#fff' }}>
                    <td style={{ padding: '8px 12px', fontWeight: 600 }}>{m.label}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right' }}>${Math.round(m.spend).toLocaleString()}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right' }}>{sf.checkouts}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', color: sf.revenue > 0 ? '#00C853' : '#888' }}>{sf.revenue > 0 ? `$${sf.revenue.toLocaleString()}` : '—'}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', color: '#888' }}>{ageDays}d</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right' }}>{Math.round(maturity * 100)}%</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                      {projected !== null ? <span>{isEstimate ? '~' : '~'}{projected.toFixed(1)}{isEstimate ? '*' : ''}</span> : '—'}
                    </td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', color: '#888' }}>
                      {rawCAC !== null ? `$${Math.round(rawCAC).toLocaleString()}` : '—'}
                    </td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, color: adjCAC !== null && adjCAC <= CAC_TARGET ? '#00C853' : adjCAC !== null && adjCAC <= CAC_TARGET * 2 ? '#FF9800' : TP.navy }}>
                      {adjCAC !== null ? <span>~${Math.round(adjCAC).toLocaleString()}{isEstimate ? '*' : ''}</span> : '—'}
                    </td>
                  </tr>
                );
              }).filter(Boolean);
            })()}
          </tbody>
        </table>
      </div>

      <div style={{ background: '#f0f4ff', borderLeft: '4px solid ' + TP.blue, borderRadius: 8, padding: '14px 18px', marginBottom: 32, fontSize: '0.82em', color: '#555', lineHeight: 1.6 }}>
        <strong>How to read this:</strong> &quot;Maturity&quot; is how much of each month&#39;s eventual checkouts have happened so far. A 66% mature month has only shown 2/3 of its final checkouts. &quot;Projected&quot; divides actual checkouts by maturity to estimate the final count. &quot;Adj CAC&quot; divides spend by the projected count instead of the raw count. Green = at or below ${CAC_TARGET} target. Orange = within 2x of target.
        <br /><br />
        Maturity curve from Enrollment Timing Analysis (2,657 enrollments): same day = 4%, 15 days = 41%, 30 days = 66%, 45 days = 77%, 60 days = 82%, 90 days = 88%, ~150 days = settled.
        <br /><br />
        * Months with 0 checkouts are estimated using the checkout rate from older months ({Math.round((() => { const mm = SF_MONTHLY.filter(sf => { const p = sf.monthKey.split(' '); const mi = MONTH_SHORT.indexOf(p[0]); const yr = parseInt(p[1]); const mid = new Date(yr, mi - 1, 15); return Math.floor((new Date().getTime() - mid.getTime()) / 86400000) >= 60 && sf.completed > 0; }); return mm.length > 0 ? mm.reduce((s, m) => s + m.checkouts, 0) / mm.reduce((s, m) => s + m.completed, 0) * 100 : 0; })())}% of completed submissions eventually check out) instead of the maturity curve. This is a rougher estimate.
      </div>

      {/* ═══════ COST PER CONVERSION TREND ═══════ */}
      <SectionHeader>Cost per Conversion Over Time</SectionHeader>
      <div style={{ fontSize: '0.8em', color: '#888', marginBottom: 12 }}>
        Monthly Google Ads spend ÷ Salesforce conversions at each funnel stage. August is partial ({(() => { const aug = SF_MONTHLY.find(s => s.monthKey === 'Aug 2026'); return aug ? `${aug.leads} leads` : 'in progress'; })()}).
      </div>
      <div style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 4px 15px rgba(0,0,0,0.08)', marginBottom: 32 }}>
        <div style={{ height: 320 }}>
          <Line
            data={{
              labels: (() => {
                return monthlySpend.map(m => m.label);
              })(),
              datasets: [
                {
                  label: 'Cost / Form Open',
                  data: monthlySpend.map(m => {
                    const sf = SF_MONTHLY.find(s => s.monthKey === m.label);
                    return sf && sf.leads > 0 ? Math.round(m.spend / sf.leads) : null;
                  }),
                  borderColor: '#42A5F5',
                  backgroundColor: '#42A5F510',
                  borderWidth: 2,
                  pointRadius: 5,
                  pointBackgroundColor: '#42A5F5',
                  tension: 0.3,
                },
                {
                  label: 'Cost / Completed Assessment',
                  data: monthlySpend.map(m => {
                    const sf = SF_MONTHLY.find(s => s.monthKey === m.label);
                    return sf && sf.completed > 0 ? Math.round(m.spend / sf.completed) : null;
                  }),
                  borderColor: '#FF9800',
                  backgroundColor: '#FF980010',
                  borderWidth: 2,
                  pointRadius: 5,
                  pointBackgroundColor: '#FF9800',
                  tension: 0.3,
                },
                {
                  label: 'Cost / Checkout (CAC)',
                  data: monthlySpend.map(m => {
                    const sf = SF_MONTHLY.find(s => s.monthKey === m.label);
                    return sf && sf.checkouts > 0 ? Math.round(m.spend / sf.checkouts) : null;
                  }),
                  borderColor: '#E53935',
                  backgroundColor: '#E5393510',
                  borderWidth: 2,
                  pointRadius: 5,
                  pointBackgroundColor: '#E53935',
                  tension: 0.3,
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              spanGaps: true,
              plugins: {
                legend: { position: 'top', labels: { usePointStyle: true, padding: 16 } },
                tooltip: {
                  callbacks: {
                    label: (ctx) => `${ctx.dataset.label}: $${ctx.parsed.y?.toLocaleString() ?? '—'}`,
                  },
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: { callback: (v) => `$${Number(v).toLocaleString()}` },
                  title: { display: true, text: 'Cost per conversion ($)' },
                },
              },
            }}
          />
        </div>
        <div style={{ marginTop: 12 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82em' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '6px 10px', textAlign: 'left' }}>Month</th>
                <th style={{ padding: '6px 10px', textAlign: 'right' }}>Spend</th>
                <th style={{ padding: '6px 10px', textAlign: 'right' }}>Form Opens</th>
                <th style={{ padding: '6px 10px', textAlign: 'right', color: '#42A5F5' }}>$/Open</th>
                <th style={{ padding: '6px 10px', textAlign: 'right' }}>Completed</th>
                <th style={{ padding: '6px 10px', textAlign: 'right', color: '#FF9800' }}>$/Complete</th>
                <th style={{ padding: '6px 10px', textAlign: 'right' }}>Checkouts</th>
                <th style={{ padding: '6px 10px', textAlign: 'right', color: '#E53935' }}>$/Checkout</th>
              </tr>
            </thead>
            <tbody>
              {monthlySpend.map((m, idx) => {
                const sf = SF_MONTHLY.find(s => s.monthKey === m.label);
                if (!sf) return null;
                const cpo = sf.leads > 0 ? Math.round(m.spend / sf.leads) : null;
                const cpc2 = sf.completed > 0 ? Math.round(m.spend / sf.completed) : null;
                const cac = sf.checkouts > 0 ? Math.round(m.spend / sf.checkouts) : null;
                return (
                  <tr key={m.label} style={{ background: idx % 2 === 0 ? '#f9f9f9' : '#fff', borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '6px 10px', fontWeight: 600 }}>{m.label}</td>
                    <td style={{ padding: '6px 10px', textAlign: 'right' }}>${Math.round(m.spend).toLocaleString()}</td>
                    <td style={{ padding: '6px 10px', textAlign: 'right' }}>{sf.leads}</td>
                    <td style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 600, color: '#42A5F5' }}>{cpo !== null ? `$${cpo}` : '—'}</td>
                    <td style={{ padding: '6px 10px', textAlign: 'right' }}>{sf.completed}</td>
                    <td style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 600, color: '#FF9800' }}>{cpc2 !== null ? `$${cpc2}` : '—'}</td>
                    <td style={{ padding: '6px 10px', textAlign: 'right' }}>{sf.checkouts}</td>
                    <td style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 600, color: '#E53935' }}>{cac !== null ? `$${cac.toLocaleString()}` : '—'}</td>
                  </tr>
                );
              }).filter(Boolean)}
            </tbody>
          </table>
        </div>
      </div>

      {/* ═══════ DAILY GOOGLE ADS CONVERSIONS ═══════ */}
      <SectionHeader>Daily Google Ads Conversions</SectionHeader>
      <div style={{ fontSize: '0.8em', color: '#888', marginBottom: 12 }}>
        Total Google Ads conversions per day (all conversion actions combined). Conversion tracking broke ~Jul 14 and was fixed ~Jul 26.
      </div>
      <div style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 4px 15px rgba(0,0,0,0.08)', marginBottom: 32 }}>
        <div style={{ height: 300 }}>
          <Line
            data={{
              labels: sorted.map(e => { const [,m,d] = e.date.split('-'); return `${parseInt(m)}/${parseInt(d)}`; }),
              datasets: [{
                label: 'Conversions',
                data: sorted.map(e => e.submit + e.started + e.finished + e.treatment),
                borderColor: '#4CAF50',
                backgroundColor: '#4CAF5020',
                fill: true,
                borderWidth: 2,
                pointRadius: 2,
                tension: 0.3,
              }],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
                tooltip: { callbacks: { label: (ctx) => `${ctx.parsed.y} conversions` } },
              },
              scales: {
                y: { beginAtZero: true, title: { display: true, text: 'Conversions' } },
              },
            }}
          />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 12, fontSize: '0.82em' }}>
          {(() => {
            const aug = sorted.filter(e => e.date.startsWith('2026-08'));
            const jul = sorted.filter(e => e.date.startsWith('2026-07'));
            const jun = sorted.filter(e => e.date.startsWith('2026-06'));
            const sum = (arr: typeof sorted) => arr.reduce((s, e) => s + e.submit + e.started + e.finished + e.treatment, 0);
            const avg = (arr: typeof sorted) => arr.length > 0 ? (sum(arr) / arr.length).toFixed(1) : '—';
            const spendArr = (arr: typeof sorted) => arr.reduce((s, e) => s + e.spend, 0);
            const cpc = (arr: typeof sorted) => { const t = sum(arr); return t > 0 ? `$${Math.round(spendArr(arr) / t)}` : '—'; };
            return [
              { label: `Aug (${aug.length}d)`, total: sum(aug), avg: avg(aug), cpc: cpc(aug) },
              { label: `Jul`, total: sum(jul), avg: avg(jul), cpc: cpc(jul) },
              { label: `Jun`, total: sum(jun), avg: avg(jun), cpc: cpc(jun) },
            ].map(m => (
              <div key={m.label} style={{ background: '#f8f9fa', borderRadius: 8, padding: 12, textAlign: 'center' }}>
                <div style={{ fontWeight: 700, fontSize: '1.3em' }}>{m.total}</div>
                <div style={{ color: '#666' }}>{m.label} conversions</div>
                <div style={{ color: '#888', fontSize: '0.9em', marginTop: 4 }}>{m.avg}/day avg · {m.cpc} CPC</div>
              </div>
            ));
          })()}
        </div>
      </div>

      {/* ═══════ DAILY SPEND ═══════ */}
      <SectionHeader>Daily Spend</SectionHeader>
      <div style={{ fontSize: '0.8em', color: '#888', marginBottom: 12 }}>Source: Google Ads. June onward (no daily data for Apr/May).</div>

      <div style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 4px 15px rgba(0,0,0,0.08)', marginBottom: 32 }}>
        <div style={{ height: 300 }}>
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
                plugins: {
                  legend: { position: 'top', labels: { usePointStyle: true, padding: 14, font: { size: 11 } } },
                  tooltip: { callbacks: { label: (ctx) => `$${(ctx.parsed.y || 0).toFixed(2)}` } },
                },
                scales: {
                  y: { beginAtZero: true, ticks: { callback: (v) => `$${Number(v).toLocaleString()}` } },
                  x: { ticks: { maxTicksLimit: 12, font: { size: 10 } } },
                },
              }}
              plugins={[blackoutAnnotation]}
            />
          ) : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999' }}>Not enough data yet</div>}
        </div>
      </div>

      {/* ═══════ ADD / UPDATE DAY ═══════ */}
      <SectionHeader color="#E57373">Daily Entry</SectionHeader>

      <div style={{ background: '#fff', borderRadius: 12, padding: '16px 20px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', marginBottom: 16 }}>
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
          Opened/Started/Completed/Tx recorded for reference only. Leads and checkouts come from Salesforce.
        </div>
      </div>

      {/* Recent entries */}
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
        <div style={{ fontSize: '0.75em', color: '#aaa', marginTop: 6 }}>Most recent 10 days. Click a row to edit.</div>
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
              <SummaryCard color="#999" label="Total Spend" value={`$${Math.round(metaTotalSpend).toLocaleString()}`} sub="Mar 2025–Apr 2026" />
              <SummaryCard color="#999" label="Total Leads" value={`${metaTotalLeads}`} sub="Mar 2025–Apr 2026" />
              <SummaryCard color="#999" label="Cost per Lead" value={metaCPL > 0 ? `$${Math.round(metaCPL).toLocaleString()}` : '—'} sub="Historical" />
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
              Final funnel: {META_FUNNEL.entered} entered, {META_FUNNEL.waitingInfo} waiting on info, {META_FUNNEL.sentCheckout} sent checkout, {META_FUNNEL.checkedOut} checked out, {META_FUNNEL.denied} denied, {META_FUNNEL.closedLost} closed lost. Campaigns paused — budget moved to Google Ads.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   Sub-Components
   ════════════════════════════════════════════ */

const inputStyle: React.CSSProperties = {
  padding: '5px 8px', border: '1px solid #ddd', borderRadius: 6, fontSize: '0.85em',
};

function SummaryCard({ color, label, value, sub }: { color: string; label: string; value: string; sub: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', borderRadius: 10, padding: '16px 14px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderTop: `3px solid ${color}` }}>
      <div style={{ fontSize: '0.7em', color: '#666', textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#1B2A4A' }}>{value}</div>
      <div style={{ fontSize: '0.75em', color: '#888', marginTop: 4 }}>{sub}</div>
    </div>
  );
}

function SectionHeader({ children, color }: { children: React.ReactNode; color?: string }) {
  return (
    <div style={{ fontSize: 16, fontWeight: 700, color: color || TP.navy, borderBottom: `2px solid ${color || TP.navy}`, paddingBottom: 8, marginBottom: 16 }}>
      {children}
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ fontSize: '0.75em', color: '#888', display: 'block' }}>{label}</label>
      {children}
    </div>
  );
}
