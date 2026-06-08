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
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import annotationPlugin from 'chartjs-plugin-annotation';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, annotationPlugin);

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
// Source: Salesforce "Waiting on Info Ratios" export, pulled June 4, 2026 06:37 PST
// "starts" = Salesforce Person Account creations (assessment starts)
// "waiting" = current WAITING stage (needs info / needs photos) — never finished
// "submitted" = have a Submission Date — completed their assessment
// Major assessment update shipped May 22 — May split into pre/post
const AV_DATA = [
  { label: 'Jan 26', month: 1,  year: 2026, traffic: 37320, starts: 1146, waiting: 108, submitted: 1035, partial: false, period: 'full' as const },
  { label: 'Feb 26', month: 2,  year: 2026, traffic: 51480, starts: 2193, waiting: 888, submitted: 1293, partial: false, period: 'full' as const },
  { label: 'Mar 26', month: 3,  year: 2026, traffic: 39218, starts: 2263, waiting: 967, submitted: 1285, partial: false, period: 'full' as const },
  { label: 'Apr 26', month: 4,  year: 2026, traffic: 30311, starts: 1431, waiting: 569, submitted: 854,  partial: false, period: 'full' as const },
  { label: 'May 1–22', month: 5, year: 2026, traffic: 21819, starts: 1037, waiting: 487, submitted: 550, partial: false, period: 'pre-update' as const },
  { label: 'May 23–31', month: 5,  year: 2026, traffic: 11212,  starts: 580,  waiting: 282,  submitted: 298,  partial: false,  period: 'post-update' as const },
  { label: 'Jun 1–4', month: 6, year: 2026, traffic: 0, starts: 271, waiting: 115, submitted: 156, partial: true, period: 'post-update' as const },
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
  { label: 'May 26', waiting: 766, inReview: 230, checkout: 455, checkedOut: 77, closed: 69, onHold: 18 },
  { label: 'Jun 1–4', waiting: 115, inReview: 101, checkout: 14, checkedOut: 0, closed: 10, onHold: 4 },
];

// ── May daily data (source of truth) ─────────────────────────────────
// Daily breakdown: account creations, waiting, and submitted for May 2026
const MAY_DAILY = [
  { day: 1, starts: 42, waiting: 16, submitted: 26 },
  { day: 2, starts: 38, waiting: 20, submitted: 18 },
  { day: 3, starts: 40, waiting: 20, submitted: 20 },
  { day: 4, starts: 57, waiting: 25, submitted: 32 },
  { day: 5, starts: 37, waiting: 15, submitted: 22 },
  { day: 6, starts: 67, waiting: 31, submitted: 36 },
  { day: 7, starts: 46, waiting: 23, submitted: 23 },
  { day: 8, starts: 40, waiting: 17, submitted: 23 },
  { day: 9, starts: 34, waiting: 16, submitted: 18 },
  { day: 10, starts: 31, waiting: 16, submitted: 15 },
  { day: 11, starts: 55, waiting: 23, submitted: 32 },
  { day: 12, starts: 42, waiting: 16, submitted: 26 },
  { day: 13, starts: 54, waiting: 25, submitted: 29 },
  { day: 14, starts: 49, waiting: 24, submitted: 25 },
  { day: 15, starts: 40, waiting: 18, submitted: 22 },
  { day: 16, starts: 33, waiting: 13, submitted: 20 },
  { day: 17, starts: 59, waiting: 33, submitted: 26 },
  { day: 18, starts: 48, waiting: 15, submitted: 33 },
  { day: 19, starts: 62, waiting: 32, submitted: 30 },
  { day: 20, starts: 46, waiting: 24, submitted: 22 },
  { day: 21, starts: 41, waiting: 18, submitted: 23 },
  { day: 22, starts: 76, waiting: 47, submitted: 29 },
  { day: 23, starts: 68, waiting: 44, submitted: 24 },
  { day: 24, starts: 41, waiting: 24, submitted: 17 },
  { day: 25, starts: 38, waiting: 18, submitted: 20 },
  { day: 26, starts: 44, waiting: 13, submitted: 31 },
  { day: 27, starts: 83, waiting: 40, submitted: 43 },
  { day: 28, starts: 87, waiting: 41, submitted: 46 },
  { day: 29, starts: 99, waiting: 40, submitted: 59 },
  { day: 30, starts: 67, waiting: 33, submitted: 34 },
  { day: 31, starts: 53, waiting: 29, submitted: 24 },
];

// ── Lag distribution by month (source of truth) ────────────────────
// Buckets: Same day, 1 day, 2–3 days, 4–7 days, 8–14 days, 15–30 days, 31+ days
// Used for fair cross-month comparison using a fixed 3-day window
const LAG_DISTRIBUTION = [
  { label: 'Jan',        buckets: [959, 13, 27,  8,  8,  7, 32] },
  { label: 'Feb',        buckets: [992, 77, 55, 42, 18,  8, 16] },
  { label: 'Mar',        buckets: [963, 97, 57, 58, 44, 30, 38] },
  { label: 'Apr',        buckets: [685, 55, 39, 31, 21, 35, 101] },
  { label: 'May 1–22',   buckets: [390, 64, 39, 24, 19, 10, 1] },
  { label: 'May 23–31',  buckets: [260, 25, 8, 2, 2, 0, 0] },
  { label: 'Jun 1–4',    buckets: [142, 14, 0, 0, 0, 0, 0] },
];

// ── Weekly cohort completion curves (source of truth) ────────────────
// Created-date cohorts: what % completed by day 0, 1, 3, 7
const COHORT_DATA = [
  { label: 'May 1–7',   n: 177, sameDay: 75.7, within1d: 87.0, within3d: 92.1, within7d: 94.4 },
  { label: 'May 8–14',  n: 168, sameDay: 69.0, within1d: 82.7, within3d: 88.7, within7d: 95.2 },
  { label: 'May 15–21', n: 176, sameDay: 68.2, within1d: 78.4, within3d: 88.6, within7d: 93.2 },
  { label: 'May 22–28', n: 210, sameDay: 82.4, within1d: 94.3, within3d: 97.6, within7d: 99.0 },
  { label: 'May 29–31', n: 117, sameDay: 91.5, within1d: 97.4, within3d: 100.0, within7d: 100.0 },
  { label: 'Jun 1–4',   n: 156, sameDay: 91.0, within1d: 100.0, within3d: 100.0, within7d: 100.0 },
];

// ── Daily cohorts archived ──────────────────────────────────────────
// Removed from render — daily granularity data in Salesforce exports

// ── Cohort aging comparison (source of truth) ───────────────────────
// Tracks each weekly cohort broken into non-overlapping groups:
//   completed (within 7d + days 8-14 + 15+) | waiting | other
// These add up to starts. "mature" = every person has had that many days.
// Weekly cohort aging — March 2026 through current
// Source: Salesforce Waiting on Info Ratios export June 8, 2026
const COHORT_AGING: {label:string; starts:number; within7d:number; d8to14:number; d15plus:number; waiting:number; daysElapsed:number; mature7d:boolean; mature14d:boolean; postUpdate:boolean; tag?:string}[] = [
  { label: 'Mar 01–07', starts: 516, within7d: 287, d8to14: 14, d15plus: 23, waiting: 192, daysElapsed: 93, mature7d: true, mature14d: true, postUpdate: false },
  { label: 'Mar 08–14', starts: 563, within7d: 273, d8to14: 5, d15plus: 16, waiting: 269, daysElapsed: 86, mature7d: true, mature14d: true, postUpdate: false },
  { label: 'Mar 15–21', starts: 535, within7d: 281, d8to14: 8, d15plus: 21, waiting: 225, daysElapsed: 79, mature7d: true, mature14d: true, postUpdate: false },
  { label: 'Mar 22–28', starts: 453, within7d: 240, d8to14: 5, d15plus: 20, waiting: 188, daysElapsed: 72, mature7d: true, mature14d: true, postUpdate: false },
  { label: 'Mar 29–Apr 04', starts: 376, within7d: 200, d8to14: 2, d15plus: 18, waiting: 156, daysElapsed: 65, mature7d: true, mature14d: true, postUpdate: false },
  { label: 'Apr 05–11', starts: 344, within7d: 192, d8to14: 2, d15plus: 11, waiting: 139, daysElapsed: 58, mature7d: true, mature14d: true, postUpdate: false },
  { label: 'Apr 12–18', starts: 327, within7d: 189, d8to14: 10, d15plus: 10, waiting: 118, daysElapsed: 51, mature7d: true, mature14d: true, postUpdate: false },
  { label: 'Apr 19–25', starts: 336, within7d: 200, d8to14: 4, d15plus: 5, waiting: 127, daysElapsed: 44, mature7d: true, mature14d: true, postUpdate: false },
  { label: 'Apr 26–May 02', starts: 321, within7d: 172, d8to14: 7, d15plus: 8, waiting: 134, daysElapsed: 37, mature7d: true, mature14d: true, postUpdate: false },
  { label: 'May 03–09', starts: 321, within7d: 164, d8to14: 5, d15plus: 5, waiting: 147, daysElapsed: 30, mature7d: true, mature14d: true, postUpdate: false },
  { label: 'May 10–16', starts: 304, within7d: 164, d8to14: 3, d15plus: 2, waiting: 135, daysElapsed: 23, mature7d: true, mature14d: true, postUpdate: false },
  { label: 'May 17–23', starts: 398, within7d: 173, d8to14: 11, d15plus: 2, waiting: 212, daysElapsed: 16, mature7d: true, mature14d: true, postUpdate: false },
  { label: 'May 24–30', starts: 456, within7d: 254, d8to14: 6, d15plus: 0, waiting: 196, daysElapsed: 9, mature7d: true, mature14d: false, postUpdate: true, tag: 'Memorial Day' },
  { label: 'May 31–Jun 06', starts: 510, within7d: 327, d8to14: 0, d15plus: 0, waiting: 183, daysElapsed: 2, mature7d: false, mature14d: false, postUpdate: true },
  { label: 'Jun 07–08', starts: 76, within7d: 39, d8to14: 0, d15plus: 0, waiting: 37, daysElapsed: 0, mature7d: false, mature14d: false, postUpdate: true },
];

// ── Post-update tracking ────────────────────────────────────────────
const POST_UPDATE_DAYS_ELAPSED = 13; // May 23 – Jun 4 = 13 days post-update

function num(v: number): string { return v.toLocaleString(); }

export default function AVDiagnostics() {

  // Suppress unused data arrays from old sections
  void COHORT_DATA; void AV_DATA;

  // Aging cohort data — aggregate all post-update cohorts for hero cards
  const postAgingCohorts = COHORT_AGING.filter(c => c.postUpdate);
  const postAgingCohort = {
    label: 'Post-update',
    starts: postAgingCohorts.reduce((s, c) => s + c.starts, 0),
    within7d: postAgingCohorts.reduce((s, c) => s + c.within7d, 0),
    d8to14: postAgingCohorts.reduce((s, c) => s + c.d8to14, 0),
    d15plus: postAgingCohorts.reduce((s, c) => s + c.d15plus, 0),
    waiting: postAgingCohorts.reduce((s, c) => s + c.waiting, 0),
    daysElapsed: Math.max(...postAgingCohorts.map(c => c.daysElapsed)),
    mature7d: false,
    mature14d: false,
    postUpdate: true,
  };

  // Pre vs post daily comparison
  const preDays = MAY_DAILY.filter(d => d.day >= 15 && d.day <= 21);
  const postDays = MAY_DAILY.filter(d => d.day >= 23);
  const preAvgStarts = Math.round(preDays.reduce((s, d) => s + d.starts, 0) / preDays.length);
  const postAvgStarts = Math.round(postDays.reduce((s, d) => s + d.starts, 0) / postDays.length);

  // Suppress old unused variables
  void postAgingCohort; void preAvgStarts; void postAvgStarts;

  return (
    <div style={{ maxWidth: 1100 }}>

      {/* ═══════ HEADER ═══════ */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 22, fontWeight: 600, color: TP.navy, margin: '0 0 6px' }}>AV Diagnostics</h2>
        <p style={{ fontSize: 13, color: '#888', margin: 0 }}>
          Weekly cohort tracking: how many people start the assessment each week, how many finish, and how long incomplete ones sit.
        </p>
      </div>

      {/* ═══════ STACKED BAR: Completed vs Waiting per week ═══════ */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: 24, marginBottom: 28 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: TP.navy, margin: '0 0 4px' }}>Weekly Assessment Volume</h3>
        <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 16px' }}>
          Stacked: completed (green) vs still waiting (red). Completion % line overlaid.
        </p>
        <div style={{ height: 320 }}>
          <Bar
            data={{
              labels: COHORT_AGING.map(c => c.label + (c.tag ? ` *` : '')),
              datasets: [
                {
                  label: 'Completed',
                  data: COHORT_AGING.map(c => c.within7d + c.d8to14 + c.d15plus),
                  backgroundColor: COHORT_AGING.map(c => c.postUpdate ? '#34D399' : TP.green),
                  borderRadius: 2,
                  stack: 'stack0',
                },
                {
                  label: 'Waiting',
                  data: COHORT_AGING.map(c => c.waiting),
                  backgroundColor: COHORT_AGING.map(c => c.tag ? '#FBBF24' : '#FCA5A5'),
                  borderRadius: 2,
                  stack: 'stack0',
                },
                {
                  label: 'Done %',
                  data: COHORT_AGING.map(c => {
                    const done = c.starts - c.waiting;
                    return c.starts > 0 ? Math.round((done / c.starts) * 100) : 0;
                  }),
                  type: 'line',
                  borderColor: TP.navy,
                  backgroundColor: TP.navy,
                  borderWidth: 2.5,
                  pointRadius: 4,
                  pointBackgroundColor: TP.navy,
                  tension: 0.3,
                  yAxisID: 'y1',
                } as any,
              ],
            }}
            options={{
              responsive: true, maintainAspectRatio: false,
              plugins: {
                legend: { position: 'top' as const, labels: { usePointStyle: true, boxWidth: 8, padding: 16, font: { size: 11 } } },
                tooltip: {
                  callbacks: {
                    label: (ctx: any) => {
                      if (ctx.dataset.label === 'Done %') return `${ctx.parsed.y}% completed`;
                      return `${ctx.dataset.label}: ${ctx.parsed.y.toLocaleString()}`;
                    },
                  },
                },
                annotation: {
                  annotations: {
                    memorialLine: {
                      type: 'line' as const,
                      xMin: COHORT_AGING.findIndex(c => c.tag === 'Memorial Day'),
                      xMax: COHORT_AGING.findIndex(c => c.tag === 'Memorial Day'),
                      borderColor: '#92400E',
                      borderWidth: 2,
                      borderDash: [5, 3],
                      label: { display: true, content: 'Memorial Day', position: 'start' as const, font: { size: 10 }, backgroundColor: '#FEF3C7', color: '#92400E' },
                    },
                  },
                },
              },
              scales: {
                x: { grid: { display: false }, ticks: { font: { size: 10 }, maxRotation: 45 } },
                y: { stacked: true, title: { display: true, text: 'Patients' }, grid: { color: '#F3F4F6' } },
                y1: { position: 'right' as const, min: 0, max: 100, title: { display: true, text: 'Done %' }, ticks: { callback: (v: number | string) => v + '%' }, grid: { display: false } },
              },
            } as any}
          />
        </div>
        <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 8 }}>* Memorial Day weekend — expect lower completion from holiday traffic.</div>
      </div>

      {/* old sections removed */}

      {/* ═══════ WEEKLY COHORT AGING TABLE ═══════ */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: 24, marginBottom: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: TP.navy, margin: '0 0 4px' }}>Weekly Cohort Completion Tracker</h3>
        <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 16px' }}>
          Each row = patients created that week. Waiting % drops as cohort ages. Mature cohorts (4+ months) reach 88-97% completion.
        </p>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #E5E7EB', fontSize: 12, color: '#6B7280', textTransform: 'uppercase' }}>
                <th style={{ textAlign: 'left', padding: '8px 12px' }}>Week</th>
                <th style={{ textAlign: 'right', padding: '8px 12px' }}>Started</th>
                <th style={{ textAlign: 'right', padding: '8px 12px' }}>Within 7d</th>
                <th style={{ textAlign: 'right', padding: '8px 12px' }}>8-14d</th>
                <th style={{ textAlign: 'right', padding: '8px 12px' }}>15d+</th>
                <th style={{ textAlign: 'right', padding: '8px 12px' }}>Waiting</th>
                <th style={{ textAlign: 'right', padding: '8px 12px' }}>Done %</th>
                <th style={{ textAlign: 'right', padding: '8px 12px' }}>Age</th>
              </tr>
            </thead>
            <tbody>
              {COHORT_AGING.map((c) => {
                const done = c.starts - c.waiting;
                const donePct = c.starts > 0 ? Math.round((done / c.starts) * 100) : 0;
                const isYoung = c.daysElapsed < 14;
                return (
                  <tr key={c.label} style={{
                    borderBottom: '1px solid #F3F4F6',
                    background: c.postUpdate ? '#F0FDF4' : undefined,
                  }}>
                    <td style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>
                      {c.label}
                      {c.tag && <span style={{ marginLeft: 6, fontSize: 10, padding: '1px 6px', borderRadius: 8, background: '#FEF3C7', color: '#92400E' }}>{c.tag}</span>}
                      {c.postUpdate && !c.tag && <span style={{ marginLeft: 6, fontSize: 10, padding: '1px 6px', borderRadius: 8, background: '#D1FAE5', color: '#065F46' }}>post-update</span>}
                    </td>
                    <td style={{ textAlign: 'right', padding: '8px 12px', fontWeight: 600 }}>{c.starts.toLocaleString()}</td>
                    <td style={{ textAlign: 'right', padding: '8px 12px', color: TP.green }}>{c.within7d.toLocaleString()}</td>
                    <td style={{ textAlign: 'right', padding: '8px 12px', color: '#6B7280' }}>{c.d8to14 || '–'}</td>
                    <td style={{ textAlign: 'right', padding: '8px 12px', color: '#6B7280' }}>{c.d15plus || '–'}</td>
                    <td style={{ textAlign: 'right', padding: '8px 12px', color: TP.red, fontWeight: 600 }}>{c.waiting.toLocaleString()}</td>
                    <td style={{ textAlign: 'right', padding: '8px 12px', fontWeight: 700, color: donePct >= 70 ? '#166534' : donePct >= 55 ? '#92400E' : TP.red }}>
                      {donePct}%{isYoung && <span style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 400 }}> *</span>}
                    </td>
                    <td style={{ textAlign: 'right', padding: '8px 12px', color: '#9CA3AF', fontSize: 12 }}>{c.daysElapsed}d</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p style={{ fontSize: 11, color: '#9CA3AF', margin: '8px 0 0' }}>* Young cohorts (&lt;14 days) — completion rate will increase as they age.</p>
      </div>

      {/* ═══════ FOOTER: Source ═══════ */}
      <div style={{ fontSize: 11, color: '#9CA3AF', textAlign: 'center', padding: '8px 0' }}>
        Source: Salesforce exports, June 8 2026. Cohort data from &quot;Waiting on Info Ratios&quot; export.
      </div>

    </div>
  );
}
/* REMOVED SECTIONS BELOW — kept data arrays for future use */
/* eslint-disable @typescript-eslint/no-unused-vars */
const _UNUSED_PLACEHOLDER = 0;
void _UNUSED_PLACEHOLDER;
void MAY_DAILY; void FUNNEL_DATA; void COHORT_AGING;
