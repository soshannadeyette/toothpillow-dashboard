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

const GOOGLE_SF_PIPELINE = {
  total: 383,
  waitingInfo: 220,
  sentCheckout: 91,
  sentToTxP: 26,
  checkedOut: 16,
  referredOut: 22,
  closedLost: 6,
  tempHold: 2,
};

// 16 checkouts, $27,382 subtotal from Salesforce
const GOOGLE_REVENUE: number = 27382;

// Weekly cohort data — from Salesforce export July 14, 2026.
// 'subs' = total form submissions that week, 'incomplete' = still in Waiting-Info stage (not a real lead),
// 'pipeline' = subs - incomplete = leads that progressed past initial submission.
// Spend is joined from Google Ads daily/monthly data at render time.
const SF_WEEKLY_COHORT_DATA: { week: string; subs: number; incomplete: number; pipeline: number; checkouts: number; revenue: number; avgDaysToCheckout: number | null }[] = [
  { week: '2026-03-30', subs: 2, incomplete: 2, pipeline: 0, checkouts: 0, revenue: 0, avgDaysToCheckout: null },
  { week: '2026-04-06', subs: 12, incomplete: 7, pipeline: 5, checkouts: 1, revenue: 1546, avgDaysToCheckout: 23 },
  { week: '2026-04-13', subs: 18, incomplete: 11, pipeline: 7, checkouts: 1, revenue: 1745, avgDaysToCheckout: 14 },
  { week: '2026-04-20', subs: 11, incomplete: 7, pipeline: 4, checkouts: 0, revenue: 0, avgDaysToCheckout: null },
  { week: '2026-04-27', subs: 21, incomplete: 15, pipeline: 6, checkouts: 0, revenue: 0, avgDaysToCheckout: null },
  { week: '2026-05-04', subs: 20, incomplete: 9, pipeline: 11, checkouts: 1, revenue: 1995, avgDaysToCheckout: 8 },
  { week: '2026-05-11', subs: 7, incomplete: 5, pipeline: 2, checkouts: 0, revenue: 0, avgDaysToCheckout: null },
  { week: '2026-05-18', subs: 10, incomplete: 7, pipeline: 3, checkouts: 1, revenue: 1595, avgDaysToCheckout: 32 },
  { week: '2026-05-25', subs: 36, incomplete: 23, pipeline: 13, checkouts: 2, revenue: 3491, avgDaysToCheckout: 18 },
  { week: '2026-06-01', subs: 41, incomplete: 23, pipeline: 18, checkouts: 3, revenue: 5187, avgDaysToCheckout: 24 },
  { week: '2026-06-08', subs: 36, incomplete: 17, pipeline: 19, checkouts: 2, revenue: 3092, avgDaysToCheckout: 12 },
  { week: '2026-06-15', subs: 37, incomplete: 19, pipeline: 18, checkouts: 3, revenue: 5286, avgDaysToCheckout: 12 },
  { week: '2026-06-22', subs: 51, incomplete: 30, pipeline: 21, checkouts: 2, revenue: 3445, avgDaysToCheckout: 12 },
  { week: '2026-06-29', subs: 29, incomplete: 17, pipeline: 12, checkouts: 0, revenue: 0, avgDaysToCheckout: null },
  { week: '2026-07-06', subs: 44, incomplete: 22, pipeline: 22, checkouts: 0, revenue: 0, avgDaysToCheckout: null },
  { week: '2026-07-13', subs: 8, incomplete: 6, pipeline: 2, checkouts: 0, revenue: 0, avgDaysToCheckout: null },
];

// Lead → checkout timing, computed from the 16 Salesforce checkouts to date.
const CONVERSION_TIMING = {
  median: 14,
  average: 17,
  min: 6,
  max: 32,
  count: 16,
};

/* ════════════════════════════════════════════
   COHORT MATURITY CURVE (Kenny P's framework, Jul 2026)
   % of eventual checkouts that have occurred by cohort age.
   Used to project how many checkouts a young cohort will
   ultimately produce, so recent months' CAC isn't overstated.
   ════════════════════════════════════════════ */
const MATURITY_CURVE = [
  { days: 0, pct: 0 },
  { days: 15, pct: 0.41 },
  { days: 30, pct: 0.66 },
  { days: 60, pct: 0.85 },
  { days: 90, pct: 0.92 },
  { days: 120, pct: 1.0 },
];

function getMaturity(ageDays: number): number {
  if (ageDays >= 120) return 1.0;
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

const MONTH_SHORT = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface CohortRow {
  label: string;
  spend: number;
  subs: number;
  pipeline: number;
  checkouts: number;
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

  const totalSubs = GOOGLE_SF_PIPELINE.total; // All form submissions from Google Ads
  const totalIncomplete = GOOGLE_SF_PIPELINE.waitingInfo; // Still waiting on info — not a real lead
  const totalPipeline = totalSubs - totalIncomplete; // Progressed past initial submission
  const totalCheckouts = GOOGLE_SF_PIPELINE.checkedOut;
  const costPerSub = totalSubs > 0 ? googleTotalSpend / totalSubs : 0;
  const cac = totalCheckouts > 0 ? googleTotalSpend / totalCheckouts : 0;
  const pipelineToCheckoutRate = totalPipeline > 0 ? (totalCheckouts / totalPipeline) * 100 : 0;
  const completionRate = totalSubs > 0 ? (totalPipeline / totalSubs) * 100 : 0;

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

  /* ──── Weekly cohort maturity analysis (Salesforce subs/checkouts + Google Ads spend) ──── */

  // Pre-compute daily spend lookup for efficiency
  const dailySpendByDate = useMemo(() => {
    const m = new Map<string, number>();
    sorted.forEach((e) => m.set(e.date, e.spend || 0));
    return m;
  }, [sorted]);

  // Pre-compute monthly avg daily spend for months with only monthly data (Apr, May)
  const monthlyAvgDaily = useMemo(() => {
    const m = new Map<string, number>();
    GOOGLE_ADS_PRIOR_MONTHS.forEach((pm) => {
      const daysInMonth = new Date(pm.year, pm.monthIdx, 0).getDate();
      m.set(`${pm.year}-${pm.monthIdx}`, pm.spend / daysInMonth);
    });
    return m;
  }, []);

  function getWeekSpend(weekStart: string): number {
    const ws = new Date(weekStart);
    let total = 0;
    for (let d = 0; d < 7; d++) {
      const day = new Date(ws);
      day.setDate(ws.getDate() + d);
      const ds = day.toISOString().split('T')[0];
      // Try daily data first
      if (dailySpendByDate.has(ds)) {
        total += dailySpendByDate.get(ds)!;
      } else {
        // Fall back to monthly avg daily
        const y = day.getFullYear();
        const mo = day.getMonth() + 1;
        const key = `${y}-${mo}`;
        if (monthlyAvgDaily.has(key)) {
          total += monthlyAvgDaily.get(key)!;
        }
      }
    }
    return total;
  }

  const cohortData = useMemo((): CohortRow[] => {
    const now = new Date();

    return SF_WEEKLY_COHORT_DATA.map((c) => {
      const spend = getWeekSpend(c.week);

      // Midpoint = Wednesday of the week
      const ws = new Date(c.week);
      const midpoint = new Date(ws);
      midpoint.setDate(ws.getDate() + 3);
      const ageDays = Math.floor((now.getTime() - midpoint.getTime()) / (1000 * 60 * 60 * 24));
      const maturity = getMaturity(ageDays);
      const projectedFinal = (maturity > 0.05 && c.checkouts > 0) ? c.checkouts / maturity : 0;
      const rawCAC = c.checkouts > 0 ? spend / c.checkouts : null;
      const adjCAC = projectedFinal > 0 ? spend / projectedFinal : null;

      // Label: "Apr 7" format
      const d = new Date(c.week);
      const label = `${MONTH_SHORT[d.getMonth() + 1]} ${d.getDate()}`;

      return {
        label,
        spend,
        subs: c.subs,
        pipeline: c.pipeline,
        checkouts: c.checkouts,
        ageDays,
        maturity,
        projectedFinal,
        rawCAC,
        adjCAC,
      };
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sorted, dailySpendByDate, monthlyAvgDaily]);

  const cohortTotals = useMemo(() => {
    const tSpend = cohortData.reduce((s, c) => s + c.spend, 0);
    const tCheckouts = cohortData.reduce((s, c) => s + c.checkouts, 0);
    const tProjected = cohortData.reduce((s, c) => s + c.projectedFinal, 0);
    const tSubs = cohortData.reduce((s, c) => s + c.subs, 0);
    const tPipeline = cohortData.reduce((s, c) => s + c.pipeline, 0);
    return {
      totalSpend: tSpend,
      totalCheckouts: tCheckouts,
      totalSubs: tSubs,
      totalPipeline: tPipeline,
      totalProjected: tProjected,
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
        <KPICard color={TP.darkPurple} label="Submissions" value={`${totalSubs}`} sub={`${totalPipeline} pipeline / ${totalIncomplete} incomplete`} />
        <KPICard color={TP.yellow} label="Cost / Sub" value={`$${Math.round(costPerSub).toLocaleString()}`} sub="Spend ÷ submissions" />
        <KPICard color={TP.blue} label="Completion" value={`${completionRate.toFixed(0)}%`} sub={`${totalPipeline} of ${totalSubs} completed`} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 8 }}>
        <KPICard color="#00C853" label="Checkouts" value={`${totalCheckouts}`} sub="Source: Salesforce" />
        <KPICard color="#E57373" label="CAC" value={totalCheckouts > 0 ? `$${Math.round(cac).toLocaleString()}` : '—'} sub="Spend ÷ checkouts" />
        <KPICard color={TP.green} label="Revenue" value={`$${GOOGLE_REVENUE.toLocaleString()}`} sub="Source: Salesforce" />
      </div>
      <div style={{ fontSize: '0.78em', color: '#888', marginBottom: 28, fontStyle: 'italic' }}>
        Submission and checkout counts from Salesforce. Spend from Google Ads. Incomplete = Waiting Needs Info.
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
                      const pct = totalSubs > 0 ? (val / totalSubs * 100).toFixed(1) : '0';
                      return `${val} (${pct}% of submissions)`;
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
          {totalSubs} submissions ({totalIncomplete} incomplete, {totalPipeline} pipeline) → {totalCheckouts} checkouts = {pipelineToCheckoutRate.toFixed(1)}% pipeline-to-checkout rate.
        </div>
      </div>

      {/* ═══════ COHORT MATURITY ANALYSIS ═══════ */}
      <div style={{ fontSize: 16, fontWeight: 700, color: TP.navy, borderBottom: `2px solid ${TP.navy}`, paddingBottom: 8, marginBottom: 16 }}>
        Cohort Maturity Analysis
      </div>
      <div style={{ fontSize: '0.8em', color: '#888', marginBottom: 8 }}>Source: Salesforce (subs/checkouts) + Google Ads (spend). Weekly cohorts by submission date.</div>

      <div style={{ fontSize: '0.85em', color: '#555', marginBottom: 12, lineHeight: 1.6 }}>
        CAC = spend / checkouts. Recent cohorts have not fully matured. Adjusted CAC projects forward using Kenny{"'"}s checkout maturity curve.
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
            <div style={{ fontWeight: 600, marginBottom: 6, color: TP.navy }}>Checkout Maturity Curve</div>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              {MATURITY_CURVE.filter(p => p.days > 0).map(p => (
                <span key={p.days}>{p.days}d = {Math.round(p.pct * 100)}%</span>
              ))}
            </div>
            <div style={{ marginTop: 6, color: '#888', fontSize: '0.9em' }}>
              Percentage of eventual checkouts that have occurred by cohort age.
            </div>
          </div>
        )}
      </div>

      <div style={{ overflowX: 'auto', marginBottom: 20 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82em', background: '#fff', borderRadius: 10, overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }}>
          <thead>
            <tr style={{ background: TP.navy }}>
              {['Week', 'Spend', 'Subs', 'Pipeline', 'Checkouts', 'Age', '~Maturity', 'Projected', 'Raw CAC', 'Adj CAC'].map(h => (
                <th key={h} style={{ padding: '8px 10px', textAlign: h === 'Week' ? 'left' : 'right', color: '#fff', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cohortData.map((c, idx) => (
              <tr key={c.label} style={{
                background: idx % 2 === 0 ? '#f9f9f9' : '#fff',
                opacity: c.maturity < 0.40 ? 0.6 : 1,
              }}>
                <td style={{ padding: '6px 10px', fontWeight: 600, whiteSpace: 'nowrap' }}>{c.label}</td>
                <td style={{ padding: '6px 10px', textAlign: 'right' }}>${Math.round(c.spend).toLocaleString()}</td>
                <td style={{ padding: '6px 10px', textAlign: 'right' }}>{c.subs}</td>
                <td style={{ padding: '6px 10px', textAlign: 'right' }}>{c.pipeline}</td>
                <td style={{ padding: '6px 10px', textAlign: 'right' }}>{c.checkouts}</td>
                <td style={{ padding: '6px 10px', textAlign: 'right' }}>{c.ageDays}d</td>
                <td style={{ padding: '6px 10px', textAlign: 'right' }}>{Math.round(c.maturity * 100)}%</td>
                <td style={{ padding: '6px 10px', textAlign: 'right' }}>{c.projectedFinal > 0 ? c.projectedFinal.toFixed(1) : '—'}</td>
                <td style={{ padding: '6px 10px', textAlign: 'right', color: '#888' }}>{c.rawCAC !== null ? `$${Math.round(c.rawCAC).toLocaleString()}` : '—'}</td>
                <td style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 600, color: c.adjCAC !== null && c.adjCAC <= 500 ? '#00C853' : (c.adjCAC !== null ? '#E57373' : '#888') }}>
                  {c.adjCAC !== null ? `$${Math.round(c.adjCAC).toLocaleString()}` : '—'}
                </td>
              </tr>
            ))}
            <tr style={{ background: TP.navy, color: '#fff', fontWeight: 700 }}>
              <td style={{ padding: '8px 10px' }}>Total</td>
              <td style={{ padding: '8px 10px', textAlign: 'right' }}>${Math.round(cohortTotals.totalSpend).toLocaleString()}</td>
              <td style={{ padding: '8px 10px', textAlign: 'right' }}>{cohortTotals.totalSubs}</td>
              <td style={{ padding: '8px 10px', textAlign: 'right' }}>{cohortTotals.totalPipeline}</td>
              <td style={{ padding: '8px 10px', textAlign: 'right' }}>{cohortTotals.totalCheckouts}</td>
              <td style={{ padding: '8px 10px', textAlign: 'right' }}></td>
              <td style={{ padding: '8px 10px', textAlign: 'right' }}></td>
              <td style={{ padding: '8px 10px', textAlign: 'right' }}>{cohortTotals.totalProjected > 0 ? cohortTotals.totalProjected.toFixed(1) : '—'}</td>
              <td style={{ padding: '8px 10px', textAlign: 'right' }}>{cohortTotals.overallRawCAC !== null ? `$${Math.round(cohortTotals.overallRawCAC).toLocaleString()}` : '—'}</td>
              <td style={{ padding: '8px 10px', textAlign: 'right' }}>{cohortTotals.overallAdjCAC !== null ? `$${Math.round(cohortTotals.overallAdjCAC).toLocaleString()}` : '—'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <ChartLabel>CAC Trend by Cohort</ChartLabel>
      <ChartCard>
        <div style={{ height: 300 }}>
          {cohortData.length > 0 ? (
            <Bar
              data={{
                labels: cohortData.map(c => c.label),
                datasets: [
                  {
                    label: 'Raw CAC',
                    data: cohortData.map(c => c.rawCAC),
                    backgroundColor: '#ccc',
                    borderColor: '#aaa',
                    borderWidth: 1,
                    borderRadius: 4,
                    barPercentage: 0.7,
                    categoryPercentage: 0.8,
                  },
                  {
                    label: 'Maturity-Adj CAC',
                    data: cohortData.map(c => c.adjCAC),
                    backgroundColor: TP.blue,
                    borderColor: TP.navy,
                    borderWidth: 1,
                    borderRadius: 4,
                    barPercentage: 0.7,
                    categoryPercentage: 0.8,
                  },
                  {
                    label: '$500 Target',
                    data: cohortData.map(() => 500),
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
          Range: {CONVERSION_TIMING.min}–{CONVERSION_TIMING.max} days (average {CONVERSION_TIMING.average} days), n={CONVERSION_TIMING.count}
        </div>
        <div style={{ fontSize: '0.75em', color: '#aaa', marginTop: 8 }}>Source: Salesforce</div>
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
