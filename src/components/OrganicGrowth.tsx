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
   Data pulled fresh from Google Search Console on May 29, 2026
   Property verified ~Feb 2025, 16 months of history available
   Baseline period: Feb 8 2025 through May 18 2026 (all pre-SEO data)
   SEO program reset date: May 19, 2026
   May 2026 data current through May 27 (GSC ~2-day lag)
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
  { month: '2026-05', clicks: 8263, impressions: 45377, ctr: 18.2, position: 13.3 },
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
  { week: '2026-05-18', clicks: 2564, impressions: 10691, ctr: 24.0, position: 10.4 },
  { week: '2026-05-25', clicks: 568, impressions: 2677, ctr: 21.2, position: 8.1 },
];

// Full-year daily GSC data — Jan 1 to May 26, 2026 (146 days)
// Source: Google Search Console DAYS view, updated May 28, 2026
// Format: [day, clicks, impressions]
const GSC_DAILY_2026: Record<string, [number, number, number][]> = {
  Jan: [
    [1,254,1532],[2,276,2115],[3,245,1477],[4,258,1646],[5,382,2299],[6,472,2277],[7,459,2482],
    [8,439,8333],[9,391,13023],[10,242,11158],[11,246,9091],[12,400,10680],[13,451,12374],[14,466,2493],
    [15,624,9788],[16,389,12479],[17,249,10079],[18,286,10651],[19,391,11432],[20,532,12448],[21,550,13664],
    [22,361,7174],[23,302,2087],[24,213,1718],[25,235,1760],[26,328,3489],[27,394,10677],[28,788,13860],
    [29,513,8228],[30,406,1936],[31,268,1310],
  ],
  Feb: [
    [1,248,1399],[2,400,1633],[3,387,5794],[4,414,9045],[5,543,8944],[6,393,3057],[7,269,1252],
    [8,209,1223],[9,375,1811],[10,381,1679],[11,357,1478],[12,347,1632],[13,264,1692],[14,218,1248],
    [15,187,1151],[16,403,1711],[17,524,1906],[18,499,2113],[19,422,1907],[20,351,1938],[21,234,1190],
    [22,228,1381],[23,551,2136],[24,571,2030],[25,555,2089],[26,547,2050],[27,404,1881],[28,298,1174],
  ],
  Mar: [
    [1,222,945],[2,412,1665],[3,488,1829],[4,451,1668],[5,364,1371],[6,349,1483],[7,238,998],
    [8,185,1114],[9,528,1704],[10,579,1827],[11,460,1439],[12,467,1486],[13,431,1571],[14,285,1009],
    [15,313,1135],[16,508,1481],[17,491,1702],[18,479,3412],[19,405,5134],[20,366,4292],[21,244,2395],
    [22,208,3703],[23,383,1335],[24,403,1396],[25,494,3372],[26,505,5154],[27,676,4298],[28,340,3524],
    [29,301,3957],[30,545,3506],[31,481,4364],
  ],
  Apr: [
    [1,453,5600],[2,346,3610],[3,252,3468],[4,180,2681],[5,174,1719],[6,304,4381],[7,360,1388],
    [8,376,3655],[9,427,2065],[10,305,3816],[11,828,5014],[12,407,5590],[13,294,2728],[14,383,1415],
    [15,377,1416],[16,342,1265],[17,545,5042],[18,300,4172],[19,296,4980],[20,427,5550],[21,382,2953],
    [22,341,1284],[23,332,1129],[24,311,3957],[25,158,2174],[26,191,3764],[27,340,3772],[28,721,6704],
    [29,619,7218],[30,409,3248],
  ],
  May: [
    [1,339,1522],[2,218,1003],[3,202,907],[4,299,2293],[5,317,3915],[6,343,5614],[7,322,1831],
    [8,305,1259],[9,186,877],[10,179,973],[11,337,1412],[12,389,1397],[13,342,1367],[14,373,3003],
    [15,262,1250],[16,176,900],[17,203,905],[18,311,1339],[19,337,1358],[20,330,1551],[21,387,1881],
    [22,487,1600],[23,464,1559],[24,248,1403],[25,230,1124],[26,338,1553],[27,339,1581],
  ],
};

// Derive May-only record for backward compat
const GSC_DAILY_MAY_2026: Record<number, { clicks: number; impressions: number }> = {};
for (const [d, c, i] of GSC_DAILY_2026.May) { GSC_DAILY_MAY_2026[d] = { clicks: c, impressions: i }; }

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


/* ════════════════════════════════════════════
   HELPERS
   ════════════════════════════════════════════ */

// Suppress unused-variable warnings for data kept for future use
void GSC_WEEKLY;
void GSC_DAILY_2026;
void GSC_DAILY_MAY_2026;

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

function delta(current: number, previous: number): string {
  const pct = ((current - previous) / previous * 100);
  const sign = pct >= 0 ? '+' : '';
  return `${sign}${pct.toFixed(0)}%`;
}

/* ════════════════════════════════════════════
   COMPONENT
   ════════════════════════════════════════════ */

export default function OrganicGrowth() {
  const mayData = GSC_MONTHLY[GSC_MONTHLY.length - 1];
  const mayDaysReported = 27;
  const mayClickPace = Math.round(mayData.clicks / mayDaysReported * 31);

  const may2025 = GSC_MONTHLY.find(m => m.month === '2025-05')!;
  const feb2025 = GSC_MONTHLY.find(m => m.month === '2025-02')!;

  // SEO implementation index for chart annotations
  const seoMonthIndex = GSC_MONTHLY.findIndex(m => m.month >= SEO_START_DATE.substring(0, 7));

  // ── Section 2: Monthly Organic Clicks bar chart with 3-month MA ──
  const monthlyClicksData = useMemo(() => {
    const clickValues = GSC_MONTHLY.map(m => m.clicks);
    const ma3: (number | null)[] = clickValues.map((_, i) => {
      if (i < 2) return null;
      return Math.round((clickValues[i] + clickValues[i - 1] + clickValues[i - 2]) / 3);
    });

    return {
      labels: GSC_MONTHLY.map(m => monthLabel(m.month)),
      datasets: [
        {
          label: 'Organic Clicks',
          data: clickValues,
          backgroundColor: TP.blue,
          borderRadius: 4,
          borderSkipped: false as const,
          order: 2,
        },
        {
          label: '3-Month Moving Avg',
          data: ma3,
          type: 'line' as const,
          borderColor: TP.red,
          backgroundColor: 'transparent',
          pointRadius: 0,
          borderWidth: 2.5,
          tension: 0.35,
          spanGaps: true,
          order: 1,
        },
      ],
    };
  }, []);

  const monthlyClicksOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const, labels: { usePointStyle: true, boxWidth: 8, padding: 16, font: { size: 11 } } },
      tooltip: {
        callbacks: {
          label: (ctx: { datasetIndex: number; parsed: { y: number } }) =>
            ctx.datasetIndex === 0 ? `${ctx.parsed.y.toLocaleString()} clicks` : `${ctx.parsed.y.toLocaleString()} avg`,
        },
      },
      annotation: seoMonthIndex >= 0 ? {
        annotations: {
          seoLine: {
            type: 'line' as const,
            xMin: seoMonthIndex - 0.5,
            xMax: seoMonthIndex - 0.5,
            borderColor: `${TP.green}90`,
            borderWidth: 2,
            borderDash: [6, 3],
            label: {
              display: true,
              content: 'SEO Started',
              position: 'start' as const,
              backgroundColor: `${TP.green}18`,
              color: TP.green,
              font: { size: 10, weight: 'bold' as const },
              padding: 4,
            },
          },
        },
      } : {},
    },
    scales: {
      y: { beginAtZero: true, ticks: { callback: (v: number | string) => fmtK(Number(v)) }, grid: { color: '#f0f0f0' } },
      x: { grid: { display: false } },
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [seoMonthIndex]);

  // ── Section 3: Search Position Trend (reversed Y) ──
  const positionChartData = useMemo(() => ({
    labels: GSC_MONTHLY.map(m => monthLabel(m.month)),
    datasets: [{
      label: 'Avg Position',
      data: GSC_MONTHLY.map(m => m.position),
      borderColor: TP.darkPurple,
      backgroundColor: `${TP.darkPurple}18`,
      pointRadius: 4,
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
          page1Line: {
            type: 'line' as const,
            yMin: 10,
            yMax: 10,
            borderColor: `${TP.green}80`,
            borderWidth: 1.5,
            borderDash: [6, 4],
            label: {
              display: true,
              content: 'Page 1',
              position: 'start' as const,
              backgroundColor: 'transparent',
              color: TP.green,
              font: { size: 10, weight: 'bold' as const },
              padding: 2,
            },
          },
          page2Line: {
            type: 'line' as const,
            yMin: 20,
            yMax: 20,
            borderColor: `${TP.yellow}80`,
            borderWidth: 1.5,
            borderDash: [6, 4],
            label: {
              display: true,
              content: 'Page 2',
              position: 'start' as const,
              backgroundColor: 'transparent',
              color: TP.yellow,
              font: { size: 10, weight: 'bold' as const },
              padding: 2,
            },
          },
          ...(seoMonthIndex >= 0 ? {
            seoLine: {
              type: 'line' as const,
              xMin: seoMonthIndex - 0.5,
              xMax: seoMonthIndex - 0.5,
              borderColor: `${TP.green}90`,
              borderWidth: 2,
              borderDash: [6, 3],
              label: {
                display: true,
                content: 'SEO Started',
                position: 'end' as const,
                backgroundColor: `${TP.green}18`,
                color: TP.green,
                font: { size: 10, weight: 'bold' as const },
                padding: 4,
              },
            },
          } : {}),
        },
      },
    },
    scales: {
      y: {
        reverse: true,
        min: 0,
        max: 80,
        grid: { color: '#f0f0f0' },
        ticks: {
          callback: (v: number | string) => {
            const n = Number(v);
            if (n === 10) return 'Pg 1';
            if (n === 20) return 'Pg 2';
            if (n === 30) return 'Pg 3';
            if (n === 50) return 'Pg 5';
            if (n === 70) return 'Pg 7';
            return '';
          },
        },
      },
      x: { grid: { display: false } },
    },
  }), []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: TP.navy, marginBottom: 4 }}>Organic Search Growth</h2>
        <p style={{ fontSize: 13, color: '#888', margin: 0 }}>
          Google Search Console, Feb 2025 to present
        </p>
      </div>

      {/* ═══════ SECTION 1: HEADLINE STAT CARDS ═══════ */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {/* Organic Clicks */}
        <div style={{ background: '#fff', borderRadius: 10, padding: '16px 20px', border: '1px solid #e5e7eb', flex: '1 1 0', minWidth: 160 }}>
          <div style={{ fontSize: 11, color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Organic Clicks</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: TP.navy }}>{fmtK(mayClickPace)}</div>
          <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>May pace ({mayDaysReported} days reported)</div>
          <div style={{ fontSize: 12, fontWeight: 600, marginTop: 6, color: mayClickPace < may2025.clicks ? TP.red : TP.green }}>
            {mayClickPace >= may2025.clicks ? '▲' : '▼'} {delta(mayClickPace, may2025.clicks)} vs May 2025 ({fmtK(may2025.clicks)})
          </div>
        </div>

        {/* Avg Position */}
        <div style={{ background: '#fff', borderRadius: 10, padding: '16px 20px', border: '1px solid #e5e7eb', flex: '1 1 0', minWidth: 160 }}>
          <div style={{ fontSize: 11, color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Avg Position</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: TP.navy }}>{mayData.position}</div>
          <div style={{ fontSize: 11, color: TP.green, fontWeight: 600, marginTop: 2 }}>Page 2</div>
          <div style={{ fontSize: 12, fontWeight: 600, marginTop: 6, color: TP.green }}>
            ▲ from {feb2025.position} (Page 7) in Feb 2025
          </div>
        </div>

        {/* CTR */}
        <div style={{ background: '#fff', borderRadius: 10, padding: '16px 20px', border: '1px solid #e5e7eb', flex: '1 1 0', minWidth: 160 }}>
          <div style={{ fontSize: 11, color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Click-Through Rate</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: TP.navy }}>{mayData.ctr}%</div>
          <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>May 2026</div>
          <div style={{ fontSize: 12, fontWeight: 600, marginTop: 6, color: TP.green }}>
            ▲ from {feb2025.ctr}% in Feb 2025
          </div>
        </div>
      </div>

      {/* ═══════ SECTION 2: MONTHLY ORGANIC CLICKS ═══════ */}
      <div style={{ background: '#fff', borderRadius: 10, padding: 20, border: '1px solid #e5e7eb' }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: TP.navy, marginBottom: 12, marginTop: 0 }}>Monthly Organic Clicks from Google</h3>
        <div style={{ height: 300 }}>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <Bar data={monthlyClicksData as any} options={monthlyClicksOptions as object} />
        </div>
      </div>

      {/* ═══════ SECTION 3: SEARCH POSITION TREND ═══════ */}
      <div style={{ background: '#fff', borderRadius: 10, padding: 20, border: '1px solid #e5e7eb' }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: TP.navy, marginBottom: 12, marginTop: 0 }}>Average Search Position</h3>
        <div style={{ height: 300 }}>
          <Line data={positionChartData} options={positionChartOptions as object} />
        </div>
      </div>

      {/* ═══════ SECTION 4: KEYWORD MOVEMENT ═══════ */}
      <div style={{ background: '#fff', borderRadius: 10, padding: 20, border: '1px solid #e5e7eb' }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: TP.navy, marginBottom: 12, marginTop: 0 }}>Non-Branded Keywords Moving Toward Page 1</h3>

        {/* Climbers table */}
        <div style={{ overflowX: 'auto', marginBottom: 24 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${TP.green}` }}>
                <th style={{ padding: '8px 10px', textAlign: 'left', color: TP.navy }}>Keyword</th>
                <th style={{ padding: '8px 10px', textAlign: 'right', color: TP.navy }}>Position</th>
                <th style={{ padding: '8px 10px', textAlign: 'right', color: TP.navy }}>Moved</th>
                <th style={{ padding: '8px 10px', textAlign: 'center', color: TP.navy, minWidth: 130 }}>Trend</th>
              </tr>
            </thead>
            <tbody>
              {KEYWORD_CLIMBERS.map((k, i) => {
                const spots = Math.abs(k.change);
                const ph = k.posHistory;
                return (
                  <tr key={i} style={{ borderBottom: '1px solid #f0f0f0', background: i % 2 === 0 ? '#fafafa' : '#fff' }}>
                    <td style={{ padding: '7px 10px', fontWeight: 500 }}>{k.query}</td>
                    <td style={{ padding: '7px 10px', textAlign: 'right', fontWeight: 600, color: k.posNow <= 20 ? TP.green : k.posNow <= 40 ? TP.yellow : TP.text }}>
                      {k.posNow.toFixed(1)}
                    </td>
                    <td style={{ padding: '7px 10px', textAlign: 'right', fontWeight: 700, color: TP.green }}>
                      ▲ {spots.toFixed(0)}
                    </td>
                    <td style={{ padding: '4px 10px', textAlign: 'center' }}>
                      {ph ? (
                        <svg width={130} height={28} viewBox="0 0 130 28">
                          {(() => {
                            const vals = ph.filter((v): v is number => v !== null);
                            const maxP = Math.max(...vals);
                            const minP = Math.min(...vals);
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
                        <span style={{ fontSize: 10, color: '#ccc' }}>--</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Click-driving keywords table */}
        <div style={{ fontSize: 13, fontWeight: 600, color: TP.navy, marginBottom: 8 }}>Already Driving Clicks</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${TP.blue}` }}>
                <th style={{ padding: '8px 10px', textAlign: 'left', color: TP.navy }}>Keyword</th>
                <th style={{ padding: '8px 10px', textAlign: 'right', color: TP.navy }}>Position</th>
                <th style={{ padding: '8px 10px', textAlign: 'right', color: TP.navy }}>Clicks</th>
              </tr>
            </thead>
            <tbody>
              {CLICK_DRIVING_KEYWORDS.map((k, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f0f0f0', background: i % 2 === 0 ? '#fafafa' : '#fff' }}>
                  <td style={{ padding: '7px 10px', fontWeight: 500 }}>{k.query}</td>
                  <td style={{ padding: '7px 10px', textAlign: 'right', fontWeight: 600, color: k.posNow <= 10 ? TP.green : k.posNow <= 30 ? TP.yellow : TP.text }}>
                    {k.posNow.toFixed(1)}
                  </td>
                  <td style={{ padding: '7px 10px', textAlign: 'right', fontWeight: 700, color: TP.blue }}>{k.clicksNow}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Data source note */}
      <div style={{ fontSize: 11, color: '#aaa', textAlign: 'center', padding: '8px 0' }}>
        Google Search Console. Updated May 29, 2026.
      </div>
    </div>
  );
}
