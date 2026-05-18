'use client';

import { useEffect, useState } from 'react';
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
import annotationPlugin from 'chartjs-plugin-annotation';
import { Bar, Line } from 'react-chartjs-2';
import { fetchAnnualSummaries, fetchSubmissions, currentMonth, currentYear } from '@/lib/api';
import type { MonthlySummary, DailySubmission } from '@/lib/types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  annotationPlugin
);

const TP = {
  blue: '#3A6EA4',
  skyBlue: '#B6CAE3',
  lightBlue: '#D6E5F7',
  cream: '#FEF8EE',
  green: '#8CD1C8',
  yellow: '#FDBE67',
  peach: '#FBCCC5',
  red: '#DD5759',
  darkPurple: '#B26CA6',
  lightPurple: '#DDBBD9',
  bubblegum: '#F6AACB',
  maroon: '#D46476',
  text: '#333333',
  navy: '#1B2A4A',
};

// ---- HARDCODED DATA (source of truth) ----

// 2025 GA4 monthly active users
const TRAFFIC_2025: Record<number, number> = {
  1: 57814, 2: 58901, 3: 57747, 4: 33895, 5: 31621, 6: 31681,
  7: 73193, 8: 37180, 9: 29179, 10: 28271, 11: 54674, 12: 36031,
};

// 2025 total submissions
const SUBS_2025: Record<number, number> = {
  1: 1434, 2: 1560, 3: 1510, 4: 1663, 5: 1328, 6: 1039,
  7: 2588, 8: 2478, 9: 1550, 10: 1475, 11: 1591, 12: 1226,
};

// Known viral spike events — month index (1-based), year, label
const SPIKE_EVENTS: { year: number; month: number; label: string; type: 'influencer' | 'podcast' | 'campaign' }[] = [
  { year: 2025, month: 1, label: 'NNM Jan push', type: 'influencer' },
  { year: 2025, month: 2, label: 'NNM Feb push', type: 'influencer' },
  { year: 2025, month: 3, label: 'NNM Mar push', type: 'influencer' },
  { year: 2025, month: 7, label: 'Jul viral spike (73K)', type: 'influencer' },
  { year: 2025, month: 11, label: 'Nov spike (55K)', type: 'influencer' },
];

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Weekend assessment starts (May 16-17, 2026) — tracking who started but didn't finish
interface WeekendPatient {
  name: string;
  referrer: string;
  infoComplete?: boolean | null; // null = not checked yet
  photosUploaded?: boolean | null;
}

const WEEKEND_PATIENTS: WeekendPatient[] = [
  { name: 'Lauren Coyne', referrer: 'Unknown' },
  { name: 'Jessica Dow', referrer: 'Unknown' },
  { name: 'April Jackson', referrer: 'Unknown' },
  { name: 'Allie Tropkoff', referrer: 'Unknown' },
  { name: 'Suheidy Carrasco', referrer: 'Unknown' },
  { name: 'Lisa Wagner', referrer: 'Unknown' },
  { name: 'Michelle Wilson', referrer: 'Unknown' },
  { name: 'Rachael Stedman', referrer: 'Unknown' },
  { name: 'Jesse King', referrer: 'Unknown' },
  { name: 'Sarah Boquette', referrer: 'Unknown' },
  { name: 'Karen McClary', referrer: 'Unknown' },
  { name: 'Kitty Coon', referrer: 'Unknown' },
  { name: 'Victoria Guerrero', referrer: 'Unknown' },
  { name: 'Charles de la Vergne', referrer: 'Unknown' },
  { name: 'Christina Epperson Gregory', referrer: 'Unknown' },
  { name: 'Andrea Enright', referrer: 'Carly Hartwig' },
  { name: 'Kristy Buckwalter', referrer: 'Toothpillow Instagram' },
  { name: 'Megan Hunter', referrer: 'Unknown' },
  { name: 'Rebecca Moore', referrer: 'Unknown' },
  { name: 'Darlene Villarreal', referrer: 'Unknown' },
  { name: 'Amanda Salcido', referrer: 'Unknown' },
  { name: 'Mary Gray', referrer: 'Unknown' },
  { name: 'Mindy Larson', referrer: 'Unknown' },
  { name: 'Hanna Ostrander', referrer: 'Unknown' },
  { name: 'Alena Bardadin', referrer: 'Emily Boazman' },
  { name: 'Renee Flitcroft', referrer: 'Emily Boazman' },
  { name: 'Paige Salvador', referrer: 'Emily Boazman' },
  { name: 'Tara Tillman', referrer: 'Unknown' },
  { name: 'Amy Ruggeri', referrer: 'Unknown' },
  { name: 'Carla Kenney', referrer: 'Emily Boazman' },
  { name: 'Allison Velazquez', referrer: 'Emily Boazman' },
  { name: 'Noralyn Alvarado', referrer: 'Unknown' },
  { name: 'Morgan Ward', referrer: 'Emily Boazman' },
  { name: 'Chloe Horvath', referrer: 'Emily Boazman' },
  { name: 'Shannon Smith', referrer: 'Emily Boazman' },
  { name: 'Ann Bausch', referrer: 'Emily Boazman' },
  { name: 'Liz Vazquez', referrer: 'Emily Boazman' },
  { name: 'Laura Velasquez', referrer: 'Emily Boazman' },
  { name: 'Alena Kirby', referrer: 'Unknown' },
  { name: 'Toya Frederick', referrer: 'Unknown' },
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
      } catch (e) {
        console.error('AVBottleneck load error:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading bottleneck data...</div>;
  }

  // Build 2026 traffic and submission data from Supabase
  const traffic2026: Record<number, number> = {};
  const subs2026: Record<number, number> = {};
  months2026.forEach(m => {
    traffic2026[m.month] = m.total_visitors;
    subs2026[m.month] = m.total_submissions;
  });
  // Add current month from daily tracker if not in annual yet
  const cm = currentMonth();
  if (!subs2026[cm] && curMonthSubs.length > 0) {
    subs2026[cm] = curMonthSubs.reduce((s, d) => s + (d.online || 0) + (d.hybrid || 0) + (d.prime || 0), 0);
    traffic2026[cm] = curMonthSubs.reduce((s, d) => s + (d.visitors || 0), 0);
  }

  // ---- Chart 1: 2025 vs 2026 Monthly Traffic with Spike Annotations ----
  const trafficChartData = {
    labels: MONTH_LABELS,
    datasets: [
      {
        label: '2025 Traffic',
        data: MONTH_LABELS.map((_, i) => TRAFFIC_2025[i + 1] || 0),
        backgroundColor: TP.skyBlue + '90',
        borderColor: TP.blue,
        borderWidth: 1,
        barPercentage: 0.85,
        categoryPercentage: 0.8,
      },
      {
        label: '2026 Traffic',
        data: MONTH_LABELS.map((_, i) => traffic2026[i + 1] || 0),
        backgroundColor: TP.green + '90',
        borderColor: '#5BB5A6',
        borderWidth: 1,
        barPercentage: 0.85,
        categoryPercentage: 0.8,
      },
    ],
  };

  // Build spike annotation lines
  const spikeAnnotations: Record<string, object> = {};
  SPIKE_EVENTS.filter(e => e.year === 2025).forEach((e, i) => {
    spikeAnnotations[`spike_${i}`] = {
      type: 'label',
      xValue: MONTH_LABELS[e.month - 1],
      yValue: TRAFFIC_2025[e.month] + 3000,
      content: ['▼'],
      color: TP.red,
      font: { size: 14, weight: 'bold' },
    };
  });

  const trafficChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' as const, labels: { padding: 15, usePointStyle: true, font: { size: 11 } } },
      tooltip: {
        callbacks: {
          afterBody: (context: { dataIndex: number }[]) => {
            const idx = context[0].dataIndex;
            const monthNum = idx + 1;
            const spike = SPIKE_EVENTS.find(e => e.year === 2025 && e.month === monthNum);
            return spike ? `⚡ ${spike.label}` : '';
          },
        },
      },
      annotation: { annotations: spikeAnnotations },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Active Users', font: { size: 11 } },
        ticks: { callback: (v: number | string) => Number(v).toLocaleString() },
      },
    },
  };

  // ---- Chart 2: Organic Baseline vs Spike Traffic (2025) ----
  // Define "organic baseline" as the median of non-spike months
  const spikeMonths2025 = new Set(SPIKE_EVENTS.filter(e => e.year === 2025).map(e => e.month));
  const nonSpikeTraffic2025 = Object.entries(TRAFFIC_2025)
    .filter(([m]) => !spikeMonths2025.has(Number(m)))
    .map(([, v]) => v)
    .sort((a, b) => a - b);
  const organicBaseline2025 = nonSpikeTraffic2025.length > 0
    ? nonSpikeTraffic2025[Math.floor(nonSpikeTraffic2025.length / 2)]
    : 0;

  const baselineData = {
    labels: MONTH_LABELS,
    datasets: [
      {
        label: '2025 Actual Traffic',
        data: MONTH_LABELS.map((_, i) => TRAFFIC_2025[i + 1] || 0),
        borderColor: TP.blue,
        backgroundColor: TP.skyBlue + '40',
        fill: true,
        tension: 0.3,
        pointRadius: 5,
        pointBackgroundColor: MONTH_LABELS.map((_, i) =>
          spikeMonths2025.has(i + 1) ? TP.red : TP.blue
        ),
        pointBorderColor: MONTH_LABELS.map((_, i) =>
          spikeMonths2025.has(i + 1) ? TP.red : TP.blue
        ),
        pointRadius2: MONTH_LABELS.map((_, i) =>
          spikeMonths2025.has(i + 1) ? 8 : 5
        ),
      },
      {
        label: `Organic Baseline (~${organicBaseline2025.toLocaleString()})`,
        data: MONTH_LABELS.map(() => organicBaseline2025),
        borderColor: TP.yellow,
        borderDash: [8, 4],
        borderWidth: 2,
        pointRadius: 0,
        fill: false,
      },
    ],
  };

  const baselineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' as const, labels: { padding: 15, usePointStyle: true, font: { size: 11 } } },
      tooltip: {
        callbacks: {
          afterBody: (context: { dataIndex: number }[]) => {
            const monthNum = context[0].dataIndex + 1;
            const actual = TRAFFIC_2025[monthNum] || 0;
            const diff = actual - organicBaseline2025;
            const spike = SPIKE_EVENTS.find(e => e.year === 2025 && e.month === monthNum);
            const lines = [`vs baseline: ${diff >= 0 ? '+' : ''}${diff.toLocaleString()}`];
            if (spike) lines.push(`⚡ ${spike.label}`);
            return lines;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Active Users', font: { size: 11 } },
        ticks: { callback: (v: number | string) => Number(v).toLocaleString() },
      },
    },
  };

  // ---- Chart 3: Conversion Rate Over Time ----
  // Shows that conversion is relatively stable — the bottleneck is traffic, not conversion
  const convData2025 = MONTH_LABELS.map((_, i) => {
    const m = i + 1;
    const t = TRAFFIC_2025[m];
    const s = SUBS_2025[m];
    return t > 0 ? (s / t * 100) : 0;
  });

  const convData2026 = MONTH_LABELS.map((_, i) => {
    const m = i + 1;
    const t = traffic2026[m] || 0;
    const s = subs2026[m] || 0;
    return t > 0 ? (s / t * 100) : 0;
  });

  const convChartData = {
    labels: MONTH_LABELS,
    datasets: [
      {
        label: '2025 Conversion %',
        data: convData2025,
        borderColor: TP.blue,
        backgroundColor: TP.blue,
        tension: 0.3,
        pointRadius: 4,
      },
      {
        label: '2026 Conversion %',
        data: convData2026.map(v => v > 0 ? v : null),
        borderColor: TP.green,
        backgroundColor: TP.green,
        tension: 0.3,
        pointRadius: 5,
      },
    ],
  };

  const convOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' as const, labels: { padding: 15, usePointStyle: true, font: { size: 11 } } },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Conversion Rate %', font: { size: 11 } },
        ticks: { callback: (v: number | string) => Number(v).toFixed(1) + '%' },
      },
    },
  };

  // ---- Summary Stats ----
  const total2025Traffic = Object.values(TRAFFIC_2025).reduce((s, v) => s + v, 0);
  const spikeTraffic2025 = Array.from(spikeMonths2025).reduce((s, m) => s + (TRAFFIC_2025[m] || 0), 0);
  const organicTraffic2025 = total2025Traffic - spikeTraffic2025;
  const spikePct = total2025Traffic > 0 ? (spikeTraffic2025 / total2025Traffic * 100).toFixed(1) : '0';
  const organicPct = total2025Traffic > 0 ? (organicTraffic2025 / total2025Traffic * 100).toFixed(1) : '0';

  // Average non-spike traffic
  const avgNonSpike2025 = nonSpikeTraffic2025.length > 0
    ? Math.round(nonSpikeTraffic2025.reduce((s, v) => s + v, 0) / nonSpikeTraffic2025.length)
    : 0;

  // 2026 YTD traffic
  const ytd2026Traffic = Object.values(traffic2026).reduce((s, v) => s + v, 0);
  const months2026WithData = Object.values(traffic2026).filter(v => v > 0).length;
  const avg2026Monthly = months2026WithData > 0 ? Math.round(ytd2026Traffic / months2026WithData) : 0;

  // Traffic needed to hit submission goals (using 2025 avg conversion rate)
  const avgConv2025 = total2025Traffic > 0
    ? (Object.values(SUBS_2025).reduce((s, v) => s + v, 0) / total2025Traffic * 100)
    : 3.0;

  // Current month goal from monthly goals
  const curMonthGoal = 1992; // May 2026 goal

  const trafficNeeded = avgConv2025 > 0 ? Math.round(curMonthGoal / (avgConv2025 / 100)) : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold" style={{ color: TP.navy }}>
          Assessment Volume Bottleneck
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Traffic is the constraint on submissions. This tab separates organic traffic from viral spikes to show the real baseline.
        </p>
      </div>

      {/* Summary Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="2025 Total Traffic"
          value={total2025Traffic.toLocaleString()}
          sub={`Spike months: ${spikePct}% | Organic: ${organicPct}%`}
        />
        <StatCard
          label="Organic Baseline (2025)"
          value={`~${avgNonSpike2025.toLocaleString()}/mo`}
          sub={`Median of ${nonSpikeTraffic2025.length} non-spike months`}
        />
        <StatCard
          label="2026 Avg Monthly Traffic"
          value={avg2026Monthly.toLocaleString()}
          sub={`${months2026WithData} months tracked`}
          alert={avg2026Monthly < avgNonSpike2025}
        />
        <StatCard
          label="Traffic Needed for Goal"
          value={trafficNeeded.toLocaleString()}
          sub={`At ${avgConv2025.toFixed(1)}% conv rate to hit ${curMonthGoal.toLocaleString()} subs`}
        />
      </div>

      {/* Chart 1: 3-Year Traffic Comparison */}
      <div className="bg-white rounded-lg border p-5">
        <h3 className="text-base font-semibold mb-1" style={{ color: TP.navy }}>
          Monthly Traffic: 2025 vs 2026
        </h3>
        <p className="text-xs text-gray-400 mb-3">
          Red markers = known influencer/podcast spike months.
        </p>
        <div style={{ height: 360 }}>
          <Bar data={trafficChartData} options={trafficChartOptions as never} />
        </div>
      </div>

      {/* Chart 2: Organic Baseline vs Actual */}
      <div className="bg-white rounded-lg border p-5">
        <h3 className="text-base font-semibold mb-1" style={{ color: TP.navy }}>
          2025 Traffic: Actual vs Organic Baseline
        </h3>
        <p className="text-xs text-gray-400 mb-3">
          Red dots = spike months driven by influencer/podcast pushes. Yellow dashed line = organic baseline (median of non-spike months).
        </p>
        <div style={{ height: 320 }}>
          <Line data={baselineData} options={baselineOptions as never} />
        </div>
      </div>

      {/* The Argument Table */}
      <div className="bg-white rounded-lg border p-5">
        <h3 className="text-base font-semibold mb-3" style={{ color: TP.navy }}>
          The Spike vs Organic Breakdown (2025)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2" style={{ borderColor: TP.navy }}>
                <th className="text-left py-2 px-2">Month</th>
                <th className="text-right py-2 px-2">Traffic</th>
                <th className="text-right py-2 px-2">Submissions</th>
                <th className="text-right py-2 px-2">Conv %</th>
                <th className="text-left py-2 px-2">Spike?</th>
                <th className="text-right py-2 px-2">Above Baseline</th>
              </tr>
            </thead>
            <tbody>
              {MONTH_LABELS.map((label, i) => {
                const m = i + 1;
                const t = TRAFFIC_2025[m] || 0;
                const s = SUBS_2025[m] || 0;
                const conv = t > 0 ? (s / t * 100) : 0;
                const isSpike = spikeMonths2025.has(m);
                const aboveBaseline = t - organicBaseline2025;
                return (
                  <tr key={m} className={`border-b ${isSpike ? 'bg-red-50' : ''}`}>
                    <td className="py-1.5 px-2 font-medium">{label}</td>
                    <td className="py-1.5 px-2 text-right">{t.toLocaleString()}</td>
                    <td className="py-1.5 px-2 text-right">{s.toLocaleString()}</td>
                    <td className="py-1.5 px-2 text-right">{conv.toFixed(1)}%</td>
                    <td className="py-1.5 px-2">
                      {isSpike && (
                        <span className="text-xs px-1.5 py-0.5 rounded text-white" style={{ background: TP.red }}>
                          {SPIKE_EVENTS.find(e => e.year === 2025 && e.month === m)?.label || 'Spike'}
                        </span>
                      )}
                    </td>
                    <td className={`py-1.5 px-2 text-right font-medium ${aboveBaseline > 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {aboveBaseline >= 0 ? '+' : ''}{aboveBaseline.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
              <tr className="border-t-2 font-bold" style={{ borderColor: TP.navy }}>
                <td className="py-2 px-2">Total</td>
                <td className="py-2 px-2 text-right">{total2025Traffic.toLocaleString()}</td>
                <td className="py-2 px-2 text-right">{Object.values(SUBS_2025).reduce((s, v) => s + v, 0).toLocaleString()}</td>
                <td className="py-2 px-2 text-right">{avgConv2025.toFixed(1)}%</td>
                <td className="py-2 px-2">{spikeMonths2025.size} of 12</td>
                <td className="py-2 px-2 text-right">--</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Chart 3: Conversion Rate Over Time */}
      <div className="bg-white rounded-lg border p-5">
        <h3 className="text-base font-semibold mb-1" style={{ color: TP.navy }}>
          Conversion Rate: 2025 vs 2026
        </h3>
        <p className="text-xs text-gray-400 mb-3">
          Conversion rate is stable across spike and non-spike months. The constraint is traffic volume, not conversion quality.
        </p>
        <div style={{ height: 280 }}>
          <Line data={convChartData} options={convOptions as never} />
        </div>
      </div>

      {/* Weekend Assessment Starts (May 16-17) */}
      <WeekendAuditSection />

      {/* Key Takeaway */}
      <div className="bg-white rounded-lg border p-5" style={{ borderLeft: `4px solid ${TP.blue}` }}>
        <h3 className="text-base font-semibold mb-2" style={{ color: TP.navy }}>
          Key Takeaway
        </h3>
        <div className="text-sm text-gray-700 space-y-2">
          <p>
            <strong>Without spike months (Jan-Mar, Jul, Nov),</strong> 2025 organic traffic averaged ~{avgNonSpike2025.toLocaleString()} visitors/month.
            Those 5 spike months accounted for {spikePct}% of total annual traffic.
          </p>
          <p>
            <strong>2026 is currently averaging {avg2026Monthly.toLocaleString()}/month</strong> across {months2026WithData} months tracked.
            {avg2026Monthly < avgNonSpike2025
              ? ` That is ${(((avgNonSpike2025 - avg2026Monthly) / avgNonSpike2025) * 100).toFixed(0)}% below the 2025 organic baseline, confirming the traffic gap is real and not just missing viral spikes.`
              : ` That is on par with the 2025 organic baseline.`
            }
          </p>
          <p>
            <strong>At the current conversion rate of {avgConv2025.toFixed(1)}%,</strong> hitting {curMonthGoal.toLocaleString()} monthly submissions requires ~{trafficNeeded.toLocaleString()} monthly visitors.
            The old pages had basic SEO and a sitemap, which contributed to higher organic traffic even without a formal SEO strategy.
            Without those pages ranking, the baseline has dropped, and there are no viral spikes to compensate.
          </p>
        </div>
      </div>
    </div>
  );
}

function WeekendAuditSection() {
  // Referrer breakdown
  const referrerCounts: Record<string, number> = {};
  WEEKEND_PATIENTS.forEach(p => {
    referrerCounts[p.referrer] = (referrerCounts[p.referrer] || 0) + 1;
  });
  const sortedReferrers = Object.entries(referrerCounts).sort((a, b) => b[1] - a[1]);
  const referrerColors = [TP.blue, TP.green, TP.yellow, TP.red, TP.darkPurple, TP.bubblegum, TP.peach, TP.skyBlue];

  const referrerChartData = {
    labels: sortedReferrers.map(([r]) => r),
    datasets: [{
      data: sortedReferrers.map(([, c]) => c),
      backgroundColor: sortedReferrers.map((_, i) => referrerColors[i % referrerColors.length]),
      borderWidth: 1,
      borderColor: '#fff',
    }],
  };

  const referrerBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y' as const,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: { raw: number }) => {
            const pct = ((ctx.raw / WEEKEND_PATIENTS.length) * 100).toFixed(0);
            return `${ctx.raw} patients (${pct}%)`;
          },
        },
      },
    },
    scales: {
      x: { beginAtZero: true, title: { display: true, text: 'Patients', font: { size: 11 } } },
    },
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border p-5">
        <h3 className="text-base font-semibold mb-1" style={{ color: TP.navy }}>
          Weekend Assessment Starts: May 16-17
        </h3>
        <p className="text-xs text-gray-400 mb-3">
          {WEEKEND_PATIENTS.length} new patients started assessments this weekend. Check AV to see who completed info and photos.
        </p>

        {/* Referrer breakdown chart */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium mb-2" style={{ color: TP.navy }}>Referrer Breakdown</h4>
            <div style={{ height: 160 }}>
              <Bar data={referrerChartData} options={referrerBarOptions as never} />
            </div>
            <div className="mt-3 text-xs text-gray-500">
              {sortedReferrers.map(([ref, count]) => (
                <div key={ref} className="flex justify-between py-0.5">
                  <span>{ref}</span>
                  <span className="font-medium">{count} ({((count / WEEKEND_PATIENTS.length) * 100).toFixed(0)}%)</span>
                </div>
              ))}
            </div>
          </div>

          {/* Summary stats */}
          <div className="space-y-3">
            <div className="rounded border p-3">
              <div className="text-xs text-gray-500">Total New Starts</div>
              <div className="text-2xl font-bold" style={{ color: TP.navy }}>{WEEKEND_PATIENTS.length}</div>
            </div>
            <div className="rounded border p-3">
              <div className="text-xs text-gray-500">Emily Boazman</div>
              <div className="text-2xl font-bold" style={{ color: TP.green }}>
                {referrerCounts['Emily Boazman'] || 0}
                <span className="text-sm font-normal text-gray-400 ml-2">
                  ({((referrerCounts['Emily Boazman'] || 0) / WEEKEND_PATIENTS.length * 100).toFixed(0)}%)
                </span>
              </div>
            </div>
            <div className="rounded border p-3">
              <div className="text-xs text-gray-500">No Referrer Listed</div>
              <div className="text-2xl font-bold" style={{ color: TP.yellow }}>
                {referrerCounts['Unknown'] || 0}
                <span className="text-sm font-normal text-gray-400 ml-2">
                  ({((referrerCounts['Unknown'] || 0) / WEEKEND_PATIENTS.length * 100).toFixed(0)}%)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Patient list table */}
      <div className="bg-white rounded-lg border p-5">
        <h4 className="text-sm font-semibold mb-2" style={{ color: TP.navy }}>
          All {WEEKEND_PATIENTS.length} Patients — May 16-17
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2" style={{ borderColor: TP.navy }}>
                <th className="text-left py-2 px-2">#</th>
                <th className="text-left py-2 px-2">Name</th>
                <th className="text-left py-2 px-2">Referrer</th>
                <th className="text-center py-2 px-2">Info Complete</th>
                <th className="text-center py-2 px-2">Photos Uploaded</th>
              </tr>
            </thead>
            <tbody>
              {WEEKEND_PATIENTS.map((p, i) => (
                <tr key={i} className="border-b hover:bg-gray-50">
                  <td className="py-1.5 px-2 text-gray-400">{i + 1}</td>
                  <td className="py-1.5 px-2 font-medium">{p.name}</td>
                  <td className="py-1.5 px-2">
                    {p.referrer === 'Unknown' ? (
                      <span className="text-gray-400">—</span>
                    ) : (
                      <span className="text-xs px-1.5 py-0.5 rounded" style={{
                        background: p.referrer === 'Emily Boazman' ? TP.green + '30' :
                                   p.referrer === 'Toothpillow Instagram' ? TP.blue + '30' :
                                   TP.yellow + '30',
                        color: TP.navy,
                      }}>
                        {p.referrer}
                      </span>
                    )}
                  </td>
                  <td className="py-1.5 px-2 text-center">
                    {p.infoComplete === true ? '✓' : p.infoComplete === false ? '✗' : '—'}
                  </td>
                  <td className="py-1.5 px-2 text-center">
                    {p.photosUploaded === true ? '✓' : p.photosUploaded === false ? '✗' : '—'}
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

function StatCard({ label, value, sub, alert }: { label: string; value: string; sub: string; alert?: boolean }) {
  return (
    <div className={`rounded-lg border p-4 ${alert ? 'border-red-300 bg-red-50' : 'bg-white'}`}>
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className="text-xl font-bold" style={{ color: TP.navy }}>{value}</div>
      <div className="text-xs text-gray-400 mt-1">{sub}</div>
    </div>
  );
}
