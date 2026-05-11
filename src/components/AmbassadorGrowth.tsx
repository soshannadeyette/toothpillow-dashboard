'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

// ---------------------------------------------------------------------------
// Hardcoded data
// ---------------------------------------------------------------------------
const combSubsYear: Record<number, number> = { 2023: 1807, 2024: 10366, 2025: 6530, 2026: 2368 };
const ambSubsYear: Record<number, number> = { 2023: 461, 2024: 435, 2025: 561, 2026: 220 };
const infSubsYear: Record<number, number> = { 2023: 1346, 2024: 9931, 2025: 5969, 2026: 2148 };

const addsTotalYear: Record<number, number> = { 2023: 40, 2024: 134, 2025: 170, 2026: 75 };
const addsAmbYear: Record<number, number> = { 2023: 11, 2024: 73, 2025: 141, 2026: 63 };
const addsInfYear: Record<number, number> = { 2023: 29, 2024: 61, 2025: 29, 2026: 12 };

const recruit26 = [
  { label: 'Jan', amb: 5, inf: 3 },
  { label: 'Feb', amb: 13, inf: 1 },
  { label: 'Mar', amb: 10, inf: 3 },
  { label: 'Apr', amb: 28, inf: 5 },
  { label: 'May', amb: 7, inf: 0 },
];

const baseByYear: Record<number, number> = { 2023: 517, 2024: 2898, 2025: 4642, 2026: 1460 };

const halfCarriedBy: Record<number, number> = { 2023: 1, 2024: 2, 2025: 5, 2026: 7 };
const tenPlusByYear: Record<number, number> = { 2023: 8, 2024: 40, 2025: 55, 2026: 30 };

const years = [2023, 2024, 2025, 2026];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function pctChange(prev: number, curr: number): string {
  if (prev === 0) return 'N/A';
  const pct = ((curr - prev) / prev) * 100;
  return `${pct >= 0 ? '+' : ''}${pct.toFixed(0)}%`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function AmbassadorGrowth() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const barOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const },
      tooltip: { mode: 'index' as const, intersect: false },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stackedBarOptions: any = {
    ...barOptions,
    scales: {
      x: { stacked: true },
      y: { stacked: true, beginAtZero: true },
    },
  };

  // Monthly recruitment chart (2026)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recruitChartData: any = {
    labels: recruit26.map((r) => r.label),
    datasets: [
      {
        label: 'Ambassador',
        data: recruit26.map((r) => r.amb),
        backgroundColor: '#2563eb',
      },
      {
        label: 'Influencer',
        data: recruit26.map((r) => r.inf),
        backgroundColor: '#d97706',
      },
    ],
  };

  // New adds grouped bar (all years)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const addsChartData: any = {
    labels: years.map(String),
    datasets: [
      {
        label: 'Ambassador Adds',
        data: years.map((y) => addsAmbYear[y]),
        backgroundColor: '#2563eb',
      },
      {
        label: 'Influencer Adds',
        data: years.map((y) => addsInfYear[y]),
        backgroundColor: '#d97706',
      },
    ],
  };

  // Channel YOY grouped bar
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const channelChartData: any = {
    labels: years.map(String),
    datasets: [
      {
        label: 'Influencer Submissions',
        data: years.map((y) => infSubsYear[y]),
        backgroundColor: '#d97706',
      },
      {
        label: 'Ambassador Submissions',
        data: years.map((y) => ambSubsYear[y]),
        backgroundColor: '#2563eb',
      },
    ],
  };

  // Base program bar
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const baseChartData: any = {
    labels: years.map(String),
    datasets: [
      {
        label: 'Base Program Submissions',
        data: years.map((y) => baseByYear[y]),
        backgroundColor: '#059669',
      },
    ],
  };

  // Ambassador-only bar
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ambOnlyChartData: any = {
    labels: years.map(String),
    datasets: [
      {
        label: 'Ambassador-Only Submissions',
        data: years.map((y) => ambSubsYear[y]),
        backgroundColor: '#2563eb',
      },
    ],
  };

  // Concentration horizontal bars
  const maxHalf = Math.max(...Object.values(halfCarriedBy));

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="rounded-lg p-6 text-white" style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)' }}>
        <h2 className="text-2xl font-bold">Sosh took over in February. Here&apos;s what changed.</h2>
        <p className="mt-3 text-blue-100 leading-relaxed max-w-3xl">
          Since Sosh stepped in as VP of Acquisition, the ambassador program has shifted from influencer-dependent viral spikes to a diversified, sustainable growth engine.
          2026 YTD: {addsTotalYear[2026]} new ambassadors added ({addsAmbYear[2026]} airway, {addsInfYear[2026]} influencer), with April as the strongest add month since Feb 2025.
          The base program (excluding mega-viral spikes) grew from {baseByYear[2023].toLocaleString()} in 2023 to {baseByYear[2025].toLocaleString()} in 2025, a {pctChange(baseByYear[2023], baseByYear[2025])} increase.
          Concentration is improving: it took {halfCarriedBy[2023]} person to carry 50% of submissions in 2023, now it takes {halfCarriedBy[2026]} in 2026.
        </p>
      </div>

      {/* 2026 Recruitment Cards */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">2026 Monthly Recruitment</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {recruit26.map((r) => {
            const total = r.amb + r.inf;
            return (
              <div key={r.label} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <p className="text-sm text-gray-500 font-medium">{r.label} 2026</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{total}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
                    AMB {r.amb}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-yellow-600 inline-block" />
                    INF {r.inf}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Monthly Recruitment Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">2026 Monthly Recruitment (Stacked)</h3>
        <div className="h-72">
          <Bar data={recruitChartData} options={stackedBarOptions} />
        </div>
      </div>

      {/* New Adds Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">New Adds by Year</h3>
        <div className="h-72">
          <Bar data={addsChartData} options={barOptions} />
        </div>
        <div className="mt-3 grid grid-cols-4 gap-2 text-center text-xs text-gray-500">
          {years.map((y) => (
            <div key={y}>
              <span className="font-semibold text-gray-700">{y}</span>: {addsTotalYear[y]} total
            </div>
          ))}
        </div>
      </div>

      {/* Channel YOY */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Channel Year-over-Year</h3>
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          {/* Influencer Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">Influencer Channel</h4>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-1 text-gray-500">Year</th>
                  <th className="text-right py-1 text-gray-500">Submissions</th>
                  <th className="text-right py-1 text-gray-500">Adds</th>
                  <th className="text-right py-1 text-gray-500">YOY</th>
                </tr>
              </thead>
              <tbody>
                {years.map((y, i) => (
                  <tr key={y} className="border-b border-gray-100">
                    <td className="py-1 font-medium text-gray-700">{y}</td>
                    <td className="text-right text-gray-600">{infSubsYear[y].toLocaleString()}</td>
                    <td className="text-right text-gray-600">{addsInfYear[y]}</td>
                    <td className="text-right text-gray-500 text-xs">
                      {i > 0 ? pctChange(infSubsYear[years[i - 1]], infSubsYear[y]) : '--'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Ambassador Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">Ambassador Channel</h4>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-1 text-gray-500">Year</th>
                  <th className="text-right py-1 text-gray-500">Submissions</th>
                  <th className="text-right py-1 text-gray-500">Adds</th>
                  <th className="text-right py-1 text-gray-500">YOY</th>
                </tr>
              </thead>
              <tbody>
                {years.map((y, i) => (
                  <tr key={y} className="border-b border-gray-100">
                    <td className="py-1 font-medium text-gray-700">{y}</td>
                    <td className="text-right text-gray-600">{ambSubsYear[y].toLocaleString()}</td>
                    <td className="text-right text-gray-600">{addsAmbYear[y]}</td>
                    <td className="text-right text-gray-500 text-xs">
                      {i > 0 ? pctChange(ambSubsYear[years[i - 1]], ambSubsYear[y]) : '--'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Channel grouped bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Submissions by Channel & Year</h4>
          <div className="h-72">
            <Bar data={channelChartData} options={barOptions} />
          </div>
        </div>
      </div>

      {/* Base Program Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Base Program (Excluding Viral Spikes)</h3>
        <p className="text-sm text-gray-500 mb-4">Removes the top 3 mega-viral influencer months to show underlying program health.</p>
        <div className="h-72">
          <Bar data={baseChartData} options={barOptions} />
        </div>
        <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600">
          {years.map((y, i) => (
            <span key={y}>
              <span className="font-semibold">{y}</span>: {baseByYear[y].toLocaleString()}
              {i > 0 && (
                <span className={`ml-1 text-xs ${baseByYear[y] > baseByYear[years[i - 1]] ? 'text-green-600' : 'text-red-600'}`}>
                  ({pctChange(baseByYear[years[i - 1]], baseByYear[y])})
                </span>
              )}
            </span>
          ))}
        </div>
      </div>

      {/* Ambassador-Only Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Ambassador-Only Submissions</h3>
        <p className="text-sm text-gray-500 mb-4">Submissions driven by Airway Ambassadors (excludes influencer channel).</p>
        <div className="h-72">
          <Bar data={ambOnlyChartData} options={barOptions} />
        </div>
        <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600">
          {years.map((y, i) => (
            <span key={y}>
              <span className="font-semibold">{y}</span>: {ambSubsYear[y].toLocaleString()}
              {i > 0 && (
                <span className={`ml-1 text-xs ${ambSubsYear[y] > ambSubsYear[years[i - 1]] ? 'text-green-600' : 'text-red-600'}`}>
                  ({pctChange(ambSubsYear[years[i - 1]], ambSubsYear[y])})
                </span>
              )}
            </span>
          ))}
        </div>
      </div>

      {/* Program Health */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Program Health</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {/* Concentration: people needed to reach 50% */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">People Needed to Reach 50% of Submissions</h4>
            <p className="text-xs text-gray-500 mb-4">Higher is better. More people contributing means less concentration risk.</p>
            <div className="space-y-3">
              {years.map((y) => {
                const val = halfCarriedBy[y];
                const pct = maxHalf > 0 ? (val / maxHalf) * 100 : 0;
                return (
                  <div key={y}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">{y}</span>
                      <span className="font-bold text-gray-900">{val} {val === 1 ? 'person' : 'people'}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-4">
                      <div
                        className="h-4 rounded-full transition-all"
                        style={{
                          width: `${Math.max(pct, 8)}%`,
                          backgroundColor: val >= 5 ? '#059669' : val >= 3 ? '#d97706' : '#dc2626',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 10+ submissions count */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Ambassadors with 10+ Submissions</h4>
            <p className="text-xs text-gray-500 mb-4">Active producers driving meaningful volume each year.</p>
            <div className="space-y-3">
              {years.map((y) => {
                const val = tenPlusByYear[y];
                const maxTen = Math.max(...Object.values(tenPlusByYear));
                const pct = maxTen > 0 ? (val / maxTen) * 100 : 0;
                return (
                  <div key={y}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">{y}</span>
                      <span className="font-bold text-gray-900">{val}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-4">
                      <div
                        className="h-4 rounded-full bg-blue-600 transition-all"
                        style={{ width: `${Math.max(pct, 8)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Combined submissions context */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mt-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">Combined Program Submissions by Year</h4>
          <div className="grid grid-cols-4 gap-4 text-center">
            {years.map((y) => (
              <div key={y}>
                <p className="text-2xl font-bold text-gray-900">{combSubsYear[y].toLocaleString()}</p>
                <p className="text-sm text-gray-500">{y}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
