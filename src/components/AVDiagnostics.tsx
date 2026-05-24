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
// "waiting" = "waiting, needs info" status from AV system
// Major assessment update shipped May 22 — May split into pre/post
const AV_DATA = [
  { label: 'Nov 25', month: 11, year: 2025, traffic: 54674, starts: 1697, waiting: 97,   partial: false, period: 'full' as const },
  { label: 'Dec 25', month: 12, year: 2025, traffic: 36031, starts: 1435, waiting: 192,  partial: false, period: 'full' as const },
  { label: 'Jan 26', month: 1,  year: 2026, traffic: 37320, starts: 1514, waiting: 108,  partial: false, period: 'full' as const },
  { label: 'Feb 26', month: 2,  year: 2026, traffic: 51480, starts: 2506, waiting: 889,  partial: false, period: 'full' as const },
  { label: 'Mar 26', month: 3,  year: 2026, traffic: 39218, starts: 2587, waiting: 992,  partial: false, period: 'full' as const },
  { label: 'Apr 26', month: 4,  year: 2026, traffic: 30311, starts: 1692, waiting: 588,  partial: false, period: 'full' as const },
  { label: 'May 1–22', month: 5, year: 2026, traffic: 21819, starts: 1186, waiting: 517, partial: false, period: 'pre-update' as const },
  { label: 'May 23+', month: 5,  year: 2026, traffic: 933,   starts: 47,   waiting: 29,  partial: true,  period: 'post-update' as const },
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
  { label: 'May 1–22',  submissions: 578,  sameDay: 387, within7d: 513,  returning: 191, medianLag: 0, meanLag: 15.0 },
  { label: 'May 23+',   submissions: 27,   sameDay: 20,  within7d: 26,   returning: 7,   medianLag: 0, meanLag: 2.4  },
];

// Traffic for conversion rate calc (matches AV_DATA where available)
const CONV_TRAFFIC: Record<string, number> = {
  'Jan 26': 37320, 'Feb 26': 51480, 'Mar 26': 39218,
  'Apr 26': 30311, 'May 1–22': 21819, 'May 23+': 933,
};

// ── Post-update projection ──────────────────────────────────────────
const POST_UPDATE_DAYS_ELAPSED = 1; // data through 5/23 (partial day)
const POST_UPDATE_DAYS_TOTAL = 9;   // May 23–31
const PROJ_MULT = POST_UPDATE_DAYS_TOTAL / POST_UPDATE_DAYS_ELAPSED;

function proj(actual: number): number { return Math.round(actual * PROJ_MULT); }
function num(v: number): string { return v.toLocaleString(); }
function pct(v: number, t: number): string { return t > 0 ? (v / t * 100).toFixed(1) + '%' : '--'; }

export default function AVDiagnostics() {
  const labels = AV_DATA.map(d => d.label);
  const postUpdate = AV_DATA.find(d => d.period === 'post-update')!;
  const preUpdate = AV_DATA.find(d => d.period === 'pre-update')!;

  // Derived metrics
  const startRates = AV_DATA.map(d => Math.round(d.starts / d.traffic * 1000) / 10);
  const waitPcts = AV_DATA.map(d => Math.round(d.waiting / d.starts * 1000) / 10);
  const completionEst = AV_DATA.map(d => d.starts - d.waiting);

  // Post-update projections
  const projTraffic = proj(postUpdate.traffic);
  const projStarts = proj(postUpdate.starts);
  const projWaiting = proj(postUpdate.waiting);
  const projFwd = projStarts - projWaiting;
  const projStartRate = Math.round(projStarts / projTraffic * 1000) / 10;
  const projWaitPct = Math.round(projWaiting / projStarts * 1000) / 10;

  // Pre vs post rates
  const preWaitPct = Math.round(preUpdate.waiting / preUpdate.starts * 1000) / 10;
  const postWaitPctVal = Math.round(postUpdate.waiting / postUpdate.starts * 1000) / 10;
  const preStartRate = Math.round(preUpdate.starts / preUpdate.traffic * 1000) / 10;
  const postStartRate = Math.round(postUpdate.starts / postUpdate.traffic * 1000) / 10;

  // Conversion lag derived
  const lagLabels = CONVERSION_LAG.map(d => d.label);
  const sameDayPcts = CONVERSION_LAG.map(d => Math.round(d.sameDay / d.submissions * 1000) / 10);
  const returningPcts = CONVERSION_LAG.map(d => Math.round(d.returning / d.submissions * 1000) / 10);
  const convRates = CONVERSION_LAG.map(d => {
    const t = CONV_TRAFFIC[d.label];
    return t ? Math.round(d.submissions / t * 1000) / 10 : 0;
  });

  // ── Chart 1: Traffic + Starts + Waiting ─────────────────────────────
  const nullPad = AV_DATA.map(() => null as number | null);
  const projTrafficRemainder = Math.max(0, projTraffic - postUpdate.traffic);

  const mainChartData = {
    labels,
    datasets: [
      {
        type: 'bar' as const, label: 'Web traffic', data: AV_DATA.map(d => d.traffic),
        backgroundColor: AV_DATA.map(d => d.period === 'post-update' ? 'rgba(58,110,164,0.3)' : 'rgba(58,110,164,0.6)'),
        borderRadius: 0, yAxisID: 'y', order: 3, stack: 'traffic',
      },
      {
        type: 'bar' as const, label: 'Traffic (projected)',
        data: [...nullPad.slice(0, -1), projTrafficRemainder],
        backgroundColor: 'rgba(58,110,164,0.1)', borderWidth: 1, borderColor: 'rgba(58,110,164,0.3)',
        borderRadius: 4, yAxisID: 'y', order: 3, stack: 'traffic',
      },
      {
        type: 'line' as const, label: 'Submission starts', data: AV_DATA.map(d => d.starts),
        borderColor: TP.green, backgroundColor: TP.green, borderWidth: 2.5,
        pointRadius: 5, pointBackgroundColor: TP.green, tension: 0.3, yAxisID: 'y1', order: 1,
      },
      {
        type: 'line' as const, label: 'Starts (projected)',
        data: [...nullPad.slice(0, -1), projStarts],
        borderColor: TP.green, backgroundColor: 'transparent', borderWidth: 0,
        pointRadius: 7, pointBackgroundColor: 'rgba(29,158,117,0.15)',
        pointBorderColor: TP.green, pointBorderWidth: 2, pointStyle: 'circle', tension: 0, yAxisID: 'y1', order: 1,
      },
      {
        type: 'line' as const, label: 'Waiting / needs info', data: AV_DATA.map(d => d.waiting),
        borderColor: TP.red, backgroundColor: 'rgba(226,75,74,0.1)', borderWidth: 2.5,
        pointRadius: 5, pointBackgroundColor: TP.red, fill: true, tension: 0.3, yAxisID: 'y1', order: 0,
      },
      {
        type: 'line' as const, label: 'Waiting (projected)',
        data: [...nullPad.slice(0, -1), projWaiting],
        borderColor: TP.red, backgroundColor: 'transparent', borderWidth: 0,
        pointRadius: 7, pointBackgroundColor: 'rgba(226,75,74,0.15)',
        pointBorderColor: TP.red, pointBorderWidth: 2, pointStyle: 'circle', tension: 0, yAxisID: 'y1', order: 0,
      },
    ],
  };
  const mainChartOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Web traffic vs submission starts vs waiting queue', font: { size: 14, weight: 500 as const }, color: TP.navy },
      tooltip: { callbacks: { label: (ctx: { dataset: { label: string }; parsed: { y: number } }) => ctx.dataset.label + ': ' + ctx.parsed.y.toLocaleString() } },
    },
    scales: {
      x: { ticks: { autoSkip: false } },
      y: { position: 'left' as const, title: { display: true, text: 'Web traffic' }, ticks: { callback: (v: number | string) => Math.round(Number(v) / 1000) + 'K' } },
      y1: { position: 'right' as const, title: { display: true, text: 'Starts / waiting' }, grid: { drawOnChartArea: false }, ticks: { callback: (v: number | string) => Number(v).toLocaleString() } },
    },
  };

  // ── Chart 2: Rate trends ────────────────────────────────────────────
  const rateChartData = {
    labels,
    datasets: [
      {
        label: 'Start rate (traffic → starts)', data: startRates,
        borderColor: TP.purple, backgroundColor: TP.purple, borderWidth: 2.5,
        pointRadius: 5, pointBackgroundColor: TP.purple, tension: 0.3, yAxisID: 'y',
      },
      {
        label: 'Waiting as % of starts', data: waitPcts,
        borderColor: TP.red, backgroundColor: 'rgba(226,75,74,0.08)', borderWidth: 2.5,
        pointRadius: 5, pointBackgroundColor: TP.red, borderDash: [6, 3], fill: true, tension: 0.3, yAxisID: 'y1',
      },
    ],
  };
  const rateChartOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Conversion rate vs waiting queue buildup', font: { size: 14, weight: 500 as const }, color: TP.navy },
      tooltip: { callbacks: { label: (ctx: { dataset: { label: string }; parsed: { y: number } }) => ctx.dataset.label + ': ' + ctx.parsed.y + '%' } },
    },
    scales: {
      x: { ticks: { autoSkip: false } },
      y: { position: 'left' as const, title: { display: true, text: 'Start rate %' }, ticks: { callback: (v: number | string) => v + '%' } },
      y1: { position: 'right' as const, title: { display: true, text: 'Waiting % of starts' }, grid: { drawOnChartArea: false }, ticks: { callback: (v: number | string) => v + '%' } },
    },
  };

  // ── Chart 3: Stacked — forward vs stuck ─────────────────────────────
  const fwdData = AV_DATA.map((d, i) => d.partial ? projFwd : completionEst[i]);
  const waitData = AV_DATA.map(d => d.partial ? projWaiting : d.waiting);
  const greenBgs = AV_DATA.map(d => d.partial ? 'rgba(29,158,117,0.25)' : 'rgba(29,158,117,0.7)');
  const redBgs = AV_DATA.map(d => d.partial ? 'rgba(226,75,74,0.25)' : 'rgba(226,75,74,0.7)');
  const greenBorders = AV_DATA.map(d => d.partial ? 'rgba(29,158,117,0.6)' : 'rgba(29,158,117,0)');
  const redBorders = AV_DATA.map(d => d.partial ? 'rgba(226,75,74,0.6)' : 'rgba(226,75,74,0)');

  const stackedData = {
    labels, datasets: [
      { label: 'Moved forward', data: fwdData, backgroundColor: greenBgs, borderColor: greenBorders, borderWidth: 1.5, borderRadius: 0 },
      { label: 'Stuck waiting', data: waitData, backgroundColor: redBgs, borderColor: redBorders, borderWidth: 1.5, borderRadius: 4 },
    ],
  };
  const stackedOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Submission starts: moved forward vs stuck in waiting', font: { size: 14, weight: 500 as const }, color: TP.navy },
      tooltip: { callbacks: { label: (ctx: { dataset: { label: string }; parsed: { y: number } }) => ctx.dataset.label + ': ' + ctx.parsed.y.toLocaleString() } },
    },
    scales: {
      x: { stacked: true, ticks: { autoSkip: false } },
      y: { stacked: true, ticks: { callback: (v: number | string) => Number(v).toLocaleString() } },
    },
  };

  // ── Chart 4: Conversion lag — same-day vs returning ─────────────────
  const lagChartData = {
    labels: lagLabels,
    datasets: [
      {
        label: 'Same-day %', data: sameDayPcts,
        backgroundColor: lagLabels.map(l => l === 'May 23+' ? 'rgba(58,110,164,0.3)' : 'rgba(58,110,164,0.7)'),
        borderColor: lagLabels.map(l => l === 'May 23+' ? 'rgba(58,110,164,0.5)' : 'rgba(58,110,164,0)'),
        borderWidth: 1.5, borderRadius: 0,
      },
      {
        label: 'Returning %', data: returningPcts,
        backgroundColor: lagLabels.map(l => l === 'May 23+' ? 'rgba(239,159,39,0.3)' : 'rgba(239,159,39,0.7)'),
        borderColor: lagLabels.map(l => l === 'May 23+' ? 'rgba(239,159,39,0.5)' : 'rgba(239,159,39,0)'),
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
        <span style={{ fontSize: 13, color: '#888' }}>Assessment funnel health — Nov 2025 through May 2026 (split at May 22 update)</span>
      </div>

      {/* ===== Pre vs Post Comparison Cards ===== */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 28 }}>
        <div style={{ background: '#FFF5F5', borderRadius: 10, padding: '14px 16px', border: '1px solid #FECACA' }}>
          <div style={{ fontSize: 11, color: '#991B1B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Pre-update wait rate</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#991B1B' }}>{preWaitPct}%</div>
          <div style={{ fontSize: 12, color: '#DC2626' }}>{num(preUpdate.waiting)} of {num(preUpdate.starts)} starts</div>
          <div style={{ fontSize: 11, color: '#B91C1C', marginTop: 2 }}>May 1–22 (22 days)</div>
        </div>
        <div style={{ background: '#F0FDF4', borderRadius: 10, padding: '14px 16px', border: '1px solid #BBF7D0' }}>
          <div style={{ fontSize: 11, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Post-update wait rate</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#166534' }}>{postWaitPctVal}%</div>
          <div style={{ fontSize: 12, color: '#15803D' }}>{num(postUpdate.waiting)} of {num(postUpdate.starts)} starts</div>
          <div style={{ fontSize: 11, color: '#166534', marginTop: 2 }}>May 23+ ({POST_UPDATE_DAYS_ELAPSED} day, partial)</div>
        </div>
        <div style={{ background: '#F9FAFB', borderRadius: 10, padding: '14px 16px', border: '1px solid #E5E7EB' }}>
          <div style={{ fontSize: 11, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Same-day rate trend</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: TP.red }}>91% → 67%</div>
          <div style={{ fontSize: 12, color: '#6B7280' }}>Jan → May (pre-update)</div>
          <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>Fewer first-visit completions</div>
        </div>
        <div style={{ background: '#F9FAFB', borderRadius: 10, padding: '14px 16px', border: '1px solid #E5E7EB' }}>
          <div style={{ fontSize: 11, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Returning submissions</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: TP.amber }}>9% → 33%</div>
          <div style={{ fontSize: 12, color: '#6B7280' }}>Jan → May (pre-update)</div>
          <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>1 in 3 come back to finish</div>
        </div>
      </div>

      {/* ===== Trend callout ===== */}
      <div style={{ background: '#FFFBEB', borderRadius: 10, padding: '14px 18px', border: '1px solid #FDE68A', marginBottom: 24 }}>
        <div style={{ fontWeight: 600, color: '#92400E', fontSize: 14, marginBottom: 4 }}>Assessment update shipped May 22 — tracking before vs after</div>
        <div style={{ fontSize: 13, color: '#78350F', lineHeight: 1.6 }}>
          From Feb through May 22, the waiting/needs-info rate stayed at 35–44% of starts, meaning more than a third of
          people who began assessments got stuck and didn&apos;t finish. At the same time, same-day completion dropped from
          91% in January to 67% by May, and returning submissions (people who came back on a later day to finish) grew from
          9% to 33%. The update went live May 22. Day 1 data is mixed (some earlier starts completed today, some new starts
          haven&apos;t finished yet), so the real signal will emerge over 1–2 weeks.
        </div>
      </div>

      {/* ===== Chart 1: Main combo ===== */}
      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #E5E7EB', padding: 20, marginBottom: 20 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 12, fontSize: 12, color: '#6B7280' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 12, height: 12, borderRadius: 3, background: 'rgba(58,110,164,0.6)' }} /> Web traffic</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 12, height: 3, background: TP.green, borderRadius: 1 }} /> Submission starts</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 12, height: 3, background: TP.red, borderRadius: 1 }} /> Waiting / needs info</span>
        </div>
        <div style={{ height: 340 }}>
          <Bar data={mainChartData as any} options={mainChartOpts as any} />
        </div>
      </div>

      {/* ===== Chart 2: Rate trends ===== */}
      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #E5E7EB', padding: 20, marginBottom: 20 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 12, fontSize: 12, color: '#6B7280' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 12, height: 3, background: TP.purple, borderRadius: 1 }} /> Start rate (traffic → starts)</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 12, height: 3, background: TP.red, borderRadius: 1, borderTop: '1px dashed ' + TP.red }} /> Waiting as % of starts</span>
        </div>
        <div style={{ height: 280 }}>
          <Line data={rateChartData} options={rateChartOpts as any} />
        </div>
      </div>

      {/* ===== Chart 3: Stacked — forward vs stuck ===== */}
      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #E5E7EB', padding: 20, marginBottom: 20 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 12, fontSize: 12, color: '#6B7280' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 12, height: 12, borderRadius: 3, background: 'rgba(29,158,117,0.7)' }} /> Moved forward</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 12, height: 12, borderRadius: 3, background: 'rgba(226,75,74,0.7)' }} /> Stuck in waiting</span>
        </div>
        <div style={{ height: 280 }}>
          <Bar data={stackedData} options={stackedOpts as any} />
        </div>
      </div>

      {/* ===== NEW SECTION: Conversion Lag ===== */}
      <h3 style={{ fontSize: 18, fontWeight: 600, color: TP.navy, margin: '32px 0 16px' }}>Conversion Lag: Created Date → Submission</h3>
      <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 16, lineHeight: 1.5 }}>
        How long between when someone creates an account and when they complete their submission.
        &quot;Same-day&quot; means they finished the same day they started. &quot;Returning&quot; means they came back
        on a different day to complete it. Data from Salesforce &quot;Tracking Conversions&quot; export.
      </div>

      {/* Chart 4: Same-day vs Returning stacked bar */}
      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #E5E7EB', padding: 20, marginBottom: 20 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 12, fontSize: 12, color: '#6B7280' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 12, height: 12, borderRadius: 3, background: 'rgba(58,110,164,0.7)' }} /> Same-day</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 12, height: 12, borderRadius: 3, background: 'rgba(239,159,39,0.7)' }} /> Returning</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 12, height: 12, borderRadius: 3, background: 'rgba(150,150,150,0.15)', border: '1.5px solid rgba(150,150,150,0.5)' }} /> May 23+ (day 1)</span>
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
                const isPost = d.label === 'May 23+';
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
        <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 8 }}>* May 23+ = {POST_UPDATE_DAYS_ELAPSED} partial day, post-update. 6 of 27 submissions were crossover (created before May 23, submitted after update). 5 additional submissions counted manually (no submission date in Salesforce, dev fix pending).</div>
      </div>

      {/* ===== AV funnel data table ===== */}
      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #E5E7EB', padding: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: TP.navy, marginTop: 0, marginBottom: 12 }}>Assessment funnel data</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #E5E7EB' }}>
                <th style={{ textAlign: 'left', padding: '8px 10px', color: '#6B7280', fontWeight: 600 }}>Period</th>
                <th style={{ textAlign: 'right', padding: '8px 10px', color: '#6B7280', fontWeight: 600 }}>Traffic</th>
                <th style={{ textAlign: 'right', padding: '8px 10px', color: '#6B7280', fontWeight: 600 }}>Starts</th>
                <th style={{ textAlign: 'right', padding: '8px 10px', color: '#6B7280', fontWeight: 600 }}>Waiting</th>
                <th style={{ textAlign: 'right', padding: '8px 10px', color: '#6B7280', fontWeight: 600 }}>Start rate</th>
                <th style={{ textAlign: 'right', padding: '8px 10px', color: '#6B7280', fontWeight: 600 }}>Wait %</th>
                <th style={{ textAlign: 'right', padding: '8px 10px', color: '#6B7280', fontWeight: 600 }}>Moved fwd</th>
              </tr>
            </thead>
            <tbody>
              {AV_DATA.map((d, i) => {
                const sr = startRates[i];
                const wp = waitPcts[i];
                const fwd = completionEst[i];
                const isPost = d.period === 'post-update';
                const isPre = d.period === 'pre-update';
                const rowBg = isPost ? '#F0FDF4' : isPre ? '#FFF5F5' : undefined;
                return (
                  <tr key={d.label} style={{ borderBottom: '1px solid #F3F4F6', background: rowBg }}>
                    <td style={{ padding: '8px 10px', fontWeight: 600, color: isPost ? '#166534' : isPre ? '#991B1B' : TP.navy }}>
                      {d.label}{d.partial ? ' *' : ''}
                    </td>
                    <td style={{ padding: '8px 10px', textAlign: 'right' }}>{num(d.traffic)}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right' }}>{num(d.starts)}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right' }}>{num(d.waiting)}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right' }}>{sr}%</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600, color: wp > 30 ? TP.red : TP.text }}>{wp}%</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right' }}>{num(fwd)}</td>
                  </tr>
                );
              })}
              <tr style={{ borderBottom: '1px solid #F3F4F6', background: '#F0F9FF' }}>
                <td style={{ padding: '8px 10px', fontWeight: 500, fontStyle: 'italic', color: '#3A6EA4' }}>May 23+ proj</td>
                <td style={{ padding: '8px 10px', textAlign: 'right', color: '#3A6EA4', fontStyle: 'italic' }}>{num(projTraffic)}</td>
                <td style={{ padding: '8px 10px', textAlign: 'right', color: '#3A6EA4', fontStyle: 'italic' }}>{num(projStarts)}</td>
                <td style={{ padding: '8px 10px', textAlign: 'right', color: '#3A6EA4', fontStyle: 'italic' }}>{num(projWaiting)}</td>
                <td style={{ padding: '8px 10px', textAlign: 'right', color: '#3A6EA4', fontStyle: 'italic' }}>{projStartRate}%</td>
                <td style={{ padding: '8px 10px', textAlign: 'right', color: '#3A6EA4', fontStyle: 'italic' }}>{projWaitPct}%</td>
                <td style={{ padding: '8px 10px', textAlign: 'right', color: '#3A6EA4', fontStyle: 'italic' }}>{num(projFwd)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 8 }}>
          May split at assessment update (May 22). Pre-update = 22 days. Post-update = {POST_UPDATE_DAYS_ELAPSED} day elapsed, projected to {POST_UPDATE_DAYS_TOTAL} days.
          Wait % above 30% highlighted red.
        </div>
      </div>
    </div>
  );
}
