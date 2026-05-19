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
  text: '#333333', navy: '#1B2A4A',
};

/* ════════════════════════════════════════════
   HARDCODED GSC DATA — Source of truth
   Data exported from Google Search Console on May 18, 2026
   Property verified ~Feb 2025, 16 months of history available
   Baseline period: Feb 8 2025 through May 18 2026 (all pre-SEO data)
   SEO program reset date: May 19, 2026
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
  { month: '2026-05', clicks: 4792, impressions: 30428, ctr: 15.7, position: 15.5 },
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
];

const GSC_TOP_QUERIES = [
  { query: 'tooth pillow', clicks: 77179, impressions: 123289, ctr: 62.6, position: 1.08 },
  { query: 'toothpillow', clicks: 52971, impressions: 80156, ctr: 66.08, position: 1.59 },
  { query: 'tooth pillow for kids', clicks: 8806, impressions: 14341, ctr: 61.4, position: 1.03 },
  { query: 'toothpillow for kids', clicks: 5370, impressions: 7435, ctr: 72.23, position: 1.02 },
  { query: 'tooth pillow device', clicks: 4604, impressions: 8398, ctr: 54.82, position: 2.65 },
  { query: 'tooth pillow for adults', clicks: 3165, impressions: 7664, ctr: 41.3, position: 5.04 },
  { query: 'mouth pillow', clicks: 2407, impressions: 7833, ctr: 30.73, position: 1.15 },
  { query: 'toothpillow for adults', clicks: 1794, impressions: 4808, ctr: 37.31, position: 5.85 },
  { query: 'the tooth pillow', clicks: 1681, impressions: 2217, ctr: 75.82, position: 1.06 },
  { query: 'my tooth pillow', clicks: 1503, impressions: 1932, ctr: 77.8, position: 1.23 },
  { query: 'tooth pillow appliance', clicks: 1146, impressions: 3165, ctr: 36.21, position: 8.16 },
  { query: 'teeth pillow', clicks: 965, impressions: 2312, ctr: 41.74, position: 1.18 },
  { query: 'tooth pillow canada', clicks: 935, impressions: 1594, ctr: 58.66, position: 1.0 },
  { query: 'what is a tooth pillow', clicks: 812, impressions: 2658, ctr: 30.55, position: 1.26 },
  { query: 'toothpillow reviews', clicks: 779, impressions: 7018, ctr: 11.1, position: 2.44 },
  { query: 'toothpillow cost', clicks: 715, impressions: 2421, ctr: 29.53, position: 1.66 },
  { query: 'tongue pillow', clicks: 688, impressions: 1651, ctr: 41.67, position: 1.32 },
  { query: 'toothpillow canada', clicks: 669, impressions: 1298, ctr: 51.54, position: 1.07 },
  { query: 'mouth pillow kids', clicks: 601, impressions: 1010, ctr: 59.5, position: 1.0 },
  { query: 'tooth pillow kids', clicks: 596, impressions: 1170, ctr: 50.94, position: 1.0 },
];

const GSC_TOP_PAGES = [
  { page: '/', clicks: 175865, impressions: 4909869, ctr: 3.58, position: 65.0 },
  { page: '/pricing', clicks: 22015, impressions: 545463, ctr: 4.04, position: 6.06 },
  { page: '/is-my-child-a-candidate', clicks: 10977, impressions: 463419, ctr: 2.37, position: 4.34 },
  { page: '/adults', clicks: 7555, impressions: 349182, ctr: 2.16, position: 3.15 },
  { page: '/faqs', clicks: 5950, impressions: 504575, ctr: 1.18, position: 3.18 },
  { page: '/our-doctors', clicks: 5484, impressions: 487975, ctr: 1.12, position: 5.63 },
  { page: '/teens-adult', clicks: 1620, impressions: 49706, ctr: 3.26, position: 1.98 },
  { page: '/premium', clicks: 1305, impressions: 94830, ctr: 1.38, position: 4.91 },
  { page: '/insurance_compliance_faqs', clicks: 760, impressions: 19064, ctr: 3.99, position: 8.8 },
  { page: '/login', clicks: 758, impressions: 3061, ctr: 24.76, position: 9.0 },
  { page: '/articles', clicks: 677, impressions: 140236, ctr: 0.48, position: 3.24 },
  { page: '/symptoms', clicks: 201, impressions: 50349, ctr: 0.4, position: 3.29 },
];

/* ════════════════════════════════════════════
   HELPERS
   ════════════════════════════════════════════ */

function KPICard({ label, value, sub, color }: { label: string; value: string; sub?: string; color: string }) {
  return (
    <div style={{ background: '#fff', borderRadius: 10, padding: '18px 20px', border: '1px solid #e5e7eb', flex: '1 1 0', minWidth: 170 }}>
      <div style={{ fontSize: 12, color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color, marginTop: 4 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

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

/* ════════════════════════════════════════════
   COMPONENT
   ════════════════════════════════════════════ */

export default function OrganicGrowth() {
  // Compute KPIs from most recent full month (April 2026) vs prior month
  const current = GSC_MONTHLY[GSC_MONTHLY.length - 2]; // April (last complete month)
  const prior = GSC_MONTHLY[GSC_MONTHLY.length - 3]; // March
  const mayPartial = GSC_MONTHLY[GSC_MONTHLY.length - 1]; // May partial

  // Pre-SEO baseline: all data through May 18, 2026
  // 464 days of data (Feb 8 2025 – May 17 2026), computed from daily CSV export
  const baseline = useMemo(() => {
    // Full-period daily averages (464 days)
    const totalClicks = 224596;
    const totalImpressions = 5043548;
    const totalDays = 464;
    const avgClicksDay = Math.round(totalClicks / totalDays);
    const avgClicksMo = Math.round(avgClicksDay * 30);
    const avgImpsMo = Math.round(totalImpressions / totalDays * 30);
    const avgCtr = parseFloat((totalClicks / totalImpressions * 100).toFixed(1));
    const avgPos = 40.9;

    // Recent 90-day window (Feb 17 – May 17 2026) for comparison
    const recent90Clicks = 11252;
    const recent90Imps = 2581 * 30; // daily avg * 30
    const recent90Ctr = 14.5;
    const recent90Pos = 20.9;

    return {
      avgClicksMo, avgImpsMo, avgCtr, avgPos,
      recent90ClicksMo: Math.round(recent90Clicks),
      recent90ImpsMo: Math.round(recent90Imps),
      recent90Ctr, recent90Pos,
      totalClicks, totalImpressions, totalDays,
    };
  }, []);

  // Monthly clicks chart data
  const monthlyChartData = useMemo(() => ({
    labels: GSC_MONTHLY.map(m => monthLabel(m.month)),
    datasets: [
      {
        label: 'Clicks',
        data: GSC_MONTHLY.map(m => m.clicks),
        backgroundColor: GSC_MONTHLY.map(m => TP.blue),
        borderColor: GSC_MONTHLY.map(m => TP.blue),
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  }), []);

  // SEO marker line index (May '26 is the last bar)
  const seoMarkerIndex = GSC_MONTHLY.findIndex(m => m.month === '2026-05') - 0.5;

  const monthlyChartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: { parsed: { y: number } }) => `${ctx.parsed.y.toLocaleString()} clicks`,
        },
      },
      annotation: {
        annotations: {
          seoLine: {
            type: 'line' as const,
            xMin: seoMarkerIndex,
            xMax: seoMarkerIndex,
            borderColor: TP.red,
            borderWidth: 2,
            borderDash: [6, 4],
            label: {
              display: true,
              content: 'SEO Reset — May 19',
              position: 'start' as const,
              backgroundColor: TP.red,
              color: '#fff',
              font: { size: 10, weight: 'bold' as const },
              padding: 4,
            },
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { callback: (v: number | string) => fmtK(Number(v)) },
        grid: { color: '#f0f0f0' },
      },
      x: { grid: { display: false } },
    },
  }), [seoMarkerIndex]);

  // Weekly clicks + CTR dual axis
  const weeklyChartData = useMemo(() => ({
    labels: GSC_WEEKLY.map(w => weekLabel(w.week)),
    datasets: [
      {
        label: 'Weekly Clicks',
        data: GSC_WEEKLY.map(w => w.clicks),
        type: 'bar' as const,
        backgroundColor: GSC_WEEKLY.map(w => `${TP.blue}99`),
        borderRadius: 3,
        yAxisID: 'y',
        order: 2,
      },
      {
        label: 'CTR %',
        data: GSC_WEEKLY.map(w => w.ctr),
        type: 'line' as const,
        borderColor: TP.yellow,
        backgroundColor: 'transparent',
        pointRadius: 0,
        borderWidth: 2,
        tension: 0.3,
        yAxisID: 'y1',
        order: 1,
      },
    ],
  }), []);

  const weeklyChartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const, labels: { usePointStyle: true, boxWidth: 8, padding: 16, font: { size: 11 } } },
      annotation: {
        annotations: {
          seoLine: {
            type: 'line' as const,
            xMin: GSC_WEEKLY.length - 1.5,
            xMax: GSC_WEEKLY.length - 1.5,
            borderColor: TP.red,
            borderWidth: 2,
            borderDash: [6, 4],
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        position: 'left' as const,
        title: { display: true, text: 'Clicks', font: { size: 11 } },
        ticks: { callback: (v: number | string) => fmtK(Number(v)) },
        grid: { color: '#f0f0f0' },
      },
      y1: {
        beginAtZero: true,
        position: 'right' as const,
        title: { display: true, text: 'CTR %', font: { size: 11 } },
        ticks: { callback: (v: number | string) => `${v}%` },
        grid: { display: false },
      },
      x: {
        grid: { display: false },
        ticks: { maxRotation: 45, autoSkip: true, maxTicksLimit: 20, font: { size: 9 } },
      },
    },
  }), []);

  // Position trend (inverted — lower is better)
  const positionChartData = useMemo(() => ({
    labels: GSC_MONTHLY.map(m => monthLabel(m.month)),
    datasets: [
      {
        label: 'Avg Position',
        data: GSC_MONTHLY.map(m => m.position),
        borderColor: TP.darkPurple,
        backgroundColor: `${TP.darkPurple}20`,
        pointRadius: 4,
        pointBackgroundColor: GSC_MONTHLY.map(m => TP.darkPurple),
        borderWidth: 2,
        tension: 0.3,
        fill: true,
      },
    ],
  }), []);

  const positionChartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: { parsed: { y: number } }) => `Position: ${ctx.parsed.y.toFixed(1)}`,
        },
      },
      annotation: {
        annotations: {
          seoLine: {
            type: 'line' as const,
            xMin: seoMarkerIndex,
            xMax: seoMarkerIndex,
            borderColor: TP.red,
            borderWidth: 2,
            borderDash: [6, 4],
          },
        },
      },
    },
    scales: {
      y: {
        reverse: true,
        title: { display: true, text: 'Position (lower = better)', font: { size: 11 } },
        grid: { color: '#f0f0f0' },
      },
      x: { grid: { display: false } },
    },
  }), [seoMarkerIndex]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: TP.navy, marginBottom: 4 }}>Organic Search Growth</h2>
        <p style={{ fontSize: 13, color: '#888' }}>
          Google Search Console data from Feb 2025 to present. SEO program reset date: May 19, 2026.
        </p>
      </div>

      {/* SEO Baseline Banner */}
      <div style={{
        background: `linear-gradient(135deg, ${TP.navy} 0%, ${TP.blue} 100%)`,
        borderRadius: 10, padding: '16px 20px', color: '#fff',
      }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>
          Pre-SEO Baseline (Feb 8, 2025 – May 18, 2026)
        </div>
        <div style={{ fontSize: 11, opacity: 0.6, marginBottom: 12 }}>
          {baseline.totalDays} days of data before SEO program. Reset date: May 19, 2026. Everything after this is measured against these numbers.
        </div>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <div style={{ minWidth: 140 }}>
            <span style={{ fontSize: 11, opacity: 0.7 }}>Full-Period Avg</span>
            <div style={{ display: 'flex', gap: 24, marginTop: 4 }}>
              <div>
                <div style={{ fontSize: 10, opacity: 0.5 }}>Clicks/mo</div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{baseline.avgClicksMo.toLocaleString()}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, opacity: 0.5 }}>Impr/mo</div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{fmtK(baseline.avgImpsMo)}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, opacity: 0.5 }}>CTR</div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{baseline.avgCtr}%</div>
              </div>
              <div>
                <div style={{ fontSize: 10, opacity: 0.5 }}>Position</div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{baseline.avgPos}</div>
              </div>
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', marginTop: 12, paddingTop: 10, display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 10, opacity: 0.5 }}>Last 90 Days — Clicks/mo</div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{baseline.recent90ClicksMo.toLocaleString()}</div>
          </div>
          <div>
            <div style={{ fontSize: 10, opacity: 0.5 }}>Last 90 Days — CTR</div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{baseline.recent90Ctr}%</div>
          </div>
          <div>
            <div style={{ fontSize: 10, opacity: 0.5 }}>Last 90 Days — Position</div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{baseline.recent90Pos}</div>
          </div>
        </div>
      </div>

      {/* KPI Cards — Most Recent Month */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <KPICard color={TP.blue} label="April Clicks" value={current.clicks.toLocaleString()} sub={`vs ${prior.clicks.toLocaleString()} in March (${current.clicks > prior.clicks ? '+' : ''}${Math.round((current.clicks - prior.clicks) / prior.clicks * 100)}%)`} />
        <KPICard color={TP.darkPurple} label="April Impressions" value={fmtK(current.impressions)} sub={`vs ${fmtK(prior.impressions)} in March`} />
        <KPICard color={TP.green} label="April CTR" value={`${current.ctr}%`} sub={`vs ${prior.ctr}% in March`} />
        <KPICard color={TP.yellow} label="April Avg Position" value={current.position.toFixed(1)} sub={`vs ${prior.position.toFixed(1)} in March (lower = better)`} />
      </div>

      {/* May MTD callout */}
      <div style={{ background: '#f0fdf4', borderRadius: 8, padding: '12px 16px', border: `1px solid ${TP.green}40` }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: TP.navy }}>May 2026 MTD (17 days): </span>
        <span style={{ fontSize: 13, color: TP.text }}>
          {mayPartial.clicks.toLocaleString()} clicks, {fmtK(mayPartial.impressions)} impressions, {mayPartial.ctr}% CTR, position {mayPartial.position.toFixed(1)}.
          Daily avg: {Math.round(mayPartial.clicks / 17)} clicks/day ({Math.round(mayPartial.clicks / 17 * 31).toLocaleString()} projected for full month).
        </span>
      </div>

      {/* Monthly Clicks Chart */}
      <div style={{ background: '#fff', borderRadius: 10, padding: 20, border: '1px solid #e5e7eb' }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: TP.navy, marginBottom: 12 }}>Monthly Organic Clicks</h3>
        <div style={{ height: 300 }}>
          <Bar data={monthlyChartData} options={monthlyChartOptions as object} />
        </div>
      </div>

      {/* Weekly Clicks + CTR Chart */}
      <div style={{ background: '#fff', borderRadius: 10, padding: 20, border: '1px solid #e5e7eb' }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: TP.navy, marginBottom: 12 }}>Weekly Clicks and CTR</h3>
        <div style={{ height: 320 }}>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <Bar data={weeklyChartData as any} options={weeklyChartOptions as any} />
        </div>
      </div>

      {/* Position Trend */}
      <div style={{ background: '#fff', borderRadius: 10, padding: 20, border: '1px solid #e5e7eb' }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: TP.navy, marginBottom: 12 }}>Average Search Position Trend</h3>
        <p style={{ fontSize: 12, color: '#888', marginBottom: 12 }}>Lower position numbers mean higher ranking. Position 1 = top of page 1.</p>
        <div style={{ height: 280 }}>
          <Line data={positionChartData} options={positionChartOptions as object} />
        </div>
      </div>

      {/* Two-column: Top Queries + Top Pages */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Top Queries */}
        <div style={{ background: '#fff', borderRadius: 10, padding: 20, border: '1px solid #e5e7eb' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: TP.navy, marginBottom: 12 }}>Top Search Queries (16 months)</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${TP.blue}`, textAlign: 'left' }}>
                  <th style={{ padding: '6px 8px', color: TP.navy }}>Query</th>
                  <th style={{ padding: '6px 8px', color: TP.navy, textAlign: 'right' }}>Clicks</th>
                  <th style={{ padding: '6px 8px', color: TP.navy, textAlign: 'right' }}>Impr</th>
                  <th style={{ padding: '6px 8px', color: TP.navy, textAlign: 'right' }}>CTR</th>
                  <th style={{ padding: '6px 8px', color: TP.navy, textAlign: 'right' }}>Pos</th>
                </tr>
              </thead>
              <tbody>
                {GSC_TOP_QUERIES.map((q, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f0f0f0', background: i % 2 === 0 ? '#fafafa' : '#fff' }}>
                    <td style={{ padding: '6px 8px', fontWeight: 500, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.query}</td>
                    <td style={{ padding: '6px 8px', textAlign: 'right', color: TP.blue, fontWeight: 600 }}>{q.clicks.toLocaleString()}</td>
                    <td style={{ padding: '6px 8px', textAlign: 'right' }}>{fmtK(q.impressions)}</td>
                    <td style={{ padding: '6px 8px', textAlign: 'right' }}>{q.ctr}%</td>
                    <td style={{ padding: '6px 8px', textAlign: 'right', color: q.position <= 3 ? TP.green : q.position <= 10 ? TP.yellow : TP.red, fontWeight: 600 }}>{q.position.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Pages */}
        <div style={{ background: '#fff', borderRadius: 10, padding: 20, border: '1px solid #e5e7eb' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: TP.navy, marginBottom: 12 }}>Top Pages (16 months)</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${TP.blue}`, textAlign: 'left' }}>
                  <th style={{ padding: '6px 8px', color: TP.navy }}>Page</th>
                  <th style={{ padding: '6px 8px', color: TP.navy, textAlign: 'right' }}>Clicks</th>
                  <th style={{ padding: '6px 8px', color: TP.navy, textAlign: 'right' }}>Impr</th>
                  <th style={{ padding: '6px 8px', color: TP.navy, textAlign: 'right' }}>CTR</th>
                  <th style={{ padding: '6px 8px', color: TP.navy, textAlign: 'right' }}>Pos</th>
                </tr>
              </thead>
              <tbody>
                {GSC_TOP_PAGES.map((p, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f0f0f0', background: i % 2 === 0 ? '#fafafa' : '#fff' }}>
                    <td style={{ padding: '6px 8px', fontWeight: 500, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.page}</td>
                    <td style={{ padding: '6px 8px', textAlign: 'right', color: TP.blue, fontWeight: 600 }}>{p.clicks.toLocaleString()}</td>
                    <td style={{ padding: '6px 8px', textAlign: 'right' }}>{fmtK(p.impressions)}</td>
                    <td style={{ padding: '6px 8px', textAlign: 'right' }}>{p.ctr}%</td>
                    <td style={{ padding: '6px 8px', textAlign: 'right', color: p.position <= 3 ? TP.green : p.position <= 10 ? TP.yellow : TP.red, fontWeight: 600 }}>{p.position.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Data source note */}
      <div style={{ fontSize: 11, color: '#aaa', textAlign: 'center', padding: '8px 0' }}>
        Data source: Google Search Console export (May 18, 2026). Property: https://www.toothpillow.com/. Baseline: Feb 8, 2025 – May 18, 2026. SEO reset: May 19, 2026.
      </div>
    </div>
  );
}
