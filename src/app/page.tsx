'use client';

import { useState } from 'react';
import DailyTracker from '@/components/DailyTracker';
import WeeklyReport from '@/components/WeeklyReport';
import AnnualView from '@/components/AnnualView';
import OnlineTrends from '@/components/OnlineTrends';
import ReferrerView from '@/components/ReferrerView';
import PaidAds from '@/components/PaidAds';
import AmbassadorGrowth from '@/components/AmbassadorGrowth';
import GoalEditor from '@/components/GoalEditor';
import OrganicGrowth from '@/components/OrganicGrowth';
import AVDiagnostics from '@/components/AVDiagnostics';
import AccountStatus from '@/components/AccountStatus';
import Creators from '@/components/Creators';
import EnrollmentView from '@/components/EnrollmentView';
const TABS = [
  { id: 'daily', label: 'Daily Tracker' },
  { id: 'weekly', label: 'Weekly Report' },
  { id: 'annual', label: 'Annual' },
  { id: 'online', label: 'Online' },
  { id: 'referrer', label: 'Referrer' },
  { id: 'paid', label: 'Paid Ads' },
  { id: 'ambassador', label: 'Ambassador Growth' },
  { id: 'organic', label: 'Organic Growth' },
  { id: 'avdiag', label: 'AV Diagnostics' },
  { id: 'accounts', label: 'Account Status' },
  { id: 'creators', label: 'IG Creators' },
  { id: 'settings', label: 'Settings' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabId>('daily');
  const [section, setSection] = useState<'submissions' | 'enrollment'>('submissions');

  return (
    <div className="min-h-screen" style={{ background: '#FFFFFF' }}>
      {/* Header */}
      <header className="px-6 py-5" style={{ marginBottom: 10 }}>
        <h1 style={{ fontSize: 28, fontWeight: 'bold', color: '#1B2A4A' }}>
          {section === 'submissions' ? 'Submission Tracking Dashboard' : 'Enrollment Dashboard'}
        </h1>
        {/* Top-level section toggle */}
        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          {([
            { id: 'submissions', label: 'Submissions' },
            { id: 'enrollment', label: 'Enrollment' },
          ] as const).map((s) => (
            <button
              key={s.id}
              onClick={() => setSection(s.id)}
              style={{
                fontSize: 14,
                fontWeight: 600,
                borderRadius: 999,
                padding: '8px 18px',
                cursor: 'pointer',
                border: '1.5px solid #3A6EA4',
                background: section === s.id ? '#3A6EA4' : '#FFFFFF',
                color: section === s.id ? '#FFFFFF' : '#3A6EA4',
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </header>

      {section === 'submissions' ? (
        <>
          {/* Tab bar */}
          <nav className="bg-white px-6" style={{ borderBottom: '2px solid #e0e0e0' }}>
            <div className="flex gap-1 overflow-x-auto">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-blue-600 border-blue-600'
                      : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </nav>

          {/* Tab content */}
          <main className="p-6 max-w-7xl mx-auto">
            {activeTab === 'daily' && <DailyTracker />}
            {activeTab === 'weekly' && <WeeklyReport />}
            {activeTab === 'annual' && <AnnualView />}
            {activeTab === 'online' && <OnlineTrends />}
            {activeTab === 'referrer' && <ReferrerView />}
            {activeTab === 'paid' && <PaidAds />}
            {activeTab === 'ambassador' && <AmbassadorGrowth />}
            {activeTab === 'organic' && <OrganicGrowth />}
            {activeTab === 'avdiag' && <AVDiagnostics />}
            {activeTab === 'accounts' && <AccountStatus />}
            {activeTab === 'creators' && <Creators />}

            {activeTab === 'settings' && <GoalEditor />}
          </main>
        </>
      ) : (
        <main className="p-6 max-w-7xl mx-auto">
          <EnrollmentView />
        </main>
      )}
    </div>
  );
}
