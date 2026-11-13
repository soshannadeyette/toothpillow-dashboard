'use client';

import { useState, type ReactNode } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import {
  familyPool,
  cardStatus,
  keyFindings,
  enrollmentByMonth,
  GHL_AS_OF,
  SF_EXPORT_DATE,
  type FamilyPoolRow,
  type CardStatusRow,
} from '@/data/pediatricDrip';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

/* ------------------------------------------------------------------
   CONSTANTS
   ------------------------------------------------------------------ */
const MONTHS = [
  '2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06',
  '2026-07', '2026-08', '2026-09', '2026-10', '2026-11',
];
const MON_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'];

const COLORS = {
  off: '#9CA3AF',
  on: '#F97316',
  onDrip: '#F97316',
  novBorder: '#F97316',
  teal: '#0D9488',
  navy: '#1B2A4A',
  text: '#333333',
  muted: '#6b7280',
  border: '#e5e7eb',
  pillOn: '#ECFDF5',
  pillOnText: '#065F46',
  pillOff: '#F3F4F6',
  pillOffText: '#6B7280',
  pillDrip: '#DBEAFE',
  pillDripText: '#1E40AF',
};

type Metric = 'bookedCall' | 'bookedWithin3d' | 'bookedWithin7d';

const METRIC_OPTIONS: { key: Metric; label: string; headlineLabel: string }[] = [
  { key: 'bookedCall', label: 'Booked a call', headlineLabel: 'booked a call' },
  { key: 'bookedWithin3d', label: 'Within 3 days', headlineLabel: 'booked within 3 days' },
  { key: 'bookedWithin7d', label: 'Within 7 days', headlineLabel: 'booked within 7 days' },
];

/* ------------------------------------------------------------------
   HELPERS
   ------------------------------------------------------------------ */
function getRow(type: 'hybrid' | 'screening', month: string): FamilyPoolRow | undefined {
  return familyPool.find(r => r.type === type && r.month === month);
}

function getCardStatus(month: string): CardStatusRow | undefined {
  return cardStatus.find(c => c.month === month);
}

function pct(n: number, d: number): number {
  return d === 0 ? 0 : Math.round((n / d) * 1000) / 10;
}

function fmtPct(v: number): string {
  return `${v.toFixed(1)}%`;
}

function metricValue(row: FamilyPoolRow, metric: Metric): number {
  return row[metric];
}

/* ------------------------------------------------------------------
   COMPONENTS
   ------------------------------------------------------------------ */

function StatusPill({ status }: { status: CardStatusRow }) {
  let bg = COLORS.pillOff;
  let color = COLORS.pillOffText;
  let borderColor = COLORS.border;

  if (status.status === 'on') {
    bg = COLORS.pillOn;
    color = COLORS.pillOnText;
    borderColor = '#A7F3D0';
  } else if (status.status === 'on+drip') {
    bg = COLORS.pillDrip;
    color = COLORS.pillDripText;
    borderColor = '#93C5FD';
  }

  return (
    <span style={{
      display: 'inline-block',
      fontSize: 10,
      fontWeight: 600,
      padding: '2px 6px',
      borderRadius: 8,
      background: bg,
      color,
      border: `1px solid ${borderColor}`,
      whiteSpace: 'nowrap',
    }}>
      {status.label}
    </span>
  );
}

function MetricToggle({ active, onChange }: { active: Metric; onChange: (m: Metric) => void }) {
  return (
    <div style={{ display: 'flex', gap: 0, marginBottom: 16 }}>
      {METRIC_OPTIONS.map(opt => (
        <button
          key={opt.key}
          onClick={() => onChange(opt.key)}
          style={{
            fontSize: 13,
            fontWeight: 600,
            padding: '8px 16px',
            cursor: 'pointer',
            border: `1px solid ${COLORS.border}`,
            borderRight: opt.key === 'bookedWithin7d' ? `1px solid ${COLORS.border}` : 'none',
            borderRadius: opt.key === 'bookedCall' ? '8px 0 0 8px' : opt.key === 'bookedWithin7d' ? '0 8px 8px 0' : '0',
            background: active === opt.key ? COLORS.navy : '#fff',
            color: active === opt.key ? '#fff' : COLORS.text,
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function FamilySection({ type, label }: { type: 'hybrid' | 'screening'; label: string }) {
  const [metric, setMetric] = useState<Metric>('bookedCall');
  const [showNumbers, setShowNumbers] = useState(false);
  const metricInfo = METRIC_OPTIONS.find(o => o.key === metric)!;

  // Build per-month data
  const monthData = MONTHS.map(m => {
    const row = getRow(type, m);
    const cs = getCardStatus(m);
    const referred = row?.referred ?? 0;
    const value = row ? metricValue(row, metric) : 0;
    const rate = pct(value, referred);
    return { month: m, referred, value, rate, cardStatus: cs };
  });

  // Headline: compare Nov vs Oct
  const nov = monthData[10];
  const oct = monthData[9];
  const novLabel = `November 1–13: ${fmtPct(nov.rate)} (${nov.value} of ${nov.referred})`;
  const octLabel = `October: ${fmtPct(oct.rate)} (${oct.value} of ${oct.referred})`;

  // Average for Jan-Oct
  const janOctTotal = monthData.slice(0, 10);
  const janOctReferred = janOctTotal.reduce((s, d) => s + d.referred, 0);
  const janOctValue = janOctTotal.reduce((s, d) => s + d.value, 0);
  const janOctRate = pct(janOctValue, janOctReferred);

  // Chart data
  const barColors = monthData.map(d => {
    if (!d.cardStatus || d.cardStatus.status === 'off') return COLORS.off;
    return COLORS.on;
  });

  const barBorderColors = monthData.map((d, i) => {
    if (i === 10) return COLORS.novBorder; // Nov gets a visible border
    return 'transparent';
  });

  const barBorderWidth = monthData.map((_, i) => (i === 10 ? 2 : 0));

  const barBorderDash = monthData.map((_, i) => (i === 10 ? [4, 4] : []));

  const chartData = {
    labels: MON_LABELS,
    datasets: [
      {
        data: monthData.map(d => d.rate),
        backgroundColor: barColors,
        borderColor: barBorderColors,
        borderWidth: barBorderWidth,
        borderDash: undefined as number[] | undefined,
        borderRadius: 4,
        barPercentage: 0.7,
        categoryPercentage: 0.8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: { parsed: { y: number | null }; dataIndex: number }) => {
            const d = monthData[ctx.dataIndex];
            const v = ctx.parsed.y ?? 0;
            return `${fmtPct(v)} (${d.value} of ${d.referred})`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (v: string | number) => `${v}%`,
          font: { size: 11 },
        },
        grid: { color: '#f0f0f0' },
      },
      x: {
        ticks: { font: { size: 11 } },
        grid: { display: false },
      },
    },
  };

  // Custom datalabels via plugin-less approach: use a second hidden dataset trick,
  // or simpler: use the animation onComplete. Since Chart.js react wrapper makes this
  // tricky, we'll just show % labels via a Chart.js plugin registered inline.
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const datalabelPlugin = {
    id: `datalabel-${type}-${metric}`,
    afterDatasetsDraw(chart: any) {
      const { ctx } = chart;
      const meta = chart.getDatasetMeta(0);
      ctx.save();
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillStyle = COLORS.navy;
      meta.data.forEach((bar: any, i: number) => {
        const val = chart.data.datasets[0].data[i];
        if (val > 0) {
          ctx.fillText(`${val.toFixed(1)}%`, bar.x, bar.y - 4);
        }
      });
      ctx.restore();
    },
  };

  const novDashedPlugin = {
    id: `nov-dashed-${type}-${metric}`,
    afterDatasetsDraw(chart: any) {
      const meta = chart.getDatasetMeta(0);
      const novBar = meta.data[10];
      if (!novBar) return;
      const { ctx } = chart;
      ctx.save();
      ctx.setLineDash([4, 3]);
      ctx.strokeStyle = COLORS.novBorder;
      ctx.lineWidth = 2;
      const x = novBar.x - novBar.width / 2;
      const y = novBar.y;
      const w = novBar.width;
      const h = novBar.base - novBar.y;
      ctx.strokeRect(x, y, w, h);
      ctx.restore();
    },
  };
  /* eslint-enable @typescript-eslint/no-explicit-any */

  return (
    <div style={{ marginBottom: 40 }}>
      {/* Section header */}
      <h3 style={{
        fontSize: 15,
        fontWeight: 700,
        color: COLORS.teal,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 12,
        marginTop: 0,
      }}>
        {label}
      </h3>

      {/* Metric toggle */}
      <MetricToggle active={metric} onChange={setMetric} />

      {/* Headline */}
      <h4 style={{ fontSize: 16, fontWeight: 700, color: COLORS.navy, marginBottom: 8, marginTop: 0 }}>
        {novLabel} {metricInfo.headlineLabel}. {octLabel}.
      </h4>

      {/* Description paragraph */}
      <p style={{ fontSize: 13, color: COLORS.muted, lineHeight: 1.6, marginBottom: 16, marginTop: 0 }}>
        {nov.rate > oct.rate
          ? `November is ${(nov.rate - oct.rate).toFixed(1)} points above October.`
          : nov.rate < oct.rate
          ? `November is ${(oct.rate - nov.rate).toFixed(1)} points below October.`
          : 'November matches October.'}
        {' '}Families counted: {nov.referred} vs {oct.referred}.
        {' '}The average for Jan–Oct is {fmtPct(janOctRate)}.
        {' '}With {nov.referred} families, one booking moves November&apos;s rate by {nov.referred > 0 ? (100 / nov.referred).toFixed(1) : '0'} points.
      </p>

      {/* Chart */}
      <div style={{ height: 280, marginBottom: 8 }}>
        <Bar data={chartData} options={chartOptions} plugins={[datalabelPlugin, novDashedPlugin]} />
      </div>

      {/* Status pills row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${MONTHS.length}, 1fr)`,
        gap: 2,
        textAlign: 'center',
        marginBottom: 16,
      }}>
        {monthData.map(d => (
          <div key={d.month} style={{ fontSize: 10 }}>
            {d.month === '2026-11' ? (
              <div style={{ fontSize: 10, color: COLORS.muted, marginBottom: 2 }}>so far</div>
            ) : null}
            {d.cardStatus ? <StatusPill status={d.cardStatus} /> : null}
          </div>
        ))}
      </div>

      {/* Collapsible numbers table */}
      <button
        onClick={() => setShowNumbers(!showNumbers)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: 13,
          color: COLORS.muted,
          padding: 0,
          marginBottom: showNumbers ? 8 : 0,
        }}
      >
        {showNumbers ? '▼' : '▶'} Show the numbers
      </button>

      {showNumbers && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse', marginTop: 8 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${COLORS.border}` }}>
                <th style={{ textAlign: 'left', padding: '6px 8px', color: COLORS.muted, fontWeight: 600 }}>Month</th>
                <th style={{ textAlign: 'right', padding: '6px 8px', color: COLORS.muted, fontWeight: 600 }}>Referred</th>
                <th style={{ textAlign: 'right', padding: '6px 8px', color: COLORS.muted, fontWeight: 600 }}>Booked</th>
                <th style={{ textAlign: 'right', padding: '6px 8px', color: COLORS.muted, fontWeight: 600 }}>Within 3d</th>
                <th style={{ textAlign: 'right', padding: '6px 8px', color: COLORS.muted, fontWeight: 600 }}>Within 7d</th>
                <th style={{ textAlign: 'right', padding: '6px 8px', color: COLORS.muted, fontWeight: 600 }}>Rate</th>
                <th style={{ textAlign: 'center', padding: '6px 8px', color: COLORS.muted, fontWeight: 600 }}>Card</th>
              </tr>
            </thead>
            <tbody>
              {monthData.map((d, i) => {
                const row = getRow(type, d.month);
                return (
                  <tr key={d.month} style={{ borderBottom: `1px solid ${COLORS.border}`, background: i === 10 ? '#F0F9FF' : undefined }}>
                    <td style={{ padding: '6px 8px', fontWeight: i === 10 ? 700 : 400 }}>
                      {MON_LABELS[i]}{i === 10 ? ' *' : ''}
                    </td>
                    <td style={{ textAlign: 'right', padding: '6px 8px' }}>{d.referred}</td>
                    <td style={{ textAlign: 'right', padding: '6px 8px' }}>{row?.bookedCall ?? 0}</td>
                    <td style={{ textAlign: 'right', padding: '6px 8px' }}>{row?.bookedWithin3d ?? 0}</td>
                    <td style={{ textAlign: 'right', padding: '6px 8px' }}>{row?.bookedWithin7d ?? 0}</td>
                    <td style={{ textAlign: 'right', padding: '6px 8px', fontWeight: 600 }}>{fmtPct(d.rate)}</td>
                    <td style={{ textAlign: 'center', padding: '6px 8px' }}>
                      {d.cardStatus ? <StatusPill status={d.cardStatus} /> : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {/* Nov partial note */}
          <p style={{ fontSize: 11, color: COLORS.muted, marginTop: 4 }}>
            * November is partial (1st–13th only). Rate will change as more families schedule.
          </p>
        </div>
      )}
    </div>
  );
}

function EnrollmentSummary() {
  const k = keyFindings;
  const hybridEnroll = enrollmentByMonth.filter(r => r.type === 'hybrid');
  const screenEnroll = enrollmentByMonth.filter(r => r.type === 'screening');
  const hybridTotal = hybridEnroll.reduce((s, r) => s + r.checkouts, 0);
  const screenTotal = screenEnroll.reduce((s, r) => s + r.checkouts, 0);
  const hybridRev = hybridEnroll.reduce((s, r) => s + r.amtPaid, 0);
  const screenRev = screenEnroll.reduce((s, r) => s + r.amtPaid, 0);

  return (
    <div style={{
      border: `1px solid ${COLORS.border}`,
      borderRadius: 12,
      padding: 20,
      background: '#FAFAFA',
      marginTop: 20,
    }}>
      <h3 style={{ fontSize: 14, fontWeight: 700, color: COLORS.navy, margin: '0 0 12px 0' }}>
        Enrollment snapshot (Salesforce)
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, fontSize: 13 }}>
        <div>
          <div style={{ fontWeight: 600, color: COLORS.teal, marginBottom: 4 }}>Hybrid</div>
          <div>{hybridTotal} checkouts &middot; ${(hybridRev / 1000).toFixed(0)}K collected</div>
          <div style={{ color: COLORS.muted }}>
            Old flow: {k.oldFlowHybrid30d}% enrolled within 30d ({k.oldFlowHybridFamilies} families)
          </div>
        </div>
        <div>
          <div style={{ fontWeight: 600, color: COLORS.teal, marginBottom: 4 }}>Screening</div>
          <div>{screenTotal} checkouts &middot; ${(screenRev / 1000).toFixed(0)}K collected</div>
          <div style={{ color: COLORS.muted }}>
            Old flow: {k.oldFlowScreening30d}% enrolled within 30d ({k.oldFlowScreeningFamilies} families)
          </div>
        </div>
      </div>
      <p style={{ fontSize: 12, color: COLORS.muted, marginTop: 12, marginBottom: 0, lineHeight: 1.5 }}>
        New-drip families: {k.newDripHybridFamilies} hybrid + {k.newDripScreeningFamilies} screening.
        {k.newDripFirstCheckout
          ? ` First checkout: ${k.newDripFirstCheckout}.`
          : ' No checkouts yet (oldest family is 11 days old; first reach 30 days Dec 2).'}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------
   MAIN COMPONENT
   ------------------------------------------------------------------ */
export default function PediatricDrip() {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Page title + data freshness */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: COLORS.navy, margin: '0 0 4px 0' }}>
          Pediatric Drip Campaign
        </h2>
        <p style={{ fontSize: 12, color: COLORS.muted, margin: 0 }}>
          Drip launched Nov 2, 2026. Hybrid + screening families from dental offices.
          {GHL_AS_OF && <> &middot; GHL data as of {GHL_AS_OF}</>}
          {SF_EXPORT_DATE && <> &middot; Salesforce export {SF_EXPORT_DATE}</>}
        </p>
      </div>

      {/* Hybrid families */}
      <FamilySection type="hybrid" label="Hybrid Families" />

      {/* Screening families */}
      <FamilySection type="screening" label="Screening Families" />

      {/* Enrollment summary */}
      <EnrollmentSummary />
    </div>
  );
}
