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
  ICE_EVENTS,
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
  { id: 'cohort', label: 'Weekly Cohort' },
  { id: 'winback', label: 'Win-back Rate' },
  { id: 'plan', label: 'By Plan' },
  { id: 'ghl', label: 'GHL Coverage' },
  { id: 'touch', label: 'Last Touch' },
  { id: 'touchwindow', label: 'Touch Window' },
  { id: 'sfactivity', label: 'SF Activity' },
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

/* Build Chart.js event annotation lines from ICE_EVENTS */
function eventAnnotations() {
  const out: Record<string, object> = {};
  const colors = [TP.red, '#9ca3af', TP.purple];
  ICE_EVENTS.forEach((ev: { x: number; label: string; date: string }, i: number) => {
    out[`ev${i}`] = {
      type: 'line',
      xMin: ev.x,
      xMax: ev.x,
      borderColor: colors[i % colors.length],
      borderWidth: 2,
      borderDash: [5, 3],
      label: {
        display: true,
        content: ev.label,
        position: 'start' as const,
        backgroundColor: colors[i % colors.length],
        color: '#fff',
        font: { size: 10, weight: 'bold' as const },
        padding: { x: 5, y: 2 },
      },
    };
  });
  return out;
}

function eventAnnotationsMonthly() {
  const monthIndex: Record<string, number> = {};
  MONTHLY_WINBACK.labels.forEach((l, i) => { monthIndex[l] = i; });
  const mapping: { label: string; month: string; color: string }[] = [
    { label: '#626 shipped (May 29)', month: 'May', color: TP.red },
    { label: 'price increase (Jun 30)', month: 'Jun', color: '#9ca3af' },
    { label: 'automations paused (Jul 13)', month: 'Jul', color: TP.purple },
  ];
  const out: Record<string, object> = {};
  mapping.forEach((m, i) => {
    const idx = monthIndex[m.month];
    if (idx !== undefined) {
      out[`mev${i}`] = {
        type: 'line',
        xMin: idx + 0.3 * i,
        xMax: idx + 0.3 * i,
        borderColor: m.color,
        borderWidth: 2,
        borderDash: [5, 3],
        label: {
          display: true,
          content: m.label,
          position: i % 2 === 0 ? 'start' : 'end',
          backgroundColor: m.color,
          color: '#fff',
          font: { size: 10, weight: 'bold' as const },
          padding: { x: 4, y: 2 },
        },
      };
    }
  });
  return out;
}

/* ─── Tab content ──────────────────────────────────────────── */

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
      <Card title="A2 · Links Sent vs Checkouts by Week">
        <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>Faded bars = maturing (incomplete data). Reference: {WEEKLY_COHORT.ref_label}.</div>
        <div style={{ height: 340 }}>
          <Bar data={linksChart} options={{
            responsive: true, maintainAspectRatio: false,
            plugins: {
              legend: { display: true, position: 'top' as const },
              annotation: { annotations: eventAnnotations() },
            },
            scales: {
              x: { ticks: { maxRotation: 90, font: { size: 10 } } },
              y: { beginAtZero: true, title: { display: true, text: 'Count' } },
            },
          }} />
        </div>
      </Card>

      <Card title="A1 · Lava / Ice / Total Conversion % by Week">
        <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>
          Lava = paid within 20 days of checkout link. Ice = paid 21+ days (win-back). Maturing weeks understate Ice.
        </div>
        <div style={{ height: 340 }}>
          <Line data={convChart} options={{
            responsive: true, maintainAspectRatio: false,
            plugins: {
              legend: { display: true, position: 'top' as const },
              annotation: { annotations: {
                ...eventAnnotations(),
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

      <Card title="A2 · Weekly Cohort Data Table">
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

function WinbackTab() {
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
        pointRadius: 4,
        tension: 0.3,
        yAxisID: 'y',
        order: 1,
      },
    ],
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const openChart: any = {
    labels: MONTHLY_WINBACK.labels,
    datasets: [
      {
        label: 'Still open at day 21',
        data: MONTHLY_WINBACK.open,
        backgroundColor: 'rgba(140,209,200,0.6)',
        borderColor: TP.green,
        borderWidth: 1,
      },
      {
        label: 'Ice (converted after day 21)',
        data: MONTHLY_WINBACK.ice,
        backgroundColor: 'rgba(58,110,164,0.7)',
        borderColor: TP.blue,
        borderWidth: 1,
      },
    ],
  };
  return (
    <>
      <Card title="A1 · Win-back Rate by Link Month">
        <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>
          Win-back rate = Ice checkouts ÷ leads still open at day 21. Jan–May avg ~14%, drops to ~5–8% from June. Faded bars = partial/maturing.
        </div>
        <div style={{ height: 340 }}>
          <Bar data={rateChart} options={{
            responsive: true, maintainAspectRatio: false,
            plugins: {
              legend: { display: true, position: 'top' as const },
              annotation: { annotations: eventAnnotationsMonthly() },
            },
            scales: {
              x: {},
              y: { beginAtZero: true, position: 'left' as const, title: { display: true, text: 'Win-back rate %' } },
              y1: { beginAtZero: true, position: 'right' as const, grid: { drawOnChartArea: false }, title: { display: true, text: 'Ice checkouts' } },
            },
          }} />
        </div>
      </Card>

      <Card title="A3 · Open Pool vs Ice Conversions">
        <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>
          How many leads are still open after 21 days (pool), and how many eventually convert (Ice).
        </div>
        <div style={{ height: 300 }}>
          <Bar data={openChart} options={{
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: true, position: 'top' as const } },
            scales: { y: { beginAtZero: true } },
          }} />
        </div>
      </Card>

      <Card title="Monthly Win-back Data">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>
              <Th>Month</Th>
              <Th right>Open at d21</Th>
              <Th right>Ice checkouts</Th>
              <Th right>Win-back rate</Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {MONTHLY_WINBACK.labels.map((l: string, i: number) => (
              <tr key={l} style={{ background: MONTHLY_WINBACK.partial[i] ? '#fef3c7' : undefined }}>
                <Td bold>{l}</Td>
                <Td right>{MONTHLY_WINBACK.open[i].toLocaleString()}</Td>
                <Td right>{MONTHLY_WINBACK.ice[i]}</Td>
                <Td right>{MONTHLY_WINBACK.rate[i].toFixed(1)}%</Td>
                <Td>{MONTHLY_WINBACK.partial[i] ? '⏳ partial' : '✓ mature'}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}

function PlanTab() {
  const labels = ICE_BY_PLAN.labels.map((l: string) => l.replace(/^W\d+ /, ''));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const planChart: any = {
    labels,
    datasets: [
      { label: 'Recommended', data: ICE_BY_PLAN.rec, backgroundColor: TP.blue, stack: 's1' },
      { label: 'Essential', data: ICE_BY_PLAN.ess, backgroundColor: TP.green, stack: 's1' },
      { label: 'Other', data: ICE_BY_PLAN.other, backgroundColor: TP.yellow, stack: 's1' },
    ],
  };
  return (
    <>
      <Card title="C1 · Weekly Ice Checkouts by Plan">
        <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>
          Stacked by treatment plan (Recommended, Essential, Other). Shows which plans the win-back conversions land on.
        </div>
        <div style={{ height: 340 }}>
          <Bar data={planChart} options={{
            responsive: true, maintainAspectRatio: false,
            plugins: {
              legend: { display: true, position: 'top' as const },
              annotation: { annotations: eventAnnotations() },
            },
            scales: {
              x: { stacked: true, ticks: { maxRotation: 90, font: { size: 10 } } },
              y: { stacked: true, beginAtZero: true, title: { display: true, text: 'Ice checkouts' } },
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

function GHLTab() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const coverageChart: any = {
    labels: GHL_COVERAGE.labels,
    datasets: [
      {
        type: 'line' as const,
        label: 'Coverage %',
        data: GHL_COVERAGE.coverage,
        borderColor: TP.blue,
        backgroundColor: TP.blue,
        borderWidth: 3,
        pointRadius: 4,
        tension: 0.3,
        yAxisID: 'y',
        order: 1,
      },
      {
        type: 'line' as const,
        label: 'DND %',
        data: GHL_COVERAGE.dnd,
        borderColor: TP.red,
        backgroundColor: TP.red,
        borderWidth: 2,
        pointRadius: 3,
        tension: 0.3,
        yAxisID: 'y',
        order: 2,
      },
      {
        type: 'bar' as const,
        label: 'Total leads',
        data: GHL_COVERAGE.leads,
        backgroundColor: 'rgba(58,110,164,0.15)',
        yAxisID: 'y1',
        order: 3,
      },
    ],
  };
  return (
    <>
      <Card title="D1 · GHL Contact Coverage">
        <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>
          What % of leads with checkout links matched a GHL contact. DND = Do Not Disturb (opted out). Coverage stays ~77–82%.
        </div>
        <div style={{ height: 340 }}>
          <Bar data={coverageChart} options={{
            responsive: true, maintainAspectRatio: false,
            plugins: {
              legend: { display: true, position: 'top' as const },
              annotation: { annotations: eventAnnotationsMonthly() },
            },
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
            <tr>
              <Th>Month</Th>
              <Th right>Leads</Th>
              <Th right>Matched</Th>
              <Th right>Coverage %</Th>
              <Th right>DND %</Th>
            </tr>
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
    </>
  );
}

function LastTouchTab() {
  const colors = ['#3A6EA4', '#1B2A4A', '#8CD1C8', '#FDBE67', '#c0392b', '#7C5CD6', '#6AA84F', '#e8a33b', '#B6CAE3', '#d1d5db'];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const touchChart: any = {
    labels: LAST_TOUCH_TIMING.labels,
    datasets: LAST_TOUCH_TIMING.series.map((s: { name: string; data: number[] }, i: number) => ({
      label: s.name,
      data: s.data,
      backgroundColor: colors[i % colors.length],
      stack: 's1',
    })),
  };
  return (
    <>
      <Card title="B2 · Last GHL Touch Timing by Link Month">
        <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>
          For each link month, when did the last GHL touch happen? Each row shows the calendar month of the last touch. Stacked bars show the distribution.
        </div>
        <div style={{ height: 400 }}>
          <Bar data={touchChart} options={{
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: true, position: 'top' as const } },
            scales: {
              x: { stacked: true },
              y: { stacked: true, beginAtZero: true, title: { display: true, text: 'Count' } },
            },
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
    </>
  );
}

function TouchWindowTab() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const windowChart: any = {
    labels: TOUCH_WINDOW.labels,
    datasets: [
      { label: 'Before day 21', data: TOUCH_WINDOW.before21, backgroundColor: TP.green, stack: 's1' },
      { label: 'Day 21–72', data: TOUCH_WINDOW.d21_72, backgroundColor: TP.blue, stack: 's1' },
      { label: 'After day 72', data: TOUCH_WINDOW.after72, backgroundColor: TP.navy, stack: 's1' },
      { label: 'No touch', data: TOUCH_WINDOW.none, backgroundColor: '#d1d5db', stack: 's1' },
    ],
  };
  return (
    <>
      <Card title="B1 · Where Last Touch Falls (% of Leads)">
        <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>
          What % of leads received their last GHL touch before day 21, in the 21–72 day window, after 72 days, or had no touch at all. Stacked to 100%.
        </div>
        <div style={{ height: 340 }}>
          <Bar data={windowChart} options={{
            responsive: true, maintainAspectRatio: false,
            plugins: {
              legend: { display: true, position: 'top' as const },
              annotation: { annotations: eventAnnotationsMonthly() },
            },
            scales: {
              x: {},
              y: { beginAtZero: true, max: 100, stacked: true, title: { display: true, text: '% of leads' } },
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any,
          }} />
        </div>
      </Card>

      <Card title="Touch Window Data">
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
    </>
  );
}

function SFActivityTab() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const actChart: any = {
    labels: SF_ACTIVITY.labels,
    datasets: [
      {
        type: 'bar' as const,
        label: 'SF logged activity count',
        data: SF_ACTIVITY.n,
        backgroundColor: 'rgba(58,110,164,0.6)',
        yAxisID: 'y1',
        order: 2,
      },
      {
        type: 'line' as const,
        label: 'Share %',
        data: SF_ACTIVITY.share,
        borderColor: TP.red,
        backgroundColor: TP.red,
        borderWidth: 3,
        pointRadius: 4,
        tension: 0.3,
        yAxisID: 'y',
        order: 1,
      },
    ],
  };
  return (
    <>
      <Card title="D3 · SF Logged Activity Share">
        <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>
          What share of open leads (denominator) have Salesforce-logged activity. Drops from ~5% in Jan to near zero by Jun–Aug.
        </div>
        <div style={{ height: 340 }}>
          <Bar data={actChart} options={{
            responsive: true, maintainAspectRatio: false,
            plugins: {
              legend: { display: true, position: 'top' as const },
              annotation: { annotations: eventAnnotationsMonthly() },
            },
            scales: {
              y: { beginAtZero: true, position: 'left' as const, title: { display: true, text: 'Share %' } },
              y1: { beginAtZero: true, position: 'right' as const, grid: { drawOnChartArea: false }, title: { display: true, text: 'Count' } },
            },
          }} />
        </div>
      </Card>

      <Card title="SF Activity Data">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>
              <Th>Month</Th>
              <Th right>SF activities</Th>
              <Th right>Open leads</Th>
              <Th right>Share %</Th>
              <Th>Status</Th>
            </tr>
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

function CoordinatorTab() {
  const coordColors = ['#3A6EA4', '#c0392b', '#8CD1C8', '#7C5CD6', '#d1d5db'];
  const ownerColors = ['#3A6EA4', '#c0392b', '#8CD1C8', '#FDBE67', '#1B2A4A', '#e8a33b', '#6AA84F', '#7C5CD6', '#B6CAE3', '#d1d5db'];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const coordChart: any = {
    labels: COORDINATOR_MIX.labels,
    datasets: COORDINATOR_MIX.coord.map((c: { name: string; data: number[] }, i: number) => ({
      label: c.name,
      data: c.data,
      backgroundColor: coordColors[i % coordColors.length],
      stack: 's1',
    })),
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ownerChart: any = {
    labels: COORDINATOR_MIX.labels,
    datasets: COORDINATOR_MIX.owner.map((o: { name: string; data: number[] }, i: number) => ({
      label: o.name,
      data: o.data,
      backgroundColor: ownerColors[i % ownerColors.length],
      stack: 's1',
    })),
  };
  return (
    <>
      <Card title="E1 · Coordinator Mix by Month (GHL Contact Owner)">
        <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>
          Share of leads by GHL contact owner (coordinator). Shows how the caseload shifted — Desirea&apos;s share dropped from 53% to 23%, Sam Rice entered in Aug.
        </div>
        <div style={{ height: 340 }}>
          <Bar data={coordChart} options={{
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: true, position: 'top' as const } },
            scales: {
              x: { stacked: true },
              y: { stacked: true, beginAtZero: true, max: 100, title: { display: true, text: '% of leads' } },
            },
          }} />
        </div>
      </Card>

      <Card title="E2 · Record Owner Mix by Month (Salesforce Owner)">
        <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>
          Share of leads by Salesforce record owner. Similar pattern: original three coordinators&apos; shares shrank as Sam Rice took on ~17% of caseload.
        </div>
        <div style={{ height: 380 }}>
          <Bar data={ownerChart} options={{
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: true, position: 'top' as const } },
            scales: {
              x: { stacked: true },
              y: { stacked: true, beginAtZero: true, max: 100, title: { display: true, text: '% of leads' } },
            },
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
  const [tab, setTab] = useState<TabId>('cohort');

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
            <div style={{ fontSize: 20, fontWeight: 700, color: TP.navy }}>{(MONTHLY_WINBACK.rate.slice(0, 5).reduce((a: number, b: number) => a + b, 0) / 5).toFixed(1)}%</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>Jun–Aug avg win-back rate</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: TP.red }}>{(MONTHLY_WINBACK.rate.slice(5, 8).reduce((a: number, b: number) => a + b, 0) / 3).toFixed(1)}%</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>GHL coverage (avg)</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: TP.navy }}>{(GHL_COVERAGE.coverage.reduce((a: number, b: number) => a + b, 0) / GHL_COVERAGE.coverage.length).toFixed(1)}%</div>
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

      {tab === 'cohort' && <CohortTab />}
      {tab === 'winback' && <WinbackTab />}
      {tab === 'plan' && <PlanTab />}
      {tab === 'ghl' && <GHLTab />}
      {tab === 'touch' && <LastTouchTab />}
      {tab === 'touchwindow' && <TouchWindowTab />}
      {tab === 'sfactivity' && <SFActivityTab />}
      {tab === 'coordinator' && <CoordinatorTab />}
    </div>
  );
}
