'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,

  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend);

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
// Source: Salesforce "Waiting on Info Ratios" export, pulled May 29 2026 11:38 PST
// "starts" = Salesforce Person Account creations (assessment starts)
// "waiting" = current WAITING stage (needs info / needs photos) — never finished
// "submitted" = have a Submission Date — completed their assessment
// Major assessment update shipped May 22 — May split into pre/post
const AV_DATA = [
  { label: 'Jan 26', month: 1,  year: 2026, traffic: 37320, starts: 1146, waiting: 108, submitted: 1035, partial: false, period: 'full' as const },
  { label: 'Feb 26', month: 2,  year: 2026, traffic: 51480, starts: 2193, waiting: 888, submitted: 1293, partial: false, period: 'full' as const },
  { label: 'Mar 26', month: 3,  year: 2026, traffic: 39218, starts: 2263, waiting: 967, submitted: 1285, partial: false, period: 'full' as const },
  { label: 'Apr 26', month: 4,  year: 2026, traffic: 30311, starts: 1431, waiting: 569, submitted: 854,  partial: false, period: 'full' as const },
  { label: 'May 1–22', month: 5, year: 2026, traffic: 21819, starts: 1037, waiting: 495, submitted: 540, partial: false, period: 'pre-update' as const },
  { label: 'May 23–29', month: 5,  year: 2026, traffic: 8442,  starts: 403,  waiting: 213,  submitted: 190,  partial: true,  period: 'post-update' as const },
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
  { label: 'May 26', waiting: 708, inReview: 236, checkout: 351, checkedOut: 73,  closed: 61,  onHold: 11 },
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
  { day: 17, starts: 59, waiting: 34, submitted: 25 },
  { day: 18, starts: 48, waiting: 15, submitted: 31 },
  { day: 19, starts: 62, waiting: 33, submitted: 29 },
  { day: 20, starts: 46, waiting: 24, submitted: 22 },
  { day: 21, starts: 41, waiting: 20, submitted: 21 },
  { day: 22, starts: 76, waiting: 47, submitted: 29 },
  { day: 23, starts: 68, waiting: 46, submitted: 22 },
  { day: 24, starts: 41, waiting: 25, submitted: 16 },
  { day: 25, starts: 38, waiting: 18, submitted: 20 },
  { day: 26, starts: 44, waiting: 13, submitted: 31 },
  { day: 27, starts: 83, waiting: 40, submitted: 43 },
  { day: 28, starts: 88, waiting: 44, submitted: 44 },
  { day: 29, starts: 41, waiting: 27, submitted: 14 },
];

// ── Conversion lag + distribution data archived ─────────────────────
// Removed from render — raw data preserved in Salesforce exports if needed

// ── Weekly cohort completion curves (source of truth) ────────────────
// Created-date cohorts: what % completed by day 0, 1, 3, 7
const COHORT_DATA = [
  { label: 'May 1–7',   n: 174, sameDay: 77.0, within1d: 88.5, within3d: 93.7, within7d: 96.0 },
  { label: 'May 8–14',  n: 167, sameDay: 69.5, within1d: 83.2, within3d: 89.2, within7d: 95.8 },
  { label: 'May 15–21', n: 170, sameDay: 70.0, within1d: 80.6, within3d: 91.2, within7d: 95.9 },
  { label: 'May 22–29', n: 219, sameDay: 85.8, within1d: 96.3, within3d: 99.1, within7d: 100.0 },
];

// ── Daily cohorts archived ──────────────────────────────────────────
// Removed from render — daily granularity data in Salesforce exports

// ── Cohort aging comparison (source of truth) ───────────────────────
// Tracks each weekly cohort broken into non-overlapping groups:
//   completed (within 7d + days 8-14 + 15+) | waiting | other
// These add up to starts. "mature" = every person has had that many days.
const COHORT_AGING = [
  { label: 'May 1–7',   starts: 327, within7d: 167, d8to14: 4, d15plus: 3, waiting: 153, daysElapsed: 22, mature7d: true,  mature14d: true,  postUpdate: false },
  { label: 'May 8–14',  starts: 305, within7d: 160, d8to14: 4, d15plus: 3, waiting: 138, daysElapsed: 15, mature7d: true,  mature14d: true,  postUpdate: false },
  { label: 'May 15–21', starts: 329, within7d: 163, d8to14: 7, d15plus: 0, waiting: 157, daysElapsed: 8,  mature7d: true,  mature14d: false, postUpdate: false },
  { label: 'May 22–29', starts: 479, within7d: 219, d8to14: 0, d15plus: 0, waiting: 260, daysElapsed: 0,  mature7d: false, mature14d: false, postUpdate: true  },
];

// ── Post-update tracking ────────────────────────────────────────────
const POST_UPDATE_DAYS_ELAPSED = 7; // May 23-29 = 7 days post-update

function num(v: number): string { return v.toLocaleString(); }

export default function AVDiagnostics() {

  // ── Derived: cohort comparison (the real measure of update impact) ────
  const preCohort = COHORT_DATA.find(c => c.label === 'May 15–21')!;
  const postCohort = COHORT_DATA.find(c => c.label === 'May 22–29')!;

  // Aging cohort data (starts, completions, waiting)
  const postAgingCohort = COHORT_AGING.find(c => c.label === 'May 22–29')!;

  // Pre vs post daily comparison
  const preDays = MAY_DAILY.filter(d => d.day >= 15 && d.day <= 21);
  const postDays = MAY_DAILY.filter(d => d.day >= 23);
  const preAvgStarts = Math.round(preDays.reduce((s, d) => s + d.starts, 0) / preDays.length);
  const postAvgStarts = Math.round(postDays.reduce((s, d) => s + d.starts, 0) / postDays.length);

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

      {/* ═══════ SECTION 1: HERO STAT CARDS ═══════ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 32 }}>

        {/* Same-day completion */}
        <div style={card('#F0FDF4', '#BBF7D0')}>
          <div style={{ ...cardLabel, color: '#166534' }}>Same-day completion</div>
          <div style={{ ...cardNum, color: '#166534' }}>{postCohort.sameDay}%</div>
          <div style={{ ...cardSub, color: '#15803D' }}>
            {arrow(true)} from {preCohort.sameDay}% pre-update
          </div>
          <div style={{ fontSize: 11, color: '#166534', marginTop: 2 }}>
            Of patients who complete, {postCohort.sameDay}% finish same day
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
          Of the patients who completed their assessment, how fast did they finish? Post-update (green) is the fastest cohort this year.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 12, fontSize: 12, color: '#6B7280' }}>
          {COHORT_DATA.map((c, i) => {
            const colors = [TP.skyBlue, TP.purple, TP.amber, TP.green];
            const isPost = c.label === 'May 22–29';
            return (
              <span key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontWeight: isPost ? 700 : 400 }}>
                <span style={{ width: 14, height: 3, background: colors[i], borderRadius: 2 }} />
                {c.label} ({c.n} completed){isPost ? ' — post-update' : ''}
              </span>
            );
          })}
        </div>
        <div style={{ height: 300 }}>
          <Line
            data={{
              labels: ['Same day', 'Within 1 day', 'Within 3 days'],
              datasets: COHORT_DATA.map((c, i) => {
                const colors = [TP.skyBlue, TP.purple, TP.amber, TP.green];
                const isPost = c.label === 'May 22–29';
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
          <div style={{ fontSize: 12, fontWeight: 700, color: '#991B1B', textTransform: 'uppercase', marginBottom: 4 }}>Before update (May 15–21)</div>
          <div style={{ fontSize: 11, color: '#9B1C1C', marginBottom: 10 }}>Speed among patients who completed</div>
          <div style={{ display: 'grid', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
              <span style={{ color: '#6B7280' }}>Same-day completion</span>
              <span style={{ fontWeight: 700, color: '#991B1B' }}>{preCohort.sameDay}%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
              <span style={{ color: '#6B7280' }}>Within 1 day</span>
              <span style={{ fontWeight: 700, color: '#991B1B' }}>{preCohort.within1d}%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
              <span style={{ color: '#6B7280' }}>Within 3 days</span>
              <span style={{ fontWeight: 700, color: '#991B1B' }}>{preCohort.within3d}%</span>
            </div>
            <div style={{ borderTop: '1px solid #FECACA', paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
              <span style={{ color: '#6B7280' }}>Avg starts/day</span>
              <span style={{ fontWeight: 700, color: '#991B1B' }}>{preAvgStarts}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
              <span style={{ color: '#6B7280' }}>Mean lag</span>
              <span style={{ fontWeight: 700, color: '#991B1B' }}>1.0 day</span>
            </div>
          </div>
        </div>

        {/* Post-update */}
        <div style={{ background: '#F0FDF4', borderRadius: 12, padding: 20, border: '1.5px solid #BBF7D0' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#166534', textTransform: 'uppercase', marginBottom: 4 }}>After update (May 23–29)</div>
          <div style={{ fontSize: 11, color: '#15803D', marginBottom: 10 }}>Speed among patients who completed</div>
          <div style={{ display: 'grid', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
              <span style={{ color: '#6B7280' }}>Same-day completion</span>
              <span style={{ fontWeight: 700, color: '#166534' }}>{postCohort.sameDay}% <span style={{ fontSize: 11, color: '#15803D' }}>+{(postCohort.sameDay - preCohort.sameDay).toFixed(0)}pp</span></span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
              <span style={{ color: '#6B7280' }}>Within 1 day</span>
              <span style={{ fontWeight: 700, color: '#166534' }}>{postCohort.within1d}% <span style={{ fontSize: 11, color: '#15803D' }}>+{(postCohort.within1d - preCohort.within1d).toFixed(0)}pp</span></span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
              <span style={{ color: '#6B7280' }}>Within 3 days</span>
              <span style={{ fontWeight: 700, color: '#166534' }}>{postCohort.within3d}% <span style={{ fontSize: 11, color: '#15803D' }}>+{(postCohort.within3d - preCohort.within3d).toFixed(0)}pp</span></span>
            </div>
            <div style={{ borderTop: '1px solid #BBF7D0', paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
              <span style={{ color: '#6B7280' }}>Avg starts/day</span>
              <span style={{ fontWeight: 700, color: '#166534' }}>{postAvgStarts} <span style={{ fontSize: 11, color: '#15803D' }}>{postAvgStarts > preAvgStarts ? '+' : ''}{postAvgStarts - preAvgStarts}</span></span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
              <span style={{ color: '#6B7280' }}>Mean lag</span>
              <span style={{ fontWeight: 700, color: '#166534' }}>0.2 days</span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════ FOOTER: Source ═══════ */}
      <div style={{ fontSize: 11, color: '#9CA3AF', textAlign: 'center', padding: '8px 0' }}>
        Source: Salesforce exports, May 29 2026. Cohort data from &quot;Tracking Conversions&quot; and &quot;Waiting on Info Ratios&quot; exports.
      </div>

    </div>
  );
}
