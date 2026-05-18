'use client';

import { useEffect, useState, useMemo } from 'react';
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
import { fetchAnnualSummaries, fetchSubmissions, currentMonth, currentYear } from '@/lib/api';
import type { MonthlySummary, DailySubmission } from '@/lib/types';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler);

const TP = {
  blue: '#3A6EA4', skyBlue: '#B6CAE3', lightBlue: '#D6E5F7', cream: '#FEF8EE',
  green: '#8CD1C8', yellow: '#FDBE67', peach: '#FBCCC5', red: '#DD5759',
  darkPurple: '#B26CA6', lightPurple: '#DDBBD9', bubblegum: '#F6AACB',
  maroon: '#D46476', text: '#333333', navy: '#1B2A4A',
};

// ---- HARDCODED DATA ----

const TRAFFIC_2025: Record<number, number> = {
  1: 57814, 2: 58901, 3: 57747, 4: 33895, 5: 31621, 6: 31681,
  7: 73193, 8: 37180, 9: 29179, 10: 28271, 11: 54674, 12: 36031,
};

const SUBS_2025: Record<number, number> = {
  1: 1434, 2: 1560, 3: 1510, 4: 1663, 5: 1328, 6: 1039,
  7: 2588, 8: 2478, 9: 1550, 10: 1475, 11: 1591, 12: 1226,
};

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Weekend funnel (May 16-17, 2026) — Salesforce stages
const WEEKEND_FUNNEL = [
  { stage: 'New (Parent Created)', count: 87 },
  { stage: 'WAITING - Needs Info', count: 60 },
  { stage: 'Sent to TxP', count: 16 },
  { stage: 'Sent Checkout Link', count: 7 },
  { stage: 'Dr Ben Approved', count: 6 },
  { stage: 'TxP Approved', count: 2 },
  { stage: 'New (Child)', count: 1 },
];

// The 60 patients stuck at WAITING - Needs info
interface IncompletePatient {
  name: string;
  referrer: string;
}

const INCOMPLETE_ASSESSMENTS: IncompletePatient[] = [
  { name: 'Jackson Coyne', referrer: 'Facebook' },
  { name: 'Forrest Dow', referrer: 'Lauren' },
  { name: 'Aleia Rodriguez', referrer: '' },
  { name: 'Rowan Wagner', referrer: 'Alex Clark' },
  { name: 'Savannah Wilson', referrer: '' },
  { name: 'Natalie Stedman', referrer: 'Podcast' },
  { name: 'Hudson Underhill', referrer: 'Google Ads' },
  { name: 'Isabella Herrera', referrer: '' },
  { name: 'Dakota Enright', referrer: 'Carly Hartwig' },
  { name: 'Rylee Buckwalter', referrer: 'Toothpillow Instagram' },
  { name: 'Weston Johnson', referrer: 'Jeff Cruz / Talia_likeitis' },
  { name: 'Strider Dorton-Caudill', referrer: 'Dr. Julia Dobson' },
  { name: 'Asher Larson', referrer: '' },
  { name: 'Ezekiel Ostrander', referrer: 'Emily Boazman' },
  { name: 'Isabella Salcido', referrer: 'TikTok' },
  { name: 'Noah Flitcroft', referrer: 'Emily Boazman' },
  { name: 'Grey Cornelius', referrer: 'Emily Boazman' },
  { name: 'Trace Tillman', referrer: '' },
  { name: 'Aria Bates', referrer: 'Soshanna Salsman' },
  { name: 'Angelo Ruggeri', referrer: 'Alex Clark' },
  { name: 'Ayla Kenney', referrer: 'Emily Boazman' },
  { name: 'Micah Velazquez', referrer: 'Emily Boazman' },
  { name: 'Olivia Alvarado', referrer: 'Airway' },
  { name: 'Annie Smith', referrer: 'Emily Boazman' },
  { name: 'Maguire Bausch', referrer: 'Emily Boazman' },
  { name: 'Elsie Bardadin', referrer: 'Emily Boazman' },
  { name: 'Alec Vazquez', referrer: 'Emily Boazman' },
  { name: 'Barrett Smith', referrer: 'Emily Boazman' },
  { name: 'Maren Kirby', referrer: '' },
  { name: 'Gabriel Wolfe', referrer: '' },
  { name: 'Sadie Frederick', referrer: '' },
  { name: 'Danielle Wright', referrer: 'Google Search' },
  { name: 'Jude Pierce', referrer: '' },
  { name: 'Avery Collins', referrer: 'Emily Boazman' },
  { name: 'Ezra Rhoad', referrer: 'Emily Boazman' },
  { name: 'Van Baker', referrer: '' },
  { name: 'Hudson Oglesbee', referrer: 'Emily Boazman' },
  { name: 'Olive Trevino', referrer: 'Emily Boazman' },
  { name: 'Braden Bailey', referrer: 'Jessi' },
  { name: 'Atley Vick', referrer: 'Emily Boazman' },
  { name: 'Caleb Thomas', referrer: '' },
  { name: 'Alora Glass', referrer: 'Emily Boazman' },
  { name: 'Ray Alexander Salazar', referrer: 'Emily Boazman' },
  { name: 'Quintin Quiroga', referrer: '' },
  { name: 'Zaylee Williams', referrer: 'Emily Boazman' },
  { name: 'Ibrahim Pecsek', referrer: 'TikTok' },
  { name: 'Georgia Turner', referrer: 'Justingredients' },
  { name: 'Tinsley Asby', referrer: 'Emily Boazman' },
  { name: 'Grace Nihot', referrer: 'Maurissa' },
  { name: 'Massimo Wile', referrer: 'Internet' },
  { name: 'Jaxon Greene', referrer: '' },
  { name: 'Scout Rietveld', referrer: 'Erin Holmberg' },
  { name: 'Makaio Moreno', referrer: 'Emily Boazman' },
  { name: 'Erik Grove', referrer: '1000 Hours' },
  { name: 'Taylor Ausen', referrer: 'Emily Boazman' },
  { name: 'AJ Cornett', referrer: 'Emily Boazman' },
  { name: 'Mabel Huffman', referrer: '' },
  { name: 'Hank Smith', referrer: 'Emily Boazman' },
  { name: 'Andy Sloan', referrer: 'Emily Boazman' },
  { name: 'Henry Erickson', referrer: 'Ashley Post' },
];

export default function AVBottleneck() {
  const [months2026, setMonths2026] = useState<MonthlySummary[]>([]);
  const [curMonthSubs, setCurMonthSubs] = useState<DailySubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [annual, daily] = await Promise.all([
          fetchAnnualSummaries(2026),
          fetchSubmissions(currentYear(), currentMonth()),
        ]);
        setMonths2026(annual);
        setCurMonthSubs(daily);
      } catch (e) { console.error('AVBottleneck load error:', e); }
      finally { setLoading(false); }
    })();
  }, []);

  const { traffic2026, subs2026 } = useMemo(() => {
    const t: Record<number, number> = {};
    const s: Record<number, number> = {};
    months2026.forEach(m => { t[m.month] = m.total_visitors; s[m.month] = m.total_submissions; });
    const cm = currentMonth();
    if (!s[cm] && curMonthSubs.length > 0) {
      s[cm] = curMonthSubs.reduce((sum, d) => sum + (d.online || 0) + (d.hybrid || 0) + (d.prime || 0), 0);
      t[cm] = curMonthSubs.reduce((sum, d) => sum + (d.visitors || 0), 0);
    }
    return { traffic2026: t, subs2026: s };
  }, [months2026, curMonthSubs]);

  // Referrer grouping for the 60 incomplete
  const referrerGroups = useMemo(() => {
    const counts: Record<string, number> = {};
    INCOMPLETE_ASSESSMENTS.forEach(p => {
      let ref = p.referrer || 'No referrer listed';
      // Normalize Emily variations
      if (ref.toLowerCase().includes('emily bo')) ref = 'Emily Boazman';
      if (ref.toLowerCase() === 'alexclark') ref = 'Alex Clark';
      counts[ref] = (counts[ref] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, []);

  if (loading) return <div className="text-center py-12 text-gray-500">Loading...</div>;

  // ---- ANALYSIS: Same-month comparison (apples to apples) ----
  const monthsWithBoth = MONTH_LABELS
    .map((_, i) => i + 1)
    .filter(m => TRAFFIC_2025[m] > 0 && (traffic2026[m] || 0) > 0);

  const comparisonRows = monthsWithBoth.map(m => {
    const t25 = TRAFFIC_2025[m];
    const t26 = traffic2026[m] || 0;
    const s25 = SUBS_2025[m];
    const s26 = subs2026[m] || 0;
    const tDiff = t26 - t25;
    const tPct = t25 > 0 ? (tDiff / t25 * 100) : 0;
    const sDiff = s26 - s25;
    const sPct = s25 > 0 ? (sDiff / s25 * 100) : 0;
    const conv25 = t25 > 0 ? (s25 / t25 * 100) : 0;
    const conv26 = t26 > 0 ? (s26 / t26 * 100) : 0;
    return { month: m, label: MONTH_LABELS[m - 1], t25, t26, tDiff, tPct, s25, s26, sDiff, sPct, conv25, conv26 };
  });

  // Totals for months with both years of data
  const totalT25 = comparisonRows.reduce((s, r) => s + r.t25, 0);
  const totalT26 = comparisonRows.reduce((s, r) => s + r.t26, 0);
  const totalS25 = comparisonRows.reduce((s, r) => s + r.s25, 0);
  const totalS26 = comparisonRows.reduce((s, r) => s + r.s26, 0);
  const trafficChange = totalT25 > 0 ? ((totalT26 - totalT25) / totalT25 * 100) : 0;
  const subsChange = totalS25 > 0 ? ((totalS26 - totalS25) / totalS25 * 100) : 0;

  // ---- CHART: Side-by-side traffic ----
  const compLabels = comparisonRows.map(r => r.label);
  const trafficCompData = {
    labels: compLabels,
    datasets: [
      { label: '2025 Traffic', data: comparisonRows.map(r => r.t25), backgroundColor: TP.skyBlue, borderColor: TP.blue, borderWidth: 1 },
      { label: '2026 Traffic', data: comparisonRows.map(r => r.t26), backgroundColor: TP.green + '90', borderColor: '#5BB5A6', borderWidth: 1 },
    ],
  };

  // ---- CHART: Submissions comparison ----
  const subsCompData = {
    labels: compLabels,
    datasets: [
      { label: '2025 Submissions', data: comparisonRows.map(r => r.s25), backgroundColor: TP.skyBlue, borderColor: TP.blue, borderWidth: 1 },
      { label: '2026 Submissions', data: comparisonRows.map(r => r.s26), backgroundColor: TP.green + '90', borderColor: '#5BB5A6', borderWidth: 1 },
    ],
  };

  const barOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' as const, labels: { padding: 12, usePointStyle: true, font: { size: 11 } } } },
    scales: { y: { beginAtZero: true, ticks: { callback: (v: number | string) => Number(v).toLocaleString() } } },
  };

  // ---- CHART: Conversion rate ----
  const convData = {
    labels: compLabels,
    datasets: [
      { label: '2025 Conv %', data: comparisonRows.map(r => r.conv25), borderColor: TP.blue, backgroundColor: TP.blue, tension: 0.3, pointRadius: 5 },
      { label: '2026 Conv %', data: comparisonRows.map(r => r.conv26), borderColor: TP.green, backgroundColor: TP.green, tension: 0.3, pointRadius: 5 },
    ],
  };
  const convOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' as const, labels: { padding: 12, usePointStyle: true, font: { size: 11 } } } },
    scales: { y: { beginAtZero: true, ticks: { callback: (v: number | string) => Number(v).toFixed(1) + '%' } } },
  };

  // ---- CHART: Weekend funnel ----
  const funnelColors = [TP.skyBlue, TP.red, TP.blue, TP.yellow, TP.green, TP.darkPurple, TP.peach];
  const funnelData = {
    labels: WEEKEND_FUNNEL.map(f => f.stage),
    datasets: [{
      data: WEEKEND_FUNNEL.map(f => f.count),
      backgroundColor: WEEKEND_FUNNEL.map((_, i) => funnelColors[i % funnelColors.length]),
      borderWidth: 1, borderColor: '#fff',
    }],
  };
  const funnelOpts = {
    responsive: true, maintainAspectRatio: false, indexAxis: 'y' as const,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (ctx: { raw: number }) => `${ctx.raw} patients (${(ctx.raw / 179 * 100).toFixed(0)}%)` } },
    },
    scales: { x: { beginAtZero: true } },
  };

  // ---- CHART: Referrer breakdown for 60 incomplete ----
  const refColors = [TP.green, TP.blue, TP.yellow, TP.red, TP.darkPurple, TP.bubblegum, TP.peach, TP.skyBlue, TP.maroon, TP.lightPurple];
  // Group small referrers
  const topRefs = referrerGroups.filter(([, c]) => c >= 2);
  const otherCount = referrerGroups.filter(([, c]) => c < 2).reduce((s, [, c]) => s + c, 0);
  const refChartEntries = [...topRefs, ...(otherCount > 0 ? [['Other (1 each)', otherCount] as [string, number]] : [])];

  const refChartData = {
    labels: refChartEntries.map(([r]) => r),
    datasets: [{
      data: refChartEntries.map(([, c]) => c),
      backgroundColor: refChartEntries.map((_, i) => refColors[i % refColors.length]),
      borderWidth: 1, borderColor: '#fff',
    }],
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold" style={{ color: TP.navy }}>AV Bottleneck Analysis</h2>
        <p className="text-sm text-gray-500 mt-1">Two questions: Is the traffic gap real? And where are assessments getting stuck?</p>
      </div>

      {/* ===== SECTION 1: TRAFFIC COMPARISON ===== */}
      <div className="border-l-4 pl-4" style={{ borderColor: TP.blue }}>
        <h3 className="text-lg font-bold" style={{ color: TP.navy }}>1. Traffic: 2025 vs 2026 (Same Months)</h3>
        <p className="text-sm text-gray-500 mt-1">
          Comparing {monthsWithBoth.length} months where we have data for both years. No cherry-picking.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label={`Jan-${compLabels[compLabels.length - 1]} 2025 Traffic`} value={totalT25.toLocaleString()} sub={`${monthsWithBoth.length} months`} />
        <StatCard label={`Jan-${compLabels[compLabels.length - 1]} 2026 Traffic`} value={totalT26.toLocaleString()}
          sub={`${trafficChange >= 0 ? '+' : ''}${trafficChange.toFixed(1)}% vs 2025`}
          alert={trafficChange < -5} good={trafficChange > 5} />
        <StatCard label={`Jan-${compLabels[compLabels.length - 1]} 2025 Subs`} value={totalS25.toLocaleString()} sub={`${monthsWithBoth.length} months`} />
        <StatCard label={`Jan-${compLabels[compLabels.length - 1]} 2026 Subs`} value={totalS26.toLocaleString()}
          sub={`${subsChange >= 0 ? '+' : ''}${subsChange.toFixed(1)}% vs 2025`}
          alert={subsChange < -5} good={subsChange > 5} />
      </div>

      {/* Traffic bar chart */}
      <div className="bg-white rounded-lg border p-5">
        <h4 className="text-sm font-semibold mb-3" style={{ color: TP.navy }}>Monthly Traffic: 2025 vs 2026</h4>
        <div style={{ height: 300 }}><Bar data={trafficCompData} options={barOpts as never} /></div>
      </div>

      {/* Submissions bar chart */}
      <div className="bg-white rounded-lg border p-5">
        <h4 className="text-sm font-semibold mb-3" style={{ color: TP.navy }}>Monthly Submissions: 2025 vs 2026</h4>
        <div style={{ height: 300 }}><Bar data={subsCompData} options={barOpts as never} /></div>
      </div>

      {/* Conversion rate */}
      <div className="bg-white rounded-lg border p-5">
        <h4 className="text-sm font-semibold mb-3" style={{ color: TP.navy }}>Conversion Rate: 2025 vs 2026</h4>
        <div style={{ height: 260 }}><Line data={convData} options={convOpts as never} /></div>
      </div>

      {/* Detailed comparison table */}
      <div className="bg-white rounded-lg border p-5">
        <h4 className="text-sm font-semibold mb-3" style={{ color: TP.navy }}>Month-by-Month Comparison</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2" style={{ borderColor: TP.navy }}>
                <th className="text-left py-2 px-2">Month</th>
                <th className="text-right py-2 px-2">2025 Traffic</th>
                <th className="text-right py-2 px-2">2026 Traffic</th>
                <th className="text-right py-2 px-2">Change</th>
                <th className="text-right py-2 px-2">2025 Subs</th>
                <th className="text-right py-2 px-2">2026 Subs</th>
                <th className="text-right py-2 px-2">Change</th>
                <th className="text-right py-2 px-2">Conv 25</th>
                <th className="text-right py-2 px-2">Conv 26</th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map(r => (
                <tr key={r.month} className="border-b">
                  <td className="py-1.5 px-2 font-medium">{r.label}</td>
                  <td className="py-1.5 px-2 text-right">{r.t25.toLocaleString()}</td>
                  <td className="py-1.5 px-2 text-right">{r.t26.toLocaleString()}</td>
                  <td className={`py-1.5 px-2 text-right font-medium ${r.tPct >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {r.tPct >= 0 ? '+' : ''}{r.tPct.toFixed(1)}%
                  </td>
                  <td className="py-1.5 px-2 text-right">{r.s25.toLocaleString()}</td>
                  <td className="py-1.5 px-2 text-right">{r.s26.toLocaleString()}</td>
                  <td className={`py-1.5 px-2 text-right font-medium ${r.sPct >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {r.sPct >= 0 ? '+' : ''}{r.sPct.toFixed(1)}%
                  </td>
                  <td className="py-1.5 px-2 text-right">{r.conv25.toFixed(1)}%</td>
                  <td className="py-1.5 px-2 text-right">{r.conv26.toFixed(1)}%</td>
                </tr>
              ))}
              <tr className="border-t-2 font-bold" style={{ borderColor: TP.navy }}>
                <td className="py-2 px-2">Total</td>
                <td className="py-2 px-2 text-right">{totalT25.toLocaleString()}</td>
                <td className="py-2 px-2 text-right">{totalT26.toLocaleString()}</td>
                <td className={`py-2 px-2 text-right ${trafficChange >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {trafficChange >= 0 ? '+' : ''}{trafficChange.toFixed(1)}%
                </td>
                <td className="py-2 px-2 text-right">{totalS25.toLocaleString()}</td>
                <td className="py-2 px-2 text-right">{totalS26.toLocaleString()}</td>
                <td className={`py-2 px-2 text-right ${subsChange >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {subsChange >= 0 ? '+' : ''}{subsChange.toFixed(1)}%
                </td>
                <td className="py-2 px-2 text-right">{(totalT25 > 0 ? totalS25 / totalT25 * 100 : 0).toFixed(1)}%</td>
                <td className="py-2 px-2 text-right">{(totalT26 > 0 ? totalS26 / totalT26 * 100 : 0).toFixed(1)}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== SECTION 2: ASSESSMENT COMPLETION BOTTLENECK ===== */}
      <div className="border-l-4 pl-4 mt-8" style={{ borderColor: TP.red }}>
        <h3 className="text-lg font-bold" style={{ color: TP.navy }}>2. Assessment Completion Bottleneck (May 16-17)</h3>
        <p className="text-sm text-gray-500 mt-1">
          179 total patients this weekend. 60 are stuck at &quot;WAITING - Needs Info&quot; — that&apos;s {(60 / 179 * 100).toFixed(0)}% of all starts sitting incomplete.
        </p>
      </div>

      {/* Funnel + stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border p-5">
          <h4 className="text-sm font-semibold mb-3" style={{ color: TP.navy }}>Weekend Assessment Funnel</h4>
          <div style={{ height: 220 }}><Bar data={funnelData} options={funnelOpts as never} /></div>
        </div>

        <div className="space-y-3">
          <div className="rounded-lg border p-4 bg-white">
            <div className="text-xs text-gray-500">Total Weekend Patients</div>
            <div className="text-2xl font-bold" style={{ color: TP.navy }}>179</div>
          </div>
          <div className="rounded-lg border p-4 border-red-300 bg-red-50">
            <div className="text-xs text-gray-500">Stuck at &quot;Needs Info&quot;</div>
            <div className="text-2xl font-bold" style={{ color: TP.red }}>60 <span className="text-sm font-normal text-gray-500">(33%)</span></div>
          </div>
          <div className="rounded-lg border p-4 bg-white">
            <div className="text-xs text-gray-500">Top Referrer (of 60 incomplete)</div>
            <div className="text-2xl font-bold" style={{ color: TP.green }}>Emily Boazman <span className="text-sm font-normal text-gray-500">— 24 (40%)</span></div>
          </div>
        </div>
      </div>

      {/* Referrer breakdown of the 60 */}
      <div className="bg-white rounded-lg border p-5">
        <h4 className="text-sm font-semibold mb-3" style={{ color: TP.navy }}>
          Who Referred the 60 Incomplete Assessments?
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div style={{ height: 260 }}>
            <Bar data={refChartData} options={{ ...funnelOpts, plugins: { ...funnelOpts.plugins, tooltip: { callbacks: { label: (ctx: { raw: number }) => `${ctx.raw} patients (${(ctx.raw / 60 * 100).toFixed(0)}%)` } } } } as never} />
          </div>
          <div className="text-sm space-y-1">
            {referrerGroups.map(([ref, count]) => (
              <div key={ref} className="flex justify-between py-0.5 border-b border-gray-100">
                <span>{ref}</span>
                <span className="font-medium">{count} ({(count / 60 * 100).toFixed(0)}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Full patient list */}
      <div className="bg-white rounded-lg border p-5">
        <h4 className="text-sm font-semibold mb-3" style={{ color: TP.navy }}>
          60 Incomplete Assessments — WAITING: Needs Info
        </h4>
        <p className="text-xs text-gray-400 mb-3">These patients started their assessment May 16-17 but have not submitted required information.</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2" style={{ borderColor: TP.navy }}>
                <th className="text-left py-2 px-2 w-8">#</th>
                <th className="text-left py-2 px-2">Child Name</th>
                <th className="text-left py-2 px-2">Referrer</th>
              </tr>
            </thead>
            <tbody>
              {INCOMPLETE_ASSESSMENTS.map((p, i) => (
                <tr key={i} className="border-b hover:bg-gray-50">
                  <td className="py-1 px-2 text-gray-400">{i + 1}</td>
                  <td className="py-1 px-2 font-medium">{p.name}</td>
                  <td className="py-1 px-2">
                    {p.referrer ? (
                      <span className="text-xs px-1.5 py-0.5 rounded" style={{
                        background: p.referrer.includes('Emily') ? TP.green + '30' :
                                   p.referrer.includes('Alex') ? TP.yellow + '30' :
                                   TP.lightBlue,
                        color: TP.navy,
                      }}>{p.referrer}</span>
                    ) : <span className="text-gray-400">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, alert, good }: { label: string; value: string; sub: string; alert?: boolean; good?: boolean }) {
  return (
    <div className={`rounded-lg border p-4 ${alert ? 'border-red-300 bg-red-50' : good ? 'border-green-300 bg-green-50' : 'bg-white'}`}>
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className="text-xl font-bold" style={{ color: TP.navy }}>{value}</div>
      <div className="text-xs text-gray-400 mt-1">{sub}</div>
    </div>
  );
}
