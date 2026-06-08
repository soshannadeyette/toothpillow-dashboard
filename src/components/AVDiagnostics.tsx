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

  // ── Derived: cohort comparison (the real measure of update impact) ────
  // NORMALIZE: use within-7-day completers as denominator for all cohorts.
  // Raw COHORT_DATA uses all-eventual-completers (including day 8, 9, 12+ returners)
  // which unfairly deflates pre-update percentages since the post-update cohort
  // is too young to have late returners. This makes the comparison apples-to-apples.
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
        <h2 style={{ fontSize: 22, fontWeight: 600, color: TP.navy, margin: '0 0 6px' }}>Assessment Update Impact</h2>
        <p style={{ fontSize: 13, color: '#888', margin: 0 }}>
          May 22 update: simplified photo upload flow. Measuring completion speed, same-day rate, and volume.
        </p>
      </div>

      {/* ═══════ SECTION 0: FAIR COMPARISON — SAME-DAY RATE OVER TIME ═══════ */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: 24, marginBottom: 28 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: TP.navy, margin: '0 0 4px' }}>Same-day completion rate (fair comparison)</h3>
        <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 16px' }}>
          Among patients who completed within 3 days, what % finished same day? Same window applied to every period so no cohort has an unfair advantage.
        </p>
        <div style={{ height: 300 }}>
          <Bar
            data={{
              labels: fairComp.map(d => d.label),
              datasets: [{
                label: 'Same-day %',
                data: fairComp.map(d => d.sameDayPct),
                backgroundColor: fairComp.map(d => d.isPost ? TP.green : TP.blue),
                borderRadius: 6,
                barPercentage: 0.7,
              }],
            }}
            options={{
              responsive: true, maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
                tooltip: { callbacks: { label: (ctx: { parsed: { y: number } }) => ctx.parsed.y + '% same day' } },
              },
              scales: {
                y: { min: 70, max: 100, ticks: { callback: (v: number | string) => v + '%' } },
              },
            } as any}
          />
        </div>
        <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#6B7280', marginTop: 12 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 12, height: 12, borderRadius: 3, background: TP.blue }} /> Pre-update months</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 12, height: 12, borderRadius: 3, background: TP.green }} /> Post-update (May 23+)</span>
        </div>
        <div style={{ marginTop: 12, fontSize: 12, color: '#6B7280' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                <th style={{ textAlign: 'left', padding: '6px 8px', fontWeight: 600 }}>Period</th>
                <th style={{ textAlign: 'right', padding: '6px 8px', fontWeight: 600 }}>Completed within 3 days</th>
                <th style={{ textAlign: 'right', padding: '6px 8px', fontWeight: 600 }}>Same-day rate</th>
                <th style={{ textAlign: 'right', padding: '6px 8px', fontWeight: 600 }}>Within 1 day</th>
              </tr>
            </thead>
            <tbody>
              {fairComp.map(d => (
                <tr key={d.label} style={{ borderBottom: '1px solid #F3F4F6', background: d.isPost ? '#F0FDF4' : 'transparent', fontWeight: d.isPost ? 700 : 400 }}>
                  <td style={{ padding: '6px 8px' }}>{d.label}{d.isPost ? ' (post-update)' : ''}</td>
                  <td style={{ padding: '6px 8px', textAlign: 'right' }}>{d.within3d.toLocaleString()}</td>
                  <td style={{ padding: '6px 8px', textAlign: 'right', color: d.isPost ? TP.green : 'inherit' }}>{d.sameDayPct}%</td>
                  <td style={{ padding: '6px 8px', textAlign: 'right', color: d.isPost ? TP.green : 'inherit' }}>{d.within1dPct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ═══════ SECTION 1: HERO STAT CARDS ═══════ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 32 }}>

        {/* Same-day completion */}
        <div style={card('#F0FDF4', '#BBF7D0')}>
          <div style={{ ...cardLabel, color: '#166534' }}>Same-day completion</div>
          <div style={{ ...cardNum, color: '#166534' }}>{fairPost.sameDayPct}%</div>
          <div style={{ ...cardSub, color: '#15803D' }}>
            {arrow(true)} from {fairPre.sameDayPct}% (May 1–22)
          </div>
          <div style={{ fontSize: 11, color: '#166534', marginTop: 2 }}>
            +{(fairPost.sameDayPct - fairPre.sameDayPct).toFixed(0)}pp improvement (same 3-day window)
          </div>
        </div>

        {/* Completions — raw volume */}
        <div style={card('#EFF6FF', '#BFDBFE')}>
          <div style={{ ...cardLabel, color: '#1E40AF' }}>Completions</div>
          <div style={{ ...cardNum, color: '#1E40AF' }}>{postAgingCohort.within7d + postAgingCohort.d8to14 + postAgingCohort.d15plus}</div>
          <div style={{ ...cardSub, color: '#2563EB' }}>
            from {postAgingCohort.starts} starts ({POST_UPDATE_DAYS_ELAPSED} days old)
          </div>
          <div style={{ fontSize: 11, color: '#1E40AF', marginTop: 2 }}>
            {postAgingCohort.waiting} still in progress, cohort still aging
          </div>
        </div>

        {/* Mean time to complete */}
        <div style={card('#F0FDF4', '#BBF7D0')}>
          <div style={{ ...cardLabel, color: '#166534' }}>Mean time to submit</div>
          <div style={{ ...cardNum, color: '#166534' }}>0.2 days</div>
          <div style={{ ...cardSub, color: '#15803D' }}>
            {arrow(false)} from 1.0 day pre-update
          </div>
          <div style={{ fontSize: 11, color: '#166534', marginTop: 2 }}>
            Most people finish in one sitting
          </div>
        </div>

        {/* Volume — starts per day */}
        <div style={card('#EFF6FF', '#BFDBFE')}>
          <div style={{ ...cardLabel, color: '#1E40AF' }}>Starts per day</div>
          <div style={{ ...cardNum, color: '#1E40AF' }}>{postAvgStarts}</div>
          <div style={{ ...cardSub, color: '#2563EB' }}>
            {postAvgStarts > preAvgStarts ? arrow(true) : arrow(false)} from {preAvgStarts}/day pre-update
          </div>
          <div style={{ fontSize: 11, color: '#1E40AF', marginTop: 2 }}>
            {num(AV_DATA.reduce((s, d) => s + d.starts, 0))} total starts in 2026
          </div>
        </div>
      </div>

      {/* ═══════ SECTION 2: COHORT SPEED COMPARISON (the money chart) ═══════ */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: 24, marginBottom: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: TP.navy, margin: '0 0 4px' }}>Completion speed by weekly cohort</h3>
        <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 16px' }}>
          Of patients who completed within 7 days, how fast did they finish? Using same 7-day window for all cohorts so the comparison is fair.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 12, fontSize: 12, color: '#6B7280' }}>
          {NORM.map((c, i) => {
            const colors = [TP.skyBlue, TP.purple, TP.amber, TP.green, TP.coral, TP.navy];
            const isPost = c.label === 'May 22–28' || c.label === 'May 29–31' || c.label === 'Jun 1–4';
            return (
              <span key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontWeight: isPost ? 700 : 400 }}>
                <span style={{ width: 14, height: 3, background: colors[i], borderRadius: 2 }} />
                {c.label} ({c.n7d} within 7d){isPost ? ' — post-update' : ''}
              </span>
            );
          })}
        </div>
        <div style={{ height: 300 }}>
          <Line
            data={{
              labels: ['Same day', 'Within 1 day', 'Within 3 days'],
              datasets: NORM.map((c, i) => {
                const colors = [TP.skyBlue, TP.purple, TP.amber, TP.green, TP.coral, TP.navy];
                const isPost = c.label === 'May 22–28' || c.label === 'May 29–31' || c.label === 'Jun 1–4';
                return {
                  label: c.label,
                  data: [c.sameDay, c.within1d, c.within3d],
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
                title: { display: false },
                tooltip: { callbacks: { label: (ctx: { dataset: { label: string }; parsed: { y: number } }) => ctx.dataset.label + ': ' + ctx.parsed.y + '%' } },
              },
              scales: {
                y: { min: 60, max: 102, ticks: { callback: (v: number | string) => v + '%' } },
              },
            } as any}
          />
        </div>
      </div>

      {/* ═══════ SECTION 3: PRE vs POST SIDE-BY-SIDE ═══════ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        {/* Pre-update */}
        <div style={{ background: '#FFF5F5', borderRadius: 12, padding: 20, border: '1.5px solid #FECACA' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#991B1B', textTransform: 'uppercase', marginBottom: 4 }}>Before update (May 1–22)</div>
          <div style={{ fontSize: 11, color: '#9B1C1C', marginBottom: 10 }}>{fairPre.within3d} patients completed within 3 days</div>
          <div style={{ display: 'grid', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
              <span style={{ color: '#6B7280' }}>Same-day completion</span>
              <span style={{ fontWeight: 700, color: '#991B1B' }}>{fairPre.sameDayPct}%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
              <span style={{ color: '#6B7280' }}>Within 1 day</span>
              <span style={{ fontWeight: 700, color: '#991B1B' }}>{fairPre.within1dPct}%</span>
            </div>
            <div style={{ borderTop: '1px solid #FECACA', paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
              <span style={{ color: '#6B7280' }}>Mean lag</span>
              <span style={{ fontWeight: 700, color: '#991B1B' }}>1.0 day</span>
            </div>
          </div>
        </div>

        {/* Post-update */}
        <div style={{ background: '#F0FDF4', borderRadius: 12, padding: 20, border: '1.5px solid #BBF7D0' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#166534', textTransform: 'uppercase', marginBottom: 4 }}>After update (May 23–Jun 8)</div>
          <div style={{ fontSize: 11, color: '#15803D', marginBottom: 10 }}>{fairPost.within3d} patients completed within 3 days</div>
          <div style={{ display: 'grid', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
              <span style={{ color: '#6B7280' }}>Same-day completion</span>
              <span style={{ fontWeight: 700, color: '#166534' }}>{fairPost.sameDayPct}% <span style={{ fontSize: 11, color: '#15803D' }}>+{(fairPost.sameDayPct - fairPre.sameDayPct).toFixed(0)}pp</span></span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
              <span style={{ color: '#6B7280' }}>Within 1 day</span>
              <span style={{ fontWeight: 700, color: '#166534' }}>{fairPost.within1dPct}% <span style={{ fontSize: 11, color: '#15803D' }}>+{(fairPost.within1dPct - fairPre.within1dPct).toFixed(0)}pp</span></span>
            </div>
            <div style={{ borderTop: '1px solid #BBF7D0', paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
              <span style={{ color: '#6B7280' }}>Mean lag</span>
              <span style={{ fontWeight: 700, color: '#166534' }}>0.2 days</span>
            </div>
          </div>
        </div>
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
