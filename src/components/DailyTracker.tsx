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
import { Bar, Line } from 'react-chartjs-2';
import { fetchSubmissions, upsertSubmission, fetchAnnualSummaries, currentYear, currentMonth, todayStr } from '@/lib/api';
import type { DailySubmission } from '@/lib/types';
import { MONTHLY_GOALS_2026, MONTH_NAMES, TRAFFIC_2026, TRAFFIC_USA_2026 } from '@/lib/types';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler);

/* -- TP Kids Color Palette ------------------------------ */
const TP = {
  blue:       '#3A6EA4',
  skyBlue:    '#B6CAE3',
  lightBlue:  '#D6E5F7',
  cream:      '#FEF8EE',
  green:      '#8CD1C8',
  yellow:     '#FDBE67',
  peach:      '#FBCCC5',
  red:        '#DD5759',
  darkPurple: '#B26CA6',
  lightPurple:'#DDBBD9',
  bubblegum:  '#F6AACB',
  maroon:     '#D46476',
  text:       '#333333',
  navy:       '#1B2A4A',
};

export default function DailyTracker() {
  const [entries, setEntries] = useState<DailySubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState(currentYear());
  const [selectedMonth, setSelectedMonth] = useState(currentMonth());

  // Form state for new/edit entry
  const [formDate, setFormDate] = useState(todayStr());
  const [formOnline, setFormOnline] = useState('');
  const [formHybrid, setFormHybrid] = useState('');
  const [formPrime, setFormPrime] = useState('');
  const [formVisitors, setFormVisitors] = useState('');
  const [saveConfirm, setSaveConfirm] = useState<string | null>(null);

  const tableRef = useRef<HTMLDivElement>(null);

  const goal = MONTHLY_GOALS_2026.find(
    (g) => g.month === selectedMonth && g.year === selectedYear
  )?.total ?? 0;

  const monthGoal = MONTHLY_GOALS_2026.find(
    (g) => g.month === selectedMonth && g.year === selectedYear
  );

  // DB visitor data from monthly_summary (set via Annual tab Save Visitors)
  const [dbVisitors, setDbVisitors] = useState(0);
  const [dbUSAVisitors, setDbUSAVisitors] = useState(0);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [data, summaries] = await Promise.all([
        fetchSubmissions(selectedYear, selectedMonth),
        fetchAnnualSummaries(selectedYear),
      ]);
      setEntries(data);
      const ms = (summaries || []).find(s => s.month === selectedMonth);
      setDbVisitors(ms?.total_visitors || 0);
      setDbUSAVisitors(ms?.usa_visitors || 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [selectedYear, selectedMonth]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSave = async () => {
    if (!formDate) return;
    setSaving(true);
    setError(null);
    try {
      // Only send fields that have values — blank fields are omitted so
      // the API preserves whatever is already in the database.
      const payload: Record<string, unknown> = { date: formDate };
      if (formOnline.trim() !== '')   payload.online   = parseInt(formOnline);
      if (formHybrid.trim() !== '')   payload.hybrid   = parseInt(formHybrid);
      if (formPrime.trim() !== '')    payload.prime    = parseInt(formPrime);
      if (formVisitors.trim() !== '') payload.visitors = parseInt(formVisitors);
      await upsertSubmission(payload as Partial<import('@/lib/types').DailySubmission>);
      // Show confirmation of what was saved
      const d = new Date(formDate + 'T12:00:00');
      const label = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      const parts = [
        payload.online !== undefined ? `online=${payload.online}` : null,
        payload.hybrid !== undefined ? `hybrid=${payload.hybrid}` : null,
        payload.prime !== undefined ? `prime=${payload.prime}` : null,
        payload.visitors !== undefined ? `visitors=${payload.visitors}` : null,
      ].filter(Boolean).join(', ');
      setSaveConfirm(`Saved ${label}: ${parts || '(no changes)'}`);
      setTimeout(() => setSaveConfirm(null), 5000);
      // Clear form
      setFormOnline('');
      setFormHybrid('');
      setFormPrime('');
      setFormVisitors('');
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
  };

  // Computed stats
  const totalSubmissions = entries.reduce((s, e) => s + (e.total ?? e.online + e.hybrid + e.prime), 0);
  const totalOnline = entries.reduce((s, e) => s + e.online, 0);
  const totalHybrid = entries.reduce((s, e) => s + e.hybrid, 0);
  const totalPrime = entries.reduce((s, e) => s + e.prime, 0);
  const totalVisitors = entries.reduce((s, e) => s + e.visitors, 0);
  const daysTracked = entries.length;
  const dailyAvg = daysTracked > 0 ? (totalSubmissions / daysTracked).toFixed(1) : '0';
  // GA4 monthly unique users for conversion rate — DB (from Annual tab) takes priority, then hardcoded fallback
  const monthlyUniqueUsers = dbVisitors || TRAFFIC_2026[selectedMonth] || 0;
  const monthlyUSAUsers = dbUSAVisitors || TRAFFIC_USA_2026[selectedMonth] || 0;

  // Days remaining in month
  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const daysRemaining = daysInMonth - daysTracked;
  const gap = goal - totalSubmissions;
  const neededPerDay = daysRemaining > 0 ? Math.ceil(gap / daysRemaining) : 0;

  // "Should Be At" -- expected progress based on days tracked
  const shouldBeAt = Math.round(goal / daysInMonth * daysTracked);
  const aheadBehind = totalSubmissions - shouldBeAt;

  // Projected End-of-Month
  const projectedEOM = daysTracked > 0 ? Math.round((totalSubmissions / daysTracked) * daysInMonth) : 0;
  const projectedPctOfGoal = goal > 0 ? ((projectedEOM / goal) * 100).toFixed(1) : '0';


  // Progress bar percentages
  const progressPct = goal > 0 ? Math.min((totalSubmissions / goal) * 100, 100) : 0;
  const pacePct = goal > 0 ? Math.min((shouldBeAt / goal) * 100, 100) : 0;

  // Chart data: stacked bar (online blue + hybrid yellow + prime red)
  const chartData = {
    labels: entries.map((e) => {
      const d = new Date(e.date + 'T12:00:00');
      return `${d.getMonth() + 1}/${d.getDate()}`;
    }),
    datasets: [
      {
        label: 'Online',
        data: entries.map((e) => e.online),
        backgroundColor: TP.blue,
        stack: 'stack',
      },
      {
        label: 'Hybrid',
        data: entries.map((e) => e.hybrid),
        backgroundColor: TP.yellow,
        stack: 'stack',
      },
      {
        label: 'Prime',
        data: entries.map((e) => e.prime),
        backgroundColor: TP.red,
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

  // Daily Submissions Breakdown -- line chart with per-type trends and daily target
  const dailyTarget = monthGoal
    ? Math.round((monthGoal.online + monthGoal.hybrid + monthGoal.prime) / daysInMonth)
    : 0;

  const breakdownLabels = entries.map((e) => {
    const d = new Date(e.date + 'T12:00:00');
    return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
  });

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
      <h2 className="text-xl font-bold" style={{ color: TP.navy }}>
        {MONTH_NAMES[selectedMonth]} {selectedYear} Submission Tracker
      </h2>

      {/* Stat cards -- 2x3 grid matching old dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. Month-to-Date */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5" style={{ borderLeft: `4px solid ${TP.navy}` }}>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Month-to-Date</div>
          <div className="text-4xl font-bold" style={{ color: TP.text }}>{totalSubmissions.toLocaleString()}</div>
          <div className="text-sm text-gray-600 mt-1">Total Submissions</div>
          <div className="text-xs text-gray-400 mt-0.5">{totalOnline} online, {totalHybrid} hybrid, {totalPrime} prime</div>
        </div>

        {/* 2. Should Be At */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5" style={{ borderLeft: `4px solid ${TP.yellow}` }}>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Should Be At (Day {daysTracked})</div>
          <div className="text-4xl font-bold" style={{ color: TP.yellow }}>{shouldBeAt.toLocaleString()}</div>
          <div className="text-sm text-gray-600 mt-1">Target for End of Today</div>
        </div>

        {/* 3. Ahead / Behind */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5" style={{ borderLeft: `4px solid ${aheadBehind >= 0 ? TP.green : TP.red}` }}>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Ahead / Behind</div>
          <div className="text-4xl font-bold" style={{ color: aheadBehind >= 0 ? TP.green : TP.red }}>
            {aheadBehind >= 0 ? `+${aheadBehind.toLocaleString()}` : aheadBehind.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600 mt-1">{aheadBehind >= 0 ? 'Ahead of Target' : 'Behind Target'}</div>
        </div>

        {/* 4. Daily Target Needed */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5" style={{ borderLeft: `4px solid ${TP.red}` }}>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Daily Target Needed</div>
          <div className="text-4xl font-bold" style={{ color: TP.red }}>{daysRemaining > 0 ? neededPerDay : '--'}</div>
          <div className="text-sm text-gray-600 mt-1">Per Day to Hit Goal</div>
        </div>

        {/* 5. Projected End-of-Month */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5" style={{ borderLeft: `4px solid ${daysTracked > 0 && projectedEOM >= goal ? TP.green : TP.red}` }}>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Projected End-of-Month</div>
          <div className="text-4xl font-bold" style={{ color: daysTracked > 0 && projectedEOM >= goal ? TP.green : TP.red }}>
            {daysTracked > 0 ? projectedEOM.toLocaleString() : '--'}
          </div>
          <div className="text-sm text-gray-600 mt-1">At Current Pace</div>
        </div>

        {/* 6. Will Hit */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5" style={{ borderLeft: `4px solid ${TP.darkPurple}` }}>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Will Hit</div>
          <div className="text-4xl font-bold" style={{ color: daysTracked > 0 && parseFloat(projectedPctOfGoal) >= 100 ? TP.green : TP.darkPurple }}>
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
          {/* Blue fill -- current progress */}
          <div
            className="absolute top-0 left-0 h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%`, backgroundColor: TP.blue }}
          />
          {/* Pace marker */}
          <div
            className="absolute top-0 h-full w-0.5 z-10"
            style={{ left: `${pacePct}%`, backgroundColor: TP.yellow }}
          >
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-medium" style={{ color: TP.yellow }}>
              Pace
            </div>
            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs" style={{ color: TP.yellow }}>
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
            <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: TP.blue }} />
            Current Progress
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-0.5" style={{ backgroundColor: TP.yellow }} />
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
          <button
            onClick={handleSave}
            disabled={saving || !formDate}
            className="px-4 py-2 text-white text-sm font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: TP.navy }}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
        {saveConfirm && (
          <div className="mt-2 text-sm font-medium" style={{ color: TP.green }}>
            {saveConfirm}
          </div>
        )}
      </div>

      {/* Stacked bar chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          {MONTH_NAMES[selectedMonth]} {selectedYear} -- Daily Submissions
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

      {/* Daily Submissions Breakdown -- line chart with per-type trends */}
      {entries.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-sm font-bold text-gray-700 mb-3">Daily Submissions Breakdown</h3>
          <div style={{ height: 380 }}>
            <Line
              data={{
                labels: breakdownLabels,
                datasets: [
                  {
                    label: 'Online',
                    data: entries.map((d) => d.online),
                    borderColor: TP.blue,
                    backgroundColor: 'rgba(58,110,164,0.15)',
                    borderWidth: 2.5,
                    pointRadius: 4,
                    pointBackgroundColor: TP.blue,
                    tension: 0.4,
                    fill: true,
                  },
                  {
                    label: 'Hybrid',
                    data: entries.map((d) => d.hybrid),
                    borderColor: TP.yellow,
                    backgroundColor: 'rgba(253,190,103,0.12)',
                    borderWidth: 2,
                    pointRadius: 4,
                    pointBackgroundColor: TP.yellow,
                    tension: 0.4,
                    fill: true,
                  },
                  {
                    label: 'Prime',
                    data: entries.map((d) => d.prime),
                    borderColor: TP.red,
                    backgroundColor: 'rgba(221,87,89,0.1)',
                    borderWidth: 2,
                    pointRadius: 4,
                    pointBackgroundColor: TP.red,
                    tension: 0.4,
                    fill: true,
                  },
                  {
                    label: `Daily Target (${dailyTarget}/day)`,
                    data: entries.map(() => dailyTarget),
                    borderColor: TP.yellow,
                    borderDash: [8, 5],
                    borderWidth: 2.5,
                    pointRadius: 0,
                    fill: false,
                    tension: 0,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'top' },
                  tooltip: {
                    callbacks: {
                      afterBody: (ctx) => {
                        const idx = ctx[0].dataIndex;
                        const d = entries[idx];
                        const total = d.online + d.hybrid + d.prime;
                        return `Total: ${total}`;
                      },
                    },
                  },
                },
                scales: {
                  x: { grid: { display: false } },
                  y: { beginAtZero: true },
                },
              }}
            />
          </div>
        </div>
      )}

      {/* ═══ Website Traffic Section ═══ */}
      {entries.length > 0 && entries.some(e => e.visitors > 0) && (() => {
        const trafficDays = entries.filter(e => e.visitors > 0);
        const avgDailyVis = trafficDays.length > 0
          ? Math.round(trafficDays.reduce((sum, e) => sum + e.visitors, 0) / trafficDays.length)
          : 0;
        // Project unique users from GA4 partial-month data, not from daily sessions
        const ga4Partial = monthlyUniqueUsers;
        const projVis = ga4Partial > 0 && trafficDays.length > 0
          ? Math.round(ga4Partial * (daysInMonth / trafficDays.length))
          : avgDailyVis * daysInMonth;
        const peakDay = trafficDays.reduce((best, e) => e.visitors > (best?.visitors ?? 0) ? e : best, trafficDays[0]);
        const peakLabel = peakDay ? new Date(peakDay.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';
        const ga4Users = monthlyUniqueUsers;
        const ga4USA = monthlyUSAUsers;
        const allConv = ga4Users > 0 ? ((totalOnline / ga4Users) * 100).toFixed(2) : null;
        const usaConv = ga4USA > 0 ? ((totalOnline / ga4USA) * 100).toFixed(2) : null;

        return (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center" style={{ borderLeft: `4px solid ${TP.darkPurple}` }}>
                <div className="text-xl font-bold" style={{ color: TP.darkPurple }}>{ga4Users > 0 ? ga4Users.toLocaleString() : totalVisitors.toLocaleString()}</div>
                <div className="text-sm text-gray-500">{ga4Users > 0 ? 'Unique Users (GA4)' : 'Total Sessions'}</div>
                <div className="text-xs text-gray-400 mt-1">{trafficDays.length} of {daysTracked} days tracked</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center" style={{ borderLeft: `4px solid ${TP.darkPurple}` }}>
                <div className="text-xl font-bold" style={{ color: TP.darkPurple }}>{avgDailyVis.toLocaleString()}</div>
                <div className="text-sm text-gray-500">Avg Daily Visitors</div>
                <div className="text-xs text-gray-400 mt-1">Projected: {projVis.toLocaleString()}/mo</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center" style={{ borderLeft: `4px solid ${TP.green}` }}>
                <div className="text-xl font-bold" style={{ color: TP.green }}>{allConv ? `${allConv}%` : '--'}</div>
                <div className="text-sm text-gray-500">Monthly Conversion</div>
                <div className="text-xs text-gray-400 mt-1">{ga4Users > 0 ? `${totalOnline.toLocaleString()} online / ${ga4Users.toLocaleString()} users` : 'No GA4 data yet'}</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center" style={{ borderLeft: `4px solid ${TP.green}` }}>
                <div className="text-xl font-bold" style={{ color: TP.green }}>{usaConv ? `${usaConv}%` : '--'}</div>
                <div className="text-sm text-gray-500">USA Conversion</div>
                <div className="text-xs text-gray-400 mt-1">{ga4USA > 0 ? `${totalOnline.toLocaleString()} online / ${ga4USA.toLocaleString()} USA users` : 'No USA data yet'}</div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="text-sm font-bold text-gray-700 mb-3">Daily Website Traffic & Submissions</h3>
              <div style={{ height: 340 }}>
                <Bar
                  data={{
                    labels: breakdownLabels,
                    datasets: [
                      {
                        label: 'Visitors',
                        data: entries.map(e => e.visitors),
                        backgroundColor: `${TP.darkPurple}55`,
                        borderColor: TP.darkPurple,
                        borderWidth: 1,
                        borderRadius: 3,
                        yAxisID: 'y',
                        order: 2,
                      },
                      {
                        label: 'Online Submissions',
                        data: entries.map(e => e.online),
                        type: 'line' as const,
                        borderColor: TP.blue,
                        backgroundColor: `${TP.blue}18`,
                        pointRadius: 3,
                        pointBackgroundColor: TP.blue,
                        borderWidth: 2.5,
                        tension: 0.3,
                        fill: true,
                        yAxisID: 'y2',
                        order: 1,
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      } as any,
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: 'top' as const, labels: { usePointStyle: true, boxWidth: 8, padding: 16, font: { size: 11 } } },
                    },
                    scales: {
                      y: { beginAtZero: true, position: 'left' as const, title: { display: true, text: 'Visitors', font: { size: 11 } }, grid: { color: '#f0f0f0' } },
                      y2: { beginAtZero: true, position: 'right' as const, title: { display: true, text: 'Submissions', font: { size: 11 }, color: TP.blue }, ticks: { color: TP.blue }, grid: { display: false } },
                      x: { grid: { display: false } },
                    },
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  } as any}
                />
              </div>
              <div className="text-xs text-gray-400 mt-2">
                Visitors from GA4 daily sessions. Monthly conversion uses GA4 unique users (deduplicated) from the Annual tab.
              </div>
            </div>
          </>
        );
      })()}

      {/* ═══ Submission Totals by Type ═══ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center" style={{ borderLeft: `4px solid ${TP.blue}` }}>
          <div className="text-xl font-bold" style={{ color: TP.blue }}>{totalOnline.toLocaleString()}</div>
          <div className="text-sm text-gray-500">Online</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center" style={{ borderLeft: `4px solid ${TP.yellow}` }}>
          <div className="text-xl font-bold" style={{ color: '#d97706' }}>{totalHybrid.toLocaleString()}</div>
          <div className="text-sm text-gray-500">Hybrid</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center" style={{ borderLeft: `4px solid ${TP.red}` }}>
          <div className="text-xl font-bold" style={{ color: TP.red }}>{totalPrime.toLocaleString()}</div>
          <div className="text-sm text-gray-500">Prime</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center" style={{ borderLeft: `4px solid ${TP.bubblegum}` }}>
          <div className="text-xl font-bold" style={{ color: TP.navy }}>{(() => { const pd = entries.filter(e => e.visitors > 0).reduce((b, e) => e.visitors > (b?.visitors ?? 0) ? e : b, entries[0]); return pd ? pd.visitors.toLocaleString() : '--'; })()}</div>
          <div className="text-sm text-gray-500">Peak Traffic Day</div>
          <div className="text-xs text-gray-400 mt-1">{(() => { const pd = entries.filter(e => e.visitors > 0).reduce((b, e) => e.visitors > (b?.visitors ?? 0) ? e : b, entries[0]); return pd ? new Date(pd.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''; })()}</div>
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
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : entries.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-gray-400">
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
                    className="cursor-pointer hover:bg-gray-50"
                  >
                    <td className="px-3 py-2 border-t border-gray-100">
                      {dayName} {d.getMonth() + 1}/{d.getDate()}
                    </td>
                    <td className="px-3 py-2 border-t border-gray-100 text-right" style={{ color: TP.blue }}>{e.online}</td>
                    <td className="px-3 py-2 border-t border-gray-100 text-right" style={{ color: '#d97706' }}>{e.hybrid}</td>
                    <td className="px-3 py-2 border-t border-gray-100 text-right" style={{ color: TP.red }}>{e.prime}</td>
                    <td className="px-3 py-2 border-t border-gray-100 text-right font-medium">{total}</td>
                    <td className="px-3 py-2 border-t border-gray-100 text-right">{e.visitors.toLocaleString()}</td>
                  </tr>
                );
              })
            )}
            {entries.length > 0 && (
              <tr className="bg-gray-50 font-medium">
                <td className="px-3 py-2 border-t border-gray-200">Total</td>
                <td className="px-3 py-2 border-t border-gray-200 text-right" style={{ color: TP.blue }}>{totalOnline}</td>
                <td className="px-3 py-2 border-t border-gray-200 text-right" style={{ color: '#d97706' }}>{totalHybrid}</td>
                <td className="px-3 py-2 border-t border-gray-200 text-right" style={{ color: TP.red }}>{totalPrime}</td>
                <td className="px-3 py-2 border-t border-gray-200 text-right">{totalSubmissions}</td>
                <td className="px-3 py-2 border-t border-gray-200 text-right">{totalVisitors.toLocaleString()}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
