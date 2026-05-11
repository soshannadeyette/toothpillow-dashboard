'use client';

import { useState, useEffect } from 'react';
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
import { Bar } from 'react-chartjs-2';
import { fetchAnnualSummaries } from '@/lib/api';
import type { MonthlySummary } from '@/lib/types';
import { MONTHLY_GOALS_2026, MONTH_NAMES } from '@/lib/types';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

export default function AnnualView() {
  const [summaries, setSummaries] = useState<MonthlySummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchAnnualSummaries(2026);
        setSummaries(data);
      } catch {
        // handle silently
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const ytdTotal = summaries.reduce((s, m) => s + m.total_submissions, 0);
  const ytdGoal = summaries.reduce((s, m) => s + m.goal, 0);
  const ytdOnline = summaries.reduce((s, m) => s + m.online_submissions, 0);
  const ytdHybrid = summaries.reduce((s, m) => s + m.hybrid_submissions, 0);
  const ytdPrime = summaries.reduce((s, m) => s + m.prime_submissions, 0);
  const ytdVisitors = summaries.reduce((s, m) => s + m.total_visitors, 0);
  const ytdIncome = summaries.reduce((s, m) => s + m.total_income, 0);

  // Stacked bar chart — submissions vs goal by month
  const chartLabels = summaries.map((m) => MONTH_NAMES[m.month]?.slice(0, 3) || `M${m.month}`);
  const goals = summaries.map((m) => {
    const g = MONTHLY_GOALS_2026.find((g) => g.month === m.month);
    return g?.total ?? m.goal;
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chartData: any = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Online',
        data: summaries.map((m) => m.online_submissions),
        backgroundColor: '#2563eb',
        stack: 'stack',
      },
      {
        label: 'Hybrid',
        data: summaries.map((m) => m.hybrid_submissions),
        backgroundColor: '#d97706',
        stack: 'stack',
      },
      {
        label: 'Prime',
        data: summaries.map((m) => m.prime_submissions),
        backgroundColor: '#dc2626',
        stack: 'stack',
      },
      {
        type: 'line' as const,
        label: 'Goal',
        data: goals,
        borderColor: '#6b7280',
        borderDash: [6, 3],
        borderWidth: 2,
        pointRadius: 0,
        fill: false,
      },
    ],
  };

  if (loading) {
    return <div className="text-gray-400 py-12 text-center">Loading annual data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* YTD stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-900">{ytdTotal.toLocaleString()}</div>
          <div className="text-sm text-gray-500 mt-1">YTD Submissions</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-900">{ytdGoal.toLocaleString()}</div>
          <div className="text-sm text-gray-500 mt-1">YTD Goal</div>
        </div>
        <div className={`bg-white rounded-lg shadow-sm border p-4 ${ytdTotal >= ytdGoal ? 'border-green-200' : 'border-amber-200'}`}>
          <div className={`text-2xl font-bold ${ytdTotal >= ytdGoal ? 'text-green-600' : 'text-amber-600'}`}>
            {((ytdTotal / ytdGoal) * 100).toFixed(1)}%
          </div>
          <div className="text-sm text-gray-500 mt-1">% of Goal</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-blue-600">{ytdOnline.toLocaleString()}</div>
          <div className="text-sm text-gray-500 mt-1">Online</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-amber-600">{ytdHybrid.toLocaleString()}</div>
          <div className="text-sm text-gray-500 mt-1">Hybrid</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-900">${ytdIncome.toLocaleString()}</div>
          <div className="text-sm text-gray-500 mt-1">YTD Income</div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">2026 Submission Mix vs Goal</h3>
        <div style={{ height: 350 }}>
          {summaries.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-400">No data yet</div>
          ) : (
            <Bar
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'top' },
                  tooltip: {
                    callbacks: {
                      afterBody: (ctx) => {
                        const idx = ctx[0].dataIndex;
                        const m = summaries[idx];
                        return `Total: ${m.total_submissions.toLocaleString()} | Goal: ${goals[idx].toLocaleString()}`;
                      },
                    },
                  },
                },
                scales: {
                  x: { stacked: true },
                  y: { stacked: true, beginAtZero: true },
                },
              }}
            />
          )}
        </div>
      </div>

      {/* Monthly breakdown table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-3 py-2 font-medium">Month</th>
              <th className="px-3 py-2 font-medium text-right">Online</th>
              <th className="px-3 py-2 font-medium text-right">Hybrid</th>
              <th className="px-3 py-2 font-medium text-right">Prime</th>
              <th className="px-3 py-2 font-medium text-right">Total</th>
              <th className="px-3 py-2 font-medium text-right">Goal</th>
              <th className="px-3 py-2 font-medium text-right">Gap</th>
              <th className="px-3 py-2 font-medium text-right">% Goal</th>
              <th className="px-3 py-2 font-medium text-right">Visitors</th>
              <th className="px-3 py-2 font-medium text-right">Conv %</th>
              <th className="px-3 py-2 font-medium text-right">USA Conv %</th>
              <th className="px-3 py-2 font-medium text-right">Daily Avg</th>
            </tr>
          </thead>
          <tbody>
            {summaries.map((m) => {
              const gap = m.goal - m.total_submissions;
              const pct = m.goal > 0 ? ((m.total_submissions / m.goal) * 100).toFixed(1) : '--';
              return (
                <tr key={m.month} className="hover:bg-gray-50">
                  <td className="px-3 py-2 border-t border-gray-100 font-medium">{m.month_name}</td>
                  <td className="px-3 py-2 border-t border-gray-100 text-right text-blue-600">
                    {m.online_submissions.toLocaleString()}
                  </td>
                  <td className="px-3 py-2 border-t border-gray-100 text-right text-amber-600">
                    {m.hybrid_submissions.toLocaleString()}
                  </td>
                  <td className="px-3 py-2 border-t border-gray-100 text-right text-red-600">
                    {m.prime_submissions.toLocaleString()}
                  </td>
                  <td className="px-3 py-2 border-t border-gray-100 text-right font-medium">
                    {m.total_submissions.toLocaleString()}
                  </td>
                  <td className="px-3 py-2 border-t border-gray-100 text-right">{m.goal.toLocaleString()}</td>
                  <td className={`px-3 py-2 border-t border-gray-100 text-right ${gap > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                    {gap > 0 ? `-${gap}` : `+${Math.abs(gap)}`}
                  </td>
                  <td className="px-3 py-2 border-t border-gray-100 text-right">{pct}%</td>
                  <td className="px-3 py-2 border-t border-gray-100 text-right">{m.total_visitors.toLocaleString()}</td>
                  <td className="px-3 py-2 border-t border-gray-100 text-right">{m.conversion_rate}%</td>
                  <td className="px-3 py-2 border-t border-gray-100 text-right">{m.usa_conversion_rate}%</td>
                  <td className="px-3 py-2 border-t border-gray-100 text-right">{m.daily_avg}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
