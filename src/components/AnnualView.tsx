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
import { MONTHLY_GOALS_2026, MONTH_NAMES, TRAFFIC_2025, TRAFFIC_2026, TRAFFIC_USA_2026 } from '@/lib/types';

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

// Traffic constants imported from @/lib/types

// Daily GA4 Total Users — May 2026 (through 5/28)
// Source: GA4 property 402506531, pulled May 28 2026
// NOTE: daily totals won't sum to monthly unique (26,858) due to user deduplication
const GA4_DAILY_MAY_2026: Record<number, number> = {
  1: 1302, 2: 1037, 3: 823, 4: 1218, 5: 1157, 6: 1713, 7: 1303,
  8: 1181, 9: 832, 10: 664, 11: 1294, 12: 1294, 13: 1478, 14: 1382,
  15: 1088, 16: 751, 17: 1169, 18: 1284, 19: 1613, 20: 1780, 21: 1402,
  22: 1474, 23: 1327, 24: 917, 25: 928, 26: 1352, 27: 1660, 28: 389,
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
  // Traffic chart is always weekly, no toggle needed

  const thisMonth = currentMonth();
  const thisYear = currentYear();

  const [visitorInput, setVisitorInput] = useState('');
  const [usaVisitorInput, setUsaVisitorInput] = useState('');

  async function loadData() {
    setLoading(true);
    try {
      const [monthlySummaries, r2025, allDailyEntries] = await Promise.all([
        fetchAnnualSummaries(2026),
        fetchAnnualSummaries(2025),
        fetchSubmissions(thisYear),           // ALL months for 2026
      ]);

      // Group daily entries by month
      const dailyByMonth = new Map<number, DailySubmission[]>();
      for (const entry of (allDailyEntries || [])) {
        const m = new Date(entry.date + 'T12:00:00').getMonth() + 1;
        if (!dailyByMonth.has(m)) dailyByMonth.set(m, []);
        dailyByMonth.get(m)!.push(entry);
      }

      // Monthly summaries from DB — used as fallback for visitor data only
      const dbSummaryByMonth = new Map<number, MonthlySummary>();
      for (const ms of (monthlySummaries || [])) {
        dbSummaryByMonth.set(ms.month, ms);
      }

      // Build all monthly summaries from daily tracker entries (single source of truth)
      const merged: MonthlySummary[] = [];

      for (let month = 1; month <= 12; month++) {
        const entries = dailyByMonth.get(month);
        const dbRow = dbSummaryByMonth.get(month);
        const goalObj = (MONTHLY_GOALS_2026 as { month: number; total: number }[]).find(g => g.month === month);

        if (entries && entries.length > 0) {
          // Compute from daily tracker entries
          const totalOnline = entries.reduce((s, e) => s + (e.online || 0), 0);
          const totalHybrid = entries.reduce((s, e) => s + (e.hybrid || 0), 0);
          const totalPrime = entries.reduce((s, e) => s + (e.prime || 0), 0);
          const totalSubs = totalOnline + totalHybrid + totalPrime;
          const dailyVisitors = entries.reduce((s, e) => s + (e.visitors || 0), 0);

          // Visitor data priority: DB monthly_summary > daily tracker sum > hardcoded TRAFFIC
          const vis = dbRow?.total_visitors || dailyVisitors || TRAFFIC_2026[month] || 0;
          const usaVis = dbRow?.usa_visitors || TRAFFIC_USA_2026[month] || 0;

          merged.push({
            year: thisYear,
            month,
            month_name: MN[month] || '',
            goal: goalObj?.total || 0,
            total_submissions: totalSubs,
            online_submissions: totalOnline,
            hybrid_submissions: totalHybrid,
            prime_submissions: totalPrime,
            total_income: 0,
            total_visitors: vis,
            usa_visitors: usaVis,
            conversion_rate: vis > 0 ? parseFloat(((totalOnline / vis) * 100).toFixed(2)) : 0,
            usa_conversion_rate: usaVis > 0 ? parseFloat(((totalOnline / usaVis) * 100).toFixed(2)) : 0,
            days_tracked: entries.length,
            daily_avg: parseFloat((totalSubs / entries.length).toFixed(1)),
          });
        } else if (dbRow) {
          // No daily entries for this month — fall back to DB monthly_summary
          const vis = dbRow.total_visitors || TRAFFIC_2026[month] || 0;
          const usaVis = dbRow.usa_visitors || TRAFFIC_USA_2026[month] || 0;
          const onlineSubs = dbRow.online_submissions || 0;
          merged.push({
            ...dbRow,
            total_visitors: vis,
            usa_visitors: usaVis,
            conversion_rate: vis > 0 ? parseFloat(((onlineSubs / vis) * 100).toFixed(2)) : 0,
            usa_conversion_rate: usaVis > 0 ? parseFloat(((onlineSubs / usaVis) * 100).toFixed(2)) : 0,
          });
        }
        // else: no data at all for this month — skip
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
  const ytdConvAll = months2026.filter(m => m.conversion_rate != null);
  const ytdConvAvg = ytdConvAll.length
    ? ytdConvAll.reduce((s, m) => s + (m.conversion_rate || 0), 0) / ytdConvAll.length
    : 0;
  const goalPctVal = ytdGoal > 0 ? (ytdSubs / ytdGoal) * 100 : 0;

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
        yAxisID: 'y',
      },
      {
        label: 'Visitors',
        data: allMonthLabels.map((_, i) => {
          const row = months2026.find(r => r.month === i + 1);
          const v = row?.total_visitors || 0;
          return v > 0 ? v : null;
        }),
        type: 'line' as const,
        borderColor: TP.darkPurple,
        borderWidth: 2,
        pointRadius: 4,
        pointBackgroundColor: TP.darkPurple,
        fill: false,
        backgroundColor: 'transparent',
        stack: undefined,
        yAxisID: 'y1',
        tension: 0.3,
      },
    ],
  };

  const monthlyChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: '2026 Monthly Submissions vs Goal & Traffic' },
    },
    scales: {
      x: { stacked: true },
      y: { stacked: true, beginAtZero: true, title: { display: true, text: 'Submissions' } },
      y1: {
        position: 'right' as const,
        beginAtZero: true,
        grid: { drawOnChartArea: false },
        title: { display: true, text: 'Visitors' },
        ticks: {
          callback: (v: number | string) => {
            const n = typeof v === 'string' ? parseFloat(v) : v;
            return n >= 1000 ? (n / 1000).toFixed(0) + 'K' : n;
          },
        },
      },
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



    </div>
  );
}
