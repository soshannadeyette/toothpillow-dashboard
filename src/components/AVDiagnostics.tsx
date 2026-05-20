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
const AV_DATA = [
  { label: 'Nov 25', month: 11, year: 2025, traffic: 54674, starts: 1697, waiting: 97,   partial: false },
  { label: 'Dec 25', month: 12, year: 2025, traffic: 36031, starts: 1435, waiting: 192,  partial: false },
  { label: 'Jan 26', month: 1,  year: 2026, traffic: 37320, starts: 1514, waiting: 108,  partial: false },
  { label: 'Feb 26', month: 2,  year: 2026, traffic: 51480, starts: 2506, waiting: 889,  partial: false },
  { label: 'Mar 26', month: 3,  year: 2026, traffic: 39218, starts: 2587, waiting: 992,  partial: false },
  { label: 'Apr 26', month: 4,  year: 2026, traffic: 30311, starts: 1692, waiting: 588,  partial: false },
  { label: 'May 26', month: 5,  year: 2026, traffic: 18033, starts: 996,  waiting: 439,  partial: true },
];

// ── May projection ───────────────────────────────────────────────────
const MAY_DAYS_ELAPSED = 20; // data through 5/20
const MAY_DAYS_TOTAL = 31;
const PROJ_MULT = MAY_DAYS_TOTAL / MAY_DAYS_ELAPSED;

function proj(actual: number): number { return Math.round(actual * PROJ_MULT); }
function num(v: number): string { return v.toLocaleString(); }
function pct(v: number, t: number): string { return t > 0 ? (v / t * 100).toFixed(1) + '%' : '--'; }

function trendArrow(curr: number, prev: number): { arrow: string; color: string; pctStr: string } {
  if (!prev) return { arrow: '', color: TP.text, pctStr: '--' };
  const change = ((curr - prev) / prev * 100);
  const rounded = Math.round(change * 10) / 10;
  if (rounded > 0) return { arrow: '▲', color: TP.green, pctStr: `+${rounded}%` };
  if (rounded < 0) return { arrow: '▼', color: TP.red, pctStr: `${rounded}%` };
  return { arrow: '—', color: TP.text, pctStr: '0%' };
}

export default function AVDiagnostics() {
  const labels = AV_DATA.map(d => d.label);
  const latest = AV_DATA[AV_DATA.length - 1];
  const prev = AV_DATA[AV_DATA.length - 2];

  // Derived metrics
  const startRates = AV_DATA.map(d => Math.round(d.starts / d.traffic * 1000) / 10);
  const waitPcts = AV_DATA.map(d => Math.round(d.waiting / d.starts * 1000) / 10);
  const completionEst = AV_DATA.map(d => d.starts - d.waiting);

  // May projections
  const projTraffic = proj(latest.traffic);
  const projStarts = proj(latest.starts);
  const projWaiting = proj(latest.waiting);
  const projFwd = projStarts - projWaiting;
  const projStartRate = Math.round(projStarts / projTraffic * 1000) / 10;
  const projWaitPct = Math.round(projWaiting / projStarts * 1000) / 10;

  // Trend for waiting queue (use projected vs prev full month)
  const waitTrend = trendArrow(projWaiting, prev.waiting);
  // Trend for start rate
  const latestStartRate = startRates[startRates.length - 1];
  const prevStartRate = startRates[startRates.length - 2];

  // Find the April spike
  const aprData = AV_DATA.find(d => d.month === 4 && d.year === 2026);
  const marData = AV_DATA.find(d => d.month === 3 && d.year === 2026);

  // ── Chart 1: Traffic + Starts + Waiting (combo) ──────────────────
  // Traffic bars: actual solid, projected remainder transparent (stacked on May only)
  const nullPad = AV_DATA.map(() => null as number | null);
  const projTrafficRemainder = projTraffic - latest.traffic;

  const mainChartData = {
    labels,
    datasets: [
      {
        type: 'bar' as const,
        label: 'Web traffic',
        data: AV_DATA.map(d => d.traffic),
        backgroundColor: 'rgba(58,110,164,0.6)',
        borderRadius: 0,
        yAxisID: 'y',
        order: 3,
        stack: 'traffic',
      },
      {
        type: 'bar' as const,
        label: 'Traffic (projected)',
        data: [...nullPad.slice(0, -1), projTrafficRemainder],
        backgroundColor: 'rgba(58,110,164,0.15)',
        borderWidth: 1,
        borderColor: 'rgba(58,110,164,0.4)',
        borderRadius: 4,
        yAxisID: 'y',
        order: 3,
        stack: 'traffic',
      },
      {
        type: 'line' as const,
        label: 'Submission starts',
        data: AV_DATA.map(d => d.starts),
        borderColor: TP.green,
        backgroundColor: TP.green,
        borderWidth: 2.5,
        pointRadius: 5,
        pointBackgroundColor: TP.green,
        tension: 0.3,
        yAxisID: 'y1',
        order: 1,
      },
      {
        type: 'line' as const,
        label: 'Starts (projected)',
        data: [...nullPad.slice(0, -1), projStarts],
        borderColor: TP.green,
        backgroundColor: 'transparent',
        borderWidth: 0,
        pointRadius: 7,
        pointBackgroundColor: 'rgba(29,158,117,0.15)',
        pointBorderColor: TP.green,
        pointBorderWidth: 2,
        pointStyle: 'circle',
        tension: 0,
        yAxisID: 'y1',
        order: 1,
      },
      {
        type: 'line' as const,
        label: 'Waiting / needs info',
        data: AV_DATA.map(d => d.waiting),
        borderColor: TP.red,
        backgroundColor: 'rgba(226,75,74,0.1)',
        borderWidth: 2.5,
        pointRadius: 5,
        pointBackgroundColor: TP.red,
        fill: true,
        tension: 0.3,
        yAxisID: 'y1',
        order: 0,
      },
      {
        type: 'line' as const,
        label: 'Waiting (projected)',
        data: [...nullPad.slice(0, -1), projWaiting],
        borderColor: TP.red,
        backgroundColor: 'transparent',
        borderWidth: 0,
        pointRadius: 7,
        pointBackgroundColor: 'rgba(226,75,74,0.15)',
        pointBorderColor: TP.red,
        pointBorderWidth: 2,
        pointStyle: 'circle',
        tension: 0,
        yAxisID: 'y1',
        order: 0,
      },
    ],
  };
  const mainChartOpts = {
    responsive: true,
    maintainAspectRatio: false,
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

  // ── Chart 2: Rate trends ──────────────────────────────────────────
  const rateChartData = {
    labels,
    datasets: [
      {
        label: 'Start rate (traffic → starts)',
        data: startRates,
        borderColor: TP.purple,
        backgroundColor: TP.purple,
        borderWidth: 2.5,
        pointRadius: 5,
        pointBackgroundColor: TP.purple,
        tension: 0.3,
        yAxisID: 'y',
      },
      {
        label: 'Waiting as % of starts',
        data: waitPcts,
        borderColor: TP.red,
        backgroundColor: 'rgba(226,75,74,0.08)',
        borderWidth: 2.5,
        pointRadius: 5,
        pointBackgroundColor: TP.red,
        borderDash: [6, 3],
        fill: true,
        tension: 0.3,
        yAxisID: 'y1',
      },
    ],
  };
  const rateChartOpts = {
    responsive: true,
    maintainAspectRatio: false,
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

  // ── Chart 3: Stacked bar — starts that completed vs stuck waiting ──
  // For May, show actual + projected remainder as lighter segments
  const projFwdRemainder = projFwd - completionEst[completionEst.length - 1];
  const projWaitRemainder = projWaiting - latest.waiting;

  const stackedData = {
    labels,
    datasets: [
      {
        label: 'Moved forward',
        data: completionEst,
        backgroundColor: 'rgba(29,158,117,0.7)',
        borderRadius: 0,
      },
      {
        label: 'Stuck waiting',
        data: AV_DATA.map(d => d.waiting),
        backgroundColor: 'rgba(226,75,74,0.7)',
        borderRadius: 0,
      },
      {
        label: 'Moved forward (projected)',
        data: [...AV_DATA.slice(0, -1).map(() => null as number | null), projFwdRemainder],
        backgroundColor: 'rgba(29,158,117,0.12)',
        borderWidth: 1.5,
        borderColor: 'rgba(29,158,117,0.6)',
        borderRadius: 0,
      },
      {
        label: 'Stuck waiting (projected)',
        data: [...AV_DATA.slice(0, -1).map(() => null as number | null), projWaitRemainder],
        backgroundColor: 'rgba(226,75,74,0.12)',
        borderWidth: 1.5,
        borderColor: 'rgba(226,75,74,0.6)',
        borderRadius: 4,
      },
    ],
  };
  const stackedOpts = {
    responsive: true,
    maintainAspectRatio: false,
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

  return (
    <div style={{ maxWidth: 1100 }}>
      {/* ===== Header ===== */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 600, color: TP.navy, margin: 0 }}>AV Diagnostics</h2>
        <span style={{ fontSize: 13, color: '#888' }}>Assessment funnel health — Nov 2025 through May 2026</span>
      </div>

      {/* ===== Metric cards ===== */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 28 }}>
        {/* April waiting spike */}
        <div style={{ background: '#FFF5F5', borderRadius: 10, padding: '14px 16px', border: '1px solid #FECACA' }}>
          <div style={{ fontSize: 12, color: '#991B1B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Apr waiting queue</div>
          <div style={{ fontSize: 26, fontWeight: 600, color: '#991B1B' }}>{num(aprData?.waiting || 0)}</div>
          <div style={{ fontSize: 12, color: '#DC2626' }}>{pct(aprData?.waiting || 0, aprData?.starts || 1)} of starts — {Math.round((aprData?.waiting || 0) / (marData?.waiting || 1))}x March</div>
        </div>
        {/* Current month waiting */}
        <div style={{ background: '#F9FAFB', borderRadius: 10, padding: '14px 16px', border: '1px solid #E5E7EB' }}>
          <div style={{ fontSize: 12, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>May waiting (MTD)</div>
          <div style={{ fontSize: 26, fontWeight: 600, color: TP.navy }}>{num(latest.waiting)}</div>
          <div style={{ fontSize: 12, color: '#6B7280' }}>proj {num(projWaiting)} | <span style={{ color: waitTrend.color }}>{waitTrend.arrow} {waitTrend.pctStr} vs Apr</span></div>
        </div>
        {/* May projected starts */}
        <div style={{ background: '#F9FAFB', borderRadius: 10, padding: '14px 16px', border: '1px solid #E5E7EB' }}>
          <div style={{ fontSize: 12, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>May starts (MTD)</div>
          <div style={{ fontSize: 26, fontWeight: 600, color: TP.navy }}>{num(latest.starts)}</div>
          <div style={{ fontSize: 12, color: '#6B7280' }}>proj {num(projStarts)} | {projStartRate}% start rate</div>
        </div>
        {/* Nov baseline */}
        <div style={{ background: '#F9FAFB', borderRadius: 10, padding: '14px 16px', border: '1px solid #E5E7EB' }}>
          <div style={{ fontSize: 12, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Nov 25 baseline</div>
          <div style={{ fontSize: 26, fontWeight: 600, color: TP.navy }}>{num(AV_DATA[0].waiting)}</div>
          <div style={{ fontSize: 12, color: '#6B7280' }}>waiting = {pct(AV_DATA[0].waiting, AV_DATA[0].starts)} of starts</div>
        </div>
      </div>

      {/* ===== Trend callout ===== */}
      <div style={{ background: '#FFFBEB', borderRadius: 10, padding: '14px 18px', border: '1px solid #FDE68A', marginBottom: 24 }}>
        <div style={{ fontWeight: 600, color: '#92400E', fontSize: 14, marginBottom: 4 }}>Key trend: waiting queue climbed sharply Feb–Mar, then dropped back in April</div>
        <div style={{ fontSize: 13, color: '#78350F', lineHeight: 1.6 }}>
          From Nov 2025 through Jan 2026, the waiting/needs-info queue held steady at 97–192 (5–7% of starts).
          Feb and Mar saw a sharp climb to 889 and 992 (35–38% of starts), meaning more than a third of people who started
          assessments got stuck. April dropped to 588 (35% of starts) — the raw count fell but the rate stayed elevated.
          Traffic declined 23% in April while the waiting rate held flat, which suggests the bottleneck is in the assessment
          completion flow itself, not in who&apos;s arriving at the site.
        </div>
      </div>

      {/* ===== Chart 1: Main combo ===== */}
      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #E5E7EB', padding: 20, marginBottom: 20 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 12, fontSize: 12, color: '#6B7280' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 12, height: 12, borderRadius: 3, background: 'rgba(58,110,164,0.6)' }} /> Web traffic</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 12, height: 3, background: TP.green, borderRadius: 1 }} /> Submission starts</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 12, height: 3, background: TP.red, borderRadius: 1 }} /> Waiting / needs info</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 12, height: 3, borderBottom: '2px dashed #999', borderRadius: 1 }} /> Projected (May)</span>
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

      {/* ===== Chart 3: Stacked — moved forward vs stuck ===== */}
      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #E5E7EB', padding: 20, marginBottom: 20 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 12, fontSize: 12, color: '#6B7280' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 12, height: 12, borderRadius: 3, background: 'rgba(29,158,117,0.7)' }} /> Moved forward</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 12, height: 12, borderRadius: 3, background: 'rgba(226,75,74,0.7)' }} /> Stuck in waiting</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 12, height: 12, borderRadius: 3, background: 'rgba(150,150,150,0.2)', border: '1px dashed #999' }} /> Projected remainder</span>
        </div>
        <div style={{ height: 280 }}>
          <Bar data={stackedData} options={stackedOpts as any} />
        </div>
      </div>

      {/* ===== Data table ===== */}
      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #E5E7EB', padding: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: TP.navy, marginTop: 0, marginBottom: 12 }}>Raw data</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #E5E7EB' }}>
                <th style={{ textAlign: 'left', padding: '8px 10px', color: '#6B7280', fontWeight: 600 }}>Month</th>
                <th style={{ textAlign: 'right', padding: '8px 10px', color: '#6B7280', fontWeight: 600 }}>Traffic</th>
                <th style={{ textAlign: 'right', padding: '8px 10px', color: '#6B7280', fontWeight: 600 }}>Starts</th>
                <th style={{ textAlign: 'right', padding: '8px 10px', color: '#6B7280', fontWeight: 600 }}>Waiting</th>
                <th style={{ textAlign: 'right', padding: '8px 10px', color: '#6B7280', fontWeight: 600 }}>Start rate</th>
                <th style={{ textAlign: 'right', padding: '8px 10px', color: '#6B7280', fontWeight: 600 }}>Wait %</th>
                <th style={{ textAlign: 'right', padding: '8px 10px', color: '#6B7280', fontWeight: 600 }}>Moved fwd</th>
                <th style={{ textAlign: 'right', padding: '8px 10px', color: '#3A6EA4', fontWeight: 600, borderLeft: '2px solid #E5E7EB' }}>Proj traffic</th>
                <th style={{ textAlign: 'right', padding: '8px 10px', color: '#3A6EA4', fontWeight: 600 }}>Proj starts</th>
                <th style={{ textAlign: 'right', padding: '8px 10px', color: '#3A6EA4', fontWeight: 600 }}>Proj waiting</th>
                <th style={{ textAlign: 'right', padding: '8px 10px', color: '#3A6EA4', fontWeight: 600 }}>Proj fwd</th>
              </tr>
            </thead>
            <tbody>
              {AV_DATA.map((d, i) => {
                const sr = startRates[i];
                const wp = waitPcts[i];
                const fwd = completionEst[i];
                const isApril = d.month === 4 && d.year === 2026;
                const showProj = d.partial;
                return (
                  <tr key={d.label} style={{
                    borderBottom: '1px solid #F3F4F6',
                    background: isApril ? '#FFF5F5' : 'transparent',
                  }}>
                    <td style={{ padding: '8px 10px', fontWeight: 500 }}>
                      {d.label}{d.partial ? ' *' : ''}
                    </td>
                    <td style={{ padding: '8px 10px', textAlign: 'right' }}>{num(d.traffic)}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right' }}>{num(d.starts)}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', color: isApril ? '#DC2626' : 'inherit', fontWeight: isApril ? 600 : 400 }}>
                      {num(d.waiting)}
                    </td>
                    <td style={{ padding: '8px 10px', textAlign: 'right' }}>{sr}%</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', color: wp > 50 ? '#DC2626' : 'inherit', fontWeight: wp > 50 ? 600 : 400 }}>
                      {wp}%
                    </td>
                    <td style={{ padding: '8px 10px', textAlign: 'right' }}>{num(fwd)}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', borderLeft: '2px solid #E5E7EB', color: '#3A6EA4', fontStyle: 'italic' }}>
                      {showProj ? num(proj(d.traffic)) : '—'}
                    </td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', color: '#3A6EA4', fontStyle: 'italic' }}>
                      {showProj ? num(proj(d.starts)) : '—'}
                    </td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', color: '#3A6EA4', fontStyle: 'italic' }}>
                      {showProj ? num(proj(d.waiting)) : '—'}
                    </td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', color: '#3A6EA4', fontStyle: 'italic' }}>
                      {showProj ? num(proj(d.starts) - proj(d.waiting)) : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 8 }}>* Partial month (through 5/20) &nbsp;|&nbsp; Proj = pace extrapolated to {MAY_DAYS_TOTAL} days ({MAY_DAYS_ELAPSED} elapsed)</div>
      </div>
    </div>
  );
}
