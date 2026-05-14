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

const TABS = [
  { id: 'daily', label: 'Daily Tracker' },
  { id: 'weekly', label: 'Weekly Report' },
  { id: 'annual', label: 'Annual' },
  { id: 'online', label: 'Online' },
  { id: 'referrer', label: 'Referrer' },
  { id: 'paid', label: 'Paid Ads' },
  { id: 'ambassador', label: 'Ambassador Growth' },
  { id: 'settings', label: 'Settings' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabId>('daily');

  return (
    <div className="min-h-screen" style={{ background: '#FFFFFF' }}>
      {/* Header */}
      <header className="px-6 py-5" style={{ marginBottom: 10 }}>
        <h1 style={{ fontSize: 28, fontWeight: 'bold', color: '#1B2A4A' }}>
          Submission Tracking Dashboard
        </h1>
      </header>

      {/* Tab bar */}
      <nav className="bg-white px-6" style={{ borderBottom: '2px solid #e0e0e0' }}>
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto' }}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '15px 30px',
                border: 'none',
                backgroundColor: '#FFFFFF',
                color: activeTab === tab.id ? '#1B2A4A' : '#333',
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
                borderBottom: activeTab === tab.id ? '3px solid #FDBE67' : '3px solid transparent',
                transition: 'all 0.3s',
                whiteSpace: 'nowrap' as const,
              }}
              onMouseEnter={(e) => {
                if (activeTab !== tab.id) e.currentTarget.style.backgroundColor = '#f5f5f5';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Tab content */}
      <main className="p-6" style={{ maxWidth: 1400, margin: '0 auto' }}>
        {activeTab === 'daily' && <DailyTracker />}
        {activeTab === 'weekly' && <WeeklyReport />}
        {activeTab === 'annual' && <AnnualView />}
        {activeTab === 'online' && <OnlineTrends />}
        {activeTab === 'referrer' && <ReferrerView />}
        {activeTab === 'paid' && <PaidAds />}
        {activeTab === 'ambassador' && <AmbassadorGrowth />}
        {activeTab === 'settings' && <GoalEditor />}
      </main>
    </div>
  );
}
