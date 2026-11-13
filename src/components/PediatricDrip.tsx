'use client';

import { type ReactNode } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import {
  familyPool,
  keyFindings,
  GHL_AS_OF,
  SF_EXPORT_DATE,
} from '@/data/pediatricDrip';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend, annotationPlugin);

/* ------------------------------------------------------------------
   THEME
   ------------------------------------------------------------------ */
const TP = {
  blue: '#3A6EA4',
  skyBlue: '#B6CAE3',
  green: '#22C55E',
  red: '#EF4444',
  amber: '#F59E0B',
  amberLight: '#FEF9C3',
  navy: '#1B2A4A',
  text: '#333333',
  muted: '#6b7280',
  border: '#e5e7eb',
  lightBorder: '#f1f1f1',
  dripBlue: '#2563EB',
};

const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const monShort = (ym: string) => MON[parseInt(ym.slice(5, 7), 10) - 1];
const pct1 = (n: number, d: number) => d === 0 ? 0 : Math.round((n / d) * 1000) / 10;
const fmtPct = (v: number) => `${v.toFixed(1)}%`;

/* ------------------------------------------------------------------
   DATA HELPERS
   ------------------------------------------------------------------ */
const BASELINE_MONTHS = ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06', '2026-07', '2026-08'];
const DROP_MONTHS = ['2026-09', '2026-10'];
const NEW_DRIP_MONTHS = ['2026-11'];
const ALL_MONTHS = [...BASELINE_MONTHS, ...DROP_MONTHS, ...NEW_DRIP_MONTHS];

type Agg = { referred: number; booked: number; within3d: number; within7d: number };

function aggMonths(months: string[]): Agg {
  return months.reduce<Agg>((acc, m) => {
    const rows = familyPool.filter(r => r.month === m);
    for (const r of rows) {
      acc.referred += r.referred;
      acc.booked += r.bookedCall;
      acc.within3d += r.bookedWithin3d;
      acc.within7d += r.bookedWithin7d;
    }
    return acc;
  }, { referred: 0, booked: 0, within3d: 0, within7d: 0 });
}

function aggMonth(m: string): Agg {
  return aggMonths([m]);
}

const baseline = aggMonths(BASELINE_MONTHS);
const drop = aggMonths(DROP_MONTHS);
const oldFlow = aggMonths([...BASELINE_MONTHS, ...DROP_MONTHS]);
const newDrip = aggMonths(NEW_DRIP_MONTHS);

/* ------------------------------------------------------------------
   UI PRIMITIVES
   ------------------------------------------------------------------ */
function Card({ children, style }: { children: ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ border: `1px solid ${TP.border}`, borderRadius: 12, padding: 20, background: '#fff', marginBottom: 20, ...style }}>
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return <h3 style={{ fontSize: 16, fontWeight: 700, color: TP.navy, marginBottom: 12, marginTop: 0 }}>{children}</h3>;
}

function Takeaway({ children }: { children: ReactNode }) {
  return <p style={{ fontSize: 13, color: TP.muted, marginTop: 8, marginBottom: 0, lineHeight: 1.5 }}>{children}</p>;
}

/* ------------------------------------------------------------------
   SECTION 1: HEADLINE — Early Signal
   ------------------------------------------------------------------ */
function EarlySignal() {
  const oldBookingRate = pct1(oldFlow.booked, oldFlow.referred);
  const newBookingRate = pct1(newDrip.booked, newDrip.referred);
  const old7dRate = pct1(oldFlow.within7d, oldFlow.referred);
  const new7dRate = pct1(newDrip.within7d, newDrip.referred);

  const bookingDelta = newBookingRate - oldBookingRate;
  const speedDelta = new7dRate - old7dRate;

  return (
    <Card>
      <SectionTitle>Early signal: booking rates</SectionTitle>
      <p style={{ fontSize: 13, color: TP.muted, marginTop: -8, marginBottom: 16, lineHeight: 1.5 }}>
        Enrollment takes 30+ days, so we can&apos;t compare enrollment rates yet. But we can compare <strong style={{ color: TP.navy }}>booking rates</strong> — are families getting on PE calls?
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
        {/* Old flow booking rate */}
        <StatCard
          label="Old flow (Jan-Oct)"
          value={fmtPct(oldBookingRate)}
          detail={`${oldFlow.booked} of ${oldFlow.referred} booked a PE call`}
          bg="#f8fafc"
          borderColor={TP.border}
        />
        {/* New drip booking rate */}
        <StatCard
          label="New drip (Nov)"
          value={fmtPct(newBookingRate)}
          detail={`${newDrip.booked} of ${newDrip.referred} booked (11 days in)`}
          bg="#EFF6FF"
          borderColor={TP.dripBlue}
          delta={bookingDelta}
        />
        {/* 7-day speed */}
        <StatCard
          label="Booked within 7 days"
          value={`${fmtPct(new7dRate)} vs ${fmtPct(old7dRate)}`}
          detail={`New drip: ${newDrip.within7d} of ${newDrip.referred} | Old: ${oldFlow.within7d} of ${oldFlow.referred}`}
          bg={speedDelta >= 0 ? '#F0FDF4' : '#FEF2F2'}
          borderColor={speedDelta >= 0 ? '#22C55E' : '#EF4444'}
          delta={speedDelta}
        />
      </div>
      <Takeaway>
        Nov families are only 11 days old, so the booking rate will keep rising as more families schedule calls. The old-flow rate includes families with 10+ months of exposure, so it&apos;s a ceiling the new drip is tracking toward.
        {newDrip.within3d > 0 && ` Within 3 days: ${newDrip.within3d} of ${newDrip.referred} new-drip families (${fmtPct(pct1(newDrip.within3d, newDrip.referred))}) vs old flow ${fmtPct(pct1(oldFlow.within3d, oldFlow.referred))}.`}
      </Takeaway>
      <div style={{ fontSize: 11, color: TP.muted, marginTop: 8 }}>
        GHL data as of {GHL_AS_OF ?? 'awaiting scrape'} · Salesforce export {SF_EXPORT_DATE}
      </div>
    </Card>
  );
}

function StatCard({ label, value, detail, bg, borderColor, delta }: {
  label: string; value: string; detail: string; bg: string; borderColor: string; delta?: number;
}) {
  return (
    <div style={{ padding: 16, borderRadius: 8, background: bg, border: `1.5px solid ${borderColor}` }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: TP.muted, textTransform: 'uppercase', marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: TP.navy, display: 'flex', alignItems: 'center', gap: 8 }}>
        {value}
        {delta !== undefined && delta !== 0 && (
          <span style={{ fontSize: 13, fontWeight: 600, color: delta > 0 ? TP.green : TP.red }}>
            {delta > 0 ? '▲' : '▼'} {Math.abs(delta).toFixed(1)}pp
          </span>
        )}
      </div>
      <div style={{ fontSize: 12, color: TP.muted, marginTop: 4 }}>{detail}</div>
    </div>
  );
}

/* ------------------------------------------------------------------
   SECTION 2: MONTHLY BOOKING RATE CHART
   ------------------------------------------------------------------ */
function MonthlyBookingChart() {
  const monthData = ALL_MONTHS.map(m => {
    const a = aggMonth(m);
    return { month: m, rate: pct1(a.booked, a.referred), ...a };
  });

  const oldFlowAvg = pct1(oldFlow.booked, oldFlow.referred);

  const barColors = monthData.map(d => {
    if (NEW_DRIP_MONTHS.includes(d.month)) return TP.dripBlue;
    if (DROP_MONTHS.includes(d.month)) return TP.amber;
    return TP.skyBlue;
  });

  const barBorders = monthData.map(d => {
    if (NEW_DRIP_MONTHS.includes(d.month)) return '#1D4ED8';
    if (DROP_MONTHS.includes(d.month)) return '#D97706';
    return TP.blue;
  });

  return (
    <Card>
      <SectionTitle>Booking rate by month (all referral types combined)</SectionTitle>
      <div style={{ display: 'flex', gap: 16, marginBottom: 12, fontSize: 11, color: TP.muted }}>
        <span><span style={{ display: 'inline-block', width: 12, height: 12, background: TP.skyBlue, borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} /> Jan-Aug baseline</span>
        <span><span style={{ display: 'inline-block', width: 12, height: 12, background: TP.amber, borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} /> Sep-Oct (pre-drip drop)</span>
        <span><span style={{ display: 'inline-block', width: 12, height: 12, background: TP.dripBlue, borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} /> Nov (new drip)</span>
        <span><span style={{ display: 'inline-block', width: 20, height: 2, background: '#EF4444', marginRight: 4, verticalAlign: 'middle' }} /> Old-flow avg</span>
      </div>
      <div style={{ height: 260 }}>
        <Bar
          data={{
            labels: monthData.map(d => monShort(d.month)),
            datasets: [{
              label: 'Booking rate',
              data: monthData.map(d => d.rate),
              backgroundColor: barColors,
              borderColor: barBorders,
              borderWidth: monthData.map(d => NEW_DRIP_MONTHS.includes(d.month) ? 2 : 1),
              borderRadius: 4,
            }],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: (ctx) => {
                    const d = monthData[ctx.dataIndex];
                    return `${d.rate.toFixed(1)}% (${d.booked} of ${d.referred})`;
                  },
                },
              },
              annotation: {
                annotations: {
                  avgLine: {
                    type: 'line' as const,
                    yMin: oldFlowAvg,
                    yMax: oldFlowAvg,
                    borderColor: '#EF4444',
                    borderWidth: 2,
                    borderDash: [6, 3],
                    label: {
                      display: true,
                      content: `Old avg ${oldFlowAvg.toFixed(1)}%`,
                      position: 'end' as const,
                      font: { size: 10 },
                      backgroundColor: 'rgba(239,68,68,0.8)',
                    },
                  },
                },
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                max: Math.ceil(Math.max(...monthData.map(d => d.rate), oldFlowAvg) / 5) * 5 + 5,
                title: { display: true, text: '% booked a PE call', font: { size: 11 } },
                ticks: { callback: (v) => `${v}%` },
              },
            },
          }}
        />
      </div>
      <Takeaway>
        Nov is 11 days in with a {monthData[monthData.length - 1].rate.toFixed(1)}% booking rate. The old-flow average over 10 months was {oldFlowAvg.toFixed(1)}%. Sep-Oct dipped before the drip changed, which is what prompted the new campaign.
      </Takeaway>
    </Card>
  );
}

/* ------------------------------------------------------------------
   SECTION 3: SPEED — Within 3d / 7d
   ------------------------------------------------------------------ */
function BookingSpeed() {
  const rows = ALL_MONTHS.map(m => {
    const a = aggMonth(m);
    return {
      month: m,
      referred: a.referred,
      booked: a.booked,
      within3d: a.within3d,
      within7d: a.within7d,
      rate3d: pct1(a.within3d, a.referred),
      rate7d: pct1(a.within7d, a.referred),
      isBaseline: BASELINE_MONTHS.includes(m),
      isDrop: DROP_MONTHS.includes(m),
      isDrip: NEW_DRIP_MONTHS.includes(m),
    };
  });

  const blAvg3d = pct1(baseline.within3d, baseline.referred);
  const blAvg7d = pct1(baseline.within7d, baseline.referred);

  return (
    <Card>
      <SectionTitle>How fast are families booking?</SectionTitle>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle}>Month</th>
              <th style={thStyleR}>Referred</th>
              <th style={thStyleR}>Booked</th>
              <th style={thStyleR}>Book rate</th>
              <th style={thStyleR}>Within 3d</th>
              <th style={thStyleR}>Within 7d</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => {
              const rowBg = r.isDrip ? '#EFF6FF' : r.isDrop ? TP.amberLight : undefined;
              return (
                <tr key={r.month} style={{ background: rowBg }}>
                  <td style={{ ...tdStyle, fontWeight: r.isDrip ? 700 : 400 }}>
                    {monShort(r.month)} {r.isDrip && <span style={{ fontSize: 10, color: TP.dripBlue, fontWeight: 600 }}>NEW</span>}
                  </td>
                  <td style={tdStyleR}>{r.referred}</td>
                  <td style={tdStyleR}>{r.booked}</td>
                  <td style={tdStyleR}>{fmtPct(pct1(r.booked, r.referred))}</td>
                  <td style={{ ...tdStyleR, fontWeight: r.isDrip ? 700 : 400, color: r.isDrip && r.rate3d > blAvg3d ? TP.green : undefined }}>
                    {fmtPct(r.rate3d)}
                  </td>
                  <td style={{ ...tdStyleR, fontWeight: r.isDrip ? 700 : 400, color: r.isDrip && r.rate7d > blAvg7d ? TP.green : undefined }}>
                    {fmtPct(r.rate7d)}
                  </td>
                </tr>
              );
            })}
            {/* Averages row */}
            <tr style={{ borderTop: `2px solid ${TP.border}`, background: '#f8fafc' }}>
              <td style={{ ...tdStyle, fontWeight: 700, fontSize: 11, textTransform: 'uppercase' as const, color: TP.muted }}>Jan-Aug avg</td>
              <td style={tdStyleR}>{Math.round(baseline.referred / BASELINE_MONTHS.length)}/mo</td>
              <td style={tdStyleR}>{Math.round(baseline.booked / BASELINE_MONTHS.length)}/mo</td>
              <td style={tdStyleR}>{fmtPct(pct1(baseline.booked, baseline.referred))}</td>
              <td style={tdStyleR}>{fmtPct(blAvg3d)}</td>
              <td style={tdStyleR}>{fmtPct(blAvg7d)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <Takeaway>
        Within-3d and within-7d rates are the speed signal. The new drip has had only 11 days, so its overall booking rate will keep climbing. Compare the 7-day rate to the baseline average to gauge early momentum.
      </Takeaway>
    </Card>
  );
}

const thStyle: React.CSSProperties = { textAlign: 'left', padding: '8px 10px', borderBottom: `2px solid ${TP.border}`, fontSize: 11, color: TP.muted, textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' };
const thStyleR: React.CSSProperties = { ...thStyle, textAlign: 'right' };
const tdStyle: React.CSSProperties = { textAlign: 'left', padding: '8px 10px', borderBottom: `1px solid ${TP.lightBorder}`, fontSize: 13, color: TP.text };
const tdStyleR: React.CSSProperties = { ...tdStyle, textAlign: 'right' };

/* ------------------------------------------------------------------
   SECTION 4: ENROLLMENT STATUS (compact)
   ------------------------------------------------------------------ */
function EnrollmentStatus() {
  const k = keyFindings;
  return (
    <Card style={{ background: '#f8fafc', border: `1px dashed ${TP.border}` }}>
      <SectionTitle>Enrollment: waiting for data</SectionTitle>
      <p style={{ fontSize: 14, color: TP.text, margin: 0, lineHeight: 1.7 }}>
        Enrollment comparison starts <strong>Dec 2</strong> — that&apos;s when the first new-drip families reach 30 days.
        The old flow enrolled <strong>{k.oldFlowHybrid30d}% hybrid</strong> and <strong>{k.oldFlowScreening30d}% screening</strong> within 30 days.
        Right now: {k.newDripHybridFamilies + k.newDripScreeningFamilies} new-drip families, 0 enrolled (oldest is 11 days old).
      </p>
    </Card>
  );
}

/* ------------------------------------------------------------------
   MAIN EXPORT
   ------------------------------------------------------------------ */
export default function PediatricDrip() {
  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: TP.navy, marginBottom: 4 }}>Is the new drip working?</h2>
      <p style={{ fontSize: 13, color: TP.muted, marginBottom: 20 }}>
        Pediatric drip campaign launched Nov 2, 2026. Hybrid + screening families from dental offices.
      </p>
      <EarlySignal />
      <MonthlyBookingChart />
      <BookingSpeed />
      <EnrollmentStatus />
    </div>
  );
}
