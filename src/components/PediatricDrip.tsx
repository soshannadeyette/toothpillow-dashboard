'use client';

import { type ReactNode } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  enrollmentByMonth,
  familyPool,
  tcPerformance,
  speedStats,
  dripTimeline,
  keyFindings,
  DRIP_START,
  SF_EXPORT_DATE,
  GHL_AS_OF,
} from '@/data/pediatricDrip';

/* ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
   THEME
   ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ */
const TP = {
  blue: '#3A6EA4',
  skyBlue: '#B6CAE3',
  green: '#8CD1C8',
  yellow: '#FDBE67',
  navy: '#1B2A4A',
  text: '#333333',
  muted: '#6b7280',
  border: '#e5e7eb',
  lightBorder: '#f1f1f1',
};

const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const monShort = (ym: string) => MON[parseInt(ym.slice(5, 7), 10) - 1];
const money = (n: number) => '$' + Math.round(n).toLocaleString();
const pct1 = (n: number, d: number) => d === 0 ? 'â' : `${((n / d) * 100).toFixed(1)}%`;
const pctWithCounts = (n: number, d: number) => d === 0 ? 'â' : `${((n / d) * 100).toFixed(1)}% (${n} of ${d})`;

/* Months in the data */
const MONTHS = ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06', '2026-07', '2026-08', '2026-09', '2026-10', '2026-11'];
/* Days since start of month to export date â used for "too new" logic */
function daysSinceMonthStart(ym: string): number {
  const exportDate = new Date(SF_EXPORT_DATE + 'T00:00:00');
  const monthStart = new Date(ym + '-01T00:00:00');
  return Math.floor((exportDate.getTime() - monthStart.getTime()) / 86400000);
}

function getPool(month: string, type: 'hybrid' | 'screening') {
  return familyPool.find(r => r.month === month && r.type === type);
}
function getEnroll(month: string, type: 'hybrid' | 'screening') {
  return enrollmentByMonth.find(r => r.month === month && r.type === type);
}

/* ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
   SHARED UI PRIMITIVES
   ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ */
function Card({ children, style }: { children: ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ border: `1px solid ${TP.border}`, borderRadius: 12, padding: 20, background: '#fff', marginBottom: 20, ...style }}>
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return <h3 style={{ fontSize: 16, fontWeight: 700, color: TP.navy, marginBottom: 12, marginTop: 0 }}>{children}</h3>;
}

function Takeaway({ children }: { children: ReactNode }) {
  return <p style={{ fontSize: 13, color: TP.muted, marginTop: 8, marginBottom: 0, lineHeight: 1.5 }}>{children}</p>;
}

function Th({ children, right }: { children: ReactNode; right?: boolean }) {
  return (
    <th style={{ textAlign: right ? 'right' : 'left', padding: '8px 10px', borderBottom: `2px solid ${TP.border}`, fontSize: 11, color: TP.muted, textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
      {children}
    </th>
  );
}
function Td({ children, right, bold, warn }: { children: ReactNode; right?: boolean; bold?: boolean; warn?: boolean }) {
  return (
    <td style={{ textAlign: right ? 'right' : 'left', padding: '8px 10px', borderBottom: `1px solid ${TP.lightBorder}`, fontSize: 13, fontWeight: bold ? 600 : 400, color: TP.text, background: warn ? '#FEF9C3' : undefined }}>
      {children}
    </td>
  );
}

/* ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
   SECTION 1 â Drip Campaign Status
   ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ */
function DripStatus() {
  const k = keyFindings;
  const newDripTotal = k.newDripHybridFamilies + k.newDripScreeningFamilies;
  return (
    <Card>
      <SectionTitle>Is the new drip working?</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Old flow */}
        <div style={{ padding: 16, borderRadius: 8, background: '#f8fafc', border: `1px solid ${TP.border}` }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: TP.muted, textTransform: 'uppercase', marginBottom: 8 }}>Old flow (Jan â Oct)</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: TP.navy }}>
            Hybrid: {pctWithCounts(85, k.oldFlowHybridFamilies)}
          </div>
          <div style={{ fontSize: 14, color: TP.text,  marginTop: 4 }}>enrolled within 30 days</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: TP.navy, marginTop: 12 }}>
            Screening: {pctWithCounts(95, k.oldFlowScreeningFamilies)}
          </div>
          <div style={{ fontSize: 14, color: TP.text, marginTop: 4 }}>enrolled within 30 days</div>
        </div>
        {/* New drip */}
        <div style={{ padding: 16, borderRadius: 8, background: '#EFF6FF', border: `1px solid ${TP.skyBlue}` }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: TP.blue, textTransform: 'uppercase', marginBottom: 8 }}>New drip (Nov 2 â)</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: TP.navy }}>
            0 of {newDripTotal} enrolled
          </div>
          <div style={{ fontSize: 14, color: TP.text, marginTop: 4 }}>
            {k.newDripHybridFamilies} hybrid + {k.newDripScreeningFamilies} screening referred so far
          </div>
          <div style={{ fontSize: 14, color: TP.blue, marginTop: 12, fontWeight: 600 }}>
            Too early to compare.
          </div>
          <div style={{ fontSize: 13, color: TP.muted, marginTop: 4 }}>
            Oldest new-drip family is 11 days old. First families reach the 30-day window on Dec 2.
          </div>
        </div>
      </div>
      <Takeaway>
        Salesforce-to-GHL email match rate is {k.emailMatchRate}%, so real enrollment rates may be ~3 points higher than shown.
        {k.sepOctDropFlag && (
          <span style={{ color: '#B45309', fontWeight: 600 }}> Note: enrollment dropped in Sep and Oct before the drip change â that drop is not caused by the new drip.</span>
        )}
      </Takeaway>
      <div style={{ fontSize: 11, color: TP.muted, marginTop: 8 }}>
        Salesforce export: {SF_EXPORT_DATE} Â· GHL: {GHL_AS_OF ?? 'awaiting first scrape'}
      </div>
    </Card>
  );
}

/* ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
   SECTION 2 â Enrollment Rate by Referral Month
   ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ */
function EnrollmentByMonth() {
  // Build the combined table data
  const rows = MONTHS.map(m => {
    const hp = getPool(m, 'hybrid');
    const sp = getPool(m, 'screening');
    const he = getEnroll(m, 'hybrid');
    const se = getEnroll(m, 'screening');
    const hReferred = hp?.referred ?? 0;
    const sReferred = sp?.referred ?? 0;
    const hCheckouts = he?.checkouts ?? 0;
    const sCheckouts = se?.checkouts ?? 0;
    const ageDays = daysSinceMonthStart(m);
    const tooNew = ageDays < 30;
    const isSepOct = m === '2026-09' || m === '2026-10';
    const isNewDrip = m >= '2026-11';
    return { m, hReferred, sReferred, hCheckouts, sCheckouts, tooNew, isSepOct, isNewDrip, ageDays };
  });

  // Chart: grouped bar â hybrid rate and screening rate by month
  const chartLabels = rows.map(r => monShort(r.m));
  const hybridRates = rows.map(r => r.tooNew || r.hReferred === 0 ? 0 : (r.hCheckouts / r.hReferred) * 100);
  const screeningRates = rows.map(r => r.tooNew || r.sReferred === 0 ? 0 : (r.sCheckouts / r.sReferred) * 100);

  // Jan-Aug averages for takeaway
  const janAugH = rows.filter(r => r.m <= '2026-08' && r.hReferred > 0);
  const janAugS = rows.filter(r => r.m <= '2026-08' && r.sReferred > 0);
  const avgH = janAugH.reduce((s, r) => s + r.hCheckouts, 0) / janAugH.reduce((s, r) => s + r.hReferred, 0) * 100;
  const avgS = janAugS.reduce((s, r) => s + r.sCheckouts, 0) / janAugS.reduce((s, r) => s + r.sReferred, 0) * 100;

  return (
    <Card>
      <SectionTitle>Enrollment rate by referral month</SectionTitle>
      <div style={{ height: 260, marginBottom: 16 }}>
        <Bar
          data={{
            labels: chartLabels,
            datasets: [
              {
                label: 'Hybrid',
                data: hybridRates,
                backgroundColor: rows.map(r => r.tooNew ? '#e5e7eb' : TP.blue),
                borderRadius: 3,
              },
              {
                label: 'Screening',
                data: screeningRates,
                backgroundColor: rows.map(r => r.tooNew ? '#e5e7eb' : TP.green),
                borderRadius: 3,
              },
            ],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: true, position: 'top' as const, labels: { boxWidth: 12, font: { size: 11 } } },
              tooltip: {
                callbacks: {
                  label: (ctx) => {
                    const r = rows[ctx.dataIndex];
                    if (r.tooNew) return `${ctx.dataset.label}: too new`;
                    const type = ctx.datasetIndex === 0 ? 'hybrid' : 'screening';
                    const co = type === 'hybrid' ? r.hCheckouts : r.sCheckouts;
                    const ref = type === 'hybrid' ? r.hReferred : r.sReferred;
                    return `${ctx.dataset.label}: ${pctWithCounts(co, ref)}`;
                  },
                },
              },
            },
            scales: {
              y: { beginAtZero: true, title: { display: true, text: 'Enrollment rate %', font: { size: 11 } }, ticks: { callback: (v) => v + '%' } },
            },
          }}
        />
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <Th>Month</Th>
              <Th right>H referred</Th>
              <Th right>H enrolled</Th>
              <Th right>H rate</Th>
              <Th right>S referred</Th>
              <Th right>S enrolled</Th>
              <Th right>S rate</Th>
              <Th>Note</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.m}>
                <Td bold warn={r.isSepOct}>{monShort(r.m)}</Td>
                <Td right warn={r.isSepOct}>{r.hReferred}</Td>
                <Td right warn={r.isSepOct}>{r.hCheckouts}</Td>
                <Td right bold warn={r.isSepOct}>{r.tooNew ? 'too new' : pct1(r.hCheckouts, r.hReferred)}</Td>
                <Td right warn={r.isSepOct}>{r.sReferred}</Td>
                <Td right warn={r.isSepOct}>{r.sCheckouts}</Td>
                <Td right bold warn={r.isSepOct}>{r.tooNew ? 'too new' : pct1(r.sCheckouts, r.sReferred)}</Td>
                <Td warn={r.isSepOct}>
                  {r.isSepOct && <span style={{ color: '#B45309', fontSize: 12 }}>dropped before drip</span>}
                  {r.isNewDrip && <span style={{ color: TP.blue, fontSize: 12, fontWeight: 600 }}>new drip</span>}
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Takeaway>
        JanâAug average: hybrid {avgH.toFixed(1)}%, screening {avgS.toFixed(1)}%.
        Sep and Oct dropped sharply (hybrid Oct 6.3%, screening Sep 2.3%) before the Nov 2 drip change â flagged in yellow.
        November families are too new for a 30-day enrollment rate.
      </Takeaway>
    </Card>
  );
}

/* ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
   SECTION 3 â Checkout Speed by Month
   ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ */
function CheckoutSpeed() {
  const hybridRows = enrollmentByMonth.filter(r => r.type === 'hybrid');
  const screeningRows = enrollmentByMonth.filter(r => r.type === 'screening');
  const labels = hybridRows.map(r => monShort(r.month));

  const hSpeed = speedStats.find(s => s.type === 'hybrid')!;
  const sSpeed = speedStats.find(s => s.type === 'screening')!;

  return (
    <Card>
      <SectionTitle>Days from submission to checkout (median, by referral month)</SectionTitle>
      <div style={{ height: 240, marginBottom: 16 }}>
        <Bar
          data={{
            labels,
            datasets: [
              {
                label: 'Hybrid',
                data: hybridRows.map(r => r.medianDaysToCheckout ?? 0),
                backgroundColor: TP.blue,
                borderRadius: 3,
              },
              {
                label: 'Screening',
                data: screeningRows.map(r => r.medianDaysToCheckout ?? 0),
                backgroundColor: TP.green,
                borderRadius: 3,
              },
            ],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: true, position: 'top' as const, labels: { boxWidth: 12, font: { size: 11 } } },
              tooltip: {
                callbacks: {
                  label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y} days (median)`,
                },
              },
            },
            scales: {
              y: { beginAtZero: true, title: { display: true, text: 'Days', font: { size: 11 } } },
            },
          }}
        />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 8 }}>
        <div style={{ padding: 12, background: '#f8fafc', borderRadius: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: TP.muted, textTransform: 'uppercase' }}>Hybrid overall</div>
          <div style={{ fontSize: 14, color: TP.text, marginTop: 4 }}>
            Median {hSpeed.subToCheckout.median}d Â· Avg {hSpeed.subToCheckout.avg}d Â· IQR {hSpeed.subToCheckout.p25}â{hSpeed.subToCheckout.p75}d (n={hSpeed.subToCheckout.n})
          </div>
          <div style={{ fontSize: 12, color: TP.muted, marginTop: 4 }}>
            PEF completed: median {hSpeed.subToPef.median}d (n={hSpeed.subToPef.n})
          </div>
        </div>
        <div style={{ padding: 12, background: '#f8fafc', borderRadius: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: TP.muted, textTransform: 'uppercase' }}>Screening overall</div>
          <div style={{ fontSize: 14, color: TP.text, marginTop: 4 }}>
            Median {sSpeed.subToCheckout.median}d Â· Avg {sSpeed.subToCheckout.avg}d Â· IQR {sSpeed.subToCheckout.p25}â{sSpeed.subToCheckout.p75}d (n={sSpeed.subToCheckout.n})
          </div>
          <div style={{ fontSize: 12, color: TP.muted, marginTop: 4 }}>
            PEF completed: median {sSpeed.subToPef.median}d (n={sSpeed.subToPef.n})
          </div>
        </div>
      </div>
      <Takeaway>
        Speed improved in recent months: hybrid JulâOct median 9â14 days vs 17â28 days earlier. Screening shows a similar trend. Both types have a long PEF-completion tail (median 29â35 days).
      </Takeaway>
    </Card>
  );
}

/* ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
   SECTION 4 â Revenue by Month
   ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ */
function RevenueByMonth() {
  const hybridRows = enrollmentByMonth.filter(r => r.type === 'hybrid');
  const screeningRows = enrollmentByMonth.filter(r => r.type === 'screening');
  const labels = hybridRows.map(r => monShort(r.month));

  const totalH = hybridRows.reduce((s, r) => s + r.amtPaid, 0);
  const totalS = screeningRows.reduce((s, r) => s + r.amtPaid, 0);

  return (
    <Card>
      <SectionTitle>Revenue by referral month (amount paid)</SectionTitle>
      <div style={{ height: 240, marginBottom: 16 }}>
        <Bar
          data={{
            labels,
            datasets: [
              {
                label: 'Hybrid',
                data: hybridRows.map(r => r.amtPaid),
                backgroundColor: TP.blue,
                borderRadius: 3,
              },
              {
                label: 'Screening',
                data: screeningRows.map(r => r.amtPaid),
                backgroundColor: TP.green,
                borderRadius: 3,
              },
            ],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: true, position: 'top' as const, labels: { boxWidth: 12, font: { size: 11 } } },
              tooltip: {
                callbacks: {
                  label: (ctx) => `${ctx.dataset.label}: ${money(ctx.parsed.y ?? 0)}`,
                },
              },
            },
            scales: {
              x: { stacked: true },
              y: { stacked: true, beginAtZero: true, ticks: { callback: (v) => '$' + (Number(v) / 1000).toFixed(0) + 'K' } },
            },
          }}
        />
      </div>
      <Takeaway>
        YTD hybrid {money(totalH)} + screening {money(totalS)} = {money(totalH + totalS)} from dental-office referrals.
        Oct is low because most Oct-referred families haven&apos;t had time to check out yet.
      </Takeaway>
    </Card>
  );
}

/* ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
   SECTION 5 â TC Performance
   ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ */
function TCPerformance() {
  const totalCheckouts = tcPerformance.reduce((s, r) => s + r.hybridCheckouts + r.screeningCheckouts, 0);
  return (
    <Card>
      <SectionTitle>Patient educator performance (YTD checkouts)</SectionTitle>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <Th>Coordinator</Th>
              <Th right>Hybrid</Th>
              <Th right>Screening</Th>
              <Th right>Total</Th>
              <Th right>H revenue</Th>
              <Th right>S revenue</Th>
              <Th right>Total revenue</Th>
            </tr>
          </thead>
          <tbody>
            {tcPerformance.map(r => (
              <tr key={r.tc}>
                <Td bold>{r.tc}</Td>
                <Td right>{r.hybridCheckouts}</Td>
                <Td right>{r.screeningCheckouts}</Td>
                <Td right bold>{r.hybridCheckouts + r.screeningCheckouts}</Td>
                <Td right>{money(r.hybridRevenue)}</Td>
                <Td right>{money(r.screeningRevenue)}</Td>
                <Td right bold>{money(r.hybridRevenue + r.screeningRevenue)}</Td>
              </tr>
            ))}
            <tr style={{ borderTop: `2px solid ${TP.border}` }}>
              <Td bold>Total</Td>
              <Td right bold>{tcPerformance.reduce((s, r) => s + r.hybridCheckouts, 0)}</Td>
              <Td right bold>{tcPerformance.reduce((s, r) => s + r.screeningCheckouts, 0)}</Td>
              <Td right bold>{totalCheckouts}</Td>
              <Td right bold>{money(tcPerformance.reduce((s, r) => s + r.hybridRevenue, 0))}</Td>
              <Td right bold>{money(tcPerformance.reduce((s, r) => s + r.screeningRevenue, 0))}</Td>
              <Td right bold>{money(tcPerformance.reduce((s, r) => s + r.hybridRevenue + r.screeningRevenue, 0))}</Td>
            </tr>
          </tbody>
        </table>
      </div>
      <Takeaway>
        Ashley Acuna and Desirea Peraza handle the bulk: 254 of {totalCheckouts} checkouts ({((254 / totalCheckouts) * 100).toFixed(0)}%). Jolee Thailing is third with 65.
      </Takeaway>
    </Card>
  );
}

/* ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
   SECTION 6 â Booking Rates (placeholder)
   ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ */
function BookingPlaceholder() {
  return (
    <Card style={{ background: '#f8fafc', borderStyle: 'dashed' }}>
      <SectionTitle>Booking rates by referral month</SectionTitle>
      <div style={{ fontSize: 14, color: TP.muted, lineHeight: 1.6 }}>
        <strong style={{ color: TP.navy }}>Awaiting first GHL daily scrape.</strong>
        <br />
        Once the scrape runs, this section will show: what percentage of referred families book a patient educator call,
        how fast they book (within 3 days, 7 days), and how that compares between the new drip and the old flow.
        {GHL_AS_OF && <><br />Last GHL pull: {GHL_AS_OF}</>}
      </div>
    </Card>
  );
}

/* ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
   SECTION 7 â Timeline
   ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ */
function Timeline() {
  return (
    <Card>
      <SectionTitle>Timeline</SectionTitle>
      <div style={{ borderLeft: `3px solid ${TP.skyBlue}`, paddingLeft: 16 }}>
        {dripTimeline.map((e, i) => (
          <div key={i} style={{ marginBottom: i < dripTimeline.length - 1 ? 12 : 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: TP.blue }}>{e.date}</div>
            <div style={{ fontSize: 13, color: TP.text }}>{e.event}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
   MAIN EXPORT
   ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ */
export default function PediatricDrip() {
  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: TP.navy, marginBottom: 4 }}>Pediatric Drip Campaign</h2>
      <p style={{ fontSize: 13, color: TP.muted, marginBottom: 20 }}>
        Hybrid and screening families from dental offices. New drip launched Nov 2, 2026.
      </p>
      <DripStatus />
      <EnrollmentByMonth />
      <CheckoutSpeed />
      <RevenueByMonth />
      <TCPerformance />
      <BookingPlaceholder />
      <Timeline />
    </div>
  );
}
