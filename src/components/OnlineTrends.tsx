'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
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
import { Line, Bar } from 'react-chartjs-2';
import { fetchAnnualSummaries, fetchSubmissions, currentMonth as getCentralMonth, currentYear as getCentralYear } from '@/lib/api';
import type { MonthlySummary, DailySubmission } from '@/lib/types';
import { MONTH_NAMES } from '@/lib/types';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler);

/* ────── TP Kids Color Palette ────── */
const TP = {
  blue: '#3A6EA4', skyBlue: '#B6CAE3', lightBlue: '#D6E5F7',
  cream: '#FEF8EE', green: '#8CD1C8', yellow: '#FDBE67',
  peach: '#FBCCC5', red: '#DD5759', darkPurple: '#B26CA6',
  lightPurple: '#DDBBD9', bubblegum: '#F6AACB', maroon: '#D46476',
  text: '#333333', navy: '#1B2A4A',
};

/* ────── Hardcoded historical data (SOURCE OF TRUTH from submission-dashboard.html) ────── */

const online2024: Record<number, number> = {
  1: 623, 2: 476, 3: 1875, 4: 889, 5: 995, 6: 1659,
  7: 865, 8: 1080, 9: 1654, 10: 830, 11: 828, 12: 1069,
};
const online2025: Record<number, number> = {
  1: 1327, 2: 1464, 3: 1279, 4: 1186, 5: 1031, 6: 787,
  7: 2386, 8: 2178, 9: 1180, 10: 975, 11: 1135, 12: 776,
};

const hybrid2024: Record<number, number> = {
  1: 0, 2: 0, 3: 0, 4: 0, 5: 6, 6: 6,
  7: 48, 8: 148, 9: 129, 10: 105, 11: 91, 12: 76,
};
const hybrid2025: Record<number, number> = {
  1: 81, 2: 77, 3: 214, 4: 461, 5: 319, 6: 288,
  7: 292, 8: 351, 9: 406, 10: 526, 11: 460, 12: 452,
};

const prime2024: Record<number, number> = {
  1: 0, 2: 0, 3: 1, 4: 1, 5: 3, 6: 1,
  7: 0, 8: 2, 9: 16, 10: 19, 11: 24, 12: 13,
};
const prime2025: Record<number, number> = {
  1: 25, 2: 20, 3: 19, 4: 18, 5: 9, 6: 23,
  7: 11, 8: 13, 9: 14, 10: 7, 11: 13, 12: 25,
};

const MONTH_ABBR = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function daysInMonth(month: number, year: number): number {
  return new Date(year, month, 0).getDate();
}

/* ────── Component ────── */

export default function OnlineTrends() {
  const [summaries2026, setSummaries2026] = useState<MonthlySummary[]>([]);
  const [dailySubs, setDailySubs] = useState<DailySubmission[]>([]);
  const [loading, setLoading] = useState(true);

  // Refs for diff-label plugins (they need stable references to diff arrays)
  const onlineDiffRef = useRef<DiffRow[]>([]);
  const hybridDiffRef = useRef<DiffRow[]>([]);
  const primeDiffRef = useRef<DiffRow[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const year = getCentralYear();
        const [annualData, dailyData] = await Promise.all([
          fetchAnnualSummaries(2026),
          fetchSubmissions(year),
        ]);
        setSummaries2026(annualData);
        setDailySubs(dailyData);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  /* ────── Derive 2026 monthly data ────── */

  const currentMonth = getCentralMonth();
  const currentYear = getCentralYear();

  const {
    online2026, hybrid2026, prime2026,
    mtdDays, mtdOnline, mtdHybrid, mtdPrime,
    projOnline, projHybrid, projPrime,
    totalDaysInMonth, lastMonthWithData,
  } = useMemo(() => {
    const online: Record<number, number> = {};
    const hybrid: Record<number, number> = {};
    const prime: Record<number, number> = {};

    // Compute ALL months from daily tracker (source of truth)
    for (const d of dailySubs) {
      const m = new Date(d.date + 'T12:00:00').getMonth() + 1;
      online[m] = (online[m] || 0) + (d.online || 0);
      hybrid[m] = (hybrid[m] || 0) + (d.hybrid || 0);
      prime[m] = (prime[m] || 0) + (d.prime || 0);
    }

    // Fallback: use annual summaries for months with no daily data
    for (const s of summaries2026) {
      if (!online[s.month] && s.online_submissions > 0) {
        online[s.month] = s.online_submissions;
        hybrid[s.month] = s.hybrid_submissions;
        prime[s.month] = s.prime_submissions;
      }
    }

    // Current month projections
    const currentMonthSubs = dailySubs.filter((d) => {
      const dt = new Date(d.date + 'T12:00:00');
      return dt.getMonth() + 1 === currentMonth && dt.getFullYear() === currentYear;
    });

    let days = currentMonthSubs.length;
    const totalDays = daysInMonth(currentMonth, currentYear);
    let actOnline = online[currentMonth] || 0;
    let actHybrid = hybrid[currentMonth] || 0;
    let actPrime = prime[currentMonth] || 0;
    let pOnline = 0, pHybrid = 0, pPrime = 0;

    if (days > 0) {
      pOnline = Math.round((actOnline / days) * totalDays);
      pHybrid = Math.round((actHybrid / days) * totalDays);
      pPrime = Math.round((actPrime / days) * totalDays);
    }

    // Determine last month with any online data
    let lastWithData = 0;
    for (let m = 1; m <= 12; m++) {
      if (online[m] && online[m] > 0) lastWithData = m;
    }

    return {
      online2026: online,
      hybrid2026: hybrid,
      prime2026: prime,
      mtdDays: days,
      mtdOnline: actOnline,
      mtdHybrid: actHybrid,
      mtdPrime: actPrime,
      projOnline: pOnline,
      projHybrid: pHybrid,
      projPrime: pPrime,
      totalDaysInMonth: totalDays,
      lastMonthWithData: lastWithData,
    };
  }, [summaries2026, dailySubs, currentMonth, currentYear]);

  /* ────── Cumulative Trajectory Data ────── */

  const cumulativeData = useMemo(() => {
    let cum2024 = 0, cum2025 = 0, cum2026 = 0;
    const data2024: number[] = [];
    const data2025: number[] = [];
    const data2026: (number | null)[] = [];

    for (let m = 1; m <= 12; m++) {
      cum2024 += online2024[m] || 0;
      data2024.push(cum2024);

      cum2025 += online2025[m] || 0;
      data2025.push(cum2025);

      if (m < currentMonth && online2026[m] !== undefined) {
        cum2026 += online2026[m];
        data2026.push(cum2026);
      } else if (m === currentMonth && mtdDays > 0) {
        // Use projected for the cumulative line (matches original)
        cum2026 += projOnline;
        data2026.push(cum2026);
      } else if (m <= lastMonthWithData && online2026[m]) {
        cum2026 += online2026[m];
        data2026.push(cum2026);
      } else {
        data2026.push(null);
      }
    }

    return { data2024, data2025, data2026 };
  }, [online2026, currentMonth, mtdDays, projOnline, lastMonthWithData]);

  /* ────── Diff rows for bar charts + table ────── */

  interface DiffRow {
    month: string;
    v2024: number;
    v2025: number;
    v2026: number;
    diff: number;
    isInProgress: boolean;
    projectedRemainder: number;
    projected: number;
  }

  function buildDiffRows(
    data2024: Record<number, number>,
    data2025: Record<number, number>,
    data2026: Record<number, number>,
    mtdActual: number,
    projectedFull: number,
  ): DiffRow[] {
    const rows: DiffRow[] = [];
    for (let m = 1; m <= lastMonthWithData; m++) {
      const v24 = data2024[m] || 0;
      const v25 = data2025[m] || 0;
      let v26 = data2026[m] || 0;
      const isInProg = m === currentMonth && mtdDays > 0;
      let projected = 0;
      let projRemainder = 0;

      if (isInProg) {
        v26 = mtdActual;
        projected = projectedFull;
        projRemainder = Math.max(0, projected - v26);
      }

      const diff = (isInProg ? projected : v26) - v25;

      rows.push({
        month: MONTH_ABBR[m],
        v2024: v24,
        v2025: v25,
        v2026: v26,
        diff,
        isInProgress: isInProg,
        projectedRemainder: projRemainder,
        projected,
      });
    }
    return rows;
  }

  const onlineDiff = useMemo(
    () => buildDiffRows(online2024, online2025, online2026, mtdOnline, projOnline),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [online2026, mtdOnline, projOnline, lastMonthWithData],
  );
  const hybridDiff = useMemo(
    () => buildDiffRows(hybrid2024, hybrid2025, hybrid2026, mtdHybrid, projHybrid),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hybrid2026, mtdHybrid, projHybrid, lastMonthWithData],
  );
  const primeDiff = useMemo(
    () => buildDiffRows(prime2024, prime2025, prime2026, mtdPrime, projPrime),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [prime2026, mtdPrime, projPrime, lastMonthWithData],
  );

  // Keep refs in sync for plugins
  onlineDiffRef.current = onlineDiff;
  hybridDiffRef.current = hybridDiff;
  primeDiffRef.current = primeDiff;

  /* ────── Chart Builders ────── */

  function buildBarChartData(
    rows: DiffRow[],
    label: string,
    color2025: string,
    border2025: string,
  ) {
    return {
      labels: rows.map((r) => r.month),
      datasets: [
        {
          label: `2024 ${label}`,
          data: rows.map((r) => r.v2024),
          backgroundColor: 'rgba(153,153,153,0.35)',
          borderColor: '#999999',
          borderWidth: 1,
          borderRadius: 3,
          stack: 'stack2024',
        },
        {
          label: `2025 ${label}`,
          data: rows.map((r) => r.v2025),
          backgroundColor: color2025,
          borderColor: border2025,
          borderWidth: 1,
          borderRadius: 3,
          stack: 'stack2025',
        },
        {
          label: `2026 ${label} (Actual)`,
          data: rows.map((r) => r.v2026),
          backgroundColor: 'rgba(58,110,164,0.75)',
          borderColor: TP.blue,
          borderWidth: 1,
          borderRadius: 3,
          stack: 'stack2026',
        },
        {
          label: '2026 Projected',
          data: rows.map((r) => r.projectedRemainder),
          backgroundColor: 'rgba(58,110,164,0.18)',
          borderColor: 'rgba(58,110,164,0.35)',
          borderWidth: 1,
          borderRadius: 3,
          stack: 'stack2026',
        },
      ],
    };
  }

  // Plugin factory: draws diff labels above each bar group
  function makeDiffLabelPlugin(id: string, diffRef: React.MutableRefObject<DiffRow[]>) {
    return {
      id,
      afterDraw(chart: ChartJS) {
        const ctx = chart.ctx;
        ctx.save();
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center' as CanvasTextAlign;
        const metaProj = chart.getDatasetMeta(3);
        const metaActual = chart.getDatasetMeta(2);
        diffRef.current.forEach((row, i) => {
          let bar;
          if (row.isInProgress && metaProj.data[i] && row.projectedRemainder > 0) {
            bar = metaProj.data[i];
          } else if (metaActual.data[i]) {
            bar = metaActual.data[i];
          }
          if (!bar) return;
          ctx.fillStyle = row.diff >= 0 ? '#28a745' : TP.red;
          let label = (row.diff >= 0 ? '+' : '') + row.diff.toLocaleString();
          if (row.isInProgress) label += ' (proj)';
          ctx.fillText(label, bar.x, bar.y - 6);
        });
        ctx.restore();
      },
    };
  }

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: { padding: 15, usePointStyle: true, font: { size: 11 } },
      },
      tooltip: {
        callbacks: {
          afterBody: function (context: { dataIndex: number }[]) {
            const idx = context[0].dataIndex;
            const row = onlineDiffRef.current[idx];
            if (!row) return '';
            const diff25 = row.diff;
            const val26 = row.isInProgress ? row.projected : row.v2026;
            const diff24 = val26 - row.v2024;
            return `vs 2025: ${diff25 >= 0 ? '+' : ''}${diff25.toLocaleString()}\nvs 2024: ${diff24 >= 0 ? '+' : ''}${diff24.toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        stacked: true,
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: { color: '#666' },
      },
      x: {
        stacked: true,
        grid: { display: false },
        ticks: { color: '#666' },
      },
    },
  };

  // Need separate tooltip callbacks for hybrid and prime
  function makeBarOptions(diffRef: React.MutableRefObject<DiffRow[]>) {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom' as const,
          labels: { padding: 15, usePointStyle: true, font: { size: 11 } },
        },
        tooltip: {
          callbacks: {
            afterBody: function (context: { dataIndex: number }[]) {
              const idx = context[0].dataIndex;
              const row = diffRef.current[idx];
              if (!row) return '';
              const diff25 = row.diff;
              const val26 = row.isInProgress ? row.projected : row.v2026;
              const diff24 = val26 - row.v2024;
              return `vs 2025: ${diff25 >= 0 ? '+' : ''}${diff25.toLocaleString()}\nvs 2024: ${diff24 >= 0 ? '+' : ''}${diff24.toLocaleString()}`;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          stacked: true,
          grid: { color: 'rgba(0,0,0,0.05)' },
          ticks: { color: '#666' },
        },
        x: {
          stacked: true,
          grid: { display: false },
          ticks: { color: '#666' },
        },
      },
    };
  }

  /* ────── Render ────── */

  if (loading) {
    return <div style={{ color: '#999', padding: '48px 0', textAlign: 'center' }}>Loading trends data...</div>;
  }

  const onlineBarData = buildBarChartData(onlineDiff, 'Online', 'rgba(178,108,166,0.45)', TP.darkPurple);
  const hybridBarData = buildBarChartData(hybridDiff, 'Hybrid', 'rgba(91,168,140,0.45)', '#5BA88C');
  const primeBarData = buildBarChartData(primeDiff, 'Prime', 'rgba(229,160,75,0.45)', '#E5A04B');

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: TP.text, margin: 0 }}>Online Submissions</h2>
        <p style={{ fontSize: 13, color: '#888', marginTop: 4 }}>
          2024 vs 2025 vs 2026 -- Tracking online growth independent of hybrid and prime
        </p>
      </div>

      {/* ──── Section 1: Cumulative Online Trajectory ──── */}
      <SectionHeader color={TP.blue} label="Cumulative Online Submissions" />
      <ChartCard
        title="Online Submissions -- Cumulative (2024 / 2025 / 2026)"
        subtitle="Are your online submissions growing year over year?"
      >
        <div style={{ height: 400 }}>
          <Line
            data={{
              labels: MONTH_ABBR.slice(1),
              datasets: [
                {
                  label: '2026 Online',
                  data: cumulativeData.data2026,
                  borderColor: TP.blue,
                  backgroundColor: 'rgba(58,110,164,0.08)',
                  borderWidth: 3,
                  pointRadius: cumulativeData.data2026.map((v, i) => {
                    if (v === null) return 0;
                    return i + 1 === currentMonth ? 6 : 5;
                  }),
                  pointBackgroundColor: cumulativeData.data2026.map((_, i) =>
                    i + 1 === currentMonth ? '#fff' : TP.blue
                  ),
                  pointBorderColor: TP.blue,
                  pointBorderWidth: 2,
                  fill: false,
                  tension: 0.3,
                  spanGaps: false,
                  segment: {
                    borderDash: (ctx: { p1DataIndex: number }) =>
                      ctx.p1DataIndex >= currentMonth - 1 ? [6, 4] : [],
                  },
                },
                {
                  label: '2025 Online',
                  data: cumulativeData.data2025,
                  borderColor: TP.darkPurple,
                  backgroundColor: 'transparent',
                  borderWidth: 2,
                  pointRadius: 4,
                  pointBackgroundColor: TP.darkPurple,
                  pointBorderColor: '#fff',
                  pointBorderWidth: 1,
                  fill: false,
                  tension: 0.3,
                  spanGaps: true,
                },
                {
                  label: '2024 Online',
                  data: cumulativeData.data2024,
                  borderColor: '#999999',
                  backgroundColor: 'transparent',
                  borderWidth: 2,
                  borderDash: [6, 3],
                  pointRadius: 3,
                  pointBackgroundColor: '#999999',
                  pointBorderColor: '#fff',
                  pointBorderWidth: 1,
                  fill: false,
                  tension: 0.3,
                  spanGaps: true,
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'bottom',
                  labels: { padding: 15, usePointStyle: true, font: { size: 11 } },
                },
                tooltip: {
                  callbacks: {
                    label: (ctx) => {
                      if (ctx.raw === null) return '';
                      return `${ctx.dataset.label}: ${(ctx.raw as number).toLocaleString()}`;
                    },
                  },
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  title: { display: true, text: 'Cumulative Online Submissions', color: TP.text, font: { weight: 'bold' } },
                  grid: { color: 'rgba(0,0,0,0.05)' },
                  ticks: { color: '#666' },
                },
                x: { grid: { display: false }, ticks: { color: '#666' } },
              },
            }}
          />
        </div>
      </ChartCard>

      {/* ──── Section 2: Monthly Online Comparison (Bar) ──── */}
      <SectionHeader color={TP.darkPurple} label="Monthly Online Comparison" />
      <ChartCard title="Online Submissions: 2024 vs 2025 vs 2026">
        <div style={{ height: 300 }}>
          {onlineDiff.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999' }}>
              No 2026 data yet
            </div>
          ) : (
            <Bar
              data={onlineBarData as any}
              options={barChartOptions as any}
              plugins={[makeDiffLabelPlugin('onlineDiffLabels', onlineDiffRef) as any]}
            />
          )}
        </div>
      </ChartCard>

      {/* ──── Section 3: Monthly Online Breakdown Table ──── */}
      <SectionHeader color={TP.green} label="Monthly Online Breakdown" />
      <div style={{
        background: '#fff',
        borderRadius: 8,
        border: '1px solid #e5e7eb',
        padding: 16,
        marginBottom: 24,
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
              <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 600, color: '#666', fontSize: 12, textTransform: 'uppercase' }}>Month</th>
              <th style={{ textAlign: 'right', padding: '8px 12px', fontWeight: 600, color: '#666', fontSize: 12, textTransform: 'uppercase' }}>2024</th>
              <th style={{ textAlign: 'right', padding: '8px 12px', fontWeight: 600, color: '#666', fontSize: 12, textTransform: 'uppercase' }}>2025</th>
              <th style={{ textAlign: 'right', padding: '8px 12px', fontWeight: 600, color: '#666', fontSize: 12, textTransform: 'uppercase' }}>2026</th>
              <th style={{ textAlign: 'right', padding: '8px 12px', fontWeight: 600, color: '#666', fontSize: 12, textTransform: 'uppercase' }}>vs &apos;25</th>
              <th style={{ textAlign: 'right', padding: '8px 12px', fontWeight: 600, color: '#666', fontSize: 12, textTransform: 'uppercase' }}>vs &apos;24</th>
            </tr>
          </thead>
          <tbody>
            {onlineDiff.map((row, idx) => {
              const projVal = row.isInProgress ? projOnline : row.v2026;
              const diff25 = projVal - row.v2025;
              const diff24 = projVal - row.v2024;
              return (
                <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '8px 12px', fontWeight: 600, color: TP.text }}>
                    {row.month}{row.isInProgress ? ' *' : ''}
                  </td>
                  <td style={{ padding: '8px 12px', textAlign: 'right', color: '#999' }}>
                    {row.v2024.toLocaleString()}
                  </td>
                  <td style={{ padding: '8px 12px', textAlign: 'right', color: TP.text }}>
                    {row.v2025.toLocaleString()}
                  </td>
                  <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600, color: TP.text }}>
                    {row.isInProgress ? (
                      <>
                        {row.v2026.toLocaleString()}
                        <span style={{ color: '#999', fontWeight: 400 }}> → {projOnline.toLocaleString()}</span>
                      </>
                    ) : (
                      row.v2026.toLocaleString()
                    )}
                  </td>
                  <td style={{
                    padding: '8px 12px',
                    textAlign: 'right',
                    fontWeight: 600,
                    color: diff25 >= 0 ? '#28a745' : TP.red,
                  }}>
                    {diff25 >= 0 ? '+' : ''}{diff25.toLocaleString()}{row.isInProgress ? '*' : ''}
                  </td>
                  <td style={{
                    padding: '8px 12px',
                    textAlign: 'right',
                    fontWeight: 600,
                    color: diff24 >= 0 ? '#28a745' : TP.red,
                  }}>
                    {diff24 >= 0 ? '+' : ''}{diff24.toLocaleString()}{row.isInProgress ? '*' : ''}
                  </td>
                </tr>
              );
            })}
          </tbody>
          {onlineDiff.some((r) => r.isInProgress) && (
            <tfoot>
              <tr>
                <td colSpan={6} style={{ padding: 8, fontSize: '0.8em', color: '#999' }}>
                  * In progress -- projected based on {mtdDays} of {totalDaysInMonth} days
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* ──── Section 4: Monthly Hybrid Comparison (Bar) ──── */}
      <SectionHeader color="#5BA88C" label="Monthly Hybrid Comparison" />
      <ChartCard title="Hybrid Submissions: 2024 vs 2025 vs 2026">
        <div style={{ height: 300 }}>
          {hybridDiff.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999' }}>
              No 2026 data yet
            </div>
          ) : (
            <Bar
              data={hybridBarData as any}
              options={makeBarOptions(hybridDiffRef) as any}
              plugins={[makeDiffLabelPlugin('hybridDiffLabels', hybridDiffRef) as any]}
            />
          )}
        </div>
      </ChartCard>

      {/* ──── Section 5: Monthly Prime Comparison (Bar) ──── */}
      <SectionHeader color="#E5A04B" label="Monthly Prime Comparison" />
      <ChartCard title="Prime Submissions: 2024 vs 2025 vs 2026">
        <div style={{ height: 300 }}>
          {primeDiff.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999' }}>
              No 2026 data yet
            </div>
          ) : (
            <Bar
              data={primeBarData as any}
              options={makeBarOptions(primeDiffRef) as any}
              plugins={[makeDiffLabelPlugin('primeDiffLabels', primeDiffRef) as any]}
            />
          )}
        </div>
      </ChartCard>
    </div>
  );
}

/* ────── Reusable Sub-Components ────── */

function SectionHeader({ color, label }: { color: string; label: string }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginTop: 30,
      marginBottom: 12,
      fontWeight: 700,
      fontSize: 15,
      color: '#333',
    }}>
      <span style={{
        width: 10,
        height: 10,
        borderRadius: '50%',
        backgroundColor: color,
        display: 'inline-block',
        flexShrink: 0,
      }} />
      <span>{label}</span>
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 8,
      border: '1px solid #e5e7eb',
      padding: 16,
      marginBottom: 24,
    }}>
      <div style={{ fontWeight: 600, fontSize: 14, color: '#333', marginBottom: subtitle ? 2 : 12 }}>{title}</div>
      {subtitle && <div style={{ fontSize: 12, color: '#888', marginBottom: 12 }}>{subtitle}</div>}
      {children}
    </div>
  );
}
