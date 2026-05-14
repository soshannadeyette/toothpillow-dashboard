'use client';

import { useEffect, useState } from 'react';
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
import { fetchAnnualSummaries, upsertMonthlySummary, fetchSubmissions, currentMonth, currentYear } from '@/lib/api';
import type { MonthlySummary, DailySubmission } from '@/lib/types';
import { MONTHLY_GOALS_2026, MONTH_NAMES } from '@/lib/types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const TP = {
  blue: '#3A6EA4',
  skyBlue: '#B6CAE3',
  lightBlue: '#D6E5F7',
  cream: '#FEF8EE',
  green: '#8CD1C8',
  yellow: '#FDBE67',
  peach: '#FBCCC5',
  red: '#DD5759',
  darkPurple: '#B26CA6',
  lightPurple: '#DDBBD9',
  bubblegum: '#F6AACB',
  maroon: '#D46476',
  text: '#333333',
  navy: '#1B2A4A',
};

// Per-month online/hybrid/prime goals derived from MONTHLY_GOALS_2026
// Fallback in case the type only has total goals
const ONLINE_GOALS_2026: Record<number, number> = {
  1: 1067, 2: 1174, 3: 1291, 4: 1420, 5: 1562, 6: 1718,
  7: 1890, 8: 2079, 9: 2287, 10: 2516, 11: 2767, 12: 3044,
};
const HYBRID_GOALS_2026: Record<number, number> = {
  1: 363, 2: 401, 3: 444, 4: 355, 5: 405, 6: 460,
  7: 500, 8: 500, 9: 500, 10: 500, 11: 500, 12: 500,
};
const PRIME_GOAL = 25;

// Ambassador commission data (personal payouts, separate from role income)
const AMB_COMMISSIONS: Record<string, number> = {
  'January': 1803.95,
  'February': 2588.20,
  'March': 1441.40,
  'April': 1552.18,
  'May': 1600.00,
};

// 2025 website traffic (from GA4)
const TRAFFIC_2025: Record<number, number> = {
  1: 57814, 2: 58901, 3: 57747, 4: 33895, 5: 31621, 6: 31681,
  7: 73193, 8: 37180, 9: 29179, 10: 28271, 11: 54674, 12: 36031,
};

// 2025 submissions (for conversion calc)
const SUBS_2025: Record<number, number> = {
  1: 1434, 2: 1560, 3: 1510, 4: 1663, 5: 1328, 6: 1039,
  7: 2588, 8: 2478, 9: 1550, 10: 1475, 11: 1591, 12: 1226,
};

function pct(val: number, total: number): string {
  if (!total) return '0%';
  return (val / total * 100).toFixed(1) + '%';
}

function fmtPct(val: number | null | undefined): string {
  if (val == null) return '--';
  return val.toFixed(2) + '%';
}

function fmtDollar(val: number): string {
  return '$' + val.toLocaleString();
}

function goalPctColor(val: number): string {
  if (val >= 90) return TP.green;
  if (val >= 70) return TP.yellow;
  return TP.red;
}

export default function AnnualView() {
  const [data2026, setData2026] = useState<MonthlySummary[]>([]);
  const [data2025, setData2025] = useState<MonthlySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  const thisMonth = currentMonth();
  const thisYear = currentYear();

  const [visitorInput, setVisitorInput] = useState('');
  const [usaVisitorInput, setUsaVisitorInput] = useState('');

  async function loadData() {
    setLoading(true);
    try {
      const [r2026, r2025, dailyEntries] = await Promise.all([
        fetchAnnualSummaries(2026),
        fetchAnnualSummaries(2025),
        fetchSubmissions(thisYear, thisMonth),
      ]);

      let merged = (r2026 || []).slice();

      // Build current month summary from daily_submissions if not already in monthly_summary
      if (dailyEntries && dailyEntries.length > 0) {
        const hasMonth = merged.some(m => m.month === thisMonth && m.year === thisYear);
        const totalOnline = dailyEntries.reduce((s: number, e: DailySubmission) => s + (e.online || 0), 0);
        const totalHybrid = dailyEntries.reduce((s: number, e: DailySubmission) => s + (e.hybrid || 0), 0);
        const totalPrime = dailyEntries.reduce((s: number, e: DailySubmission) => s + (e.prime || 0), 0);
        const totalSubs = totalOnline + totalHybrid + totalPrime;
        const totalVisitors = dailyEntries.reduce((s: number, e: DailySubmission) => s + (e.visitors || 0), 0);
        const totalIncome = dailyEntries.reduce((s: number, e: DailySubmission) => s + (e.income || 0), 0);
        const goalObj = (MONTHLY_GOALS_2026 as { month: number; total: number }[]).find(g => g.month === thisMonth);
        const convRate = totalVisitors > 0 ? parseFloat(((totalSubs / totalVisitors) * 100).toFixed(2)) : 0;

        const liveSummary: MonthlySummary = {
          year: thisYear,
          month: thisMonth,
          month_name: MN[thisMonth] || '',
          goal: goalObj?.total || 0,
          total_submissions: totalSubs,
          online_submissions: totalOnline,
          hybrid_submissions: totalHybrid,
          prime_submissions: totalPrime,
          total_income: totalIncome,
          total_visitors: totalVisitors,
          usa_visitors: 0,
          conversion_rate: convRate,
          usa_conversion_rate: 0,
          days_tracked: dailyEntries.length,
          daily_avg: dailyEntries.length > 0 ? parseFloat((totalSubs / dailyEntries.length).toFixed(1)) : 0,
        };

        if (hasMonth) {
          // Merge: daily tracker data overrides submission counts, keep visitor data from monthly_summary if set
          merged = merged.map(m => {
            if (m.month === thisMonth && m.year === thisYear) {
              return {
                ...liveSummary,
                total_visitors: m.total_visitors || liveSummary.total_visitors,
                usa_visitors: m.usa_visitors || liveSummary.usa_visitors,
                conversion_rate: (m.total_visitors || liveSummary.total_visitors) > 0
                  ? parseFloat(((totalSubs / (m.total_visitors || liveSummary.total_visitors)) * 100).toFixed(2))
                  : convRate,
                usa_conversion_rate: m.usa_conversion_rate || 0,
              };
            }
            return m;
          });
        } else {
          merged.push(liveSummary);
        }
      }

      setData2026(merged);
      setData2025(r2025 || []);
    } finally {
      setLoading(false);
    }
  }

  // Month names helper used before allMonthLabels is defined
  const MN = ['','January','February','March','April','May','June','July','August','September','October','November','December'];

  useEffect(() => {
    loadData();
  }, []);

  async function handleSaveVisitors() {
    setSaving(true);
    setSaveMsg('');
    try {
      await upsertMonthlySummary({
        year: thisYear,
        month: thisMonth,
        total_visitors: visitorInput ? parseInt(visitorInput, 10) : undefined,
        usa_visitors: usaVisitorInput ? parseInt(usaVisitorInput, 10) : undefined,
      });
      setSaveMsg('Saved successfully.');
      await loadData();
    } catch (e) {
      setSaveMsg('Error saving. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  // ---- Derived values ----
  const months2026 = data2026.slice().sort((a, b) => a.month - b.month);
  const months2025 = data2025.slice().sort((a, b) => a.month - b.month);

  // YTD totals
  const ytdSubs = months2026.reduce((s, m) => s + (m.total_submissions || 0), 0);
  const ytdOnline = months2026.reduce((s, m) => s + (m.online_submissions || 0), 0);
  const ytdHybrid = months2026.reduce((s, m) => s + (m.hybrid_submissions || 0), 0);
  const ytdPrime = months2026.reduce((s, m) => s + (m.prime_submissions || 0), 0);
  const ytdGoal = months2026.reduce((s, m) => s + (m.goal || 0), 0);
  const ytdVisitors = months2026.reduce((s, m) => s + (m.total_visitors || 0), 0);
  const ytdIncome = months2026.reduce((s, m) => s + (m.total_income || 0), 0);
  const ytdConvAll = months2026.filter(m => m.conversion_rate != null);
  const ytdConvAvg = ytdConvAll.length
    ? ytdConvAll.reduce((s, m) => s + (m.conversion_rate || 0), 0) / ytdConvAll.length
    : 0;
  const goalPctVal = ytdGoal > 0 ? (ytdSubs / ytdGoal) * 100 : 0;

  // Ambassador commission YTD
  const ytdAmbComm = months2026.reduce((s, m) => s + (AMB_COMMISSIONS[MN[m.month]] || 0), 0);
  const ytdCombinedIncome = ytdIncome + ytdAmbComm;
  const monthsTracked = months2026.filter(m => m.total_submissions > 0).length;

  // Chart labels
  const allMonthLabels = MONTH_NAMES
    ? (MONTH_NAMES as string[]).slice(1, 13)
    : ['January','February','March','April','May','June','July','August','September','October','November','December'];

  function getMonthVal(rows: MonthlySummary[], monthIdx: number, field: keyof MonthlySummary): number {
    const row = rows.find(r => r.month === monthIdx + 1);
    return row ? (row[field] as number) || 0 : 0;
  }

  // Monthly perf chart
  const monthlyChartData = {
    labels: allMonthLabels,
    datasets: [
      {
        label: 'Online',
        data: allMonthLabels.map((_, i) => getMonthVal(months2026, i, 'online_submissions')),
        backgroundColor: TP.blue,
        stack: 'stack0',
      },
      {
        label: 'Hybrid',
        data: allMonthLabels.map((_, i) => getMonthVal(months2026, i, 'hybrid_submissions')),
        backgroundColor: TP.yellow,
        stack: 'stack0',
      },
      {
        label: 'Prime',
        data: allMonthLabels.map((_, i) => getMonthVal(months2026, i, 'prime_submissions')),
        backgroundColor: TP.red,
        stack: 'stack0',
      },
      {
        label: 'Goal',
        data: allMonthLabels.map((_, i) => {
          const row = months2026.find(r => r.month === i + 1);
          const fallbackGoal = (MONTHLY_GOALS_2026 as { month: number; total: number }[]).find(g => g.month === i + 1);
          return row?.goal || fallbackGoal?.total || 0;
        }),
        type: 'line' as const,
        borderColor: '#6b7280',
        borderDash: [6, 4],
        borderWidth: 2,
        pointRadius: 3,
        fill: false,
        backgroundColor: 'transparent',
        stack: undefined,
      },
    ],
  };

  const monthlyChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: '2026 Monthly Submissions vs Goal' },
    },
    scales: {
      x: { stacked: true },
      y: { stacked: true, beginAtZero: true },
    },
  };

  // Conversion line charts
  const convChartData = {
    labels: allMonthLabels,
    datasets: [
      {
        label: 'Conversion Rate (%)',
        data: allMonthLabels.map((_, i) => {
          const row = months2026.find(r => r.month === i + 1);
          return row?.conversion_rate ?? null;
        }),
        borderColor: TP.blue,
        backgroundColor: TP.lightBlue + '55',
        fill: true,
        tension: 0.3,
        pointRadius: 4,
      },
    ],
  };

  const usaConvChartData = {
    labels: allMonthLabels,
    datasets: [
      {
        label: 'USA Conversion Rate (%)',
        data: allMonthLabels.map((_, i) => {
          const row = months2026.find(r => r.month === i + 1);
          return row?.usa_conversion_rate ?? null;
        }),
        borderColor: TP.blue,
        backgroundColor: TP.lightBlue + '55',
        fill: true,
        tension: 0.3,
        pointRadius: 4,
      },
    ],
  };

  const convChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (v: number | string) => v + '%',
        },
      },
    },
  };

  // Traffic comparison (2025 from hardcoded constants, 2026 from Supabase)
  const traffic2025Total = Object.values(TRAFFIC_2025).reduce((s, v) => s + v, 0);
  const traffic2026Total = ytdVisitors;
  const months2026WithData = months2026.filter(m => m.total_visitors > 0).length;
  const yoyChangePct = traffic2025Total > 0 && months2026WithData > 0
    ? ((traffic2026Total - traffic2025Total) / traffic2025Total * 100).toFixed(1)
    : '--';
  const avgMonthly2026 = months2026WithData > 0
    ? Math.round(traffic2026Total / months2026WithData)
    : 0;

  const trafficChartData = {
    labels: allMonthLabels,
    datasets: [
      {
        label: '2025 Visitors',
        data: allMonthLabels.map((_, i) => TRAFFIC_2025[i + 1] || 0),
        backgroundColor: TP.lightPurple,
      },
      {
        label: '2026 Visitors',
        data: allMonthLabels.map((_, i) => getMonthVal(months2026, i, 'total_visitors')),
        backgroundColor: TP.blue,
      },
    ],
  };

  const trafficChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: 'Website Visitors: 2025 vs 2026' },
    },
    scales: { y: { beginAtZero: true } },
  };

  // Income projections
  const projectedFullYear = monthsTracked > 0
    ? Math.round((ytdCombinedIncome / monthsTracked) * 12)
    : 0;

  // Build cumulative income for table
  let cumIncome = 0;
  const incomeRows = months2026.map(m => {
    const income = m.total_income || 0;
    cumIncome += income;
    return { ...m, income, cumIncome };
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Loading annual data...
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4" style={{ color: TP.text }}>

      {/* ===== 1. Visitor Data Entry ===== */}
      <section className="bg-white rounded-xl shadow p-5">
        <h2 className="text-lg font-semibold mb-4" style={{ color: TP.navy }}>
          Update Visitor Data -- {allMonthLabels[thisMonth - 1]} {thisYear}
        </h2>
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600">
              GA4 Unique Visitors
            </label>
            <input
              type="number"
              className="border border-gray-300 rounded-lg px-3 py-2 w-44 focus:outline-none focus:ring-2 focus:ring-blue-300"
              value={visitorInput}
              onChange={e => setVisitorInput(e.target.value)}
              placeholder="e.g. 12500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600">
              USA Only Visitors
            </label>
            <input
              type="number"
              className="border border-gray-300 rounded-lg px-3 py-2 w-44 focus:outline-none focus:ring-2 focus:ring-blue-300"
              value={usaVisitorInput}
              onChange={e => setUsaVisitorInput(e.target.value)}
              placeholder="e.g. 10800"
            />
          </div>
          <button
            onClick={handleSaveVisitors}
            disabled={saving}
            className="px-5 py-2 rounded-lg font-semibold text-white transition-opacity"
            style={{ backgroundColor: TP.blue, opacity: saving ? 0.6 : 1 }}
          >
            {saving ? 'Saving...' : 'Save Visitors'}
          </button>
          {saveMsg && (
            <span
              className="text-sm font-medium"
              style={{ color: saveMsg.startsWith('Error') ? TP.red : TP.green }}
            >
              {saveMsg}
            </span>
          )}
        </div>
      </section>

      {/* ===== 2. YTD Summary Cards ===== */}
      <section>
        <h2 className="text-lg font-semibold mb-3" style={{ color: TP.navy }}>
          Year-to-Date Summary
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div
            className="bg-white rounded-xl shadow p-4"
            style={{ borderLeft: `4px solid ${TP.navy}` }}
          >
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">YTD Submissions</div>
            <div className="text-2xl font-bold" style={{ color: TP.navy }}>
              {ytdSubs.toLocaleString()}
            </div>
            <div className="text-xs mt-1 space-x-1">
              <span style={{ color: TP.blue }}>{ytdOnline.toLocaleString()} online</span>
              <span style={{ color: '#d97706' }}>{ytdHybrid.toLocaleString()} hybrid</span>
              <span style={{ color: TP.red }}>{ytdPrime.toLocaleString()} prime</span>
            </div>
          </div>

          <div
            className="bg-white rounded-xl shadow p-4"
            style={{ borderLeft: `4px solid ${TP.navy}` }}
          >
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">YTD Goal</div>
            <div className="text-2xl font-bold" style={{ color: TP.navy }}>
              {ytdGoal.toLocaleString()}
            </div>
          </div>

          <div
            className="bg-white rounded-xl shadow p-4"
            style={{ borderLeft: `4px solid ${goalPctVal >= 100 ? TP.green : TP.red}` }}
          >
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">% of Goal</div>
            <div
              className="text-2xl font-bold"
              style={{ color: goalPctVal >= 100 ? TP.green : TP.red }}
            >
              {goalPctVal.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-400">
              {ytdGoal - ytdSubs > 0
                ? (ytdGoal - ytdSubs).toLocaleString() + ' remaining'
                : 'Goal met!'}
            </div>
          </div>

          <div
            className="bg-white rounded-xl shadow p-4"
            style={{ borderLeft: `4px solid ${TP.blue}` }}
          >
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">YTD Visitors</div>
            <div className="text-2xl font-bold" style={{ color: TP.blue }}>
              {ytdVisitors.toLocaleString()}
            </div>
          </div>

          <div
            className="bg-white rounded-xl shadow p-4"
            style={{ borderLeft: `4px solid ${TP.yellow}` }}
          >
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">YTD Conversion</div>
            <div className="text-2xl font-bold" style={{ color: '#d97706' }}>
              {fmtPct(ytdConvAvg)}
            </div>
            <div className="text-xs text-gray-400">avg across months</div>
          </div>

          <div
            className="bg-white rounded-xl shadow p-4"
            style={{ borderLeft: `4px solid ${TP.green}` }}
          >
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">YTD Income</div>
            <div className="text-2xl font-bold" style={{ color: TP.green }}>
              {fmtDollar(Math.round(ytdCombinedIncome))}
            </div>
            <div className="text-xs text-gray-400">role + ambassador</div>
          </div>
        </div>
      </section>

      {/* ===== 3. Monthly Performance Chart ===== */}
      <section className="bg-white rounded-xl shadow p-5">
        <Bar data={monthlyChartData as any} options={monthlyChartOptions} />
      </section>

      {/* ===== 4. Monthly Performance Table ===== */}
      <section className="bg-white rounded-xl shadow p-5">
        <h2 className="text-lg font-semibold mb-4" style={{ color: TP.navy }}>
          Monthly Performance
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-gray-200">
                {[
                  'Month','Online','Hybrid','Prime','Total','Goal','Gap',
                  '% Goal','Visitors','Conv %','USA Visitors','USA Conv %','Daily Avg',
                ].map(h => (
                  <th key={h} className="py-2 px-2 font-semibold text-gray-600 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {months2026.map(m => {
                const goalObj = (MONTHLY_GOALS_2026 as { month: number; total: number }[]).find(g => g.month === m.month);
                const goal = m.goal || goalObj?.total || 0;
                const gap = (m.total_submissions || 0) - goal;
                const gpct = goal > 0 ? (m.total_submissions || 0) / goal * 100 : 0;
                return (
                  <tr key={m.month} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 px-2 font-medium">{m.month_name || allMonthLabels[m.month - 1]}</td>
                    <td className="py-2 px-2" style={{ color: TP.blue }}>
                      {(m.online_submissions || 0).toLocaleString()}
                    </td>
                    <td className="py-2 px-2" style={{ color: '#d97706' }}>
                      {(m.hybrid_submissions || 0).toLocaleString()}
                    </td>
                    <td className="py-2 px-2" style={{ color: TP.red }}>
                      {(m.prime_submissions || 0).toLocaleString()}
                    </td>
                    <td className="py-2 px-2 font-semibold">
                      {(m.total_submissions || 0).toLocaleString()}
                    </td>
                    <td className="py-2 px-2 text-gray-500">{goal.toLocaleString()}</td>
                    <td
                      className="py-2 px-2 font-medium"
                      style={{ color: gap >= 0 ? TP.green : TP.red }}
                    >
                      {gap >= 0 ? '+' : ''}{gap.toLocaleString()}
                    </td>
                    <td
                      className="py-2 px-2 font-medium"
                      style={{ color: gpct >= 100 ? TP.green : TP.red }}
                    >
                      {gpct.toFixed(1)}%
                    </td>
                    <td className="py-2 px-2">{(m.total_visitors || 0).toLocaleString()}</td>
                    <td className="py-2 px-2">{fmtPct(m.conversion_rate)}</td>
                    <td className="py-2 px-2">{(m.usa_visitors || 0).toLocaleString()}</td>
                    <td className="py-2 px-2">{fmtPct(m.usa_conversion_rate)}</td>
                    <td className="py-2 px-2">{m.daily_avg != null ? m.daily_avg.toFixed(1) : '--'}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="font-bold bg-gray-50">
                <td className="py-2 px-2">TOTAL</td>
                <td className="py-2 px-2" style={{ color: TP.blue }}>
                  {ytdOnline.toLocaleString()}
                </td>
                <td className="py-2 px-2" style={{ color: '#d97706' }}>
                  {ytdHybrid.toLocaleString()}
                </td>
                <td className="py-2 px-2" style={{ color: TP.red }}>
                  {ytdPrime.toLocaleString()}
                </td>
                <td className="py-2 px-2">{ytdSubs.toLocaleString()}</td>
                <td className="py-2 px-2 text-gray-500">{ytdGoal.toLocaleString()}</td>
                <td
                  className="py-2 px-2"
                  style={{ color: ytdSubs - ytdGoal >= 0 ? TP.green : TP.red }}
                >
                  {ytdSubs - ytdGoal >= 0 ? '+' : ''}{(ytdSubs - ytdGoal).toLocaleString()}
                </td>
                <td
                  className="py-2 px-2"
                  style={{ color: goalPctVal >= 100 ? TP.green : TP.red }}
                >
                  {goalPctVal.toFixed(1)}%
                </td>
                <td className="py-2 px-2">{ytdVisitors.toLocaleString()}</td>
                <td className="py-2 px-2">--</td>
                <td className="py-2 px-2">
                  {months2026.reduce((s, m) => s + (m.usa_visitors || 0), 0).toLocaleString()}
                </td>
                <td className="py-2 px-2">--</td>
                <td className="py-2 px-2">--</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      {/* ===== 5. Monthly Conversion Rate Charts ===== */}
      <section>
        <h2 className="text-lg font-semibold mb-3" style={{ color: TP.navy }}>
          Conversion Rate Trends
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow p-5">
            <h3 className="text-sm font-semibold mb-3 text-gray-600">
              Conversion Rate by Month
            </h3>
            <Line
              data={convChartData}
              options={{
                ...convChartOptions,
                plugins: {
                  ...convChartOptions.plugins,
                  title: { display: false },
                },
              }}
            />
          </div>
          <div className="bg-white rounded-xl shadow p-5">
            <h3 className="text-sm font-semibold mb-3 text-gray-600">
              USA Conversion Rate by Month
            </h3>
            <Line
              data={usaConvChartData}
              options={{
                ...convChartOptions,
                plugins: {
                  ...convChartOptions.plugins,
                  title: { display: false },
                },
              }}
            />
          </div>
        </div>
      </section>

      {/* ===== 6. Goal Tracking by Type ===== */}
      <section className="bg-white rounded-xl shadow p-5">
        <h2 className="text-lg font-semibold mb-4" style={{ color: TP.navy }}>
          Goal Tracking by Submission Type
        </h2>

        {/* Summary cards */}
        {(() => {
          const onlineGoalYTD = months2026.reduce((s, m) => s + (ONLINE_GOALS_2026[m.month] || 0), 0);
          const hybridGoalYTD = months2026.reduce((s, m) => s + (HYBRID_GOALS_2026[m.month] || 0), 0);
          const primeGoalYTD = months2026.length * PRIME_GOAL;
          const onlinePct = onlineGoalYTD > 0 ? ytdOnline / onlineGoalYTD * 100 : 0;
          const hybridPct = hybridGoalYTD > 0 ? ytdHybrid / hybridGoalYTD * 100 : 0;
          const primePct = primeGoalYTD > 0 ? ytdPrime / primeGoalYTD * 100 : 0;

          return (
            <>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div
                  className="rounded-xl p-4"
                  style={{ backgroundColor: TP.lightBlue }}
                >
                  <div className="text-xs uppercase tracking-wide mb-1" style={{ color: TP.blue }}>
                    Online YTD % to Goal
                  </div>
                  <div className="text-2xl font-bold" style={{ color: TP.blue }}>
                    {onlinePct.toFixed(1)}%
                  </div>
                  <div className="text-xs mt-1" style={{ color: TP.blue }}>
                    {ytdOnline.toLocaleString()} / {onlineGoalYTD.toLocaleString()}
                  </div>
                </div>
                <div
                  className="rounded-xl p-4"
                  style={{ backgroundColor: '#FEF3C7' }}
                >
                  <div className="text-xs uppercase tracking-wide mb-1" style={{ color: '#d97706' }}>
                    Hybrid YTD % to Goal
                  </div>
                  <div className="text-2xl font-bold" style={{ color: '#d97706' }}>
                    {hybridPct.toFixed(1)}%
                  </div>
                  <div className="text-xs mt-1" style={{ color: '#d97706' }}>
                    {ytdHybrid.toLocaleString()} / {hybridGoalYTD.toLocaleString()}
                  </div>
                </div>
                <div
                  className="rounded-xl p-4"
                  style={{ backgroundColor: '#FEE2E2' }}
                >
                  <div className="text-xs uppercase tracking-wide mb-1" style={{ color: TP.red }}>
                    Prime YTD % to Goal
                  </div>
                  <div className="text-2xl font-bold" style={{ color: TP.red }}>
                    {primePct.toFixed(1)}%
                  </div>
                  <div className="text-xs mt-1" style={{ color: TP.red }}>
                    {ytdPrime.toLocaleString()} / {primeGoalYTD.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Per-month type goal table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="py-2 px-2 font-semibold text-gray-600">Month</th>
                      <th className="py-2 px-2 font-semibold text-gray-600" style={{ color: TP.blue }}>Online</th>
                      <th className="py-2 px-2 font-semibold text-gray-600" style={{ color: TP.blue }}>Online Goal</th>
                      <th className="py-2 px-2 font-semibold text-gray-600" style={{ color: TP.blue }}>%</th>
                      <th className="py-2 px-2 font-semibold text-gray-600" style={{ color: '#d97706' }}>Hybrid</th>
                      <th className="py-2 px-2 font-semibold text-gray-600" style={{ color: '#d97706' }}>Hybrid Goal</th>
                      <th className="py-2 px-2 font-semibold text-gray-600" style={{ color: '#d97706' }}>%</th>
                      <th className="py-2 px-2 font-semibold text-gray-600" style={{ color: TP.red }}>Prime</th>
                      <th className="py-2 px-2 font-semibold text-gray-600" style={{ color: TP.red }}>Prime Goal</th>
                      <th className="py-2 px-2 font-semibold text-gray-600" style={{ color: TP.red }}>%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {months2026.map(m => {
                      const og = ONLINE_GOALS_2026[m.month] || 0;
                      const hg = HYBRID_GOALS_2026[m.month] || 0;
                      const pg = PRIME_GOAL;
                      const opct = og > 0 ? (m.online_submissions || 0) / og * 100 : 0;
                      const hpct = hg > 0 ? (m.hybrid_submissions || 0) / hg * 100 : 0;
                      const ppct = pg > 0 ? (m.prime_submissions || 0) / pg * 100 : 0;
                      return (
                        <tr key={m.month} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-2 px-2 font-medium">{m.month_name || allMonthLabels[m.month - 1]}</td>
                          <td className="py-2 px-2" style={{ color: TP.blue }}>{(m.online_submissions || 0).toLocaleString()}</td>
                          <td className="py-2 px-2 text-gray-500">{og.toLocaleString()}</td>
                          <td className="py-2 px-2 font-medium rounded" style={{ color: goalPctColor(opct) }}>
                            {opct.toFixed(1)}%
                          </td>
                          <td className="py-2 px-2" style={{ color: '#d97706' }}>{(m.hybrid_submissions || 0).toLocaleString()}</td>
                          <td className="py-2 px-2 text-gray-500">{hg.toLocaleString()}</td>
                          <td className="py-2 px-2 font-medium" style={{ color: goalPctColor(hpct) }}>
                            {hpct.toFixed(1)}%
                          </td>
                          <td className="py-2 px-2" style={{ color: TP.red }}>{(m.prime_submissions || 0).toLocaleString()}</td>
                          <td className="py-2 px-2 text-gray-500">{pg}</td>
                          <td className="py-2 px-2 font-medium" style={{ color: goalPctColor(ppct) }}>
                            {ppct.toFixed(1)}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          );
        })()}
      </section>

      {/* ===== 7. Website Traffic 2025 vs 2026 ===== */}
      <section className="bg-white rounded-xl shadow p-5">
        <h2 className="text-lg font-semibold mb-4" style={{ color: TP.navy }}>
          Website Traffic -- 2025 vs 2026
        </h2>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="rounded-xl p-4 border border-gray-200">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">2026 YTD Visitors</div>
            <div className="text-2xl font-bold" style={{ color: TP.blue }}>
              {traffic2026Total.toLocaleString()}
            </div>
          </div>
          <div className="rounded-xl p-4 border border-gray-200">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">2025 Full Year</div>
            <div className="text-2xl font-bold" style={{ color: TP.darkPurple }}>
              {traffic2025Total.toLocaleString()}
            </div>
          </div>
          <div className="rounded-xl p-4 border border-gray-200">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">YOY Change</div>
            <div
              className="text-2xl font-bold"
              style={{
                color: typeof yoyChangePct === 'string' && yoyChangePct !== '--'
                  ? parseFloat(yoyChangePct) >= 0 ? TP.green : TP.red
                  : TP.text,
              }}
            >
              {yoyChangePct !== '--' && parseFloat(yoyChangePct as string) >= 0 ? '+' : ''}
              {yoyChangePct}%
            </div>
          </div>
          <div className="rounded-xl p-4 border border-gray-200">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Avg Monthly (2026)</div>
            <div className="text-2xl font-bold" style={{ color: TP.blue }}>
              {avgMonthly2026.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="mb-6">
          <Bar data={trafficChartData} options={trafficChartOptions} />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-gray-200">
                {[
                  'Month',
                  '2025 Visitors','2026 Visitors','YOY Change',
                  '2025 Subs','2026 Subs',
                  '2025 Conv %','2026 Conv %',
                ].map(h => (
                  <th key={h} className="py-2 px-2 font-semibold text-gray-600 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allMonthLabels.map((label, i) => {
                const monthNum = i + 1;
                const r26 = months2026.find(m => m.month === monthNum);
                const v25 = TRAFFIC_2025[monthNum] || 0;
                const v26 = r26?.total_visitors || 0;
                const s25 = SUBS_2025[monthNum] || 0;
                const s26 = r26?.total_submissions || 0;
                const yoy = v25 > 0 && v26 > 0 ? ((v26 - v25) / v25 * 100) : null;
                const conv25 = v25 > 0 && s25 > 0 ? (s25 / v25 * 100) : null;
                const conv26 = r26?.conversion_rate ?? null;
                return (
                  <tr key={label} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 px-2 font-medium">{label}</td>
                    <td className="py-2 px-2" style={{ color: TP.darkPurple }}>{v25.toLocaleString()}</td>
                    <td className="py-2 px-2" style={{ color: TP.blue }}>{v26 > 0 ? v26.toLocaleString() : '0'}</td>
                    <td
                      className="py-2 px-2 font-medium"
                      style={{ color: yoy == null ? TP.text : yoy >= 0 ? TP.green : TP.red }}
                    >
                      {yoy == null ? '--' : (yoy >= 0 ? '+' : '') + yoy.toFixed(1) + '%'}
                    </td>
                    <td className="py-2 px-2 text-gray-500">{s25.toLocaleString()}</td>
                    <td className="py-2 px-2">{s26 > 0 ? s26.toLocaleString() : '0'}</td>
                    <td className="py-2 px-2 text-gray-500">{conv25 != null ? conv25.toFixed(1) + '%' : '--'}</td>
                    <td className="py-2 px-2">{conv26 != null ? conv26.toFixed(1) + '%' : '--'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* ===== 8. Income Analysis ===== */}
      <section className="bg-white rounded-xl shadow p-5">
        <h2 className="text-lg font-semibold mb-4" style={{ color: TP.navy }}>
          Income Analysis
        </h2>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div
            className="rounded-xl p-4"
            style={{ borderLeft: `4px solid ${TP.yellow}`, backgroundColor: TP.cream }}
          >
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">YTD Role Income</div>
            <div className="text-2xl font-bold" style={{ color: '#d97706' }}>
              {fmtDollar(ytdIncome)}
            </div>
            <div className="text-xs text-gray-400 mt-1">$5 per online submission</div>
          </div>
          <div
            className="rounded-xl p-4"
            style={{ borderLeft: `4px solid ${TP.darkPurple}` }}
          >
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">YTD Ambassador Commission</div>
            <div className="text-2xl font-bold" style={{ color: TP.darkPurple }}>
              ${ytdAmbComm.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-gray-400 mt-1">Personal ambassador payouts</div>
          </div>
          <div
            className="rounded-xl p-4"
            style={{ borderLeft: `4px solid ${TP.green}` }}
          >
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">YTD Combined Income</div>
            <div className="text-2xl font-bold" style={{ color: TP.green }}>
              {fmtDollar(Math.round(ytdCombinedIncome))}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {monthsTracked > 0 ? fmtDollar(Math.round(ytdCombinedIncome / monthsTracked)) + '/mo avg' : '--'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div
            className="rounded-xl p-4"
            style={{ borderLeft: `4px solid ${TP.blue}` }}
          >
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Projected Full Year</div>
            <div className="text-2xl font-bold" style={{ color: TP.blue }}>
              {fmtDollar(projectedFullYear)}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Based on {monthsTracked} month{monthsTracked !== 1 ? 's' : ''} tracked
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-gray-200">
                {['Month','Submissions','Role Income','Amb Commission','Combined'].map(h => (
                  <th key={h} className="py-2 px-2 font-semibold text-gray-600 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {incomeRows.map(m => {
                const monthName = m.month_name || allMonthLabels[m.month - 1];
                const comm = AMB_COMMISSIONS[monthName] || 0;
                const combined = m.income + comm;
                return (
                  <tr key={m.month} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 px-2 font-medium">{monthName}</td>
                    <td className="py-2 px-2">{(m.total_submissions || 0).toLocaleString()}</td>
                    <td className="py-2 px-2" style={{ color: '#d97706' }}>{fmtDollar(m.income)}</td>
                    <td className="py-2 px-2" style={{ color: TP.darkPurple }}>
                      ${comm.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-2 px-2 font-semibold" style={{ color: TP.green }}>
                      {fmtDollar(Math.round(combined))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="font-bold bg-gray-50">
                <td className="py-2 px-2">TOTAL</td>
                <td className="py-2 px-2">{ytdSubs.toLocaleString()}</td>
                <td className="py-2 px-2" style={{ color: '#d97706' }}>{fmtDollar(ytdIncome)}</td>
                <td className="py-2 px-2" style={{ color: TP.darkPurple }}>
                  ${ytdAmbComm.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="py-2 px-2" style={{ color: TP.green }}>{fmtDollar(Math.round(ytdCombinedIncome))}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

    </div>
  );
}
