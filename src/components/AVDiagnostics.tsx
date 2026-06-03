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
// Source: Salesforce "Waiting on Info Ratios" export, pulled June 2, 2026 19:30 PST
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
  { label: 'Jun 1–2', month: 6, year: 2026, traffic: 0, starts: 193, waiting: 75, submitted: 118, partial: true, period: 'post-update' as const },
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
  { label: 'Jun 1–2', waiting: 75, inReview: 100, checkout: 6, checkedOut: 0, closed: 8, onHold: 4 },
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
  { label: 'Jun 1–2',    buckets: [112, 6, 0, 0, 0, 0, 0] },
];

// ── Weekly cohort completion curves (source of truth) ────────────────
// Created-date cohorts: what % completed by day 0, 1, 3, 7
const COHORT_DATA = [
  { label: 'May 1–7',   n: 177, sameDay: 75.7, within1d: 87.0, within3d: 92.1, within7d: 94.4 },
  { label: 'May 8–14',  n: 168, sameDay: 69.0, within1d: 82.7, within3d: 88.7, within7d: 95.2 },
  { label: 'May 15–21', n: 176, sameDay: 68.2, within1d: 78.4, within3d: 88.6, within7d: 93.2 },
  { label: 'May 22–28', n: 210, sameDay: 82.4, within1d: 94.3, within3d: 97.6, within7d: 99.0 },
  { label: 'May 29–31', n: 117, sameDay: 91.5, within1d: 97.4, within3d: 100.0, within7d: 100.0 },
  { label: 'Jun 1–2',   n: 118, sameDay: 94.9, within1d: 100.0, within3d: 100.0, within7d: 100.0 },
];

// ── Daily cohorts archived ──────────────────────────────────────────
// Removed from render — daily granularity data in Salesforce exports

// ── Cohort aging comparison (source of truth) ───────────────────────
// Tracks each weekly cohort broken into non-overlapping groups:
//   completed (within 7d + days 8-14 + 15+) | waiting | other
// These add up to starts. "mature" = every person has had that many days.
const COHORT_AGING = [
  { label: 'May 1–7',   starts: 327, within7d: 167, d8to14: 4, d15plus: 6, waiting: 150, daysElapsed: 26, mature7d: true, mature14d: true, postUpdate: false },
  { label: 'May 8–14',  starts: 305, within7d: 160, d8to14: 4, d15plus: 4, waiting: 137, daysElapsed: 19, mature7d: true, mature14d: true, postUpdate: false },
  { label: 'May 15–21', starts: 329, within7d: 164, d8to14: 9, d15plus: 3, waiting: 153, daysElapsed: 12, mature7d: true, mature14d: false, postUpdate: false },
  { label: 'May 22–28', starts: 437, within7d: 208, d8to14: 2, d15plus: 0, waiting: 227, daysElapsed: 5, mature7d: false, mature14d: false, postUpdate: true },
  { label: 'May 29–31', starts: 219, within7d: 117, d8to14: 0, d15plus: 0, waiting: 102, daysElapsed: 2, mature7d: false, mature14d: false, postUpdate: true },
  { label: 'Jun 1–2',   starts: 193, within7d: 118, d8to14: 0, d15plus: 0, waiting: 75, daysElapsed: 0, mature7d: false, mature14d: false, postUpdate: true },
];

// ── Post-update tracking ────────────────────────────────────────────
const POST_UPDATE_DAYS_ELAPSED = 11; // May 23 – Jun 2 = 11 days post-update

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
    const isPost = d.label === 'May 23–31' || d.label === 'Jun 1–2';
    return { label: d.label, within3d, sameDayPct, within1dPct, isPost };
  });
  const fairComp = fairCompAll.filter(d => d.label === 'May 1–22' || d.label === 'May 23–31' || d.label === 'Jun 1–2');
  const fairPre = fairComp.find(d => d.label === 'May 1–22')!;
  const fairPost = fairComp.find(d => d.label === 'May 23–31')!;

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
            const isPost = c.label === 'May 22–28' || c.label === 'May 29–31' || c.label === 'Jun 1–2';
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
                const isPost = c.label === 'May 22–28' || c.label === 'May 29–31' || c.label === 'Jun 1–2';
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
          <div style={{ fontSize: 12, fontWeight: 700, color: '#166534', textTransform: 'uppercase', marginBottom: 4 }}>After update (May 23–31)</div>
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

      {/* ═══════ SECTION 4: COHORT AGING — WEEKLY OUTCOMES ═══════ */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: 24, marginBottom: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: TP.navy, margin: '0 0 4px' }}>Weekly cohort outcomes — completed vs waiting</h3>
        <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 16px' }}>
          Each row tracks everyone who started that week. Shows where they ended up. Younger cohorts haven&apos;t had time for late completers.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {COHORT_AGING.map(c => {
            const completed = c.within7d + c.d8to14 + c.d15plus;
            const compPct = Math.round(completed / c.starts * 100);
            const waitPct = 100 - compPct;
            return (
              <div key={c.label} style={{ background: c.postUpdate ? '#F0FDF410' : 'transparent', borderRadius: 10, border: c.postUpdate ? `1.5px solid ${TP.green}40` : '1.5px solid #E5E7EB', padding: '14px 18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div>
                    <span style={{ fontWeight: 700, color: TP.navy, fontSize: 14 }}>{c.label}</span>
                    {c.postUpdate && <span style={{ fontSize: 10, fontWeight: 700, background: TP.green, color: '#fff', padding: '2px 8px', borderRadius: 4, marginLeft: 8 }}>POST-UPDATE</span>}
                    {!c.mature7d && <span style={{ fontSize: 10, color: TP.amber, fontWeight: 600, marginLeft: 8 }}>STILL AGING</span>}
                  </div>
                  <span style={{ fontSize: 12, color: '#6B7280' }}>{c.starts} started · {c.daysElapsed} days old</span>
                </div>
                <div style={{ display: 'flex', height: 24, borderRadius: 6, overflow: 'hidden', background: '#f0f0f0' }}>
                  <div style={{ width: `${compPct}%`, background: TP.green, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#fff' }}>{compPct}%</span>
                  </div>
                  <div style={{ width: `${waitPct}%`, background: TP.red, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#fff' }}>{waitPct}%</span>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 11, color: '#6B7280' }}>
                  <span style={{ color: TP.green }}>Completed: {completed} ({compPct}%) — {c.within7d} within 7d{c.d8to14 > 0 ? `, ${c.d8to14} days 8-14` : ''}{c.d15plus > 0 ? `, ${c.d15plus} after 14d` : ''}</span>
                  <span style={{ color: TP.red }}>Waiting: {c.waiting} ({waitPct}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ═══════ SECTION 5: MAY DAILY — STARTS vs SUBMITTED vs WAITING ═══════ */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: 24, marginBottom: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: TP.navy, margin: '0 0 4px' }}>May daily: starts vs submitted vs waiting</h3>
        <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 16px' }}>
          Stacked bars show submitted (green) and waiting (red). Line shows total starts. Lighter bars = post-update (May 23+).
        </p>
        <div style={{ height: 340 }}>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <Bar
            data={{
              labels: MAY_DAILY.map(d => d.day.toString()),
              datasets: [
                { label: 'Submitted', data: MAY_DAILY.map(d => d.submitted), backgroundColor: MAY_DAILY.map(d => d.day >= 23 ? `${TP.green}60` : TP.green), borderRadius: 2, stack: 'stack0' },
                { label: 'Waiting', data: MAY_DAILY.map(d => d.waiting), backgroundColor: MAY_DAILY.map(d => d.day >= 23 ? `${TP.red}60` : `${TP.red}BB`), borderRadius: 2, stack: 'stack0' },
                { label: 'Total starts', data: MAY_DAILY.map(d => d.starts), type: 'line' as const, borderColor: TP.navy, borderWidth: 2, pointRadius: 2, tension: 0.3, order: 0 } as any,
              ],
            } as any}
            options={{
              responsive: true, maintainAspectRatio: false,
              plugins: {
                legend: { position: 'top' as const, labels: { usePointStyle: true, boxWidth: 8, font: { size: 11 } } },
                tooltip: { mode: 'index' as const, intersect: false },
                annotation: { annotations: {
                  updateLine: { type: 'line' as const, xMin: 21.5, xMax: 21.5, borderColor: TP.navy, borderWidth: 2, borderDash: [6, 3],
                    label: { display: true, content: 'May 22 Update', position: 'start' as const, backgroundColor: TP.navy, color: '#fff', font: { size: 10, weight: 'bold' as const }, padding: { x: 6, y: 3 } } },
                  podcastLine: { type: 'line' as const, xMin: 27.5, xMax: 27.5, borderColor: TP.amber, borderWidth: 2, borderDash: [6, 3],
                    label: { display: true, content: 'Alex Clark', position: 'end' as const, backgroundColor: TP.amber, color: '#fff', font: { size: 10, weight: 'bold' as const }, padding: { x: 6, y: 3 } } },
                } },
              },
              scales: {
                x: { stacked: true, grid: { display: false }, ticks: { font: { size: 9 } } },
                y: { stacked: true, beginAtZero: true },
              },
            } as any}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 8, flexWrap: 'wrap' }}>
          {MAY_DAILY.map(d => (
            <span key={d.day} style={{ fontSize: 9, color: d.starts > 0 ? (d.submitted / d.starts >= 0.55 ? TP.green : d.submitted / d.starts <= 0.4 ? TP.red : '#6B7280') : '#ccc', width: `${100/31}%`, textAlign: 'center' }}>
              {d.starts > 0 ? Math.round(d.submitted / d.starts * 100) + '%' : ''}
            </span>
          ))}
        </div>
      </div>

      {/* ═══════ SECTION 6: STARTS vs SUBMITTED BY MONTH ═══════ */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: 24, marginBottom: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: TP.navy, margin: '0 0 4px' }}>Monthly: starts, submitted, waiting</h3>
        <div style={{ height: 300 }}>
          <Bar
            data={{
              labels: AV_DATA.map(d => d.label),
              datasets: [
                { label: 'Submitted', data: AV_DATA.map(d => d.submitted), backgroundColor: TP.green, borderRadius: 4, stack: 'stack0' },
                { label: 'Waiting', data: AV_DATA.map(d => d.waiting), backgroundColor: `${TP.amber}90`, borderRadius: 4, stack: 'stack0' },
              ],
            }}
            options={{
              responsive: true, maintainAspectRatio: false,
              plugins: { legend: { position: 'top' as const, labels: { usePointStyle: true, boxWidth: 8 } } },
              scales: { x: { stacked: true, grid: { display: false } }, y: { stacked: true } },
            }}
          />
        </div>
        <div style={{ overflowX: 'auto', marginTop: 12 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #E5E7EB' }}>
                <th style={{ textAlign: 'left', padding: '6px 8px', fontWeight: 600 }}>Period</th>
                <th style={{ textAlign: 'right', padding: '6px 8px', fontWeight: 600 }}>Starts</th>
                <th style={{ textAlign: 'right', padding: '6px 8px', fontWeight: 600 }}>Submitted</th>
                <th style={{ textAlign: 'right', padding: '6px 8px', fontWeight: 600 }}>Comp %</th>
                <th style={{ textAlign: 'right', padding: '6px 8px', fontWeight: 600 }}>Waiting</th>
                <th style={{ textAlign: 'right', padding: '6px 8px', fontWeight: 600 }}>Wait %</th>
              </tr>
            </thead>
            <tbody>
              {AV_DATA.map(d => (
                <tr key={d.label} style={{ borderBottom: '1px solid #F3F4F6', background: d.period === 'post-update' ? '#F0FDF4' : 'transparent', fontWeight: d.period === 'post-update' ? 600 : 400 }}>
                  <td style={{ padding: '6px 8px' }}>{d.label}{d.period === 'post-update' ? ' (post-update)' : ''}</td>
                  <td style={{ padding: '6px 8px', textAlign: 'right' }}>{d.starts.toLocaleString()}</td>
                  <td style={{ padding: '6px 8px', textAlign: 'right' }}>{d.submitted.toLocaleString()}</td>
                  <td style={{ padding: '6px 8px', textAlign: 'right' }}>{d.starts > 0 ? Math.round(d.submitted / d.starts * 100) : 0}%</td>
                  <td style={{ padding: '6px 8px', textAlign: 'right' }}>{d.waiting.toLocaleString()}</td>
                  <td style={{ padding: '6px 8px', textAlign: 'right', color: d.waiting / d.starts > 0.45 ? TP.red : 'inherit' }}>{d.starts > 0 ? Math.round(d.waiting / d.starts * 100) : 0}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ═══════ SECTION 7: PIPELINE ═══════ */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: 24, marginBottom: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: TP.navy, margin: '0 0 4px' }}>Pipeline snapshot</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #E5E7EB' }}>
                <th style={{ textAlign: 'left', padding: '6px 8px', fontWeight: 600 }}>Month</th>
                <th style={{ textAlign: 'right', padding: '6px 8px', fontWeight: 600 }}>Waiting</th>
                <th style={{ textAlign: 'right', padding: '6px 8px', fontWeight: 600 }}>In Review</th>
                <th style={{ textAlign: 'right', padding: '6px 8px', fontWeight: 600 }}>Checkout</th>
                <th style={{ textAlign: 'right', padding: '6px 8px', fontWeight: 600 }}>Checked Out</th>
                <th style={{ textAlign: 'right', padding: '6px 8px', fontWeight: 600 }}>Closed</th>
                <th style={{ textAlign: 'right', padding: '6px 8px', fontWeight: 600 }}>On Hold</th>
              </tr>
            </thead>
            <tbody>
              {FUNNEL_DATA.map(d => (
                <tr key={d.label} style={{ borderBottom: '1px solid #F3F4F6' }}>
                  <td style={{ padding: '6px 8px', fontWeight: 600 }}>{d.label}</td>
                  <td style={{ padding: '6px 8px', textAlign: 'right', color: TP.amber }}>{d.waiting}</td>
                  <td style={{ padding: '6px 8px', textAlign: 'right', color: TP.purple }}>{d.inReview}</td>
                  <td style={{ padding: '6px 8px', textAlign: 'right', color: TP.blue }}>{d.checkout}</td>
                  <td style={{ padding: '6px 8px', textAlign: 'right', color: TP.green }}>{d.checkedOut}</td>
                  <td style={{ padding: '6px 8px', textAlign: 'right', color: TP.red }}>{d.closed}</td>
                  <td style={{ padding: '6px 8px', textAlign: 'right', color: '#999' }}>{d.onHold}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ═══════ FOOTER: Source ═══════ */}
      <div style={{ fontSize: 11, color: '#9CA3AF', textAlign: 'center', padding: '8px 0' }}>
        Source: Salesforce exports, June 2 2026. Cohort data from &quot;Tracking Conversions&quot; and &quot;Waiting on Info Ratios&quot; exports.
      </div>

    </div>
  );
}
