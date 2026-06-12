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
import annotationPlugin from 'chartjs-plugin-annotation';
import { fetchSubmissions } from '@/lib/api';
import type { DailySubmission } from '@/lib/types';

const BASE = process.env.NEXT_PUBLIC_BASE_URL || '';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler, annotationPlugin);

// ---- Toothpillow palette (matches AnnualView.tsx) ----
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

// ---- Weekly GA4 Visitors (World + USA) ----
// Key = week start date (Sunday). Source: GA4, provided weekly by Sosh.
// Conversion rate = online submissions / visitors for each week.
const WEEKLY_VISITORS: Record<string, { world: number; usa: number }> = {
  // Source: GA4, provided by Sosh June 1 2026. Weeks are Sun-Sat.
  '2026-03-15': { world: 9808, usa: 8462 },
  '2026-03-22': { world: 10532, usa: 8866 },
  '2026-03-29': { world: 8241, usa: 6984 },
  '2026-04-05': { world: 8957, usa: 7535 },
  '2026-04-12': { world: 7739, usa: 6504 },
  '2026-04-19': { world: 7207, usa: 6301 },
  '2026-04-26': { world: 7778, usa: 6700 },
  '2026-05-03': { world: 7062, usa: 5974 },
  '2026-05-10': { world: 6749, usa: 5829 },
  '2026-05-17': { world: 8732, usa: 7766 },
  '2026-05-24': { world: 10343, usa: 8923 },
  '2026-05-31': { world: 9642, usa: 8321 },
  '2026-06-07': { world: 7042, usa: 6075 },  // partial week (Sat Jun 7 - Wed Jun 11, 5 days); USA estimated at 86.3% ratio
};

// ---- Types ----
interface WeekData {
  weekStart: string; // YYYY-MM-DD (Sunday)
  weekEnd: string;   // YYYY-MM-DD (Saturday)
  label: string;     // e.g. "Jan 4 - Jan 10"
  entries: DailySubmission[];
  online: number;
  hybrid: number;
  prime: number;
  total: number;
  days: number;
  dailyAvg: number;
  complete: boolean; // true if 7 days of data
  visitorsWorld: number;
  visitorsUSA: number;
  convWorld: number | null; // online / world visitors %
  convUSA: number | null;   // online / USA visitors %
}

// ---- Helpers ----
const MONTH_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DOW_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function parseDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatLabel(dateStr: string): string {
  const d = parseDate(dateStr);
  return `${MONTH_ABBR[d.getMonth()]} ${d.getDate()}`;
}

function formatRange(start: string, end: string): string {
  return `${formatLabel(start)} - ${formatLabel(end)}`;
}

function addDays(dateStr: string, n: number): string {
  const d = parseDate(dateStr);
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getSunday(dateStr: string): string {
  const d = parseDate(dateStr);
  const day = d.getDay(); // 0=Sun
  d.setDate(d.getDate() - day);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function computeWeeks(entries: DailySubmission[], visitors: Record<string, { world: number; usa: number }>): WeekData[] {
  if (entries.length === 0) return [];

  // Build a map of date -> entry
  const byDate: Record<string, DailySubmission> = {};
  for (const e of entries) {
    byDate[e.date] = e;
  }

  // Determine the range of Sundays
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const firstSunday = getSunday(sorted[0].date);
  const lastDate = sorted[sorted.length - 1].date;
  const lastSunday = getSunday(lastDate);

  const weeks: WeekData[] = [];
  let current = firstSunday;

  while (current <= lastSunday) {
    const saturday = addDays(current, 6);
    const weekEntries: DailySubmission[] = [];
    for (let i = 0; i < 7; i++) {
      const day = addDays(current, i);
      if (byDate[day]) {
        weekEntries.push(byDate[day]);
      }
    }

    const online = weekEntries.reduce((s, e) => s + e.online, 0);
    const hybrid = weekEntries.reduce((s, e) => s + e.hybrid, 0);
    const prime = weekEntries.reduce((s, e) => s + e.prime, 0);
    const total = online + hybrid + prime;
    const days = weekEntries.length;

    const vis = visitors[current];
    const vWorld = vis?.world || 0;
    const vUSA = vis?.usa || 0;

    weeks.push({
      weekStart: current,
      weekEnd: saturday,
      label: formatRange(current, saturday),
      entries: weekEntries,
      online,
      hybrid,
      prime,
      total,
      days,
      dailyAvg: days > 0 ? Math.round((total / days) * 10) / 10 : 0,
      complete: days === 7,
      visitorsWorld: vWorld,
      visitorsUSA: vUSA,
      convWorld: vWorld > 0 ? Math.round((online / vWorld) * 10000) / 100 : null,
      convUSA: vUSA > 0 ? Math.round((online / vUSA) * 10000) / 100 : null,
    });

    current = addDays(current, 7);
  }

  return weeks;
}

function computeRolling7(entries: DailySubmission[]): { date: string; total: number; roll: number | null }[] {
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  return sorted.map((e, i) => {
    const total = (e.total ?? e.online + e.hybrid + e.prime);
    if (i < 6) return { date: e.date, total, roll: null };
    let sum = 0;
    for (let j = i - 6; j <= i; j++) {
      const ej = sorted[j];
      sum += (ej.total ?? ej.online + ej.hybrid + ej.prime);
    }
    return { date: e.date, total, roll: Math.round((sum / 7) * 10) / 10 };
  });
}

function computeDowNorms(entries: DailySubmission[]): { dow: number; name: string; avg: number; total: number; count: number }[] {
  const buckets: Record<number, { total: number; count: number }> = {};
  for (let i = 0; i < 7; i++) buckets[i] = { total: 0, count: 0 };

  for (const e of entries) {
    const d = parseDate(e.date);
    const dow = d.getDay();
    const t = e.total ?? e.online + e.hybrid + e.prime;
    buckets[dow].total += t;
    buckets[dow].count += 1;
  }

  // Sunday-first ordering
  return [0, 1, 2, 3, 4, 5, 6].map(dow => ({
    dow,
    name: DOW_NAMES[dow],
    avg: buckets[dow].count > 0 ? Math.round((buckets[dow].total / buckets[dow].count) * 10) / 10 : 0,
    total: buckets[dow].total,
    count: buckets[dow].count,
  }));
}

// ---- Component ----
export default function WeeklyReport() {
  const [allEntries, setAllEntries] = useState<DailySubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [weeklyVisitors, setWeeklyVisitors] = useState<Record<string, { world: number; usa: number }>>({ ...WEEKLY_VISITORS });

  // Form state for adding weekly visitors
  const [vWeekStart, setVWeekStart] = useState('');
  const [vWorld, setVWorld] = useState('');
  const [vUSA, setVUSA] = useState('');
  const [vSaving, setVSaving] = useState(false);
  const [vMsg, setVMsg] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [data, settingsRes] = await Promise.all([
          fetchSubmissions(2026),
          fetch(`${BASE}/api/settings?key=weekly_visitors`).then(r => r.json()),
        ]);
        setAllEntries(data);
        // Merge DB visitors over hardcoded
        if (settingsRes?.[0]?.value) {
          try {
            const dbVisitors = JSON.parse(settingsRes[0].value);
            setWeeklyVisitors(prev => ({ ...prev, ...dbVisitors }));
          } catch { /* ignore parse errors */ }
        }
      } catch {
        // silently handle
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleSaveVisitors() {
    if (!vWeekStart) return;
    setVSaving(true);
    setVMsg('');
    try {
      const updated = {
        ...weeklyVisitors,
        [vWeekStart]: { world: parseInt(vWorld) || 0, usa: parseInt(vUSA) || 0 },
      };
      await fetch(`${BASE}/api/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'weekly_visitors', value: JSON.stringify(updated) }),
      });
      setWeeklyVisitors(updated);
      setVMsg('Saved');
      setVWorld('');
      setVUSA('');
    } catch {
      setVMsg('Error saving');
    } finally {
      setVSaving(false);
    }
  }

  // All weeks (including partial)
  const allWeeks = useMemo(() => computeWeeks(allEntries, weeklyVisitors), [allEntries, weeklyVisitors]);
  // Only complete weeks for trend chart
  const completeWeeks = useMemo(() => allWeeks.filter(w => w.complete), [allWeeks]);

  // KPI: Total submissions YTD
  const ytdTotal = useMemo(() => allEntries.reduce((s, e) => s + (e.total ?? e.online + e.hybrid + e.prime), 0), [allEntries]);

  // KPI: Current week (most recent week with any data)
  const currentWeek = allWeeks.length > 0 ? allWeeks[allWeeks.length - 1] : null;

  // KPI: Best week (among complete weeks)
  const bestWeek = useMemo(() => {
    if (completeWeeks.length === 0) return null;
    return completeWeeks.reduce((best, w) => w.total > best.total ? w : best);
  }, [completeWeeks]);

  // KPI: Last 4 vs first 4 complete weeks trend
  // Recent momentum: last 4 complete weeks vs the 4 before them
  const trendPct = useMemo(() => {
    if (completeWeeks.length < 8) return null;
    const recent4 = completeWeeks.slice(-4);
    const prior4 = completeWeeks.slice(-8, -4);
    const recentAvg = recent4.reduce((s, w) => s + w.dailyAvg, 0) / 4;
    const priorAvg = prior4.reduce((s, w) => s + w.dailyAvg, 0) / 4;
    if (priorAvg === 0) return null;
    return Math.round(((recentAvg - priorAvg) / priorAvg) * 100);
  }, [completeWeeks]);

  // Rolling 7-day data
  const rollingData = useMemo(() => computeRolling7(allEntries), [allEntries]);

  // Day-of-week norms
  const dowNorms = useMemo(() => computeDowNorms(allEntries), [allEntries]);

  // Recent 12 weeks for WoW table (newest first)
  const recent12 = useMemo(() => {
    const all = [...allWeeks].reverse();
    return all.slice(0, 12);
  }, [allWeeks]);

  // ---- Chart weeks: complete + current partial projected ----
  const chartWeeks = useMemo(() => {
    const weeks = [...completeWeeks];
    if (currentWeek && !currentWeek.complete && currentWeek.days > 0) {
      weeks.push(currentWeek);
    }
    return weeks;
  }, [completeWeeks, currentWeek]);

  // ---- Event annotations for charts ----
  // Find week index for a given date
  const weekIndexForDate = (dateStr: string) => {
    const d = parseDate(dateStr);
    return chartWeeks.findIndex(w => {
      const ws = parseDate(w.weekStart);
      const we = new Date(ws); we.setDate(we.getDate() + 6);
      return d >= ws && d <= we;
    });
  };
  // Find day index in rolling data
  const dayIndexForDate = (dateStr: string) => rollingData.findIndex(d => d.date === dateStr);

  const EVENTS = [
    { date: '2026-02-16', label: 'Influencer Incentive Start', color: '#4fd18b' },
    { date: '2026-03-16', label: 'Influencer Incentive End', color: '#4fd18b' },
    { date: '2026-05-22', label: 'Photo Upload Fix', color: '#5b9dff' },
    { date: '2026-05-28', label: 'Alex Clark Episode', color: '#ffb454' },
  ];

  // Build weekly chart annotations (vertical lines + shaded region for incentive)
  const weeklyAnnotations = useMemo(() => {
    const annotations: Record<string, object> = {};
    const incStartIdx = weekIndexForDate('2026-02-16');
    const incEndIdx = weekIndexForDate('2026-03-16');
    if (incStartIdx >= 0 && incEndIdx >= 0) {
      annotations.incentiveBox = {
        type: 'box', xMin: incStartIdx - 0.5, xMax: incEndIdx + 0.5,
        backgroundColor: 'rgba(79,209,139,0.08)', borderColor: 'rgba(79,209,139,0.3)', borderWidth: 1,
        label: { display: true, content: 'Influencer Incentive', position: 'start' as const,
          color: '#4fd18b', font: { size: 10, weight: 'bold' as const }, backgroundColor: 'transparent', padding: 2 },
      };
    }
    const photoIdx = weekIndexForDate('2026-05-22');
    if (photoIdx >= 0) {
      annotations.photoFix = {
        type: 'line', xMin: photoIdx, xMax: photoIdx, borderColor: '#5b9dff', borderWidth: 2, borderDash: [6, 3],
        label: { display: true, content: 'Photo Fix', position: 'start' as const,
          backgroundColor: '#5b9dff', color: '#fff', font: { size: 9, weight: 'bold' as const }, padding: { x: 5, y: 2 } },
      };
    }
    const alexIdx = weekIndexForDate('2026-05-28');
    if (alexIdx >= 0) {
      annotations.alexClark = {
        type: 'line', xMin: alexIdx, xMax: alexIdx, borderColor: '#ffb454', borderWidth: 2, borderDash: [6, 3],
        label: { display: true, content: 'Alex Clark', position: 'end' as const,
          backgroundColor: '#ffb454', color: '#fff', font: { size: 9, weight: 'bold' as const }, padding: { x: 5, y: 2 } },
      };
    }
    return annotations;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartWeeks]);

  // Build daily rolling chart annotations
  const dailyAnnotations = useMemo(() => {
    const annotations: Record<string, object> = {};
    const incStartDay = dayIndexForDate('2026-02-16');
    const incEndDay = dayIndexForDate('2026-03-16');
    if (incStartDay >= 0 && incEndDay >= 0) {
      annotations.incentiveBox = {
        type: 'box', xMin: incStartDay - 0.5, xMax: incEndDay + 0.5,
        backgroundColor: 'rgba(79,209,139,0.06)', borderColor: 'rgba(79,209,139,0.25)', borderWidth: 1,
        label: { display: true, content: 'Influencer Incentive', position: 'start' as const,
          color: '#4fd18b', font: { size: 9, weight: 'bold' as const }, backgroundColor: 'transparent', padding: 2 },
      };
    }
    const photoDay = dayIndexForDate('2026-05-22');
    if (photoDay >= 0) {
      annotations.photoFix = {
        type: 'line', xMin: photoDay, xMax: photoDay, borderColor: '#5b9dff', borderWidth: 1.5, borderDash: [5, 3],
        label: { display: true, content: 'Photo Fix', position: 'start' as const,
          backgroundColor: '#5b9dff', color: '#fff', font: { size: 8, weight: 'bold' as const }, padding: { x: 4, y: 1 } },
      };
    }
    const alexDay = dayIndexForDate('2026-05-28');
    if (alexDay >= 0) {
      annotations.alexClark = {
        type: 'line', xMin: alexDay, xMax: alexDay, borderColor: '#ffb454', borderWidth: 1.5, borderDash: [5, 3],
        label: { display: true, content: 'Alex Clark', position: 'end' as const,
          backgroundColor: '#ffb454', color: '#fff', font: { size: 8, weight: 'bold' as const }, padding: { x: 4, y: 1 } },
      };
    }
    return annotations;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rollingData]);

  // ---- Chart: Weekly Trend (complete weeks + current projected) ----
  const weeklyTrendData = useMemo(() => {
    const hasPartial = chartWeeks.length > 0 && !chartWeeks[chartWeeks.length - 1].complete;

    // For the current partial week, compute projected full-week total
    const lastIdx = chartWeeks.length - 1;

    return {
      labels: chartWeeks.map(w => formatLabel(w.weekStart)),
      datasets: [
        // Actual bars (solid blue)
        {
          type: 'bar' as const,
          label: 'Total (week)',
          data: chartWeeks.map(w => w.total),
          backgroundColor: `${TP.blue}55`,
          borderColor: `${TP.blue}BB`,
          borderWidth: 1,
          borderRadius: 4,
          yAxisID: 'y',
          order: 3,
          stack: 'main',
        },
        // Projected remaining (stacked on top of actual, yellow)
        ...(hasPartial ? [{
          type: 'bar' as const,
          label: 'Projected remaining',
          data: chartWeeks.map((w, i) => {
            if (i === lastIdx && !w.complete && w.days > 0) {
              return Math.round(w.total * (7 / w.days)) - w.total;
            }
            return 0;
          }),
          backgroundColor: `${TP.yellow}40`,
          borderColor: `${TP.yellow}90`,
          borderWidth: 2,
          borderRadius: 4,
          borderDash: [6, 3] as number[],
          yAxisID: 'y',
          order: 3,
          stack: 'main',
        }] : []),
        {
          type: 'line' as const,
          label: 'Avg / day',
          data: chartWeeks.map(w => w.dailyAvg),
          borderColor: TP.green,
          backgroundColor: TP.green,
          borderWidth: 2.5,
          pointRadius: 3,
          tension: 0.3,
          yAxisID: 'y1',
          order: 1,
        },
      ],
    };
  }, [chartWeeks]);

  // ---- Chart: Day-of-Week Norms ----
  const dowChartData = useMemo(() => ({
    labels: dowNorms.map(d => d.name),
    datasets: [
      {
        label: 'Avg submissions / day',
        data: dowNorms.map(d => d.avg),
        backgroundColor: dowNorms.map(d =>
          d.dow === 0 || d.dow === 6 ? '#94a3b870' : `${TP.blue}99`
        ),
        borderRadius: 5,
      },
    ],
  }), [dowNorms]);

  // ---- Chart: Daily with 7-day rolling avg ----
  const rollingChartData = useMemo(() => ({
    labels: rollingData.map(d => {
      const p = parseDate(d.date);
      return p.getDate() <= 7 ? MONTH_ABBR[p.getMonth()] : '';
    }),
    datasets: [
      {
        type: 'bar' as const,
        label: 'Daily submissions',
        data: rollingData.map(d => d.total),
        backgroundColor: rollingData.map(d => {
          const dow = parseDate(d.date).getDay();
          return dow === 0 || dow === 6 ? 'rgba(148,163,184,0.28)' : `${TP.blue}4D`;
        }),
        borderWidth: 0,
        barPercentage: 1,
        categoryPercentage: 0.92,
        order: 2,
      },
      {
        type: 'line' as const,
        label: '7-day rolling avg',
        data: rollingData.map(d => d.roll),
        borderColor: TP.darkPurple,
        borderWidth: 2.5,
        pointRadius: 0,
        tension: 0.35,
        order: 1,
      },
    ],
  }), [rollingData]);

  if (loading) {
    return <div className="text-gray-400 py-12 text-center">Loading weekly data...</div>;
  }

  if (allEntries.length === 0) {
    return <div className="text-gray-400 py-12 text-center">No submission data available.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-bold" style={{ color: TP.navy }}>Weekly Report</h2>
        <p className="text-sm text-gray-500 mt-1">
          {ytdTotal.toLocaleString()} submissions across {allEntries.length} days, {completeWeeks.length} complete weeks (Sun-Sat). Partial weeks excluded from charts.
        </p>
      </div>

      {/* ===== KPI CARDS ===== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total YTD */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4" style={{ borderLeft: `4px solid ${TP.navy}` }}>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total YTD</div>
          <div className="text-3xl font-bold mt-1" style={{ color: TP.navy }}>{ytdTotal.toLocaleString()}</div>
          <div className="text-sm text-gray-400 mt-1">{allEntries.length} days tracked</div>
        </div>

        {/* Current week */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4" style={{ borderLeft: `4px solid ${TP.blue}` }}>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Current Week</div>
          <div className="text-3xl font-bold mt-1" style={{ color: TP.blue }}>
            {currentWeek ? currentWeek.total.toLocaleString() : '--'}
          </div>
          <div className="text-sm text-gray-400 mt-1">
            {currentWeek ? `${currentWeek.dailyAvg}/day avg (${currentWeek.days} days)` : ''}
          </div>
        </div>

        {/* Best week */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4" style={{ borderLeft: `4px solid ${TP.green}` }}>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Best Week</div>
          <div className="text-3xl font-bold mt-1" style={{ color: '#0d9488' }}>
            {bestWeek ? bestWeek.total.toLocaleString() : '--'}
          </div>
          <div className="text-sm text-gray-400 mt-1">
            {bestWeek ? bestWeek.label : ''}
          </div>
        </div>

        {/* Recent momentum */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4" style={{ borderLeft: `4px solid ${TP.darkPurple}` }}>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">4-Week Momentum</div>
          <div className={`text-3xl font-bold mt-1 ${trendPct !== null && trendPct >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            {trendPct !== null ? `${trendPct >= 0 ? '+' : ''}${trendPct}%` : '--'}
          </div>
          <div className="text-sm text-gray-400 mt-1">Last 4 weeks vs prior 4</div>
        </div>
      </div>

      {/* ===== WEEKLY TREND CHART ===== */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
        <h3 className="text-base font-semibold mb-1" style={{ color: TP.text }}>
          Weekly Trend
        </h3>
        <p className="text-xs text-gray-500 mb-4">
          Bars show total submissions per week (Sun-Sat). Current partial week shown with projected total (faded). Line shows average per day.
        </p>
        <div style={{ height: 340 }}>
          <Bar
            data={weeklyTrendData as any}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              interaction: { mode: 'index', intersect: false },
              plugins: {
                legend: { labels: { usePointStyle: true, boxWidth: 8 } },
                tooltip: {
                  callbacks: {
                    afterTitle: (items) => {
                      const idx = items[0].dataIndex;
                      const w = chartWeeks[idx];
                      return w.label;
                    },
                  },
                },
                annotation: { annotations: weeklyAnnotations },
              },
              scales: {
                x: { stacked: true, grid: { display: false }, ticks: { maxRotation: 0, autoSkip: true, maxTicksLimit: 14 } },
                y: { position: 'left', beginAtZero: true, title: { display: true, text: 'Total / week' } },
                y1: { position: 'right', beginAtZero: true, grid: { drawOnChartArea: false }, title: { display: true, text: 'Avg / day' } },
              },
            }}
          />
        </div>
      </div>

      {/* ===== WEEK-OVER-WEEK TABLE ===== */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100">
          <h3 className="text-base font-semibold" style={{ color: TP.text }}>Week-over-Week</h3>
          <p className="text-xs text-gray-500">Most recent 12 weeks. Current/partial week highlighted.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-4 py-2 font-medium">Week</th>
                <th className="px-4 py-2 font-medium text-right">Total</th>
                <th className="px-4 py-2 font-medium text-right">Online</th>
                <th className="px-4 py-2 font-medium text-right">Hybrid</th>
                <th className="px-4 py-2 font-medium text-right">Prime</th>
                <th className="px-4 py-2 font-medium text-right">Avg/Day</th>
                <th className="px-4 py-2 font-medium text-right">Conv %</th>
                <th className="px-4 py-2 font-medium text-right">USA Conv %</th>
                <th className="px-4 py-2 font-medium text-right">WoW %</th>
              </tr>
            </thead>
            <tbody>
              {recent12.map((w, i) => {
                const isCurrent = i === 0 && !w.complete;
                // WoW change: compare against the next item (which is the prior week since reversed)
                const prevWeek = recent12[i + 1];
                const wowPct = prevWeek && prevWeek.total > 0
                  ? Math.round(((w.total - prevWeek.total) / prevWeek.total) * 100)
                  : null;

                return (
                  <tr
                    key={w.weekStart}
                    className={isCurrent ? 'bg-blue-50' : 'hover:bg-gray-50'}
                  >
                    <td className="px-4 py-2 border-t border-gray-100 whitespace-nowrap">
                      {w.label}
                      {isCurrent && (
                        <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                          current
                        </span>
                      )}
                      {!w.complete && !isCurrent && (
                        <span className="ml-2 text-xs text-gray-400">({w.days}d)</span>
                      )}
                    </td>
                    <td className="px-4 py-2 border-t border-gray-100 text-right font-semibold">{w.total.toLocaleString()}</td>
                    <td className="px-4 py-2 border-t border-gray-100 text-right text-blue-600">{w.online.toLocaleString()}</td>
                    <td className="px-4 py-2 border-t border-gray-100 text-right text-amber-600">{w.hybrid.toLocaleString()}</td>
                    <td className="px-4 py-2 border-t border-gray-100 text-right text-red-600">{w.prime.toLocaleString()}</td>
                    <td className="px-4 py-2 border-t border-gray-100 text-right">{w.dailyAvg}</td>
                    <td className="px-4 py-2 border-t border-gray-100 text-right text-purple-600">
                      {w.convWorld !== null ? `${w.convWorld}%` : <span className="text-gray-300">--</span>}
                    </td>
                    <td className="px-4 py-2 border-t border-gray-100 text-right text-purple-600">
                      {w.convUSA !== null ? `${w.convUSA}%` : <span className="text-gray-300">--</span>}
                    </td>
                    <td className={`px-4 py-2 border-t border-gray-100 text-right font-medium ${
                      wowPct === null ? 'text-gray-400' : wowPct >= 0 ? 'text-green-600' : 'text-red-500'
                    }`}>
                      {wowPct !== null ? `${wowPct >= 0 ? '+' : ''}${wowPct}%` : '--'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== ADD WEEKLY VISITORS ===== */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
        <h3 className="text-base font-semibold mb-3" style={{ color: TP.text }}>Add Weekly Visitors</h3>
        <p className="text-xs text-gray-500 mb-3">Enter GA4 weekly traffic (Sun-Sat). This feeds the Conv % columns above.</p>
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Week Start (Sun)</label>
            <select
              className="border border-gray-300 rounded px-3 py-1.5 text-sm"
              value={vWeekStart}
              onChange={e => setVWeekStart(e.target.value)}
            >
              <option value="">Select week...</option>
              {allWeeks.slice().reverse().map(w => (
                <option key={w.weekStart} value={w.weekStart}>
                  {w.label}{weeklyVisitors[w.weekStart] ? ` (${weeklyVisitors[w.weekStart].world.toLocaleString()})` : ''}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">World Visitors</label>
            <input
              type="number"
              className="border border-gray-300 rounded px-3 py-1.5 text-sm w-28"
              placeholder="e.g. 8500"
              value={vWorld}
              onChange={e => setVWorld(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">USA Visitors</label>
            <input
              type="number"
              className="border border-gray-300 rounded px-3 py-1.5 text-sm w-28"
              placeholder="e.g. 7200"
              value={vUSA}
              onChange={e => setVUSA(e.target.value)}
            />
          </div>
          <button
            className="px-4 py-1.5 rounded text-sm font-medium text-white"
            style={{ backgroundColor: TP.blue }}
            onClick={handleSaveVisitors}
            disabled={vSaving || !vWeekStart}
          >
            {vSaving ? 'Saving...' : 'Save'}
          </button>
          {vMsg && <span className="text-xs text-green-600">{vMsg}</span>}
        </div>
      </div>

      {/* ===== TWO-COLUMN: DOW Norms + Rolling Avg ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Day-of-Week Norms */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <h3 className="text-base font-semibold mb-1" style={{ color: TP.text }}>
            Day-of-Week Norms
          </h3>
          <p className="text-xs text-gray-500 mb-4">
            Average submissions per day of week across all data. Weekend dip is typical.
          </p>
          <div style={{ height: 240 }}>
            <Bar
              data={dowChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    callbacks: {
                      label: (ctx) => {
                        const d = dowNorms[ctx.dataIndex];
                        return `${d.avg} avg/day  |  ${d.total.toLocaleString()} total (${d.count} days)`;
                      },
                    },
                  },
                },
                scales: {
                  x: { grid: { display: false } },
                  y: { beginAtZero: true, title: { display: true, text: 'Avg / day' } },
                },
              }}
            />
          </div>
        </div>

        {/* Day-of-Week Detail Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <h3 className="text-base font-semibold mb-1" style={{ color: TP.text }}>
            Weekday Rhythm
          </h3>
          <p className="text-xs text-gray-500 mb-4">
            How a typical week distributes submissions.
          </p>
          <table className="w-full text-sm">
            <thead className="text-xs text-gray-500 uppercase">
              <tr>
                <th className="text-left py-1 font-medium">Day</th>
                <th className="text-right py-1 font-medium">Avg/Day</th>
                <th className="text-right py-1 font-medium">Total</th>
                <th className="text-right py-1 font-medium">Share</th>
              </tr>
            </thead>
            <tbody>
              {dowNorms.map(d => {
                const weekTotal = dowNorms.reduce((s, n) => s + n.total, 0);
                const share = weekTotal > 0 ? Math.round((d.total / weekTotal) * 100) : 0;
                const isWeekend = d.dow === 0 || d.dow === 6;
                return (
                  <tr key={d.dow} className={isWeekend ? 'text-gray-400' : ''}>
                    <td className="py-1.5 border-t border-gray-100 font-medium">{d.name}</td>
                    <td className="py-1.5 border-t border-gray-100 text-right">{d.avg}</td>
                    <td className="py-1.5 border-t border-gray-100 text-right">{d.total.toLocaleString()}</td>
                    <td className="py-1.5 border-t border-gray-100 text-right">{share}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== 7-DAY ROLLING AVERAGE ===== */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
        <h3 className="text-base font-semibold mb-1" style={{ color: TP.text }}>
          Daily Submissions with 7-Day Rolling Average
        </h3>
        <p className="text-xs text-gray-500 mb-4">
          Light bars show each day. Bold line is the 7-day rolling average, smoothing out Sunday lows and weekday highs to reveal the underlying trend.
        </p>
        <div style={{ height: 340 }}>
          <Bar
            data={rollingChartData as any}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              interaction: { mode: 'index', intersect: false },
              plugins: {
                legend: { labels: { usePointStyle: true, boxWidth: 8 } },
                tooltip: {
                  callbacks: {
                    title: (items) => {
                      const idx = items[0].dataIndex;
                      const d = rollingData[idx];
                      const parsed = parseDate(d.date);
                      return `${DOW_NAMES[parsed.getDay()]} ${formatLabel(d.date)}`;
                    },
                  },
                },
                annotation: { annotations: dailyAnnotations },
              },
              scales: {
                x: {
                  grid: { display: false },
                  ticks: {
                    maxRotation: 0,
                    autoSkip: true,
                    maxTicksLimit: 12,
                  },
                },
                y: { beginAtZero: true },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
