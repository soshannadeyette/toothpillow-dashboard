'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
   broken May 11-20, so conversion data (opened,
   started, completed, treatment) is unreliable.
   Spend/impressions/clicks from Google are fine.
   ════════════════════════════════════════════ */
const BLACKOUT_START = '2026-05-11';
const BLACKOUT_END   = '2026-05-20';
const isBlackout = (date: string) => date >= BLACKOUT_START && date <= BLACKOUT_END;

/* ════════════════════════════════════════════
   HARDCODED DATA (source of truth from HTML)
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

// Salesforce pipeline detail (update when new SF export is loaded)
// These sub-stage breakdowns can't come from daily Supabase data
// Source: Salesforce "Google Ads 2026" export, July 13, 2026
// Note: export filter now includes "Google Ads,Meta Ads". Closed Lost - DNC excluded as Meta Ads historical.
// 376 Google Ads leads. 16 checkouts, $23,290 revenue (2 newest checkouts pending Amount Paid).
const GOOGLE_SF_PIPELINE = { total: 376, waiting: 215, sentToTxP: 23, txpApproved: 4, sentCheckout: 87, checkedOut: 16, referredOut: 22, denied: 0, closedLost: 6, waitingTxPAssign: 1, tempHold: 2 };
const GOOGLE_REVENUE: number = 23290; // 16 checkouts, $23,290 subtotal from Salesforce (2 pending)

// Google Ads daily seed data (source of truth — merged with Supabase on load)
// June 1-15 spend/clicks/impressions from Google Ads Report Editor, June 15, 2026
// June 16-22 spend/clicks/impressions from Google Ads Report Editor, June 22, 2026
// June 23-25 spend/clicks/impressions from Google Ads Campaigns view, June 25, 2026
// June 26-29 spend/clicks/impressions from Google Ads Campaigns view, June 30, 2026
// June 30-Jul 5 spend/clicks/impressions from Google Ads Report Editor, July 6, 2026
// All lead metrics from Salesforce "Google Ads 2026" export, July 6, 2026:
//   submit  = Created Date count (lead entered system / opened form)
//   started = Date: Submission count (assessment submitted)
//   finished = Date: Sent to TxProvider count (sent for review)
//   treatment = Date: Checkout count (patient checked out)
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
  // June 30 - July 6: lead metrics from Salesforce July 6 export. Spend/clicks/impressions from Google Ads report (Jul 6 partial — today).
  { date: '2026-06-30', spend: 544.72, clicks: 142, impressions: 3010, submit: 6, started: 3, finished: 3, treatment: 1 },
  { date: '2026-07-01', spend: 586.05, clicks: 156, impressions: 2952, submit: 6, started: 1, finished: 2, treatment: 0 },
  { date: '2026-07-02', spend: 517.02, clicks: 143, impressions: 2812, submit: 4, started: 1, finished: 1, treatment: 1 },
  { date: '2026-07-03', spend: 440.25, clicks: 119, impressions: 2260, submit: 3, started: 3, finished: 1, treatment: 0 },
  { date: '2026-07-04', spend: 345.97, clicks: 111, impressions: 1992, submit: 3, started: 1, finished: 2, treatment: 0 },
  { date: '2026-07-05', spend: 751.95, clicks: 204, impressions: 3610, submit: 5, started: 5, finished: 1, treatment: 0 },
  { date: '2026-07-06', spend: 0, clicks: 0, impressions: 0, submit: 11, started: 5, finished: 10, treatment: 1 },
  // July 7-8: lead metrics from Salesforce July 8 export. Spend/clicks/impressions TBD from Google Ads.
  { date: '2026-07-07', spend: 0, clicks: 0, impressions: 0, submit: 8, started: 1, finished: 2, treatment: 0 },
  { date: '2026-07-08', spend: 0, clicks: 0, impressions: 0, submit: 4, started: 3, finished: 2, treatment: 0 },
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
   COMPONENT
   ════════════════════════════════════════════ */

export default function PaidAds() {
  const [entries, setEntries] = useState<GoogleAdsDaily[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  /* ──── Computed stats ──── */

  const sorted = useMemo(() => [...entries].sort((a, b) => a.date.localeCompare(b.date)), [entries]);

  // All-days totals (spend/clicks/impressions are always valid)
  const gT = useMemo(() => {
    const t = { spend: 0, impressions: 0, clicks: 0, submit: 0, started: 0, finished: 0, treatment: 0 };
    sorted.forEach((e) => {
      t.spend += e.spend; t.impressions += e.impressions; t.clicks += e.clicks;
      t.submit += e.submit; t.started += e.started; t.finished += e.finished; t.treatment += e.treatment;
    });
    return t;
  }, [sorted]);

  // Tracked-only totals (excludes blackout days for conversion metrics)
  const gTracked = useMemo(() => {
    const t = { spend: 0, clicks: 0, submit: 0, started: 0, finished: 0, treatment: 0, days: 0 };
    sorted.forEach((e) => {
      if (isBlackout(e.date)) return;
      t.spend += e.spend; t.clicks += e.clicks;
      t.submit += e.submit; t.started += e.started; t.finished += e.finished; t.treatment += e.treatment;
      t.days += 1;
    });
    return t;
  }, [sorted]);

  const blackoutDays = useMemo(() => sorted.filter((e) => isBlackout(e.date)).length, [sorted]);

  // ALL aggregate stats from Salesforce pipeline — NOT from daily Supabase data.
  // Daily data is for the chart only. SF pipeline is the source of truth for KPIs.
  const googleTotalSpend = gT.spend;
  const googleTrackedSpend = gTracked.spend; // excludes blackout days
  const googleTotalLeads = GOOGLE_SF_PIPELINE.total;
  const googleDays = sorted.length || 1;
  const trackedDays = gTracked.days || 1;
  const avgCPC = gT.clicks > 0 ? gT.spend / gT.clicks : 0;
  const googleCPL = googleTotalLeads > 0 ? googleTotalSpend / googleTotalLeads : 0;
  const googleCPLTracked = googleTotalLeads > 0 ? googleTrackedSpend / googleTotalLeads : 0;

  // Submissions = people who completed the assessment
  const googleSubmissions = GOOGLE_SF_PIPELINE.sentToTxP + GOOGLE_SF_PIPELINE.txpApproved + GOOGLE_SF_PIPELINE.sentCheckout + GOOGLE_SF_PIPELINE.checkedOut + GOOGLE_SF_PIPELINE.referredOut + GOOGLE_SF_PIPELINE.closedLost;
  const googleCostPerSubmission = googleSubmissions > 0 ? googleTotalSpend / googleSubmissions : 0;
  const googleCostPerSubmissionTracked = googleSubmissions > 0 ? googleTrackedSpend / googleSubmissions : 0;
  const googleCheckouts = GOOGLE_SF_PIPELINE.checkedOut;
  const googleCostPerCheckout = googleCheckouts > 0 ? googleTotalSpend / googleCheckouts : 0;
  const googleCostPerCheckoutTracked = googleCheckouts > 0 ? googleTrackedSpend / googleCheckouts : 0;
  const googleRevenue = GOOGLE_REVENUE;
  const googleNet = googleRevenue - googleTotalSpend;
  const googleNetTracked = googleRevenue - googleTrackedSpend;
  const googleWaitingInfo = GOOGLE_SF_PIPELINE.waiting;
  const blackoutSpend = googleTotalSpend - googleTrackedSpend;

  // Meta stats
  const metaCampaignMonths = META_MONTHLY.filter((m) => m.spend >= 1000);
  const metaCampaignMonthCount = metaCampaignMonths.length;
  const metaTotalSpend = META_MONTHLY.reduce((s, m) => s + m.spend, 0);
  const metaTotalLeads = META_MONTHLY.reduce((s, m) => s + m.leads, 0);
  const metaCPL = metaTotalLeads > 0 ? metaTotalSpend / metaTotalLeads : 0;
  const metaSubmissions = (META_FUNNEL.entered || 0) - (META_FUNNEL.waitingInfo || 0) - (META_FUNNEL.denied || 0) - (META_FUNNEL.closedLost || 0);
  const metaCostPerSubmission = metaSubmissions > 0 ? metaTotalSpend / metaSubmissions : 0;
  const metaCostPerCheckout = META_FUNNEL.checkedOut > 0 ? metaTotalSpend / META_FUNNEL.checkedOut : 0;

  /* ──── Chart labels ──── */

  // For Clicks/CPC/Spend chart: exclude dates with no Google Ads data (spend=0)
  const sortedWithSpend = useMemo(() => sorted.filter(e => e.spend > 0), [sorted]);
  const spendLabels = sortedWithSpend.map((e) => e.date.substring(5).replace('-', '/'));
  const trendLabels = sorted.map((e) => e.date.substring(5).replace('-', '/'));

  // Annotation plugin ref for charts
  const sortedRef = useRef(sorted);
  sortedRef.current = sorted;

  const annotationPlugin = useMemo(() => ({
    id: 'padsAnnotation',
    afterDraw(chart: ChartJS) {
      const xScale = chart.scales.x;
      const yScale = chart.scales.y;
      const ctx = chart.ctx;
      const chartLabels = (chart.data.labels || []) as string[];

      const draw = (label: string, text1: string, text2: string, color: string) => {
        const idx = chartLabels.indexOf(label);
        if (idx < 0) return;
        const x = xScale.getPixelForValue(idx);
        ctx.save();
        ctx.beginPath();
        ctx.setLineDash([6, 4]);
        ctx.moveTo(x, yScale.top);
        ctx.lineTo(x, yScale.bottom);
        ctx.lineWidth = 2;
        ctx.strokeStyle = color;
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = color;
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(text1, x, yScale.top + 12);
        ctx.fillText(text2, x, yScale.top + 23);
        ctx.restore();
      };

      draw('04/17', 'Switched to', 'Conversions', TP.navy);
      draw('05/01', 'Campaign Split', '50/50 New Build', TP.darkPurple);
      draw('05/13', 'Budget Increase', '$150/campaign', '#00C853');

      // Draw blackout shaded region
      const blStart = chartLabels.indexOf('05/11');
      const blEnd = chartLabels.indexOf('05/20');
      if (blStart >= 0 && blEnd >= 0) {
        const x0 = xScale.getPixelForValue(blStart) - (xScale.getPixelForValue(1) - xScale.getPixelForValue(0)) / 2;
        const x1 = xScale.getPixelForValue(blEnd) + (xScale.getPixelForValue(1) - xScale.getPixelForValue(0)) / 2;
        ctx.save();
        ctx.fillStyle = 'rgba(221,87,89,0.08)';
        ctx.fillRect(x0, yScale.top, x1 - x0, yScale.bottom - yScale.top);
        ctx.fillStyle = TP.red;
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Tracking Blackout', (x0 + x1) / 2, yScale.bottom - 6);
        ctx.restore();
      }
    },
  }), []);

  /* ──── CPL over time — 7-day rolling average (excludes blackout days and days without spend data) ──── */
  const cplChartData = useMemo(() => {
    const labels: string[] = [];
    const data: (number | null)[] = [];
    sortedWithSpend.forEach((e, i) => {
      labels.push(e.date.substring(5).replace('-', '/'));
      if (isBlackout(e.date)) { data.push(null); return; }
      // Look back up to 7 non-blackout days
      let windowSpend = 0, windowLeads = 0;
      for (let j = i; j >= Math.max(0, i - 6); j--) {
        const d = sortedWithSpend[j];
        if (isBlackout(d.date)) continue;
        windowSpend += d.spend || 0;
        windowLeads += d.started || 0;
      }
      if (windowLeads === 0) { data.push(null); return; }
      data.push(parseFloat((windowSpend / windowLeads).toFixed(2)));
    });
    return { labels, data };
  }, [sortedWithSpend]);

  /* ──── CPC data ──── */
  const cpcData = sortedWithSpend.map((e) =>
    e.clicks > 0 ? parseFloat(((e.spend || 0) / e.clicks).toFixed(2)) : null
  );

  /* ──── Funnel bar data (tracked days only for conversion metrics) ──── */
  const funnelBarData = useMemo(() => {
    const tracked = sorted.filter((e) => !isBlackout(e.date));
    const totalClicks = tracked.reduce((s, e) => s + (e.clicks || 0), 0);
    const totalOpened = tracked.reduce((s, e) => s + (e.submit || 0), 0);
    const totalStarted = tracked.reduce((s, e) => s + (e.started || 0), 0);
    const totalCompleted = tracked.reduce((s, e) => s + (e.finished || 0), 0);
    const totalTx = tracked.reduce((s, e) => s + (e.treatment || 0), 0);
    return {
      labels: [`Clicks (${trackedDays}d)`, 'Opened Form', 'Started Entry', 'Completed', 'Started Tx'],
      values: [totalClicks, totalOpened, totalStarted, totalCompleted, totalTx],
      colors: ['#E57373', TP.darkPurple, TP.blue, '#2e7d32', '#00C853'],
      totalClicks,
    };
  }, [sorted, trackedDays]);

  /* ──── Google vs Meta comparison rows ──── */
  const compareRows = useMemo(() => [
    { label: 'Time Active', meta: `${metaCampaignMonthCount} months`, google: `${googleDays} days (${trackedDays} tracked)` },
    { label: 'Total Spend', meta: `$${Math.round(metaTotalSpend).toLocaleString()}`, google: `$${Math.round(googleTotalSpend).toLocaleString()}` },
    { label: 'Total Leads', meta: `${metaTotalLeads}`, google: `${googleTotalLeads}` },
    { label: 'Waiting on Info', meta: `${META_FUNNEL.waitingInfo} of ${META_FUNNEL.entered} (${META_FUNNEL.entered > 0 ? (META_FUNNEL.waitingInfo / META_FUNNEL.entered * 100).toFixed(0) : 0}%)`, google: `${googleWaitingInfo} of ${googleTotalLeads} (${googleTotalLeads > 0 ? (googleWaitingInfo / googleTotalLeads * 100).toFixed(0) : 0}%)` },
    { label: 'Cost per Lead', meta: metaCPL > 0 ? `$${Math.round(metaCPL).toLocaleString()}` : 'No leads', google: googleCPL > 0 ? `$${Math.round(googleCPL).toLocaleString()}` : '--', highlight: true },
    { label: 'Submissions (past waiting)', meta: `${metaSubmissions} of ${META_FUNNEL.entered} (${META_FUNNEL.entered > 0 ? (metaSubmissions / META_FUNNEL.entered * 100).toFixed(0) : 0}%)`, google: `${googleSubmissions} of ${googleTotalLeads} (${googleTotalLeads > 0 ? (googleSubmissions / googleTotalLeads * 100).toFixed(0) : 0}%)` },
    { label: 'Cost per Submission', meta: metaCostPerSubmission > 0 ? `$${Math.round(metaCostPerSubmission).toLocaleString()}` : '--', google: googleCostPerSubmission > 0 ? `$${Math.round(googleCostPerSubmission).toLocaleString()}` : '--', highlight: true },
    { label: 'Cost per Checkout', meta: metaCostPerCheckout > 0 ? `$${Math.round(metaCostPerCheckout).toLocaleString()}` : '--', google: googleCostPerCheckout > 0 ? `$${Math.round(googleCostPerCheckout).toLocaleString()}` : '--', highlight: true },
    { label: 'Leads per Day', meta: metaTotalLeads > 0 ? (metaTotalLeads / (metaCampaignMonthCount * 30)).toFixed(2) : '0', google: googleTotalLeads > 0 ? `${(googleTotalLeads / trackedDays).toFixed(2)} (${trackedDays}d tracked)` : '0', highlight: true },
    { label: 'Sent Checkout Link', meta: `${META_FUNNEL.sentCheckout} of ${META_FUNNEL.entered} (${META_FUNNEL.entered > 0 ? (META_FUNNEL.sentCheckout / META_FUNNEL.entered * 100).toFixed(0) : 0}%)`, google: `${GOOGLE_SF_PIPELINE.sentCheckout} of ${googleTotalLeads} (${googleTotalLeads > 0 ? (GOOGLE_SF_PIPELINE.sentCheckout / googleTotalLeads * 100).toFixed(0) : 0}%)` },
    { label: 'Checked Out', meta: `${META_FUNNEL.checkedOut} -- $${(META_FUNNEL.amountReceived || 0).toLocaleString()}`, google: `${googleCheckouts} -- $${googleRevenue.toLocaleString()}`, highlight: true },
    { label: 'Denied / Closed Lost', meta: `${META_FUNNEL.denied + META_FUNNEL.closedLost} (${META_FUNNEL.entered > 0 ? ((META_FUNNEL.denied + META_FUNNEL.closedLost) / META_FUNNEL.entered * 100).toFixed(0) : 0}%)`, google: `${GOOGLE_SF_PIPELINE.denied + GOOGLE_SF_PIPELINE.closedLost} (${googleTotalLeads > 0 ? ((GOOGLE_SF_PIPELINE.denied + GOOGLE_SF_PIPELINE.closedLost) / googleTotalLeads * 100).toFixed(0) : 0}%)` },
  ], [googleTotalSpend, googleTotalLeads, googleDays, trackedDays, googleCPL, googleSubmissions, googleCostPerSubmission, googleCostPerCheckout, googleCheckouts, googleRevenue, googleWaitingInfo, metaCPL, metaSubmissions, metaCostPerSubmission, metaCostPerCheckout, metaTotalSpend, metaTotalLeads, metaCampaignMonthCount]);

  const advantage = metaCPL > 0 && googleCPL > 0 ? Math.round(metaCPL / googleCPL) : 0;

  /* ──── RENDER ──── */

  if (loading) {
    return <div style={{ color: '#999', padding: '48px 0', textAlign: 'center' }}>Loading paid ads data...</div>;
  }

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '12px 16px', borderRadius: 8, fontSize: 14, marginBottom: 16 }}>{error}</div>
      )}

      {/* ═══════ SECTION 1: Google Ads — Current Performance ═══════ */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#E57373', borderBottom: '2px solid #E57373', paddingBottom: 8, marginBottom: 16 }}>
          Google Ads -- Current Performance
        </div>

        {/* Google KPI cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 20 }}>
          <KPICard color="#E57373" label="Total Spend" value={`$${gT.spend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} sub={<>{sorted.length} days ({blackoutDays} blackout){blackoutDays > 0 && <><br/><span style={{ color: '#2e7d32' }}>Excl. blackout: ${googleTrackedSpend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></>}</>} />
          <KPICard color={TP.yellow} label="Cost per Click" value={`$${avgCPC.toFixed(2)}`} sub={`${gT.clicks.toLocaleString()} clicks total`} />
          <KPICard color={TP.blue} label="Cost per Lead" value={`$${Math.round(googleCPL)}`} sub={<>{googleTotalLeads} leads ({trackedDays}d tracked){blackoutDays > 0 && <><br/><span style={{ color: '#2e7d32' }}>Excl. blackout: ${Math.round(googleCPLTracked)}</span></>}</>} />
          <KPICard color={TP.darkPurple} label="Cost per Submission" value={`$${Math.round(googleCostPerSubmission)}`} sub={<>{googleSubmissions} submitted ({trackedDays}d tracked){blackoutDays > 0 && <><br/><span style={{ color: '#2e7d32' }}>Excl. blackout: ${Math.round(googleCostPerSubmissionTracked)}</span></>}</>} />
          <KPICard color="#00C853" label="Cost per Checkout" value={googleCheckouts > 0 ? `$${Math.round(googleCostPerCheckout).toLocaleString()}` : '--'} sub={<>{googleCheckouts} checkout{googleCheckouts !== 1 ? 's' : ''} (${googleRevenue.toLocaleString()} rev){blackoutDays > 0 && googleCheckouts > 0 && <><br/><span style={{ color: '#2e7d32' }}>Excl. blackout: ${Math.round(googleCostPerCheckoutTracked).toLocaleString()}</span></>}</>} />
        </div>

        {/* Chart 1: Clicks, CPC & Spend */}
        <ChartLabel>Clicks, CPC &amp; Spend</ChartLabel>
        <ChartCard>
          <div style={{ height: 350 }}>
            {sortedWithSpend.length > 1 ? (
              <Line
                data={{
                  labels: spendLabels,
                  datasets: [
                    { label: 'Clicks', data: sortedWithSpend.map((e) => e.clicks || 0), borderColor: '#E57373', borderWidth: 2.5, tension: 0.3, fill: false, pointRadius: 4, pointBackgroundColor: '#E57373', yAxisID: 'y' },
                    { label: 'Spend ($)', data: sortedWithSpend.map((e) => e.spend || 0), borderColor: TP.blue, borderWidth: 2, borderDash: [4, 2], tension: 0.3, fill: false, pointRadius: 3, pointBackgroundColor: TP.blue, yAxisID: 'y1' },
                    { label: 'CPC ($)', data: cpcData, borderColor: TP.yellow, borderWidth: 2.5, tension: 0.3, fill: false, pointRadius: 5, pointBackgroundColor: TP.yellow, yAxisID: 'y2', spanGaps: true },
                  ],
                }}
                options={{
                  responsive: true, maintainAspectRatio: false,
                  layout: { padding: { top: 30 } },
                  plugins: {
                    legend: { position: 'top', labels: { usePointStyle: true, padding: 16, font: { size: 11 } } },
                    tooltip: { mode: 'index' as const, intersect: false, callbacks: { label: (ctx) => ctx.datasetIndex >= 1 ? `${ctx.dataset.label}: $${ctx.parsed.y !== null ? ctx.parsed.y.toFixed(2) : '--'}` : `${ctx.dataset.label}: ${ctx.parsed.y}` } },
                  },
                  scales: {
                    y: { beginAtZero: true, position: 'left', ticks: { stepSize: 10 }, title: { display: true, text: 'Clicks', font: { size: 10 } } },
                    y1: { beginAtZero: true, position: 'right', grid: { drawOnChartArea: false }, ticks: { callback: (v) => `$${Number(v).toFixed(0)}` }, title: { display: true, text: 'Spend', font: { size: 10 }, color: TP.blue } },
                    y2: { beginAtZero: true, position: 'right', grid: { drawOnChartArea: false }, ticks: { callback: (v) => `$${Number(v).toFixed(0)}`, color: TP.yellow }, title: { display: true, text: 'CPC', font: { size: 10 }, color: TP.yellow }, suggestedMax: 10 },
                  },
                  interaction: { mode: 'nearest' as const, axis: 'x' as const, intersect: false },
                }}
                plugins={[annotationPlugin as never]}
              />
            ) : <NoData />}
          </div>
        </ChartCard>

        {/* Chart 2: Daily Funnel Flow */}
        <ChartLabel>Daily Funnel Flow</ChartLabel>
        <ChartCard>
          <div style={{ height: 280 }}>
            {sorted.length > 1 ? (
              <Line
                data={{
                  labels: trendLabels,
                  datasets: [
                    { label: 'Opened Form', data: sorted.map((e) => isBlackout(e.date) ? null : (e.submit || 0)), borderColor: TP.darkPurple, borderWidth: 2.5, tension: 0.3, fill: false, pointRadius: 3, pointBackgroundColor: TP.darkPurple, spanGaps: false },
                    { label: 'Started Entry', data: sorted.map((e) => isBlackout(e.date) ? null : (e.started || 0)), borderColor: TP.blue, borderWidth: 2.5, tension: 0.3, fill: false, pointRadius: 3, pointBackgroundColor: TP.blue, spanGaps: false },
                    { label: 'Completed', data: sorted.map((e) => isBlackout(e.date) ? null : (e.finished || 0)), borderColor: '#2e7d32', borderWidth: 2.5, tension: 0.3, fill: false, pointRadius: 3, pointBackgroundColor: '#2e7d32', spanGaps: false },
                    { label: 'Started Tx', data: sorted.map((e) => isBlackout(e.date) ? null : (e.treatment || 0)), borderColor: '#00C853', borderWidth: 2, tension: 0.3, fill: false, pointRadius: 4, pointBackgroundColor: '#00C853', borderDash: [4, 2], spanGaps: false },
                  ],
                }}
                options={{
                  responsive: true, maintainAspectRatio: false,
                  layout: { padding: { top: 10 } },
                  plugins: {
                    legend: { position: 'top', labels: { usePointStyle: true, padding: 14, font: { size: 11 } } },
                    tooltip: { mode: 'index' as const, intersect: false },
                  },
                  scales: { y: { beginAtZero: true, ticks: { stepSize: 5 }, title: { display: true, text: 'Count', font: { size: 10 } } } },
                  interaction: { mode: 'nearest' as const, axis: 'x' as const, intersect: false },
                }}
                plugins={[annotationPlugin as never]}
              />
            ) : <NoData />}
          </div>
        </ChartCard>

        {/* Chart 3: Assessment Funnel (horizontal bar, tracked days only) */}
        <ChartLabel>Assessment Funnel ({trackedDays} Tracked Days)</ChartLabel>
        <ChartCard>
          <div style={{ height: 250 }}>
            <Bar
              data={{
                labels: funnelBarData.labels,
                datasets: [{
                  data: funnelBarData.values,
                  backgroundColor: funnelBarData.colors,
                  borderColor: funnelBarData.colors,
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
                        const pct = funnelBarData.totalClicks > 0 ? (val / funnelBarData.totalClicks * 100).toFixed(1) : '0';
                        return `${val} (${pct}% of clicks)`;
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

        {/* Chart 4: Cost per Lead — 7-day Rolling Average */}
        <ChartLabel>Cost per Lead (7-day Rolling Avg)</ChartLabel>
        <ChartCard>
          <div style={{ height: 260 }}>
            {cplChartData.data.length > 1 ? (
              <Line
                data={{
                  labels: cplChartData.labels,
                  datasets: [{
                    label: 'Cost per Lead',
                    data: cplChartData.data,
                    borderColor: '#E57373', borderWidth: 2.5, tension: 0.3,
                    fill: true, backgroundColor: '#E5737320',
                    pointRadius: 4, pointBackgroundColor: '#E57373', spanGaps: true,
                  }],
                }}
                options={{
                  responsive: true, maintainAspectRatio: false,
                  layout: { padding: { top: 25 } },
                  plugins: {
                    legend: { position: 'top', labels: { usePointStyle: true, padding: 12, font: { size: 11 } } },
                    tooltip: { callbacks: { label: (ctx) => `CPL: $${ctx.parsed.y !== null ? ctx.parsed.y.toFixed(2) : '--'}` } },
                  },
                  scales: {
                    y: { beginAtZero: false, ticks: { callback: (v) => `$${Number(v).toFixed(0)}` }, title: { display: true, text: 'Cost per Lead', font: { size: 10 } } },
                  },
                  interaction: { mode: 'nearest' as const, axis: 'x' as const, intersect: false },
                }}
                plugins={[annotationPlugin as never]}
              />
            ) : <NoData />}
          </div>
        </ChartCard>

        {/* Salesforce Pipeline */}
        <ChartLabel>Salesforce Pipeline</ChartLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 12 }}>
          {[
            { label: 'Waiting on Info', val: googleWaitingInfo, color: '#999' },
            { label: 'Sent to TxP', val: GOOGLE_SF_PIPELINE.sentToTxP, color: TP.darkPurple },
            { label: 'TxP Approved', val: GOOGLE_SF_PIPELINE.txpApproved, color: TP.blue },
            { label: 'Sent Checkout', val: GOOGLE_SF_PIPELINE.sentCheckout, color: TP.yellow },
            { label: 'Checked Out', val: googleCheckouts, color: '#00C853' },
          ].map((s) => (
            <div key={s.label} style={{
              background: '#fff', borderRadius: 10, padding: '14px 10px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)', textAlign: 'center',
              borderTop: `3px solid ${s.color}`,
            }}>
              <div style={{ fontSize: '0.65em', color: '#666', textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: '1.5em', fontWeight: 'bold', color: TP.navy }}>{s.val}</div>
            </div>
          ))}
        </div>

        {/* Revenue vs Spend */}
        <div style={{
          background: 'linear-gradient(135deg, #f8faf8, #f0f7ed)',
          borderRadius: 12, padding: '20px 24px', marginBottom: 16, border: '1px solid #e0e8d8',
        }}>
          <div style={{ fontWeight: 700, color: TP.navy, fontSize: '0.95em', marginBottom: 12 }}>Revenue vs Spend</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '0.7em', color: '#666', textTransform: 'uppercase', marginBottom: 4 }}>Total Spend</div>
              <div style={{ fontSize: '1.6em', fontWeight: 'bold', color: '#E57373' }}>${googleTotalSpend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.7em', color: '#666', textTransform: 'uppercase', marginBottom: 4 }}>Revenue (Checkouts)</div>
              <div style={{ fontSize: '1.6em', fontWeight: 'bold', color: googleRevenue > 0 ? '#00C853' : '#999' }}>
                {googleRevenue > 0 ? `$${googleRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '$0'}{googleRevenue === 0 && <span style={{ fontSize: '0.5em', fontWeight: 400 }}> pending</span>}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.7em', color: '#666', textTransform: 'uppercase', marginBottom: 4 }}>Net</div>
              <div style={{ fontSize: '1.6em', fontWeight: 'bold', color: googleRevenue > 0 ? (googleNet >= 0 ? '#00C853' : '#E57373') : '#999' }}>
                {googleRevenue > 0 ? `${googleNet >= 0 ? '+' : ''}$${Math.abs(googleNet).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '--'}
              </div>
            </div>
          </div>
          {blackoutDays > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, textAlign: 'center', marginTop: 12, paddingTop: 12, borderTop: '1px dashed #c8d8c0' }}>
              <div>
                <div style={{ fontSize: '0.65em', color: '#2e7d32', textTransform: 'uppercase', marginBottom: 4 }}>Excl. Blackout Spend</div>
                <div style={{ fontSize: '1.3em', fontWeight: 'bold', color: '#2e7d32' }}>${googleTrackedSpend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.65em', color: '#888', textTransform: 'uppercase', marginBottom: 4 }}>Blackout Spend</div>
                <div style={{ fontSize: '1.3em', fontWeight: 'bold', color: '#999' }}>${blackoutSpend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.65em', color: '#2e7d32', textTransform: 'uppercase', marginBottom: 4 }}>Net (Excl. Blackout)</div>
                <div style={{ fontSize: '1.3em', fontWeight: 'bold', color: googleNetTracked >= 0 ? '#00C853' : '#E57373' }}>
                  {`${googleNetTracked >= 0 ? '+' : ''}$${Math.abs(googleNetTracked).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                </div>
              </div>
            </div>
          )}
          <div style={{ fontSize: '0.78em', color: '#888', marginTop: 10 }}>
            {googleCheckouts} checkout{googleCheckouts !== 1 ? 's' : ''} totaling ${googleRevenue.toLocaleString()}. {GOOGLE_SF_PIPELINE.sentCheckout} more at Sent Checkout stage.
          </div>
        </div>
      </div>

      {/* ═══════ SECTION 2: Google vs Meta — Platform Comparison ═══════ */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: TP.navy, borderBottom: `2px solid ${TP.navy}`, paddingBottom: 8, marginBottom: 16 }}>
          Google vs Meta -- Platform Comparison
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9em', background: '#fff', borderRadius: 10, overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }}>
            <thead>
              <tr style={{ background: TP.navy }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#fff', width: '40%' }}>Metric</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', color: '#999', width: '30%' }}>Meta Ads</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', color: TP.green, width: '30%' }}>Google Ads</th>
              </tr>
            </thead>
            <tbody>
              {compareRows.map((row, idx) => (
                <tr key={row.label} style={{
                  background: row.highlight ? '#f0f7ed' : (idx % 2 === 0 ? '#f9f9f9' : '#fff'),
                  fontWeight: row.highlight ? 600 : 400,
                }}>
                  <td style={{ padding: '10px 16px' }}>{row.label}</td>
                  <td style={{ padding: '10px 16px', textAlign: 'center', color: '#999' }}>{row.meta}</td>
                  <td style={{ padding: '10px 16px', textAlign: 'center', color: TP.navy, fontWeight: 600 }}>{row.google}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Cost advantage callout */}
        {advantage > 0 && (
          <div style={{ background: '#f0f7ed', borderLeft: '4px solid #5BA88C', borderRadius: 8, padding: '16px 20px', marginTop: 16 }}>
            <div style={{ fontSize: '1.1em', fontWeight: 700, color: TP.navy }}>Google leads cost {advantage}x less per lead than Meta.</div>
            <div style={{ fontSize: '0.88em', color: '#555', marginTop: 6 }}>
              Meta spent ${Math.round(metaTotalSpend).toLocaleString()} over {metaCampaignMonthCount} months for {metaTotalLeads} leads (${Math.round(metaCPL)} each). Google has spent ${Math.round(googleTotalSpend).toLocaleString()} in {googleDays} days for {googleTotalLeads} leads (${Math.round(googleCPL)} each).
            </div>
          </div>
        )}
      </div>

      {/* ═══════ SECTION 3: Google Ads — Daily Tracking ═══════ */}
      <div style={{ fontSize: 16, fontWeight: 700, color: '#E57373', borderBottom: '2px solid #E57373', paddingBottom: 8, marginBottom: 16 }}>
        Google Ads -- Daily Tracking
      </div>

      {/* Entry form */}
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
      </div>

      {/* Daily table */}
      <div style={{ overflowX: 'auto', marginBottom: 24 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82em', background: '#fff', borderRadius: 10, overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }}>
          <thead>
            <tr style={{ background: TP.navy }}>
              {['Date', 'Spend', 'Imp', 'Clicks', 'Opened', 'Started', 'Completed', 'Tx'].map((h) => (
                <th key={h} style={{ padding: '8px 10px', textAlign: h === 'Date' ? 'left' : 'right', color: '#fff' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...sorted].reverse().map((e, idx) => {
              const bo = isBlackout(e.date);
              return (
                <tr key={e.date} onClick={() => handleRowClick(e)} style={{
                  background: bo ? '#fff3f3' : (idx % 2 === 0 ? '#f9f9f9' : '#fff'),
                  cursor: 'pointer',
                  opacity: bo ? 0.7 : 1,
                }}>
                  <td style={{ padding: '6px 10px', whiteSpace: 'nowrap' }}>
                    {e.date}{bo && <span style={{ color: TP.red, fontSize: '0.7em', marginLeft: 4 }}>*</span>}
                  </td>
                  <td style={{ padding: '6px 10px', textAlign: 'right' }}>${(e.spend || 0).toFixed(2)}</td>
                  <td style={{ padding: '6px 10px', textAlign: 'right' }}>{(e.impressions || 0).toLocaleString()}</td>
                  <td style={{ padding: '6px 10px', textAlign: 'right' }}>{e.clicks || 0}</td>
                  <td style={{ padding: '6px 10px', textAlign: 'right', color: bo ? '#ccc' : 'inherit' }}>{bo ? '--' : (e.submit || 0)}</td>
                  <td style={{ padding: '6px 10px', textAlign: 'right', color: bo ? '#ccc' : 'inherit' }}>{bo ? '--' : (e.started || 0)}</td>
                  <td style={{ padding: '6px 10px', textAlign: 'right', color: bo ? '#ccc' : 'inherit' }}>{bo ? '--' : (e.finished || 0)}</td>
                  <td style={{ padding: '6px 10px', textAlign: 'right', color: bo ? '#ccc' : 'inherit' }}>{bo ? '--' : (e.treatment || 0)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Blackout note */}
      {blackoutDays > 0 && (
        <div style={{ background: '#fff3f3', borderLeft: `4px solid ${TP.red}`, borderRadius: 8, padding: '12px 16px', marginBottom: 16, fontSize: 13, color: '#555', lineHeight: 1.6 }}>
          <strong style={{ color: TP.red }}>* Tracking Blackout (May 11--20):</strong> The go.toothpillow tracking link was broken during this period. Spend, impressions, and clicks are accurate (from Google Ads), but conversion data (Opened, Started, Completed, Tx) is unreliable. These {blackoutDays} days are excluded from all conversion-based averages (CPL, Cost per Submission, Cost per Checkout, Assessment Funnel, Leads per Day).
        </div>
      )}

      {/* Timeline callout */}
      <div style={{ background: '#F8F5F0', borderLeft: `4px solid ${TP.yellow}`, borderRadius: 8, padding: '16px 20px', marginTop: 24 }}>
        <div style={{ fontWeight: 600, color: TP.navy, marginBottom: 10, fontSize: 14 }}>Timeline</div>
        <div style={{ fontSize: 13, color: '#555', lineHeight: 1.7 }}>
          <strong>Mar 2025:</strong> Meta Ads launched<br />
          <strong>Mar 2025--Mar 2026:</strong> Meta spent $25.6K total, 54 leads ($475/lead)<br />
          <strong>Late Mar 2026:</strong> Google Ads launched, Meta budget redirected<br />
          <strong>Apr 1:</strong> Meta paused (only $72 residual)<br />
          <strong>Apr 17:</strong> Google switched from &quot;optimize for clicks&quot; to &quot;optimize for conversions&quot;<br />
          <strong>May 1:</strong> Campaign split 50/50 new build<br />
          <strong>May 11--20:</strong> go.toothpillow tracking link broken — conversion data missing<br />
          <strong>May 12:</strong> Budget increased to $150/campaign ($300/day total)
        </div>
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
