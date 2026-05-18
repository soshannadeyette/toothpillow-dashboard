'use client';

import { useEffect, useState, useMemo } from 'react';
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
import { fetchAnnualSummaries, fetchSubmissions, currentMonth, currentYear } from '@/lib/api';
import type { MonthlySummary, DailySubmission } from '@/lib/types';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

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
// Excluded: 87 blank-stage parent records (no assessment started, just parent account created)
const WEEKEND_FUNNEL = [
  { stage: 'WAITING - Needs Info', count: 60 },
  { stage: 'Sent to TxP', count: 16 },
  { stage: 'Sent Checkout Link', count: 7 },
  { stage: 'Dr Ben Approved', count: 6 },
  { stage: 'TxP Approved', count: 2 },
  { stage: 'New (Child)', count: 1 },
];
const FUNNEL_TOTAL = 92; // 179 total minus 87 blank-stage parent records

// The 60 patients stuck at WAITING - Needs info
interface IncompletePatient {
  name: string;
  referrer: string;
  questionnaireComplete?: boolean | null; // true = done, false = not done, null/undefined = unknown
  photosCompleted?: boolean | null;
}

const INCOMPLETE_ASSESSMENTS: IncompletePatient[] = [
  { name: 'Jackson Coyne', referrer: 'Facebook', questionnaireComplete: true, photosCompleted: false },
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

  // ---- SPIKE vs ORGANIC ANALYSIS ----
  // Spike threshold: any month over 45K visitors had a viral/ambassador/podcast event driving traffic
  const SPIKE_THRESHOLD = 45000;

  // For the current month, prorate 2025 to match the number of days we have in 2026
  const cm = currentMonth();
  const daysIn2026CurrentMonth = curMonthSubs.length;
  const daysInFullMonth = (m: number) => new Date(2025, m, 0).getDate();

  // Classify 2025 months as spike or organic
  const months2025Spike = Object.entries(TRAFFIC_2025).filter(([, v]) => v >= SPIKE_THRESHOLD).map(([m]) => Number(m));
  const months2025Organic = Object.entries(TRAFFIC_2025).filter(([, v]) => v < SPIKE_THRESHOLD).map(([m]) => Number(m));
  const organic2025Avg = Math.round(months2025Organic.reduce((s, m) => s + TRAFFIC_2025[m], 0) / months2025Organic.length);
  const spike2025Avg = Math.round(months2025Spike.reduce((s, m) => s + TRAFFIC_2025[m], 0) / months2025Spike.length);

  // Build 2026 comparable data with proration for current month
  const monthsWithBoth = MONTH_LABELS
    .map((_, i) => i + 1)
    .filter(m => TRAFFIC_2025[m] > 0 && (traffic2026[m] || 0) > 0);

  const comparisonRows = monthsWithBoth.map(m => {
    const isPartialMonth = m === cm && daysIn2026CurrentMonth > 0 && daysIn2026CurrentMonth < daysInFullMonth(m);
    const prorateFactor = isPartialMonth ? daysIn2026CurrentMonth / daysInFullMonth(m) : 1;
    const t25raw = TRAFFIC_2025[m];
    const t25 = Math.round(t25raw * prorateFactor);
    const t26 = traffic2026[m] || 0;
    const s25 = Math.round(SUBS_2025[m] * prorateFactor);
    const s26 = subs2026[m] || 0;
    const tDiff = t26 - t25;
    const tPct = t25 > 0 ? (tDiff / t25 * 100) : 0;
    const sDiff = s26 - s25;
    const sPct = s25 > 0 ? (sDiff / s25 * 100) : 0;
    const conv25 = t25 > 0 ? (s25 / t25 * 100) : 0;
    const conv26 = t26 > 0 ? (s26 / t26 * 100) : 0;
    const isSpike2025 = t25raw >= SPIKE_THRESHOLD;
    const isSpike2026 = t26 >= (isPartialMonth ? SPIKE_THRESHOLD * prorateFactor : SPIKE_THRESHOLD);
    const prorated = isPartialMonth;
    return { month: m, label: MONTH_LABELS[m - 1] + (prorated ? '*' : ''), t25, t26, tDiff, tPct, s25, s26, sDiff, sPct, conv25, conv26, prorated, isSpike2025, isSpike2026 };
  });

  // Classify 2026 months
  const months2026Spike = comparisonRows.filter(r => r.isSpike2026);
  const months2026Organic = comparisonRows.filter(r => !r.isSpike2026);
  const organic2026Avg = months2026Organic.length > 0 ? Math.round(months2026Organic.reduce((s, r) => s + r.t26, 0) / months2026Organic.length) : 0;
  const organicChange = organic2025Avg > 0 ? ((organic2026Avg - organic2025Avg) / organic2025Avg * 100) : 0;

  // Totals
  const totalT25 = comparisonRows.reduce((s, r) => s + r.t25, 0);
  const totalT26 = comparisonRows.reduce((s, r) => s + r.t26, 0);
  const totalS25 = comparisonRows.reduce((s, r) => s + r.s25, 0);
  const totalS26 = comparisonRows.reduce((s, r) => s + r.s26, 0);
  const trafficChange = totalT25 > 0 ? ((totalT26 - totalT25) / totalT25 * 100) : 0;
  const subsChange = totalS25 > 0 ? ((totalS26 - totalS25) / totalS25 * 100) : 0;

  // ---- CHART 1: 2025 Full Year — spike months vs organic months ----
  const chart2025Data = {
    labels: MONTH_LABELS,
    datasets: [{
      label: '2025 Monthly Traffic',
      data: MONTH_LABELS.map((_, i) => TRAFFIC_2025[i + 1] || 0),
      backgroundColor: MONTH_LABELS.map((_, i) => (TRAFFIC_2025[i + 1] || 0) >= SPIKE_THRESHOLD ? TP.yellow : TP.blue),
      borderColor: MONTH_LABELS.map((_, i) => (TRAFFIC_2025[i + 1] || 0) >= SPIKE_THRESHOLD ? '#D4920A' : TP.navy),
      borderWidth: 1,
    }],
  };
  const chart2025Opts = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (ctx: { raw: number; dataIndex: number }) => {
        const m = ctx.dataIndex + 1;
        const isSpike = (TRAFFIC_2025[m] || 0) >= SPIKE_THRESHOLD;
        return `${ctx.raw.toLocaleString()} visitors ${isSpike ? '(SPIKE — ambassador/podcast driven)' : '(organic baseline)'}`;
      }}},
    },
    scales: {
      y: { beginAtZero: true, ticks: { callback: (v: number | string) => (Number(v) / 1000).toFixed(0) + 'K' } },
    },
  };

  // ---- CHART 2: 2026 months with organic baseline reference ----
  const compLabels = comparisonRows.map(r => r.label);
  const chart2026Data = {
    labels: compLabels,
    datasets: [{
      label: '2026 Monthly Traffic',
      data: comparisonRows.map(r => r.t26),
      backgroundColor: comparisonRows.map(r => r.isSpike2026 ? TP.yellow : TP.green),
      borderColor: comparisonRows.map(r => r.isSpike2026 ? '#D4920A' : '#5BB5A6'),
      borderWidth: 1,
    }],
  };
  const chart2026Opts = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (ctx: { raw: number; dataIndex: number }) => {
        const r = comparisonRows[ctx.dataIndex];
        return `${ctx.raw.toLocaleString()} visitors ${r.isSpike2026 ? '(spike month)' : '(organic)'}${r.prorated ? ' — prorated' : ''}`;
      }}},
    },
    scales: {
      y: { beginAtZero: true, max: 80000, ticks: { callback: (v: number | string) => (Number(v) / 1000).toFixed(0) + 'K' } },
    },
  };

  // ---- CHART 3: Organic-only comparison ----
  const organicCompData = {
    labels: ['2025 Organic Avg', '2026 Organic Avg'],
    datasets: [{
      data: [organic2025Avg, organic2026Avg],
      backgroundColor: [TP.blue, TP.green],
      borderColor: [TP.navy, '#5BB5A6'],
      borderWidth: 1,
    }],
  };
  const organicCompOpts = {
    responsive: true, maintainAspectRatio: false, indexAxis: 'y' as const,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (ctx: { raw: number }) => `${ctx.raw.toLocaleString()} avg monthly visitors` } },
    },
    scales: { x: { beginAtZero: true, ticks: { callback: (v: number | string) => (Number(v) / 1000).toFixed(0) + 'K' } } },
  };

  const barOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' as const, labels: { padding: 12, usePointStyle: true, font: { size: 11 } } } },
    scales: { y: { beginAtZero: true, ticks: { callback: (v: number | string) => Number(v).toLocaleString() } } },
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
      tooltip: { callbacks: { label: (ctx: { raw: number }) => `${ctx.raw} patients (${(ctx.raw / FUNNEL_TOTAL * 100).toFixed(0)}%)` } },
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

      {/* ===== SECTION 1: SPIKE vs ORGANIC TRAFFIC ===== */}
      <div className="border-l-4 pl-4" style={{ borderColor: TP.blue }}>
        <h3 className="text-lg font-bold" style={{ color: TP.navy }}>1. Viral Spikes vs Organic Baseline</h3>
        <p className="text-sm text-gray-500 mt-1">
          Months over 45K visitors are flagged as spike months (ambassador viral hits, podcast drops, etc).
          Everything below that line is the organic baseline — the traffic that comes regardless of viral events.
          {comparisonRows.some(r => r.prorated) && (
            <span className="ml-1 italic"> * Current month prorated to {daysIn2026CurrentMonth} days.</span>
          )}
        </p>
      </div>

      {/* Key finding cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="2025 Spike Months" value={months2025Spike.length.toString()} sub={`Avg ${(spike2025Avg / 1000).toFixed(1)}K/mo`} />
        <StatCard label="2025 Organic Months" value={months2025Organic.length.toString()} sub={`Avg ${(organic2025Avg / 1000).toFixed(1)}K/mo`} />
        <StatCard label="2026 Spike Months" value={months2026Spike.length.toString()}
          sub={months2026Spike.length > 0 ? `(${months2026Spike.map(r => r.label).join(', ')})` : 'None so far'}
          alert={months2026Spike.length < months2025Spike.length} />
        <StatCard label="2026 Organic Avg" value={`${(organic2026Avg / 1000).toFixed(1)}K`}
          sub={`${organicChange >= 0 ? '+' : ''}${organicChange.toFixed(1)}% vs 2025 organic`}
          alert={organicChange < -10} good={organicChange > -5 && organicChange < 100} />
      </div>

      {/* Chart 1: 2025 Full Year — spikes highlighted */}
      <div className="bg-white rounded-lg border p-5">
        <h4 className="text-sm font-semibold mb-1" style={{ color: TP.navy }}>2025 Traffic: Which Months Were Spike-Driven?</h4>
        <p className="text-xs text-gray-400 mb-3">
          <span className="inline-block w-3 h-3 rounded mr-1" style={{ background: TP.yellow, verticalAlign: 'middle' }} /> Spike months (over 45K)
          <span className="inline-block w-3 h-3 rounded ml-3 mr-1" style={{ background: TP.blue, verticalAlign: 'middle' }} /> Organic baseline months
        </p>
        <div style={{ height: 300 }}><Bar data={chart2025Data} options={chart2025Opts as never} /></div>
        <p className="text-xs text-gray-500 mt-2">
          2025 had {months2025Spike.length} spike months ({months2025Spike.map(m => MONTH_LABELS[m - 1]).join(', ')}) averaging {(spike2025Avg / 1000).toFixed(1)}K visitors.
          The other {months2025Organic.length} months averaged {(organic2025Avg / 1000).toFixed(1)}K — that is the organic floor.
        </p>
      </div>

      {/* Chart 2: 2026 months vs organic baseline */}
      <div className="bg-white rounded-lg border p-5">
        <h4 className="text-sm font-semibold mb-1" style={{ color: TP.navy }}>2026 Traffic: Where Are the Spikes?</h4>
        <p className="text-xs text-gray-400 mb-3">
          <span className="inline-block w-3 h-3 rounded mr-1" style={{ background: TP.yellow, verticalAlign: 'middle' }} /> Spike months
          <span className="inline-block w-3 h-3 rounded ml-3 mr-1" style={{ background: TP.green, verticalAlign: 'middle' }} /> Organic months
          <span className="ml-3">Dashed line = 2025 organic baseline ({(organic2025Avg / 1000).toFixed(1)}K)</span>
        </p>
        <div style={{ height: 300 }}><Bar data={chart2026Data} options={chart2026Opts as never} /></div>
        <p className="text-xs text-gray-500 mt-2">
          2026 has had {months2026Spike.length} spike month{months2026Spike.length !== 1 ? 's' : ''} out of {comparisonRows.length} so far.
          In 2025, {months2025Spike.filter(m => m <= comparisonRows.length).length} of the first {comparisonRows.length} months were spike months.
          {months2026Spike.length < months2025Spike.filter(m => m <= comparisonRows.length).length
            ? ' That difference in spike frequency is driving the total traffic gap.'
            : ''}
        </p>
      </div>

      {/* Chart 3: The real question — organic baseline comparison */}
      <div className="bg-white rounded-lg border p-5">
        <h4 className="text-sm font-semibold mb-1" style={{ color: TP.navy }}>Strip Out the Spikes: Is the Organic Floor Holding?</h4>
        <p className="text-xs text-gray-400 mb-3">
          Remove all spike months from both years. Compare only the organic baseline months.
        </p>
        <div style={{ height: 140 }}><Bar data={organicCompData} options={organicCompOpts as never} /></div>
        <p className="text-xs mt-3" style={{ color: organicChange < -10 ? TP.red : organicChange > 5 ? '#16a34a' : TP.text }}>
          {Math.abs(organicChange) < 5
            ? `The organic baseline is roughly flat (${organicChange >= 0 ? '+' : ''}${organicChange.toFixed(1)}%). The total traffic drop is driven by fewer spike months, not a decline in organic traffic.`
            : organicChange < -10
            ? `The organic baseline dropped ${Math.abs(organicChange).toFixed(1)}%. This means traffic is declining even without accounting for fewer spikes — organic reach itself is shrinking.`
            : `The organic baseline shifted ${organicChange >= 0 ? '+' : ''}${organicChange.toFixed(1)}%.`
          }
        </p>
      </div>

      {/* Detailed comparison table */}
      <div className="bg-white rounded-lg border p-5">
        <h4 className="text-sm font-semibold mb-3" style={{ color: TP.navy }}>Month-by-Month Detail</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2" style={{ borderColor: TP.navy }}>
                <th className="text-left py-2 px-2">Month</th>
                <th className="text-center py-2 px-2">Type</th>
                <th className="text-right py-2 px-2">2025 Traffic</th>
                <th className="text-right py-2 px-2">2026 Traffic</th>
                <th className="text-right py-2 px-2">Change</th>
                <th className="text-right py-2 px-2">2025 Subs</th>
                <th className="text-right py-2 px-2">2026 Subs</th>
                <th className="text-right py-2 px-2">Change</th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map(r => (
                <tr key={r.month} className="border-b" style={{ background: r.isSpike2025 ? TP.yellow + '15' : undefined }}>
                  <td className="py-1.5 px-2 font-medium">{r.label}</td>
                  <td className="py-1.5 px-2 text-center">
                    <span className="text-xs px-1.5 py-0.5 rounded" style={{
                      background: r.isSpike2025 ? TP.yellow + '40' : TP.lightBlue,
                      color: TP.navy,
                    }}>{r.isSpike2025 ? 'Spike' : 'Organic'}</span>
                  </td>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== SECTION 2: ASSESSMENT COMPLETION BOTTLENECK ===== */}
      <div className="border-l-4 pl-4 mt-8" style={{ borderColor: TP.red }}>
        <h3 className="text-lg font-bold" style={{ color: TP.navy }}>2. Assessment Completion Bottleneck (May 16-17)</h3>
        <p className="text-sm text-gray-500 mt-1">
          92 children started an assessment this weekend (87 blank-stage parent records excluded). 60 are stuck at &quot;WAITING - Needs Info&quot; — that&apos;s {(60 / FUNNEL_TOTAL * 100).toFixed(0)}% of all assessment starts sitting incomplete.
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
            <div className="text-xs text-gray-500">Assessment Starts (Weekend)</div>
            <div className="text-2xl font-bold" style={{ color: TP.navy }}>{FUNNEL_TOTAL}</div>
          </div>
          <div className="rounded-lg border p-4 border-red-300 bg-red-50">
            <div className="text-xs text-gray-500">Stuck at &quot;Needs Info&quot;</div>
            <div className="text-2xl font-bold" style={{ color: TP.red }}>60 <span className="text-sm font-normal text-gray-500">({(60 / FUNNEL_TOTAL * 100).toFixed(0)}%)</span></div>
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

      {/* Full patient list with status tracking */}
      <div className="bg-white rounded-lg border p-5">
        <h4 className="text-sm font-semibold mb-3" style={{ color: TP.navy }}>
          60 Incomplete Assessments — Drip Reminder Tracking
        </h4>
        <p className="text-xs text-gray-400 mb-3">
          Track what happens after drip reminders. &quot;Questionnaire&quot; = filled out child info. &quot;Photos&quot; = uploaded required photos. Both must be complete for assessment to move forward.
        </p>

        {/* Status summary cards */}
        {(() => {
          const qYes = INCOMPLETE_ASSESSMENTS.filter(p => p.questionnaireComplete === true).length;
          const qNo = INCOMPLETE_ASSESSMENTS.filter(p => p.questionnaireComplete === false).length;
          const qUnknown = INCOMPLETE_ASSESSMENTS.filter(p => p.questionnaireComplete == null).length;
          const pYes = INCOMPLETE_ASSESSMENTS.filter(p => p.photosCompleted === true).length;
          const pNo = INCOMPLETE_ASSESSMENTS.filter(p => p.photosCompleted === false).length;
          const pUnknown = INCOMPLETE_ASSESSMENTS.filter(p => p.photosCompleted == null).length;
          return (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div className="rounded border p-3 bg-green-50 border-green-200">
                <div className="text-xs text-gray-500">Questionnaire Done</div>
                <div className="text-lg font-bold" style={{ color: '#16a34a' }}>{qYes}</div>
              </div>
              <div className="rounded border p-3 bg-red-50 border-red-200">
                <div className="text-xs text-gray-500">Questionnaire Not Done</div>
                <div className="text-lg font-bold" style={{ color: TP.red }}>{qNo}</div>
              </div>
              <div className="rounded border p-3 bg-green-50 border-green-200">
                <div className="text-xs text-gray-500">Photos Done</div>
                <div className="text-lg font-bold" style={{ color: '#16a34a' }}>{pYes}</div>
              </div>
              <div className="rounded border p-3 bg-red-50 border-red-200">
                <div className="text-xs text-gray-500">Photos Not Done</div>
                <div className="text-lg font-bold" style={{ color: TP.red }}>{pNo}</div>
              </div>
            </div>
          );
        })()}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2" style={{ borderColor: TP.navy }}>
                <th className="text-left py-2 px-2 w-8">#</th>
                <th className="text-left py-2 px-2">Child Name</th>
                <th className="text-left py-2 px-2">Referrer</th>
                <th className="text-center py-2 px-2">Questionnaire</th>
                <th className="text-center py-2 px-2">Photos</th>
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
                  <td className="py-1 px-2 text-center">
                    {p.questionnaireComplete === true ? (
                      <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700 font-medium">Done</span>
                    ) : p.questionnaireComplete === false ? (
                      <span className="text-xs px-2 py-0.5 rounded bg-red-100 text-red-600 font-medium">No</span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="py-1 px-2 text-center">
                    {p.photosCompleted === true ? (
                      <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700 font-medium">Done</span>
                    ) : p.photosCompleted === false ? (
                      <span className="text-xs px-2 py-0.5 rounded bg-red-100 text-red-600 font-medium">No</span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
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
