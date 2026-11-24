'use client';

import React from 'react';

/* ──── TP Kids Color Palette ──── */
const TP = {
  blue: '#3A6EA4', skyBlue: '#B6CAE3', lightBlue: '#D6E5F7',
  cream: '#FEF8EE', green: '#8CD1C8', yellow: '#FDBE67',
  peach: '#FBCCC5', red: '#DD5759', darkPurple: '#B26CA6',
  text: '#333333', navy: '#1B2A4A',
};

/* ════════════════════════════════════════════
   GOOGLE ADS — Salesforce Pipeline Data
   Source: Salesforce "Google Ads 2026" export, November 24, 2026
   ════════════════════════════════════════════ */
const GOOGLE_SF_PIPELINE = {
  total: 882,
  completed: 397,
  waitingInfo: 482,
  sentCheckout: 95,
  sentToTxP: 18,
  txpApproved: 5,
  checkedOut: 63,
  referredOut: 47,
  closedLost: 167,
  tempHold: 5,
  denied: 0,
};
const GOOGLE_REVENUE = 117447;
// Total Google Ads spend from daily data + prior months (Apr–Nov 2026)
// Updated alongside PaidAds.tsx each data refresh
const GOOGLE_TOTAL_SPEND = 85574;

/* ════════════════════════════════════════════
   META ADS — Toothpillow Ads Account (569515626136665)
   Source: Meta Ads Manager (Maximum: Oct 24, 2023 – Nov 24, 2026)
   + Salesforce "Meta Ads 2026" export, November 24, 2026
   ════════════════════════════════════════════ */

const META_MONTHLY = [
  { month: 'Mar 2025', spend: 838.67, leads: 0 },
  { month: 'Apr 2025', spend: 170.97, leads: 0 },
  { month: 'May 2025', spend: 45.49, leads: 0 },
  { month: 'Aug 2025', spend: 1065.00, leads: 0 },
  { month: 'Sep 2025', spend: 2830.42, leads: 1 },
  { month: 'Oct 2025', spend: 3082.34, leads: 0 },
  { month: 'Nov 2025', spend: 5602.58, leads: 0 },
  { month: 'Dec 2025', spend: 3340.87, leads: 17 },
  { month: 'Jan 2026', spend: 5138.82, leads: 24 },
  { month: 'Feb 2026', spend: 2444.53, leads: 9 },
  { month: 'Mar 2026', spend: 1024.00, leads: 7 },
  { month: 'Apr 2026', spend: 72.42, leads: 0 },
  { month: 'Nov 2026', spend: 197.57, leads: 0 },
];

const META_SF_PIPELINE = {
  total: 83,
  completed: 42,
  waitingInfo: 41,
  sentCheckout: 4,
  sentToTxP: 3,
  txpApproved: 1,
  checkedOut: 5,
  referredOut: 1,
  closedLost: 21,
  tempHold: 0,
  denied: 7,
};

const META_REVENUE = 8978;

const META_CAMPAIGNS: { name: string; type: string; results: number; resultType: string; cpr: number; spend: number; impressions: number; reach: number }[] = [
  { name: 'Alex Clark Campaign', type: 'Link Clicks', results: 44905, resultType: 'Link clicks', cpr: 0.18, spend: 8182.86, impressions: 867493, reach: 425224 },
  { name: 'Braces Exist - Metaadben', type: 'Traffic', results: 17363, resultType: 'LPV', cpr: 0.31, spend: 5432.22, impressions: 881560, reach: 483548 },
  { name: 'Dr Ben - Tonsils Reel', type: 'Link Clicks', results: 19653, resultType: 'Link clicks', cpr: 0.27, spend: 5294.47, impressions: 863329, reach: 566984 },
  { name: 'Braces Exist - TP 4', type: 'Traffic', results: 6358, resultType: 'LPV', cpr: 0.33, spend: 2121.75, impressions: 329747, reach: 262412 },
  { name: 'Braces Exist - TP 1', type: 'Traffic', results: 3016, resultType: 'LPV', cpr: 0.39, spend: 1167.51, impressions: 266043, reach: 234942 },
  { name: 'Braces Exist - TP 2', type: 'Traffic', results: 4048, resultType: 'LPV', cpr: 0.29, spend: 1167.27, impressions: 208789, reach: 0 },
  { name: 'Symptom Checklist - Traffic', type: 'Traffic', results: 1462, resultType: 'LPV', cpr: 0.55, spend: 804.26, impressions: 121708, reach: 97295 },
  { name: 'Wendy Whitelist Reel', type: 'Traffic', results: 2306, resultType: 'LPV', cpr: 0.22, spend: 500.57, impressions: 30082, reach: 0 },
  { name: 'Wendy - Wendy Lookalike', type: 'Traffic', results: 1528, resultType: 'LPV', cpr: 0.26, spend: 399.13, impressions: 18396, reach: 0 },
  { name: 'Wendy - IG Lookalike', type: 'Traffic', results: 1276, resultType: 'LPV', cpr: 0.31, spend: 397.35, impressions: 19317, reach: 0 },
  { name: 'Braces Exist - TP 3', type: 'Traffic', results: 496, resultType: 'LPV', cpr: 0.39, spend: 194.68, impressions: 37346, reach: 35866 },
  { name: 'Lead Gen - Evergreen', type: 'Lead Gen', results: 1, resultType: 'StartAssessment', cpr: 197.57, spend: 197.57, impressions: 5980, reach: 0 },
  { name: 'Symptom Checklist - Leads', type: 'Lead Gen', results: 0, resultType: 'Website Lead', cpr: 0, spend: 92.71, impressions: 6353, reach: 5581 },
  { name: 'New LP Trial', type: 'Traffic', results: 174, resultType: 'LPV', cpr: 0.48, spend: 82.88, impressions: 7727, reach: 7727 },
  { name: 'Symptom Checklist - Engage', type: 'Engagement', results: 440, resultType: 'Post engagements', cpr: 0.14, spend: 60.37, impressions: 4171, reach: 4000 },
];

/* ════════════════════════════════════════════
   META ERA SPLIT: Legacy (through 11/22/2026) vs New (11/23/2026+)
   The new Lead Gen - Evergreen campaign started 11/23.
   ════════════════════════════════════════════ */
const META_LEGACY_CAMPAIGNS = META_CAMPAIGNS.filter(c => c.name !== 'Lead Gen - Evergreen');
const META_NEW_CAMPAIGNS = META_CAMPAIGNS.filter(c => c.name === 'Lead Gen - Evergreen');

const metaLegacySpend = META_LEGACY_CAMPAIGNS.reduce((s, c) => s + c.spend, 0);
const metaNewSpend = META_NEW_CAMPAIGNS.reduce((s, c) => s + c.spend, 0);

// Legacy monthly = everything through Oct 2026 (Apr 2026 was last active month before Nov)
const META_LEGACY_MONTHLY = META_MONTHLY.filter(m => m.month !== 'Nov 2026');
const META_NEW_MONTHLY = META_MONTHLY.filter(m => m.month === 'Nov 2026');

/* ──── Computed stats ──── */
const metaTotalSpend = META_CAMPAIGNS.reduce((s, c) => s + c.spend, 0);
const metaTotalImpressions = META_CAMPAIGNS.reduce((s, c) => s + c.impressions, 0);
const metaTotalLeads = META_SF_PIPELINE.total;
const metaCPL = metaTotalLeads > 0 ? metaTotalSpend / metaTotalLeads : 0;
const metaCAC = META_SF_PIPELINE.checkedOut > 0 ? metaTotalSpend / META_SF_PIPELINE.checkedOut : 0;
const metaRevenuePerDollar = metaTotalSpend > 0 ? META_REVENUE / metaTotalSpend : 0;
// Completed-to-checkout: only count people who finished the assessment
const metaCompletedToCheckout = META_SF_PIPELINE.completed > 0 ? (META_SF_PIPELINE.checkedOut / META_SF_PIPELINE.completed * 100) : 0;

const googleTotalSpend = GOOGLE_TOTAL_SPEND;
const googleCAC = GOOGLE_SF_PIPELINE.checkedOut > 0 ? googleTotalSpend / GOOGLE_SF_PIPELINE.checkedOut : 0;
const googleCPL = GOOGLE_SF_PIPELINE.total > 0 ? googleTotalSpend / GOOGLE_SF_PIPELINE.total : 0;
const googleRevenuePerDollar = googleTotalSpend > 0 ? GOOGLE_REVENUE / googleTotalSpend : 0;
// Completed-to-checkout: only count people who finished the assessment
const googleCompletedToCheckout = GOOGLE_SF_PIPELINE.completed > 0 ? (GOOGLE_SF_PIPELINE.checkedOut / GOOGLE_SF_PIPELINE.completed * 100) : 0;

/* ──── Helper components ──── */
function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '6px 4px' }}>
      <div style={{ fontSize: '0.68em', color: '#888', textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: '1.1em', fontWeight: 700, color: '#1B2A4A' }}>{value}</div>
    </div>
  );
}

function SectionHeader({ children, color }: { children: React.ReactNode; color?: string }) {
  return (
    <div style={{ fontSize: 16, fontWeight: 700, color: color || TP.navy, borderBottom: `2px solid ${color || TP.navy}`, paddingBottom: 8, marginBottom: 16 }}>
      {children}
    </div>
  );
}

/* ════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════ */
export default function PaidAdsComparison() {
  return (
    <div>
      <SectionHeader>Google Ads vs Meta Ads - Full Comparison</SectionHeader>

      {/* Subtitle */}
      <div style={{ fontSize: '0.85em', color: '#888', marginBottom: 16 }}>
        All-time performance comparison. Google Ads: Apr 2026–present. Meta Ads: Mar 2025–present (15 campaigns, 1 currently active). Salesforce pipeline data as of Nov 24, 2026.
      </div>

      {/* Head-to-head summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        {/* Google column */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 4px 15px rgba(0,0,0,0.08)', borderTop: `4px solid ${TP.blue}` }}>
          <div style={{ fontSize: '1.1em', fontWeight: 700, color: TP.blue, marginBottom: 12, textAlign: 'center' }}>Google Ads</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <MiniStat label="Total Spend" value={`$${Math.round(googleTotalSpend).toLocaleString()}`} />
            <MiniStat label="Revenue" value={`$${GOOGLE_REVENUE.toLocaleString()}`} />
            <MiniStat label="Submissions" value={GOOGLE_SF_PIPELINE.total.toLocaleString()} />
            <MiniStat label="Completed" value={`${GOOGLE_SF_PIPELINE.completed}`} />
            <MiniStat label="Checkouts" value={`${GOOGLE_SF_PIPELINE.checkedOut}`} />
            <MiniStat label="CAC" value={`$${Math.round(googleCAC).toLocaleString()}`} />
            <MiniStat label="Revenue/$1" value={`$${googleRevenuePerDollar.toFixed(2)}`} />
            <MiniStat label="Completed->Checkout" value={`${googleCompletedToCheckout.toFixed(1)}%`} />
          </div>
        </div>
        {/* Meta column */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 4px 15px rgba(0,0,0,0.08)', borderTop: '4px solid #1877F2' }}>
          <div style={{ fontSize: '1.1em', fontWeight: 700, color: '#1877F2', marginBottom: 12, textAlign: 'center' }}>Meta Ads</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <MiniStat label="Total Spend" value={`$${Math.round(metaTotalSpend).toLocaleString()}`} />
            <MiniStat label="Revenue" value={`$${META_REVENUE.toLocaleString()}`} />
            <MiniStat label="Submissions" value={META_SF_PIPELINE.total.toLocaleString()} />
            <MiniStat label="Completed" value={`${META_SF_PIPELINE.completed}`} />
            <MiniStat label="Checkouts" value={`${META_SF_PIPELINE.checkedOut}`} />
            <MiniStat label="CAC" value={`$${Math.round(metaCAC).toLocaleString()}`} />
            <MiniStat label="Revenue/$1" value={`$${metaRevenuePerDollar.toFixed(2)}`} />
            <MiniStat label="Completed->Checkout" value={`${metaCompletedToCheckout.toFixed(1)}%`} />
          </div>
        </div>
      </div>

      {/* The story */}
      <div style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 4px 15px rgba(0,0,0,0.08)', marginBottom: 24 }}>
        <div style={{ fontWeight: 700, color: TP.navy, marginBottom: 8 }}>What the numbers say</div>
        <div style={{ fontSize: '0.85em', color: '#555', lineHeight: 1.6 }}>
          Google Ads has spent {(googleTotalSpend / metaTotalSpend).toFixed(1)}x more than Meta (${Math.round(googleTotalSpend).toLocaleString()} vs ${Math.round(metaTotalSpend).toLocaleString()}) and produced {Math.round(GOOGLE_SF_PIPELINE.total / META_SF_PIPELINE.total)}x more leads ({GOOGLE_SF_PIPELINE.total} vs {META_SF_PIPELINE.total}).
          Google&apos;s cost per lead is ${Math.round(googleCPL)} vs Meta&apos;s ${Math.round(metaCPL)} - {(metaCPL / googleCPL).toFixed(1)}x more expensive on Meta.
          Of people who completed their assessment, Google converted {googleCompletedToCheckout.toFixed(1)}% to checkout ({GOOGLE_SF_PIPELINE.checkedOut} of {GOOGLE_SF_PIPELINE.completed}) vs Meta at {metaCompletedToCheckout.toFixed(1)}% ({META_SF_PIPELINE.checkedOut} of {META_SF_PIPELINE.completed}).
          Google returns ${googleRevenuePerDollar.toFixed(2)} for every $1 spent; Meta returns ${metaRevenuePerDollar.toFixed(2)}.
          Most legacy Meta spend (${ Math.round(metaLegacySpend).toLocaleString()}) went to awareness/traffic campaigns, not lead gen. A new Lead Gen - Evergreen campaign launched 11/23/2026 at ${metaNewSpend.toFixed(0)} spent so far.
        </div>
      </div>

      {/* Pipeline comparison */}
      <SectionHeader>Pipeline Comparison</SectionHeader>
      <div style={{ overflowX: 'auto', marginBottom: 24 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82em', background: '#fff', borderRadius: 10, overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }}>
          <thead>
            <tr style={{ background: TP.navy }}>
              <th style={{ padding: '8px 12px', textAlign: 'left', color: '#fff' }}>Stage</th>
              <th style={{ padding: '8px 12px', textAlign: 'right', color: '#fff' }}>Google</th>
              <th style={{ padding: '8px 12px', textAlign: 'right', color: '#fff' }}>Google %</th>
              <th style={{ padding: '8px 12px', textAlign: 'right', color: '#fff' }}>Meta</th>
              <th style={{ padding: '8px 12px', textAlign: 'right', color: '#fff' }}>Meta %</th>
            </tr>
          </thead>
          <tbody>
            {[
              { label: 'Total Leads', g: GOOGLE_SF_PIPELINE.total, m: META_SF_PIPELINE.total },
              { label: 'Still Filling Out Form', g: GOOGLE_SF_PIPELINE.waitingInfo, m: META_SF_PIPELINE.waitingInfo },
              { label: 'Completed Assessment', g: GOOGLE_SF_PIPELINE.completed, m: META_SF_PIPELINE.completed },
              { label: 'Sent Checkout Link', g: GOOGLE_SF_PIPELINE.sentCheckout, m: META_SF_PIPELINE.sentCheckout },
              { label: 'Sent to Provider', g: GOOGLE_SF_PIPELINE.sentToTxP + GOOGLE_SF_PIPELINE.txpApproved, m: META_SF_PIPELINE.sentToTxP + META_SF_PIPELINE.txpApproved },
              { label: 'Checked Out', g: GOOGLE_SF_PIPELINE.checkedOut, m: META_SF_PIPELINE.checkedOut },
              { label: 'Referred Out', g: GOOGLE_SF_PIPELINE.referredOut, m: META_SF_PIPELINE.referredOut },
              { label: 'Denied', g: GOOGLE_SF_PIPELINE.denied, m: META_SF_PIPELINE.denied },
              { label: 'Closed / Lost', g: GOOGLE_SF_PIPELINE.closedLost + GOOGLE_SF_PIPELINE.tempHold, m: META_SF_PIPELINE.closedLost + META_SF_PIPELINE.tempHold },
            ].map((row, idx) => (
              <tr key={row.label} style={{ background: idx % 2 === 0 ? '#f9f9f9' : '#fff', fontWeight: row.label === 'Total Leads' || row.label === 'Checked Out' ? 700 : 400 }}>
                <td style={{ padding: '6px 12px' }}>{row.label}</td>
                <td style={{ padding: '6px 12px', textAlign: 'right' }}>{row.g.toLocaleString()}</td>
                <td style={{ padding: '6px 12px', textAlign: 'right', color: '#888' }}>{GOOGLE_SF_PIPELINE.total > 0 ? `${(row.g / GOOGLE_SF_PIPELINE.total * 100).toFixed(1)}%` : '--'}</td>
                <td style={{ padding: '6px 12px', textAlign: 'right' }}>{row.m.toLocaleString()}</td>
                <td style={{ padding: '6px 12px', textAlign: 'right', color: '#888' }}>{META_SF_PIPELINE.total > 0 ? `${(row.m / META_SF_PIPELINE.total * 100).toFixed(1)}%` : '--'}</td>
              </tr>
            ))}
            <tr style={{ background: TP.navy, color: '#fff', fontWeight: 700 }}>
              <td style={{ padding: '8px 12px' }}>Revenue</td>
              <td style={{ padding: '8px 12px', textAlign: 'right' }}>${GOOGLE_REVENUE.toLocaleString()}</td>
              <td style={{ padding: '8px 12px', textAlign: 'right' }}></td>
              <td style={{ padding: '8px 12px', textAlign: 'right' }}>${META_REVENUE.toLocaleString()}</td>
              <td style={{ padding: '8px 12px', textAlign: 'right' }}></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Meta campaign breakdown */}
      {/* ── Legacy Meta (through 11/22/2026) ── */}
      <SectionHeader color="#1877F2">Legacy Meta Campaigns (through 11/22/2026)</SectionHeader>
      <div style={{ fontSize: '0.8em', color: '#888', marginBottom: 8 }}>
        14 campaigns ran before 11/23. All were awareness/traffic - none were conversion-optimized lead gen. Total legacy spend: ${Math.round(metaLegacySpend).toLocaleString()}.
      </div>
      <div style={{ overflowX: 'auto', marginBottom: 24 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78em', background: '#fff', borderRadius: 10, overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }}>
          <thead>
            <tr style={{ background: '#1877F2' }}>
              <th style={{ padding: '8px 10px', textAlign: 'left', color: '#fff' }}>Campaign</th>
              <th style={{ padding: '8px 10px', textAlign: 'left', color: '#fff' }}>Type</th>
              <th style={{ padding: '8px 10px', textAlign: 'right', color: '#fff' }}>Spend</th>
              <th style={{ padding: '8px 10px', textAlign: 'right', color: '#fff' }}>Results</th>
              <th style={{ padding: '8px 10px', textAlign: 'right', color: '#fff' }}>CPR</th>
              <th style={{ padding: '8px 10px', textAlign: 'right', color: '#fff' }}>Impressions</th>
            </tr>
          </thead>
          <tbody>
            {META_LEGACY_CAMPAIGNS.map((c, idx) => (
              <tr key={c.name} style={{ background: idx % 2 === 0 ? '#f9f9f9' : '#fff' }}>
                <td style={{ padding: '5px 10px', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</td>
                <td style={{ padding: '5px 10px', color: c.type === 'Lead Gen' ? '#00C853' : c.type === 'Engagement' ? '#FF9800' : '#666' }}>{c.type}</td>
                <td style={{ padding: '5px 10px', textAlign: 'right' }}>${c.spend.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
                <td style={{ padding: '5px 10px', textAlign: 'right' }}>{c.results > 0 ? c.results.toLocaleString() : '--'} <span style={{ color: '#aaa', fontSize: '0.85em' }}>{c.resultType}</span></td>
                <td style={{ padding: '5px 10px', textAlign: 'right' }}>{c.cpr > 0 ? `$${c.cpr.toFixed(2)}` : '--'}</td>
                <td style={{ padding: '5px 10px', textAlign: 'right' }}>{c.impressions.toLocaleString()}</td>
              </tr>
            ))}
            <tr style={{ background: '#1877F2', color: '#fff', fontWeight: 700 }}>
              <td style={{ padding: '8px 10px' }} colSpan={2}>Legacy Total</td>
              <td style={{ padding: '8px 10px', textAlign: 'right' }}>${Math.round(metaLegacySpend).toLocaleString()}</td>
              <td style={{ padding: '8px 10px', textAlign: 'right' }}></td>
              <td style={{ padding: '8px 10px', textAlign: 'right' }}></td>
              <td style={{ padding: '8px 10px', textAlign: 'right' }}>{META_LEGACY_CAMPAIGNS.reduce((s, c) => s + c.impressions, 0).toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── New Meta (11/23/2026 onward) ── */}
      <SectionHeader color="#00C853">New Meta Campaign (11/23/2026 onward)</SectionHeader>
      <div style={{ fontSize: '0.8em', color: '#888', marginBottom: 8 }}>
        New conversion-optimized Lead Gen - Evergreen campaign. This is the first Meta campaign built for direct lead generation.
      </div>
      <div style={{ overflowX: 'auto', marginBottom: 24 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78em', background: '#fff', borderRadius: 10, overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }}>
          <thead>
            <tr style={{ background: '#00C853' }}>
              <th style={{ padding: '8px 10px', textAlign: 'left', color: '#fff' }}>Campaign</th>
              <th style={{ padding: '8px 10px', textAlign: 'left', color: '#fff' }}>Type</th>
              <th style={{ padding: '8px 10px', textAlign: 'right', color: '#fff' }}>Spend</th>
              <th style={{ padding: '8px 10px', textAlign: 'right', color: '#fff' }}>Results</th>
              <th style={{ padding: '8px 10px', textAlign: 'right', color: '#fff' }}>CPR</th>
              <th style={{ padding: '8px 10px', textAlign: 'right', color: '#fff' }}>Impressions</th>
            </tr>
          </thead>
          <tbody>
            {META_NEW_CAMPAIGNS.map((c, idx) => (
              <tr key={c.name} style={{ background: idx % 2 === 0 ? '#f9f9f9' : '#fff' }}>
                <td style={{ padding: '5px 10px' }}>{c.name}</td>
                <td style={{ padding: '5px 10px', color: '#00C853' }}>{c.type}</td>
                <td style={{ padding: '5px 10px', textAlign: 'right' }}>${c.spend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td style={{ padding: '5px 10px', textAlign: 'right' }}>{c.results} <span style={{ color: '#aaa', fontSize: '0.85em' }}>{c.resultType}</span></td>
                <td style={{ padding: '5px 10px', textAlign: 'right' }}>${c.cpr.toFixed(2)}</td>
                <td style={{ padding: '5px 10px', textAlign: 'right' }}>{c.impressions.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ fontSize: '0.8em', color: '#555', marginTop: 8, padding: '8px 12px', background: '#f0fff4', borderRadius: 8, border: '1px solid #c6f6d5' }}>
          Early data: ${ metaNewSpend.toFixed(2)} spent, {META_NEW_CAMPAIGNS.reduce((s,c) => s + c.results, 0)} conversion(s) so far. Update this section as the new campaign accumulates data.
        </div>
      </div>

      {/* Meta monthly spend */}
      <SectionHeader color="#1877F2">Meta Monthly Spend History</SectionHeader>
      <div style={{ overflowX: 'auto', marginBottom: 16 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82em', background: '#fff', borderRadius: 10, overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }}>
          <thead>
            <tr style={{ background: '#1877F2' }}>
              <th style={{ padding: '8px 12px', textAlign: 'left', color: '#fff' }}>Month</th>
              <th style={{ padding: '8px 12px', textAlign: 'right', color: '#fff' }}>Spend</th>
              <th style={{ padding: '8px 12px', textAlign: 'right', color: '#fff' }}>SF Leads</th>
              <th style={{ padding: '8px 12px', textAlign: 'left', color: '#fff' }}>Era</th>
            </tr>
          </thead>
          <tbody>
            {META_MONTHLY.map((m, idx) => {
              const isNew = m.month === 'Nov 2026';
              return (
                <tr key={m.month} style={{ background: isNew ? '#f0fff4' : idx % 2 === 0 ? '#f9f9f9' : '#fff' }}>
                  <td style={{ padding: '6px 12px' }}>{m.month}</td>
                  <td style={{ padding: '6px 12px', textAlign: 'right' }}>${m.spend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td style={{ padding: '6px 12px', textAlign: 'right' }}>{m.leads}</td>
                  <td style={{ padding: '6px 12px', fontSize: '0.85em', color: isNew ? '#00C853' : '#888' }}>{isNew ? 'New campaign' : 'Legacy'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div style={{ fontSize: '0.78em', color: '#888', marginBottom: 8 }}>
        Legacy Meta campaigns were awareness/traffic (carousels, whitelist reels), not conversion-optimized. The CPL/CAC comparison is apples-to-oranges for that era - Google Ads ran conversion-optimized campaigns from day one. The new Lead Gen campaign (11/23+) is the first direct comparison.
      </div>
    </div>
  );
}
