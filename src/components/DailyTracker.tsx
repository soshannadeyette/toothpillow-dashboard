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
import { Bar, Chart } from 'react-chartjs-2';
import { fetchSubmissions, upsertSubmission, fetchAnnualSummaries, currentYear, currentMonth } from '@/lib/api';
import type { DailySubmission, MonthlySummary } from '@/lib/types';
import { MONTHLY_GOALS_2026, MONTH_NAMES } from '@/lib/types';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler);

/* ── 2025 historical monthly totals ── */
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

/* ── OKR Objectives & Key Results ── */
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

/* ── Shared styles ── */
const card = 'bg-white p-5';
const cardShadow = { borderRadius: 12, boxShadow: '0 4px 15px rgba(0,0,0,0.08)' };

export default function DailyTracker() {
  const [entries, setEntries] = useState<DailySubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState(currentYear());
  const [selectedMonth, setSelectedMonth] = useState(currentMonth());

  // Annual summaries for the YOY chart
  const [annualSummaries, setAnnualSummaries] = useState<MonthlySummary[]>([]);

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

  // Fetch 2026 annual summaries for the YOY chart
  useEffect(() => {
    fetchAnnualSummaries(2026)
      .then((data) => setAnnualSummaries(data))
      .catch(() => {}); // silent fail
  }, []);

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
  const convRate = totalVisitors > 0 ? ((totalSubmissions / totalVisitors) * 100).toFixed(1) : '0';

  // Days remaining in month
  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const daysRemaining = daysInMonth - daysTracked;
  const gap = goal - totalSubmissions;
  const neededPerDay = daysRemaining > 0 ? Math.ceil(gap / daysRemaining) : 0;

  // "Should Be At"
  const shouldBeAt = Math.round(goal / daysInMonth * daysTracked);
  const aheadBehind = totalSubmissions - shouldBeAt;

  // Projected End-of-Month
  const projectedEOM = daysTracked > 0 ? Math.round((totalSubmissions / daysTracked) * daysInMonth) : 0;
  const projectedPctOfGoal = goal > 0 ? ((projectedEOM / goal) * 100).toFixed(1) : '0';

  // Income projections
  const projectedIncome = daysTracked > 0 ? Math.round((totalIncome / daysTracked) * daysInMonth) : 0;

  // Progress bar percentages
  const progressPct = goal > 0 ? Math.min((totalSubmissions / goal) * 100, 100) : 0;
  const pacePct = goal > 0 ? Math.min((shouldBeAt / goal) * 100, 100) : 0;

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
        backgroundColor: '#3A6EA4',
        stack: 'stack',
      },
      {
        label: 'Hybrid',
        data: entries.map((e) => e.hybrid),
        backgroundColor: '#FDBE67',
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

  /* ── YOY Chart Data ── */
  const yoyLabels = MONTH_NAMES.slice(1).map((n) => n.slice(0, 3));

  const actual2026ByMonth: Record<number, number> = {};
  annualSummaries.forEach((s) => {
    actual2026ByMonth[s.month] = s.total_submissions;
  });
  if (selectedYear === 2026 && totalSubmissions > 0) {
    actual2026ByMonth[selectedMonth] = totalSubmissions;
  }

  // Projected values for the current month (daily avg Ã days in month)
  const projected2026ByMonth: Record<number, number> = {};
  if (selectedYear === 2026 && daysTracked > 0) {
    projected2026ByMonth[selectedMonth] = projectedEOM;
  }

  // Totals for subtitle
  const total2025 = Object.values(HIST_2025).reduce((s, v) => s + v.total, 0);
  const total2026SoFar = Object.values(actual2026ByMonth).reduce((s, v) => s + v, 0);

  // Goal remaining per month (stacked on top of actual)
  const goalRemaining2026 = Array.from({ length: 12 }, (_, i) => {
    const m = i + 1;
    const actual = actual2026ByMonth[m] ?? 0;
    const goalVal = MONTHLY_GOALS_2026[i]?.total ?? 0;
    return actual > 0 ? Math.max(0, goalVal - actual) : goalVal;
  });

  const yoyChartData = {
    labels: yoyLabels,
    datasets: [
      {
        label: '2025 Actual',
        data: Array.from({ length: 12 }, (_, i) => HIST_2025[i + 1]?.total ?? 0),
        backgroundColor: '#C9A0DC',
        borderRadius: 3,
        stack: 'stack2025',
      },
      {
        label: '2026 Actual',
        data: Array.from({ length: 12 }, (_, i) => actual2026ByMonth[i + 1] ?? 0),
        backgroundColor: '#3A6EA4',
        borderRadius: 3,
        stack: 'stack2026',
      },
      {
        label: 'Goal Remaining',
        data: goalRemaining2026,
        backgroundColor: 'rgba(58, 110, 164, 0.18)',
        borderRadius: 3,
        stack: 'stack2026',
      },
    ],
  };

  // Custom plugin: data labels on bars
  const barLabelPlugin = {
    id: 'barLabels',
    afterDatasetsDraw(chart: any) {
      const { ctx } = chart;
      chart.data.datasets.forEach((dataset: any, dsIdx: number) => {
        const meta = chart.getDatasetMeta(dsIdx);
        if (!meta.visible) return;
        meta.data.forEach((bar: any, idx: number) => {
          const value = dataset.data[idx];
          if (!value || value === 0) return;
          ctx.save();
          ctx.fillStyle = dsIdx === 2 ? '#999' : '#444';
          ctx.font = 'bold 10px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const label = value >= 1000 ? value.toLocaleString() : String(value);
          const barHeight = bar.height ?? (bar.base - bar.y);
          if (barHeight > 14) {
            ctx.fillText(label, bar.x, bar.y + barHeight / 2);
          }
          ctx.restore();
        });
      });
    },
  };

  const yoyChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const },
      tooltip: {
        callbacks: {
          label: (ctx: { dataset: { label?: string }; parsed: { y: number | null } }) => {
            const val = ctx.parsed.y;
            return `${ctx.dataset.label}: ${val != null ? val.toLocaleString() : '0'}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (val: string | number) => {
            const n = typeof val === 'string' ? parseFloat(val) : val;
            return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
          },
        },
      },
    },
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Month selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
          style={{ border: '1px solid #ccc', borderRadius: 8, padding: '10px 14px', fontSize: 14 }}
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
          style={{ border: '1px solid #ccc', borderRadius: 8, padding: '10px 14px', fontSize: 14 }}
        >
          <option value={2025}>2025</option>
          <option value={2026}>2026</option>
        </select>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '12px 16px', borderRadius: 8, fontSize: 14 }}>
          {error}
        </div>
      )}

      {/* Goal banner */}
      <div style={{ backgroundColor: '#1B2A4A', color: '#FFFFFF', padding: 15, borderRadius: 12, textAlign: 'center', fontWeight: 600 }}>
        <div style={{ fontSize: 16, marginBottom: 4 }}>
          {MONTH_NAMES[selectedMonth]} {selectedYear} Goal
        </div>
        <div style={{ fontSize: 28, fontWeight: 'bold' }}>
          {goal.toLocaleString()} Submissions
        </div>
      </div>

      {/* Stat cards — responsive grid matching HTML dashboard */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 30 }}>
        {/* 1. Month-to-Date */}
        <div className={card} style={cardShadow}>
          <div style={{ fontSize: '0.85em', color: '#999', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Month-to-Date</div>
          <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#333', marginBottom: 5 }}>{totalSubmissions.toLocaleString()}</div>
          <div style={{ fontSize: '0.9em', color: '#666' }}>Total Submissions</div>
          <div style={{ fontSize: '0.75em', color: '#666', marginTop: 3 }}>{totalOnline} online, {totalHybrid} hybrid, {totalPrime} prime</div>
        </div>

        {/* 2. Should Be At */}
        <div className={card} style={cardShadow}>
          <div style={{ fontSize: '0.85em', color: '#999', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Should Be At (Day {daysTracked})</div>
          <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#FDBE67', marginBottom: 5 }}>{shouldBeAt.toLocaleString()}</div>
          <div style={{ fontSize: '0.9em', color: '#666' }}>Target for End of Today</div>
        </div>

        {/* 3. Ahead / Behind */}
        <div className={card} style={cardShadow}>
          <div style={{ fontSize: '0.85em', color: '#999', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Ahead / Behind</div>
          <div style={{ fontSize: '2em', fontWeight: 'bold', color: aheadBehind >= 0 ? '#8CD1C8' : '#DD5759', marginBottom: 5 }}>
            {aheadBehind >= 0 ? `+${aheadBehind.toLocaleString()}` : aheadBehind.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.9em', color: '#666' }}>{aheadBehind >= 0 ? 'Ahead of Target' : 'Behind Target'}</div>
        </div>

        {/* 4. Daily Target Needed */}
        <div className={card} style={cardShadow}>
          <div style={{ fontSize: '0.85em', color: '#999', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Daily Target Needed</div>
          <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#FDBE67', marginBottom: 5 }}>{daysRemaining > 0 ? neededPerDay : '--'}</div>
          <div style={{ fontSize: '0.9em', color: '#666' }}>Per Day to Hit Goal</div>
        </div>

        {/* 5. Projected End-of-Month */}
        <div className={card} style={cardShadow}>
          <div style={{ fontSize: '0.85em', color: '#999', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Projected End-of-Month</div>
          <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#B26CA6', marginBottom: 5 }}>
            {daysTracked > 0 ? projectedEOM.toLocaleString() : '--'}
          </div>
          <div style={{ fontSize: '0.9em', color: '#666' }}>At Current Pace</div>
        </div>

        {/* 6. Will Hit */}
        <div className={card} style={cardShadow}>
          <div style={{ fontSize: '0.85em', color: '#999', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Will Hit</div>
          <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#B26CA6', marginBottom: 5 }}>
            {daysTracked > 0 ? `${Math.round(parseFloat(projectedPctOfGoal))}%` : '--'}
          </div>
          <div style={{ fontSize: '0.9em', color: '#666' }}>Of {goal.toLocaleString()} Goal</div>
        </div>
      </div>

      {/* Progress bar with pace marker */}
      <div style={{ background: 'white', borderRadius: 15, padding: 30, marginBottom: 20, boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13, color: '#666' }}>
          <span>Progress to Goal</span>
          <span>{totalSubmissions.toLocaleString()} / {goal.toLocaleString()}</span>
        </div>
        <div style={{ position: 'relative', height: 25, backgroundColor: '#e0e0e0', borderRadius: 12, overflow: 'visible' }}>
          {/* Gradient fill */}
          <div
            className="tp-progress-fill"
            style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${progressPct}%`, transition: 'width 0.3s' }}
          />
          {/* Orange pace marker */}
          <div style={{ position: 'absolute', top: 0, height: '100%', width: 2, backgroundColor: '#FF9800', left: `${pacePct}%`, zIndex: 10, transition: 'left 0.3s' }}>
            <div style={{ position: 'absolute', top: -20, left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap', fontSize: 11, color: '#FF9800', fontWeight: 500 }}>Pace</div>
            <div style={{ position: 'absolute', bottom: -20, left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap', fontSize: 11, color: '#FF9800' }}>{shouldBeAt.toLocaleString()}</div>
          </div>
          {/* Percentage label */}
          {progressPct > 8 && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 500, color: '#fff', zIndex: 10 }}>
              {progressPct.toFixed(1)}%
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 24, fontSize: 12, color: '#999' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: 2, background: 'linear-gradient(to right, #3A6EA4, #FDBE67)' }} />
            Current Progress
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ display: 'inline-block', width: 12, height: 2, backgroundColor: '#FF9800' }} />
            Expected Pace (Day {daysTracked}/{daysInMonth})
          </span>
        </div>
      </div>

      {/* Entry form */}
      <div className={card} style={cardShadow}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: '#1B2A4A', marginBottom: 12 }}>Add / Update Entry</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end' }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#999', marginBottom: 4 }}>Date</label>
            <input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)}
              style={{ border: '1px solid #ccc', borderRadius: 8, padding: '10px 12px', fontSize: 14, width: 160 }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#999', marginBottom: 4 }}>Online</label>
            <input type="number" value={formOnline} onChange={(e) => setFormOnline(e.target.value)} placeholder="0"
              style={{ border: '1px solid #ccc', borderRadius: 8, padding: '10px 12px', fontSize: 14, width: 80 }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#999', marginBottom: 4 }}>Hybrid</label>
            <input type="number" value={formHybrid} onChange={(e) => setFormHybrid(e.target.value)} placeholder="0"
              style={{ border: '1px solid #ccc', borderRadius: 8, padding: '10px 12px', fontSize: 14, width: 80 }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#999', marginBottom: 4 }}>Prime</label>
            <input type="number" value={formPrime} onChange={(e) => setFormPrime(e.target.value)} placeholder="0"
              style={{ border: '1px solid #ccc', borderRadius: 8, padding: '10px 12px', fontSize: 14, width: 80 }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#999', marginBottom: 4 }}>Visitors</label>
            <input type="number" value={formVisitors} onChange={(e) => setFormVisitors(e.target.value)} placeholder="0"
              style={{ border: '1px solid #ccc', borderRadius: 8, padding: '10px 12px', fontSize: 14, width: 96 }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#999', marginBottom: 4 }}>Income ($)</label>
            <input type="number" value={formIncome} onChange={(e) => setFormIncome(e.target.value)} placeholder="auto"
              style={{ border: '1px solid #ccc', borderRadius: 8, padding: '10px 12px', fontSize: 14, width: 96 }} />
          </div>
          <button onClick={handleSave} disabled={saving || !formDate}
            style={{ padding: '12px 25px', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', backgroundColor: '#1B2A4A', color: '#FFFFFF', opacity: saving || !formDate ? 0.5 : 1 }}>
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className={card} style={cardShadow}>
        <h3 className="tp-section-header" style={{ fontSize: 16 }}>
          {MONTH_NAMES[selectedMonth]} {selectedYear} - Daily Submissions
        </h3>
        <div style={{ height: 300 }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999' }}>Loading chart...</div>
          ) : entries.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999' }}>No data for this month</div>
          ) : (
            <Bar data={chartData} options={chartOptions} />
          )}
        </div>
      </div>

      {/* Sub-totals by type + Conversion */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
        <div className={card} style={{ ...cardShadow, textAlign: 'center', borderLeft: '4px solid #3A6EA4' }}>
          <div style={{ fontSize: 24, fontWeight: 'bold', color: '#3A6EA4' }}>{totalOnline.toLocaleString()}</div>
          <div style={{ fontSize: 13, color: '#999' }}>Online</div>
        </div>
        <div className={card} style={{ ...cardShadow, textAlign: 'center', borderLeft: '4px solid #FDBE67' }}>
          <div style={{ fontSize: 24, fontWeight: 'bold', color: '#d97706' }}>{totalHybrid.toLocaleString()}</div>
          <div style={{ fontSize: 13, color: '#999' }}>Hybrid</div>
        </div>
        <div className={card} style={{ ...cardShadow, textAlign: 'center', borderLeft: '4px solid #dc2626' }}>
          <div style={{ fontSize: 24, fontWeight: 'bold', color: '#dc2626' }}>{totalPrime.toLocaleString()}</div>
          <div style={{ fontSize: 13, color: '#999' }}>Prime</div>
        </div>
        <div className={card} style={{ ...cardShadow, textAlign: 'center', borderLeft: '4px solid #3A6EA4' }}>
          <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1B2A4A' }}>{convRate}%</div>
          <div style={{ fontSize: 13, color: '#999' }}>Conversion ({totalVisitors.toLocaleString()} visitors)</div>
        </div>
      </div>

      {/* Income section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
        <div className={card} style={{ ...cardShadow, borderLeft: '4px solid #4CAF50' }}>
          <div style={{ fontSize: 13, color: '#999', marginBottom: 4 }}>Income Earned</div>
          <div style={{ fontSize: 28, fontWeight: 'bold', color: '#4CAF50' }}>
            ${totalIncome.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
          <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
            ${daysTracked > 0 ? (totalIncome / daysTracked).toFixed(0) : '0'}/day avg
          </div>
        </div>
        <div className={card} style={{ ...cardShadow, borderLeft: '4px solid #4CAF50' }}>
          <div style={{ fontSize: 13, color: '#999', marginBottom: 4 }}>Projected Income</div>
          <div style={{ fontSize: 28, fontWeight: 'bold', color: '#4CAF50' }}>
            {daysTracked > 0 ? `$${projectedIncome.toLocaleString()}` : '--'}
          </div>
          <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
            Based on {daysTracked} day{daysTracked !== 1 ? 's' : ''} tracked
          </div>
        </div>
      </div>

      {/* Data table */}
      <div className="tp-table" ref={tableRef} style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
          <thead style={{ backgroundColor: '#f5f5f5' }}>
            <tr>
              <th style={{ padding: '15px', textAlign: 'left', fontWeight: 600, color: '#1B2A4A', fontSize: 13, borderBottom: '1px solid #e0e0e0' }}>Date</th>
              <th style={{ padding: '15px', textAlign: 'right', fontWeight: 600, color: '#1B2A4A', fontSize: 13, borderBottom: '1px solid #e0e0e0' }}>Online</th>
              <th style={{ padding: '15px', textAlign: 'right', fontWeight: 600, color: '#1B2A4A', fontSize: 13, borderBottom: '1px solid #e0e0e0' }}>Hybrid</th>
              <th style={{ padding: '15px', textAlign: 'right', fontWeight: 600, color: '#1B2A4A', fontSize: 13, borderBottom: '1px solid #e0e0e0' }}>Prime</th>
              <th style={{ padding: '15px', textAlign: 'right', fontWeight: 600, color: '#1B2A4A', fontSize: 13, borderBottom: '1px solid #e0e0e0' }}>Total</th>
              <th style={{ padding: '15px', textAlign: 'right', fontWeight: 600, color: '#1B2A4A', fontSize: 13, borderBottom: '1px solid #e0e0e0' }}>Visitors</th>
              <th style={{ padding: '15px', textAlign: 'right', fontWeight: 600, color: '#1B2A4A', fontSize: 13, borderBottom: '1px solid #e0e0e0' }}>Income</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ padding: '32px 15px', textAlign: 'center', color: '#999' }}>Loading...</td></tr>
            ) : entries.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: '32px 15px', textAlign: 'center', color: '#999' }}>No entries yet</td></tr>
            ) : (
              entries.map((e) => {
                const total = e.total ?? e.online + e.hybrid + e.prime;
                const d = new Date(e.date + 'T12:00:00');
                const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
                return (
                  <tr key={e.date} onClick={() => handleRowClick(e)} style={{ cursor: 'pointer' }}
                    onMouseEnter={(ev) => ev.currentTarget.style.backgroundColor = '#f9f9f9'}
                    onMouseLeave={(ev) => ev.currentTarget.style.backgroundColor = 'transparent'}>
                    <td style={{ padding: '12px 15px', borderBottom: '1px solid #e0e0e0', fontSize: 13 }}>{dayName} {d.getMonth() + 1}/{d.getDate()}</td>
                    <td style={{ padding: '12px 15px', borderBottom: '1px solid #e0e0e0', fontSize: 13, textAlign: 'right', color: '#3A6EA4' }}>{e.online}</td>
                    <td style={{ padding: '12px 15px', borderBottom: '1px solid #e0e0e0', fontSize: 13, textAlign: 'right', color: '#d97706' }}>{e.hybrid}</td>
                    <td style={{ padding: '12px 15px', borderBottom: '1px solid #e0e0e0', fontSize: 13, textAlign: 'right', color: '#dc2626' }}>{e.prime}</td>
                    <td style={{ padding: '12px 15px', borderBottom: '1px solid #e0e0e0', fontSize: 13, textAlign: 'right', fontWeight: 600 }}>{total}</td>
                    <td style={{ padding: '12px 15px', borderBottom: '1px solid #e0e0e0', fontSize: 13, textAlign: 'right' }}>{e.visitors.toLocaleString()}</td>
                    <td style={{ padding: '12px 15px', borderBottom: '1px solid #e0e0e0', fontSize: 13, textAlign: 'right' }}>${e.income}</td>
                  </tr>
                );
              })
            )}
            {entries.length > 0 && (
              <tr style={{ backgroundColor: '#f5f5f5', fontWeight: 600 }}>
                <td style={{ padding: '12px 15px', borderTop: '2px solid #e0e0e0', fontSize: 13 }}>Total</td>
                <td style={{ padding: '12px 15px', borderTop: '2px solid #e0e0e0', fontSize: 13, textAlign: 'right', color: '#3A6EA4' }}>{totalOnline}</td>
                <td style={{ padding: '12px 15px', borderTop: '2px solid #e0e0e0', fontSize: 13, textAlign: 'right', color: '#d97706' }}>{totalHybrid}</td>
                <td style={{ padding: '12px 15px', borderTop: '2px solid #e0e0e0', fontSize: 13, textAlign: 'right', color: '#dc2626' }}>{totalPrime}</td>
                <td style={{ padding: '12px 15px', borderTop: '2px solid #e0e0e0', fontSize: 13, textAlign: 'right' }}>{totalSubmissions}</td>
                <td style={{ padding: '12px 15px', borderTop: '2px solid #e0e0e0', fontSize: 13, textAlign: 'right' }}>{totalVisitors.toLocaleString()}</td>
                <td style={{ padding: '12px 15px', borderTop: '2px solid #e0e0e0', fontSize: 13, textAlign: 'right' }}>${totalIncome}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/*  Monthly Enrollments — 2025 vs. 2026                        */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div className={card} style={cardShadow}>
        <h3 className="tp-section-header" style={{ fontSize: 16 }}>
          Monthly Enrollments — 2025 vs. 2026
        </h3>
        <div style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>
          2025: {total2025.toLocaleString()} | 2026 so far: {total2026SoFar.toLocaleString()}
        </div>
        <div style={{ height: 360 }}>
          <Bar data={yoyChartData} options={yoyChartOptions} plugins={[barLabelPlugin]} />
        </div>
        {/* Summary table */}
        <div className="tp-table" style={{ marginTop: 16 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'center' }}>
            <thead style={{ backgroundColor: '#f5f5f5' }}>
              <tr>
                <th style={{ padding: '12px 10px', textAlign: 'left', fontWeight: 600, color: '#1B2A4A', fontSize: 12, textTransform: 'uppercase' }}>Month</th>
                <th style={{ padding: '12px 10px', fontWeight: 600, color: '#1B2A4A', fontSize: 12, textTransform: 'uppercase' }}>2025</th>
                <th style={{ padding: '12px 10px', fontWeight: 600, color: '#1B2A4A', fontSize: 12, textTransform: 'uppercase' }}>2026</th>
                <th style={{ padding: '12px 10px', fontWeight: 600, color: '#1B2A4A', fontSize: 12, textTransform: 'uppercase' }}>Goal</th>
                <th style={{ padding: '12px 10px', fontWeight: 600, color: '#1B2A4A', fontSize: 12, textTransform: 'uppercase' }}>YOY Change</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 12 }, (_, i) => {
                const m = i + 1;
                const h = HIST_2025[m]?.total ?? 0;
                const a = actual2026ByMonth[m] ?? 0;
                                const g = MONTHLY_GOALS_2026[i]?.total ?? 0;
                const yoyPct = h > 0 && a > 0 ? (((a - h) / h) * 100).toFixed(1) : null;
                return (
                  <tr key={m} style={{ borderBottom: '1px solid #e0e0e0' }}
                    onMouseEnter={(ev) => ev.currentTarget.style.backgroundColor = '#f9f9f9'}
                    onMouseLeave={(ev) => ev.currentTarget.style.backgroundColor = 'transparent'}>
                    <td style={{ padding: '10px', textAlign: 'left', color: '#1B2A4A', fontWeight: 600 }}>{MONTH_NAMES[m].slice(0, 3)}</td>
                    <td style={{ padding: '10px', color: '#666' }}>{h.toLocaleString()}</td>
                    <td style={{ padding: '10px', color: '#3A6EA4', fontWeight: 600 }}>{a > 0 ? a.toLocaleString() : '—'}</td>
                    <td style={{ padding: '10px', color: '#dc2626' }}>{g.toLocaleString()}</td>
                    <td style={{ padding: '10px', fontWeight: 600, color: yoyPct !== null && parseFloat(yoyPct) >= 0 ? '#4CAF50' : '#dc2626' }}>
                      {yoyPct !== null ? `${parseFloat(yoyPct) >= 0 ? '+' : ''}${yoyPct}%` : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/*  OKR: Objectives & Key Results                            */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <h3 className="tp-section-header" style={{ fontSize: 16 }}>
          Objectives &amp; Key Results
        </h3>
        {OKR_OBJECTIVES.map((obj, idx) => (
          <div key={idx} className="tp-table" style={{ overflow: 'hidden' }}>
            {/* Colored header bar */}
            <div style={{ padding: '12px 16px', color: '#fff', fontWeight: 600, fontSize: 14, backgroundColor: obj.color }}>
              {obj.title}
            </div>
            {/* Key result table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
              <thead style={{ backgroundColor: '#f5f5f5' }}>
                <tr>
                  <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, color: '#1B2A4A', fontSize: 12, textTransform: 'uppercase', borderBottom: '1px solid #e0e0e0' }}>Key Result</th>
                  <th style={{ textAlign: 'left', padding: '12x 16px', fontWeight: 600, color: '#1B2A4A', fontSize: 12, textTransform: 'uppercase', borderBottom: '1px solid #e0e0e0' }}>Baseline</th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, color: '#1B2A4A', fontSize: 12, textTransform: 'uppercase', borderBottom: '1px solid #e0e0e0' }}>Target</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#333' }}>{obj.keyResult}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#666' }}>{obj.baseline}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#1B2A4A', fontWeight: 600 }}>{obj.target}</td>
                </tr>
                <tr>
                  <td colSpan={3} style={{ padding: '12px 16px', fontSize: 13, color: '#666', borderTop: '1px solid #e0e0e0', lineHeight: 1.6 }}>
                    <span style={{ fontWeight: 600, color: '#1B2A4A' }}>Current work:</span> {obj.activities}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}
