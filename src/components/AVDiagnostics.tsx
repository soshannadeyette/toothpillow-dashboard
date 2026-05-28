'use client';

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

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler);

const TP = {
  blue: '#3A6EA4',
  skyBlue: '#B6CAE3',
  green: '#1D9E75',
  red: '#E24B4A',
  purple: '#7F77DD',
  amber: '#EF9F27',
  navy: '#1B2A4A',
  text: '#333333',
  cream: '#FEF8EE',
  coral: '#D85A30',
  peach: '#FBCCC5',
};

// ── Hardcoded data (source of truth) ──────────────────────────────────
// Source: Salesforce "Waiting on Info Ratios" export, pulled May 28 2026 15:37 PST
// "starts" = Salesforce Person Account creations (assessment starts)
// "waiting" = current WAITING stage (needs info / needs photos) — never finished
// "submitted" = have a Submission Date — completed their assessment
// Major assessment update shipped May 22 — May split into pre/post
const AV_DATA = [
  { label: 'Jan 26', month: 1,  year: 2026, traffic: 37320, starts: 1146, waiting: 108, submitted: 1035, partial: false, period: 'full' as const },
  { label: 'Feb 26', month: 2,  year: 2026, traffic: 51480, starts: 2193, waiting: 888, submitted: 1293, partial: false, period: 'full' as const },
  { label: 'Mar 26', month: 3,  year: 2026, traffic: 39218, starts: 2263, waiting: 967, submitted: 1285, partial: false, period: 'full' as const },
  { label: 'Apr 26', month: 4,  year: 2026, traffic: 30311, starts: 1431, waiting: 569, submitted: 854,  partial: false, period: 'full' as const },
  { label: 'May 1–22', month: 5, year: 2026, traffic: 21819, starts: 1037, waiting: 499, submitted: 538, partial: false, period: 'pre-update' as const },
  { label: 'May 23–28', month: 5,  year: 2026, traffic: 5039,  starts: 327,  waiting: 170,  submitted: 157,  partial: true,  period: 'post-update' as const },
];

// ── Full pipeline funnel by month (source of truth) ──────────────────
// From same Salesforce export — current stage of all 2026 accounts
// Stages grouped: Waiting (stuck), In Review (Sent to Dr Ben through TxP Approved),
// Checkout (Sent Checkout Link), Checked Out (CHECKED OUT + Consult Complete + Myo Only),
// Closed (Referred Out, Denied, Closed Lost, etc.), On Hold
const FUNNEL_DATA = [
  { label: 'Jan 26', waiting: 108, inReview:  0, checkout:  92, checkedOut: 311, closed: 617, onHold: 18 },
  { label: 'Feb 26', waiting: 888, inReview:  6, checkout: 480, checkedOut: 320, closed: 472, onHold: 27 },
  { label: 'Mar 26', waiting: 967, inReview: 13, checkout: 530, checkedOut: 359, closed: 366, onHold: 28 },
  { label: 'Apr 26', waiting: 569, inReview: 36, checkout: 434, checkedOut: 164, closed: 212, onHold: 16 },
  { label: 'May 26', waiting: 667, inReview: 247, checkout: 320, checkedOut: 68,  closed: 52,  onHold: 10 },
];

// ── May daily data (source of truth) ─────────────────────────────────
// Daily breakdown: account creations, waiting, and submitted for May 2026
const MAY_DAILY = [
  { day: 1, starts: 42, waiting: 17, submitted: 25 },
  { day: 2, starts: 38, waiting: 21, submitted: 17 },
  { day: 3, starts: 40, waiting: 20, submitted: 20 },
  { day: 4, starts: 57, waiting: 25, submitted: 32 },
  { day: 5, starts: 37, waiting: 16, submitted: 21 },
  { day: 6, starts: 67, waiting: 31, submitted: 36 },
  { day: 7, starts: 46, waiting: 23, submitted: 23 },
  { day: 8, starts: 40, waiting: 17, submitted: 23 },
  { day: 9, starts: 34, waiting: 16, submitted: 18 },
  { day: 10, starts: 31, waiting: 16, submitted: 15 },
  { day: 11, starts: 55, waiting: 23, submitted: 32 },
  { day: 12, starts: 42, waiting: 16, submitted: 26 },
  { day: 13, starts: 54, waiting: 25, submitted: 29 },
  { day: 14, starts: 49, waiting: 25, submitted: 24 },
  { day: 15, starts: 40, waiting: 18, submitted: 22 },
  { day: 16, starts: 33, waiting: 13, submitted: 20 },
  { day: 17, starts: 59, waiting: 35, submitted: 24 },
  { day: 18, starts: 48, waiting: 17, submitted: 31 },
  { day: 19, starts: 62, waiting: 33, submitted: 29 },
  { day: 20, starts: 46, waiting: 24, submitted: 22 },
  { day: 21, starts: 41, waiting: 20, submitted: 21 },
  { day: 22, starts: 76, waiting: 48, submitted: 28 },
  { day: 23, starts: 68, waiting: 47, submitted: 21 },
  { day: 24, starts: 41, waiting: 25, submitted: 16 },
  { day: 25, starts: 38, waiting: 18, submitted: 20 },
  { day: 26, starts: 44, waiting: 13, submitted: 31 },
  { day: 27, starts: 82, waiting: 42, submitted: 40 },
  { day: 28, starts: 54, waiting: 25, submitted: 29 },
];

// ── Conversion lag data (source of truth) ─────────────────────────────
// From Salesforce "Tracking Conversions" export: Created Date vs Date: Submission
// "Same day" = created and submitted on the same calendar day
// "Returning" = created on an earlier day, came back to submit later
const CONVERSION_LAG = [
  { label: 'Jan 26',    submissions: 1054, sameDay: 959, within7d: 1007, returning: 95,  medianLag: 0, meanLag: 9.1  },
  { label: 'Feb 26',    submissions: 1208, sameDay: 992, within7d: 1166, returning: 216, medianLag: 0, meanLag: 3.2  },
  { label: 'Mar 26',    submissions: 1287, sameDay: 963, within7d: 1175, returning: 324, medianLag: 0, meanLag: 7.9  },
  { label: 'Apr 26',    submissions: 967,  sameDay: 685, within7d: 810,  returning: 282, medianLag: 0, meanLag: 17.9 },
  { label: 'May 1–22',  submissions: 538,  sameDay: 389, within7d: 518,  returning: 149, medianLag: 0, meanLag: 1.0  },
  { label: 'May 23–28', submissions: 157,  sameDay: 141, within7d: 157,  returning: 16,  medianLag: 0, meanLag: 0.1  },
];

// Traffic for conversion rate calc (matches AV_DATA where available)
const CONV_TRAFFIC: Record<string, number> = {
  'Jan 26': 37320, 'Feb 26': 51480, 'Mar 26': 39218,
  'Apr 26': 30311, 'May 1–22': 21819, 'May 23–28': 5039,
};

// ── Lag distribution (source of truth) ───────────────────────────────
// Buckets: 0=same day, 1=next day, 2-3, 4-7, 8-14, 15-30, 31+
const LAG_BUCKETS = ['Same day', '1 day', '2–3 days', '4–7 days', '8–14 days', '15–30 days', '31+ days'] as const;
const LAG_DISTRIBUTION = [
  { label: 'Jan 26',   total: 1054, buckets: [959, 13, 27,  8,  8,  7, 32] },
  { label: 'Feb 26',   total: 1208, buckets: [992, 77, 55, 42, 18,  8, 16] },
  { label: 'Mar 26',   total: 1287, buckets: [963, 97, 57, 58, 44, 30, 38] },
  { label: 'Apr 26',   total: 967,  buckets: [685, 55, 39, 31, 21, 35, 101] },
  { label: 'May 1–22',  total: 538,  buckets: [392, 64, 39, 23, 14,  6,  0] },
  { label: 'May 23–28', total: 157,  buckets: [142, 12,  3,  0,  0,  0,  0] },
];

// ── Weekly cohort completion curves (source of truth) ────────────────
// Created-date cohorts: what % completed by day 0, 1, 3, 7
const COHORT_DATA = [
  { label: 'May 1–7',   n: 174, sameDay: 77.0, within1d: 88.5, within3d: 93.7, within7d: 96.0 },
  { label: 'May 8–14',  n: 167, sameDay: 69.5, within1d: 83.2, within3d: 89.2, within7d: 95.8 },
  { label: 'May 15–21', n: 169, sameDay: 70.4, within1d: 81.1, within3d: 91.7, within7d: 96.4 },
  { label: 'May 22–28', n: 185, sameDay: 87.0, within1d: 97.3, within3d: 100.0, within7d: 100.0 },
];

// ── Daily cohorts around update (May 17–27) ─────────────────────────
// n = total starts (account creations) that day. sameDay/d1/d2_3/d4_7 = how many submitted within that window.
// Unaccounted (n − sum of buckets) = still waiting.
const DAILY_COHORTS = [
  { day: 'May 17', n: 59, sameDay: 12, d1: 6, d2_3: 4, d4_7: 0 },
  { day: 'May 18', n: 48, sameDay: 23, d1: 2, d2_3: 2, d4_7: 2 },
  { day: 'May 19', n: 62, sameDay: 22, d1: 4, d2_3: 3, d4_7: 0 },
  { day: 'May 20', n: 46, sameDay: 16, d1: 1, d2_3: 3, d4_7: 1 },
  { day: 'May 21', n: 41, sameDay: 15, d1: 3, d2_3: 1, d4_7: 1 },
  { day: 'May 22', n: 76, sameDay: 20, d1: 6, d2_3: 2, d4_7: 0 },
  { day: 'May 23', n: 68, sameDay: 20, d1: 0, d2_3: 1, d4_7: 0 },
  { day: 'May 24', n: 41, sameDay: 14, d1: 1, d2_3: 1, d4_7: 0 },
  { day: 'May 25', n: 38, sameDay: 17, d1: 3, d2_3: 0, d4_7: 0 },
  { day: 'May 26', n: 44, sameDay: 29, d1: 1, d2_3: 1, d4_7: 0 },
  { day: 'May 27', n: 82, sameDay: 33, d1: 7, d2_3: 0, d4_7: 0 },
  { day: 'May 28', n: 54, sameDay: 29, d1: 0, d2_3: 0, d4_7: 0 },
];

// ── Cohort aging comparison (source of truth) ───────────────────────
// Tracks each weekly cohort broken into non-overlapping groups:
//   completed (within 7d + days 8-14 + 15+) | waiting | other
// These add up to starts. "mature" = every person has had that many days.
const COHORT_AGING = [
  { label: 'May 1–7',   starts: 327, within7d: 167, d8to14: 4, d15plus: 2, waiting: 154, daysElapsed: 21, mature7d: true,  mature14d: true,  postUpdate: false },
  { label: 'May 8–14',  starts: 305, within7d: 157, d8to14: 5, d15plus: 3, waiting: 140, daysElapsed: 14, mature7d: true,  mature14d: true,  postUpdate: false },
  { label: 'May 15–21', starts: 330, within7d: 163, d8to14: 4, d15plus: 0, waiting: 163, daysElapsed: 7,  mature7d: true,  mature14d: false, postUpdate: false },
  { label: 'May 22–28', starts: 367, within7d: 156, d8to14: 0, d15plus: 0, waiting: 211, daysElapsed: 0,  mature7d: false, mature14d: false, postUpdate: true  },
];

// ── Post-update tracking ────────────────────────────────────────────
const POST_UPDATE_DAYS_ELAPSED = 6; // May 23-28 = 6 days post-update

function num(v: number): string { return v.toLocaleString(); }
function pct(v: number, t: number): string { return t > 0 ? (v / t * 100).toFixed(1) + '%' : '--'; }

export default function AVDiagnostics() {
  const labels = AV_DATA.map(d => d.label);
  const postUpdate = AV_DATA.find(d => d.period === 'post-update')!;
  const preUpdate = AV_DATA.find(d => d.period === 'pre-update')!;

  // Derived metrics
  const waitPcts = AV_DATA.map(d => Math.round(d.waiting / d.starts * 1000) / 10);
  const completionRates = AV_DATA.map(d => Math.round(d.submitted / d.starts * 1000) / 10);

  // Pre vs post rates
  const preWaitPct = Math.round(preUpdate.waiting / preUpdate.starts * 1000) / 10;
  const postWaitPctVal = Math.round(postUpdate.waiting / postUpdate.starts * 1000) / 10;
  const preCompRate = Math.round(preUpdate.submitted / preUpdate.starts * 1000) / 10;
  const postCompRate = Math.round(postUpdate.submitted / postUpdate.starts * 1000) / 10;

  // Jan baseline
  const janData = AV_DATA.find(d => d.label === 'Jan 26')!;
  const janCompRate = Math.round(janData.submitted / janData.starts * 1000) / 10;
  const janWaitPct = Math.round(janData.waiting / janData.starts * 1000) / 10;

  // Conversion lag derived
  const lagLabels = CONVERSION_LAG.map(d => d.label);
  const sameDayPcts = CONVERSION_LAG.map(d => Math.round(d.sameDay / d.submissions * 1000) / 10);
  const returningPcts = CONVERSION_LAG.map(d => Math.round(d.returning / d.submissions * 1000) / 10);
  const convRates = CONVERSION_LAG.map(d => {
    const t = CONV_TRAFFIC[d.label];
    return t ? Math.round(d.submissions / t * 1000) / 10 : 0;
  });

  // ── Chart 1: Completion rate + waiting rate (lines) ──────────────────
  const rateChartData = {
    labels,
    datasets: [
      {
        label: 'Completion rate', data: completionRates,
        borderColor: TP.green, backgroundColor: 'rgba(29,158,117,0.08)', borderWidth: 2.5,
        pointRadius: 6, pointBackgroundColor: TP.green, fill: true, tension: 0.3,
      },
      {
        label: 'Waiting rate', data: waitPcts,
        borderColor: TP.red, backgroundColor: 'rgba(226,75,74,0.08)', borderWidth: 2.5,
        pointRadius: 6, pointBackgroundColor: TP.red, borderDash: [6, 3], fill: true, tension: 0.3,
      },
    ],
  };
  const rateChartOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Assessment completion rate vs waiting rate', font: { size: 14, weight: 500 as const }, color: TP.navy },
      tooltip: { callbacks: { label: (ctx: { dataset: { label: string }; parsed: { y: number } }) => ctx.dataset.label + ': ' + ctx.parsed.y + '%' } },
    },
    scales: {
      x: { ticks: { autoSkip: false } },
      y: { min: 0, max: 100, ticks: { callback: (v: number | string) => v + '%' } },
    },
  };

  // ── Chart 2: Stacked — submitted vs waiting vs other ───────────────
  const otherData = AV_DATA.map(d => d.starts - d.submitted - d.waiting);

  const stackedData = {
    labels, datasets: [
      {
        label: 'Submitted', data: AV_DATA.map(d => d.submitted),
        backgroundColor: AV_DATA.map(d => d.partial ? 'rgba(29,158,117,0.25)' : 'rgba(29,158,117,0.7)'),
        borderColor: AV_DATA.map(d => d.partial ? 'rgba(29,158,117,0.6)' : 'rgba(29,158,117,0)'),
        borderWidth: 1.5, borderRadius: 0,
      },
      {
        label: 'Waiting (stuck)', data: AV_DATA.map(d => d.waiting),
        backgroundColor: AV_DATA.map(d => d.partial ? 'rgba(226,75,74,0.25)' : 'rgba(226,75,74,0.7)'),
        borderColor: AV_DATA.map(d => d.partial ? 'rgba(226,75,74,0.6)' : 'rgba(226,75,74,0)'),
        borderWidth: 1.5, borderRadius: 0,
      },
      {
        label: 'In pipeline / closed', data: otherData,
        backgroundColor: AV_DATA.map(d => d.partial ? 'rgba(127,119,221,0.2)' : 'rgba(127,119,221,0.5)'),
        borderColor: AV_DATA.map(d => d.partial ? 'rgba(127,119,221,0.5)' : 'rgba(127,119,221,0)'),
        borderWidth: 1.5, borderRadius: 4,
      },
    ],
  };
  const stackedOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Account outcomes: submitted vs waiting vs in pipeline', font: { size: 14, weight: 500 as const }, color: TP.navy },
      tooltip: { callbacks: { label: (ctx: { dataset: { label: string }; parsed: { y: number } }) => ctx.dataset.label + ': ' + ctx.parsed.y.toLocaleString() } },
    },
    scales: {
      x: { stacked: true, ticks: { autoSkip: false } },
      y: { stacked: true, ticks: { callback: (v: number | string) => Number(v).toLocaleString() } },
    },
  };

  // ── Chart 2B: Pipeline funnel (stacked bar) ────────────────────────
  const funnelLabels = FUNNEL_DATA.map(d => d.label);
  const funnelChartData = {
    labels: funnelLabels,
    datasets: [
      { label: 'Checked Out', data: FUNNEL_DATA.map(d => d.checkedOut), backgroundColor: 'rgba(29,158,117,0.8)', borderRadius: 0 },
      { label: 'Checkout Link Sent', data: FUNNEL_DATA.map(d => d.checkout), backgroundColor: 'rgba(58,110,164,0.7)', borderRadius: 0 },
      { label: 'In Review', data: FUNNEL_DATA.map(d => d.inReview), backgroundColor: 'rgba(127,119,221,0.7)', borderRadius: 0 },
      { label: 'Waiting (stuck)', data: FUNNEL_DATA.map(d => d.waiting), backgroundColor: 'rgba(226,75,74,0.7)', borderRadius: 0 },
      { label: 'Closed / Denied', data: FUNNEL_DATA.map(d => d.closed), backgroundColor: 'rgba(156,163,175,0.5)', borderRadius: 0 },
      { label: 'On Hold', data: FUNNEL_DATA.map(d => d.onHold), backgroundColor: 'rgba(239,159,39,0.5)', borderRadius: 4 },
    ],
  };
  const funnelChartOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Where all 2026 accounts are now (current stage)', font: { size: 14, weight: 500 as const }, color: TP.navy },
      tooltip: { callbacks: { label: (ctx: { dataset: { label: string }; parsed: { y: number } }) => ctx.dataset.label + ': ' + ctx.parsed.y.toLocaleString() } },
    },
    scales: {
      x: { stacked: true, ticks: { autoSkip: false } },
      y: { stacked: true, ticks: { callback: (v: number | string) => Number(v).toLocaleString() } },
    },
  };

  // ── Chart 2C: May daily starts/waiting/submitted ───────────────────
  const mayLabels = MAY_DAILY.map(d => d.day.toString());
  const mayDailyChartData = {
    labels: mayLabels,
    datasets: [
      {
        type: 'bar' as const, label: 'Submitted', data: MAY_DAILY.map(d => d.submitted),
        backgroundColor: MAY_DAILY.map(d => d.day >= 23 ? 'rgba(29,158,117,0.35)' : 'rgba(29,158,117,0.7)'),
        borderColor: MAY_DAILY.map(d => d.day >= 23 ? 'rgba(29,158,117,0.6)' : 'rgba(29,158,117,0)'),
        borderWidth: 1, borderRadius: 0, stack: 'main', order: 2,
      },
      {
        type: 'bar' as const, label: 'Waiting', data: MAY_DAILY.map(d => d.waiting),
        backgroundColor: MAY_DAILY.map(d => d.day >= 23 ? 'rgba(226,75,74,0.35)' : 'rgba(226,75,74,0.7)'),
        borderColor: MAY_DAILY.map(d => d.day >= 23 ? 'rgba(226,75,74,0.6)' : 'rgba(226,75,74,0)'),
        borderWidth: 1, borderRadius: 0, stack: 'main', order: 2,
      },
      {
        type: 'line' as const, label: 'Starts', data: MAY_DAILY.map(d => d.starts),
        borderColor: TP.navy, backgroundColor: TP.navy, borderWidth: 2,
        pointRadius: 3, pointBackgroundColor: TP.navy, tension: 0.3, order: 1,
        yAxisID: 'y1',
      },
    ],
  };
  const mayDailyOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'May daily: starts vs submitted vs waiting (lighter = post-update)', font: { size: 14, weight: 500 as const }, color: TP.navy },
      tooltip: { callbacks: { label: (ctx: { dataset: { label: string }; parsed: { y: number } }) => ctx.dataset.label + ': ' + ctx.parsed.y } },
    },
    scales: {
      x: { stacked: true, title: { display: true, text: 'Day of May' } },
      y: { stacked: true, ticks: { callback: (v: number | string) => Number(v).toLocaleString() } },
      y1: { display: false, stacked: false, min: 0, max: 90 },
    },
  };

  // ── Chart 4: Conversion lag — same-day vs returning ─────────────────
  const lagChartData = {
    labels: lagLabels,
    datasets: [
      {
        label: 'Same-day %', data: sameDayPcts,
        backgroundColor: lagLabels.map(l => l === 'May 23–28' ? 'rgba(58,110,164,0.3)' : 'rgba(58,110,164,0.7)'),
        borderColor: lagLabels.map(l => l === 'May 23–28' ? 'rgba(58,110,164,0.5)' : 'rgba(58,110,164,0)'),
        borderWidth: 1.5, borderRadius: 0,
      },
      {
        label: 'Returning %', data: returningPcts,
        backgroundColor: lagLabels.map(l => l === 'May 23–28' ? 'rgba(239,159,39,0.3)' : 'rgba(239,159,39,0.7)'),
        borderColor: lagLabels.map(l => l === 'May 23–28' ? 'rgba(239,159,39,0.5)' : 'rgba(239,159,39,0)'),
        borderWidth: 1.5, borderRadius: 4,
      },
    ],
  };
  const lagChartOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Same-day vs returning submissions (% of total)', font: { size: 14, weight: 500 as const }, color: TP.navy },
      tooltip: { callbacks: { label: (ctx: { dataset: { label: string }; parsed: { y: number } }) => ctx.dataset.label + ': ' + ctx.parsed.y + '%' } },
    },
    scales: {
      x: { stacked: true, ticks: { autoSkip: false } },
      y: { stacked: true, max: 100, ticks: { callback: (v: number | string) => v + '%' } },
    },
  };

  // ── Chart 5: Traffic-to-submission conversion rate ──────────────────
  const convChartData = {
    labels: lagLabels,
    datasets: [{
      label: 'Conversion rate %', data: convRates,
      borderColor: TP.blue, backgroundColor: 'rgba(58,110,164,0.1)',
      borderWidth: 2.5, pointRadius: 6, pointBackgroundColor: TP.blue,
      fill: true, tension: 0.3,
    }],
  };
  const convChartOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Traffic → submission conversion rate', font: { size: 14, weight: 500 as const }, color: TP.navy },
      tooltip: { callbacks: { label: (ctx: { dataset: { label: string }; parsed: { y: number } }) => ctx.dataset.label + ': ' + ctx.parsed.y + '%' } },
    },
    scales: {
      x: { ticks: { autoSkip: false } },
      y: { ticks: { callback: (v: number | string) => v + '%' }, min: 0 },
    },
  };

  return (
    <div style={{ maxWidth: 1100 }}>
      {/* ===== Header ===== */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 600, color: TP.navy, margin: 0 }}>AV Diagnostics</h2>
        <span style={{ fontSize: 13, color: '#888' }}>Assessment funnel health — Jan–May 2026 (Salesforce data, split at May 22 update)</span>
      </div>

      {/* ===== Stat Cards ===== */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 28 }}>
        <div style={{ background: '#F0FDF4', borderRadius: 10, padding: '14px 16px', border: '1px solid #BBF7D0' }}>
          <div style={{ fontSize: 11, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Jan completion rate</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#166534' }}>{janCompRate}%</div>
          <div style={{ fontSize: 12, color: '#15803D' }}>{num(janData.submitted)} of {num(janData.starts)} submitted</div>
          <div style={{ fontSize: 11, color: '#166534', marginTop: 2 }}>Only {janWaitPct}% stuck in waiting</div>
        </div>
        <div style={{ background: '#FFF5F5', borderRadius: 10, padding: '14px 16px', border: '1px solid #FECACA' }}>
          <div style={{ fontSize: 11, color: '#991B1B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Feb–Apr completion rate</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#991B1B' }}>58%</div>
          <div style={{ fontSize: 12, color: '#DC2626' }}>3,432 of 5,887 submitted</div>
          <div style={{ fontSize: 11, color: '#B91C1C', marginTop: 2 }}>~40% stuck in waiting (2,424)</div>
        </div>
        <div style={{ background: '#F9FAFB', borderRadius: 10, padding: '14px 16px', border: '1px solid #E5E7EB' }}>
          <div style={{ fontSize: 11, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>May pre-update</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: TP.text }}>{preCompRate}%</div>
          <div style={{ fontSize: 12, color: '#6B7280' }}>{num(preUpdate.submitted)} of {num(preUpdate.starts)} submitted</div>
          <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{preWaitPct}% waiting (May 1–22)</div>
        </div>
        <div style={{ background: '#FFFBEB', borderRadius: 10, padding: '14px 16px', border: '1px solid #FDE68A' }}>
          <div style={{ fontSize: 11, color: '#92400E', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>May post-update</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#92400E' }}>{postCompRate}%</div>
          <div style={{ fontSize: 12, color: '#92400E' }}>{num(postUpdate.submitted)} of {num(postUpdate.starts)} submitted</div>
          <div style={{ fontSize: 11, color: '#B45309', marginTop: 2 }}>{postWaitPctVal}% waiting (3 days, too early to judge)</div>
        </div>
      </div>

      {/* ===== Trend callout ===== */}
      <div style={{ background: '#FFFBEB', borderRadius: 10, padding: '14px 18px', border: '1px solid #FDE68A', marginBottom: 24 }}>
        <div style={{ fontWeight: 600, color: '#92400E', fontSize: 14, marginBottom: 4 }}>January was healthy. February broke. It hasn&apos;t recovered.</div>
        <div style={{ fontSize: 13, color: '#78350F', lineHeight: 1.6 }}>
          In January, 90% of people who started an assessment finished it and only 9% got stuck in waiting.
          Starting in February, completion dropped to ~58% and has stayed there. About 40% of every month&apos;s
          accounts since February are still sitting in &quot;Waiting — Needs info&quot; with no submission date, meaning
          they never finished. That&apos;s over 3,000 people across Feb–May. Assessment update shipped May 22 —
          post-update data ({POST_UPDATE_DAYS_ELAPSED} days) is too early to draw conclusions since recent
          accounts haven&apos;t had time to move through the pipeline.
        </div>
      </div>

      {/* ===== Chart 1: Completion rate vs waiting rate ===== */}
      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #E5E7EB', padding: 20, marginBottom: 20 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 12, fontSize: 12, color: '#6B7280' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 12, height: 3, background: TP.green, borderRadius: 1 }} /> Completion rate (submitted / starts)</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 12, height: 3, background: TP.red, borderRadius: 1, borderTop: '1px dashed ' + TP.red }} /> Waiting rate (stuck / starts)</span>
        </div>
        <div style={{ height: 280 }}>
          <Line data={rateChartData} options={rateChartOpts as any} />
        </div>
      </div>

      {/* ===== Chart 2: Stacked — submitted vs waiting vs other ===== */}
      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #E5E7EB', padding: 20, marginBottom: 20 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 12, fontSize: 12, color: '#6B7280' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 12, height: 12, borderRadius: 3, background: 'rgba(29,158,117,0.7)' }} /> Submitted</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 12, height: 12, borderRadius: 3, background: 'rgba(226,75,74,0.7)' }} /> Waiting (stuck)</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 12, height: 12, borderRadius: 3, background: 'rgba(127,119,221,0.5)' }} /> In pipeline / closed</span>
        </div>
        <div style={{ height: 280 }}>
          <Bar data={stackedData} options={stackedOpts as any} />
        </div>
      </div>

      {/* ===== Chart 2B: Full pipeline funnel ===== */}
      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #E5E7EB', padding: 20, marginBottom: 20 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 12, fontSize: 12, color: '#6B7280' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: 'rgba(29,158,117,0.8)' }} /> Checked Out</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: 'rgba(58,110,164,0.7)' }} /> Checkout Link</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: 'rgba(127,119,221,0.7)' }} /> In Review</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: 'rgba(226,75,74,0.7)' }} /> Waiting</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: 'rgba(156,163,175,0.5)' }} /> Closed</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: 'rgba(239,159,39,0.5)' }} /> On Hold</span>
        </div>
        <div style={{ height: 300 }}>
          <Bar data={funnelChartData} options={funnelChartOpts as any} />
        </div>
        <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 8 }}>
          Jan cohort is mature (130+ days) — most accounts resolved to Checked Out or Closed. Feb–Apr cohorts
          still have large Waiting blocks that likely won&apos;t convert without re-engagement. May is too early for
          Checked Out/Closed — accounts are still in Checkout or In Review.
        </div>
      </div>

      {/* ===== Chart 2C: May daily ===== */}
      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #E5E7EB', padding: 20, marginBottom: 20 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 12, fontSize: 12, color: '#6B7280' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 12, height: 12, borderRadius: 3, background: 'rgba(29,158,117,0.7)' }} /> Submitted</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 12, height: 12, borderRadius: 3, background: 'rgba(226,75,74,0.7)' }} /> Waiting</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 12, height: 3, background: TP.navy, borderRadius: 1 }} /> Total starts</span>
          <span style={{ fontSize: 11, color: '#9CA3AF' }}>(lighter bars = post-update May 23+)</span>
        </div>
        <div style={{ height: 280 }}>
          <Bar data={mayDailyChartData as any} options={mayDailyOpts as any} />
        </div>
        {/* Completion rate row below chart */}
        <div style={{ display: 'flex', marginTop: 4, paddingLeft: 38, paddingRight: 8 }}>
          {MAY_DAILY.map((d, i) => {
            const rate = Math.round(d.submitted / d.starts * 100);
            return (
              <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: 9, fontWeight: 700, fontFamily: 'monospace', color: rate >= 50 ? '#059669' : '#DC2626' }}>
                {rate}%
              </div>
            );
          })}
        </div>
        <div style={{ textAlign: 'center', fontSize: 10, color: '#9CA3AF', marginTop: 2 }}>completion rate (submitted ÷ starts)</div>
      </div>

      {/* ===== NEW SECTION: Conversion Lag ===== */}
      <h3 style={{ fontSize: 18, fontWeight: 600, color: TP.navy, margin: '32px 0 16px' }}>Conversion Lag: Created Date → Submission</h3>
      <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 16, lineHeight: 1.5 }}>
        How long between when someone creates an account and when they complete their submission.
        &quot;Same-day&quot; means they finished the same day they started. &quot;Returning&quot; means they came back
        on a different day to complete it. Data from Salesforce &quot;Tracking Conversions&quot; export (submission
        counts here differ slightly from the assessment table above, which uses the &quot;Waiting on Info Ratios&quot; export).
      </div>

      {/* Chart 4: Same-day vs Returning stacked bar */}
      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #E5E7EB', padding: 20, marginBottom: 20 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 12, fontSize: 12, color: '#6B7280' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 12, height: 12, borderRadius: 3, background: 'rgba(58,110,164,0.7)' }} /> Same-day</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 12, height: 12, borderRadius: 3, background: 'rgba(239,159,39,0.7)' }} /> Returning</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 12, height: 12, borderRadius: 3, background: 'rgba(150,150,150,0.15)', border: '1.5px solid rgba(150,150,150,0.5)' }} /> May 23–28 ({POST_UPDATE_DAYS_ELAPSED} days)</span>
        </div>
        <div style={{ height: 300 }}>
          <Bar data={lagChartData} options={lagChartOpts as any} />
        </div>
      </div>

      {/* Chart 5: Conversion rate line */}
      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #E5E7EB', padding: 20, marginBottom: 20 }}>
        <div style={{ height: 240 }}>
          <Line data={convChartData} options={convChartOpts as any} />
        </div>
      </div>

      {/* ===== Conversion lag data table ===== */}
      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #E5E7EB', padding: 20, marginBottom: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: TP.navy, marginTop: 0, marginBottom: 12 }}>Conversion lag detail</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #E5E7EB' }}>
                <th style={{ textAlign: 'left', padding: '8px 10px', color: '#6B7280', fontWeight: 600 }}>Period</th>
                <th style={{ textAlign: 'right', padding: '8px 10px', color: '#6B7280', fontWeight: 600 }}>Traffic</th>
                <th style={{ textAlign: 'right', padding: '8px 10px', color: '#6B7280', fontWeight: 600 }}>Subs</th>
                <th style={{ textAlign: 'right', padding: '8px 10px', color: '#6B7280', fontWeight: 600 }}>Conv %</th>
                <th style={{ textAlign: 'right', padding: '8px 10px', color: '#6B7280', fontWeight: 600 }}>Same-day</th>
                <th style={{ textAlign: 'right', padding: '8px 10px', color: '#6B7280', fontWeight: 600 }}>SD %</th>
                <th style={{ textAlign: 'right', padding: '8px 10px', color: '#6B7280', fontWeight: 600 }}>Returning</th>
                <th style={{ textAlign: 'right', padding: '8px 10px', color: '#6B7280', fontWeight: 600 }}>Ret %</th>
                <th style={{ textAlign: 'right', padding: '8px 10px', color: '#6B7280', fontWeight: 600 }}>Mean lag</th>
              </tr>
            </thead>
            <tbody>
              {CONVERSION_LAG.map((d, i) => {
                const t = CONV_TRAFFIC[d.label] || 0;
                const cr = t ? (d.submissions / t * 100).toFixed(1) : '--';
                const sdPct = (d.sameDay / d.submissions * 100).toFixed(1);
                const retPct = (d.returning / d.submissions * 100).toFixed(1);
                const isPost = d.label === 'May 23–28';
                const rowBg = isPost ? '#F0FDF4' : d.label === 'May 1–22' ? '#FFF5F5' : undefined;
                return (
                  <tr key={d.label} style={{ borderBottom: '1px solid #F3F4F6', background: rowBg }}>
                    <td style={{ padding: '8px 10px', fontWeight: 600, color: isPost ? '#166534' : d.label === 'May 1–22' ? '#991B1B' : TP.navy }}>
                      {d.label}{isPost ? ' *' : ''}
                    </td>
                    <td style={{ padding: '8px 10px', textAlign: 'right' }}>{t ? num(t) : '--'}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right' }}>{num(d.submissions)}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right' }}>{cr}%</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right' }}>{num(d.sameDay)}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600, color: Number(sdPct) < 75 ? TP.red : TP.text }}>{sdPct}%</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right' }}>{num(d.returning)}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600, color: Number(retPct) > 25 ? TP.amber : TP.text }}>{retPct}%</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right' }}>{d.meanLag}d</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 8 }}>* May 23–28 = {POST_UPDATE_DAYS_ELAPSED} days post-update. 8 of 128 submissions were returning (created before May 23).</div>
      </div>

      {/* ===== NEW: Lag Distribution ===== */}
      <h3 style={{ fontSize: 18, fontWeight: 600, color: TP.navy, margin: '32px 0 16px' }}>How Long People Take to Complete</h3>
      <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 16, lineHeight: 1.5 }}>
        Breakdown of time between account creation and submission completion. Each bar shows what percentage
        of that period&apos;s submissions fell into each lag bucket. A healthy assessment has most submissions
        completing same-day. The shift toward longer lags (especially 31+ days) signals people getting stuck.
      </div>

      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #E5E7EB', padding: 20, marginBottom: 20 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 12, fontSize: 11, color: '#6B7280' }}>
          {LAG_BUCKETS.map((b, i) => {
            const colors = ['#3A6EA4', '#7F77DD', '#1D9E75', '#EF9F27', '#D85A30', '#E24B4A', '#991B1B'];
            return (
              <span key={b} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: colors[i], opacity: 0.8 }} />
                {b}
              </span>
            );
          })}
        </div>
        <div style={{ height: 320 }}>
          <Bar
            data={{
              labels: LAG_DISTRIBUTION.map(d => d.label),
              datasets: LAG_BUCKETS.map((bucket, i) => {
                const colors = ['rgba(58,110,164,0.8)', 'rgba(127,119,221,0.8)', 'rgba(29,158,117,0.8)', 'rgba(239,159,39,0.8)', 'rgba(216,90,48,0.8)', 'rgba(226,75,74,0.8)', 'rgba(153,27,27,0.8)'];
                return {
                  label: bucket,
                  data: LAG_DISTRIBUTION.map(d => Math.round(d.buckets[i] / d.total * 1000) / 10),
                  backgroundColor: LAG_DISTRIBUTION.map(d => d.label === 'May 23–28' ? colors[i].replace('0.8', '0.35') : colors[i]),
                  borderRadius: i === LAG_BUCKETS.length - 1 ? 4 : 0,
                };
              }),
            }}
            options={{
              responsive: true, maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
                title: { display: true, text: 'Time to completion distribution (% of submissions)', font: { size: 14, weight: 500 as const }, color: TP.navy },
                tooltip: { callbacks: { label: (ctx: { dataset: { label: string }; parsed: { y: number } }) => ctx.dataset.label + ': ' + ctx.parsed.y + '%' } },
              },
              scales: {
                x: { stacked: true, ticks: { autoSkip: false } },
                y: { stacked: true, max: 100, ticks: { callback: (v: number | string) => v + '%' } },
              },
            } as any}
          />
        </div>
      </div>

      {/* Lag distribution detail table */}
      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #E5E7EB', padding: 20, marginBottom: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: TP.navy, marginTop: 0, marginBottom: 12 }}>Lag distribution detail</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #E5E7EB' }}>
                <th style={{ textAlign: 'left', padding: '6px 8px', color: '#6B7280', fontWeight: 600 }}>Period</th>
                <th style={{ textAlign: 'right', padding: '6px 8px', color: '#6B7280', fontWeight: 600 }}>Submitted</th>
                {LAG_BUCKETS.map(b => (
                  <th key={b} style={{ textAlign: 'right', padding: '6px 8px', color: '#6B7280', fontWeight: 600, fontSize: 11 }}>{b}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {LAG_DISTRIBUTION.map(d => {
                const isPost = d.label === 'May 23–28';
                const isPre = d.label === 'May 1–22';
                const rowBg = isPost ? '#F0FDF4' : isPre ? '#FFF5F5' : undefined;
                return (
                  <tr key={d.label} style={{ borderBottom: '1px solid #F3F4F6', background: rowBg }}>
                    <td style={{ padding: '6px 8px', fontWeight: 600, color: isPost ? '#166534' : isPre ? '#991B1B' : TP.navy }}>{d.label}</td>
                    <td style={{ padding: '6px 8px', textAlign: 'right' }}>{d.total}</td>
                    {d.buckets.map((count, i) => {
                      const p = Math.round(count / d.total * 1000) / 10;
                      const isHigh31 = i === 6 && p > 5;
                      return (
                        <td key={i} style={{ padding: '6px 8px', textAlign: 'right', fontWeight: isHigh31 ? 600 : 400, color: isHigh31 ? TP.red : TP.text }}>
                          {count} <span style={{ color: '#9CA3AF', fontSize: 11 }}>({p}%)</span>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 8 }}>
          Same-day completion dropped from 91% (Jan) to 67% (May pre-update). The 31+ day bucket grew from 3% to 7–10%.
          Post-update data is {POST_UPDATE_DAYS_ELAPSED} days — track weekly for trend.
        </div>
      </div>

      {/* ===== NEW: Cohort Completion Curves ===== */}
      <h3 style={{ fontSize: 18, fontWeight: 600, color: TP.navy, margin: '32px 0 16px' }}>Cohort Completion Speed</h3>
      <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 16, lineHeight: 1.5 }}>
        For people who created accounts during each week, what percentage had completed their submission
        by day 0 (same day), day 1, day 3, and day 7. Faster curves = the assessment is easier to finish
        in one sitting. The May 22–28 cohort (post-update) shows the fastest completion so far.
      </div>

      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #E5E7EB', padding: 20, marginBottom: 20 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 12, fontSize: 12, color: '#6B7280' }}>
          {COHORT_DATA.map((c, i) => {
            const colors = [TP.skyBlue, TP.purple, TP.amber, TP.green];
            const isPost = c.label === 'May 22–28';
            return (
              <span key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontWeight: isPost ? 700 : 400 }}>
                <span style={{ width: 12, height: 3, background: colors[i], borderRadius: 1 }} />
                {c.label} ({c.n} submitted){isPost ? ' — post-update' : ''}
              </span>
            );
          })}
        </div>
        <div style={{ height: 300 }}>
          <Line
            data={{
              labels: ['Same day', 'Within 1 day', 'Within 3 days', 'Within 7 days'],
              datasets: COHORT_DATA.map((c, i) => {
                const colors = [TP.skyBlue, TP.purple, TP.amber, TP.green];
                const isPost = c.label === 'May 22–28';
                return {
                  label: c.label,
                  data: [c.sameDay, c.within1d, c.within3d, c.within7d],
                  borderColor: colors[i],
                  backgroundColor: colors[i],
                  borderWidth: isPost ? 3.5 : 2,
                  pointRadius: isPost ? 7 : 5,
                  pointBackgroundColor: colors[i],
                  tension: 0.3,
                  borderDash: isPost ? [] : [6, 3],
                };
              }),
            }}
            options={{
              responsive: true, maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
                title: { display: true, text: 'Weekly cohort completion curves (% completed by timeframe)', font: { size: 14, weight: 500 as const }, color: TP.navy },
                tooltip: { callbacks: { label: (ctx: { dataset: { label: string }; parsed: { y: number } }) => ctx.dataset.label + ': ' + ctx.parsed.y + '%' } },
              },
              scales: {
                y: { min: 60, max: 102, ticks: { callback: (v: number | string) => v + '%' } },
              },
            } as any}
          />
        </div>
      </div>

      {/* ===== NEW: Daily Cohorts Around Update ===== */}
      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #E5E7EB', padding: 20, marginBottom: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: TP.navy, marginTop: 0, marginBottom: 4 }}>Daily cohorts around update (May 19–26)</h3>
        <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 12 }}>
          Day-by-day view of how quickly each day&apos;s new accounts completed. May 22 = update day, May 23 = first full post-update day.
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #E5E7EB' }}>
                <th style={{ textAlign: 'left', padding: '8px 10px', color: '#6B7280', fontWeight: 600 }}>Created</th>
                <th style={{ textAlign: 'right', padding: '8px 10px', color: '#6B7280', fontWeight: 600 }}>Started</th>
                <th style={{ textAlign: 'right', padding: '8px 10px', color: '#6B7280', fontWeight: 600 }}>Same day</th>
                <th style={{ textAlign: 'right', padding: '8px 10px', color: '#6B7280', fontWeight: 600 }}>SD %</th>
                <th style={{ textAlign: 'right', padding: '8px 10px', color: '#6B7280', fontWeight: 600 }}>+1 day</th>
                <th style={{ textAlign: 'right', padding: '8px 10px', color: '#6B7280', fontWeight: 600 }}>+2–3 days</th>
                <th style={{ textAlign: 'right', padding: '8px 10px', color: '#6B7280', fontWeight: 600 }}>+4–7 days</th>
                <th style={{ textAlign: 'right', padding: '8px 10px', color: '#6B7280', fontWeight: 600 }}>Completed</th>
                <th style={{ textAlign: 'right', padding: '8px 10px', color: '#6B7280', fontWeight: 600 }}>Waiting</th>
              </tr>
            </thead>
            <tbody>
              {DAILY_COHORTS.map(d => {
                const isPost = parseInt(d.day.replace('May ', '')) >= 23;
                const isUpdate = d.day === 'May 22';
                const completed = d.sameDay + d.d1 + d.d2_3 + d.d4_7;
                const waiting = d.n - completed;
                const compPctVal = Math.round(completed / d.n * 100);
                const sdPctVal = Math.round(d.sameDay / d.n * 100);
                const rowBg = isPost ? '#F0FDF4' : isUpdate ? '#FFFBEB' : undefined;
                const labelColor = isPost ? '#166534' : isUpdate ? '#92400E' : TP.navy;
                return (
                  <tr key={d.day} style={{ borderBottom: '1px solid #F3F4F6', background: rowBg }}>
                    <td style={{ padding: '8px 10px', fontWeight: 600, color: labelColor }}>
                      {d.day}{isUpdate ? ' (update)' : ''}{isPost && !isUpdate ? ' (post)' : ''}
                    </td>
                    <td style={{ padding: '8px 10px', textAlign: 'right' }}>{d.n}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right' }}>{d.sameDay}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600, color: sdPctVal >= 50 ? TP.green : sdPctVal < 30 ? TP.red : TP.text }}>
                      {sdPctVal}%
                    </td>
                    <td style={{ padding: '8px 10px', textAlign: 'right' }}>{d.d1}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right' }}>{d.d2_3}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right' }}>{d.d4_7}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600 }}>{completed} ({compPctVal}%)</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', color: TP.red }}>{waiting}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 8 }}>
          n = total account creations that day. SD% = same-day submissions ÷ starts. Waiting = started but never submitted.
          Pre-update days carry more waiting because those cohorts are older and anyone who hasn&apos;t submitted by now likely won&apos;t.
        </div>
      </div>

      {/* ===== Post-Update Impact ===== */}
      {(() => {
        const preDays = MAY_DAILY.filter(d => d.day >= 15 && d.day <= 21);
        const postDays = MAY_DAILY.filter(d => d.day >= 23);
        const preAvgComp = Math.round(preDays.reduce((s, d) => s + d.submitted / d.starts * 100, 0) / preDays.length);
        const postAvgComp = Math.round(postDays.reduce((s, d) => s + d.submitted / d.starts * 100, 0) / postDays.length);
        const preTotalStarts = preDays.reduce((s, d) => s + d.starts, 0);
        const preTotalSub = preDays.reduce((s, d) => s + d.submitted, 0);
        const postTotalStarts = postDays.reduce((s, d) => s + d.starts, 0);
        const postTotalSub = postDays.reduce((s, d) => s + d.submitted, 0);
        const preOverall = Math.round(preTotalSub / preTotalStarts * 100);
        const postOverall = Math.round(postTotalSub / postTotalStarts * 100);
        const diff = postOverall - preOverall;
        return (
          <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #E5E7EB', padding: 20, marginBottom: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: TP.navy, marginTop: 0, marginBottom: 4 }}>Post-update impact: completion rate</h3>
            <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 16 }}>
              Completion = submitted ÷ starts for each day. Compares the week before the update (May 15–21) to post-update days (May 23+).
              Post-update cohorts are newer, so some &quot;waiting&quot; people may still complete.
            </div>

            {/* KPI cards */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 140, background: '#FFF5F5', borderRadius: 8, padding: '12px 16px' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#991B1B', textTransform: 'uppercase', letterSpacing: 0.5 }}>Pre-update (May 15–21)</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#991B1B' }}>{preOverall}%</div>
                <div style={{ fontSize: 12, color: '#6B7280' }}>{preTotalSub} of {preTotalStarts} completed</div>
              </div>
              <div style={{ flex: 1, minWidth: 140, background: '#F0FDF4', borderRadius: 8, padding: '12px 16px' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#166534', textTransform: 'uppercase', letterSpacing: 0.5 }}>Post-update (May 23–28)</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#166534' }}>{postOverall}%</div>
                <div style={{ fontSize: 12, color: '#6B7280' }}>{postTotalSub} of {postTotalStarts} completed</div>
              </div>
              <div style={{ flex: 1, minWidth: 140, background: diff > 0 ? '#F0FDF4' : diff < 0 ? '#FFF5F5' : '#F9FAFB', borderRadius: 8, padding: '12px 16px' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>Change</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: diff > 0 ? TP.green : diff < 0 ? TP.red : TP.text }}>{diff > 0 ? '+' : ''}{diff}pp</div>
                <div style={{ fontSize: 12, color: '#6B7280' }}>percentage points</div>
              </div>
            </div>

            {/* Daily completion rate table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #E5E7EB' }}>
                    <th style={{ textAlign: 'left', padding: '8px 10px', color: '#6B7280', fontWeight: 600 }}>Day</th>
                    <th style={{ textAlign: 'right', padding: '8px 10px', color: '#6B7280', fontWeight: 600 }}>Starts</th>
                    <th style={{ textAlign: 'right', padding: '8px 10px', color: '#6B7280', fontWeight: 600 }}>Submitted</th>
                    <th style={{ textAlign: 'right', padding: '8px 10px', color: '#6B7280', fontWeight: 600 }}>Comp %</th>
                    <th style={{ textAlign: 'right', padding: '8px 10px', color: '#6B7280', fontWeight: 600 }}>Waiting</th>
                    <th style={{ textAlign: 'right', padding: '8px 10px', color: '#6B7280', fontWeight: 600 }}>Days old</th>
                  </tr>
                </thead>
                <tbody>
                  {MAY_DAILY.filter(d => d.day >= 15).map(d => {
                    const comp = Math.round(d.submitted / d.starts * 100);
                    const isPost = d.day >= 23;
                    const isUpdate = d.day === 22;
                    const daysOld = 28 - d.day;
                    const rowBg = isPost ? '#F0FDF4' : isUpdate ? '#FFFBEB' : undefined;
                    const labelColor = isPost ? '#166534' : isUpdate ? '#92400E' : TP.navy;
                    return (
                      <tr key={d.day} style={{ borderBottom: '1px solid #F3F4F6', background: rowBg }}>
                        <td style={{ padding: '8px 10px', fontWeight: 600, color: labelColor }}>
                          May {d.day}{isUpdate ? ' (update)' : ''}{isPost ? ' (post)' : ''}
                        </td>
                        <td style={{ padding: '8px 10px', textAlign: 'right' }}>{d.starts}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600, color: TP.green }}>{d.submitted}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600, color: comp >= 60 ? TP.green : comp < 40 ? TP.red : TP.text }}>{comp}%</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', color: TP.red }}>{d.waiting}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', color: '#6B7280' }}>{daysOld}d</td>
                      </tr>
                    );
                  })}
                  {/* Pre-update subtotal */}
                  <tr style={{ borderTop: '2px solid #E5E7EB', fontWeight: 700 }}>
                    <td style={{ padding: '8px 10px', color: '#991B1B' }}>Pre avg (May 15–21)</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right' }}>{preTotalStarts}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', color: TP.green }}>{preTotalSub}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', color: TP.red }}>{preOverall}%</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', color: TP.red }}>{preTotalStarts - preTotalSub}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', color: '#6B7280' }}>6–12d</td>
                  </tr>
                  <tr style={{ fontWeight: 700 }}>
                    <td style={{ padding: '8px 10px', color: '#166534' }}>Post avg (May 23–27)</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right' }}>{postTotalStarts}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', color: TP.green }}>{postTotalSub}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', color: postOverall >= preOverall ? TP.green : TP.red }}>{postOverall}%</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', color: TP.red }}>{postTotalStarts - postTotalSub}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', color: '#6B7280' }}>0–4d</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 8 }}>
              &quot;Days old&quot; = how many days since that cohort was created. Newer cohorts have lower completion rates because people haven&apos;t
              had time to come back. Pre-update cohorts (6–12 days old) are near-final. Post-update cohorts (0–4 days old) will climb.
            </div>
          </div>
        );
      })()}

      {/* ===== Assessment data table ===== */}
      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #E5E7EB', padding: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: TP.navy, marginTop: 0, marginBottom: 12 }}>Assessment data (Salesforce)</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #E5E7EB' }}>
                <th style={{ textAlign: 'left', padding: '8px 10px', color: '#6B7280', fontWeight: 600 }}>Period</th>
                <th style={{ textAlign: 'right', padding: '8px 10px', color: '#6B7280', fontWeight: 600 }}>Starts</th>
                <th style={{ textAlign: 'right', padding: '8px 10px', color: '#6B7280', fontWeight: 600 }}>Submitted</th>
                <th style={{ textAlign: 'right', padding: '8px 10px', color: '#6B7280', fontWeight: 600 }}>Comp %</th>
                <th style={{ textAlign: 'right', padding: '8px 10px', color: '#6B7280', fontWeight: 600 }}>Waiting</th>
                <th style={{ textAlign: 'right', padding: '8px 10px', color: '#6B7280', fontWeight: 600 }}>Wait %</th>
                <th style={{ textAlign: 'right', padding: '8px 10px', color: '#6B7280', fontWeight: 600 }}>Other</th>
              </tr>
            </thead>
            <tbody>
              {AV_DATA.map((d, i) => {
                const wp = waitPcts[i];
                const cr = completionRates[i];
                const other = d.starts - d.submitted - d.waiting;
                const isPost = d.period === 'post-update';
                const isPre = d.period === 'pre-update';
                const rowBg = isPost ? '#FFFBEB' : isPre ? '#FFF5F5' : undefined;
                return (
                  <tr key={d.label} style={{ borderBottom: '1px solid #F3F4F6', background: rowBg }}>
                    <td style={{ padding: '8px 10px', fontWeight: 600, color: isPost ? '#92400E' : isPre ? '#991B1B' : TP.navy }}>
                      {d.label}{d.partial ? ' *' : ''}
                    </td>
                    <td style={{ padding: '8px 10px', textAlign: 'right' }}>{num(d.starts)}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600, color: TP.green }}>{num(d.submitted)}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600, color: cr >= 80 ? TP.green : cr < 60 ? TP.red : TP.text }}>{cr}%</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', color: TP.red }}>{num(d.waiting)}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600, color: wp > 30 ? TP.red : TP.text }}>{wp}%</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', color: '#6B7280' }}>{num(other)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 8 }}>
          Source: Salesforce &quot;Waiting on Info Ratios&quot; export, May 28 2026. &quot;Starts&quot; = Person Account creations.
          &quot;Submitted&quot; = have a Submission Date. &quot;Waiting&quot; = current stage is WAITING (never finished).
          &quot;Other&quot; = in pipeline, closed, denied, or on hold.
          * May 23–28 is {POST_UPDATE_DAYS_ELAPSED} days post-update — recent accounts haven&apos;t had time to mature.
        </div>
      </div>

      {/* ── Cohort Aging Comparison ── */}
      <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginTop: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: TP.navy, margin: '0 0 4px' }}>
          Cohort aging comparison — did the photo upload change work?
        </h3>
        <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 16px', lineHeight: 1.5 }}>
          Each row tracks everyone who started in that week. The stacked bar shows where they ended up:
          completed (green), still waiting (red), or other (gray). These add up to 100%.
          Within &quot;completed,&quot; the shade shows speed — dark green finished within 7 days, lighter shades took longer.
          A cohort is <strong>mature</strong> when every person in it has had enough time to reach that window.
        </p>

        {/* Stacked bar rows */}
        <div style={{ display: 'grid', gap: 16, marginBottom: 20 }}>
          {COHORT_AGING.map((c) => {
            const completed = c.within7d + c.d8to14 + c.d15plus;
            const other = c.starts - completed - c.waiting;
            const pct7 = c.starts > 0 ? c.within7d / c.starts * 100 : 0;
            const pct814 = c.starts > 0 ? c.d8to14 / c.starts * 100 : 0;
            const pct15 = c.starts > 0 ? c.d15plus / c.starts * 100 : 0;
            const pctWait = c.starts > 0 ? c.waiting / c.starts * 100 : 0;
            const pctOther = c.starts > 0 ? other / c.starts * 100 : 0;
            const compPct = c.starts > 0 ? completed / c.starts * 100 : 0;
            const borderColor = c.postUpdate ? TP.green : TP.blue;
            const bgColor = c.postUpdate ? '#F0FDF4' : '#F8FAFC';
            return (
              <div key={c.label} style={{ background: bgColor, border: `1.5px solid ${borderColor}`, borderRadius: 8, padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 700, color: TP.navy, fontSize: 14 }}>{c.label}</span>
                    {c.postUpdate && <span style={{ fontSize: 11, background: TP.green, color: 'white', padding: '2px 8px', borderRadius: 10, fontWeight: 600 }}>POST-UPDATE</span>}
                    {!c.mature7d && <span style={{ fontSize: 10, color: TP.amber, fontWeight: 600 }}>STILL AGING</span>}
                  </div>
                  <span style={{ fontSize: 12, color: '#6B7280' }}>{c.starts} started · {c.daysElapsed} days old</span>
                </div>

                {/* Stacked bar */}
                <div style={{ display: 'flex', height: 28, borderRadius: 6, overflow: 'hidden', marginBottom: 8 }}>
                  {pct7 > 0 && <div style={{ width: `${pct7}%`, background: '#1D9E75', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 11, fontWeight: 700, minWidth: pct7 > 8 ? 0 : 'auto' }}>{pct7 > 8 ? `${Math.round(pct7)}%` : ''}</div>}
                  {pct814 > 0 && <div style={{ width: `${pct814}%`, background: '#34D399', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 11, fontWeight: 700 }} />}
                  {pct15 > 0 && <div style={{ width: `${pct15}%`, background: '#A7F3D0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#065F46', fontSize: 11, fontWeight: 700 }} />}
                  {pctWait > 0 && <div style={{ width: `${pctWait}%`, background: '#E24B4A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 11, fontWeight: 700, minWidth: pctWait > 8 ? 0 : 'auto' }}>{pctWait > 8 ? `${Math.round(pctWait)}%` : ''}</div>}
                  {pctOther > 0 && <div style={{ width: `${Math.max(pctOther, 1)}%`, background: '#D1D5DB' }} />}
                </div>

                {/* Breakdown numbers */}
                <div style={{ display: 'flex', gap: 16, fontSize: 12, flexWrap: 'wrap' }}>
                  <span style={{ color: '#065F46' }}>
                    <strong style={{ color: '#1D9E75' }}>Completed: {completed}</strong> ({compPct.toFixed(1)}%)
                    {completed > 0 && <span style={{ color: '#6B7280', marginLeft: 4 }}>
                      — {c.within7d} within 7d{c.d8to14 > 0 ? `, ${c.d8to14} days 8–14` : ''}{c.d15plus > 0 ? `, ${c.d15plus} after 14d` : ''}
                    </span>}
                  </span>
                  <span style={{ color: TP.red }}>
                    <strong>Waiting: {c.waiting}</strong> ({pctWait.toFixed(1)}%)
                  </span>
                  {other > 0 && <span style={{ color: '#6B7280' }}>
                    <strong>Other: {other}</strong> ({pctOther.toFixed(1)}%)
                  </span>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: 16, fontSize: 11, color: '#6B7280', marginBottom: 16, flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 12, height: 12, borderRadius: 2, background: '#1D9E75' }} /> Completed within 7 days</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 12, height: 12, borderRadius: 2, background: '#34D399' }} /> Completed days 8–14</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 12, height: 12, borderRadius: 2, background: '#E24B4A' }} /> Still waiting</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 12, height: 12, borderRadius: 2, background: '#D1D5DB' }} /> Other (closed, denied, etc.)</span>
        </div>

        {/* Maturity timeline */}
        <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 8, padding: 14, fontSize: 12, color: '#92400E', lineHeight: 1.6 }}>
          <strong>When can you compare?</strong> The May 22–28 cohort will be comparable on <strong>June 4</strong> (7-day window mature) and <strong>June 11</strong> (14-day window mature).
          Right now the post-update green bar is still growing — some of the red &quot;waiting&quot; people may still complete.
          The key question: will the post-update cohort&apos;s green bar end up larger than May 1–7&apos;s 52.6%?
          If yes and the red bar is smaller, the simplified photo upload is converting more people.
        </div>

        <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 10 }}>
          Source: Salesforce export May 28 2026 07:39 PST. Waiting rate is a point-in-time snapshot — it will
          decrease as some accounts eventually complete or are closed out.
        </div>
      </div>
    </div>
  );
}
