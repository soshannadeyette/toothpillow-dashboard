'use client';

import { useState } from 'react';
import DailyTracker from '@/components/DailyTracker';
import AnnualView from '@/components/AnnualView';
import OnlineTrends from '@/components/OnlineTrends';
import ReferrerView from '@/components/ReferrerView';
import PaidAds from '@/components/PaidAds';
import AmbassadorGrowth from '@/components/AmbassadorGrowth';
import GoalEditor from '@/components/GoalEditor';
import AirwayAudit from '@/components/AirwayAudit';

const TABS = [
  { id: 'daily', label: 'Daily Tracker' },
  { id: 'annual', label: 'Annual' },
  { id: 'online', label: 'Online' },
  { id: 'referrer', label: 'Referrer' },
  { id: 'paid', label: 'Paid Ads' },
  { id: 'ambassador', label: 'Ambassador Growth' },
  { id: 'audit', label: 'Airway Audit' },
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
        {activeTab === 'annual' && <AnnualView />}
        {activeTab === 'online' && <OnlineTrends />}
        {activeTab === 'referrer' && <ReferrerView />}
        {activeTab === 'paid' && <PaidAds />}
        {activeTab === 'ambassador' && <AmbassadorGrowth />}
        {activeTab === 'audit' && <AirwayAudit />}
        {activeTab === 'settings' && <GoalEditor />}
      </main>
    </div>
  );
}
