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
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import { Bar } from 'react-chartjs-2';
import { monthly, weekly, daily, byTC, bySegment, summary, events, eventCategoryColor } from '@/data/enrollmentCheckouts';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, annotationPlugin);

const TP = {
  blue: '#3A6EA4',
  skyBlue: '#B6CAE3',
  green: '#8CD1C8',
  yellow: '#FDBE67',
  navy: '#1B2A4A',
  text: '#333333',
};

const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const monLabel = (ym: string) => `${MON[parseInt(ym.slice(5, 7), 10) - 1]} ${ym.slice(0, 4)}`;
const money = (n: number) => '$' + Math.round(n).toLocaleString();

const TABS = [
  { id: 'monthly', label: 'Monthly' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'events', label: 'Events' },
  { id: 'coordinator', label: 'By Coordinator' },
  { id: 'revenue', label: 'Revenue' },
] as const;
type TabId = (typeof TABS)[number]['id'];

const baseOpts = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: { y: { beginAtZero: true } },
};

function Card({ children }: { children: ReactNode }) {
  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, background: '#fff', marginBottom: 20 }}>
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

export default function EnrollmentView() {
  const [tab, setTab] = useState<TabId>('monthly');

  return (
    <div>
      {/* Source line + summary */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, color: '#6b7280' }}>Checkouts · Jan 1 – Oct 5, 2026 · from Salesforce</div>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginTop: 10 }}>
          <Stat label="Checkouts (YTD)" value={summary.checkouts.toLocaleString()} />
          <Stat label="Collected" value={money(summary.amountPaid)} />
          <Stat label="Total plan value" value={money(summary.totalAmountPaid)} />
          <Stat label="Avg deal (plan)" value={money(summary.totalAmountPaid / summary.checkouts)} />
          <Stat label="Segment (Lava / Ice)" value={bySegment.map((s) => `${s.segment} ${s.checkouts}`).join(' · ')} />
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

      {tab === 'monthly' && <MonthlyTab />}
      {tab === 'weekly' && <WeeklyTab />}
      {tab === 'events' && <EventsTab />}
      {tab === 'coordinator' && <CoordinatorTab />}
      {tab === 'revenue' && <RevenueTab />}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: '#6b7280' }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: TP.navy }}>{value}</div>
    </div>
  );
}

function MonthlyTab() {
  const labels = monthly.map((m) => monLabel(m.month));
  return (
    <>
      <Card>
        <h3 style={{ margin: '0 0 12px', color: TP.navy, fontWeight: 600 }}>Checkouts by month</h3>
        <div style={{ height: 320 }}>
          <Bar
            data={{ labels, datasets: [{ label: 'Checkouts', data: monthly.map((m) => m.checkouts), backgroundColor: TP.blue, borderRadius: 4 }] }}
            options={baseOpts}
          />
        </div>
      </Card>
      <Card>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr><Th>Month</Th><Th right>Checkouts</Th><Th right>Collected</Th><Th right>Total plan value</Th><Th right>Avg deal (plan)</Th></tr>
          </thead>
          <tbody>
            {monthly.map((m) => (
              <tr key={m.month}>
                <Td bold>{monLabel(m.month)}</Td>
                <Td right>{m.checkouts}</Td>
                <Td right>{money(m.amountPaid)}</Td>
                <Td right>{money(m.totalAmountPaid)}</Td>
                <Td right>{money(m.totalAmountPaid / m.checkouts)}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}

function WeeklyTab() {
  const labels = weekly.map((w) => w.weekStart.slice(5));
  return (
    <Card>
      <h3 style={{ margin: '0 0 4px', color: TP.navy, fontWeight: 600 }}>Checkouts by week</h3>
      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 12 }}>Week starting (Sunday), MM-DD</div>
      <div style={{ height: 340 }}>
        <Bar
          data={{ labels, datasets: [{ label: 'Checkouts', data: weekly.map((w) => w.checkouts), backgroundColor: TP.blue, borderRadius: 3 }] }}
          options={baseOpts}
        />
      </div>
    </Card>
  );
}

const SHORT: Record<string, string> = {
  '2026-02-15': 'AV launch (~Feb)',
  '2026-07-09': 'Call step removed',
  '2026-09-19': 'iCore processor',
  '2026-09-30': 'Amb. $300',
  '2026-10-01': 'Oct 1 launches',
};

function dayIndexForDate(dateStr: string) {
  const exact = daily.findIndex((d) => d.date === dateStr);
  if (exact >= 0) return exact;
  const after = daily.findIndex((d) => d.date >= dateStr);
  return after; // -1 if off the end
}

function EventsTab() {
  const labels = daily.map((d) => d.date);
  // trailing 7-day moving average of checkouts
  const ma7 = daily.map((_, i) => {
    const slice = daily.slice(Math.max(0, i - 6), i + 1);
    return slice.reduce((s, d) => s + d.checkouts, 0) / slice.length;
  });

  const annotations: Record<string, object> = {};
  events.forEach((e, i) => {
    const idx = dayIndexForDate(e.date);
    if (idx < 0) return;
    const color = eventCategoryColor[e.category];
    const showLabel = SHORT[e.date] !== undefined;
    annotations[`ev${i}`] = {
      type: 'line',
      xMin: idx,
      xMax: idx,
      borderColor: color,
      borderWidth: e.impact === 'hurt' ? 2 : 1.25,
      borderDash: e.impact === 'neutral' ? [3, 3] : [6, 3],
      label: showLabel
        ? {
            display: true,
            content: SHORT[e.date],
            position: (i % 2 === 0 ? 'start' : 'end') as 'start' | 'end',
            backgroundColor: color,
            color: '#fff',
            font: { size: 9, weight: 'bold' as const },
            padding: { x: 4, y: 2 },
          }
        : undefined,
    };
  });

  const opts = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index' as const, intersect: false },
    plugins: {
      legend: { display: true, position: 'top' as const },
      annotation: { annotations },
    },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: 'Checkouts' } },
      x: {
        ticks: {
          autoSkip: false,
          maxRotation: 0,
          callback: function (_v: unknown, index: number) {
            const d = daily[index]?.date;
            return d && d.slice(8) === '01' ? MON[parseInt(d.slice(5, 7), 10) - 1] : '';
          },
        },
        grid: { display: false },
      },
    },
  };

  return (
    <>
      <Card>
        <h3 style={{ margin: '0 0 4px', color: TP.navy, fontWeight: 600 }}>Daily checkouts + 7-day average, with enrollment events</h3>
        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 12 }}>
          Light bars = daily checkouts (noisy, weekday-driven). Bold line = 7-day moving average (the real trend). Vertical lines = events; dashed-thick = likely hurt, dotted = measurement-only.
        </div>
        <div style={{ height: 380 }}>
          <Bar
            data={{
              labels,
              datasets: [
                { type: 'bar' as const, label: 'Daily checkouts', data: daily.map((d) => d.checkouts), backgroundColor: `${TP.skyBlue}99`, borderWidth: 0, order: 3 },
                // @ts-expect-error mixed chart: line dataset on a Bar component
                { type: 'line' as const, label: '7-day average', data: ma7, borderColor: TP.navy, backgroundColor: TP.navy, borderWidth: 2.5, pointRadius: 0, tension: 0.3, order: 1 },
              ],
            }}
            options={opts}
          />
        </div>
      </Card>
      <Card>
        <h3 style={{ margin: '0 0 12px', color: TP.navy, fontWeight: 600 }}>Event log</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr><Th>Date</Th><Th>Event</Th><Th>Category</Th><Th>Likely impact</Th><Th>Note</Th></tr>
          </thead>
          <tbody>
            {events.map((e) => (
              <tr key={e.date + e.label}>
                <Td bold>{e.date}{e.approx ? ' (approx)' : ''}</Td>
                <Td>{e.label}</Td>
                <Td><Chip color={eventCategoryColor[e.category]}>{e.category}</Chip></Td>
                <Td>{e.impact}</Td>
                <Td>{e.note}</Td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 14, lineHeight: 1.5 }}>
          Not yet placed (undated — pin from git / HR before charting): photo-button change that lifted assessment completion; the two salesperson departures.
        </div>
      </Card>
    </>
  );
}

function Chip({ children, color }: { children: ReactNode; color: string }) {
  return (
    <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 999, fontSize: 12, fontWeight: 600, color, background: `${color}1A` }}>
      {children}
    </span>
  );
}

function CoordinatorTab() {
  return (
    <>
      <Card>
        <h3 style={{ margin: '0 0 12px', color: TP.navy, fontWeight: 600 }}>Checkouts by treatment coordinator</h3>
        <div style={{ height: 320 }}>
          <Bar
            data={{ labels: byTC.map((t) => t.tc), datasets: [{ label: 'Checkouts', data: byTC.map((t) => t.checkouts), backgroundColor: TP.green, borderRadius: 4 }] }}
            options={baseOpts}
          />
        </div>
      </Card>
      <Card>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr><Th>Treatment Coordinator</Th><Th right>Checkouts</Th><Th right>Collected</Th><Th right>Avg deal (plan)</Th><Th right>Avg days link→checkout</Th></tr>
          </thead>
          <tbody>
            {byTC.map((t) => (
              <tr key={t.tc}>
                <Td bold>{t.tc}</Td>
                <Td right>{t.checkouts}</Td>
                <Td right>{money(t.amountPaid)}</Td>
                <Td right>{money(t.totalAmountPaid / t.checkouts)}</Td>
                <Td right>{t.avgDaysLinkSent.toFixed(1)}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}

function RevenueTab() {
  const labels = monthly.map((m) => monLabel(m.month));
  return (
    <>
      <Card>
        <h3 style={{ margin: '0 0 12px', color: TP.navy, fontWeight: 600 }}>Collected vs. total plan value, by month</h3>
        <div style={{ height: 320 }}>
          <Bar
            data={{
              labels,
              datasets: [
                { label: 'Collected', data: monthly.map((m) => m.amountPaid), backgroundColor: TP.blue, borderRadius: 4 },
                { label: 'Total plan value', data: monthly.map((m) => m.totalAmountPaid), backgroundColor: TP.skyBlue, borderRadius: 4 },
              ],
            }}
            options={{ ...baseOpts, plugins: { legend: { display: true, position: 'top' as const } } }}
          />
        </div>
      </Card>
      <Card>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr><Th>Month</Th><Th right>Collected</Th><Th right>Total plan value</Th><Th right>Avg deal (plan)</Th></tr>
          </thead>
          <tbody>
            {monthly.map((m) => (
              <tr key={m.month}>
                <Td bold>{monLabel(m.month)}</Td>
                <Td right>{money(m.amountPaid)}</Td>
                <Td right>{money(m.totalAmountPaid)}</Td>
                <Td right>{money(m.totalAmountPaid / m.checkouts)}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}
