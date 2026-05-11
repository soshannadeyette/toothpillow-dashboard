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
import { fetchSubmissions, upsertSubmission, currentYear, currentMonth } from '@/lib/api';
import type { DailySubmission } from '@/lib/types';
import { MONTHLY_GOALS_2026, MONTH_NAMES } from '@/lib/types';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler);

export default function DailyTracker() {
  const [entries, setEntries] = useState<DailySubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState(currentYear());
  const [selectedMonth, setSelectedMonth] = useState(currentMonth());

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
  const gap = goal - totalSubmissions;
  const pctOfGoal = goal > 0 ? ((totalSubmissions / goal) * 100).toFixed(1) : '0';
  const convRate = totalVisitors > 0 ? ((totalSubmissions / totalVisitors) * 100).toFixed(1) : '0';

  // Days remaining in month
  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const daysRemaining = daysInMonth - daysTracked;
  const neededPerDay = daysRemaining > 0 ? Math.ceil(gap / daysRemaining) : 0;

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

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-900">{totalSubmissions.toLocaleString()}</div>
          <div className="text-sm text-gray-500 mt-1">MTD Submissions</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-900">{goal.toLocaleString()}</div>
          <div className="text-sm text-gray-500 mt-1">Monthly Goal</div>
        </div>
        <div className={`bg-white rounded-lg shadow-sm border p-4 ${gap > 0 ? 'border-amber-200' : 'border-green-200'}`}>
          <div className={`text-2xl font-bold ${gap > 0 ? 'text-amber-600' : 'text-green-600'}`}>
            {gap > 0 ? `-${gap.toLocaleString()}` : `+${Math.abs(gap).toLocaleString()}`}
          </div>
          <div className="text-sm text-gray-500 mt-1">Gap to Goal ({pctOfGoal}%)</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-900">{dailyAvg}</div>
          <div className="text-sm text-gray-500 mt-1">Daily Avg</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-900">{daysRemaining > 0 ? neededPerDay : '--'}</div>
          <div className="text-sm text-gray-500 mt-1">Needed/Day</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-900">{convRate}%</div>
          <div className="text-sm text-gray-500 mt-1">Conversion ({totalVisitors.toLocaleString()} vis)</div>
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

      {/* Sub-totals by type */}
      <div className="grid grid-cols-3 gap-4">
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
    </div>
  );
}
