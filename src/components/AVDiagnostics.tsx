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
// Source: Salesforce "Waiting on Info Ratios" export, pulled August 3, 2026
const AV_DATA = [
  { label: 'Jan 26', month: 1,  year: 2026, traffic: 37320, starts: 1147, waiting: 106, submitted: 1041, partial: false, period: 'full' as const },
  { label: 'Feb 26', month: 2,  year: 2026, traffic: 51480, starts: 2187, waiting: 859, submitted: 1328, partial: false, period: 'full' as const },
  { label: 'Mar 26', month: 3,  year: 2026, traffic: 39218, starts: 2260, waiting: 925, submitted: 1335, partial: false, period: 'full' as const },
  { label: 'Apr 26', month: 4,  year: 2026, traffic: 30311, starts: 1428, waiting: 524, submitted: 904,  partial: false, period: 'full' as const },
  { label: 'May 1–22', month: 5, year: 2026, traffic: 21819, starts: 1030, waiting: 463, submitted: 567, partial: false, period: 'pre-update' as const },
  { label: 'May 23–31', month: 5,  year: 2026, traffic: 11212,  starts: 573,  waiting: 232,  submitted: 341,  partial: false,  period: 'post-update' as const },
  { label: 'Jun 26', month: 6, year: 2026, traffic: 36468, starts: 1752, waiting: 560, submitted: 1192, partial: false, period: 'post-update' as const },
];

// ── Same-week completion rate by weekly cohort (source of truth) ──────
// For each week: of all records created, what % submitted within the same Mon-Sun window.
// Hard stop — later submissions don't count. Apples-to-apples across all weeks.
// Source: Salesforce "Waiting on Info Ratios" + "Google Ads" exports, August 3, 2026
const WEEKLY_COMPLETION: { label: string; total: number; submitted: number; pct: number; paidAds: number }[] = [
  { label: 'Feb 02', total: 284, submitted: 204, pct: 71.8, paidAds: 0 },
  { label: 'Feb 09', total: 293, submitted: 183, pct: 62.5, paidAds: 0 },
  { label: 'Feb 16', total: 687, submitted: 320, pct: 46.6, paidAds: 0 },
  { label: 'Feb 23', total: 972, submitted: 437, pct: 45.0, paidAds: 0 },
  { label: 'Mar 02', total: 486, submitted: 254, pct: 52.3, paidAds: 0 },
  { label: 'Mar 09', total: 588, submitted: 255, pct: 43.4, paidAds: 0 },
  { label: 'Mar 16', total: 505, submitted: 251, pct: 49.7, paidAds: 0 },
  { label: 'Mar 23', total: 477, submitted: 232, pct: 48.6, paidAds: 0 },
  { label: 'Mar 30', total: 329, submitted: 173, pct: 52.6, paidAds: 2 },
  { label: 'Apr 06', total: 368, submitted: 200, pct: 54.3, paidAds: 12 },
  { label: 'Apr 13', total: 324, submitted: 165, pct: 50.9, paidAds: 18 },
  { label: 'Apr 20', total: 328, submitted: 180, pct: 54.9, paidAds: 11 },
  { label: 'Apr 27', total: 329, submitted: 163, pct: 49.5, paidAds: 21 },
  { label: 'May 04', total: 309, submitted: 146, pct: 47.2, paidAds: 19 },
  { label: 'May 11', total: 334, submitted: 142, pct: 42.5, paidAds: 8 },
  { label: 'May 18', total: 378, submitted: 157, pct: 41.5, paidAds: 10 },
  { label: 'May 25', total: 464, submitted: 245, pct: 52.8, paidAds: 36 },
  { label: 'Jun 01', total: 493, submitted: 308, pct: 62.5, paidAds: 44 },
  { label: 'Jun 08', total: 486, submitted: 293, pct: 60.3, paidAds: 36 },
  { label: 'Jun 15', total: 270, submitted: 151, pct: 55.9, paidAds: 36 },
  { label: 'Jun 22', total: 395, submitted: 225, pct: 57.0, paidAds: 52 },
  { label: 'Jun 29', total: 108, submitted: 67, pct: 62.0, paidAds: 29 },
];

// ── Event markers for same-week chart ──────────────────────────────────
const EVENTS: { week: string; label: string; color: string }[] = [
  { week: 'May 18', label: 'Photo assessment update ships', color: '#1D9E75' },
];

// ── Full pipeline funnel by month (source of truth) ──────────────────
// From same Salesforce export — current stage of all 2026 accounts
// Stages grouped: Waiting (stuck), In Review (Sent to Dr Ben through TxP Approved),
// Checkout (Sent Checkout Link), Checked Out (CHECKED OUT + Consult Complete + Myo Only),
// Closed (Referred Out, Denied, Closed Lost, etc.), On Hold
const FUNNEL_DATA = [
  { label: 'Jan 26', waiting: 106, inReview:  0, checkout:  17, checkedOut: 316, closed: 690, onHold: 18 },
  { label: 'Feb 26', waiting: 859, inReview:  5, checkout:  45, checkedOut: 354, closed: 896, onHold: 28 },
  { label: 'Mar 26', waiting: 925, inReview: 11, checkout: 168, checkedOut: 412, closed: 718, onHold: 26 },
  { label: 'Apr 26', waiting: 524, inReview:  7, checkout: 352, checkedOut: 261, closed: 268, onHold: 16 },
  { label: 'May 26', waiting: 695, inReview: 16, checkout: 509, checkedOut: 210, closed: 154, onHold: 19 },
  { label: 'Jun 26', waiting: 560, inReview: 24, checkout: 687, checkedOut: 263, closed: 191, onHold: 27 },
];

// ── May daily data (source of truth) ─────────────────────────────────
// Daily breakdown: account creations, waiting, and submitted for May 2026
const MAY_DAILY = [
  { day: 1, starts: 40, waiting: 15, submitted: 25 },
  { day: 2, starts: 39, waiting: 20, submitted: 19 },
  { day: 3, starts: 39, waiting: 18, submitted: 21 },
  { day: 4, starts: 57, waiting: 24, submitted: 33 },
  { day: 5, starts: 37, waiting: 14, submitted: 23 },
  { day: 6, starts: 66, waiting: 29, submitted: 37 },
  { day: 7, starts: 45, waiting: 20, submitted: 25 },
  { day: 8, starts: 40, waiting: 16, submitted: 24 },
  { day: 9, starts: 35, waiting: 17, submitted: 18 },
  { day: 10, starts: 29, waiting: 13, submitted: 16 },
  { day: 11, starts: 57, waiting: 26, submitted: 31 },
  { day: 12, starts: 42, waiting: 16, submitted: 26 },
  { day: 13, starts: 53, waiting: 21, submitted: 32 },
  { day: 14, starts: 51, waiting: 24, submitted: 27 },
  { day: 15, starts: 39, waiting: 17, submitted: 22 },
  { day: 16, starts: 33, waiting: 12, submitted: 21 },
  { day: 17, starts: 59, waiting: 33, submitted: 26 },
  { day: 18, starts: 47, waiting: 15, submitted: 32 },
  { day: 19, starts: 61, waiting: 30, submitted: 31 },
  { day: 20, starts: 44, waiting: 23, submitted: 21 },
  { day: 21, starts: 42, waiting: 18, submitted: 24 },
  { day: 22, starts: 75, waiting: 45, submitted: 30 },
  { day: 23, starts: 66, waiting: 40, submitted: 26 },
  { day: 24, starts: 43, waiting: 26, submitted: 17 },
  { day: 25, starts: 38, waiting: 17, submitted: 21 },
  { day: 26, starts: 43, waiting: 9, submitted: 34 },
  { day: 27, starts: 81, waiting: 31, submitted: 50 },
  { day: 28, starts: 81, waiting: 36, submitted: 45 },
  { day: 29, starts: 103, waiting: 36, submitted: 67 },
  { day: 30, starts: 64, waiting: 25, submitted: 39 },
  { day: 31, starts: 54, waiting: 19, submitted: 35 },
];

// ── Lag distribution by month (source of truth) ────────────────────
// Buckets: Same day, 1 day, 2–3 days, 4–7 days, 8–14 days, 15–30 days, 31+ days
// Used for fair cross-month comparison using a fixed 3-day window
const LAG_DISTRIBUTION = [
  { label: 'Jan',        buckets: [955, 13, 27,  7,  6,  7, 23] },
  { label: 'Feb',        buckets: [991, 78, 58, 58, 35, 28, 66] },
  { label: 'Mar',        buckets: [964, 103, 56, 47, 33, 26, 89] },
  { label: 'Apr',        buckets: [684, 50, 35, 35, 23, 23, 47] },
  { label: 'May 1–22',   buckets: [389, 60, 42, 24, 18, 14, 17] },
  { label: 'May 23–Jun 30', buckets: [1185, 102, 59, 69, 46, 32, 27] },
];

// ── Weekly cohort completion curves (source of truth) ────────────────
// Created-date cohorts: what % completed by day 0, 1, 3, 7
const COHORT_DATA = [
  { label: 'May 4–10',  n: 309, sameDay: 41.1, within1d: 45.6, within3d: 49.5, within7d: 51.5 },
  { label: 'May 11–17', n: 334, sameDay: 36.2, within1d: 44.0, within3d: 47.3, within7d: 50.9 },
  { label: 'May 18–24', n: 378, sameDay: 34.4, within1d: 38.6, within3d: 42.1, within7d: 44.2 },
  { label: 'May 25–31', n: 464, sameDay: 48.1, within1d: 52.6, within3d: 55.0, within7d: 56.5 },
  { label: 'Jun 1–7',   n: 493, sameDay: 55.2, within1d: 60.0, within3d: 62.5, within7d: 66.9 },
  { label: 'Jun 8–14',  n: 485, sameDay: 54.0, within1d: 59.0, within3d: 61.9, within7d: 64.5 },
  { label: 'Jun 15–21', n: 270, sameDay: 51.1, within1d: 54.4, within3d: 57.8, within7d: 61.9 },
  { label: 'Jun 22–28', n: 395, sameDay: 49.1, within1d: 55.2, within3d: 56.7, within7d: 59.2 },
  { label: 'Jun 29–Jul 5', n: 108, sameDay: 57.4, within1d: 59.3, within3d: 61.1, within7d: 64.8 },
];

// ── Daily cohorts archived ──────────────────────────────────────────
// Removed from render — daily granularity data in Salesforce exports

// ── Cohort aging comparison (source of truth) ───────────────────────
// Tracks each weekly cohort broken into non-overlapping groups:
//   completed (within 7d + days 8-14 + 15+) | waiting | other
// These add up to starts. "mature" = every person has had that many days.
// Weekly cohort aging — Feb through current
// Source: Salesforce Waiting on Info Ratios export August 3, 2026
const COHORT_AGING: {label:string; starts:number; within7d:number; d8to14:number; d15plus:number; waiting:number; daysElapsed:number; mature7d:boolean; mature14d:boolean; postUpdate:boolean; tag?:string}[] = [
  { label: 'Feb 02–08', starts: 284, within7d: 210, d8to14: 4, d15plus: 11, waiting: 58, daysElapsed: 176, mature7d: true, mature14d: true, postUpdate: false },
  { label: 'Feb 09–15', starts: 293, within7d: 197, d8to14: 5, d15plus: 8, waiting: 83, daysElapsed: 169, mature7d: true, mature14d: true, postUpdate: false },
  { label: 'Feb 16–22', starts: 687, within7d: 336, d8to14: 13, d15plus: 33, waiting: 297, daysElapsed: 162, mature7d: true, mature14d: true, postUpdate: false },
  { label: 'Feb 23–Mar 01', starts: 972, within7d: 460, d8to14: 14, d15plus: 46, waiting: 446, daysElapsed: 155, mature7d: true, mature14d: true, postUpdate: false },
  { label: 'Mar 02–08', starts: 486, within7d: 265, d8to14: 15, d15plus: 29, waiting: 172, daysElapsed: 148, mature7d: true, mature14d: true, postUpdate: false },
  { label: 'Mar 09–15', starts: 588, within7d: 275, d8to14: 6, d15plus: 25, waiting: 279, daysElapsed: 141, mature7d: true, mature14d: true, postUpdate: false },
  { label: 'Mar 16–22', starts: 505, within7d: 266, d8to14: 5, d15plus: 30, waiting: 203, daysElapsed: 134, mature7d: true, mature14d: true, postUpdate: false },
  { label: 'Mar 23–29', starts: 477, within7d: 247, d8to14: 5, d15plus: 27, waiting: 196, daysElapsed: 127, mature7d: true, mature14d: true, postUpdate: false },
  { label: 'Mar 30–Apr 05', starts: 329, within7d: 184, d8to14: 4, d15plus: 14, waiting: 125, daysElapsed: 120, mature7d: true, mature14d: true, postUpdate: false },
  { label: 'Apr 06–12', starts: 368, within7d: 209, d8to14: 1, d15plus: 24, waiting: 134, daysElapsed: 113, mature7d: true, mature14d: true, postUpdate: false },
  { label: 'Apr 13–19', starts: 324, within7d: 177, d8to14: 9, d15plus: 17, waiting: 118, daysElapsed: 106, mature7d: true, mature14d: true, postUpdate: false },
  { label: 'Apr 20–26', starts: 328, within7d: 193, d8to14: 4, d15plus: 11, waiting: 120, daysElapsed: 99, mature7d: true, mature14d: true, postUpdate: false },
  { label: 'Apr 27–May 03', starts: 329, within7d: 175, d8to14: 7, d15plus: 16, waiting: 130, daysElapsed: 92, mature7d: true, mature14d: true, postUpdate: false },
  { label: 'May 04–10', starts: 309, within7d: 159, d8to14: 5, d15plus: 13, waiting: 131, daysElapsed: 85, mature7d: true, mature14d: true, postUpdate: false },
  { label: 'May 11–17', starts: 334, within7d: 170, d8to14: 6, d15plus: 10, waiting: 148, daysElapsed: 78, mature7d: true, mature14d: true, postUpdate: false },
  { label: 'May 18–24', starts: 378, within7d: 167, d8to14: 8, d15plus: 10, waiting: 192, daysElapsed: 71, mature7d: true, mature14d: true, postUpdate: false, tag: 'Photo update ships' },
  { label: 'May 25–31', starts: 464, within7d: 262, d8to14: 12, d15plus: 18, waiting: 171, daysElapsed: 64, mature7d: true, mature14d: true, postUpdate: true },
  { label: 'Jun 01–07', starts: 493, within7d: 330, d8to14: 6, d15plus: 10, waiting: 147, daysElapsed: 57, mature7d: true, mature14d: true, postUpdate: true },
  { label: 'Jun 08–14', starts: 486, within7d: 314, d8to14: 9, d15plus: 9, waiting: 153, daysElapsed: 50, mature7d: true, mature14d: true, postUpdate: true },
  { label: 'Jun 15–21', starts: 270, within7d: 167, d8to14: 7, d15plus: 12, waiting: 84, daysElapsed: 43, mature7d: true, mature14d: true, postUpdate: true },
  { label: 'Jun 22–28', starts: 395, within7d: 234, d8to14: 10, d15plus: 10, waiting: 141, daysElapsed: 36, mature7d: true, mature14d: true, postUpdate: true },
  { label: 'Jun 29–Jul 05', starts: 108, within7d: 70, d8to14: 0, d15plus: 2, waiting: 35, daysElapsed: 29, mature7d: true, mature14d: true, postUpdate: true },
];

// ── Post-update tracking ────────────────────────────────────────────
const POST_UPDATE_DAYS_ELAPSED = 72; // May 23 – Aug 3 = 72 days post-update

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
    const isPost = d.label === 'May 23–Jun 11';
    return { label: d.label, within3d, sameDayPct, within1dPct, isPost };
  });
  const fairComp = fairCompAll.filter(d => d.label === 'May 1–22' || d.label === 'May 23–Jun 11' || d.label === 'Apr');
  const fairPre = fairComp.find(d => d.label === 'May 1–22')!;
  const fairPost = fairCompAll.find(d => d.label === 'May 23–Jun 11')!;

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
        Source: Salesforce exports, July 16, 2026. Cohort data from &quot;Waiting on Info Ratios&quot; export.
      </div>

    </div>
  );
}
/* Data arrays kept for reference — suppressed in component body */
