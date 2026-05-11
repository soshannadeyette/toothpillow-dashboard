'use client';

import { useState, useEffect, useMemo } from 'react';
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
import { fetchSubmissions } from '@/lib/api';
import type { DailySubmission } from '@/lib/types';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

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

  // Bucket entries into Mon–Sun weeks
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
        label: `${formatShort(monday)} – ${formatShort(sun.toISOString().slice(0, 10))}`,
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

  const chartData = week
    ? {
        labels: week.entries.map((e) => {
          const d = new Date(e.date + 'T12:00:00');
          return d.toLocaleDateString('en-US', { weekday: 'short' });
        }),
        datasets: [
          {
            label: 'Online',
            data: week.entries.map((e) => e.online),
            backgroundColor: '#2563eb',
            stack: 'stack',
          },
          {
            label: 'Hybrid',
            data: week.entries.map((e) => e.hybrid),
            backgroundColor: '#d97706',
            stack: 'stack',
          },
          {
            label: 'Prime',
            data: week.entries.map((e) => e.prime),
            backgroundColor: '#dc2626',
            stack: 'stack',
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
          ← Older
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
          Newer →
        </button>
      </div>

      {week && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="text-2xl font-bold text-gray-900">{week.total}</div>
              <div className="text-sm text-gray-500 mt-1">Week Total</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="text-2xl font-bold text-blue-600">{week.online}</div>
              <div className="text-sm text-gray-500 mt-1">Online</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="text-2xl font-bold text-amber-600">{week.hybrid}</div>
              <div className="text-sm text-gray-500 mt-1">Hybrid</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="text-2xl font-bold text-red-600">{week.prime}</div>
              <div className="text-sm text-gray-500 mt-1">Prime</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="text-2xl font-bold text-gray-900">
                {(week.total / (week.entries.length || 1)).toFixed(1)}
              </div>
              <div className="text-sm text-gray-500 mt-1">Daily Avg</div>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Week of {week.label}</h3>
            <div style={{ height: 280 }}>
              {chartData && (
                <Bar
                  data={chartData}
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

          {/* Table */}
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
        </>
      )}
    </div>
  );
}
