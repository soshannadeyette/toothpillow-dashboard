'use client';

import { useState, useEffect } from 'react';
import { fetchMonthlyGoals, saveMonthlyGoals } from '@/lib/api';
import type { MonthGoal } from '@/lib/types';
import { MONTHLY_GOALS_2026, MONTH_NAMES } from '@/lib/types';

export default function GoalEditor() {
  const [goals, setGoals] = useState<MonthGoal[]>([...MONTHLY_GOALS_2026]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchMonthlyGoals();
        setGoals(data);
      } catch {
        // fallback already handled by fetchMonthlyGoals
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function updateGoal(month: number, field: 'online' | 'hybrid' | 'prime', value: number) {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.month !== month) return g;
        const updated = { ...g, [field]: value };
        updated.total = updated.online + updated.hybrid + updated.prime;
        return updated;
      })
    );
    setFeedback(null);
  }

  async function handleSave() {
    setSaving(true);
    setFeedback(null);
    try {
      await saveMonthlyGoals(goals);
      setFeedback({ type: 'success', message: 'Goals saved successfully.' });
    } catch (err) {
      setFeedback({ type: 'error', message: `Failed to save: ${err instanceof Error ? err.message : 'Unknown error'}` });
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    setGoals([...MONTHLY_GOALS_2026.map((g) => ({ ...g }))]);
    setFeedback(null);
  }

  if (loading) {
    return <div className="text-gray-400 py-12 text-center">Loading goals...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">2026 Monthly Goals</h2>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Reset to defaults
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`mb-4 px-4 py-2 rounded-md text-sm font-medium ${
            feedback.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {feedback.message}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-3 py-2 font-medium">Month</th>
              <th className="px-3 py-2 font-medium text-right">Online</th>
              <th className="px-3 py-2 font-medium text-right">Hybrid</th>
              <th className="px-3 py-2 font-medium text-right">Prime</th>
              <th className="px-3 py-2 font-medium text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {goals.map((g) => (
              <tr key={g.month} className="hover:bg-gray-50">
                <td className="px-3 py-2 border-t border-gray-100 font-medium">{MONTH_NAMES[g.month]}</td>
                <td className="px-3 py-2 border-t border-gray-100 text-right">
                  <input
                    type="number"
                    value={g.online}
                    onChange={(e) => updateGoal(g.month, 'online', parseInt(e.target.value) || 0)}
                    className="w-20 text-right px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </td>
                <td className="px-3 py-2 border-t border-gray-100 text-right">
                  <input
                    type="number"
                    value={g.hybrid}
                    onChange={(e) => updateGoal(g.month, 'hybrid', parseInt(e.target.value) || 0)}
                    className="w-20 text-right px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </td>
                <td className="px-3 py-2 border-t border-gray-100 text-right">
                  <input
                    type="number"
                    value={g.prime}
                    onChange={(e) => updateGoal(g.month, 'prime', parseInt(e.target.value) || 0)}
                    className="w-20 text-right px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </td>
                <td className="px-3 py-2 border-t border-gray-100 text-right font-semibold text-gray-900">
                  {g.total.toLocaleString()}
                </td>
              </tr>
            ))}
            <tr className="bg-gray-50 font-semibold">
              <td className="px-3 py-2 border-t border-gray-200">Total</td>
              <td className="px-3 py-2 border-t border-gray-200 text-right">
                {goals.reduce((s, g) => s + g.online, 0).toLocaleString()}
              </td>
              <td className="px-3 py-2 border-t border-gray-200 text-right">
                {goals.reduce((s, g) => s + g.hybrid, 0).toLocaleString()}
              </td>
              <td className="px-3 py-2 border-t border-gray-200 text-right">
                {goals.reduce((s, g) => s + g.prime, 0).toLocaleString()}
              </td>
              <td className="px-3 py-2 border-t border-gray-200 text-right text-gray-900">
                {goals.reduce((s, g) => s + g.total, 0).toLocaleString()}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
