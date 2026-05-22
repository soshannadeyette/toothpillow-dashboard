'use client';

import { useState, useEffect, useMemo } from 'react';
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
import { fetchSubmissions, currentMonth as getCentralMonth } from '@/lib/api';
import type { DailySubmission } from '@/lib/types';
import { MONTHLY_GOALS_2026, MONTH_NAMES } from '@/lib/types';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler);

// ---- 2025 historical data ----
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

const DAILY_2025: number[][] = [
  [49,64,68,27,39,58,42,50,39,38,27,41,46,41,62,49,51,37,24,64,41,58,56,34,26,25,52,60,65,51,50],
  [36,32,71,69,55,77,49,33,49,51,52,66,33,40,54,63,108,64,57,60,49,40,57,81,59,67,49,39],
  [43,45,48,81,62,47,51,42,35,60,46,52,79,57,50,38,82,44,62,34,54,42,35,52,54,51,46,35,19,19,48],
  [49,54,94,81,40,47,69,70,74,56,51,24,27,69,66,70,52,51,16,17,56,62,100,77,41,25,29,48,54,96],
  [64,43,21,30,63,44,64,47,36,26,23,78,47,59,44,38,31,40,53,62,39,52,26,27,27,44,66,45,47,46,28],
  [30,45,49,54,52,26,10,40,48,30,49,50,34,17,15,46,49,65,55,21,21,24,52,30,41,32,26,21,22,44],
  [162,218,72,31,36,34,73,66,47,55,39,20,25,46,51,63,80,40,26,30,63,69,70,49,242,126,103,247,182,178,147],
  [105,77,64,141,113,119,112,84,59,68,112,93,107,93,61,62,67,77,117,96,89,71,28,41,65,91,77,114,70,37,32],
  [36,58,69,107,57,29,44,69,92,56,56,41,19,28,77,57,53,63,44,24,16,55,61,66,63,67,23,37,57,77],
  [65,65,61,13,26,62,59,47,56,31,17,25,56,56,57,62,34,17,41,62,72,84,59,49,27,30,64,68,53,58,32],
  [22,35,57,58,75,70,65,82,55,92,91,96,74,50,24,31,68,63,67,53,42,27,28,59,53,59,17,33,18,45],
  [52,65,61,40,39,22,27,54,56,62,73,35,21,22,32,43,67,58,35,15,11,45,48,14,9,20,14,24,49,93,47],
];

// ---- OKR data ----
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

// ---- Helper functions ----
interface WeekBucket {
  label: string;
  startDate: string;
  endDate: string;
  entries: DailySubmission[];
  online: number;
  hybrid: number;
  prime: number;
  total: number;
  visitors: number;
}

function getMonday(d: Date): Date {
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.getFullYear(), d.getMonth(), diff);
}

function formatShort(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function rollingAvg(data: number[], window: number): (number | null)[] {
  return data.map((_, i) => {
    if (i < window - 1) return null;
    let sum = 0;
    for (let j = i - window + 1; j <= i; j++) sum += data[j];
    return Math.round((sum / window) * 10) / 10;
  });
}

export default function WeeklyReport() {
  const [allEntries, setAllEntries] = useState<DailySubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWeekIdx, setSelectedWeekIdx] = useState(0);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await fetchSubmissions(2026);
        setAllEntries(data);
      } catch {
        // silently handle
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Bucket entries into Mon-Sun weeks
  const weeks: WeekBucket[] = useMemo(() => {
    if (allEntries.length === 0) return [];
    const buckets: Record<string, DailySubmission[]> = {};
    for (const e of allEntries) {
      const d = new Date(e.date + 'T12:00:00');
      const mon = getMonday(d);
      const key = mon.toISOString().slice(0, 10);
      if (!buckets[key]) buckets[key] = [];
      buckets[key].push(e);
    }
    const sorted = Object.keys(buckets).sort().reverse();
    return sorted.map((monday) => {
      const entries = buckets[monday].sort((a, b) => a.date.localeCompare(b.date));
      const sun = new Date(monday + 'T12:00:00');
      sun.setDate(sun.getDate() + 6);
      const online = entries.reduce((s, e) => s + e.online, 0);
      const hybrid = entries.reduce((s, e) => s + e.hybrid, 0);
      const prime = entries.reduce((s, e) => s + e.prime, 0);
      return {
        label: `${formatShort(monday)} - ${formatShort(sun.toISOString().slice(0, 10))}`,
        startDate: monday,
        endDate: sun.toISOString().slice(0, 10),
        entries,
        online,
        hybrid,
        prime,
        total: online + hybrid + prime,
        visitors: entries.reduce((s, e) => s + e.visitors, 0),
      };
    });
  }, [allEntries]);

  useEffect(() => {
    if (weeks.length > 0) setSelectedWeekIdx(0);
  }, [weeks.length]);

  const week = weeks[selectedWeekIdx] || null;

  // Determine report month from selected week's end date
  const reportMonth = week ? new Date(week.endDate + 'T12:00:00').getMonth() + 1 : getCentralMonth();
  const reportYear = 2026;

  // Month-to-date: all entries up through the selected week's end date
  const mtdEntries = useMemo(() => {
    if (!week) return [];
    const monthStart = `${reportYear}-${String(reportMonth).padStart(2, '0')}-01`;
    const weekEnd = week.endDate;
    return allEntries.filter((e) => {
      const m = new Date(e.date + 'T12:00:00').getMonth() + 1;
      return m === reportMonth && e.date >= monthStart && e.date <= weekEnd;
    });
  }, [allEntries, week, reportMonth, reportYear]);

  const monthGoal = MONTHLY_GOALS_2026.find((g) => g.month === reportMonth && g.year === reportYear);
  const goal = monthGoal?.total ?? 0;
  const daysInMonth = new Date(reportYear, reportMonth, 0).getDate();

  // MTD calculations
  const mtdTotal = mtdEntries.reduce((s, e) => s + (e.total ?? e.online + e.hybrid + e.prime), 0);
  const mtdOnline = mtdEntries.reduce((s, e) => s + e.online, 0);
  const mtdHybrid = mtdEntries.reduce((s, e) => s + e.hybrid, 0);
  const mtdPrime = mtdEntries.reduce((s, e) => s + e.prime, 0);
  const mtdVisitors = mtdEntries.reduce((s, e) => s + e.visitors, 0);
  const mtdDays = mtdEntries.length;
  const shouldBeAt = Math.round((goal / daysInMonth) * mtdDays);
  const aheadBehind = mtdTotal - shouldBeAt;
  const daysRemaining = daysInMonth - mtdDays;
  const gap = goal - mtdTotal;
  const neededPerDay = daysRemaining > 0 ? Math.ceil(gap / daysRemaining) : 0;
  const mtdProjected = mtdDays > 0 ? Math.round((mtdTotal / mtdDays) * daysInMonth) : 0;
  const projectedPct = goal > 0 ? ((mtdProjected / goal) * 100).toFixed(1) : '0';
  const progressPct = goal > 0 ? Math.min((mtdTotal / goal) * 100, 100) : 0;
  const pacePct = goal > 0 ? Math.min((shouldBeAt / goal) * 100, 100) : 0;
  const mtdConvRate = mtdVisitors > 0 ? ((mtdTotal / mtdVisitors) * 100).toFixed(1) : '0';

  // Week conversion rate
  const weekConvRate = week && week.visitors > 0 ? ((week.total / week.visitors) * 100).toFixed(1) : '0';

  // ---- Submission Trend (all entries for the month, daily totals + 7-day rolling avg) ----
  const monthEntries = useMemo(() => {
    return allEntries
      .filter((e) => new Date(e.date + 'T12:00:00').getMonth() + 1 === reportMonth)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [allEntries, reportMonth]);

  const dailyTotals = monthEntries.map((e) => e.total ?? e.online + e.hybrid + e.prime);
  const dailyTarget = goal > 0 ? Math.round(goal / daysInMonth) : 0;
  const rolling7 = rollingAvg(dailyTotals, 7);

  const trendLabels = monthEntries.map((e) => {
    const d = new Date(e.date + 'T12:00:00');
    return `${d.getMonth() + 1}/${d.getDate()}`;
  });

  // Find week highlight indices in month entries
  const weekStartIdx = week ? monthEntries.findIndex((e) => e.date >= week.startDate) : -1;
  const weekEndIdx = week ? monthEntries.findIndex((e) => e.date > week.endDate) : -1;
  const weekEndActual = weekEndIdx === -1 ? monthEntries.length - 1 : weekEndIdx - 1;

  // ---- YOY calculations ----
  const prevYear = HIST_2025[reportMonth];
  const yoyChangePace = prevYear && prevYear.total > 0 ? Math.round(((mtdProjected - prevYear.total) / prevYear.total) * 100) : 0;
  const prevDailyArr = DAILY_2025[reportMonth - 1] || [];
  let prev2025SameDay = 0;
  for (let d = 0; d < mtdDays && d < prevDailyArr.length; d++) {
    prev2025SameDay += prevDailyArr[d];
  }
  const sameDayDiff = mtdTotal - prev2025SameDay;

  // Weekly stacked bar chart
  const weekChartData = week
    ? {
        labels: week.entries.map((e) => {
          const d = new Date(e.date + 'T12:00:00');
          return d.toLocaleDateString('en-US', { weekday: 'short' });
        }),
        datasets: [
          { label: 'Online', data: week.entries.map((e) => e.online), backgroundColor: '#2563eb', stack: 'stack' },
          { label: 'Hybrid', data: week.entries.map((e) => e.hybrid), backgroundColor: '#d97706', stack: 'stack' },
          { label: 'Prime', data: week.entries.map((e) => e.prime), backgroundColor: '#dc2626', stack: 'stack' },
        ],
      }
    : null;

  // Trend line chart
  const trendChartData = {
    labels: trendLabels,
    datasets: [
      {
        label: 'Daily Total',
        data: dailyTotals,
        borderColor: '#93c5fd',
        backgroundColor: 'rgba(147, 197, 253, 0.15)',
        fill: true,
        tension: 0.3,
        pointRadius: 2,
        borderWidth: 1.5,
        order: 2,
      },
      {
        label: '7-Day Rolling Avg',
        data: rolling7,
        borderColor: '#2563eb',
        borderWidth: 2.5,
        pointRadius: 0,
        tension: 0.4,
        order: 1,
      },
      {
        label: `Daily Target (${dailyTarget})`,
        data: Array(trendLabels.length).fill(dailyTarget),
        borderColor: '#f59e0b',
        borderWidth: 1.5,
        borderDash: [6, 3],
        pointRadius: 0,
        order: 3,
      },
    ],
  };

  // YOY bar chart data
  const yoyChartData = prevYear
    ? {
        labels: ['2025 Actual', '2026 Actual', '2026 Projected'],
        datasets: [
          {
            label: 'Submissions',
            data: [prevYear.total, mtdTotal, mtdProjected],
            backgroundColor: ['#94a3b8', '#2563eb', '#93c5fd'],
            borderRadius: 4,
          },
          {
            label: 'Goal',
            data: [null, null, goal],
            backgroundColor: ['transparent', 'transparent', 'rgba(245, 158, 11, 0.2)'],
            borderColor: ['transparent', 'transparent', '#f59e0b'],
            borderWidth: 2,
            borderDash: [4, 4],
            borderRadius: 4,
          },
        ],
      }
    : null;

  // Conversion chart data (daily for selected week)
  const convChartData = week
    ? {
        labels: week.entries.map((e) => {
          const d = new Date(e.date + 'T12:00:00');
          return d.toLocaleDateString('en-US', { weekday: 'short' });
        }),
        datasets: [
          {
            label: 'Conversion %',
            data: week.entries.map((e) => {
              const total = e.total ?? e.online + e.hybrid + e.prime;
              return e.visitors > 0 ? Math.round((total / e.visitors) * 1000) / 10 : 0;
            }),
            borderColor: '#8b5cf6',
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            fill: true,
            tension: 0.3,
            pointRadius: 4,
            borderWidth: 2,
            yAxisID: 'y',
          },
          {
            label: 'Visitors',
            data: week.entries.map((e) => e.visitors),
            borderColor: '#d1d5db',
            backgroundColor: 'rgba(209, 213, 219, 0.3)',
            fill: true,
            tension: 0.3,
            pointRadius: 3,
            borderWidth: 1.5,
            yAxisID: 'y1',
          },
        ],
      }
    : null;

  if (loading) {
    return <div className="text-gray-400 py-12 text-center">Loading weekly data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Week selector */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSelectedWeekIdx(Math.min(selectedWeekIdx + 1, weeks.length - 1))}
          disabled={selectedWeekIdx >= weeks.length - 1}
          className="px-3 py-2 text-sm border rounded-md hover:bg-gray-50 disabled:opacity-30"
        >
          &larr; Older
        </button>
        <select
          value={selectedWeekIdx}
          onChange={(e) => setSelectedWeekIdx(parseInt(e.target.value))}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm"
        >
          {weeks.map((w, i) => (
            <option key={i} value={i}>
              Week of {w.label}
            </option>
          ))}
        </select>
        <button
          onClick={() => setSelectedWeekIdx(Math.max(selectedWeekIdx - 1, 0))}
          disabled={selectedWeekIdx <= 0}
          className="px-3 py-2 text-sm border rounded-md hover:bg-gray-50 disabled:opacity-30"
        >
          Newer &rarr;
        </button>
      </div>

      {week && (
        <>
          {/* ===== WEEK HEADER ===== */}
          <div className="mb-2">
            <h2 className="text-2xl font-bold text-[#3A6EA4] flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#3A6EA4] inline-block"></span>
              {(() => {
                const parts = week.label.split(' - ');
                const s = new Date(parts[0] + '/2026');
                const e = new Date(parts[1] + '/2026');
                return `${MONTH_NAMES[s.getMonth()]} ${s.getDate()} â ${MONTH_NAMES[e.getMonth()]} ${e.getDate()}`;
              })()}
            </h2>
            <div className="h-1 bg-[#3A6EA4] rounded-full mt-2"></div>
          </div>

          {/* ===== WEEK STATS ===== */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 border-l-4 border-l-gray-400 p-4">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Week Total</div>
              <div className="text-3xl font-bold text-gray-900 mt-1">{week.total}</div>
              <div className="text-sm text-gray-400 mt-1">{week.entries.length} {week.entries.length === 1 ? 'day' : 'days'} tracked</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 border-l-4 border-l-amber-500 p-4">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Daily Average</div>
              <div className="text-3xl font-bold text-amber-500 mt-1">
                {Math.round(week.total / (week.entries.length || 1))}
              </div>
              <div className="text-sm text-gray-400 mt-1">Per day</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 border-l-4 border-l-teal-500 p-4">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Online</div>
              <div className="text-3xl font-bold text-teal-600 mt-1">{week.online}</div>
              <div className="text-sm text-gray-400 mt-1">{week.total > 0 ? Math.round((week.online / week.total) * 100) : 0}% of total</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 border-l-4 border-l-amber-400 p-4">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Hybrid</div>
              <div className="text-3xl font-bold text-amber-500 mt-1">{week.hybrid}</div>
              <div className="text-sm text-gray-400 mt-1">{week.total > 0 ? Math.round((week.hybrid / week.total) * 100) : 0}% of total</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 border-l-4 border-l-red-400 p-4">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Prime</div>
              <div className="text-3xl font-bold text-red-500 mt-1">{week.prime}</div>
              <div className="text-sm text-gray-400 mt-1">{week.total > 0 ? Math.round((week.prime / week.total) * 100) : 0}% of total</div>
            </div>
          </div>

          {/* ===== WEEKLY CHART ===== */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Week of {week.label}</h3>
            <div style={{ height: 280 }}>
              {weekChartData && (
                <Bar
                  data={weekChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'top' } },
                    scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true } },
                  }}
                />
              )}
            </div>
          </div>

          {/* ===== WEEK TABLE ===== */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-3 py-2 font-medium">Day</th>
                  <th className="px-3 py-2 font-medium text-right">Online</th>
                  <th className="px-3 py-2 font-medium text-right">Hybrid</th>
                  <th className="px-3 py-2 font-medium text-right">Prime</th>
                  <th className="px-3 py-2 font-medium text-right">Total</th>
                  <th className="px-3 py-2 font-medium text-right">Visitors</th>
                </tr>
              </thead>
              <tbody>
                {week.entries.map((e) => {
                  const d = new Date(e.date + 'T12:00:00');
                  const total = e.total ?? e.online + e.hybrid + e.prime;
                  return (
                    <tr key={e.date} className="hover:bg-gray-50">
                      <td className="px-3 py-2 border-t border-gray-100">
                        {d.toLocaleDateString('en-US', { weekday: 'short' })} {d.getMonth() + 1}/{d.getDate()}
                      </td>
                      <td className="px-3 py-2 border-t border-gray-100 text-right text-blue-600">{e.online}</td>
                      <td className="px-3 py-2 border-t border-gray-100 text-right text-amber-600">{e.hybrid}</td>
                      <td className="px-3 py-2 border-t border-gray-100 text-right text-red-600">{e.prime}</td>
                      <td className="px-3 py-2 border-t border-gray-100 text-right font-medium">{total}</td>
                      <td className="px-3 py-2 border-t border-gray-100 text-right">{e.visitors.toLocaleString()}</td>
                    </tr>
                  );
                })}
                <tr className="bg-gray-50 font-medium">
                  <td className="px-3 py-2 border-t border-gray-200">Total</td>
                  <td className="px-3 py-2 border-t border-gray-200 text-right text-blue-600">{week.online}</td>
                  <td className="px-3 py-2 border-t border-gray-200 text-right text-amber-600">{week.hybrid}</td>
                  <td className="px-3 py-2 border-t border-gray-200 text-right text-red-600">{week.prime}</td>
                  <td className="px-3 py-2 border-t border-gray-200 text-right">{week.total}</td>
                  <td className="px-3 py-2 border-t border-gray-200 text-right">{week.visitors.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ===== MONTH PROGRESS ===== */}
          <div className="mt-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {MONTH_NAMES[reportMonth]} Progress (through {week.label.split(' - ')[1]})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 border-l-4 border-l-gray-700 p-5">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Month-to-Date</div>
                <div className="text-4xl font-bold text-gray-900">{mtdTotal.toLocaleString()}</div>
                <div className="text-sm text-gray-500 mt-1">{mtdOnline} online, {mtdHybrid} hybrid, {mtdPrime} prime</div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 border-l-4 border-l-amber-500 p-5">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Should Be At (Day {mtdDays})</div>
                <div className="text-4xl font-bold text-amber-500">{shouldBeAt.toLocaleString()}</div>
                <div className="text-sm text-gray-500 mt-1">Target for End of Today</div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 border-l-4 border-l-blue-600 p-5">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Ahead / Behind</div>
                <div className={`text-4xl font-bold ${aheadBehind >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {aheadBehind >= 0 ? '+' : ''}{aheadBehind.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500 mt-1">{aheadBehind >= 0 ? 'Ahead of Target' : 'Behind Target'}</div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 border-l-4 border-l-purple-500 p-5">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Daily Target Needed</div>
                <div className="text-4xl font-bold text-amber-500">{daysRemaining > 0 ? neededPerDay : '--'}</div>
                <div className="text-sm text-gray-500 mt-1">Per Day to Hit Goal</div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 border-l-4 border-l-red-500 p-5">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Projected End-of-Month</div>
                <div className={`text-4xl font-bold ${mtdProjected >= goal ? 'text-green-600' : 'text-red-500'}`}>
                  {mtdDays > 0 ? mtdProjected.toLocaleString() : '--'}
                </div>
                <div className="text-sm text-gray-500 mt-1">At Current Pace</div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 border-l-4 border-l-green-500 p-5">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Will Hit</div>
                <div className={`text-4xl font-bold ${Number(projectedPct) >= 100 ? 'text-green-600' : 'text-amber-500'}`}>
                  {mtdDays > 0 ? `${projectedPct}%` : '--'}
                </div>
                <div className="text-sm text-gray-500 mt-1">Of {goal.toLocaleString()} Goal</div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Progress to Goal</span>
                <span className="text-sm text-gray-500">{mtdTotal.toLocaleString()} / {goal.toLocaleString()}</span>
              </div>
              <div className="relative h-6 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-blue-500 rounded-full transition-all"
                  style={{ width: `${progressPct}%` }}
                >
                  {progressPct > 15 && (
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                      {progressPct.toFixed(1)}%
                    </span>
                  )}
                </div>
                {/* Pace marker */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-amber-500"
                  style={{ left: `${pacePct}%` }}
                >
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs text-amber-600 font-medium whitespace-nowrap">
                    Pace
                  </div>
                  <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs text-amber-600">
                    {shouldBeAt.toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-6 text-xs text-gray-500">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block"></span> Current Progress</span>
                <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-amber-500 inline-block"></span> Expected Pace (Day {mtdDays}/{daysInMonth})</span>
              </div>
            </div>
          </div>

          {/* ===== SUBMISSION TREND CHART ===== */}
          {monthEntries.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                {MONTH_NAMES[reportMonth]} Submission Trend
              </h3>
              <div style={{ height: 300 }}>
                <Line
                  data={trendChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: { mode: 'index', intersect: false },
                    plugins: {
                      legend: { position: 'top' },
                      tooltip: {
                        callbacks: {
                          afterBody: (ctx) => {
                            const idx = ctx[0].dataIndex;
                            const e = monthEntries[idx];
                            return `Online: ${e.online}  Hybrid: ${e.hybrid}  Prime: ${e.prime}`;
                          },
                        },
                      },
                    },
                    scales: {
                      y: { beginAtZero: true },
                    },
                  }}
                />
              </div>
            </div>
          )}

          {/* ===== WEBSITE CONVERSION ===== */}
          <div className="mt-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Website Conversion</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">MTD Conversion</div>
                <div className="text-3xl font-bold text-purple-600">{mtdConvRate}%</div>
                <div className="text-sm text-gray-500 mt-1">{mtdTotal.toLocaleString()} of {mtdVisitors.toLocaleString()} visitors</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Unique Visitors (MTD)</div>
                <div className="text-3xl font-bold text-gray-900">{mtdVisitors.toLocaleString()}</div>
                <div className="text-sm text-gray-500 mt-1">Through Day {mtdDays}</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">This Week{"'"}s Conversion</div>
                <div className="text-3xl font-bold text-purple-600">{weekConvRate}%</div>
                <div className="text-sm text-gray-500 mt-1">{week.total} of {week.visitors.toLocaleString()} visitors</div>
              </div>
            </div>

            {/* Conversion chart */}
            {convChartData && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Daily Conversion Rate (Week of {week.label})</h3>
                <div style={{ height: 250 }}>
                  <Line
                    data={convChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      interaction: { mode: 'index', intersect: false },
                      plugins: { legend: { position: 'top' } },
                      scales: {
                        y: {
                          type: 'linear',
                          position: 'left',
                          beginAtZero: true,
                          title: { display: true, text: 'Conversion %' },
                        },
                        y1: {
                          type: 'linear',
                          position: 'right',
                          beginAtZero: true,
                          grid: { drawOnChartArea: false },
                          title: { display: true, text: 'Visitors' },
                        },
                      },
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* ===== YEAR-OVER-YEAR ===== */}
          {prevYear && (
            <div className="mt-8">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Year-over-Year Comparison</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">2025 {MONTH_NAMES[reportMonth]}</div>
                  <div className="text-2xl font-bold text-gray-600">{prevYear.total.toLocaleString()}</div>
                  <div className="text-sm text-gray-500 mt-1">Total last year</div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">2026 Goal</div>
                  <div className="text-2xl font-bold text-amber-600">{goal.toLocaleString()}</div>
                  <div className="text-sm text-gray-500 mt-1">Monthly target</div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Projected vs 2025</div>
                  <div className={`text-2xl font-bold ${yoyChangePace >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {yoyChangePace >= 0 ? '+' : ''}{yoyChangePace}%
                  </div>
                  <div className="text-sm text-gray-500 mt-1">At current pace</div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Same-Day vs 2025</div>
                  <div className={`text-2xl font-bold ${sameDayDiff >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {sameDayDiff >= 0 ? '+' : ''}{sameDayDiff.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">Day {mtdDays}: {mtdTotal.toLocaleString()} vs {prev2025SameDay.toLocaleString()}</div>
                </div>
              </div>

              {/* YOY chart */}
              {yoyChartData && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">{MONTH_NAMES[reportMonth]}: 2025 vs 2026</h3>
                  <div style={{ height: 280 }}>
                    <Bar
                      data={yoyChartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { display: false },
                          tooltip: {
                            callbacks: {
                              label: (ctx) => {
                                if (ctx.raw === null) return '';
                                return `${ctx.dataset.label}: ${(ctx.raw as number).toLocaleString()}`;
                              },
                            },
                          },
                        },
                        scales: { y: { beginAtZero: true } },
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ===== OKR SECTION ===== */}
          <div className="mt-8">
            <div className="bg-[#1B2A4A] text-white px-5 py-3 rounded-t-xl text-sm font-semibold">
              Umbrella Goal: <span className="font-normal">Grow online assessment submissions 10% month-over-month through Q2 2026 (March baseline: 1,291 &rarr; June target: 1,718)</span>
            </div>
            <div className="space-y-4 mt-0">
              {OKR_OBJECTIVES.map((obj, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-b-lg overflow-hidden shadow-sm">
                  <div className="px-4 py-3 text-white font-semibold text-sm" style={{ backgroundColor: obj.color }}>
                    {obj.title}
                  </div>
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
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
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
