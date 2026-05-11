'use client';

import { useState, useEffect, useCallback } from 'react';
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
import { Bar, Line } from 'react-chartjs-2';
import { fetchGoogleAds, upsertGoogleAds } from '@/lib/api';
import type { GoogleAdsDaily } from '@/lib/types';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

export default function PaidAds() {
  const [entries, setEntries] = useState<GoogleAdsDaily[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formDate, setFormDate] = useState(new Date().toISOString().slice(0, 10));
  const [formSpend, setFormSpend] = useState('');
  const [formImpressions, setFormImpressions] = useState('');
  const [formClicks, setFormClicks] = useState('');
  const [formSubmit, setFormSubmit] = useState('');
  const [formStarted, setFormStarted] = useState('');
  const [formFinished, setFormFinished] = useState('');
  const [formTreatment, setFormTreatment] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchGoogleAds(2026);
      setEntries(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSave = async () => {
    if (!formDate) return;
    setSaving(true);
    setError(null);
    try {
      await upsertGoogleAds({
        date: formDate,
        spend: parseFloat(formSpend) || 0,
        impressions: parseInt(formImpressions) || 0,
        clicks: parseInt(formClicks) || 0,
        submit: parseInt(formSubmit) || 0,
        started: parseInt(formStarted) || 0,
        finished: parseInt(formFinished) || 0,
        treatment: parseInt(formTreatment) || 0,
      });
      setFormSpend('');
      setFormImpressions('');
      setFormClicks('');
      setFormSubmit('');
      setFormStarted('');
      setFormFinished('');
      setFormTreatment('');
      await loadData();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleRowClick = (e: GoogleAdsDaily) => {
    setFormDate(e.date);
    setFormSpend(String(e.spend));
    setFormImpressions(String(e.impressions));
    setFormClicks(String(e.clicks));
    setFormSubmit(String(e.submit));
    setFormStarted(String(e.started));
    setFormFinished(String(e.finished));
    setFormTreatment(String(e.treatment));
  };

  // Computed stats
  const totalSpend = entries.reduce((s, e) => s + e.spend, 0);
  const totalClicks = entries.reduce((s, e) => s + e.clicks, 0);
  const totalImpressions = entries.reduce((s, e) => s + e.impressions, 0);
  const totalSubmit = entries.reduce((s, e) => s + e.submit, 0);
  const totalStarted = entries.reduce((s, e) => s + e.started, 0);
  const totalFinished = entries.reduce((s, e) => s + e.finished, 0);
  const totalTreatment = entries.reduce((s, e) => s + e.treatment, 0);
  const ctr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0';
  const cpc = totalClicks > 0 ? (totalSpend / totalClicks).toFixed(2) : '0';

  // Charts
  const labels = entries.map((e) => {
    const d = new Date(e.date + 'T12:00:00');
    return `${d.getMonth() + 1}/${d.getDate()}`;
  });

  const spendChartData = {
    labels,
    datasets: [
      {
        label: 'Daily Spend ($)',
        data: entries.map((e) => e.spend),
        backgroundColor: '#2563eb',
      },
    ],
  };

  const funnelChartData = {
    labels,
    datasets: [
      { label: 'Clicks', data: entries.map((e) => e.clicks), borderColor: '#6b7280', fill: false, tension: 0.3 },
      { label: 'Submit', data: entries.map((e) => e.submit), borderColor: '#2563eb', fill: false, tension: 0.3 },
      { label: 'Started', data: entries.map((e) => e.started), borderColor: '#d97706', fill: false, tension: 0.3 },
      { label: 'Finished', data: entries.map((e) => e.finished), borderColor: '#16a34a', fill: false, tension: 0.3 },
      { label: 'Treatment', data: entries.map((e) => e.treatment), borderColor: '#dc2626', fill: false, tension: 0.3 },
    ],
  };

  if (loading) {
    return <div className="text-gray-400 py-12 text-center">Loading paid ads data...</div>;
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">{error}</div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-900">${totalSpend.toFixed(2)}</div>
          <div className="text-sm text-gray-500 mt-1">Total Spend</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-900">{totalImpressions.toLocaleString()}</div>
          <div className="text-sm text-gray-500 mt-1">Impressions</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-900">{totalClicks.toLocaleString()}</div>
          <div className="text-sm text-gray-500 mt-1">Clicks ({ctr}% CTR)</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-900">${cpc}</div>
          <div className="text-sm text-gray-500 mt-1">CPC</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-blue-600">{totalSubmit}</div>
          <div className="text-sm text-gray-500 mt-1">Submissions</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-green-600">{totalFinished}</div>
          <div className="text-sm text-gray-500 mt-1">Finished</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-red-600">{totalTreatment}</div>
          <div className="text-sm text-gray-500 mt-1">Treatment</div>
        </div>
      </div>

      {/* Entry form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Add / Update Google Ads Entry</h3>
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Date</label>
            <input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm w-40" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Spend ($)</label>
            <input type="number" step="0.01" value={formSpend} onChange={(e) => setFormSpend(e.target.value)}
              placeholder="0" className="border border-gray-300 rounded-md px-3 py-2 text-sm w-24" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Impressions</label>
            <input type="number" value={formImpressions} onChange={(e) => setFormImpressions(e.target.value)}
              placeholder="0" className="border border-gray-300 rounded-md px-3 py-2 text-sm w-24" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Clicks</label>
            <input type="number" value={formClicks} onChange={(e) => setFormClicks(e.target.value)}
              placeholder="0" className="border border-gray-300 rounded-md px-3 py-2 text-sm w-20" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Submit</label>
            <input type="number" value={formSubmit} onChange={(e) => setFormSubmit(e.target.value)}
              placeholder="0" className="border border-gray-300 rounded-md px-3 py-2 text-sm w-20" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Started</label>
            <input type="number" value={formStarted} onChange={(e) => setFormStarted(e.target.value)}
              placeholder="0" className="border border-gray-300 rounded-md px-3 py-2 text-sm w-20" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Finished</label>
            <input type="number" value={formFinished} onChange={(e) => setFormFinished(e.target.value)}
              placeholder="0" className="border border-gray-300 rounded-md px-3 py-2 text-sm w-20" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Treatment</label>
            <input type="number" value={formTreatment} onChange={(e) => setFormTreatment(e.target.value)}
              placeholder="0" className="border border-gray-300 rounded-md px-3 py-2 text-sm w-20" />
          </div>
          <button onClick={handleSave} disabled={saving || !formDate}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50">
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Spend chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Daily Spend</h3>
        <div style={{ height: 250 }}>
          <Bar data={spendChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }} />
        </div>
      </div>

      {/* Funnel chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Funnel Progression</h3>
        <div style={{ height: 250 }}>
          <Line data={funnelChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' } }, scales: { y: { beginAtZero: true } } }} />
        </div>
      </div>

      {/* Data table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-3 py-2 font-medium">Date</th>
              <th className="px-3 py-2 font-medium text-right">Spend</th>
              <th className="px-3 py-2 font-medium text-right">Impr</th>
              <th className="px-3 py-2 font-medium text-right">Clicks</th>
              <th className="px-3 py-2 font-medium text-right">Submit</th>
              <th className="px-3 py-2 font-medium text-right">Started</th>
              <th className="px-3 py-2 font-medium text-right">Finished</th>
              <th className="px-3 py-2 font-medium text-right">Treatment</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => {
              const d = new Date(e.date + 'T12:00:00');
              return (
                <tr key={e.date} onClick={() => handleRowClick(e)} className="cursor-pointer hover:bg-blue-50">
                  <td className="px-3 py-2 border-t border-gray-100">{d.getMonth() + 1}/{d.getDate()}</td>
                  <td className="px-3 py-2 border-t border-gray-100 text-right">${e.spend.toFixed(2)}</td>
                  <td className="px-3 py-2 border-t border-gray-100 text-right">{e.impressions.toLocaleString()}</td>
                  <td className="px-3 py-2 border-t border-gray-100 text-right">{e.clicks}</td>
                  <td className="px-3 py-2 border-t border-gray-100 text-right">{e.submit}</td>
                  <td className="px-3 py-2 border-t border-gray-100 text-right">{e.started}</td>
                  <td className="px-3 py-2 border-t border-gray-100 text-right">{e.finished}</td>
                  <td className="px-3 py-2 border-t border-gray-100 text-right">{e.treatment}</td>
                </tr>
              );
            })}
            {entries.length > 0 && (
              <tr className="bg-gray-50 font-medium">
                <td className="px-3 py-2 border-t border-gray-200">Total</td>
                <td className="px-3 py-2 border-t border-gray-200 text-right">${totalSpend.toFixed(2)}</td>
                <td className="px-3 py-2 border-t border-gray-200 text-right">{totalImpressions.toLocaleString()}</td>
                <td className="px-3 py-2 border-t border-gray-200 text-right">{totalClicks}</td>
                <td className="px-3 py-2 border-t border-gray-200 text-right">{totalSubmit}</td>
                <td className="px-3 py-2 border-t border-gray-200 text-right">{totalStarted}</td>
                <td className="px-3 py-2 border-t border-gray-200 text-right">{totalFinished}</td>
                <td className="px-3 py-2 border-t border-gray-200 text-right">{totalTreatment}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
