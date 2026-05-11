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
import { Line, Bar } from 'react-chartjs-2';
import { fetchAnnualSummaries, fetchSubmissions } from '@/lib/api';
import type { MonthlySummary, DailySubmission } from '@/lib/types';
import { MONTH_NAMES } from '@/lib/types';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler);

// ---- Hardcoded historical data ----

const online2024: Record<number, number> = {1:429, 2:343, 3:1371, 4:618, 5:746, 6:1322, 7:629, 8:931, 9:1373, 10:673, 11:658, 12:878};
const online2025: Record<number, number> = {1:1098, 2:1205, 3:1114, 4:1124, 5:898, 6:652, 7:2057, 8:1954, 9:1147, 10:1078, 11:1240, 12:889};
const hybrid2024: Record<number, number> = {1:179, 2:121, 3:467, 4:240, 5:237, 6:305, 7:258, 8:285, 9:414, 10:268, 11:270, 12:265};
const hybrid2025: Record<number, number> = {1:328, 2:343, 3:381, 4:525, 5:416, 6:378, 7:505, 8:512, 9:389, 10:385, 11:336, 12:325};
const prime2024: Record<number, number> = {1:12, 2:8, 3:21, 4:11, 5:14, 6:13, 7:14, 8:12, 9:11, 10:10, 11:9, 12:11};
const prime2025: Record<number, number> = {1:4, 2:9, 3:15, 4:14, 5:14, 6:9, 7:26, 8:12, 9:14, 10:12, 11:15, 12:12};

const MONTH_ABBR = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function daysInMonth(month: number, year: number): number {
  return new Date(year, month, 0).getDate();
}

function pctChange(current: number, previous: number): { diff: number; pct: number } {
  const diff = current - previous;
  const pct = previous === 0 ? (current > 0 ? 100 : 0) : (diff / previous) * 100;
  return { diff, pct };
}

function formatPct(n: number): string {
  const sign = n >= 0 ? '+' : '';
  return `${sign}${n.toFixed(1)}%`;
}

function formatDiff(n: number): string {
  const sign = n >= 0 ? '+' : '';
  return `${sign}${n.toLocaleString()}`;
}

// ---- Component ----

export default function OnlineTrends() {
  const [summaries2026, setSummaries2026] = useState<MonthlySummary[]>([]);
  const [dailySubs, setDailySubs] = useState<DailySubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const now = new Date();
        const year = now.getFullYear();
        const [annualData, dailyData] = await Promise.all([
          fetchAnnualSummaries(2026),
          fetchSubmissions(year),
        ]);
        setSummaries2026(annualData);
        setDailySubs(dailyData);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // ---- Derive 2026 monthly data ----

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const today = now.getDate();

  const { online2026, hybrid2026, prime2026, currentMonthProjection, lastCompletedMonth } = useMemo(() => {
    const online: Record<number, number> = {};
    const hybrid: Record<number, number> = {};
    const prime: Record<number, number> = {};

    // Completed months from annual summaries
    for (const s of summaries2026) {
      online[s.month] = s.online_submissions;
      hybrid[s.month] = s.hybrid_submissions;
      prime[s.month] = s.prime_submissions;
    }

    // Current month from daily submissions
    const currentMonthSubs = dailySubs.filter((d) => {
      const dt = new Date(d.date);
      return dt.getMonth() + 1 === currentMonth && dt.getFullYear() === currentYear;
    });

    let projOnline = 0;
    let projHybrid = 0;
    let projPrime = 0;
    let actualOnline = 0;
    let actualHybrid = 0;
    let actualPrime = 0;
    let daysTracked = currentMonthSubs.length;
    const totalDays = daysInMonth(currentMonth, currentYear);

    if (daysTracked > 0) {
      actualOnline = currentMonthSubs.reduce((s, d) => s + d.online, 0);
      actualHybrid = currentMonthSubs.reduce((s, d) => s + d.hybrid, 0);
      actualPrime = currentMonthSubs.reduce((s, d) => s + d.prime, 0);
      projOnline = Math.round((actualOnline / daysTracked) * totalDays);
      projHybrid = Math.round((actualHybrid / daysTracked) * totalDays);
      projPrime = Math.round((actualPrime / daysTracked) * totalDays);
      online[currentMonth] = projOnline;
      hybrid[currentMonth] = projHybrid;
      prime[currentMonth] = projPrime;
    }

    // Determine last completed month (months in summaries that are not the current month)
    const completedMonths = summaries2026
      .filter((s) => s.month !== currentMonth || currentYear !== 2026)
      .map((s) => s.month);
    const lastCompleted = completedMonths.length > 0 ? Math.max(...completedMonths) : 0;

    return {
      online2026: online,
      hybrid2026: hybrid,
      prime2026: prime,
      currentMonthProjection: {
        actualOnline,
        actualHybrid,
        actualPrime,
        projOnline,
        projHybrid,
        projPrime,
        daysTracked,
        totalDays,
      },
      lastCompletedMonth: lastCompleted,
    };
  }, [summaries2026, dailySubs, currentMonth, currentYear]);

  // Determine the highest month we have 2026 data for (completed + current if data exists)
  const maxMonth2026 = Math.max(lastCompletedMonth, currentMonthProjection.daysTracked > 0 ? currentMonth : 0);

  // ---- Section 1: YOY Summary Cards ----

  const ytdOnline2026 = Array.from({ length: lastCompletedMonth }, (_, i) => online2026[i + 1] || 0).reduce((a, b) => a + b, 0);
  const ytdOnline2025 = Array.from({ length: lastCompletedMonth }, (_, i) => online2025[i + 1] || 0).reduce((a, b) => a + b, 0);
  const ytdChange = pctChange(ytdOnline2026, ytdOnline2025);

  // Feb+ lift (exclude Jan)
  const febPlusOnline2026 = Array.from({ length: Math.max(0, lastCompletedMonth - 1) }, (_, i) => online2026[i + 2] || 0).reduce((a, b) => a + b, 0);
  const febPlusOnline2025 = Array.from({ length: Math.max(0, lastCompletedMonth - 1) }, (_, i) => online2025[i + 2] || 0).reduce((a, b) => a + b, 0);
  const febPlusChange = pctChange(febPlusOnline2026, febPlusOnline2025);

  // Current month vs same month 2025
  const curMonthActual = currentMonthProjection.actualOnline;
  const curMonthProj = currentMonthProjection.projOnline;
  const sameMonth2025 = online2025[currentMonth] || 0;
  const curMonthChange = pctChange(curMonthProj, sameMonth2025);

  // Full year 2025 vs 2024
  const total2025 = Object.values(online2025).reduce((a, b) => a + b, 0);
  const total2024 = Object.values(online2024).reduce((a, b) => a + b, 0);
  const fullYearChange = pctChange(total2025, total2024);

  // ---- Section 2: Cumulative trajectory ----

  const cumulativeData = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    let cum2024 = 0;
    let cum2025 = 0;
    let cum2026 = 0;

    const data2024: (number | null)[] = [];
    const data2025: (number | null)[] = [];
    const data2026: (number | null)[] = [];
    const data2026Proj: (number | null)[] = [];

    for (const m of months) {
      cum2024 += online2024[m] || 0;
      data2024.push(cum2024);

      cum2025 += online2025[m] || 0;
      data2025.push(cum2025);

      if (m < currentMonth && online2026[m] !== undefined) {
        cum2026 += online2026[m];
        data2026.push(cum2026);
        data2026Proj.push(null);
      } else if (m === currentMonth && currentMonthProjection.daysTracked > 0) {
        // Actual up to now
        const actualCum = cum2026 + currentMonthProjection.actualOnline;
        data2026.push(actualCum);
        // Projected line includes this month's projection
        const projCum = cum2026 + currentMonthProjection.projOnline;
        data2026Proj.push(projCum);
        cum2026 += currentMonthProjection.projOnline;
      } else {
        data2026.push(null);
        data2026Proj.push(null);
      }
    }

    return { months, data2024, data2025, data2026, data2026Proj };
  }, [online2026, currentMonthProjection, currentMonth]);

  // ---- Chart builders ----

  function buildGroupedBarData(
    data2024: Record<number, number>,
    data2025: Record<number, number>,
    data2026: Record<number, number>,
    color2024: string,
    color2025: string,
    color2026: string,
    color2026Light: string,
    label: string,
  ) {
    const months: number[] = [];
    for (let m = 1; m <= 12; m++) {
      if (m <= maxMonth2026) months.push(m);
    }

    const labels = months.map((m) => MONTH_ABBR[m]);
    const vals2024 = months.map((m) => data2024[m] || 0);
    const vals2025 = months.map((m) => data2025[m] || 0);
    const vals2026Actual = months.map((m) => {
      if (m === currentMonth && currentMonthProjection.daysTracked > 0) {
        if (label === 'Online') return currentMonthProjection.actualOnline;
        if (label === 'Hybrid') return currentMonthProjection.actualHybrid;
        if (label === 'Prime') return currentMonthProjection.actualPrime;
      }
      return data2026[m] || 0;
    });
    const vals2026Proj = months.map((m) => {
      if (m === currentMonth && currentMonthProjection.daysTracked > 0) {
        let proj = 0;
        if (label === 'Online') proj = currentMonthProjection.projOnline - currentMonthProjection.actualOnline;
        else if (label === 'Hybrid') proj = currentMonthProjection.projHybrid - currentMonthProjection.actualHybrid;
        else if (label === 'Prime') proj = currentMonthProjection.projPrime - currentMonthProjection.actualPrime;
        return Math.max(0, proj);
      }
      return 0;
    });

    const hasProjection = vals2026Proj.some((v) => v > 0);

    const datasets = [
      { label: '2024', data: vals2024, backgroundColor: color2024 },
      { label: '2025', data: vals2025, backgroundColor: color2025 },
      { label: '2026', data: vals2026Actual, backgroundColor: color2026 },
    ];

    if (hasProjection) {
      datasets.push({
        label: '2026 (projected)',
        data: vals2026Proj,
        backgroundColor: color2026Light,
      });
    }

    return { labels, datasets };
  }

  // ---- Table builder ----

  function buildTableRows(
    data2024: Record<number, number>,
    data2025: Record<number, number>,
    data2026: Record<number, number>,
    label: string,
  ) {
    const rows: {
      month: number;
      name: string;
      val2024: number;
      val2025: number;
      val2026: number;
      isCurrent: boolean;
      isProjected: boolean;
      vs25: number;
      vs24: number;
    }[] = [];

    for (let m = 1; m <= 12; m++) {
      if (m > maxMonth2026) break;
      const isCurrent = m === currentMonth && currentMonthProjection.daysTracked > 0;
      let val2026 = data2026[m] || 0;
      if (isCurrent) {
        if (label === 'Online') val2026 = currentMonthProjection.projOnline;
        else if (label === 'Hybrid') val2026 = currentMonthProjection.projHybrid;
        else if (label === 'Prime') val2026 = currentMonthProjection.projPrime;
      }
      rows.push({
        month: m,
        name: MONTH_NAMES[m],
        val2024: data2024[m] || 0,
        val2025: data2025[m] || 0,
        val2026,
        isCurrent,
        isProjected: isCurrent,
        vs25: val2026 - (data2025[m] || 0),
        vs24: val2026 - (data2024[m] || 0),
      });
    }
    return rows;
  }

  // ---- Render ----

  if (loading) {
    return <div className="text-gray-400 py-12 text-center">Loading trends data...</div>;
  }

  const onlineBarData = buildGroupedBarData(online2024, online2025, online2026, '#999999', '#8CD1C8', '#3A6EA4', '#94b8d8', 'Online');
  const hybridBarData = buildGroupedBarData(hybrid2024, hybrid2025, hybrid2026, '#999999', '#B6CAE3', '#d97706', '#f0c96e', 'Hybrid');
  const primeBarData = buildGroupedBarData(prime2024, prime2025, prime2026, '#999999', '#E5A04B', '#dc2626', '#f08080', 'Prime');
  const onlineTableRows = buildTableRows(online2024, online2025, online2026, 'Online');

  const groupedBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const },
    },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true },
    },
  };

  return (
    <div className="space-y-6">
      {/* Section 1: YOY Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="YTD Online 2026 vs 2025"
          subtitle={`${lastCompletedMonth > 0 ? MONTH_ABBR[1] : '--'}${lastCompletedMonth > 1 ? '–' + MONTH_ABBR[lastCompletedMonth] : ''} completed months`}
          value2026={ytdOnline2026}
          valuePrev={ytdOnline2025}
          diff={ytdChange.diff}
          pct={ytdChange.pct}
        />
        <SummaryCard
          title="Feb+ Lift"
          subtitle={`Feb${lastCompletedMonth > 2 ? '–' + MONTH_ABBR[lastCompletedMonth] : ''} (excl. Jan anomaly)`}
          value2026={febPlusOnline2026}
          valuePrev={febPlusOnline2025}
          diff={febPlusChange.diff}
          pct={febPlusChange.pct}
        />
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            {MONTH_NAMES[currentMonth]} 2026 vs 2025
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">{curMonthActual.toLocaleString()}</span>
            <span className="text-sm text-gray-400">actual</span>
          </div>
          <div className="text-sm text-gray-500 mt-1">
            Proj: {curMonthProj.toLocaleString()} ({currentMonthProjection.daysTracked}d tracked / {currentMonthProjection.totalDays}d)
          </div>
          <div className="text-sm mt-1">
            vs {sameMonth2025.toLocaleString()} in &apos;25:{' '}
            <span className={curMonthChange.diff >= 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
              {formatDiff(curMonthChange.diff)} ({formatPct(curMonthChange.pct)})
            </span>
          </div>
        </div>
        <SummaryCard
          title="Full Year 2025 vs 2024"
          subtitle="12 months completed"
          value2026={total2025}
          valuePrev={total2024}
          diff={fullYearChange.diff}
          pct={fullYearChange.pct}
          labelCurrent="2025"
          labelPrev="2024"
        />
      </div>

      {/* Section 2: Cumulative Online Trajectory */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-600" />
          Cumulative Online Trajectory
        </h3>
        <div style={{ height: 380 }}>
          <Line
            data={{
              labels: MONTH_ABBR.slice(1),
              datasets: [
                {
                  label: '2024',
                  data: cumulativeData.data2024,
                  borderColor: '#999999',
                  backgroundColor: 'rgba(153,153,153,0.1)',
                  borderWidth: 2,
                  pointRadius: 3,
                  tension: 0.1,
                },
                {
                  label: '2025',
                  data: cumulativeData.data2025,
                  borderColor: '#8CD1C8',
                  backgroundColor: 'rgba(140,209,200,0.1)',
                  borderWidth: 2,
                  pointRadius: 3,
                  tension: 0.1,
                },
                {
                  label: '2026',
                  data: cumulativeData.data2026,
                  borderColor: '#3A6EA4',
                  backgroundColor: 'rgba(58,110,164,0.1)',
                  borderWidth: 2.5,
                  pointRadius: 4,
                  tension: 0.1,
                },
                {
                  label: '2026 (projected)',
                  data: cumulativeData.data2026Proj,
                  borderColor: '#3A6EA4',
                  borderDash: [6, 4],
                  backgroundColor: 'transparent',
                  borderWidth: 2,
                  pointRadius: 4,
                  pointStyle: 'triangle',
                  tension: 0.1,
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
                    label: (ctx) => {
                      const val = ctx.parsed.y;
                      if (val === null) return '';
                      return `${ctx.dataset.label}: ${val.toLocaleString()}`;
                    },
                  },
                },
              },
              scales: {
                x: { grid: { display: false } },
                y: { beginAtZero: true },
              },
              spanGaps: false,
            }}
          />
        </div>
      </div>

      {/* Section 3: Monthly Online Comparison (Grouped Bar) */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-600" />
          Monthly Online Comparison
        </h3>
        <div style={{ height: 350 }}>
          {onlineBarData.labels.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-400">No 2026 data yet</div>
          ) : (
            <Bar data={onlineBarData} options={groupedBarOptions} />
          )}
        </div>
      </div>

      {/* Section 4: Monthly Online Breakdown Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-600" />
          Monthly Online Breakdown
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-3 py-2 font-medium">Month</th>
                <th className="px-3 py-2 font-medium text-right">2024</th>
                <th className="px-3 py-2 font-medium text-right">2025</th>
                <th className="px-3 py-2 font-medium text-right">2026</th>
                <th className="px-3 py-2 font-medium text-right">vs &apos;25</th>
                <th className="px-3 py-2 font-medium text-right">vs &apos;24</th>
              </tr>
            </thead>
            <tbody>
              {onlineTableRows.map((row) => (
                <tr key={row.month} className="hover:bg-gray-50">
                  <td className="px-3 py-2 border-t border-gray-100 font-medium">
                    {row.name}
                    {row.isProjected && <span className="text-xs text-gray-400 ml-1">*proj</span>}
                  </td>
                  <td className="px-3 py-2 border-t border-gray-100 text-right text-gray-500">{row.val2024.toLocaleString()}</td>
                  <td className="px-3 py-2 border-t border-gray-100 text-right text-teal-600">{row.val2025.toLocaleString()}</td>
                  <td className="px-3 py-2 border-t border-gray-100 text-right font-semibold text-blue-700">{row.val2026.toLocaleString()}</td>
                  <td className={`px-3 py-2 border-t border-gray-100 text-right font-medium ${row.vs25 >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatDiff(row.vs25)}
                  </td>
                  <td className={`px-3 py-2 border-t border-gray-100 text-right font-medium ${row.vs24 >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatDiff(row.vs24)}
                  </td>
                </tr>
              ))}
              {onlineTableRows.length > 0 && (
                <tr className="bg-gray-50 font-semibold">
                  <td className="px-3 py-2 border-t border-gray-200">Total</td>
                  <td className="px-3 py-2 border-t border-gray-200 text-right text-gray-500">
                    {onlineTableRows.reduce((s, r) => s + r.val2024, 0).toLocaleString()}
                  </td>
                  <td className="px-3 py-2 border-t border-gray-200 text-right text-teal-600">
                    {onlineTableRows.reduce((s, r) => s + r.val2025, 0).toLocaleString()}
                  </td>
                  <td className="px-3 py-2 border-t border-gray-200 text-right text-blue-700">
                    {onlineTableRows.reduce((s, r) => s + r.val2026, 0).toLocaleString()}
                  </td>
                  <td className={`px-3 py-2 border-t border-gray-200 text-right ${onlineTableRows.reduce((s, r) => s + r.vs25, 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatDiff(onlineTableRows.reduce((s, r) => s + r.vs25, 0))}
                  </td>
                  <td className={`px-3 py-2 border-t border-gray-200 text-right ${onlineTableRows.reduce((s, r) => s + r.vs24, 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatDiff(onlineTableRows.reduce((s, r) => s + r.vs24, 0))}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 5: Hybrid Comparison (Grouped Bar) */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-600" />
          Monthly Hybrid Comparison
        </h3>
        <div style={{ height: 350 }}>
          {hybridBarData.labels.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-400">No 2026 data yet</div>
          ) : (
            <Bar data={hybridBarData} options={groupedBarOptions} />
          )}
        </div>
      </div>

      {/* Section 6: Prime Comparison (Grouped Bar) */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-600" />
          Monthly Prime Comparison
        </h3>
        <div style={{ height: 350 }}>
          {primeBarData.labels.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-400">No 2026 data yet</div>
          ) : (
            <Bar data={primeBarData} options={groupedBarOptions} />
          )}
        </div>
      </div>
    </div>
  );
}

// ---- Reusable Summary Card ----

function SummaryCard({
  title,
  subtitle,
  value2026,
  valuePrev,
  diff,
  pct,
  labelCurrent = '2026',
  labelPrev = '2025',
}: {
  title: string;
  subtitle: string;
  value2026: number;
  valuePrev: number;
  diff: number;
  pct: number;
  labelCurrent?: string;
  labelPrev?: string;
}) {
  const isPositive = diff >= 0;
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{title}</div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-gray-900">{value2026.toLocaleString()}</span>
        <span className="text-xs text-gray-400">{labelCurrent}</span>
      </div>
      <div className="text-sm text-gray-500 mt-1">
        vs {valuePrev.toLocaleString()} ({labelPrev})
      </div>
      <div className={`text-sm font-semibold mt-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {formatDiff(diff)} ({formatPct(pct)})
      </div>
      <div className="text-xs text-gray-400 mt-1">{subtitle}</div>
    </div>
  );
}
