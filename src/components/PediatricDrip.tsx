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

/* ------------------------------------------------------------------
   THEME
   ------------------------------------------------------------------ */
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
const pct1 = (n: number, d: number) => d === 0 ? '—' : `${((n / d) * 100).toFixed(1)}%`;
const pctWithCounts = (n: number, d: number) => d === 0 ? '—' : `${((n / d) * 100).toFixed(1)}% (${n} of ${d})`;

/* Months in the data */
const BASELINE_MONTHS = ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06', '2026-07', '2026-08'];
const DROP_MONTHS = ['2026-09', '2026-10'];
const NEW_DRIP_MONTHS = ['2026-11'];
const ALL_MONTHS = [...BASELINE_MONTHS, ...DROP_MONTHS, ...NEW_DRIP_MONTHS];

/* Days since start of month to export date -- used for "too new" logic */
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

/* ------------------------------------------------------------------
   SHARED UI PRIMITIVES
   ------------------------------------------------------------------ */
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

/* ------------------------------------------------------------------
   SECTION 1 -- Drip Campaign Status
   ------------------------------------------------------------------ */
function DripStatus() {
  const k = keyFindings;
  const newDripTotal = k.newDripHybridFamilies + k.newDripScreeningFamilies;
  return (
    <Card>
      <SectionTitle>Is the new drip working?</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Old flow */}
        <div style={{ padding: 16, borderRadius: 8, background: '#f8fafc', border: `1px solid ${TP.border}` }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: TP.muted, textTransform: 'uppercase', marginBottom: 8 }}>Old flow (Jan - Oct)</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: TP.navy }}>
            Hybrid: {pctWithCounts(85, k.oldFlowHybridFamilies)}
          </div>
          <div style={{ fontSize: 14, color: TP.text, marginTop: 4 }}>enrolled within 30 days</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: TP.navy, marginTop: 12 }}>
            Screening: {pctWithCounts(95, k.oldFlowScreeningFamilies)}
          </div>
          <div style={{ fontSize: 14, color: TP.text, marginTop: 4 }}>enrolled within 30 days</div>
        </div>
        {/* New drip */}
        <div style={{ padding: 16, borderRadius: 8, background: '#EFF6FF', border: `1px solid ${TP.skyBlue}` }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: TP.blue, textTransform: 'uppercase', marginBottom: 8 }}>New drip (Nov 2+)</div>
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
          <span style={{ color: '#B45309', fontWeight: 600 }}> Note: enrollment dropped in Sep and Oct before the drip change. That drop is not caused by the new drip.</span>
        )}
      </Takeaway>
      <div style={{ fontSize: 11, color: TP.muted, marginTop: 8 }}>
        Salesforce export: {SF_EXPORT_DATE} {'·'} GHL: {GHL_AS_OF ?? 'awaiting first scrape'}
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------
   SECTION 2 -- Why we changed (baseline + drop summary)
   ------------------------------------------------------------------ */
function WhyWeChanged() {
  // Compute Jan-Aug baseline aggregates
  const blH = BASELINE_MONTHS.reduce((acc, m) => {
    const p = getPool(m, 'hybrid'); const e = getEnroll(m, 'hybrid');
    return { ref: acc.ref + (p?.referred ?? 0), co: acc.co + (e?.checkouts ?? 0) };
  }, { ref: 0, co: 0 });
  const blS = BASELINE_MONTHS.reduce((acc, m) => {
    const p = getPool(m, 'screening'); const e = getEnroll(m, 'screening');
    return { ref: acc.ref + (p?.referred ?? 0), co: acc.co + (e?.checkouts ?? 0) };
  }, { ref: 0, co: 0 });

  // Sep-Oct drop numbers
  const dropH = DROP_MONTHS.reduce((acc, m) => {
    const p = getPool(m, 'hybrid'); const e = getEnroll(m, 'hybrid');
    return { ref: acc.ref + (p?.referred ?? 0), co: acc.co + (e?.checkouts ?? 0) };
  }, { ref: 0, co: 0 });
  const dropS = DROP_MONTHS.reduce((acc, m) => {
    const p = getPool(m, 'screening'); const e = getEnroll(m, 'screening');
    return { ref: acc.ref + (p?.referred ?? 0), co: acc.co + (e?.checkouts ?? 0) };
  }, { ref: 0, co: 0 });

  const blHRate = blH.ref > 0 ? (blH.co / blH.ref * 100).toFixed(1) : '0';
  const blSRate = blS.ref > 0 ? (blS.co / blS.ref * 100).toFixed(1) : '0';
  const drHRate = dropH.ref > 0 ? (dropH.co / dropH.ref * 100).toFixed(1) : '0';
  const drSRate = dropS.ref > 0 ? (dropS.co / dropS.ref * 100).toFixed(1) : '0';

  return (
    <Card>
      <SectionTitle>Why we changed the drip</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Baseline */}
        <div style={{ padding: 16, borderRadius: 8, background: '#f8fafc', border: `1px solid ${TP.border}` }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: TP.muted, textTransform: 'uppercase', marginBottom: 8 }}>Jan - Aug baseline</div>
          <div style={{ display: 'flex', gap: 24 }}>
            <div>
              <div style={{ fontSize: 28, fontWeight: 700, color: TP.navy }}>{blHRate}%</div>
              <div style={{ fontSize: 12, color: TP.muted }}>Hybrid enrollment</div>
              <div style={{ fontSize: 11, color: TP.muted }}>{blH.co} of {blH.ref} families</div>
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 700, color: TP.navy }}>{blSRate}%</div>
              <div style={{ fontSize: 12, color: TP.muted }}>Screening enrollment</div>
              <div style={{ fontSize: 11, color: TP.muted }}>{blS.co} of {blS.ref} families</div>
            </div>
          </div>
        </div>
        {/* Drop */}
        <div style={{ padding: 16, borderRadius: 8, background: '#FEF9C3', border: '1px solid #F59E0B' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#B45309', textTransform: 'uppercase', marginBottom: 8 }}>Sep - Oct drop</div>
          <div style={{ display: 'flex', gap: 24 }}>
            <div>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#B45309' }}>{drHRate}%</div>
              <div style={{ fontSize: 12, color: '#92400E' }}>Hybrid enrollment</div>
              <div style={{ fontSize: 11, color: '#92400E' }}>{dropH.co} of {dropH.ref} families</div>
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#B45309' }}>{drSRate}%</div>
              <div style={{ fontSize: 12, color: '#92400E' }}>Screening enrollment</div>
              <div style={{ fontSize: 11, color: '#92400E' }}>{dropS.co} of {dropS.ref} families</div>
            </div>
          </div>
        </div>
      </div>
      <Takeaway>
        Enrollment dropped sharply in Sep and Oct before the Nov 2 drip change. This drop triggered the new campaign.
      </Takeaway>
    </Card>
  );
}

/* ------------------------------------------------------------------
   SECTION 3 -- New drip results (Nov onward)
   ------------------------------------------------------------------ */
function NewDripResults() {
  const rows = NEW_DRIP_MONTHS.map(m => {
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
    return { m, hReferred, sReferred, hCheckouts, sCheckouts, tooNew, ageDays };
  });

  return (
    <Card style={{ border: `2px solid ${TP.skyBlue}` }}>
      <SectionTitle>New drip results (Nov 2 onward)</SectionTitle>
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
              <Th right>Days old</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.m}>
                <Td bold>{monShort(r.m)}</Td>
                <Td right>{r.hReferred}</Td>
                <Td right>{r.hCheckouts}</Td>
                <Td right bold>{r.tooNew ? 'too new' : pct1(r.hCheckouts, r.hReferred)}</Td>
                <Td right>{r.sReferred}</Td>
                <Td right>{r.sCheckouts}</Td>
                <Td right bold>{r.tooNew ? 'too new' : pct1(r.sCheckouts, r.sReferred)}</Td>
                <Td right>{r.ageDays}d</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.every(r => r.tooNew) && (
        <Takeaway>
          All new-drip families are under 30 days old. First meaningful enrollment rates will appear after Dec 2.
        </Takeaway>
      )}
    </Card>
  );
}

/* ------------------------------------------------------------------
   SECTION 4 -- Baseline checkout speed by month
   ------------------------------------------------------------------ */
function CheckoutSpeed() {
  const hybridRows = enrollmentByMonth.filter(r => r.type === 'hybrid');
  const screeningRows = enrollmentByMonth.filter(r => r.type === 'screening');
  const labels = hybridRows.map(r => monShort(r.month));

  const hSpeed = speedStats.find(s => s.type === 'hybrid')!;
  const sSpeed = speedStats.find(s => s.type === 'screening')!;

  return (
    <Card>
      <SectionTitle>Baseline checkout speed (days from submission to checkout)</SectionTitle>
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
            Median {hSpeed.subToCheckout.median}d {'·'} Avg {hSpeed.subToCheckout.avg}d {'·'} IQR {hSpeed.subToCheckout.p25}-{hSpeed.subToCheckout.p75}d (n={hSpeed.subToCheckout.n})
          </div>
          <div style={{ fontSize: 12, color: TP.muted, marginTop: 4 }}>
            PEF completed: median {hSpeed.subToPef.median}d (n={hSpeed.subToPef.n})
          </div>
        </div>
        <div style={{ padding: 12, background: '#f8fafc', borderRadius: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: TP.muted, textTransform: 'uppercase' }}>Screening overall</div>
          <div style={{ fontSize: 14, color: TP.text, marginTop: 4 }}>
            Median {sSpeed.subToCheckout.median}d {'·'} Avg {sSpeed.subToCheckout.avg}d {'·'} IQR {sSpeed.subToCheckout.p25}-{sSpeed.subToCheckout.p75}d (n={sSpeed.subToCheckout.n})
          </div>
          <div style={{ fontSize: 12, color: TP.muted, marginTop: 4 }}>
            PEF completed: median {sSpeed.subToPef.median}d (n={sSpeed.subToPef.n})
          </div>
        </div>
      </div>
      <Takeaway>
        Speed improved in recent months: hybrid Jul-Oct median 9-14 days vs 17-28 days earlier. Screening shows a similar trend. Both types have a long PEF-completion tail (median 29-35 days).
      </Takeaway>
    </Card>
  );
}

/* ------------------------------------------------------------------
   SECTION 5 -- Baseline revenue by month
   ------------------------------------------------------------------ */
function RevenueByMonth() {
  const hybridRows = enrollmentByMonth.filter(r => r.type === 'hybrid');
  const screeningRows = enrollmentByMonth.filter(r => r.type === 'screening');
  const labels = hybridRows.map(r => monShort(r.month));

  const totalH = hybridRows.reduce((s, r) => s + r.amtPaid, 0);
  const totalS = screeningRows.reduce((s, r) => s + r.amtPaid, 0);

  return (
    <Card>
      <SectionTitle>Baseline revenue by referral month (amount paid)</SectionTitle>
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
        Oct is low because most Oct-referred families haven't had time to check out yet.
      </Takeaway>
    </Card>
  );
}

/* ------------------------------------------------------------------
   SECTION 6 -- Booking Rates (placeholder)
   ------------------------------------------------------------------ */
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

/* ------------------------------------------------------------------
   SECTION 7 -- Timeline
   ------------------------------------------------------------------ */
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

/* ------------------------------------------------------------------
   MAIN EXPORT
   ------------------------------------------------------------------ */
export default function PediatricDrip() {
  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: TP.navy, marginBottom: 4 }}>Pediatric Drip Campaign</h2>
      <p style={{ fontSize: 13, color: TP.muted, marginBottom: 20 }}>
        Hybrid and screening families from dental offices. New drip launched Nov 2, 2026.
      </p>
      <DripStatus />
      <WhyWeChanged />
      <NewDripResults />
      <CheckoutSpeed />
      <RevenueByMonth />
      <BookingPlaceholder />
      <Timeline />
    </div>
  );
}
