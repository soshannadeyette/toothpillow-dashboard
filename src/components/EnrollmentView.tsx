'use client';

import { useState } from 'react';

// Placeholder Enrollment section. Mirrors the Submissions side's tab pattern so it
// can be filled in with real Supabase-backed data once Sosh + Erin define the metrics.
const ENROLLMENT_TABS = [
  {
    id: 'funnel',
    label: 'Funnel / Conversion',
    blurb:
      'The enrollment funnel end to end: lead → first contact → evaluation → plan & pricing → checkout link sent → checkout → case start. Headline metric here is checkout-link-to-checkout (Erin’s meaningful number), not submission-to-checkout.',
  },
  {
    id: 'pods',
    label: 'By Pod / Specialist',
    blurb:
      'Checkouts and case starts broken out by pod and by enrollment specialist, so you can see where conversion is strong vs. soft.',
  },
  {
    id: 'pending',
    label: 'Pending Reactivation',
    blurb:
      'The pending-checkout cohort (roughly day 21 to day 120) and reactivation recovery — how many stalled, how many came back, by stage of the reactivation cadence.',
  },
  {
    id: 'source',
    label: 'Lead Source',
    blurb:
      'Enrollment performance by lead source (marketing, webinars, partner practices, etc.) and by promotion timing.',
  },
] as const;

type EnrollTabId = (typeof ENROLLMENT_TABS)[number]['id'];

export default function EnrollmentView() {
  const [tab, setTab] = useState<EnrollTabId>('funnel');
  const active = ENROLLMENT_TABS.find((t) => t.id === tab)!;

  return (
    <div>
      {/* Enrollment sub-tab bar */}
      <nav className="bg-white" style={{ borderBottom: '2px solid #e0e0e0', marginBottom: 24 }}>
        <div className="flex gap-1 overflow-x-auto">
          {ENROLLMENT_TABS.map((t) => (
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

      {/* Placeholder content */}
      <div
        style={{
          border: '1px dashed #c9d2e0',
          borderRadius: 12,
          padding: '40px 28px',
          background: '#f7f9fc',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            display: 'inline-block',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#3A6EA4',
            background: '#e7eef7',
            borderRadius: 999,
            padding: '4px 12px',
            marginBottom: 14,
          }}
        >
          Coming soon
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 'bold', color: '#1B2A4A', margin: '0 0 10px' }}>
          {active.label}
        </h2>
        <p style={{ maxWidth: 620, margin: '0 auto', color: '#4F4F4F', lineHeight: 1.6 }}>
          {active.blurb}
        </p>
        <p style={{ marginTop: 18, fontSize: 13, color: '#6b7686' }}>
          Placeholder — wiring this to Supabase once Sosh + Erin lock the exact metrics.
        </p>
      </div>
    </div>
  );
}
