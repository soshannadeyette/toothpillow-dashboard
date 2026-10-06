'use client';

import { useState, type ReactNode } from 'react';
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
import annotationPlugin from 'chartjs-plugin-annotation';
import { Bar } from 'react-chartjs-2';
import { monthly, weekly, daily, byTC, bySegment, summary, events, eventCategoryColor, tcMonthly, monthlyMetrics, segMonthly, capacity, dow, conversionMonthly, conversionByReferrer, funnelStages, convSummary, conversionMatureThrough, sourceMonthly, sourceOrder, sourceColors, diagnosisMonthly, priceIncreaseMonth, simMonthly, type EventRow } from '@/data/enrollmentCheckouts';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, annotationPlugin);

const TP = {
  blue: '#3A6EA4',
  skyBlue: '#B6CAE3',
  green: '#8CD1C8',
  yellow: '#FDBE67',
  navy: '#1B2A4A',
  text: '#333333',
};

const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const monLabel = (ym: string) => `${MON[parseInt(ym.slice(5, 7), 10) - 1]} ${ym.slice(0, 4)}`;
const money = (n: number) => '$' + Math.round(n).toLocaleString();
const segTotal = (seg: string) => bySegment.find((s) => s.segment === seg)?.checkouts ?? 0;
// blue heat for the per-TC x month grid
const heat = (v: number, max: number) => (v === 0 ? '#f8fafc' : `rgba(58,110,164,${0.12 + 0.78 * (v / max)})`);
const heatText = (v: number, max: number) => (v / max > 0.55 ? '#fff' : TP.text);

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'diagnosis', label: 'Why (May break)' },
  { id: 'efsim', label: 'Expanders sim' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'events', label: 'Events' },
  { id: 'conversion', label: 'Conversion' },
  { id: 'leadsource', label: 'Lead Source' },
  { id: 'coordinator', label: 'By Coordinator' },
  { id: 'speed', label: 'Speed' },
  { id: 'segments', label: 'New vs Win-back' },
  { id: 'revenue', label: 'Revenue' },
] as const;
type TabId = (typeof TABS)[number]['id'];

const baseOpts = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: { y: { beginAtZero: true } },
};

function Card({ children }: { children: ReactNode }) {
  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, background: '#fff', marginBottom: 20 }}>
      {children}
    </div>
  );
}

function Th({ children, right }: { children: ReactNode; right?: boolean }) {
  return (
    <th style={{ textAlign: right ? 'right' : 'left', padding: '8px 12px', borderBottom: '2px solid #e5e7eb', fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
      {children}
    </th>
  );
}
function Td({ children, right, bold }: { children: ReactNode; right?: boolean; bold?: boolean }) {
  return (
    <td style={{ textAlign: right ? 'right' : 'left', padding: '8px 12px', borderBottom: '1px solid #f1f1f1', fontSize: 14, fontWeight: bold ? 600 : 400, color: TP.text }}>
      {children}
    </td>
  );
}

export default function EnrollmentView() {
  const [tab, setTab] = useState<TabId>('overview');

  return (
    <div>
      {/* Source line + summary — hidden on the Overview (it has its own exec KPIs) */}
      {tab !== 'overview' && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, color: '#6b7280' }}>Checkouts · Jan 1 – Oct 5, 2026 · from Salesforce</div>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginTop: 10 }}>
            <Stat label="Checkouts (YTD)" value={summary.checkouts.toLocaleString()} />
            <Stat label="Collected" value={money(summary.amountPaid)} />
            <Stat label="Total plan value" value={money(summary.totalAmountPaid)} />
            <Stat label="Avg deal (plan)" value={money(summary.totalAmountPaid / summary.checkouts)} />
            <Stat label="New (Lava) / Win-back (Ice)" value={`${segTotal('Lava')} / ${segTotal('Ice')}`} />
          </div>
        </div>
      )}

      {/* Sub-tab bar */}
      <nav className="bg-white" style={{ borderBottom: '2px solid #e0e0e0', marginBottom: 20 }}>
        <div className="flex gap-1 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                tab === t.id
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      {tab === 'overview' && <OverviewTab />}
      {tab === 'diagnosis' && <DiagnosisTab />}
      {tab === 'efsim' && <ExpandersSimTab />}
      {tab === 'monthly' && <MonthlyTab />}
      {tab === 'weekly' && <WeeklyTab />}
      {tab === 'events' && <EventsTab />}
      {tab === 'conversion' && <ConversionTab />}
      {tab === 'leadsource' && <LeadSourceTab />}
      {tab === 'coordinator' && <CoordinatorTab />}
      {tab === 'speed' && <SpeedTab />}
      {tab === 'segments' && <SegmentsTab />}
      {tab === 'revenue' && <RevenueTab />}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: '#6b7280' }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: TP.navy }}>{value}</div>
    </div>
  );
}

function ExpandersSimTab() {
  const [fPct, setFPct] = useState(10); // % of EF kids who would otherwise have been standard-approved
  const f = fPct / 100;
  const labels = simMonthly.map((s) => monLabel(s.month).replace(' 2026', ''));
  const actual = simMonthly.map((s) => s.enroll);
  // counterfactual: remove actual EF checkouts, add what the f-fraction would convert at standard
  const noEF = simMonthly.map((s) => Math.round(s.enroll - s.efCo + s.efRec * f * (s.stdConv / 100)));
  const actualYTD = actual.reduce((a, b) => a + b, 0);
  const noEFYTD = noEF.reduce((a, b) => a + b, 0);
  const delta = actualYTD - noEFYTD; // >0 = EF added enrollments
  return (
    <>
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 14 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: TP.navy }}>
            Assume <span style={{ color: TP.blue, fontSize: 18 }}>{fPct}%</span> of expander kids would&apos;ve been standard-approved
          </label>
          <input type="range" min={0} max={100} value={fPct} onChange={(e) => setFPct(parseInt(e.target.value, 10))} style={{ flex: 1, minWidth: 220, accentColor: TP.blue }} />
        </div>
        <div style={{ marginBottom: 12, fontSize: 14, fontWeight: 700, color: delta >= 0 ? '#1a7f5a' : '#c0392b' }}>
          At {fPct}%: Expanders First {delta >= 0 ? 'ADDED' : 'COST'} ~{Math.abs(delta).toLocaleString()} enrollments YTD
          <span style={{ fontWeight: 400, color: '#6b7280', fontSize: 12 }}> ({actualYTD.toLocaleString()} actual vs {noEFYTD.toLocaleString()} without EF)</span>
        </div>
        <div style={{ height: 340 }}>
          <Bar
            data={{
              labels,
              datasets: [
                { type: 'bar' as const, label: 'Actual enrollments', data: actual, backgroundColor: `${TP.skyBlue}B3`, borderRadius: 3, order: 3 },
                // @ts-expect-error mixed line
                { type: 'line' as const, label: 'If no Expanders First', data: noEF, borderColor: '#8B5CF6', backgroundColor: '#8B5CF6', borderWidth: 2.5, pointRadius: 3, borderDash: [6, 3], tension: 0.3, order: 1 },
                // @ts-expect-error mixed line
                { type: 'line' as const, label: 'Actual (line)', data: actual, borderColor: TP.blue, backgroundColor: TP.blue, borderWidth: 2.5, pointRadius: 3, tension: 0.3, order: 2 },
              ],
            }}
            options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true, position: 'top' as const } }, scales: { y: { beginAtZero: true, title: { display: true, text: 'Enrollments / month' } } } }}
          />
        </div>
        <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 8 }}>By submission cohort. Aug–Oct still maturing. Counterfactual: would-be-standard EF kids convert at that month&apos;s standard rate; the rest (denials) convert at 0.</div>
      </Card>
    </>
  );
}

function DiagnosisTab() {
  const labels = diagnosisMonthly.map((d) => monLabel(d.month).replace(' 2026', ''));
  const mayIdx = diagnosisMonthly.findIndex((d) => d.month === '2026-05');
  const julIdx = diagnosisMonthly.findIndex((d) => d.month === priceIncreaseMonth);
  const breakLines: Record<string, object> = {
    mayBreak: { type: 'line', xMin: mayIdx, xMax: mayIdx, borderColor: '#c0392b', borderWidth: 2, label: { display: true, content: 'conversion breaks (May)', position: 'start' as const, backgroundColor: '#c0392b', color: '#fff', font: { size: 10, weight: 'bold' as const }, padding: { x: 5, y: 2 } } },
    priceInc: { type: 'line', xMin: julIdx, xMax: julIdx, borderColor: '#9ca3af', borderWidth: 2, borderDash: [5, 3], label: { display: true, content: 'price increase (Jul)', position: 'end' as const, backgroundColor: '#9ca3af', color: '#fff', font: { size: 10, weight: 'bold' as const }, padding: { x: 5, y: 2 } } },
  };
  // expander line: null out tiny-N early months so the noise doesn't show
  const expLine = diagnosisMonthly.map((d) => (d.expShare >= 3 ? d.expConv : null));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stdExpData: any = {
    labels,
    datasets: [
      { type: 'line' as const, label: 'Standard approvals', data: diagnosisMonthly.map((d) => d.stdConv), borderColor: TP.blue, backgroundColor: TP.blue, borderWidth: 2.5, pointRadius: 3, tension: 0.3 },
      { type: 'line' as const, label: 'Expanders First', data: expLine, borderColor: '#8B5CF6', backgroundColor: '#8B5CF6', borderWidth: 2.5, pointRadius: 3, tension: 0.3, spanGaps: false },
    ],
  };
  // Shift-share decomposition of the Feb–Apr → Jun–Jul conversion change (both mature)
  const wfData = [
    [0, 27.7],       // baseline
    [20.7, 27.7],    // standard pool converts worse: -7.0
    [20.7, 22.9],    // mix shift (denials -> approvals/expanders) + other: +2.2
    [0, 22.9],       // now
  ];
  return (
    <>
      <Card>
        <h3 style={{ margin: '0 0 2px', color: TP.navy, fontWeight: 600 }}>What moved conversion: Feb–Apr → now (decomposition)</h3>
        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 12 }}>Breaks the 4.8-pt conversion change into its parts. The <b>standard-approval pool converting worse</b> accounts for −7.0 pts (more than the whole drop); the <b>recommendation mix shift</b> (fewer denials, more expanders/approvals) is <b>+2.2 pts — it helped</b>. If the standard pool had held its rate, conversion today would be ~29.9%, above baseline.</div>
        <div style={{ height: 300 }}>
          <Bar
            data={{
              labels: ['Baseline (Feb–Apr) 27.7%', 'Standard pool converts worse  −7.0', 'Mix shift (denials→appr./exp.)  +2.2', 'Now (Jun–Jul) 22.9%'],
              datasets: [{ label: 'Conversion %', data: wfData, backgroundColor: [TP.navy, '#e06666', '#6AA84F', TP.blue], borderRadius: 3 }],
            }}
            options={{ ...baseOpts, scales: { y: { beginAtZero: true, suggestedMax: 32, title: { display: true, text: 'Conversion %' } }, x: { ticks: { maxRotation: 0, autoSkip: false, font: { size: 10 } } } } }}
          />
        </div>
      </Card>

      <Card>
        <h3 style={{ margin: '0 0 2px', color: TP.navy, fontWeight: 600 }}>Submissions, enrollments &amp; conversion by month</h3>
        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 12 }}>Bars = submissions &amp; enrollments (left axis). Line = conversion rate (right axis). Markers: the May conversion break and the July price increase.</div>
        <div style={{ height: 360 }}>
          <Bar
            data={{
              labels,
              datasets: [
                { type: 'bar' as const, label: 'Submissions', data: diagnosisMonthly.map((d) => d.submissions), backgroundColor: `${TP.skyBlue}B3`, borderRadius: 3, yAxisID: 'y', order: 4 },
                { type: 'bar' as const, label: 'Enrollments (checkouts)', data: monthly.map((m) => m.checkouts), backgroundColor: TP.blue, borderRadius: 3, yAxisID: 'y', order: 3 },
                // @ts-expect-error mixed line
                { type: 'line' as const, label: 'Conversion %', data: diagnosisMonthly.map((d) => d.convRate), borderColor: '#c0392b', backgroundColor: '#c0392b', borderWidth: 3, pointRadius: 3, yAxisID: 'y1', order: 1 },
              ],
            }}
            options={{
              responsive: true, maintainAspectRatio: false,
              plugins: { legend: { display: true, position: 'top' as const }, annotation: { annotations: breakLines } },
              scales: {
                y: { beginAtZero: true, position: 'left' as const, title: { display: true, text: 'People' } },
                y1: { beginAtZero: true, max: 50, position: 'right' as const, grid: { drawOnChartArea: false }, title: { display: true, text: 'Conversion %' } },
              },
            }}
          />
        </div>
        <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 8 }}>Aug–Oct conversion is still maturing (recent cohorts).</div>
      </Card>

      <Card>
        <h3 style={{ margin: '0 0 2px', color: TP.navy, fontWeight: 600 }}>Conversion by recommendation: standard vs Expanders First</h3>
        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 12 }}>Conversion of <b>standard (non-expander) approvals</b> vs <b>Expanders First</b>, by submission month. (Expanders line starts May; earlier months are too small to read.)</div>
        <div style={{ height: 300 }}>
          <Bar data={stdExpData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true, position: 'top' as const }, annotation: { annotations: breakLines } }, scales: { y: { beginAtZero: true, title: { display: true, text: 'Conversion %' } } } }} />
        </div>
      </Card>

      <Card>
        <h3 style={{ margin: '0 0 2px', color: TP.navy, fontWeight: 600 }}>Referred / denied share by submission month</h3>
        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 12 }}>Share of submissions the doctor referred out or denied.</div>
        <div style={{ height: 240 }}>
          <Bar data={{ labels, datasets: [{ label: 'Referred / denied %', data: diagnosisMonthly.map((d) => d.rejectShare), backgroundColor: TP.yellow, borderRadius: 4 }] }} options={{ ...baseOpts, scales: { y: { beginAtZero: true, title: { display: true, text: '% of submissions' } } } }} />
        </div>
      </Card>
    </>
  );
}

function OverviewTab() {
  const overall = (100 * convSummary.checkouts) / convSummary.submissions;
  const linkPct = (100 * convSummary.linkSent) / convSummary.submissions;
  const lostNoLink = convSummary.submissions - convSummary.linkSent;
  const lostAtPay = convSummary.linkSent - convSummary.checkouts;
  const funnel = [
    { label: 'Submitted (2026 leads)', n: convSummary.submissions, pct: 100, color: TP.navy, lost: lostNoLink, lostNote: 'never got a checkout link' },
    { label: 'Got a checkout link', n: convSummary.linkSent, pct: linkPct, color: TP.blue, lost: lostAtPay, lostNote: 'got a link but never checked out' },
    { label: 'Checked out', n: convSummary.checkouts, pct: overall, color: TP.green, lost: 0, lostNote: '' },
  ];
  const top = [...conversionByReferrer].filter((r) => r.referrer !== '(blank)').sort((a, b) => b.rate - a.rate).slice(0, 4);
  const bottom = [...conversionByReferrer].filter((r) => r.referrer !== '(blank)').sort((a, b) => a.rate - b.rate).slice(0, 4);
  const mature = conversionMonthly.filter((m) => m.month <= conversionMatureThrough);
  const matureLabels = mature.map((m) => monLabel(m.month).replace(' 2026', ''));
  const pctAxis = { ...baseOpts, scales: { y: { beginAtZero: true, max: 50, title: { display: true, text: '%' } } } };
  const convLineAnnotations: Record<string, object> = {
    mayDrop: { type: 'box', xMin: 3.5, xMax: 4.5, backgroundColor: 'rgba(224,102,102,0.12)', borderColor: 'rgba(224,102,102,0.5)', borderWidth: 1, label: { display: true, content: 'MAY break', position: { x: 'center', y: 'start' } as const, color: '#c0392b', font: { size: 11, weight: 'bold' as const } } },
    callAdded: { type: 'line', xMin: 3, xMax: 3, borderColor: '#9ca3af', borderWidth: 1.5, borderDash: [5, 3], label: { display: true, content: 'call step added', position: 'end' as const, backgroundColor: '#9ca3af', color: '#fff', font: { size: 9 }, padding: { x: 4, y: 2 } } },
    callRemoved: { type: 'line', xMin: 6, xMax: 6, borderColor: '#9ca3af', borderWidth: 1.5, borderDash: [5, 3], label: { display: true, content: 'call step removed', position: 'end' as const, backgroundColor: '#9ca3af', color: '#fff', font: { size: 9 }, padding: { x: 4, y: 2 } } },
  };

  return (
    <>
      {/* Exec header */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: TP.navy }}>Enrollment — Executive Summary</div>
        <div style={{ fontSize: 12, color: '#9ca3af' }}>2026 year-to-date · as of Oct 5, 2026 · source: Salesforce</div>
      </div>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 18 }}>
        <KPI label="Leads submitted (2026)" value={convSummary.submissions.toLocaleString()} />
        <KPI label="Conversion rate" value={`${overall.toFixed(1)}%`} sub="submission → checkout" accent />
        <KPI label="Checkouts (YTD)" value={summary.checkouts.toLocaleString()} />
        <KPI label="Collected (YTD)" value={money(summary.amountPaid)} />
        <KPI label="Avg deal" value={money(summary.totalAmountPaid / summary.checkouts)} />
      </div>

      {/* Hero funnel */}
      <Card>
        <h3 style={{ margin: '0 0 2px', color: TP.navy, fontWeight: 700, fontSize: 18 }}>The enrollment funnel</h3>
        <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 18 }}>Of every 2026 lead, where they end up. The red numbers are the people we lose at each step.</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {funnel.map((f, i) => (
            <div key={f.label}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 190, textAlign: 'right', fontSize: 14, color: TP.text, fontWeight: 600 }}>{f.label}</div>
                <div style={{ flex: 1, background: '#f1f5f9', borderRadius: 6, overflow: 'hidden', height: 46 }}>
                  <div style={{ width: `${f.pct}%`, minWidth: 110, background: f.color, height: '100%', display: 'flex', alignItems: 'center', paddingLeft: 14, color: '#fff', fontWeight: 700, fontSize: 16, borderRadius: 6, transition: 'width .3s' }}>
                    {f.n.toLocaleString()} <span style={{ fontWeight: 500, fontSize: 12, marginLeft: 8, opacity: 0.85 }}>{f.pct.toFixed(0)}%</span>
                  </div>
                </div>
              </div>
              {i < funnel.length - 1 && (
                <div style={{ marginLeft: 204, fontSize: 12, padding: '3px 0' }}>
                  <span style={{ color: '#c0392b', fontWeight: 700 }}>↓ −{f.lost.toLocaleString()}</span> <span style={{ color: '#9ca3af' }}>{f.lostNote}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Conversion health: two side-by-side + combined */}
      <Card>
        <h3 style={{ margin: '0 0 2px', color: TP.navy, fontWeight: 600 }}>Conversion health — two ways to read it</h3>
        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 14 }}>
          <b>Submission→checkout</b> = overall funnel health (lead quality + nurture + close). <b>Checkout-link→checkout</b> = how well we close once a family is ready to pay. Both have slid this year — so it&apos;s not just lead quality; closing weakened too. Mature months only (Jan–Jul).
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: TP.blue, marginBottom: 6 }}>Submission → checkout</div>
            <div style={{ height: 210 }}>
              <Bar data={{ labels: matureLabels, datasets: [{ type: 'bar' as const, label: 'Sub→CO %', data: mature.map((m) => m.subToCO), backgroundColor: TP.blue, borderRadius: 4 }] }} options={pctAxis} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: TP.green, marginBottom: 6 }}>Checkout link → checkout</div>
            <div style={{ height: 210 }}>
              <Bar data={{ labels: matureLabels, datasets: [{ type: 'bar' as const, label: 'Link→CO %', data: mature.map((m) => m.linkToCO), backgroundColor: TP.green, borderRadius: 4 }] }} options={pctAxis} />
            </div>
          </div>
        </div>
        <div style={{ marginTop: 18 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: TP.navy, marginBottom: 6 }}>Both rates over time — with what changed, when</div>
          <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>Both rates broke in <b>May</b> — two months <b>before</b> July&apos;s price increase, and the schedule-a-call step (added Apr, removed Jul) doesn&apos;t line up either. It&apos;s a shared checkout change in May. See the <b>&quot;Why (May break)&quot;</b> tab for the full diagnosis.</div>
          <div style={{ height: 260 }}>
            <Bar
              data={{
                labels: matureLabels,
                datasets: [
                  // @ts-expect-error mixed line on Bar
                  { type: 'line' as const, label: 'Submission → checkout %', data: mature.map((m) => m.subToCO), borderColor: TP.blue, backgroundColor: TP.blue, borderWidth: 2.5, pointRadius: 3, tension: 0.3 },
                  // @ts-expect-error mixed line on Bar
                  { type: 'line' as const, label: 'Checkout link → checkout %', data: mature.map((m) => m.linkToCO), borderColor: TP.green, backgroundColor: TP.green, borderWidth: 2.5, pointRadius: 3, tension: 0.3 },
                ],
              }}
              options={{
                responsive: true, maintainAspectRatio: false,
                plugins: {
                  legend: { display: true, position: 'top' as const },
                  annotation: { annotations: convLineAnnotations },
                },
                scales: { y: { beginAtZero: true, max: 50, title: { display: true, text: '%' } } },
              }}
            />
          </div>
        </div>
      </Card>

      {/* Channels (full width) */}
      <Card>
        <h3 style={{ margin: '0 0 2px', color: TP.navy, fontWeight: 600 }}>Which channels convert?</h3>
        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 12 }}>Warm/referral sources convert ~2× paid/cold ones. (Overall {overall.toFixed(1)}%. Count = leads sent.)</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#1a7f5a', marginBottom: 4 }}>BEST</div>
            {top.map((r) => <ChannelRow key={r.referrer} r={r} good />)}
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#c0392b', marginBottom: 4 }}>WORST (note the volume)</div>
            {bottom.map((r) => <ChannelRow key={r.referrer} r={r} />)}
          </div>
        </div>
      </Card>

    </>
  );
}

function KPI({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div style={{ border: `1px solid ${accent ? TP.blue : '#e5e7eb'}`, borderRadius: 10, padding: '12px 16px', background: accent ? `${TP.blue}0D` : '#fff' }}>
      <div style={{ fontSize: 12, color: '#6b7280' }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color: TP.navy, lineHeight: 1.1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: '#9ca3af' }}>{sub}</div>}
    </div>
  );
}

function ChannelRow({ r, good }: { r: { referrer: string; submissions: number; rate: number }; good?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '3px 0', fontSize: 13 }}>
      <div style={{ flex: 1, color: TP.text }}>{r.referrer} <span style={{ color: '#9ca3af', fontSize: 11 }}>({r.submissions.toLocaleString()})</span></div>
      <div style={{ width: 120, background: '#f1f5f9', borderRadius: 4, height: 16, overflow: 'hidden' }}>
        <div style={{ width: `${Math.min(100, r.rate * 2.5)}%`, height: '100%', background: good ? TP.green : '#e06666', borderRadius: 4 }} />
      </div>
      <div style={{ width: 44, textAlign: 'right', fontWeight: 700, color: good ? '#1a7f5a' : '#c0392b' }}>{r.rate}%</div>
    </div>
  );
}

function MonthlyTab() {
  const labels = monthly.map((m) => monLabel(m.month));
  return (
    <>
      <Card>
        <h3 style={{ margin: '0 0 12px', color: TP.navy, fontWeight: 600 }}>Checkouts by month</h3>
        <div style={{ height: 320 }}>
          <Bar
            data={{ labels, datasets: [{ label: 'Checkouts', data: monthly.map((m) => m.checkouts), backgroundColor: TP.blue, borderRadius: 4 }] }}
            options={baseOpts}
          />
        </div>
      </Card>
      <Card>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr><Th>Month</Th><Th right>Checkouts</Th><Th right>Collected</Th><Th right>Total plan value</Th><Th right>Avg deal (plan)</Th></tr>
          </thead>
          <tbody>
            {monthly.map((m) => (
              <tr key={m.month}>
                <Td bold>{monLabel(m.month)}</Td>
                <Td right>{m.checkouts}</Td>
                <Td right>{money(m.amountPaid)}</Td>
                <Td right>{money(m.totalAmountPaid)}</Td>
                <Td right>{money(m.totalAmountPaid / m.checkouts)}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}

function WeeklyTab() {
  const labels = weekly.map((w) => w.weekStart.slice(5));
  return (
    <>
      <Card>
        <h3 style={{ margin: '0 0 4px', color: TP.navy, fontWeight: 600 }}>Checkouts by week</h3>
        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 12 }}>
          Week starting Sunday (MM-DD). Noisy week to week (partial weeks at month edges swing it) — the By Coordinator and Events tabs show the real trend.
        </div>
        <div style={{ height: 340 }}>
          <Bar
            data={{ labels, datasets: [{ label: 'Checkouts', data: weekly.map((w) => w.checkouts), backgroundColor: TP.blue, borderRadius: 3 }] }}
            options={baseOpts}
          />
        </div>
      </Card>
      <Card>
        <h3 style={{ margin: '0 0 4px', color: TP.navy, fontWeight: 600 }}>Checkouts by day of week</h3>
        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 12 }}>
          Checkouts are a weekday, coordinator-driven business — Wed/Thu peak, weekends near zero. Staffing and link-send timing should follow this.
        </div>
        <div style={{ height: 260 }}>
          <Bar
            data={{ labels: dow.map((d) => d.day), datasets: [{ label: 'Checkouts', data: dow.map((d) => d.checkouts), backgroundColor: dow.map((d) => (d.day === 'Sat' || d.day === 'Sun' ? TP.skyBlue : TP.green)), borderRadius: 4 }] }}
            options={baseOpts}
          />
        </div>
      </Card>
    </>
  );
}

const IMPACT_LABEL: Record<string, string> = { hurt: 'likely hurt', helped: 'likely helped', neutral: 'measurement', tbd: 'watch' };

function dayIndexForDate(dateStr: string) {
  const exact = daily.findIndex((d) => d.date === dateStr);
  if (exact >= 0) return exact;
  const after = daily.findIndex((d) => d.date >= dateStr);
  return after; // -1 if off the end
}

function EventsTab() {
  const [hovered, setHovered] = useState<number | null>(null);
  const labels = daily.map((d) => d.date);
  // trailing 7-day moving average of checkouts
  const ma7 = daily.map((_, i) => {
    const slice = daily.slice(Math.max(0, i - 6), i + 1);
    return slice.reduce((s, d) => s + d.checkouts, 0) / slice.length;
  });

  // Fixed axis so event pins sit in a thin band at the top, leaving the bars full height.
  const dataMax = Math.max(...daily.map((d) => d.checkouts));
  const axisMax = Math.ceil(dataMax / 20) * 20;
  const pinTop = axisMax; // top of chart
  const pinBottom = axisMax * 0.9; // pins occupy only the top ~10%

  // Short pins in the top band. Hovering a pin (line or its number badge) lights up the detail card.
  const annotations: Record<string, object> = {};
  const sameDateCount: Record<string, number> = {};
  events.forEach((e, i) => {
    const idx = dayIndexForDate(e.date);
    if (idx < 0) return;
    const color = eventCategoryColor[e.category];
    const stack = sameDateCount[e.date] ?? 0;
    sameDateCount[e.date] = stack + 1;
    const strong = e.impact === 'hurt' || e.impact === 'helped';
    annotations[`ev${i}`] = {
      type: 'line',
      xMin: idx,
      xMax: idx,
      yMin: pinBottom,
      yMax: pinTop,
      borderColor: color,
      borderWidth: hovered === i ? 4 : strong ? 2.5 : 1.5,
      borderDash: e.impact === 'neutral' ? [3, 3] : undefined,
      enter: () => setHovered(i),
      leave: () => setHovered(null),
      label: {
        display: true,
        content: String(i + 1),
        position: 'start' as const,
        xAdjust: stack * 20, // nudge same-date badges sideways so they don't overlap
        backgroundColor: color,
        color: '#fff',
        font: { size: hovered === i ? 13 : 11, weight: 'bold' as const },
        padding: { x: 6, y: 3 },
        borderRadius: 10,
      },
    };
  });

  const chartWidth = Math.max(1100, daily.length * 9);
  const opts = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index' as const, intersect: false },
    plugins: {
      legend: { display: true, position: 'top' as const },
      annotation: { annotations },
    },
    scales: {
      y: { beginAtZero: true, max: axisMax, title: { display: true, text: 'Checkouts' } },
      x: {
        ticks: {
          autoSkip: false,
          maxRotation: 0,
          callback: function (_v: unknown, index: number) {
            const d = daily[index]?.date;
            if (!d) return '';
            if (d.slice(8) === '01') return MON[parseInt(d.slice(5, 7), 10) - 1];
            return d.slice(8) === '15' ? '·' : '';
          },
        },
        grid: { display: false },
      },
    },
  };

  return (
    <>
      <Card>
        <h3 style={{ margin: '0 0 4px', color: TP.navy, fontWeight: 600 }}>Daily checkouts + 7-day average, with enrollment events</h3>
        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>
          Light bars = daily checkouts. Bold line = 7-day average (the real trend). Numbered pins (top) = events — <b>hover a pin for details</b>, or match the number to the legend below. <b>Scroll sideways →</b> for Jul–Oct. Solid pin = likely moved conversion; dashed = measurement-only.
        </div>
        <CategoryLegend />
        <HoverDetail e={hovered !== null ? events[hovered] : null} n={hovered !== null ? hovered + 1 : null} />
        <div style={{ overflowX: 'auto', overflowY: 'hidden', paddingBottom: 8 }}>
          <div style={{ width: chartWidth, height: 420 }}>
            <Bar
              data={{
                labels,
                datasets: [
                  { type: 'bar' as const, label: 'Daily checkouts', data: daily.map((d) => d.checkouts), backgroundColor: `${TP.skyBlue}99`, borderWidth: 0, order: 3 },
                  // @ts-expect-error mixed chart: line dataset on a Bar component
                  { type: 'line' as const, label: '7-day average', data: ma7, borderColor: TP.navy, backgroundColor: TP.navy, borderWidth: 2.5, pointRadius: 0, tension: 0.3, order: 1 },
                ],
              }}
              options={opts}
            />
          </div>
        </div>
        <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>Tip: the chart is wider than the screen — drag or shift-scroll to see Jul–Oct.</div>
      </Card>
      <Card>
        <h3 style={{ margin: '0 0 12px', color: TP.navy, fontWeight: 600 }}>Event legend</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr><Th>#</Th><Th>Date</Th><Th>Event</Th><Th>Category</Th><Th>Likely impact</Th><Th>What it means</Th></tr>
          </thead>
          <tbody>
            {events.map((e, i) => (
              <tr key={e.date + e.label}>
                <Td><span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22, borderRadius: 11, background: eventCategoryColor[e.category], color: '#fff', fontSize: 12, fontWeight: 700 }}>{i + 1}</span></Td>
                <Td bold>{e.date}{e.approx ? ' (approx)' : ''}</Td>
                <Td>{e.label}</Td>
                <Td><Chip color={eventCategoryColor[e.category]}>{e.category}</Chip></Td>
                <Td>{IMPACT_LABEL[e.impact]}</Td>
                <Td>{e.note}</Td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 14, lineHeight: 1.5 }}>
          Not yet placed (undated — pin from git / HR before charting): photo-button change that lifted assessment completion; the two salesperson departures.
        </div>
      </Card>
    </>
  );
}

function Chip({ children, color }: { children: ReactNode; color: string }) {
  return (
    <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 999, fontSize: 12, fontWeight: 600, color, background: `${color}1A` }}>
      {children}
    </span>
  );
}

function HoverDetail({ e, n }: { e: EventRow | null; n: number | null }) {
  const color = e ? eventCategoryColor[e.category] : '#e5e7eb';
  return (
    <div style={{ minHeight: 56, border: `1px solid ${e ? color : '#eee'}`, borderLeft: `4px solid ${color}`, borderRadius: 8, padding: '10px 14px', marginBottom: 10, background: e ? `${color}0D` : '#fafafa', transition: 'all 0.1s' }}>
      {e ? (
        <div>
          <div style={{ fontWeight: 700, color: TP.navy, fontSize: 14 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, borderRadius: 10, background: color, color: '#fff', fontSize: 11, marginRight: 8 }}>{n}</span>
            {e.date}{e.approx ? ' (approx)' : ''} · {e.label}
          </div>
          <div style={{ fontSize: 13, color: TP.text, marginTop: 4 }}>
            <b>{e.category}</b> · {IMPACT_LABEL[e.impact]} — {e.note}
          </div>
        </div>
      ) : (
        <div style={{ fontSize: 13, color: '#9ca3af', paddingTop: 8 }}>Hover a numbered pin on the chart to see what happened that day.</div>
      )}
    </div>
  );
}

function CategoryLegend() {
  const cats: { key: keyof typeof eventCategoryColor; label: string }[] = [
    { key: 'product', label: 'Product' },
    { key: 'process', label: 'Process' },
    { key: 'pricing', label: 'Pricing' },
    { key: 'marketing', label: 'Marketing' },
    { key: 'launch', label: 'Launch' },
  ];
  return (
    <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 10 }}>
      {cats.map((c) => (
        <span key={c.key} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6b7280' }}>
          <span style={{ width: 11, height: 11, borderRadius: 3, background: eventCategoryColor[c.key], display: 'inline-block' }} />
          {c.label}
        </span>
      ))}
    </div>
  );
}

function ConversionTab() {
  const labels = conversionMonthly.map((m) => monLabel(m.month));
  const overall = (100 * convSummary.checkouts) / convSummary.submissions;
  const matureIdx = conversionMonthly.findIndex((m) => m.month > conversionMatureThrough);
  const annotations: Record<string, object> = matureIdx >= 0 ? {
    maturing: {
      type: 'box', xMin: matureIdx - 0.5, xMax: conversionMonthly.length - 0.5,
      backgroundColor: 'rgba(253,190,103,0.12)', borderColor: 'rgba(253,190,103,0.4)', borderWidth: 1,
      label: { display: true, content: 'still maturing', position: { x: 'center', y: 'start' } as const, color: '#b4791f', font: { size: 10, weight: 'bold' as const }, backgroundColor: 'transparent' },
    },
  } : {};
  return (
    <>
      <div style={{ marginBottom: 14, fontSize: 13, color: TP.text, background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 14px' }}>
        <b>{convSummary.submissions.toLocaleString()}</b> leads submitted in 2026 → <b>{convSummary.linkSent.toLocaleString()}</b> got a checkout link ({Math.round((100 * convSummary.linkSent) / convSummary.submissions)}%) → <b>{convSummary.checkouts.toLocaleString()}</b> checked out (<b>{overall.toFixed(1)}%</b> submission→checkout). Of those who got a link, <b>{((100 * convSummary.checkouts) / convSummary.linkSent).toFixed(1)}%</b> converted. Cohorted by submission month. <span style={{ color: '#b4791f' }}>Aug–Oct still maturing — read Jan–Jul as final.</span>
      </div>
      <Card>
        <h3 style={{ margin: '0 0 4px', color: TP.navy, fontWeight: 600 }}>Conversion rate by submission month</h3>
        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 12 }}>
          Blue = submission→checkout. Green = of those who got a link, what % converted. Bars = submissions (volume, right axis). The shaded months haven&apos;t finished converting yet.
        </div>
        <div style={{ height: 340 }}>
          <Bar
            data={{
              labels,
              datasets: [
                { type: 'bar' as const, label: 'Submissions', data: conversionMonthly.map((m) => m.submissions), backgroundColor: `${TP.skyBlue}80`, borderRadius: 3, yAxisID: 'y1', order: 3 },
                // @ts-expect-error mixed line
                { type: 'line' as const, label: 'Submission → checkout %', data: conversionMonthly.map((m) => m.subToCO), borderColor: TP.blue, backgroundColor: TP.blue, borderWidth: 2.5, pointRadius: 3, yAxisID: 'y', order: 1 },
                // @ts-expect-error mixed line
                { type: 'line' as const, label: 'Link sent → checkout %', data: conversionMonthly.map((m) => m.linkToCO), borderColor: TP.green, backgroundColor: TP.green, borderWidth: 2.5, pointRadius: 3, yAxisID: 'y', order: 2 },
              ],
            }}
            options={{
              responsive: true, maintainAspectRatio: false,
              plugins: { legend: { display: true, position: 'top' as const }, annotation: { annotations } },
              scales: {
                y: { beginAtZero: true, position: 'left' as const, title: { display: true, text: 'Conversion %' } },
                y1: { beginAtZero: true, position: 'right' as const, grid: { drawOnChartArea: false }, title: { display: true, text: 'Submissions' } },
              },
            }}
          />
        </div>
      </Card>
      <Card>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr><Th>Submission month</Th><Th right>Submissions</Th><Th right>Link sent</Th><Th right>Checkouts</Th><Th right>Sub→CO %</Th><Th right>Link→CO %</Th></tr>
          </thead>
          <tbody>
            {conversionMonthly.map((m) => {
              const maturing = m.month > conversionMatureThrough;
              return (
                <tr key={m.month} style={maturing ? { color: '#9ca3af' } : undefined}>
                  <Td bold>{monLabel(m.month)}{maturing ? ' *' : ''}</Td>
                  <Td right>{m.submissions.toLocaleString()}</Td>
                  <Td right>{m.linkSent.toLocaleString()}</Td>
                  <Td right>{m.checkouts.toLocaleString()}</Td>
                  <Td right bold>{m.subToCO}%</Td>
                  <Td right>{m.linkToCO}%</Td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 10 }}>* still maturing — recent submitters can still check out, so these rates will rise.</div>
      </Card>
    </>
  );
}

function LeadSourceTab() {
  const overall = (100 * convSummary.checkouts) / convSummary.submissions;
  const byRate = [...conversionByReferrer].sort((a, b) => b.rate - a.rate);
  const matureSrc = sourceMonthly.filter((m) => m.month <= conversionMatureThrough);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const convSrcData: any = {
    labels: matureSrc.map((m) => monLabel(m.month).replace(' 2026', '')),
    datasets: ['Influencer', 'Dental Office', 'Online Search', 'Podcast'].map((src) => ({
      type: 'line' as const,
      label: src,
      data: matureSrc.map((m) => (m.subs[src] ? Math.round((1000 * m.cos[src]) / m.subs[src]) / 10 : null)),
      borderColor: sourceColors[src],
      backgroundColor: sourceColors[src],
      borderWidth: 2,
      pointRadius: 2,
      tension: 0.3,
      spanGaps: true,
    })),
  };
  return (
    <>
      <div style={{ marginBottom: 14, fontSize: 13, color: TP.text, background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 14px' }}>
        Which channels actually convert (not just which send leads). Overall is <b>{overall.toFixed(1)}%</b>. Warm/referral sources (Ambassador, Parent) convert ~2× paid/cold ones. <b>Dental Office sends the 2nd-most leads but converts far below average; Google Ads is the weakest.</b> Note: <b>Google Ads is only ~3% of submissions</b> — even at 0% conversion it would move the overall rate by ~0.3 pts, so it can&apos;t explain the May drop.
      </div>

      <Card>
        <h3 style={{ margin: '0 0 2px', color: TP.navy, fontWeight: 600 }}>Lead mix by submission month (share of submissions)</h3>
        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 12 }}>What we actually get each month. The low-converters (Google Ads, the pale sliver) are a small share — so a channel can&apos;t swing the overall rate unless it&apos;s big.</div>
        <div style={{ height: 300 }}>
          <Bar
            data={{
              labels: sourceMonthly.map((m) => monLabel(m.month).replace(' 2026', '')),
              datasets: sourceOrder.map((src) => ({
                label: src,
                data: sourceMonthly.map((m) => {
                  const tot = Object.values(m.subs).reduce((s, v) => s + v, 0) || 1;
                  return Math.round((100 * m.subs[src]) / tot);
                }),
                backgroundColor: sourceColors[src],
                stack: 'mix',
              })),
            }}
            options={{ ...baseOpts, plugins: { legend: { display: true, position: 'bottom' as const } }, scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true, max: 100, title: { display: true, text: '% of submissions' } } } }}
          />
        </div>
      </Card>

      <Card>
        <h3 style={{ margin: '0 0 2px', color: TP.navy, fontWeight: 600 }}>Conversion by source, over time</h3>
        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 12 }}>Mature months (Jan–Jul). The May drop shows up in <b>every</b> major source at once — that&apos;s the signature of a system/checkout change, not a channel problem.</div>
        <div style={{ height: 300 }}>
          <Bar data={convSrcData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true, position: 'bottom' as const } }, scales: { y: { beginAtZero: true, title: { display: true, text: 'Conversion %' } } } }} />
        </div>
      </Card>
      <Card>
        <h3 style={{ margin: '0 0 4px', color: TP.navy, fontWeight: 600 }}>Conversion rate by lead source</h3>
        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 12 }}>Sorted best → worst. Green = above the {overall.toFixed(1)}% overall rate, red = below.</div>
        <div style={{ height: 340 }}>
          <Bar
            data={{ labels: byRate.map((r) => r.referrer), datasets: [{ label: 'Conversion %', data: byRate.map((r) => r.rate), backgroundColor: byRate.map((r) => (r.rate >= overall ? TP.green : '#e06666')), borderRadius: 4 }] }}
            options={{ ...baseOpts, scales: { y: { beginAtZero: true, title: { display: true, text: 'Conversion %' } } } }}
          />
        </div>
      </Card>
      <Card>
        <h3 style={{ margin: '0 0 12px', color: TP.navy, fontWeight: 600 }}>Lead source detail (by volume)</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr><Th>Lead source</Th><Th right>Leads (subs)</Th><Th right>Checkouts</Th><Th right>Conversion %</Th></tr>
          </thead>
          <tbody>
            {conversionByReferrer.map((r) => (
              <tr key={r.referrer}>
                <Td bold>{r.referrer}</Td>
                <Td right>{r.submissions.toLocaleString()}</Td>
                <Td right>{r.checkouts.toLocaleString()}</Td>
                <Td right><span style={{ fontWeight: 600, color: r.rate >= overall ? '#1a7f5a' : '#c0392b' }}>{r.rate}%</span></Td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 10 }}>Cohorted by 2026 submission date; sources with ≥30 leads. Recent-month maturation slightly understates every source equally, so the ranking holds.</div>
      </Card>
    </>
  );
}

function CoordinatorTab() {
  const gridMax = Math.max(...tcMonthly.flatMap((t) => t.byMonth));
  return (
    <>
      <Card>
        <h3 style={{ margin: '0 0 4px', color: TP.navy, fontWeight: 600 }}>Checkouts by coordinator, by month</h3>
        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 12 }}>
          Darker = more checkouts. Shows when each TC started and who&apos;s rising vs. fading — a fair read when coordinators joined at different times.
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                <Th>Coordinator</Th>
                {MON.slice(0, 10).map((m) => (
                  <th key={m} style={{ padding: '6px 4px', textAlign: 'center', fontSize: 11, color: '#6b7280' }}>{m}</th>
                ))}
                <Th right>Active</Th><Th right>Per active mo</Th>
              </tr>
            </thead>
            <tbody>
              {tcMonthly.map((t) => (
                <tr key={t.tc}>
                  <Td bold>{t.tc}</Td>
                  {t.byMonth.map((v, i) => (
                    <td key={i} style={{ textAlign: 'center', padding: '6px 4px', background: heat(v, gridMax), color: heatText(v, gridMax), fontWeight: v > gridMax * 0.5 ? 600 : 400 }}>
                      {v || ''}
                    </td>
                  ))}
                  <Td right>{t.activeMonths}mo</Td>
                  <Td right bold>{t.perActiveMonth}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 10 }}>
          Veterans (Desirea / Acuna / Jolee) have slid since June; the TCs added from August are ramping. &quot;Per active mo&quot; normalizes for tenure. Excludes Savannah Valadez (not a TC — misattributed) and trivial first-month ramp counts, so rows sum to 3,386, not the 3,396 header total.
        </div>
      </Card>

      <Card>
        <h3 style={{ margin: '0 0 4px', color: TP.navy, fontWeight: 600 }}>Headcount vs. output</h3>
        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 12 }}>
          Active coordinators grew (3 → 6); total checkouts didn&apos;t grow. Added headcount split the same pie rather than expanding it.
        </div>
        <div style={{ height: 300 }}>
          <Bar
            data={{
              labels: capacity.map((c) => monLabel(c.month)),
              datasets: [
                { type: 'bar' as const, label: 'Checkouts', data: capacity.map((c) => c.checkouts), backgroundColor: `${TP.skyBlue}CC`, borderRadius: 4, yAxisID: 'y', order: 2 },
                // @ts-expect-error mixed line on Bar
                { type: 'line' as const, label: 'Active coordinators', data: capacity.map((c) => c.activeTCs), borderColor: TP.navy, backgroundColor: TP.navy, borderWidth: 2.5, pointRadius: 3, yAxisID: 'y1', order: 1 },
              ],
            }}
            options={{
              responsive: true, maintainAspectRatio: false,
              plugins: { legend: { display: true, position: 'top' as const } },
              scales: {
                y: { beginAtZero: true, position: 'left' as const, title: { display: true, text: 'Checkouts' } },
                y1: { beginAtZero: true, position: 'right' as const, grid: { drawOnChartArea: false }, title: { display: true, text: 'Active TCs' }, ticks: { stepSize: 1 } },
              },
            }}
          />
        </div>
      </Card>

      <Card>
        <h3 style={{ margin: '0 0 12px', color: TP.navy, fontWeight: 600 }}>Coordinator totals</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr><Th>Treatment Coordinator</Th><Th right>Checkouts</Th><Th right>Collected</Th><Th right>Avg deal (plan)</Th><Th right>Avg days link→checkout</Th></tr>
          </thead>
          <tbody>
            {byTC.map((t) => (
              <tr key={t.tc}>
                <Td bold>{t.tc}</Td>
                <Td right>{t.checkouts}</Td>
                <Td right>{money(t.amountPaid)}</Td>
                <Td right>{money(t.totalAmountPaid / t.checkouts)}</Td>
                <Td right>{t.avgDaysLinkSent.toFixed(1)}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}

function SpeedTab() {
  const m = monthlyMetrics.filter((x) => x.month !== '2026-10'); // Oct partial is survivorship-skewed
  return (
    <>
      <Card>
        <h3 style={{ margin: '0 0 4px', color: TP.navy, fontWeight: 600 }}>Days from checkout link → checkout, by month</h3>
        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 12 }}>
          How fast families pay once they get the link. Lower = faster. The team got faster all year (≈33 → 18 days). Oct omitted (partial-month skew).
        </div>
        <div style={{ height: 300 }}>
          <Bar
            data={{ labels: m.map((x) => monLabel(x.month)), datasets: [{ label: 'Avg days', data: m.map((x) => x.avgDays), backgroundColor: TP.yellow, borderRadius: 4 }] }}
            options={{ ...baseOpts, scales: { y: { beginAtZero: true, title: { display: true, text: 'Days' } } } }}
          />
        </div>
      </Card>
      <Card>
        <h3 style={{ margin: '0 0 4px', color: TP.navy, fontWeight: 600 }}>Avg days to close, by coordinator</h3>
        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 12 }}>
          New TCs (Holland, Sam, Irina) close fastest; veterans carry older, slower-closing pipelines. Speed ≠ productivity — read alongside volume.
        </div>
        <div style={{ height: 300 }}>
          <Bar
            data={{ labels: byTC.filter((t) => t.checkouts >= 5).map((t) => t.tc), datasets: [{ label: 'Avg days', data: byTC.filter((t) => t.checkouts >= 5).map((t) => t.avgDaysLinkSent), backgroundColor: TP.blue, borderRadius: 4 }] }}
            options={{ ...baseOpts, scales: { y: { beginAtZero: true, title: { display: true, text: 'Days' } } } }}
          />
        </div>
      </Card>
    </>
  );
}

function SegmentsTab() {
  const labels = segMonthly.map((s) => monLabel(s.month));
  const icePct = segMonthly.map((s) => Math.round((100 * s.ice) / (s.lava + s.ice)));
  return (
    <>
      <Card>
        <h3 style={{ margin: '0 0 4px', color: TP.navy, fontWeight: 600 }}>New leads vs. win-backs, by month</h3>
        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 12 }}>
          <b>Lava</b> = checkout from a recently-arrived lead. <b>Ice</b> = a previously <b>closed-lost</b> lead won back. Win-backs are {Math.round((100 * segTotal('Ice')) / summary.checkouts)}% of all checkouts ({segTotal('Ice')}) — a real revenue stream.
        </div>
        <div style={{ height: 320 }}>
          <Bar
            data={{
              labels,
              datasets: [
                { label: 'New (Lava)', data: segMonthly.map((s) => s.lava), backgroundColor: TP.blue, borderRadius: 3, stack: 's' },
                { label: 'Win-back (Ice)', data: segMonthly.map((s) => s.ice), backgroundColor: TP.green, borderRadius: 3, stack: 's' },
              ],
            }}
            options={{ ...baseOpts, plugins: { legend: { display: true, position: 'top' as const } }, scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true } } }}
          />
        </div>
      </Card>
      <Card>
        <h3 style={{ margin: '0 0 4px', color: TP.navy, fontWeight: 600 }}>Win-back share of checkouts (%)</h3>
        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 12 }}>
          Win-backs normally run ~25–30% of checkouts. In <b>July they cratered to 12%</b> (36 vs a ~100+ norm) — right when the &quot;schedule a call&quot; step was removed. That step was the win-back engine for closed-lost leads.
        </div>
        <div style={{ height: 280 }}>
          <Bar
            data={{ labels, datasets: [{ label: 'Win-back %', data: icePct, backgroundColor: icePct.map((p) => (p < 18 ? '#e06666' : TP.green)), borderRadius: 4 }] }}
            options={{ ...baseOpts, scales: { y: { beginAtZero: true, title: { display: true, text: '% of checkouts' } } } }}
          />
        </div>
      </Card>
      <Card>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr><Th>Segment</Th><Th right>Checkouts</Th><Th right>Share</Th><Th right>Collected</Th></tr>
          </thead>
          <tbody>
            <tr><Td bold>New lead (Lava)</Td><Td right>{segTotal('Lava')}</Td><Td right>{Math.round((100 * segTotal('Lava')) / summary.checkouts)}%</Td><Td right>{money(bySegment.find((s) => s.segment === 'Lava')?.amountPaid ?? 0)}</Td></tr>
            <tr><Td bold>Win-back (Ice / closed-lost)</Td><Td right>{segTotal('Ice')}</Td><Td right>{Math.round((100 * segTotal('Ice')) / summary.checkouts)}%</Td><Td right>{money(bySegment.find((s) => s.segment === 'Ice')?.amountPaid ?? 0)}</Td></tr>
          </tbody>
        </table>
      </Card>
    </>
  );
}

function RevenueTab() {
  const labels = monthly.map((m) => monLabel(m.month));
  return (
    <>
      <Card>
        <h3 style={{ margin: '0 0 12px', color: TP.navy, fontWeight: 600 }}>Collected vs. total plan value, by month</h3>
        <div style={{ height: 320 }}>
          <Bar
            data={{
              labels,
              datasets: [
                { label: 'Collected', data: monthly.map((m) => m.amountPaid), backgroundColor: TP.blue, borderRadius: 4 },
                { label: 'Total plan value', data: monthly.map((m) => m.totalAmountPaid), backgroundColor: TP.skyBlue, borderRadius: 4 },
              ],
            }}
            options={{ ...baseOpts, plugins: { legend: { display: true, position: 'top' as const } } }}
          />
        </div>
      </Card>
      <Card>
        <h3 style={{ margin: '0 0 4px', color: TP.navy, fontWeight: 600 }}>Collection rate &amp; avg deal, by month</h3>
        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 12 }}>
          Collection rate = collected ÷ total plan value (how much of the plan is paid upfront). It stepped up from ~74% to ~79% starting in July — worth confirming what drove it (iCore processor? deposit policy?) so it&apos;s repeatable.
        </div>
        <div style={{ height: 300 }}>
          <Bar
            data={{
              labels: monthlyMetrics.map((x) => monLabel(x.month)),
              datasets: [
                { type: 'bar' as const, label: 'Avg deal (plan)', data: monthlyMetrics.map((x) => x.avgPlan), backgroundColor: `${TP.skyBlue}CC`, borderRadius: 4, yAxisID: 'y', order: 2 },
                // @ts-expect-error mixed line on Bar
                { type: 'line' as const, label: 'Collection rate %', data: monthlyMetrics.map((x) => x.collectionRate), borderColor: TP.blue, backgroundColor: TP.blue, borderWidth: 2.5, pointRadius: 3, yAxisID: 'y1', order: 1 },
              ],
            }}
            options={{
              responsive: true, maintainAspectRatio: false,
              plugins: { legend: { display: true, position: 'top' as const } },
              scales: {
                y: { beginAtZero: true, position: 'left' as const, title: { display: true, text: 'Avg deal $' } },
                y1: { position: 'right' as const, grid: { drawOnChartArea: false }, min: 60, max: 90, title: { display: true, text: 'Collection %' } },
              },
            }}
          />
        </div>
      </Card>
      <Card>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr><Th>Month</Th><Th right>Collected</Th><Th right>Total plan value</Th><Th right>Collection %</Th><Th right>Avg deal (plan)</Th></tr>
          </thead>
          <tbody>
            {monthly.map((m, i) => (
              <tr key={m.month}>
                <Td bold>{monLabel(m.month)}</Td>
                <Td right>{money(m.amountPaid)}</Td>
                <Td right>{money(m.totalAmountPaid)}</Td>
                <Td right>{monthlyMetrics[i]?.collectionRate}%</Td>
                <Td right>{money(m.totalAmountPaid / m.checkouts)}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}
