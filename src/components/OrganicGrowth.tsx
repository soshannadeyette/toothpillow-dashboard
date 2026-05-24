'use client';

import { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, LineElement, PointElement,
  Title, Tooltip, Legend, Filler,
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler, annotationPlugin);

const TP = {
  blue: '#3A6EA4', skyBlue: '#B6CAE3', lightBlue: '#D6E5F7',
  cream: '#FEF8EE', green: '#8CD1C8', yellow: '#FDBE67',
  peach: '#FBCCC5', red: '#DD5759', darkPurple: '#B26CA6',
  lightPurple: '#DDBBD9', bubblegum: '#F6AACB',
  text: '#333333', navy: '#1B2A4A',
};

/* ════════════════════════════════════════════
   HARDCODED GSC DATA — Source of truth
   Data verified from Google Search Console on May 24, 2026
   Property verified ~Feb 2025, 16 months of history available
   Baseline period: Feb 8 2025 through May 18 2026 (all pre-SEO data)
   SEO program reset date: May 19, 2026
   May 2026 monthly/weekly data current through May 21 (GSC ~3-day lag)
   ════════════════════════════════════════════ */

const SEO_START_DATE = '2026-05-19';

const GSC_MONTHLY = [
  { month: '2025-02', clicks: 18183, impressions: 541298, ctr: 3.4, position: 72.4 },
  { month: '2025-03', clicks: 19017, impressions: 867156, ctr: 2.2, position: 72.4 },
  { month: '2025-04', clicks: 13318, impressions: 652511, ctr: 2.0, position: 58.3 },
  { month: '2025-05', clicks: 13745, impressions: 371309, ctr: 3.7, position: 49.9 },
  { month: '2025-06', clicks: 14288, impressions: 231187, ctr: 6.2, position: 33.0 },
  { month: '2025-07', clicks: 23188, impressions: 492401, ctr: 4.7, position: 58.3 },
  { month: '2025-08', clicks: 18593, impressions: 716570, ctr: 2.6, position: 67.4 },
  { month: '2025-09', clicks: 14121, impressions: 173269, ctr: 8.1, position: 34.7 },
  { month: '2025-10', clicks: 13571, impressions: 144474, ctr: 9.4, position: 26.4 },
  { month: '2025-11', clicks: 14362, impressions: 174206, ctr: 8.2, position: 27.9 },
  { month: '2025-12', clicks: 11248, impressions: 188408, ctr: 6.0, position: 32.2 },
  { month: '2026-01', clicks: 11810, impressions: 213760, ctr: 5.5, position: 38.7 },
  { month: '2026-02', clicks: 10579, impressions: 66544, ctr: 15.9, position: 11.9 },
  { month: '2026-03', clicks: 12601, impressions: 74269, ctr: 17.0, position: 18.4 },
  { month: '2026-04', clicks: 11180, impressions: 105758, ctr: 10.6, position: 32.7 },
  { month: '2026-05', clicks: 6160, impressions: 36600, ctr: 16.8, position: 21.7 },
];

const GSC_WEEKLY = [
  { week: '2025-02-03', clicks: 1637, impressions: 44797, ctr: 3.7, position: 72.0 },
  { week: '2025-02-10', clicks: 5956, impressions: 176125, ctr: 3.4, position: 72.2 },
  { week: '2025-02-17', clicks: 6154, impressions: 191592, ctr: 3.2, position: 73.1 },
  { week: '2025-02-24', clicks: 5461, impressions: 187546, ctr: 2.9, position: 72.7 },
  { week: '2025-03-03', clicks: 5028, impressions: 188818, ctr: 2.7, position: 72.1 },
  { week: '2025-03-10', clicks: 4782, impressions: 213712, ctr: 2.2, position: 72.5 },
  { week: '2025-03-17', clicks: 3704, impressions: 206114, ctr: 1.8, position: 72.5 },
  { week: '2025-03-24', clicks: 3868, impressions: 180794, ctr: 2.1, position: 72.2 },
  { week: '2025-03-31', clicks: 3855, impressions: 218626, ctr: 1.8, position: 73.1 },
  { week: '2025-04-07', clicks: 3170, impressions: 178541, ctr: 1.8, position: 65.1 },
  { week: '2025-04-14', clicks: 2861, impressions: 51100, ctr: 5.6, position: 30.3 },
  { week: '2025-04-21', clicks: 2901, impressions: 142691, ctr: 2.0, position: 60.3 },
  { week: '2025-04-28', clicks: 2689, impressions: 180654, ctr: 1.5, position: 71.9 },
  { week: '2025-05-05', clicks: 2344, impressions: 64556, ctr: 3.6, position: 40.1 },
  { week: '2025-05-12', clicks: 3703, impressions: 50779, ctr: 7.3, position: 35.2 },
  { week: '2025-05-19', clicks: 3324, impressions: 101685, ctr: 3.3, position: 61.8 },
  { week: '2025-05-26', clicks: 3144, impressions: 55571, ctr: 5.7, position: 44.6 },
  { week: '2025-06-02', clicks: 3856, impressions: 131190, ctr: 2.9, position: 61.7 },
  { week: '2025-06-09', clicks: 2168, impressions: 32324, ctr: 6.7, position: 28.5 },
  { week: '2025-06-16', clicks: 2015, impressions: 9845, ctr: 20.5, position: 14.0 },
  { week: '2025-06-23', clicks: 5117, impressions: 52749, ctr: 9.7, position: 31.7 },
  { week: '2025-06-30', clicks: 4679, impressions: 119564, ctr: 3.9, position: 66.3 },
  { week: '2025-07-07', clicks: 3284, impressions: 37330, ctr: 8.8, position: 32.7 },
  { week: '2025-07-14', clicks: 2975, impressions: 90646, ctr: 3.3, position: 54.2 },
  { week: '2025-07-21', clicks: 7894, impressions: 151188, ctr: 5.2, position: 69.3 },
  { week: '2025-07-28', clicks: 6863, impressions: 151499, ctr: 4.5, position: 69.7 },
  { week: '2025-08-04', clicks: 5431, impressions: 206323, ctr: 2.6, position: 68.2 },
  { week: '2025-08-11', clicks: 4509, impressions: 217233, ctr: 2.1, position: 68.9 },
  { week: '2025-08-18', clicks: 3543, impressions: 107479, ctr: 3.3, position: 61.2 },
  { week: '2025-08-25', clicks: 3417, impressions: 131361, ctr: 2.6, position: 70.1 },
  { week: '2025-09-01', clicks: 2933, impressions: 43730, ctr: 6.7, position: 37.5 },
  { week: '2025-09-08', clicks: 4671, impressions: 64021, ctr: 7.3, position: 37.6 },
  { week: '2025-09-15', clicks: 2587, impressions: 19747, ctr: 13.1, position: 25.9 },
  { week: '2025-09-22', clicks: 3024, impressions: 38136, ctr: 7.9, position: 39.8 },
  { week: '2025-09-29', clicks: 2827, impressions: 34721, ctr: 8.1, position: 33.0 },
  { week: '2025-10-06', clicks: 2403, impressions: 44166, ctr: 5.4, position: 34.2 },
  { week: '2025-10-13', clicks: 2974, impressions: 17984, ctr: 16.5, position: 14.9 },
  { week: '2025-10-20', clicks: 3864, impressions: 22858, ctr: 16.9, position: 15.3 },
  { week: '2025-10-27', clicks: 3087, impressions: 36143, ctr: 8.5, position: 31.7 },
  { week: '2025-11-03', clicks: 4172, impressions: 48054, ctr: 8.7, position: 32.0 },
  { week: '2025-11-10', clicks: 3364, impressions: 36247, ctr: 9.3, position: 26.8 },
  { week: '2025-11-17', clicks: 3484, impressions: 74179, ctr: 4.7, position: 48.0 },
  { week: '2025-11-24', clicks: 2664, impressions: 11963, ctr: 22.3, position: 8.6 },
  { week: '2025-12-01', clicks: 3055, impressions: 30783, ctr: 9.9, position: 23.3 },
  { week: '2025-12-08', clicks: 2653, impressions: 78257, ctr: 3.4, position: 47.7 },
  { week: '2025-12-15', clicks: 2791, impressions: 28415, ctr: 9.8, position: 24.5 },
  { week: '2025-12-22', clicks: 1685, impressions: 45826, ctr: 3.7, position: 40.2 },
  { week: '2025-12-29', clicks: 2097, impressions: 11897, ctr: 17.6, position: 17.7 },
  { week: '2026-01-05', clicks: 2631, impressions: 48663, ctr: 5.4, position: 39.6 },
  { week: '2026-01-12', clicks: 2865, impressions: 68544, ctr: 4.2, position: 50.3 },
  { week: '2026-01-19', clicks: 2584, impressions: 50283, ctr: 5.1, position: 39.8 },
  { week: '2026-01-26', clicks: 2945, impressions: 40899, ctr: 7.2, position: 32.2 },
  { week: '2026-02-02', clicks: 2615, impressions: 30948, ctr: 8.4, position: 28.9 },
  { week: '2026-02-09', clicks: 2129, impressions: 10691, ctr: 19.9, position: 6.9 },
  { week: '2026-02-16', clicks: 2661, impressions: 12146, ctr: 21.9, position: 6.0 },
  { week: '2026-02-23', clicks: 3148, impressions: 12305, ctr: 25.6, position: 5.4 },
  { week: '2026-03-02', clicks: 2487, impressions: 10128, ctr: 24.6, position: 6.1 },
  { week: '2026-03-09', clicks: 3063, impressions: 10171, ctr: 30.1, position: 5.3 },
  { week: '2026-03-16', clicks: 2701, impressions: 22119, ctr: 12.2, position: 31.4 },
  { week: '2026-03-23', clicks: 3102, impressions: 23036, ctr: 13.5, position: 28.1 },
  { week: '2026-03-30', clicks: 2431, impressions: 24948, ctr: 9.7, position: 38.6 },
  { week: '2026-04-06', clicks: 3007, impressions: 25909, ctr: 11.6, position: 32.7 },
  { week: '2026-04-13', clicks: 2537, impressions: 21018, ctr: 12.1, position: 25.7 },
  { week: '2026-04-20', clicks: 2142, impressions: 20811, ctr: 10.3, position: 30.8 },
  { week: '2026-04-27', clicks: 2848, impressions: 24374, ctr: 11.7, position: 25.3 },
  { week: '2026-05-04', clicks: 1951, impressions: 16762, ctr: 11.6, position: 23.0 },
  { week: '2026-05-11', clicks: 2082, impressions: 10234, ctr: 20.3, position: 11.3 },
  { week: '2026-05-18', clicks: 1365, impressions: 6129, ctr: 22.3, position: 11.6 },
];

// Daily GSC data — May 2026 (through May 21; GSC has ~3-day lag)
// Source: Google Search Console, verified May 24, 2026
const GSC_DAILY_MAY_2026: Record<number, { clicks: number; impressions: number }> = {
  1: { clicks: 339, impressions: 1522 },
  2: { clicks: 218, impressions: 1003 },
  3: { clicks: 202, impressions: 907 },
  4: { clicks: 299, impressions: 2293 },
  5: { clicks: 317, impressions: 3915 },
  6: { clicks: 343, impressions: 5614 },
  7: { clicks: 322, impressions: 1831 },
  8: { clicks: 305, impressions: 1259 },
  9: { clicks: 186, impressions: 877 },
  10: { clicks: 179, impressions: 973 },
  11: { clicks: 340, impressions: 1455 },
  12: { clicks: 389, impressions: 1397 },
  13: { clicks: 342, impressions: 1367 },
  14: { clicks: 373, impressions: 3003 },
  15: { clicks: 262, impressions: 1250 },
  16: { clicks: 176, impressions: 900 },
  17: { clicks: 203, impressions: 905 },
  18: { clicks: 311, impressions: 1339 },
  19: { clicks: 337, impressions: 1358 },
  20: { clicks: 330, impressions: 1551 },
  21: { clicks: 387, impressions: 1881 },
};

/* ════════════════════════════════════════════
   KEYWORD MOVERS — Non-branded keywords showing movement
   GSC comparison: Apr 24–May 21, 2026 vs Feb 22–Apr 23, 2026
   Monthly position history verified per-keyword from GSC DAYS breakdown.
   Excludes all branded variations (toothpillow, tooth pillow, etc.)
   1,236 non-branded keywords tracked
   ════════════════════════════════════════════ */

// Position climbers with monthly position history from GSC
// posHistory: monthly average position (from GSC DAYS breakdown, verified May 23 2026)
// startedClimbing: first month position improved meaningfully and sustained
const KEYWORD_CLIMBERS = [
  { query: 'mouth breathing', posNow: 48.0, posPrev: 69.4, change: -21.4, imprNow: 14,
    startedClimbing: 'Dec 2025', posHistory: [89,92,82,82,92,93,89,89,84,86,74,79,57,75,61,40] },
  { query: 'tongue tie near me', posNow: 42.1, posPrev: 65.0, change: -22.9, imprNow: 21,
    startedClimbing: 'May 2026', posHistory: [null,null,null,68,null,90,null,null,80,78,84,null,null,null,50,41] },
  { query: 'tongue tie removal near me', posNow: 38.1, posPrev: 51.5, change: -13.4, imprNow: 83,
    startedClimbing: 'Jan 2026', posHistory: [93,null,null,null,null,null,null,null,68,82,83,63,61,52,47,42] },
  { query: 'myofunctional therapist near me', posNow: 41.9, posPrev: 62.5, change: -20.6, imprNow: 9,
    startedClimbing: 'Feb 2026', posHistory: [70,70,67,91,98,82,76,70,60,72,95,76,46,63,39,43] },
  { query: 'airway dentists', posNow: 25.3, posPrev: 58.3, change: -33.0, imprNow: 6,
    startedClimbing: 'Oct 2025', posHistory: [82,62,57,56,54,57,63,null,38,37,56,68,null,73,52,16] },
  { query: 'orthodontic evaluation near me', posNow: 45.8, posPrev: 59.3, change: -13.5, imprNow: 91,
    startedClimbing: 'Mar 2026', posHistory: [44,48,52,82,84,73,71,88,84,90,87,85,69,62,55,44] },
  { query: 'child sleep apnea solution near me', posNow: 22.0, posPrev: 65.9, change: -43.9, imprNow: 9,
    startedClimbing: 'May 2026', posHistory: null },
  { query: 'orthodontist for children', posNow: 43.0, posPrev: 54.8, change: -11.8, imprNow: 34,
    startedClimbing: 'May 2026', posHistory: null },
  { query: "children's orthodontic braces", posNow: 56.8, posPrev: 79.6, change: -22.8, imprNow: 23,
    startedClimbing: 'May 2026', posHistory: null },
  { query: 'sleep dentistry near me', posNow: 51.8, posPrev: 68.7, change: -16.9, imprNow: 36,
    startedClimbing: 'May 2026', posHistory: null },
  { query: "kid's dentist near me", posNow: 55.8, posPrev: 71.5, change: -15.7, imprNow: 115,
    startedClimbing: 'May 2026', posHistory: null },
  { query: 'kids dental', posNow: 53.7, posPrev: 67.4, change: -13.7, imprNow: 96,
    startedClimbing: 'May 2026', posHistory: null },
  { query: 'oral appliance therapy', posNow: 64.5, posPrev: 75.8, change: -11.3, imprNow: 125,
    startedClimbing: 'May 2026', posHistory: null },
  { query: 'lip tie dentist near me', posNow: 52.2, posPrev: 63.8, change: -11.7, imprNow: 22,
    startedClimbing: 'May 2026', posHistory: null },
];
// posHistory is 16 values: Feb'25..May'26 monthly avg position, null = no data that month

// Non-branded keywords already driving clicks (page 1 performers)
// These are the proof points — keywords that crossed the threshold into actual traffic
const CLICK_DRIVING_KEYWORDS = [
  { query: 'pillow for mouth breathers', posNow: 11.5, clicksNow: 4, imprNow: 61,
    status: 'Page 1 since Feb 2025', posHistory: [6,6,4,3,4,5,4,17,14,11,9,8,8,11,10,7] },
  { query: 'myo munchee alternative', posNow: 1.0, clicksNow: 2, imprNow: 4,
    status: 'Page 1 since Feb 2025', posHistory: null },
  { query: 'mouth guard for mouth breathing kids', posNow: 3.6, clicksNow: 2, imprNow: 7,
    status: 'New May 2026', posHistory: null },
  { query: 'sleep apnea pillow for kids', posNow: 9.3, clicksNow: 2, imprNow: 6,
    status: 'New May 2026', posHistory: null },
];

// Online Search submissions from Referrer tab (Salesforce "Online Search" referrer type)
// These represent actual assessment submissions that came through organic search
const ONLINE_SEARCH_SUBMISSIONS: Record<string, number> = {
  '2023-01': 31, '2023-02': 22, '2023-03': 32, '2023-04': 29, '2023-05': 22, '2023-06': 22,
  '2023-07': 40, '2023-08': 45, '2023-09': 41, '2023-10': 47, '2023-11': 59, '2023-12': 37,
  '2024-01': 42, '2024-02': 45, '2024-03': 56, '2024-04': 62, '2024-05': 60, '2024-06': 52,
  '2024-07': 100, '2024-08': 101, '2024-09': 84, '2024-10': 79, '2024-11': 90, '2024-12': 71,
  '2025-01': 113, '2025-02': 124, '2025-03': 131, '2025-04': 125, '2025-05': 88, '2025-06': 57,
  '2025-07': 146, '2025-08': 155, '2025-09': 108, '2025-10': 110, '2025-11': 122, '2025-12': 82,
  '2026-01': 122, '2026-02': 166, '2026-03': 131, '2026-04': 145, '2026-05': 174,
};

/* ════════════════════════════════════════════
   QUARTERLY AGGREGATION
   ════════════════════════════════════════════ */

interface QuarterData {
  label: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  months: number;
  onlineSearchSubs: number;
}

function computeQuarters(): QuarterData[] {
  const qMap: Record<string, { clicks: number; impressions: number; positions: number[]; ctrs: number[]; months: number; subs: number }> = {};
  const qOrder = ['Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025', 'Q1 2026', 'Q2 2026'];

  for (const m of GSC_MONTHLY) {
    const [y, mo] = m.month.split('-').map(Number);
    const qNum = Math.ceil(mo / 3);
    const label = `Q${qNum} ${y}`;
    if (!qMap[label]) qMap[label] = { clicks: 0, impressions: 0, positions: [], ctrs: [], months: 0, subs: 0 };
    qMap[label].clicks += m.clicks;
    qMap[label].impressions += m.impressions;
    qMap[label].positions.push(m.position);
    qMap[label].ctrs.push(m.ctr);
    qMap[label].months += 1;
    const subKey = m.month;
    if (ONLINE_SEARCH_SUBMISSIONS[subKey]) qMap[label].subs += ONLINE_SEARCH_SUBMISSIONS[subKey];
  }

  return qOrder.filter(q => qMap[q]).map(q => {
    const d = qMap[q];
    return {
      label: q,
      clicks: d.clicks,
      impressions: d.impressions,
      ctr: parseFloat((d.ctrs.reduce((a, b) => a + b, 0) / d.ctrs.length).toFixed(1)),
      position: parseFloat((d.positions.reduce((a, b) => a + b, 0) / d.positions.length).toFixed(1)),
      months: d.months,
      onlineSearchSubs: d.subs,
    };
  });
}

/* ════════════════════════════════════════════
   HELPERS
   ════════════════════════════════════════════ */

function fmtK(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toLocaleString();
}

function monthLabel(m: string): string {
  const [y, mo] = m.split('-');
  const names = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${names[parseInt(mo)]} '${y.slice(2)}`;
}

function weekLabel(w: string): string {
  const d = new Date(w + 'T00:00:00');
  const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${names[d.getMonth()]} ${d.getDate()}`;
}

function delta(current: number, previous: number): string {
  const pct = ((current - previous) / previous * 100);
  const sign = pct >= 0 ? '+' : '';
  return `${sign}${pct.toFixed(0)}%`;
}

function TrendCard({ label, current, previous, unit, reverse, sub }: {
  label: string; current: number; previous: number; unit?: string; reverse?: boolean; sub?: string;
}) {
  const improved = reverse ? current < previous : current > previous;
  const changeVal = reverse
    ? ((previous - current) / previous * 100).toFixed(0)
    : ((current - previous) / previous * 100).toFixed(0);
  const arrow = improved ? '▲' : '▼';
  const color = improved ? TP.green : TP.red;
  const displayVal = unit === '%' ? `${current}%` : unit === 'pos' ? current.toFixed(1) : fmtK(current);

  return (
    <div style={{ background: '#fff', borderRadius: 10, padding: '16px 18px', border: '1px solid #e5e7eb', flex: '1 1 0', minWidth: 155 }}>
      <div style={{ fontSize: 11, color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: TP.navy }}>{displayVal}</div>
      <div style={{ fontSize: 12, color, fontWeight: 600, marginTop: 4 }}>
        {arrow} {Math.abs(Number(changeVal))}% {improved ? 'improvement' : 'decline'}
      </div>
      {sub && <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

/* ════════════════════════════════════════════
   COMPONENT
   ════════════════════════════════════════════ */

export default function OrganicGrowth() {
  const quarters = useMemo(() => computeQuarters(), []);
  const firstQ = quarters[0];
  const latestFullQ = quarters[quarters.length - 2]; // Q1 2026
  const currentQ = quarters[quarters.length - 1]; // Q2 2026 (partial)

  const mayPartial = GSC_MONTHLY[GSC_MONTHLY.length - 1];
  const mayDays = 21;

  // Monthly CTR trend chart
  const ctrChartData = useMemo(() => ({
    labels: GSC_MONTHLY.map(m => monthLabel(m.month)),
    datasets: [{
      label: 'Monthly CTR',
      data: GSC_MONTHLY.map(m => m.ctr),
      borderColor: TP.green,
      backgroundColor: `${TP.green}20`,
      pointRadius: 5,
      pointBackgroundColor: GSC_MONTHLY.map(m => TP.green),
      borderWidth: 2.5,
      tension: 0.3,
      fill: true,
    }],
  }), []);

  // SEO marker index
  const seoMarkerIndex = GSC_MONTHLY.findIndex(m => m.month === '2026-05') - 0.5;

  const ctrChartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (ctx: { parsed: { y: number } }) => `CTR: ${ctx.parsed.y}%` } },
      annotation: {
        annotations: {
          seoLine: { type: 'line' as const, xMin: seoMarkerIndex, xMax: seoMarkerIndex, borderColor: TP.red, borderWidth: 2, borderDash: [6, 4] },
          startLabel: {
            type: 'label' as const, xValue: 0, yValue: GSC_MONTHLY[0].ctr,
            content: [`${GSC_MONTHLY[0].ctr}%`], font: { size: 11, weight: 'bold' as const }, color: TP.navy,
            position: { x: 'start' as const, y: 'start' as const },
          },
          endLabel: {
            type: 'label' as const, xValue: GSC_MONTHLY.length - 1, yValue: mayPartial.ctr,
            content: [`${mayPartial.ctr}%`], font: { size: 11, weight: 'bold' as const }, color: TP.navy,
            position: { x: 'end' as const, y: 'start' as const },
          },
        },
      },
    },
    scales: {
      y: { beginAtZero: true, ticks: { callback: (v: number | string) => `${v}%` }, grid: { color: '#f0f0f0' } },
      x: { grid: { display: false } },
    },
  }), [seoMarkerIndex, mayPartial.ctr]);

  // Position trend (inverted)
  const positionChartData = useMemo(() => ({
    labels: GSC_MONTHLY.map(m => monthLabel(m.month)),
    datasets: [{
      label: 'Avg Position',
      data: GSC_MONTHLY.map(m => m.position),
      borderColor: TP.darkPurple,
      backgroundColor: `${TP.darkPurple}20`,
      pointRadius: 5,
      pointBackgroundColor: TP.darkPurple,
      borderWidth: 2.5,
      tension: 0.3,
      fill: true,
    }],
  }), []);

  const positionChartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (ctx: { parsed: { y: number } }) => `Position: ${ctx.parsed.y.toFixed(1)}` } },
      annotation: {
        annotations: {
          seoLine: { type: 'line' as const, xMin: seoMarkerIndex, xMax: seoMarkerIndex, borderColor: TP.red, borderWidth: 2, borderDash: [6, 4] },
        },
      },
    },
    scales: {
      y: { reverse: true, title: { display: true, text: 'Position (lower = better)', font: { size: 11 } }, grid: { color: '#f0f0f0' } },
      x: { grid: { display: false } },
    },
  }), [seoMarkerIndex]);

  // Monthly clicks + impressions
  const monthlyChartData = useMemo(() => ({
    labels: GSC_MONTHLY.map(m => monthLabel(m.month)),
    datasets: [
      { label: 'Clicks', data: GSC_MONTHLY.map(m => m.clicks), backgroundColor: TP.blue, borderColor: TP.blue, borderWidth: 1, borderRadius: 4, yAxisID: 'y', order: 2 },
      { label: 'Impressions', data: GSC_MONTHLY.map(m => m.impressions), type: 'line' as const, borderColor: TP.darkPurple, backgroundColor: `${TP.darkPurple}15`, pointRadius: 3, pointBackgroundColor: TP.darkPurple, borderWidth: 2, tension: 0.3, fill: true, yAxisID: 'y1', order: 1 },
    ],
  }), []);

  const monthlyChartOptions = useMemo(() => ({
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const, labels: { usePointStyle: true, boxWidth: 8, padding: 16, font: { size: 11 } } },
      tooltip: { callbacks: { label: (ctx: { datasetIndex: number; parsed: { y: number } }) => ctx.datasetIndex === 1 ? `${ctx.parsed.y.toLocaleString()} impressions` : `${ctx.parsed.y.toLocaleString()} clicks` } },
      annotation: { annotations: { seoLine: { type: 'line' as const, xMin: seoMarkerIndex, xMax: seoMarkerIndex, borderColor: TP.red, borderWidth: 2, borderDash: [6, 4], label: { display: true, content: 'SEO Reset', position: 'start' as const, backgroundColor: TP.red, color: '#fff', font: { size: 10, weight: 'bold' as const }, padding: 4 } } } },
    },
    scales: {
      y: { beginAtZero: true, position: 'left' as const, title: { display: true, text: 'Clicks', font: { size: 11 } }, ticks: { callback: (v: number | string) => fmtK(Number(v)) }, grid: { color: '#f0f0f0' } },
      y1: { beginAtZero: true, position: 'right' as const, title: { display: true, text: 'Impressions', font: { size: 11 } }, ticks: { callback: (v: number | string) => fmtK(Number(v)) }, grid: { display: false } },
      x: { grid: { display: false } },
    },
  }), [seoMarkerIndex]);

  // Weekly clicks + CTR
  const weeklyChartData = useMemo(() => ({
    labels: GSC_WEEKLY.map(w => weekLabel(w.week)),
    datasets: [
      { label: 'Weekly Clicks', data: GSC_WEEKLY.map(w => w.clicks), type: 'bar' as const, backgroundColor: `${TP.blue}99`, borderRadius: 3, yAxisID: 'y', order: 2 },
      { label: 'CTR %', data: GSC_WEEKLY.map(w => w.ctr), type: 'line' as const, borderColor: TP.yellow, backgroundColor: 'transparent', pointRadius: 0, borderWidth: 2, tension: 0.3, yAxisID: 'y1', order: 1 },
    ],
  }), []);

  const weeklyChartOptions = useMemo(() => ({
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const, labels: { usePointStyle: true, boxWidth: 8, padding: 16, font: { size: 11 } } },
      annotation: { annotations: { seoLine: { type: 'line' as const, xMin: GSC_WEEKLY.length - 1.5, xMax: GSC_WEEKLY.length - 1.5, borderColor: TP.red, borderWidth: 2, borderDash: [6, 4] } } },
    },
    scales: {
      y: { beginAtZero: true, position: 'left' as const, title: { display: true, text: 'Clicks', font: { size: 11 } }, ticks: { callback: (v: number | string) => fmtK(Number(v)) }, grid: { color: '#f0f0f0' } },
      y1: { beginAtZero: true, position: 'right' as const, title: { display: true, text: 'CTR %', font: { size: 11 } }, ticks: { callback: (v: number | string) => `${v}%` }, grid: { display: false } },
      x: { grid: { display: false }, ticks: { maxRotation: 45, autoSkip: true, maxTicksLimit: 20, font: { size: 9 } } },
    },
  }), []);

  // Daily GSC chart (May 2026)
  const dailyDays = Object.keys(GSC_DAILY_MAY_2026).map(Number).sort((a, b) => a - b);
  const dailyChartData = useMemo(() => ({
    labels: dailyDays.map(d => `May ${d}`),
    datasets: [
      { label: 'Clicks', data: dailyDays.map(d => GSC_DAILY_MAY_2026[d].clicks), type: 'bar' as const, backgroundColor: `${TP.blue}99`, borderRadius: 3, yAxisID: 'y', order: 2 },
      { label: 'Impressions', data: dailyDays.map(d => GSC_DAILY_MAY_2026[d].impressions), type: 'line' as const, borderColor: TP.yellow, backgroundColor: 'transparent', pointRadius: 2, borderWidth: 2, tension: 0.3, yAxisID: 'y1', order: 1 },
    ],
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), []);
  const dailyChartOptions = useMemo(() => ({
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const, labels: { usePointStyle: true, boxWidth: 8, padding: 16, font: { size: 11 } } },
      annotation: { annotations: { seoLine: { type: 'line' as const, xMin: 17.5, xMax: 17.5, borderColor: TP.red, borderWidth: 2, borderDash: [6, 4], label: { display: true, content: 'SEO Launch', position: 'start' as const, font: { size: 9 }, color: TP.red } } } },
    },
    scales: {
      y: { beginAtZero: true, position: 'left' as const, title: { display: true, text: 'Clicks', font: { size: 11 } }, grid: { color: '#f0f0f0' } },
      y1: { beginAtZero: true, position: 'right' as const, title: { display: true, text: 'Impressions', font: { size: 11 } }, ticks: { callback: (v: number | string) => fmtK(Number(v)) }, grid: { display: false } },
      x: { grid: { display: false }, ticks: { font: { size: 9 } } },
    },
  }), []);

  // Online Search submissions chart
  const subMonths = Object.keys(ONLINE_SEARCH_SUBMISSIONS).sort();
  const onlineSearchChartData = useMemo(() => ({
    labels: subMonths.map(m => monthLabel(m)),
    datasets: [{
      label: 'Online Search Submissions',
      data: subMonths.map(m => ONLINE_SEARCH_SUBMISSIONS[m]),
      backgroundColor: subMonths.map(m => m >= '2026' ? TP.blue : `${TP.blue}66`),
      borderColor: TP.blue,
      borderWidth: 1,
      borderRadius: 4,
    }],
  }), [subMonths]);

  const onlineSearchChartOptions = useMemo(() => ({
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (ctx: { parsed: { y: number } }) => `${ctx.parsed.y} submissions from organic search` } },
    },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: 'Submissions', font: { size: 11 } }, grid: { color: '#f0f0f0' } },
      x: { grid: { display: false }, ticks: { maxRotation: 45, font: { size: 9 } } },
    },
  }), []);

  // Compute YoY submission comparison
  const sub2024Total = Object.entries(ONLINE_SEARCH_SUBMISSIONS).filter(([k]) => k.startsWith('2024')).reduce((s, [, v]) => s + v, 0);
  const sub2025Total = Object.entries(ONLINE_SEARCH_SUBMISSIONS).filter(([k]) => k.startsWith('2025')).reduce((s, [, v]) => s + v, 0);
  const sub2026YTD = Object.entries(ONLINE_SEARCH_SUBMISSIONS).filter(([k]) => k.startsWith('2026')).reduce((s, [, v]) => s + v, 0);
  const sub2025SamePeriod = Object.entries(ONLINE_SEARCH_SUBMISSIONS).filter(([k]) => k >= '2025-01' && k <= '2025-05').reduce((s, [, v]) => s + v, 0);
  const may2026Projected = Math.round(174 / 23 * 31);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: TP.navy, marginBottom: 4 }}>Organic Search Growth</h2>
        <p style={{ fontSize: 13, color: '#888' }}>
          Google Search Console data from Feb 2025 to present. Formal SEO program launched May 19, 2026.
        </p>
      </div>

      {/* ═══════ SECTION 1: THEN vs NOW ═══════ */}
      <div style={{
        background: `linear-gradient(135deg, ${TP.navy} 0%, ${TP.blue} 100%)`,
        borderRadius: 12, padding: '20px 24px', color: '#fff',
      }}>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
          Search Performance: Then vs. Now
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 16, alignItems: 'center' }}>
          {/* Then */}
          <div>
            <div style={{ fontSize: 11, opacity: 0.6, marginBottom: 8, fontWeight: 600 }}>FEB–MAR 2025 (First Data)</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div><div style={{ fontSize: 10, opacity: 0.5 }}>Avg Position</div><div style={{ fontSize: 22, fontWeight: 700 }}>72.4</div><div style={{ fontSize: 10, opacity: 0.5 }}>Page 7–8</div></div>
              <div><div style={{ fontSize: 10, opacity: 0.5 }}>CTR</div><div style={{ fontSize: 22, fontWeight: 700 }}>2.8%</div></div>
              <div><div style={{ fontSize: 10, opacity: 0.5 }}>Clicks/mo</div><div style={{ fontSize: 22, fontWeight: 700 }}>18.6K</div></div>
              <div><div style={{ fontSize: 10, opacity: 0.5 }}>Search Subs/mo</div><div style={{ fontSize: 22, fontWeight: 700 }}>{Math.round((ONLINE_SEARCH_SUBMISSIONS['2025-02'] + ONLINE_SEARCH_SUBMISSIONS['2025-03']) / 2)}</div></div>
            </div>
          </div>
          {/* Arrow */}
          <div style={{ fontSize: 32, opacity: 0.4 }}>→</div>
          {/* Now */}
          <div>
            <div style={{ fontSize: 11, opacity: 0.6, marginBottom: 8, fontWeight: 600 }}>MAY 2026 (21 DAYS)</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div><div style={{ fontSize: 10, opacity: 0.5 }}>Avg Position</div><div style={{ fontSize: 22, fontWeight: 700, color: TP.green }}>21.7</div><div style={{ fontSize: 10, opacity: 0.5 }}>Page 2–3</div></div>
              <div><div style={{ fontSize: 10, opacity: 0.5 }}>CTR</div><div style={{ fontSize: 22, fontWeight: 700, color: TP.green }}>16.8%</div></div>
              <div><div style={{ fontSize: 10, opacity: 0.5 }}>Clicks/mo (pace)</div><div style={{ fontSize: 22, fontWeight: 700 }}>{fmtK(Math.round(mayPartial.clicks / mayDays * 31))}</div></div>
              <div><div style={{ fontSize: 10, opacity: 0.5 }}>Search Subs/mo (pace)</div><div style={{ fontSize: 22, fontWeight: 700, color: TP.green }}>{may2026Projected}</div></div>
            </div>
          </div>
        </div>
        {/* Delta summary */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', marginTop: 16, paddingTop: 12, display: 'flex', gap: 32, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: TP.green }}>▲ 70%</span>
            <span style={{ fontSize: 12, opacity: 0.7 }}>position improvement (72.4 → 21.7)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: TP.green }}>▲ 500%</span>
            <span style={{ fontSize: 12, opacity: 0.7 }}>CTR improvement (2.8% → 16.8%)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: TP.green }}>▲ {Math.round((may2026Projected - 128) / 128 * 100)}%</span>
            <span style={{ fontSize: 12, opacity: 0.7 }}>more search submissions/mo</span>
          </div>
        </div>
      </div>

      {/* ═══════ SECTION 2: QUARTERLY TREND TABLE ═══════ */}
      <div style={{ background: '#fff', borderRadius: 10, padding: 20, border: '1px solid #e5e7eb' }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: TP.navy, marginBottom: 12 }}>Quarterly Trend</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${TP.blue}` }}>
                <th style={{ padding: '8px 10px', textAlign: 'left', color: TP.navy }}>Quarter</th>
                <th style={{ padding: '8px 10px', textAlign: 'right', color: TP.navy }}>Clicks</th>
                <th style={{ padding: '8px 10px', textAlign: 'right', color: TP.navy }}>Impressions</th>
                <th style={{ padding: '8px 10px', textAlign: 'right', color: TP.navy }}>Avg CTR</th>
                <th style={{ padding: '8px 10px', textAlign: 'right', color: TP.navy }}>Avg Position</th>
                <th style={{ padding: '8px 10px', textAlign: 'right', color: TP.navy }}>Search Subs</th>
              </tr>
            </thead>
            <tbody>
              {quarters.map((q, i) => {
                const prev = i > 0 ? quarters[i - 1] : null;
                const isPartial = q.label === 'Q2 2026';
                return (
                  <tr key={q.label} style={{ borderBottom: '1px solid #f0f0f0', background: isPartial ? '#f8f9ff' : i % 2 === 0 ? '#fafafa' : '#fff' }}>
                    <td style={{ padding: '8px 10px', fontWeight: 600 }}>
                      {q.label}{isPartial ? ` (${q.months}mo MTD)` : ''}
                    </td>
                    <td style={{ padding: '8px 10px', textAlign: 'right' }}>
                      {fmtK(q.clicks)}
                      {prev && <span style={{ fontSize: 10, color: q.clicks > prev.clicks ? TP.green : TP.red, marginLeft: 6 }}>{delta(q.clicks, prev.clicks)}</span>}
                    </td>
                    <td style={{ padding: '8px 10px', textAlign: 'right' }}>{fmtK(q.impressions)}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600, color: q.ctr >= 10 ? TP.green : q.ctr >= 5 ? TP.yellow : TP.text }}>
                      {q.ctr}%
                      {prev && <span style={{ fontSize: 10, color: q.ctr > prev.ctr ? TP.green : TP.red, marginLeft: 6 }}>{delta(q.ctr, prev.ctr)}</span>}
                    </td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600, color: q.position <= 20 ? TP.green : q.position <= 40 ? TP.yellow : TP.red }}>
                      {q.position}
                      {prev && <span style={{ fontSize: 10, color: q.position < prev.position ? TP.green : TP.red, marginLeft: 6 }}>{q.position < prev.position ? '▲' : '▼'}{Math.abs(Math.round((prev.position - q.position) / prev.position * 100))}%</span>}
                    </td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600 }}>
                      {q.onlineSearchSubs}
                      {prev && prev.onlineSearchSubs > 0 && <span style={{ fontSize: 10, color: q.onlineSearchSubs > prev.onlineSearchSubs ? TP.green : TP.red, marginLeft: 6 }}>{delta(q.onlineSearchSubs, prev.onlineSearchSubs)}</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ═══════ SECTION 3: CTR TREND ═══════ */}
      <div style={{ background: '#fff', borderRadius: 10, padding: 20, border: '1px solid #e5e7eb' }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: TP.navy, marginBottom: 4 }}>Click-Through Rate Trend</h3>
        <p style={{ fontSize: 12, color: '#888', marginBottom: 12 }}>Higher CTR means searchers are finding our results more relevant and clicking through more often.</p>
        <div style={{ height: 280 }}>
          <Line data={ctrChartData} options={ctrChartOptions as object} />
        </div>
      </div>

      {/* ═══════ SECTION 4: POSITION TREND ═══════ */}
      <div style={{ background: '#fff', borderRadius: 10, padding: 20, border: '1px solid #e5e7eb' }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: TP.navy, marginBottom: 4 }}>Average Search Position</h3>
        <p style={{ fontSize: 12, color: '#888', marginBottom: 12 }}>Position 1–10 = page 1 of Google. We moved from page 7+ to page 2.</p>
        <div style={{ height: 280 }}>
          <Line data={positionChartData} options={positionChartOptions as object} />
        </div>
      </div>

      {/* ═══════ SECTION 5: ONLINE SEARCH SUBMISSIONS ═══════ */}
      <div style={{ background: '#fff', borderRadius: 10, padding: 20, border: '1px solid #e5e7eb' }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: TP.navy, marginBottom: 4 }}>Online Search → Assessment Submissions</h3>
        <p style={{ fontSize: 12, color: '#888', marginBottom: 12 }}>Actual submissions where the family found us through organic search (Salesforce "Online Search" referrer).</p>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          <div style={{ background: '#f0f9ff', borderRadius: 8, padding: '10px 14px', border: '1px solid #bae6fd', flex: '1 1 0', minWidth: 130 }}>
            <div style={{ fontSize: 11, color: '#666' }}>2024 Full Year</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: TP.navy }}>{sub2024Total}</div>
            <div style={{ fontSize: 11, color: '#999' }}>{Math.round(sub2024Total / 12)}/mo avg</div>
          </div>
          <div style={{ background: '#f0f9ff', borderRadius: 8, padding: '10px 14px', border: '1px solid #bae6fd', flex: '1 1 0', minWidth: 130 }}>
            <div style={{ fontSize: 11, color: '#666' }}>2025 Full Year</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: TP.navy }}>{sub2025Total}</div>
            <div style={{ fontSize: 11, color: TP.green, fontWeight: 600 }}>▲ {Math.round((sub2025Total - sub2024Total) / sub2024Total * 100)}% vs 2024</div>
          </div>
          <div style={{ background: '#f0fdf4', borderRadius: 8, padding: '10px 14px', border: `1px solid ${TP.green}60`, flex: '1 1 0', minWidth: 130 }}>
            <div style={{ fontSize: 11, color: '#666' }}>2026 YTD (Jan–May)</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: TP.navy }}>{sub2026YTD}</div>
            <div style={{ fontSize: 11, color: TP.green, fontWeight: 600 }}>▲ {Math.round((sub2026YTD - sub2025SamePeriod) / sub2025SamePeriod * 100)}% vs same period 2025</div>
          </div>
          <div style={{ background: '#f0fdf4', borderRadius: 8, padding: '10px 14px', border: `1px solid ${TP.green}60`, flex: '1 1 0', minWidth: 130 }}>
            <div style={{ fontSize: 11, color: '#666' }}>May 2026 Pace</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: TP.green }}>{may2026Projected}/mo</div>
            <div style={{ fontSize: 11, color: '#999' }}>174 through day 23</div>
          </div>
        </div>
        <div style={{ height: 260 }}>
          <Bar data={onlineSearchChartData} options={onlineSearchChartOptions as object} />
        </div>
      </div>

      {/* ═══════ SECTION 6: MONTHLY CLICKS + IMPRESSIONS ═══════ */}
      <div style={{ background: '#fff', borderRadius: 10, padding: 20, border: '1px solid #e5e7eb' }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: TP.navy, marginBottom: 4 }}>Monthly Organic Clicks and Impressions</h3>
        <p style={{ fontSize: 12, color: '#888', marginBottom: 12 }}>Impressions dropped as position improved — fewer irrelevant searches, more relevant ones. Clicks per impression (CTR) increased 5x.</p>
        <div style={{ height: 320 }}>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <Bar data={monthlyChartData as any} options={monthlyChartOptions as any} />
        </div>
      </div>

      {/* ═══════ SECTION 7: WEEKLY DETAIL ═══════ */}
      <div style={{ background: '#fff', borderRadius: 10, padding: 20, border: '1px solid #e5e7eb' }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: TP.navy, marginBottom: 12 }}>Weekly Clicks and CTR</h3>
        <div style={{ height: 320 }}>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <Bar data={weeklyChartData as any} options={weeklyChartOptions as any} />
        </div>
      </div>

      {/* ═══════ SECTION 7B: DAILY GSC — MAY 2026 ═══════ */}
      <div style={{ background: '#fff', borderRadius: 10, padding: 20, border: '1px solid #e5e7eb' }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: TP.navy, marginBottom: 4 }}>Daily Search Performance — May 2026</h3>
        <p style={{ fontSize: 12, color: '#888', marginBottom: 12 }}>Day-by-day clicks and impressions from Google Search Console. Red dashed line marks SEO program launch (May 19). Data through May 21 (GSC has a ~3-day processing delay).</p>
        <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
          <div style={{ background: '#f0f9ff', borderRadius: 8, padding: '8px 14px', border: '1px solid #bae6fd', fontSize: 12 }}>
            <span style={{ color: '#888' }}>Avg Daily Clicks:</span>{' '}
            <span style={{ fontWeight: 700, color: TP.navy }}>{Math.round(dailyDays.reduce((s, d) => s + GSC_DAILY_MAY_2026[d].clicks, 0) / dailyDays.length)}</span>
          </div>
          <div style={{ background: '#f0f9ff', borderRadius: 8, padding: '8px 14px', border: '1px solid #bae6fd', fontSize: 12 }}>
            <span style={{ color: '#888' }}>Best Day:</span>{' '}
            <span style={{ fontWeight: 700, color: TP.navy }}>May {dailyDays.reduce((best, d) => GSC_DAILY_MAY_2026[d].clicks > GSC_DAILY_MAY_2026[best].clicks ? d : best, dailyDays[0])} ({Math.max(...dailyDays.map(d => GSC_DAILY_MAY_2026[d].clicks))} clicks)</span>
          </div>
          <div style={{ background: '#f0fdf4', borderRadius: 8, padding: '8px 14px', border: `1px solid ${TP.green}50`, fontSize: 12 }}>
            <span style={{ color: '#888' }}>Post-SEO Avg (May 19–21):</span>{' '}
            <span style={{ fontWeight: 700, color: TP.green }}>{Math.round(([19,20,21].reduce((s, d) => s + GSC_DAILY_MAY_2026[d].clicks, 0)) / 3)} clicks/day</span>
          </div>
        </div>
        <div style={{ height: 280 }}>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <Bar data={dailyChartData as any} options={dailyChartOptions as any} />
        </div>
      </div>

      {/* ═══════ SECTION 8: KEYWORD MOVERS WITH TIMELINE ═══════ */}
      <div style={{ background: '#fff', borderRadius: 10, padding: 20, border: '1px solid #e5e7eb' }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: TP.navy, marginBottom: 4 }}>Non-Branded Keyword Movement</h3>
        <p style={{ fontSize: 12, color: '#888', marginBottom: 12 }}>
          Before 2026, nearly 100% of Toothpillow&apos;s search clicks came from branded terms (people already searching for &quot;toothpillow&quot;). These non-branded healthcare keywords sat at positions 60–90 for months, invisible to searchers. The table below shows when each keyword started climbing toward page 1.
        </p>
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          <div style={{ background: '#f0fdf4', borderRadius: 8, padding: '8px 14px', border: `1px solid ${TP.green}50`, fontSize: 12 }}>
            <span style={{ fontWeight: 700, color: TP.green }}>1,236</span> <span style={{ color: '#666' }}>non-branded keywords tracked</span>
          </div>
          <div style={{ background: '#f0fdf4', borderRadius: 8, padding: '8px 14px', border: `1px solid ${TP.green}50`, fontSize: 12 }}>
            <span style={{ fontWeight: 700, color: TP.green }}>{KEYWORD_CLIMBERS.length}</span> <span style={{ color: '#666' }}>keywords climbing 10+ positions</span>
          </div>
          <div style={{ background: '#f0f9ff', borderRadius: 8, padding: '8px 14px', border: '1px solid #bae6fd', fontSize: 12 }}>
            <span style={{ fontWeight: 700, color: TP.blue }}>{CLICK_DRIVING_KEYWORDS.length}</span> <span style={{ color: '#666' }}>keywords driving clicks</span>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${TP.green}` }}>
                <th style={{ padding: '8px 10px', textAlign: 'left', color: TP.navy }}>Keyword</th>
                <th style={{ padding: '8px 10px', textAlign: 'left', color: TP.navy }}>Started Climbing</th>
                <th style={{ padding: '8px 10px', textAlign: 'right', color: TP.navy }}>Was</th>
                <th style={{ padding: '8px 10px', textAlign: 'right', color: TP.navy }}>Now</th>
                <th style={{ padding: '8px 10px', textAlign: 'right', color: TP.navy }}>Moved</th>
                <th style={{ padding: '8px 10px', textAlign: 'center', color: TP.navy, minWidth: 130 }}>Position Over Time</th>
              </tr>
            </thead>
            <tbody>
              {KEYWORD_CLIMBERS.map((k, i) => {
                const spots = Math.abs(k.change);
                const ph = k.posHistory;
                return (
                  <tr key={i} style={{ borderBottom: '1px solid #f0f0f0', background: i % 2 === 0 ? '#fafafa' : '#fff' }}>
                    <td style={{ padding: '7px 10px', fontWeight: 500 }}>{k.query}</td>
                    <td style={{ padding: '7px 10px' }}>
                      <span style={{
                        display: 'inline-block', padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600,
                        background: k.startedClimbing.includes('2025') ? `${TP.green}20` : '#fff3cd',
                        color: k.startedClimbing.includes('2025') ? TP.green : '#856404',
                      }}>
                        {k.startedClimbing}
                      </span>
                    </td>
                    <td style={{ padding: '7px 10px', textAlign: 'right', color: '#999' }}>{k.posPrev.toFixed(1)}</td>
                    <td style={{ padding: '7px 10px', textAlign: 'right', fontWeight: 600, color: k.posNow <= 20 ? TP.green : k.posNow <= 40 ? TP.yellow : TP.text }}>{k.posNow.toFixed(1)}</td>
                    <td style={{ padding: '7px 10px', textAlign: 'right', fontWeight: 700, color: TP.green }}>▲ {spots.toFixed(1)}</td>
                    <td style={{ padding: '4px 10px', textAlign: 'center' }}>
                      {ph ? (
                        <svg width={130} height={28} viewBox="0 0 130 28">
                          {(() => {
                            const vals = ph.filter((v): v is number => v !== null);
                            const maxP = Math.max(...vals);
                            const minP = Math.min(...vals);
                            const range = maxP - minP || 1;
                            const points: string[] = [];
                            let idx = 0;
                            ph.forEach((v, mi) => {
                              if (v !== null) {
                                const x = (mi / 15) * 126 + 2;
                                const y = ((v - minP) / range) * 20 + 2;
                                points.push(`${x},${y}`);
                                idx++;
                              }
                            });
                            return (
                              <>
                                <polyline points={points.join(' ')} fill="none" stroke={TP.green} strokeWidth={1.5} />
                                {points.map((p, pi) => {
                                  const [cx, cy] = p.split(',').map(Number);
                                  return <circle key={pi} cx={cx} cy={cy} r={pi === points.length - 1 ? 3 : 1.5} fill={pi === points.length - 1 ? TP.green : `${TP.green}80`} />;
                                })}
                              </>
                            );
                          })()}
                        </svg>
                      ) : (
                        <span style={{ fontSize: 10, color: '#ccc' }}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div style={{ fontSize: 10, color: '#bbb', marginTop: 6 }}>Position sparklines show monthly average from Feb 2025 to May 2026. Lower position = better (closer to page 1). Green dot = current month.</div>
        </div>
      </div>

      {/* ═══════ SECTION 9: CLICK-DRIVING KEYWORDS ═══════ */}
      <div style={{ background: '#fff', borderRadius: 10, padding: 20, border: '1px solid #e5e7eb' }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: TP.navy, marginBottom: 4 }}>Non-Branded Keywords Driving Clicks</h3>
        <p style={{ fontSize: 12, color: '#888', marginBottom: 12 }}>
          These crossed the threshold from impressions-only to actual clicks. Each one represents a parent who found Toothpillow through a healthcare search, not a brand search.
        </p>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${TP.blue}` }}>
                <th style={{ padding: '8px 10px', textAlign: 'left', color: TP.navy }}>Keyword</th>
                <th style={{ padding: '8px 10px', textAlign: 'left', color: TP.navy }}>Status</th>
                <th style={{ padding: '8px 10px', textAlign: 'right', color: TP.navy }}>Clicks</th>
                <th style={{ padding: '8px 10px', textAlign: 'right', color: TP.navy }}>Pos</th>
                <th style={{ padding: '8px 10px', textAlign: 'center', color: TP.navy, minWidth: 130 }}>Position Over Time</th>
              </tr>
            </thead>
            <tbody>
              {CLICK_DRIVING_KEYWORDS.map((k, i) => {
                const ph = k.posHistory;
                return (
                  <tr key={i} style={{ borderBottom: '1px solid #f0f0f0', background: i % 2 === 0 ? '#fafafa' : '#fff' }}>
                    <td style={{ padding: '7px 10px', fontWeight: 500 }}>{k.query}</td>
                    <td style={{ padding: '7px 10px' }}>
                      <span style={{
                        display: 'inline-block', padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600,
                        background: k.status.includes('Page 1') ? `${TP.green}20` : '#e8f4fd',
                        color: k.status.includes('Page 1') ? TP.green : TP.blue,
                      }}>
                        {k.status}
                      </span>
                    </td>
                    <td style={{ padding: '7px 10px', textAlign: 'right', color: TP.green, fontWeight: 700 }}>{k.clicksNow}</td>
                    <td style={{ padding: '7px 10px', textAlign: 'right', fontWeight: 600, color: k.posNow <= 10 ? TP.green : k.posNow <= 30 ? TP.yellow : TP.text }}>{k.posNow.toFixed(1)}</td>
                    <td style={{ padding: '4px 10px', textAlign: 'center' }}>
                      {ph ? (
                        <svg width={130} height={28} viewBox="0 0 130 28">
                          {(() => {
                            const vals = ph.filter((v): v is number => v !== null);
                            const maxP = Math.max(...vals, 20);
                            const minP = Math.min(...vals, 1);
                            const range = maxP - minP || 1;
                            const points: string[] = [];
                            ph.forEach((v, mi) => {
                              if (v !== null) {
                                const x = (mi / 15) * 126 + 2;
                                const y = ((v - minP) / range) * 20 + 2;
                                points.push(`${x},${y}`);
                              }
                            });
                            return (
                              <>
                                <polyline points={points.join(' ')} fill="none" stroke={TP.blue} strokeWidth={1.5} />
                                {points.map((p, pi) => {
                                  const [cx, cy] = p.split(',').map(Number);
                                  return <circle key={pi} cx={cx} cy={cy} r={pi === points.length - 1 ? 3 : 1.5} fill={pi === points.length - 1 ? TP.blue : `${TP.blue}80`} />;
                                })}
                              </>
                            );
                          })()}
                        </svg>
                      ) : (
                        <span style={{ fontSize: 10, color: '#ccc' }}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Data source note */}
      <div style={{ fontSize: 11, color: '#aaa', textAlign: 'center', padding: '8px 0' }}>
        Data source: Google Search Console + Salesforce (updated May 24, 2026). Property: https://www.toothpillow.com/. SEO program launched May 19, 2026.
      </div>
    </div>
  );
}
