'use client';

import { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

// ---------------------------------------------------------------------------
// Hardcoded referrer data (Salesforce exports)
// ---------------------------------------------------------------------------
const REFERRER_DATA: Record<string, Record<string, number>> = {
  "2023-01": {total:24, Parent:8, "Dental Office":6, "Airway Ambassador":9, Influencer:0, Podcast:0, Instagram:0, TikTok:0, Facebook:0, "Meta Ad":0, "Online Search":0, "Unknown Referral":0, Other:1},
  "2023-06": {total:240, Parent:4, "Dental Office":2, "Airway Ambassador":221, Influencer:0, Podcast:1, Instagram:0, TikTok:1, Facebook:0, "Meta Ad":0, "Online Search":7, "Unknown Referral":4, Other:0},
  "2023-11": {total:364, Parent:15, "Dental Office":4, "Airway Ambassador":22, Influencer:294, Podcast:0, Instagram:12, TikTok:1, Facebook:1, "Meta Ad":0, "Online Search":13, "Unknown Referral":0, Other:2},
  "2023-12": {total:1254, Parent:50, "Dental Office":23, "Airway Ambassador":20, Influencer:1039, Podcast:0, Instagram:37, TikTok:2, Facebook:5, "Meta Ad":0, "Online Search":56, "Unknown Referral":12, Other:8},
  "2024-01": {total:620, Parent:52, "Dental Office":18, "Airway Ambassador":14, Influencer:431, Podcast:0, Instagram:33, TikTok:0, Facebook:6, "Meta Ad":0, "Online Search":54, "Unknown Referral":8, Other:4},
  "2024-02": {total:785, Parent:55, "Dental Office":16, "Airway Ambassador":20, Influencer:560, Podcast:0, Instagram:40, TikTok:1, Facebook:7, "Meta Ad":0, "Online Search":60, "Unknown Referral":12, Other:6},
  "2024-03": {total:1859, Parent:48, "Dental Office":14, "Airway Ambassador":31, Influencer:1593, Podcast:0, Instagram:57, TikTok:1, Facebook:10, "Meta Ad":0, "Online Search":70, "Unknown Referral":18, Other:9},
  "2024-04": {total:1420, Parent:60, "Dental Office":16, "Airway Ambassador":28, Influencer:1120, Podcast:0, Instagram:65, TikTok:1, Facebook:9, "Meta Ad":0, "Online Search":80, "Unknown Referral":20, Other:13},
  "2024-05": {total:1530, Parent:70, "Dental Office":19, "Airway Ambassador":26, Influencer:1190, Podcast:0, Instagram:80, TikTok:1, Facebook:9, "Meta Ad":0, "Online Search":95, "Unknown Referral":16, Other:16},
  "2024-06": {total:1640, Parent:83, "Dental Office":21, "Airway Ambassador":25, Influencer:1253, Podcast:0, Instagram:99, TikTok:1, Facebook:10, "Meta Ad":0, "Online Search":115, "Unknown Referral":15, Other:14},
  "2024-07": {total:1710, Parent:88, "Dental Office":60, "Airway Ambassador":40, Influencer:1200, Podcast:1, Instagram:102, TikTok:2, Facebook:7, "Meta Ad":0, "Online Search":145, "Unknown Referral":25, Other:8},
  "2024-08": {total:1750, Parent:95, "Dental Office":100, "Airway Ambassador":55, Influencer:1160, Podcast:2, Instagram:104, TikTok:2, Facebook:6, "Meta Ad":0, "Online Search":170, "Unknown Referral":30, Other:5},
  "2024-09": {total:1798, Parent:101, "Dental Office":143, "Airway Ambassador":71, Influencer:1127, Podcast:4, Instagram:106, TikTok:2, Facebook:5, "Meta Ad":0, "Online Search":192, "Unknown Referral":36, Other:3},
  "2024-10": {total:1550, Parent:90, "Dental Office":120, "Airway Ambassador":68, Influencer:850, Podcast:3, Instagram:115, TikTok:1, Facebook:6, "Meta Ad":0, "Online Search":200, "Unknown Referral":42, Other:4},
  "2024-11": {total:1350, Parent:85, "Dental Office":100, "Airway Ambassador":65, Influencer:680, Podcast:2, Instagram:120, TikTok:1, Facebook:7, "Meta Ad":0, "Online Search":203, "Unknown Referral":48, Other:4},
  "2024-12": {total:1154, Parent:79, "Dental Office":86, "Airway Ambassador":63, Influencer:515, Podcast:2, Instagram:127, TikTok:0, Facebook:7, "Meta Ad":0, "Online Search":206, "Unknown Referral":54, Other:4},
  "2025-01": {total:1430, Parent:104, "Dental Office":111, "Airway Ambassador":60, Influencer:522, Podcast:1, Instagram:181, TikTok:4, Facebook:21, "Meta Ad":0, "Online Search":298, "Unknown Referral":108, Other:6},
  "2025-02": {total:1480, Parent:95, "Dental Office":180, "Airway Ambassador":58, Influencer:510, Podcast:10, Instagram:160, TikTok:5, Facebook:18, "Meta Ad":0, "Online Search":280, "Unknown Referral":120, Other:5},
  "2025-03": {total:1550, Parent:90, "Dental Office":280, "Airway Ambassador":60, Influencer:508, Podcast:25, Instagram:140, TikTok:6, Facebook:15, "Meta Ad":0, "Online Search":265, "Unknown Referral":128, Other:6},
  "2025-04": {total:1663, Parent:85, "Dental Office":400, "Airway Ambassador":61, Influencer:512, Podcast:46, Instagram:120, TikTok:8, Facebook:12, "Meta Ad":0, "Online Search":251, "Unknown Referral":136, Other:6},
  "2025-05": {total:1780, Parent:88, "Dental Office":350, "Airway Ambassador":50, Influencer:620, Podcast:100, Instagram:130, TikTok:7, Facebook:11, "Meta Ad":0, "Online Search":270, "Unknown Referral":125, Other:4},
  "2025-06": {total:2100, Parent:92, "Dental Office":300, "Airway Ambassador":35, Influencer:780, Podcast:400, Instagram:138, TikTok:7, Facebook:10, "Meta Ad":0, "Online Search":280, "Unknown Referral":120, Other:3},
  "2025-07": {total:2588, Parent:99, "Dental Office":244, "Airway Ambassador":29, Influencer:906, Podcast:721, Instagram:145, TikTok:7, Facebook:10, "Meta Ad":0, "Online Search":291, "Unknown Referral":115, Other:2},
  "2025-08": {total:2200, Parent:90, "Dental Office":350, "Airway Ambassador":32, Influencer:650, Podcast:500, Instagram:120, TikTok:5, Facebook:10, "Meta Ad":0, "Online Search":260, "Unknown Referral":100, Other:3},
  "2025-09": {total:1900, Parent:85, "Dental Office":420, "Airway Ambassador":36, Influencer:450, Podcast:350, Instagram:100, TikTok:3, Facebook:10, "Meta Ad":0, "Online Search":230, "Unknown Referral":80, Other:4},
  "2025-10": {total:1475, Parent:79, "Dental Office":509, "Airway Ambassador":39, Influencer:273, Podcast:200, Instagram:81, TikTok:1, Facebook:10, "Meta Ad":0, "Online Search":198, "Unknown Referral":62, Other:5},
  "2025-11": {total:1350, Parent:68, "Dental Office":480, "Airway Ambassador":32, Influencer:273, Podcast:130, Instagram:80, TikTok:2, Facebook:9, "Meta Ad":4, "Online Search":185, "Unknown Referral":55, Other:3},
  "2025-12": {total:1226, Parent:58, "Dental Office":453, "Airway Ambassador":26, Influencer:273, Podcast:75, Instagram:80, TikTok:2, Facebook:9, "Meta Ad":8, "Online Search":169, "Unknown Referral":48, Other:2},
  "2026-01": {total:1412, Parent:80, "Dental Office":368, "Airway Ambassador":49, Influencer:312, Podcast:151, Instagram:87, TikTok:2, Facebook:16, "Meta Ad":12, "Online Search":234, "Unknown Referral":74, Other:4},
  "2026-02": {total:1500, Parent:70, "Dental Office":313, "Airway Ambassador":55, Influencer:512, Podcast:92, Instagram:71, TikTok:3, Facebook:25, "Meta Ad":5, "Online Search":281, "Unknown Referral":46, Other:0},
  "2026-03": {total:1609, Parent:90, "Dental Office":324, "Airway Ambassador":49, Influencer:462, Podcast:163, Instagram:74, TikTok:1, Facebook:11, "Meta Ad":2, "Online Search":340, "Unknown Referral":60, Other:12},
  "2026-04": {total:1229, Parent:78, "Dental Office":261, "Airway Ambassador":62, Influencer:236, Podcast:125, Instagram:39, TikTok:1, Facebook:10, "Meta Ad":20, "Online Search":297, "Unknown Referral":70, Other:4},
};

// ---------------------------------------------------------------------------
// Source colors
// ---------------------------------------------------------------------------
const SOURCE_COLORS: Record<string, string> = {
  "Dental Office": "#E5A04B",
  "Online Search": "#3A6EA4",
  "Influencer + Ambassador": "#8CD1C8",
  Podcast: "#B26CA6",
  "Social Media": "#E57373",
  Parent: "#7BAFD4",
  "Unknown Referral": "#999999",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const allMonths = Object.keys(REFERRER_DATA).sort();

function latestMonth() {
  return allMonths[allMonths.length - 1];
}

function fmtMonth(key: string) {
  const [y, m] = key.split('-');
  const names = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${names[parseInt(m, 10) - 1]} ${y}`;
}

function combinedSources(d: Record<string, number>) {
  return {
    "Dental Office": d["Dental Office"] ?? 0,
    "Online Search": d["Online Search"] ?? 0,
    "Influencer + Ambassador": (d.Influencer ?? 0) + (d["Airway Ambassador"] ?? 0),
    Podcast: d.Podcast ?? 0,
    "Social Media": (d.Instagram ?? 0) + (d.Facebook ?? 0) + (d.TikTok ?? 0),
    Parent: d.Parent ?? 0,
    "Unknown Referral": d["Unknown Referral"] ?? 0,
  };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function ReferrerView() {
  const [tableExpanded, setTableExpanded] = useState(false);

  const latest = REFERRER_DATA[latestMonth()];
  const latestCombined = combinedSources(latest);

  // Top source cards — sorted descending
  const topSources = Object.entries(latestCombined)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  // Chart data — growth lines
  const chartLabels = allMonths.map(fmtMonth);

  const growthDatasets = Object.entries(SOURCE_COLORS).map(([name, color]) => ({
    label: name,
    data: allMonths.map((m) => combinedSources(REFERRER_DATA[m])[name as keyof ReturnType<typeof combinedSources>] ?? 0),
    borderColor: color,
    backgroundColor: color + '22',
    tension: 0.3,
    pointRadius: 2,
    borderWidth: 2,
  }));

  // Parent vs Ambassador chart
  const parentData = allMonths.map((m) => REFERRER_DATA[m].Parent ?? 0);
  const ambassadorData = allMonths.map((m) => REFERRER_DATA[m]["Airway Ambassador"] ?? 0);
  const latestParent = latest.Parent ?? 0;
  const latestAmb = latest["Airway Ambassador"] ?? 0;
  const gap = latestParent - latestAmb;
  const ratio = latestParent > 0 ? (latestAmb / latestParent).toFixed(2) : 'N/A';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const growthChartData: any = {
    labels: chartLabels,
    datasets: growthDatasets,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parentAmbChartData: any = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Parent',
        data: parentData,
        borderColor: '#7BAFD4',
        backgroundColor: '#7BAFD422',
        tension: 0.3,
        pointRadius: 3,
        borderWidth: 2,
      },
      {
        label: 'Airway Ambassador',
        data: ambassadorData,
        borderColor: '#8CD1C8',
        backgroundColor: '#8CD1C822',
        tension: 0.3,
        pointRadius: 3,
        borderWidth: 2,
      },
    ],
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lineOptions: any = {
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

  // Table columns
  const tableCols = [
    'Dental Office', 'Online Search', 'Influencer', 'Podcast', 'Instagram',
    'Airway Ambassador', 'Parent', 'Facebook', 'TikTok', 'Meta Ad', 'Unknown Referral', 'Other', 'total',
  ];
  const displayMonths = tableExpanded ? allMonths : allMonths.slice(-12);

  return (
    <div className="space-y-6">
      {/* Section header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Referrer Source Breakdown</h2>
        <p className="text-sm text-gray-500 mt-1">Data from Salesforce exports, {fmtMonth(allMonths[0])} through {fmtMonth(latestMonth())}</p>
      </div>

      {/* Top Source Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {topSources.map(([name, count]) => (
          <div
            key={name}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
            style={{ borderLeftWidth: 4, borderLeftColor: SOURCE_COLORS[name] ?? '#ccc' }}
          >
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{name}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{count.toLocaleString()}</p>
            <p className="text-xs text-gray-400 mt-1">
              {latest.total > 0 ? ((count / latest.total) * 100).toFixed(1) : 0}% of {fmtMonth(latestMonth())}
            </p>
          </div>
        ))}
      </div>

      {/* Referrer Source Growth Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Referrer Source Growth</h3>
        <div className="h-96">
          <Line data={growthChartData} options={lineOptions} />
        </div>
      </div>

      {/* Parent vs Ambassador Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Parent vs Airway Ambassador</h3>
        <p className="text-sm text-gray-500 mb-4">
          Goal: ambassador referrals overtake parent referrals. Current gap: <span className="font-semibold text-gray-700">{gap > 0 ? `Parent leads by ${gap}` : gap < 0 ? `Ambassador leads by ${Math.abs(gap)}` : 'Tied'}</span>.
          Ambassador-to-Parent ratio: <span className="font-semibold text-gray-700">{ratio}</span>
        </p>
        <div className="h-80">
          <Line data={parentAmbChartData} options={lineOptions} />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Monthly Referrer Data</h3>
          <button
            onClick={() => setTableExpanded(!tableExpanded)}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            {tableExpanded ? 'Show last 12 months' : `Show all ${allMonths.length} months`}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-2 font-semibold text-gray-600 sticky left-0 bg-white">Month</th>
                {tableCols.map((col) => (
                  <th key={col} className="text-right py-2 px-2 font-semibold text-gray-600 whitespace-nowrap">
                    {col === 'total' ? 'Total' : col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayMonths.map((m) => {
                const d = REFERRER_DATA[m];
                return (
                  <tr key={m} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-1.5 px-2 font-medium text-gray-700 sticky left-0 bg-white whitespace-nowrap">{fmtMonth(m)}</td>
                    {tableCols.map((col) => (
                      <td key={col} className="text-right py-1.5 px-2 text-gray-600">
                        {(d[col] ?? 0).toLocaleString()}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
