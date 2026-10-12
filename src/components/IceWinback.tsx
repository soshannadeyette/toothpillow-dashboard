'use client';

import { useState, type ReactNode } from 'react';
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
import annotationPlugin from 'chartjs-plugin-annotation';
import { Bar, Line } from 'react-chartjs-2';
import {
  WEEKLY_COHORT,
  MONTHLY_WINBACK,
  ICE_BY_PLAN,
  GHL_COVERAGE,
  LAST_TOUCH_TIMING,
  SF_ACTIVITY,
  TOUCH_WINDOW,
  COORDINATOR_MIX,
} from '@/data/iceWinback';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler, annotationPlugin);

const TP = {
  blue: '#3A6EA4',
  skyBlue: '#B6CAE3',
  green: '#8CD1C8',
  yellow: '#FDBE67',
  navy: '#1B2A4A',
  text: '#333333',
  red: '#c0392b',
  orange: '#e8a33b',
  purple: '#7C5CD6',
};

const TABS = [
  { id: 'case', label: 'What Happened' },
  { id: 'cohort', label: 'Weekly Cohort' },
  { id: 'plan', label: 'By Plan' },
  { id: 'operations', label: 'GHL & Follow-up' },
  { id: 'coordinator', label: 'Coordinators' },
] as const;
type TabId = (typeof TABS)[number]['id'];

function Card({ children, title }: { children: ReactNode; title?: string }) {
  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, background: '#fff', marginBottom: 20 }}>
      {title && <h3 style={{ fontSize: 16, fontWeight: 700, color: TP.navy, marginBottom: 12 }}>{title}</h3>}
      {children}
    </div>
  );
}

function Th({ children, right }: { children: ReactNode; right?: boolean }) {
  return (
    <th style={{ textAlign: right ? 'right' : 'left', padding: '8px 12px', borderBottom: '2px solid #e5e7eb', fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
      {children}
    </th>
  );
}
function Td({ children, right, bold }: { children: ReactNode; right?: boolean; bold?: boolean }) {
  return (
    <td style={{ textAlign: right ? 'right' : 'left', padding: '8px 12px', borderBottom: '1px solid #f1f1f1', fontSize: 14, fontWeight: bold ? 600 : 400, color: TP.text }}>
      {children}
    </td>
  );
}

function Connector({ text }: { text: string }) {
  return (
    <div style={{ padding: '14px 0 6px', fontSize: 14, color: TP.navy, fontWeight: 600, lineHeight: 1.5 }}>
      {text}
    </div>
  );
}

/* ─── The Case: narrative flow ────────────────────────────── */

function CaseTab() {
  // Compute "checkouts left on the table" if Jun–Sep held the Jan–May avg rate
  const janMayAvg = MONTHLY_WINBACK.rate.slice(0, 5).reduce((a: number, b: number) => a + b, 0) / 5; // ~14%
  const lostByMonth = MONTHLY_WINBACK.labels.slice(5, 9).map((_: string, i: number) => {
    const idx = i + 5;
    const expected = Math.round(MONTHLY_WINBACK.open[idx] * janMayAvg / 100);
    const actual = MONTHLY_WINBACK.ice[idx];
    return { month: MONTHLY_WINBACK.labels[idx], open: MONTHLY_WINBACK.open[idx], expected, actual, lost: expected - actual };
  });
  const totalLost = lostByMonth.reduce((a, b) => a + b.lost, 0);

  // 1. Win-back rate chart
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rateChart: any = {
    labels: MONTHLY_WINBACK.labels,
    datasets: [
      {
        type: 'bar' as const,
        label: 'Ice checkouts',
        data: MONTHLY_WINBACK.ice,
        backgroundColor: MONTHLY_WINBACK.partial.map((p: boolean) => p ? 'rgba(58,110,164,0.3)' : 'rgba(58,110,164,0.7)'),
        yAxisID: 'y1',
        order: 2,
      },
      {
        type: 'line' as const,
        label: 'Win-back rate %',
        data: MONTHLY_WINBACK.rate,
        borderColor: TP.red,
        backgroundColor: TP.red,
        borderWidth: 3,
        pointRadius: 5,
        tension: 0.3,
        yAxisID: 'y',
        order: 1,
      },
    ],
  };

  // 2. Touch window — where did the follow-up go
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const windowChart: any = {
    labels: TOUCH_WINDOW.labels,
    datasets: [
      { label: 'Before day 21 (early only)', data: TOUCH_WINDOW.before21, borderColor: TP.yellow, backgroundColor: 'rgba(253,190,103,0.15)', borderWidth: 2.5, pointRadius: 4, tension: 0.3, fill: true },
      { label: 'Day 21–72 (win-back window)', data: TOUCH_WINDOW.d21_72, borderColor: TP.blue, backgroundColor: 'rgba(58,110,164,0.1)', borderWidth: 2.5, pointRadius: 4, tension: 0.3, fill: true },
      { label: 'After day 72 (long-term nurture)', data: TOUCH_WINDOW.after72, borderColor: TP.navy, backgroundColor: 'rgba(27,42,74,0.1)', borderWidth: 2.5, pointRadius: 4, tension: 0.3, fill: true },
      { label: 'No GHL touch at all', data: TOUCH_WINDOW.none, borderColor: '#d1d5db', backgroundColor: 'rgba(209,213,219,0.1)', borderWidth: 2, pointRadius: 4, tension: 0.3, fill: true },
    ],
  };

  // 3. SF Activity — manual wasn't filling the gap
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sfChart: any = {
    labels: SF_ACTIVITY.labels,
    datasets: [
      {
        type: 'bar' as const,
        label: 'SF logged activities',
        data: SF_ACTIVITY.n,
        backgroundColor: SF_ACTIVITY.partial.map((p: boolean) => p ? 'rgba(58,110,164,0.25)' : 'rgba(58,110,164,0.6)'),
        yAxisID: 'y1',
        order: 2,
      },
      {
        type: 'line' as const,
        label: 'Open leads (denominator)',
        data: SF_ACTIVITY.den,
        borderColor: TP.green,
        backgroundColor: TP.green,
        borderWidth: 2.5,
        pointRadius: 4,
        tension: 0.3,
        yAxisID: 'y2',
        order: 1,
      },
    ],
  };

  // 4. Pool vs conversions — the leads are there
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const poolChart: any = {
    labels: MONTHLY_WINBACK.labels,
    datasets: [
      {
        type: 'bar' as const,
        label: 'Open leads at day 21',
        data: MONTHLY_WINBACK.open,
        backgroundColor: MONTHLY_WINBACK.partial.map((p: boolean) => p ? 'rgba(140,209,200,0.3)' : 'rgba(140,209,200,0.6)'),
        yAxisID: 'y',
        order: 2,
      },
      {
        type: 'bar' as const,
        label: 'Ice checkouts (actual)',
        data: MONTHLY_WINBACK.ice,
        backgroundColor: MONTHLY_WINBACK.partial.map((p: boolean) => p ? 'rgba(58,110,164,0.3)' : 'rgba(58,110,164,0.8)'),
        yAxisID: 'y',
        order: 1,
      },
      {
        type: 'line' as const,
        label: 'Expected at Jan–May rate',
        data: MONTHLY_WINBACK.open.map((o: number) => Math.round(o * janMayAvg / 100)),
        borderColor: TP.red,
        backgroundColor: TP.red,
        borderWidth: 2,
        borderDash: [6, 4],
        pointRadius: 4,
        tension: 0.3,
        yAxisID: 'y',
        order: 0,
      },
    ],
  };

  return (
    <>
      {/* ── 1. THE DROP ── */}
      <Card title="1. Win-back rate collapsed from June onward">
        <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>
          Jan–May averaged a {janMayAvg.toFixed(1)}% win-back rate (Ice checkouts per lead still open at day 21). Starting in June, it fell to single digits and kept falling. The leads that used to convert after 3+ weeks stopped converting.
        </div>
        <div style={{ height: 340 }}>
          <Bar data={rateChart} options={{
            responsive: true, maintainAspectRatio: false,
            plugins: {
              legend: { display: true, position: 'top' as const },
              annotation: { annotations: {
                avg: { type: 'line', yMin: janMayAvg, yMax: janMayAvg, yScaleID: 'y', borderColor: 'rgba(192,57,43,0.4)', borderWidth: 1.5, borderDash: [5, 3], label: { display: true, content: `Jan–May avg ${janMayAvg.toFixed(1)}%`, position: 'start' as const, backgroundColor: 'rgba(192,57,43,0.1)', color: TP.red, font: { size: 11, weight: 'bold' as const }, padding: { x: 6, y: 3 } } },
              } },
            },
            scales: {
              y: { beginAtZero: true, position: 'left' as const, title: { display: true, text: 'Win-back rate %' } },
              y1: { beginAtZero: true, position: 'right' as const, grid: { drawOnChartArea: false }, title: { display: true, text: 'Ice checkouts' } },
            },
          }} />
        </div>
      </Card>

      <Connector text="Why? The automated follow-up to older leads stopped." />

      {/* ── 2. FOLLOW-UP STOPPED ── */}
      <Card title="2. Follow-up to older leads dropped off">
        <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>
          This chart shows when each lead&apos;s last GHL touch happened relative to their checkout link date. In early months, 27–65% of leads got their last touch after day 72 (long-term nurture sequences reaching back to old leads). By July that drops to 10%, by August it&apos;s 0%. At the same time, &quot;before day 21&quot; climbs from 24% to 57% — leads are getting touched early, then abandoned.
        </div>
        <div style={{ height: 340 }}>
          <Line data={windowChart} options={{
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: true, position: 'top' as const } },
            scales: {
              x: {},
              y: { beginAtZero: true, max: 100, title: { display: true, text: '% of leads' } },
            },
          }} />
        </div>
      </Card>

      <Connector text="Manual outreach wasn't filling the gap — it was already near zero." />

      {/* ── 3. MANUAL ACTIVITY WAS ALREADY ZERO ── */}
      <Card title="3. Salesforce manual activity was already negligible">
        <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>
          Salesforce-logged manual activity (calls, emails logged by coordinators) dropped from 25 per month in January to 1–2 by summer. With 800+ open leads each month, that&apos;s less than 0.2% getting any manual follow-up. When automations stopped, nothing replaced them.
        </div>
        <div style={{ height: 300 }}>
          <Bar data={sfChart} options={{
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: true, position: 'top' as const } },
            scales: {
              y1: { beginAtZero: true, position: 'left' as const, title: { display: true, text: 'SF activities' } },
              y2: { beginAtZero: true, position: 'right' as const, grid: { drawOnChartArea: false }, title: { display: true, text: 'Open leads' } },
            },
          }} />
        </div>
      </Card>

      <Connector text="The leads didn't disappear — they're sitting in the open pool, unconverted." />

      {/* ── 4. LEADS LEFT ON THE TABLE ── */}
      <Card title="4. The open pool grew while conversions fell">
        <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>
          Green bars = leads still open after 21 days (the win-back pool). Blue bars = how many actually converted. Dashed red line = how many would have converted at the Jan–May rate. The gap between actual and expected is the opportunity cost: an estimated <b>{totalLost} checkouts left on the table</b> from June through September.
        </div>
        <div style={{ height: 340 }}>
          <Bar data={poolChart} options={{
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: true, position: 'top' as const } },
            scales: {
              y: { beginAtZero: true, title: { display: true, text: 'Leads / checkouts' } },
            },
          }} />
        </div>
      </Card>

      {/* ── SUMMARY TABLE ── */}
      <Card title="Estimated checkouts lost, June–September">
        <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 12 }}>
          If the Jan–May win-back rate ({janMayAvg.toFixed(1)}%) had held, how many more Ice checkouts would each month have produced?
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>
              <Th>Month</Th>
              <Th right>Open at d21</Th>
              <Th right>Expected</Th>
              <Th right>Actual</Th>
              <Th right>Gap</Th>
            </tr>
          </thead>
          <tbody>
            {lostByMonth.map((r) => (
              <tr key={r.month}>
                <Td bold>{r.month}</Td>
                <Td right>{r.open.toLocaleString()}</Td>
                <Td right>{r.expected}</Td>
                <Td right>{r.actual}</Td>
                <Td right bold><span style={{ color: TP.red }}>−{r.lost}</span></Td>
              </tr>
            ))}
            <tr style={{ background: '#f9fafb' }}>
              <Td bold>Total</Td>
              <Td right>{lostByMonth.reduce((a, b) => a + b.open, 0).toLocaleString()}</Td>
              <Td right>{lostByMonth.reduce((a, b) => a + b.expected, 0)}</Td>
              <Td right>{lostByMonth.reduce((a, b) => a + b.actual, 0)}</Td>
              <Td right bold><span style={{ color: TP.red }}>−{totalLost}</span></Td>
            </tr>
          </tbody>
        </table>
      </Card>
    </>
  );
}

/* ─── Weekly Cohort detail ────────────────────────────────── */

function CohortTab() {
  const labels = WEEKLY_COHORT.labels.map((l: string) => l.replace(/^W\d+ /, ''));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const linksChart: any = {
    labels,
    datasets: [
      {
        type: 'bar' as const,
        label: 'Links sent',
        data: WEEKLY_COHORT.links,
        backgroundColor: WEEKLY_COHORT.maturing.map((m: boolean) => m ? 'rgba(58,110,164,0.3)' : 'rgba(58,110,164,0.7)'),
        yAxisID: 'y',
        order: 2,
      },
      {
        type: 'line' as const,
        label: 'Checkouts',
        data: WEEKLY_COHORT.checkouts,
        borderColor: TP.green,
        backgroundColor: TP.green,
        borderWidth: 2.5,
        pointRadius: 2,
        tension: 0.3,
        yAxisID: 'y',
        order: 1,
      },
    ],
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const convChart: any = {
    labels,
    datasets: [
      {
        label: 'Total conversion %',
        data: WEEKLY_COHORT.pct,
        borderColor: TP.navy,
        backgroundColor: TP.navy,
        borderWidth: 2.5,
        pointRadius: 2,
        tension: 0.3,
      },
      {
        label: 'Lava % (paid ≤20d)',
        data: WEEKLY_COHORT.lava,
        borderColor: TP.red,
        backgroundColor: TP.red,
        borderWidth: 2,
        pointRadius: 2,
        tension: 0.3,
      },
      {
        label: 'Ice % (paid 21d+)',
        data: WEEKLY_COHORT.ice,
        borderColor: TP.blue,
        backgroundColor: TP.blue,
        borderWidth: 2,
        pointRadius: 2,
        tension: 0.3,
      },
    ],
  };
  return (
    <>
      <Card title="Links Sent vs Checkouts by Week">
        <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>Faded bars = maturing (incomplete data). Reference: {WEEKLY_COHORT.ref_label}.</div>
        <div style={{ height: 340 }}>
          <Bar data={linksChart} options={{
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: true, position: 'top' as const } },
            scales: {
              x: { ticks: { maxRotation: 90, font: { size: 10 } } },
              y: { beginAtZero: true, title: { display: true, text: 'Count' } },
            },
          }} />
        </div>
      </Card>

      <Card title="Lava / Ice / Total Conversion % by Week">
        <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>
          Lava = paid within 20 days of checkout link. Ice = paid 21+ days (win-back). Maturing weeks understate Ice.
        </div>
        <div style={{ height: 340 }}>
          <Line data={convChart} options={{
            responsive: true, maintainAspectRatio: false,
            plugins: {
              legend: { display: true, position: 'top' as const },
              annotation: { annotations: {
                ref: { type: 'line', yMin: WEEKLY_COHORT.ref, yMax: WEEKLY_COHORT.ref, borderColor: '#d1d5db', borderWidth: 1.5, borderDash: [5, 3], label: { display: true, content: WEEKLY_COHORT.ref_label, position: 'end' as const, backgroundColor: '#d1d5db', color: '#333', font: { size: 10 }, padding: { x: 4, y: 2 } } },
              } },
            },
            scales: {
              x: { ticks: { maxRotation: 90, font: { size: 10 } } },
              y: { beginAtZero: true, title: { display: true, text: '%' } },
            },
          }} />
        </div>
      </Card>

      <Card title="Weekly Cohort Data Table">
        <div style={{ overflowX: 'auto', maxHeight: 500 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                <Th>Week</Th>
                <Th right>Links</Th>
                <Th right>Checkouts</Th>
                <Th right>Conv %</Th>
                <Th right>Lava %</Th>
                <Th right>Ice %</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {WEEKLY_COHORT.labels.map((l: string, i: number) => (
                <tr key={l} style={{ background: WEEKLY_COHORT.maturing[i] ? '#fef3c7' : undefined }}>
                  <Td bold>{l}</Td>
                  <Td right>{WEEKLY_COHORT.links[i]}</Td>
                  <Td right>{WEEKLY_COHORT.checkouts[i]}</Td>
                  <Td right>{WEEKLY_COHORT.pct[i].toFixed(1)}%</Td>
                  <Td right>{WEEKLY_COHORT.lava[i].toFixed(1)}%</Td>
                  <Td right>{WEEKLY_COHORT.ice[i].toFixed(1)}%</Td>
                  <Td>{WEEKLY_COHORT.maturing[i] ? '⏳ maturing' : '✓'}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}

/* ─── By Plan detail ──────────────────────────────────────── */

function PlanTab() {
  const labels = ICE_BY_PLAN.labels.map((l: string) => l.replace(/^W\d+ /, ''));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const planChart: any = {
    labels,
    datasets: [
      { label: 'Recommended', data: ICE_BY_PLAN.rec, borderColor: TP.blue, backgroundColor: TP.blue, borderWidth: 2, pointRadius: 2, tension: 0.3 },
      { label: 'Essential', data: ICE_BY_PLAN.ess, borderColor: TP.green, backgroundColor: TP.green, borderWidth: 2, pointRadius: 2, tension: 0.3 },
      { label: 'Other', data: ICE_BY_PLAN.other, borderColor: TP.yellow, backgroundColor: TP.yellow, borderWidth: 2, pointRadius: 2, tension: 0.3 },
    ],
  };
  return (
    <>
      <Card title="Weekly Ice Checkouts by Plan">
        <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>
          By treatment plan (Recommended, Essential, Other). Shows which plans the win-back conversions land on.
        </div>
        <div style={{ height: 340 }}>
          <Line data={planChart} options={{
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: true, position: 'top' as const } },
            scales: {
              x: { ticks: { maxRotation: 90, font: { size: 10 } } },
              y: { beginAtZero: true, title: { display: true, text: 'Ice checkouts' } },
            },
          }} />
        </div>
      </Card>

      <Card title="Weekly Ice by Plan (Table)">
        <div style={{ overflowX: 'auto', maxHeight: 500 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                <Th>Week</Th>
                <Th right>Recommended</Th>
                <Th right>Essential</Th>
                <Th right>Other</Th>
                <Th right>Total</Th>
              </tr>
            </thead>
            <tbody>
              {ICE_BY_PLAN.labels.map((l: string, i: number) => (
                <tr key={l}>
                  <Td bold>{l}</Td>
                  <Td right>{ICE_BY_PLAN.rec[i]}</Td>
                  <Td right>{ICE_BY_PLAN.ess[i]}</Td>
                  <Td right>{ICE_BY_PLAN.other[i]}</Td>
                  <Td right bold>{ICE_BY_PLAN.rec[i] + ICE_BY_PLAN.ess[i] + ICE_BY_PLAN.other[i]}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}

/* ─── GHL & Follow-up (merged) ────────────────────────────── */

function OperationsTab() {
  // GHL Coverage
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const coverageChart: any = {
    labels: GHL_COVERAGE.labels,
    datasets: [
      { type: 'line' as const, label: 'Coverage %', data: GHL_COVERAGE.coverage, borderColor: TP.blue, backgroundColor: TP.blue, borderWidth: 3, pointRadius: 4, tension: 0.3, yAxisID: 'y', order: 1 },
      { type: 'line' as const, label: 'DND %', data: GHL_COVERAGE.dnd, borderColor: TP.red, backgroundColor: TP.red, borderWidth: 2, pointRadius: 3, tension: 0.3, yAxisID: 'y', order: 2 },
      { type: 'bar' as const, label: 'Total leads', data: GHL_COVERAGE.leads, backgroundColor: 'rgba(58,110,164,0.15)', yAxisID: 'y1', order: 3 },
    ],
  };

  // Last touch timing
  const colors = ['#3A6EA4', '#1B2A4A', '#8CD1C8', '#FDBE67', '#c0392b', '#7C5CD6', '#6AA84F', '#e8a33b', '#B6CAE3', '#d1d5db'];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const touchChart: any = {
    labels: LAST_TOUCH_TIMING.labels,
    datasets: LAST_TOUCH_TIMING.series.map((s: { name: string; data: number[] }, i: number) => ({
      label: s.name,
      data: s.data,
      borderColor: colors[i % colors.length],
      backgroundColor: colors[i % colors.length],
      borderWidth: 2,
      pointRadius: 3,
      tension: 0.3,
    })),
  };

  return (
    <>
      <Card title="GHL Contact Coverage">
        <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>
          What % of leads with checkout links matched a GHL contact. Coverage stays ~77–82% all year — this wasn&apos;t what broke.
        </div>
        <div style={{ height: 340 }}>
          <Bar data={coverageChart} options={{
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: true, position: 'top' as const } },
            scales: {
              y: { beginAtZero: true, max: 100, position: 'left' as const, title: { display: true, text: '%' } },
              y1: { beginAtZero: true, position: 'right' as const, grid: { drawOnChartArea: false }, title: { display: true, text: 'Leads' } },
            },
          }} />
        </div>
      </Card>

      <Card title="GHL Coverage Data">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr><Th>Month</Th><Th right>Leads</Th><Th right>Matched</Th><Th right>Coverage %</Th><Th right>DND %</Th></tr>
          </thead>
          <tbody>
            {GHL_COVERAGE.labels.map((l: string, i: number) => (
              <tr key={l}>
                <Td bold>{l}</Td>
                <Td right>{GHL_COVERAGE.leads[i].toLocaleString()}</Td>
                <Td right>{GHL_COVERAGE.matched[i].toLocaleString()}</Td>
                <Td right>{GHL_COVERAGE.coverage[i].toFixed(1)}%</Td>
                <Td right>{GHL_COVERAGE.dnd[i].toFixed(1)}%</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card title="Last GHL Touch Timing by Link Month">
        <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>
          For each link month, when did the last GHL touch happen? Jan–Mar cohorts show big clusters in April (automated re-engagement reaching back). Jun+ cohorts show the last touch staying in their own month — no long-term follow-up happened.
        </div>
        <div style={{ height: 400 }}>
          <Line data={touchChart} options={{
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: true, position: 'top' as const } },
            scales: { x: {}, y: { beginAtZero: true, title: { display: true, text: 'Count' } } },
          }} />
        </div>
      </Card>

      <Card title="Last Touch Timing Data">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr>
                <Th>Link month →</Th>
                {LAST_TOUCH_TIMING.labels.map((l: string) => <Th key={l} right>{l}</Th>)}
              </tr>
            </thead>
            <tbody>
              {LAST_TOUCH_TIMING.series.map((s: { name: string; data: number[] }) => (
                <tr key={s.name}>
                  <Td bold>{s.name}</Td>
                  {s.data.map((v: number, i: number) => <Td key={i} right>{v}</Td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Touch Window Distribution">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>
              <Th>Month</Th>
              <Th right>Before d21</Th>
              <Th right>d21–72</Th>
              <Th right>After d72</Th>
              <Th right>No touch</Th>
              <Th right>N (leads)</Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {TOUCH_WINDOW.labels.map((l: string, i: number) => (
              <tr key={l} style={{ background: TOUCH_WINDOW.partial[i] ? '#fef3c7' : undefined }}>
                <Td bold>{l}</Td>
                <Td right>{TOUCH_WINDOW.before21[i].toFixed(1)}%</Td>
                <Td right>{TOUCH_WINDOW.d21_72[i].toFixed(1)}%</Td>
                <Td right>{TOUCH_WINDOW.after72[i].toFixed(1)}%</Td>
                <Td right>{TOUCH_WINDOW.none[i].toFixed(1)}%</Td>
                <Td right>{TOUCH_WINDOW.den[i].toLocaleString()}</Td>
                <Td>{TOUCH_WINDOW.partial[i] ? '⏳ partial' : '✓'}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card title="SF Activity Detail">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr><Th>Month</Th><Th right>SF activities</Th><Th right>Open leads</Th><Th right>Share %</Th><Th>Status</Th></tr>
          </thead>
          <tbody>
            {SF_ACTIVITY.labels.map((l: string, i: number) => (
              <tr key={l} style={{ background: SF_ACTIVITY.partial[i] ? '#fef3c7' : undefined }}>
                <Td bold>{l}</Td>
                <Td right>{SF_ACTIVITY.n[i]}</Td>
                <Td right>{SF_ACTIVITY.den[i].toLocaleString()}</Td>
                <Td right>{SF_ACTIVITY.share[i] !== null ? `${SF_ACTIVITY.share[i]}%` : '—'}</Td>
                <Td>{SF_ACTIVITY.partial[i] ? '⏳ partial' : '✓'}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}

/* ─── Coordinator detail ──────────────────────────────────── */

function CoordinatorTab() {
  const coordColors = ['#3A6EA4', '#c0392b', '#8CD1C8', '#7C5CD6', '#d1d5db'];
  const ownerColors = ['#3A6EA4', '#c0392b', '#8CD1C8', '#FDBE67', '#1B2A4A', '#e8a33b', '#6AA84F', '#7C5CD6', '#B6CAE3', '#d1d5db'];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const coordChart: any = {
    labels: COORDINATOR_MIX.labels,
    datasets: COORDINATOR_MIX.coord.map((c: { name: string; data: number[] }, i: number) => ({
      label: c.name,
      data: c.data,
      borderColor: coordColors[i % coordColors.length],
      backgroundColor: coordColors[i % coordColors.length],
      borderWidth: 2.5,
      pointRadius: 4,
      tension: 0.3,
    })),
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ownerChart: any = {
    labels: COORDINATOR_MIX.labels,
    datasets: COORDINATOR_MIX.owner.map((o: { name: string; data: number[] }, i: number) => ({
      label: o.name,
      data: o.data,
      borderColor: ownerColors[i % ownerColors.length],
      backgroundColor: ownerColors[i % ownerColors.length],
      borderWidth: 2,
      pointRadius: 3,
      tension: 0.3,
    })),
  };
  return (
    <>
      <Card title="Coordinator Mix by Month (GHL Contact Owner)">
        <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>
          Share of leads by GHL contact owner. Desirea&apos;s share dropped from 53% to 23%, Sam Rice entered in Aug with ~17%. This shows caseload redistribution but doesn&apos;t explain the win-back drop on its own.
        </div>
        <div style={{ height: 340 }}>
          <Line data={coordChart} options={{
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: true, position: 'top' as const } },
            scales: { x: {}, y: { beginAtZero: true, title: { display: true, text: '% of leads' } } },
          }} />
        </div>
      </Card>

      <Card title="Record Owner Mix by Month (Salesforce Owner)">
        <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>
          Share of leads by Salesforce record owner. Same pattern — original coordinators&apos; shares shrank as Sam ramped up.
        </div>
        <div style={{ height: 380 }}>
          <Line data={ownerChart} options={{
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: true, position: 'top' as const } },
            scales: { x: {}, y: { beginAtZero: true, title: { display: true, text: '% of leads' } } },
          }} />
        </div>
      </Card>

      <Card title="Coordinator Mix Data">
        <h4 style={{ fontSize: 14, fontWeight: 600, color: TP.navy, marginBottom: 8 }}>GHL Contact Owner</h4>
        <div style={{ overflowX: 'auto', marginBottom: 20 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr>
                <Th>Coordinator</Th>
                {COORDINATOR_MIX.labels.map((l: string) => <Th key={l} right>{l}</Th>)}
              </tr>
            </thead>
            <tbody>
              {COORDINATOR_MIX.coord.map((c: { name: string; data: number[] }) => (
                <tr key={c.name}>
                  <Td bold>{c.name}</Td>
                  {c.data.map((v: number, i: number) => <Td key={i} right>{v.toFixed(1)}%</Td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <h4 style={{ fontSize: 14, fontWeight: 600, color: TP.navy, marginBottom: 8 }}>SF Record Owner</h4>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr>
                <Th>Owner</Th>
                {COORDINATOR_MIX.labels.map((l: string) => <Th key={l} right>{l}</Th>)}
              </tr>
            </thead>
            <tbody>
              {COORDINATOR_MIX.owner.map((o: { name: string; data: number[] }) => (
                <tr key={o.name}>
                  <Td bold>{o.name}</Td>
                  {o.data.map((v: number, i: number) => <Td key={i} right>{v.toFixed(1)}%</Td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}

/* ─── Main export ──────────────────────────────────────────── */

export default function IceWinback() {
  const [tab, setTab] = useState<TabId>('case');

  const janMayAvg = MONTHLY_WINBACK.rate.slice(0, 5).reduce((a: number, b: number) => a + b, 0) / 5;
  const junAugAvg = MONTHLY_WINBACK.rate.slice(5, 8).reduce((a: number, b: number) => a + b, 0) / 3;
  const totalLost = MONTHLY_WINBACK.labels.slice(5, 9).reduce((sum: number, _: string, i: number) => {
    const idx = i + 5;
    return sum + Math.round(MONTHLY_WINBACK.open[idx] * janMayAvg / 100) - MONTHLY_WINBACK.ice[idx];
  }, 0);

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, color: '#6b7280' }}>Ice / Win-back Analysis · 8,851 checkout-linked leads · Jan–Oct 2026 · Source: ice-all-links-2026-10-12</div>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginTop: 10 }}>
          <div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>Total Ice checkouts (YTD)</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: TP.navy }}>{MONTHLY_WINBACK.ice.reduce((a: number, b: number) => a + b, 0)}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>Jan–May avg win-back rate</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: TP.navy }}>{janMayAvg.toFixed(1)}%</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>Jun–Aug avg win-back rate</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: TP.red }}>{junAugAvg.toFixed(1)}%</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>Est. checkouts lost (Jun–Sep)</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: TP.red }}>−{totalLost}</div>
          </div>
        </div>
      </div>

      {/* Sub-tab bar */}
      <nav className="bg-white" style={{ borderBottom: '2px solid #e0e0e0', marginBottom: 20 }}>
        <div className="flex gap-1 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                tab === t.id
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      {tab === 'case' && <CaseTab />}
      {tab === 'cohort' && <CohortTab />}
      {tab === 'plan' && <PlanTab />}
      {tab === 'operations' && <OperationsTab />}
      {tab === 'coordinator' && <CoordinatorTab />}
    </div>
  );
}
