'use client';

import { useMemo } from 'react';
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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const TP = {
  blue: '#3A6EA4', skyBlue: '#B6CAE3', lightBlue: '#D6E5F7', cream: '#FEF8EE',
  green: '#8CD1C8', yellow: '#FDBE67', peach: '#FBCCC5', red: '#DD5759',
  darkPurple: '#B26CA6', lightPurple: '#DDBBD9', bubblegum: '#F6AACB',
  maroon: '#D46476', text: '#333333', navy: '#1B2A4A',
};

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
const FUNNEL_TOTAL = 92;

interface IncompletePatient {
  name: string;
  referrer: string;
  questionnaireComplete?: boolean | null;
  photosCompleted?: boolean | null;
}

const INCOMPLETE_ASSESSMENTS: IncompletePatient[] = [
  { name: 'Jackson Coyne', referrer: 'Facebook', questionnaireComplete: true, photosCompleted: false },
  { name: 'Forrest Dow', referrer: 'Lauren', questionnaireComplete: true, photosCompleted: false },
  { name: 'Aleia Rodriguez', referrer: '', questionnaireComplete: true, photosCompleted: false },
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
  const referrerGroups = useMemo(() => {
    const counts: Record<string, number> = {};
    INCOMPLETE_ASSESSMENTS.forEach(p => {
      let ref = p.referrer || 'No referrer listed';
      if (ref.toLowerCase().includes('emily bo')) ref = 'Emily Boazman';
      if (ref.toLowerCase() === 'alexclark') ref = 'Alex Clark';
      counts[ref] = (counts[ref] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, []);

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

  const refColors = [TP.green, TP.blue, TP.yellow, TP.red, TP.darkPurple, TP.bubblegum, TP.peach, TP.skyBlue, TP.maroon, TP.lightPurple];
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
        <h2 className="text-xl font-bold" style={{ color: TP.navy }}>Assessment Completion Bottleneck</h2>
        <p className="text-sm text-gray-500 mt-1">Where are assessments getting stuck? Tracking the 60 incomplete assessments from the May 16-17 weekend sample.</p>
      </div>

      {/* Header section */}
      <div className="border-l-4 pl-4" style={{ borderColor: TP.red }}>
        <h3 className="text-lg font-bold" style={{ color: TP.navy }}>Weekend Sample (May 16-17, 2026)</h3>
        <p className="text-sm text-gray-500 mt-1">
          92 children started an assessment this weekend (87 blank-stage parent records excluded). 60 are stuck at &quot;WAITING - Needs Info&quot; &mdash; that&apos;s {(60 / FUNNEL_TOTAL * 100).toFixed(0)}% of all assessment starts sitting incomplete.
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
            <div className="text-2xl font-bold" style={{ color: TP.green }}>Emily Boazman <span className="text-sm font-normal text-gray-500">&mdash; 24 (40%)</span></div>
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
          60 Incomplete Assessments &mdash; Drip Reminder Tracking
        </h4>
        <p className="text-xs text-gray-400 mb-3">
          Track what happens after drip reminders. &quot;Questionnaire&quot; = filled out child info. &quot;Photos&quot; = uploaded required photos. Both must be complete for assessment to move forward.
        </p>

        {/* Status summary cards */}
        {(() => {
          const qYes = INCOMPLETE_ASSESSMENTS.filter(p => p.questionnaireComplete === true).length;
          const qNo = INCOMPLETE_ASSESSMENTS.filter(p => p.questionnaireComplete === false).length;
          const pYes = INCOMPLETE_ASSESSMENTS.filter(p => p.photosCompleted === true).length;
          const pNo = INCOMPLETE_ASSESSMENTS.filter(p => p.photosCompleted === false).length;
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
                    ) : <span className="text-gray-400">&mdash;</span>}
                  </td>
                  <td className="py-1 px-2 text-center">
                    {p.questionnaireComplete === true ? (
                      <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700 font-medium">Done</span>
                    ) : p.questionnaireComplete === false ? (
                      <span className="text-xs px-2 py-0.5 rounded bg-red-100 text-red-600 font-medium">No</span>
                    ) : (
                      <span className="text-gray-300">&mdash;</span>
                    )}
                  </td>
                  <td className="py-1 px-2 text-center">
                    {p.photosCompleted === true ? (
                      <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700 font-medium">Done</span>
                    ) : p.photosCompleted === false ? (
                      <span className="text-xs px-2 py-0.5 rounded bg-red-100 text-red-600 font-medium">No</span>
                    ) : (
                      <span className="text-gray-300">&mdash;</span>
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
