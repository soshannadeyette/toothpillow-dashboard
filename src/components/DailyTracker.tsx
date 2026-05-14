'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
import { Bar } from 'react-chartjs-2';
import { fetchSubmissions, upsertSubmission, fetchAnnualSummaries, currentYear, currentMonth } from '@/lib/api';
import type { DailySubmission, MonthlySummary } from '@/lib/types';
import { MONTHLY_GOALS_2026, MONTH_NAMES } from '@/lib/types';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler);

/* ── 2025 historical monthly totals ── */
const HIST_2025: Record<number, { total: number; days: number; avg: number }> = {
  1: { total: 1434, days: 31, avg: 46.3 },
  2: { total: 1560, days: 28, avg: 55.7 },
  3: { total: 1513, days: 31, avg: 48.8 },
  4: { total: 1665, days: 30, avg: 55.5 },
  5: { total: 1360, days: 31, avg: 43.9 },
  6: { total: 1098, days: 30, avg: 36.6 },
  7: { total: 2690, days: 31, avg: 86.8 },
  8: { total: 2542, days: 31, avg: 82.0 },
  9: { total: 1601, days: 30, avg: 53.4 },
  10: { total: 1508, days: 31, avg: 48.6 },
  11: { total: 1609, days: 30, avg: 53.6 },
  12: { total: 1253, days: 31, avg: 40.4 },
};

/* ── OKR Objectives & Key Results ── */
const OKR_OBJECTIVES = [
  {
    title: 'O1: Strengthen Ambassador Activation',
    color: '#3A6EA4',
    keyResult: '% of ambassadors who have ever had a submission',
    baseline: '64% (251 of 428)',
    target: '75% by end of Q2',
    activities: 'Launch ambassador course in Circle.so, ambassador dashboard live (waiting on dev), build and roll out ambassador onboarding program, promote Launch Incentive program, develop ambassador e-book, develop downline builder program for top ambassadors, ambassador text outreach',
  },
  {
    title: 'O2: Execute Paid Media & Partnerships',
    color: '#B26CA6',
    keyResult: 'Contracted Q2 placements completed on schedule',
    baseline: '~50% complete (Alex Clark, Daily Wire, Discover Ag in flight)',
    target: '100% executed by end of Q2; 2 new Q3/Q4 placements signed',
    activities: 'Alex Clark / Culture Apothecary (newsletter #3 4/17, ad reads, filming 5/13, founder episode 6/1), Daily Wire / Michael Knowles (ad read 4/27), Discover Ag (ad reads 4/23 + 4/30), research and secure 2-3 new podcast/ad read placements for Q3+Q4, optimize Google Ads',
  },
  {
    title: 'O3: Improve Online Conversion Rate',
    color: '#8CD1C8',
    keyResult: 'Online assessment conversion rate',
    baseline: '3.5% (March 2026)',
    target: '4.0% by end of June 2026',
    activities: 'FAQ page, Plans & Pricing page, adult landing page, research page, script and produce eWebinar, on-page SEO (title tags, meta descriptions, structural)',
  },
];

export default function DailyTracker() {
  const [entries, setEntries] = useState<DailySubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState(currentYear());
  const [selectedMonth, setSelectedMonth] = useState(currentMonth());

  // Annual summaries for the YOY chart
  const [annualSummaries, setAnnualSummaries] = useState<MonthlySummary[]>([]);

  // Form state for new/edit entry
  const [formDate, setFormDate] = useState(new Date().toISOString().slice(0, 10));
  const [formOnline, setFormOnline] = useState('');
  const [formHybrid, setFormHybrid] = useState('');
  const [formPrime, setFormPrime] = useState('');
  const [formVisitors, setFormVisitors] = useState('');
  const [formIncome, setFormIncome] = useState('');

  const tableRef = useRef<HTMLDivElement>(null);

  const goal = MONTHLY_GOALS_2026.find(
    (g) => g.month === selectedMonth && g.year === selectedYear
  )?.total ?? 0;

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSubmissions(selectedYear, selectedMonth);
      setEntries(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [selectedYear, selectedMonth]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Fetch 2026 annual summaries for the YOY chart
  useEffect(() => {
    fetchAnnualSummaries(2026)
      .then((data) => setAnnualSummaries(data))
      .catch(() => {}); // silent fail — chart just shows goals + 2025
  }, []);

  const handleSave = async () => {
    if (!formDate) return;
    setSaving(true);
    setError(null);
    try {
      const online = parseInt(formOnline) || 0;
      const hybrid = parseInt(formHybrid) || 0;
      const prime = parseInt(formPrime) || 0;
      await upsertSubmission({
        date: formDate,
        online,
        hybrid,
        prime,
        visitors: parseInt(formVisitors) || 0,
        income: parseFloat(formIncome) || online * 5,
      });
      // Clear form
      setFormOnline('');
      setFormHybrid('');
      setFormPrime('');
      setFormVisitors('');
      setFormIncome('');
      // Reload
      await loadData();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleRowClick = (entry: DailySubmission) => {
    setFormDate(entry.date);
    setFormOnline(String(entry.online));
    setFormHybrid(String(entry.hybrid));
    setFormPrime(String(entry.prime));
    setFormVisitors(String(entry.visitors));
    setFormIncome(String(entry.income));
  };

  // Computed stats
  const totalSubmissions = entries.reduce((s, e) => s + (e.total ?? e.online + e.hybrid + e.prime), 0);
  const totalOnline = entries.reduce((s, e) => s + e.online, 0);
  const totalHybrid = entries.reduce((s, e) => s + e.hybrid, 0);
  const totalPrime = entries.reduce((s, e) => s + e.prime, 0);
  const totalVisitors = entries.reduce((s, e) => s + e.visitors, 0);
  const totalIncome = entries.reduce((s, e) => s + e.income, 0);
  const daysTracked = entries.length;
  const dailyAvg = daysTracked > 0 ? (totalSubmissions / daysTracked).toFixed(1) : '0';
  const convRate = totalVisitors > 0 ? ((totalSubmissions / totalVisitors) * 100).toFixed(1) : '0';

  // Days remaining in month
  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const daysRemaining = daysInMonth - daysTracked;
  const gap = goal - totalSubmissions;
  const neededPerDay = daysRemaining > 0 ? Math.ceil(gap / daysRemaining) : 0;

  // "Should Be At" — expected progress based on days tracked
  const shouldBeAt = Math.round(goal / daysInMonth * daysTracked);
  const aheadBehind = totalSubmissions - shouldBeAt;

  // Projected End-of-Month
  const projectedEOM = daysTracked > 0 ? Math.round((totalSubmissions / daysTracked) * daysInMonth) : 0;
  const projectedPctOfGoal = goal > 0 ? ((projectedEOM / goal) * 100).toFixed(1) : '0';

  // Income projections
  const projectedIncome = daysTracked > 0 ? Math.round((totalIncome / daysTracked) * daysInMonth) : 0;

  // Progress bar percentages
  const progressPct = goal > 0 ? Math.min((totalSubmissions / goal) * 100, 100) : 0;
  const pacePct = goal > 0 ? Math.min((shouldBeAt / goal) * 100, 100) : 0;

  // Chart data: stacked bar (online blue + hybrid gold + prime red) with goal line
  const chartData = {
    labels: entries.map((e) => {
      const d = new Date(e.date + 'T12:00:00');
      return `${d.getMonth() + 1}/${d.getDate()}`;
    }),
    datasets: [
      {
        label: 'Online',
        data: entries.map((e) => e.online),
        backgroundColor: '#2563eb',
        stack: 'stack',
      },
      {
        label: 'Hybrid',
        data: entries.map((e) => e.hybrid),
        backgroundColor: '#d97706',
        stack: 'stack',
      },
      {
        label: 'Prime',
        data: entries.map((e) => e.prime),
        backgroundColor: '#dc2626',
        stack: 'stack',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const },
      tooltip: {
        callbacks: {
          afterBody: (ctx: Array<{ dataIndex: number }>) => {
            const idx = ctx[0].dataIndex;
            const e = entries[idx];
            const total = (e.total ?? e.online + e.hybrid + e.prime);
            return `Total: ${total}`;
          },
        },
      },
    },
    scales: {
      x: { stacked: true },
      y: { stacked: true, beginAtZero: true },
    },
  };

  /* ── YOY Chart Data ── */
  const yoyLabels = MONTH_NAMES.slice(1).map((n) => n.slice(0, 3)); // Jan, Feb, ...

  // Build 2026 actual totals from annual summaries
  const actual2026ByMonth: Record<number, number> = {};
  annualSummaries.forEach((s) => {
    actual2026ByMonth[s.month] = s.total_submissions;
  });

  // Also include current month from live entries if it's 2026
  if (selectedYear === 2026 && totalSubmissions > 0) {
    actual2026ByMonth[selectedMonth] = totalSubmissions;
  }

  const yoyChartData = {
    labels: yoyLabels,
    datasets: [
      {
        label: '2025 Actual',
        data: Array.from({ length: 12 }, (_, i) => HIST_2025[i + 1]?.total ?? 0),
        backgroundColor: '#94a3b8',
        borderRadius: 3,
      },
      {
        label: '2026 Actual',
        data: Array.from({ length: 12 }, (_, i) => actual2026ByMonth[i + 1] ?? 0),
        backgroundColor: '#2563eb',
        borderRadius: 3,
      },
      {
        label: '2026 Goal',
        data: MONTHLY_GOALS_2026.map((g) => g.total),
        type: 'line' as const,
        borderColor: '#dc2626',
        borderWidth: 2,
        borderDash: [6, 3],
        pointRadius: 3,
        pointBackgroundColor: '#dc2626',
        fill: false,
      },
    ],
  };

  const yoyChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const },
      tooltip: {
        callbacks: {
          label: (ctx: { dataset: { label?: string }; parsed: { y: number | null } }) => {
            const val = ctx.parsed.y;
            return `${ctx.dataset.label}: ${val != null ? val.toLocaleString() : '0'}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (val: string | number) => {
            const n = typeof val === 'string' ? parseFloat(val) : val;
            return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
          },
        },
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Month selector */}
      <div className="flex items-center gap-3">
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm"
        >
          {MONTH_NAMES.slice(1).map((name, i) => (
            <option key={i + 1} value={i + 1}>
              {name}
            </option>
          ))}
        </select>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm"
        >
          <option value={2025}>2025</option>
          <option value={2026}>2026</option>
        </select>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Month title */}
      <h2 className="text-xl font-bold text-gray-900">
        {MONTH_NAMES[selectedMonth]} {selectedYear} Submission Tracker
      </h2>

      {/* Stat cards — 2x3 grid matching old dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. Month-to-Date */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 border-l-4 border-l-gray-700 p-5">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Month-to-Date</div>
          <div className="text-4xl font-bold text-gray-900">{totalSubmissions.toLocaleString()}</div>
          <div className="text-sm text-gray-600 mt-1">Total Submissions</div>
          <div className="text-xs text-gray-400 mt-0.5">{totalOnline} online, {totalHybrid} hybrid, {totalPrime} prime</div>
        </div>

        {/* 2. Should Be At */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 border-l-4 border-l-gray-700 p-5">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Should Be At (Day {daysTracked})</div>
          <div className="text-4xl font-bold text-amber-500">{shouldBeAt.toLocaleString()}</div>
          <div className="text-sm text-gray-600 mt-1">Target for End of Today</div>
        </div>

        {/* 3. Ahead / Behind */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 border-l-4 border-l-gray-700 p-5">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Ahead / Behind</div>
          <div className={`text-4xl font-bold ${aheadBehind >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            {aheadBehind >= 0 ? `+${aheadBehind.toLocaleString()}` : aheadBehind.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600 mt-1">{aheadBehind >= 0 ? 'Ahead of Target' : 'Behind Target'}</div>
        </div>

        {/* 4. Daily Target Needed */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 border-l-4 border-l-gray-700 p-5">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Daily Target Needed</div>
          <div className="text-4xl font-bold text-amber-500">{daysRemaining > 0 ? neededPerDay : '--'}</div>
          <div className="text-sm text-gray-600 mt-1">Per Day to Hit Goal</div>
        </div>

        {/* 5. Projected End-of-Month */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 border-l-4 border-l-gray-700 p-5">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Projected End-of-Month</div>
          <div className={`text-4xl font-bold ${daysTracked > 0 && projectedEOM >= goal ? 'text-green-600' : 'text-red-500'}`}>
            {daysTracked > 0 ? projectedEOM.toLocaleString() : '--'}
          </div>
          <div className="text-sm text-gray-600 mt-1">At Current Pace</div>
        </div>

        {/* 6. Will Hit */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 border-l-4 border-l-gray-700 p-5">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Will Hit</div>
          <div className={`text-4xl font-bold ${
            daysTracked > 0 && parseFloat(projectedPctOfGoal) >= 100 ? 'text-green-600' : 'text-purple-500'
          }`}>
            {daysTracked > 0 ? `${Math.round(parseFloat(projectedPctOfGoal))}%` : '--'}
          </div>
          <div className="text-sm text-gray-600 mt-1">Of {goal.toLocaleString()} Goal</div>
        </div>
      </div>

      {/* Progress bar with pace marker */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-700">Progress to Goal</h3>
          <span className="text-sm text-gray-500">
            {totalSubmissions.toLocaleString()} / {goal.toLocaleString()}
          </span>
        </div>
        <div className="relative h-6 bg-gray-100 rounded-full overflow-visible">
          {/* Blue fill — current progress */}
          <div
            className="absolute top-0 left-0 h-full bg-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
          {/* Orange pace marker */}
          <div
            className="absolute top-0 h-full w-0.5 bg-orange-500 z-10"
            style={{ left: `${pacePct}%` }}
          >
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs text-orange-600 font-medium">
              Pace
            </div>
            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs text-orange-600">
              {shouldBeAt.toLocaleString()}
            </div>
          </div>
          {/* Percentage label inside bar */}
          {progressPct > 8 && (
            <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white z-10">
              {progressPct.toFixed(1)}%
            </div>
          )}
        </div>
        {/* Legend */}
        <div className="flex items-center gap-4 mt-6 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-sm bg-blue-500" />
            Current Progress
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-0.5 bg-orange-500" />
            Expected Pace (Day {daysTracked}/{daysInMonth})
          </span>
        </div>
      </div>

      {/* Entry form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Add / Update Entry</h3>
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Date</label>
            <input
              type="date"
              value={formDate}
              onChange={(e) => setFormDate(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm w-40"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Online</label>
            <input
              type="number"
              value={formOnline}
              onChange={(e) => setFormOnline(e.target.value)}
              placeholder="0"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm w-20"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Hybrid</label>
            <input
              type="number"
              value={formHybrid}
              onChange={(e) => setFormHybrid(e.target.value)}
              placeholder="0"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm w-20"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Prime</label>
            <input
              type="number"
              value={formPrime}
              onChange={(e) => setFormPrime(e.target.value)}
              placeholder="0"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm w-20"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Visitors</label>
            <input
              type="number"
              value={formVisitors}
              onChange={(e) => setFormVisitors(e.target.value)}
              placeholder="0"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm w-24"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Income ($)</label>
            <input
              type="number"
              value={formIncome}
              onChange={(e) => setFormIncome(e.target.value)}
              placeholder="auto"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm w-24"
            />
          </div>
          <button
            onClick={handleSave}
            disabled={saving || !formDate}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          {MONTH_NAMES[selectedMonth]} {selectedYear} — Daily Submissions
        </h3>
        <div style={{ height: 300 }}>
          {loading ? (
            <div className="flex items-center justify-center h-full text-gray-400">Loading chart...</div>
          ) : entries.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-400">No data for this month</div>
          ) : (
            <Bar data={chartData} options={chartOptions} />
          )}
        </div>
      </div>

      {/* Sub-totals by type + Conversion */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-xl font-bold text-blue-600">{totalOnline.toLocaleString()}</div>
          <div className="text-sm text-gray-500">Online</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-xl font-bold text-amber-600">{totalHybrid.toLocaleString()}</div>
          <div className="text-sm text-gray-500">Hybrid</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-xl font-bold text-red-600">{totalPrime.toLocaleString()}</div>
          <div className="text-sm text-gray-500">Prime</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-xl font-bold text-gray-900">{convRate}%</div>
          <div className="text-sm text-gray-500">Conversion ({totalVisitors.toLocaleString()} visitors)</div>
        </div>
      </div>

      {/* Income section */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-500 mb-1">Income Earned</div>
          <div className="text-2xl font-bold text-green-600">
            ${totalIncome.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            ${daysTracked > 0 ? (totalIncome / daysTracked).toFixed(0) : '0'}/day avg
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-500 mb-1">Projected Income</div>
          <div className="text-2xl font-bold text-green-600">
            {daysTracked > 0
              ? `$${projectedIncome.toLocaleString()}`
              : '--'}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Based on {daysTracked} day{daysTracked !== 1 ? 's' : ''} tracked
          </div>
        </div>
      </div>

      {/* Data table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden" ref={tableRef}>
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-3 py-2 font-medium">Date</th>
              <th className="px-3 py-2 font-medium text-right">Online</th>
              <th className="px-3 py-2 font-medium text-right">Hybrid</th>
              <th className="px-3 py-2 font-medium text-right">Prime</th>
              <th className="px-3 py-2 font-medium text-right">Total</th>
              <th className="px-3 py-2 font-medium text-right">Visitors</th>
              <th className="px-3 py-2 font-medium text-right">Income</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : entries.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-gray-400">
                  No entries yet
                </td>
              </tr>
            ) : (
              entries.map((e) => {
                const total = e.total ?? e.online + e.hybrid + e.prime;
                const d = new Date(e.date + 'T12:00:00');
                const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
                return (
                  <tr
                    key={e.date}
                    onClick={() => handleRowClick(e)}
                    className="cursor-pointer hover:bg-blue-50"
                  >
                    <td className="px-3 py-2 border-t border-gray-100">
                      {dayName} {d.getMonth() + 1}/{d.getDate()}
                    </td>
                    <td className="px-3 py-2 border-t border-gray-100 text-right text-blue-600">{e.online}</td>
                    <td className="px-3 py-2 border-t border-gray-100 text-right text-amber-600">{e.hybrid}</td>
                    <td className="px-3 py-2 border-t border-gray-100 text-right text-red-600">{e.prime}</td>
                    <td className="px-3 py-2 border-t border-gray-100 text-right font-medium">{total}</td>
                    <td className="px-3 py-2 border-t border-gray-100 text-right">{e.visitors.toLocaleString()}</td>
                    <td className="px-3 py-2 border-t border-gray-100 text-right">${e.income}</td>
                  </tr>
                );
              })
            )}
            {entries.length > 0 && (
              <tr className="bg-gray-50 font-medium">
                <td className="px-3 py-2 border-t border-gray-200">Total</td>
                <td className="px-3 py-2 border-t border-gray-200 text-right text-blue-600">{totalOnline}</td>
                <td className="px-3 py-2 border-t border-gray-200 text-right text-amber-600">{totalHybrid}</td>
                <td className="px-3 py-2 border-t border-gray-200 text-right text-red-600">{totalPrime}</td>
                <td className="px-3 py-2 border-t border-gray-200 text-right">{totalSubmissions}</td>
                <td className="px-3 py-2 border-t border-gray-200 text-right">{totalVisitors.toLocaleString()}</td>
                <td className="px-3 py-2 border-t border-gray-200 text-right">${totalIncome}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/*  Monthly Submissions: 2025 vs 2026                        */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-base font-semibold text-gray-800 mb-4">
          Monthly Submissions: 2025 vs 2026
        </h3>
        <div style={{ height: 360 }}>
          <Bar data={yoyChartData} options={yoyChartOptions} />
        </div>
        {/* Summary table */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-xs text-center border-collapse">
            <thead>
              <tr className="text-gray-500 uppercase">
                <th className="px-2 py-1.5 text-left font-medium">Month</th>
                <th className="px-2 py-1.5 font-medium">2025</th>
                <th className="px-2 py-1.5 font-medium">2026</th>
                <th className="px-2 py-1.5 font-medium">Goal</th>
                <th className="px-2 py-1.5 font-medium">YOY Change</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 12 }, (_, i) => {
                const m = i + 1;
                const h = HIST_2025[m]?.total ?? 0;
                const a = actual2026ByMonth[m] ?? 0;
                const g = MONTHLY_GOALS_2026[i]?.total ?? 0;
                const yoyPct = h > 0 && a > 0 ? (((a - h) / h) * 100).toFixed(1) : null;
                return (
                  <tr key={m} className="border-t border-gray-100">
                    <td className="px-2 py-1.5 text-left text-gray-700 font-medium">{MONTH_NAMES[m].slice(0, 3)}</td>
                    <td className="px-2 py-1.5 text-gray-600">{h.toLocaleString()}</td>
                    <td className="px-2 py-1.5 text-blue-600 font-medium">{a > 0 ? a.toLocaleString() : '—'}</td>
                    <td className="px-2 py-1.5 text-red-600">{g.toLocaleString()}</td>
                    <td className={`px-2 py-1.5 font-medium ${yoyPct !== null && parseFloat(yoyPct) >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {yoyPct !== null ? `${parseFloat(yoyPct) >= 0 ? '+' : ''}${yoyPct}%` : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/*  OKR: Objectives & Key Results                            */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-gray-800">
          Objectives &amp; Key Results
        </h3>
        {OKR_OBJECTIVES.map((obj, idx) => (
          <div
            key={idx}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
          >
            {/* Colored header bar */}
            <div
              className="px-4 py-3 text-white font-semibold text-sm"
              style={{ backgroundColor: obj.color }}
            >
              {obj.title}
            </div>

            {/* Key result table */}
            <div className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left px-4 py-2 font-medium text-gray-600 text-xs uppercase">Key Result</th>
                    <th className="text-left px-4 py-2 font-medium text-gray-600 text-xs uppercase">Baseline</th>
                    <th className="text-left px-4 py-2 font-medium text-gray-600 text-xs uppercase">Target</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-4 py-3 text-gray-800">{obj.keyResult}</td>
                    <td className="px-4 py-3 text-gray-500 text-sm">{obj.baseline}</td>
                    <td className="px-4 py-3 text-gray-800 font-semibold text-sm">{obj.target}</td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="px-4 py-3 text-gray-600 text-sm border-t border-gray-100 leading-relaxed">
                      <span className="font-semibold text-gray-700">Current work:</span> {obj.activities}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
