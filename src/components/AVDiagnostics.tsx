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
// Source: Salesforce "Waiting on Info Ratios" export, pulled June 11, 2026
const AV_DATA = [
  { label: 'Jan 26', month: 1,  year: 2026, traffic: 37320, starts: 1146, waiting: 108, submitted: 1035, partial: false, period: 'full' as const },
  { label: 'Feb 26', month: 2,  year: 2026, traffic: 51480, starts: 2193, waiting: 888, submitted: 1293, partial: false, period: 'full' as const },
  { label: 'Mar 26', month: 3,  year: 2026, traffic: 39218, starts: 2263, waiting: 967, submitted: 1285, partial: false, period: 'full' as const },
  { label: 'Apr 26', month: 4,  year: 2026, traffic: 30311, starts: 1431, waiting: 569, submitted: 854,  partial: false, period: 'full' as const },
  { label: 'May 1–22', month: 5, year: 2026, traffic: 21819, starts: 1037, waiting: 487, submitted: 550, partial: false, period: 'pre-update' as const },
  { label: 'May 23–31', month: 5,  year: 2026, traffic: 11212,  starts: 580,  waiting: 282,  submitted: 298,  partial: false,  period: 'post-update' as const },
  { label: 'Jun 1–11', month: 6, year: 2026, traffic: 0, starts: 814, waiting: 294, submitted: 512, partial: true, period: 'post-update' as const },
];

// ── Same-week completion rate by weekly cohort (source of truth) ──────
// For each week: of all records created, what % submitted within the same Mon-Sun window.
// Hard stop — later submissions don't count. Apples-to-apples across all weeks.
// Source: Salesforce "Waiting on Info Ratios" export, June 11, 2026
const WEEKLY_COMPLETION: { label: string; total: number; submitted: number; pct: number; paidAds: number }[] = [
  { label: 'Feb 02', total: 284, submitted: 204, pct: 71.8, paidAds: 0 },
  { label: 'Feb 09', total: 293, submitted: 183, pct: 62.5, paidAds: 0 },
  { label: 'Feb 16', total: 691, submitted: 320, pct: 46.3, paidAds: 0 },
  { label: 'Feb 23', total: 971, submitted: 437, pct: 45.0, paidAds: 0 },
  { label: 'Mar 02', total: 488, submitted: 255, pct: 52.3, paidAds: 0 },
  { label: 'Mar 09', total: 588, submitted: 255, pct: 43.4, paidAds: 0 },
  { label: 'Mar 16', total: 506, submitted: 252, pct: 49.8, paidAds: 0 },
  { label: 'Mar 23', total: 478, submitted: 232, pct: 48.5, paidAds: 0 },
  { label: 'Mar 30', total: 330, submitted: 173, pct: 52.4, paidAds: 2 },
  { label: 'Apr 06', total: 368, submitted: 200, pct: 54.3, paidAds: 12 },
  { label: 'Apr 13', total: 324, submitted: 165, pct: 50.9, paidAds: 18 },
  { label: 'Apr 20', total: 328, submitted: 180, pct: 54.9, paidAds: 11 },
  { label: 'Apr 27', total: 330, submitted: 165, pct: 50.0, paidAds: 21 },
  { label: 'May 04', total: 312, submitted: 146, pct: 46.8, paidAds: 20 },
  { label: 'May 11', total: 332, submitted: 143, pct: 43.1, paidAds: 7 },
  { label: 'May 18', total: 380, submitted: 158, pct: 41.6, paidAds: 10 },
  { label: 'May 25', total: 467, submitted: 248, pct: 53.1, paidAds: 36 },
  { label: 'Jun 01', total: 496, submitted: 308, pct: 62.1, paidAds: 44 },
  { label: 'Jun 08', total: 318, submitted: 182, pct: 57.2, paidAds: 15 },
];

// ── Event markers for same-week chart ──────────────────────────────────
const EVENTS: { week: string; label: string; color: string }[] = [
  { week: 'Feb 23', label: 'Volume spike (2x)', color: '#7F77DD' },
  { week: 'Mar 30', label: 'Google Ads live', color: '#3A6EA4' },
  { week: 'Apr 20', label: 'Daily Wire ad read', color: '#D85A30' },
  { week: 'May 18', label: 'Low point (41.6%)', color: '#E24B4A' },
  { week: 'May 25', label: 'Assessment update ships', color: '#1D9E75' },
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
  { label: 'May 23–Jun 8', buckets: [551, 49, 26, 17, 7, 0, 0] },
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
// Weekly cohort aging — Feb through current
// Source: Salesforce Waiting on Info Ratios export June 11, 2026
const COHORT_AGING: {label:string; starts:number; within7d:number; d8to14:number; d15plus:number; waiting:number; daysElapsed:number; mature7d:boolean; mature14d:boolean; postUpdate:boolean; tag?:string}[] = [
  { label: 'Feb 02–08', starts: 284, within7d: 210, d8to14: 4, d15plus: 10, waiting: 59, daysElapsed: 123, mature7d: true, mature14d: true, postUpdate: false },
  { label: 'Feb 09–15', starts: 293, within7d: 197, d8to14: 5, d15plus: 7, waiting: 85, daysElapsed: 116, mature7d: true, mature14d: true, postUpdate: false },
  { label: 'Feb 16–22', starts: 691, within7d: 336, d8to14: 14, d15plus: 26, waiting: 307, daysElapsed: 109, mature7d: true, mature14d: true, postUpdate: false },
  { label: 'Feb 23–Mar 01', starts: 971, within7d: 460, d8to14: 14, d15plus: 37, waiting: 455, daysElapsed: 102, mature7d: true, mature14d: true, postUpdate: false },
  { label: 'Mar 02–08', starts: 488, within7d: 266, d8to14: 15, d15plus: 24, waiting: 178, daysElapsed: 95, mature7d: true, mature14d: true, postUpdate: false },
  { label: 'Mar 09–15', starts: 588, within7d: 275, d8to14: 6, d15plus: 22, waiting: 282, daysElapsed: 88, mature7d: true, mature14d: true, postUpdate: false },
  { label: 'Mar 16–22', starts: 506, within7d: 267, d8to14: 5, d15plus: 24, waiting: 209, daysElapsed: 81, mature7d: true, mature14d: true, postUpdate: false },
  { label: 'Mar 23–29', starts: 478, within7d: 248, d8to14: 5, d15plus: 23, waiting: 200, daysElapsed: 74, mature7d: true, mature14d: true, postUpdate: false },
  { label: 'Mar 30–Apr 05', starts: 330, within7d: 184, d8to14: 4, d15plus: 12, waiting: 129, daysElapsed: 67, mature7d: true, mature14d: true, postUpdate: false },
  { label: 'Apr 06–12', starts: 368, within7d: 209, d8to14: 1, d15plus: 13, waiting: 145, daysElapsed: 60, mature7d: true, mature14d: true, postUpdate: false },
  { label: 'Apr 13–19', starts: 324, within7d: 177, d8to14: 9, d15plus: 10, waiting: 124, daysElapsed: 53, mature7d: true, mature14d: true, postUpdate: false },
  { label: 'Apr 20–26', starts: 328, within7d: 193, d8to14: 4, d15plus: 4, waiting: 127, daysElapsed: 46, mature7d: true, mature14d: true, postUpdate: false },
  { label: 'Apr 27–May 03', starts: 330, within7d: 177, d8to14: 7, d15plus: 10, waiting: 137, daysElapsed: 39, mature7d: true, mature14d: true, postUpdate: false },
  { label: 'May 04–10', starts: 312, within7d: 159, d8to14: 5, d15plus: 8, waiting: 140, daysElapsed: 32, mature7d: true, mature14d: true, postUpdate: false },
  { label: 'May 11–17', starts: 332, within7d: 171, d8to14: 6, d15plus: 3, waiting: 152, daysElapsed: 25, mature7d: true, mature14d: true, postUpdate: false },
  { label: 'May 18–24', starts: 380, within7d: 167, d8to14: 9, d15plus: 2, waiting: 202, daysElapsed: 18, mature7d: true, mature14d: true, postUpdate: false },
  { label: 'May 25–31', starts: 467, within7d: 266, d8to14: 11, d15plus: 0, waiting: 190, daysElapsed: 11, mature7d: true, mature14d: false, postUpdate: true },
  { label: 'Jun 01–07', starts: 496, within7d: 330, d8to14: 0, d15plus: 0, waiting: 165, daysElapsed: 4, mature7d: false, mature14d: false, postUpdate: true },
  { label: 'Jun 08–11', starts: 318, within7d: 182, d8to14: 0, d15plus: 0, waiting: 129, daysElapsed: 0, mature7d: false, mature14d: false, postUpdate: true },
];

// ── Post-update tracking ────────────────────────────────────────────
const POST_UPDATE_DAYS_ELAPSED = 13; // May 23 – Jun 4 = 13 days post-update

function num(v: number): string { return v.toLocaleString(); }

export default function AVDiagnostics() {

  // Suppress unused data arrays kept for future reference
  void COHORT_DATA; void AV_DATA; void FUNNEL_DATA; void MAY_DAILY; void LAG_DISTRIBUTION; void EVENTS;

  // ── Old derived computations (kept to avoid removing data arrays) ────
  const normalize = (c: typeof COHORT_DATA[0]) => {
    const scale = 100 / c.within7d; // within7d% → 100%, everything else scales up
    return {
      ...c,
      sameDay:   Math.round(c.sameDay * scale * 10) / 10,
      within1d:  Math.round(c.within1d * scale * 10) / 10,
      within3d:  Math.round(c.within3d * scale * 10) / 10,
      within7d:  100.0,
      n7d:       Math.round(c.n * c.within7d / 100), // count of 7-day completers
    };
  };
  const NORM = COHORT_DATA.map(normalize);
  const preCohort = NORM.find(c => c.label === 'May 15–21')!;
  const postCohort = NORM.find(c => c.label === 'May 22–28')!;

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

  // ── Fair comparison: same-day rate using 3-day window across all months ────
  // For each period, denominator = people who completed within 3 days (same day + 1 day + 2-3 day buckets)
  // This makes every period comparable regardless of how old the cohort is
  const fairCompAll = LAG_DISTRIBUTION.map(d => {
    const within3d = d.buckets[0] + d.buckets[1] + d.buckets[2];
    const sameDayPct = within3d > 0 ? Math.round(d.buckets[0] / within3d * 1000) / 10 : 0;
    const within1dPct = within3d > 0 ? Math.round((d.buckets[0] + d.buckets[1]) / within3d * 1000) / 10 : 0;
    const isPost = d.label === 'May 23–Jun 8';
    return { label: d.label, within3d, sameDayPct, within1dPct, isPost };
  });
  const fairComp = fairCompAll.filter(d => d.label === 'May 1–22' || d.label === 'May 23–Jun 8' || d.label === 'Apr');
  const fairPre = fairComp.find(d => d.label === 'May 1–22')!;
  const fairPost = fairCompAll.find(d => d.label === 'May 23–Jun 8')!;

  // ── Styles ────────────────────────────────────────────────────────
  const card = (bg: string, border: string): React.CSSProperties => ({
    background: bg, borderRadius: 12, padding: '18px 20px', border: `1.5px solid ${border}`,
  });
  const cardLabel: React.CSSProperties = { fontSize: 11, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: 6 };
  const cardNum: React.CSSProperties = { fontSize: 32, fontWeight: 700, lineHeight: 1.1 };
  const cardSub: React.CSSProperties = { fontSize: 12, marginTop: 4 };
  const arrow = (up: boolean) => up ? '▲' : '▼';

  return (
    <div style={{ maxWidth: 1100 }}>

      {/* ═══════ HEADER ═══════ */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 22, fontWeight: 600, color: TP.navy, margin: '0 0 6px' }}>AV Diagnostics</h2>
        <p style={{ fontSize: 13, color: '#888', margin: 0 }}>
          Weekly cohort tracking: how many people start the assessment each week, how many finish, and how long incomplete ones sit.
        </p>
      </div>

{/* ═══════ SAME-WEEK COMPLETION RATE ═══════ */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: 24, marginBottom: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: TP.navy, margin: '0 0 4px' }}>Same-Week Completion Rate</h3>
        <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 16px' }}>
          Of assessments created each week, what % submitted within the same Mon–Sun window. Hard cutoff — later completions don&apos;t count. Every week measured the same way.
        </p>

        {/* Hero cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
          {(() => {
            const recent3 = WEEKLY_COMPLETION.slice(-3);
            const prior3 = WEEKLY_COMPLETION.slice(-6, -3);
            const recentAvg = Math.round(recent3.reduce((s, w) => s + w.pct, 0) / recent3.length * 10) / 10;
            const priorAvg = Math.round(prior3.reduce((s, w) => s + w.pct, 0) / prior3.length * 10) / 10;
            const best = WEEKLY_COMPLETION.reduce((a, b) => a.pct > b.pct ? a : b);
            const worst = WEEKLY_COMPLETION.reduce((a, b) => a.pct < b.pct ? a : b);
            const totalPaid = WEEKLY_COMPLETION.reduce((s, w) => s + w.paidAds, 0);
            const totalAll = WEEKLY_COMPLETION.reduce((s, w) => s + w.total, 0);
            return (<>
              <div style={card('#F0FDF4', '#BBF7D0')}>
                <div style={cardLabel}>Last 3 weeks avg</div>
                <div style={{ ...cardNum, color: TP.green }}>{recentAvg}%</div>
                <div style={{ ...cardSub, color: recentAvg > priorAvg ? '#166534' : TP.red }}>
                  {recentAvg > priorAvg ? arrow(true) : arrow(false)} {Math.abs(Math.round((recentAvg - priorAvg) * 10) / 10)}pp vs prior 3wk ({priorAvg}%)
                </div>
              </div>
              <div style={card('#EFF6FF', '#BFDBFE')}>
                <div style={cardLabel}>Best week</div>
                <div style={{ ...cardNum, color: TP.blue }}>{best.pct}%</div>
                <div style={cardSub}>{best.label} (n={best.total})</div>
              </div>
              <div style={card('#FEF2F2', '#FECACA')}>
                <div style={cardLabel}>Worst week</div>
                <div style={{ ...cardNum, color: TP.red }}>{worst.pct}%</div>
                <div style={cardSub}>{worst.label} (n={worst.total})</div>
              </div>
              <div style={card('#F5F3FF', '#DDD6FE')}>
                <div style={cardLabel}>Google Ads share</div>
                <div style={{ ...cardNum, color: TP.purple }}>{Math.round(totalPaid / totalAll * 100)}%</div>
                <div style={cardSub}>{totalPaid} of {num(totalAll)} records (Apr+)</div>
              </div>
            </>);
          })()}
        </div>

        {/* Chart */}
        <div style={{ height: WEEKLY_COMPLETION.length * 42 + 60 }}>
          <Bar
            data={{
              labels: WEEKLY_COMPLETION.map(w => w.label),
              datasets: [
                {
                  label: 'Submitted same week',
                  data: WEEKLY_COMPLETION.map(w => w.pct),
                  backgroundColor: WEEKLY_COMPLETION.map(w => {
                    if (w.pct >= 60) return '#0F6E56';
                    if (w.pct >= 50) return '#1D9E75';
                    return '#5DCAA5';
                  }),
                  borderRadius: 3,
                  barPercentage: 0.65,
                },
                {
                  label: 'Did not submit',
                  data: WEEKLY_COMPLETION.map(w => 100 - w.pct),
                  backgroundColor: '#E5E7EB',
                  borderRadius: 3,
                  barPercentage: 0.65,
                },
              ],
            }}
            options={{
              indexAxis: 'y' as const,
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                x: {
                  stacked: true,
                  max: 100,
                  ticks: { callback: (v: number | string) => v + '%', font: { size: 11 } },
                  grid: { color: '#F3F4F6' },
                },
                y: {
                  stacked: true,
                  ticks: { font: { size: 12, weight: 'bold' as const } },
                  grid: { display: false },
                },
              },
              plugins: {
                legend: { display: false },
                tooltip: {
                  callbacks: {
                    title: (items: any[]) => `Week of ${WEEKLY_COMPLETION[items[0].dataIndex].label}`,
                    label: (ctx: any) => {
                      const w = WEEKLY_COMPLETION[ctx.dataIndex];
                      if (ctx.datasetIndex === 0) {
                        const parts = [`${w.submitted} of ${w.total} submitted same week (${w.pct}%)`];
                        if (w.paidAds > 0) parts.push(`${w.paidAds} from Google Ads (${Math.round(w.paidAds / w.total * 100)}%)`);
                        return parts;
                      }
                      return `${w.total - w.submitted} did not submit that week`;
                    },
                  },
                },
                annotation: {
                  annotations: Object.fromEntries(
                    EVENTS.map((e, i) => {
                      const idx = WEEKLY_COMPLETION.findIndex(w => w.label === e.week);
                      return [`event${i}`, {
                        type: 'label' as const,
                        yValue: idx,
                        xValue: 95,
                        content: e.label,
                        font: { size: 9, weight: 'bold' as const },
                        color: e.color,
                        backgroundColor: 'rgba(255,255,255,0.85)',
                        padding: { top: 2, bottom: 2, left: 4, right: 4 },
                        borderRadius: 3,
                      }];
                    })
                  ),
                },
              },
            } as any}
          />
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: 16, fontSize: 11, color: '#9CA3AF', marginTop: 8, flexWrap: 'wrap' }}>
          <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: '#0F6E56', marginRight: 4 }} />60%+ (strong)</span>
          <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: '#1D9E75', marginRight: 4 }} />50–59%</span>
          <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: '#5DCAA5', marginRight: 4 }} />&lt;50% (needs attention)</span>
          <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: '#E5E7EB', marginRight: 4 }} />Did not submit that week</span>
        </div>

        {/* Paid ads volume table */}
        <details style={{ marginTop: 16 }}>
          <summary style={{ fontSize: 12, color: '#6B7280', cursor: 'pointer', fontWeight: 600 }}>Google Ads records by week (April+)</summary>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 6, marginTop: 8 }}>
            {WEEKLY_COMPLETION.filter(w => w.paidAds > 0).map(w => (
              <div key={w.label} style={{ fontSize: 11, padding: '4px 8px', background: '#F3F4F6', borderRadius: 6 }}>
                <span style={{ fontWeight: 600 }}>{w.label}:</span> {w.paidAds} <span style={{ color: '#9CA3AF' }}>({Math.round(w.paidAds / w.total * 100)}%)</span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 11, color: '#9CA3AF', margin: '6px 0 0' }}>
            Source: Salesforce Google Ads 2026 export. For full per-record source breakdown (ambassador vs organic vs paid), need an export with referral type + dates on each row.
          </p>
        </details>
      </div>

      {/* ═══════ HORIZONTAL BAR: Waiting % by week ═══════ */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: 24, marginBottom: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: TP.navy, margin: '0 0 4px' }}>Waiting % by Weekly Cohort</h3>
        <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 16px' }}>
          % of each week's patients still waiting. Lower is better. Young cohorts (&lt;14d) will improve as they age.
        </p>
        <div style={{ height: Math.max(COHORT_AGING.length * 32, 300) }}>
          <Bar
            data={{
              labels: COHORT_AGING.map(c => c.label + (c.tag ? ' *' : '')),
              datasets: [{
                label: 'Waiting %',
                data: COHORT_AGING.map(c => c.starts > 0 ? Math.round((c.waiting / c.starts) * 100) : 0),
                backgroundColor: COHORT_AGING.map(c => {
                  const pct = c.starts > 0 ? (c.waiting / c.starts) * 100 : 0;
                  if (c.daysElapsed < 14) return '#D1D5DB'; // gray for young
                  if (c.tag) return '#FBBF24'; // yellow for Memorial Day
                  if (pct <= 30) return TP.green;
                  if (pct <= 42) return TP.amber;
                  return TP.red;
                }),
                borderRadius: 3,
              }],
            }}
            options={{
              indexAxis: 'y' as const,
              responsive: true, maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
                tooltip: { callbacks: { label: (ctx: any) => `${ctx.parsed.x}% still waiting (${COHORT_AGING[ctx.dataIndex].waiting} of ${COHORT_AGING[ctx.dataIndex].starts})` } },
                annotation: {
                  annotations: {
                    target: { type: 'line' as const, xMin: 38, xMax: 38, borderColor: '#9CA3AF', borderWidth: 1, borderDash: [4, 4], label: { display: true, content: 'avg 38%', position: 'start' as const, font: { size: 10 }, color: '#9CA3AF', backgroundColor: 'transparent' } },
                  },
                },
              },
              scales: {
                x: { min: 0, max: 60, ticks: { callback: (v: number | string) => v + '%' }, grid: { color: '#F3F4F6' } },
                y: { grid: { display: false }, ticks: { font: { size: 11 } } },
              },
            } as any}
          />
        </div>
        <div style={{ display: 'flex', gap: 16, fontSize: 11, color: '#9CA3AF', marginTop: 8 }}>
          <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: TP.green, marginRight: 4 }} />≤30% (good)</span>
          <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: TP.amber, marginRight: 4 }} />31-42%</span>
          <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: TP.red, marginRight: 4 }} />&gt;42% (high)</span>
          <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: '#D1D5DB', marginRight: 4 }} />Too young to judge</span>
          <span>* Memorial Day weekend</span>
        </div>
      </div>

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
                <th style={{ textAlign: 'right', padding: '8px 12px' }}>Waiting %</th>
                <th style={{ textAlign: 'right', padding: '8px 12px' }}>Age</th>
              </tr>
            </thead>
            <tbody>
              {COHORT_AGING.map((c) => {
                const done = c.starts - c.waiting;
                const donePct = c.starts > 0 ? Math.round((done / c.starts) * 100) : 0;
                const waitPct = c.starts > 0 ? Math.round((c.waiting / c.starts) * 100) : 0;
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
                    <td style={{ textAlign: 'right', padding: '8px 12px', fontWeight: 700, color: waitPct <= 30 ? '#166534' : waitPct <= 42 ? '#92400E' : TP.red }}>
                      {waitPct}%{isYoung && <span style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 400 }}> *</span>}
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
        Source: Salesforce exports, June 11 2026. Cohort data from &quot;Waiting on Info Ratios&quot; export.
      </div>

    </div>
  );
}
/* Data arrays kept for reference — suppressed in component body */
