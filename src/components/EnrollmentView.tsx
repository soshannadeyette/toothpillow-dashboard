'use client';

import { useState, type ReactNode } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { monthly, weekly, byTC, bySegment, summary } from '@/data/enrollmentCheckouts';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

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
