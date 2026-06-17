/**
 * Client-side API helpers — all data goes through Supabase via API routes.
 * No localStorage anywhere. Ever.
 */

import type { DailySubmission, GoogleAdsDaily, MonthlySummary, MonthGoal, AuditPatient } from './types';
import { MONTHLY_GOALS_2026 } from './types';

const BASE = '';

// ---- Daily Submissions ----

// Hardcoded seed data (source of truth — merged with Supabase on every load)
// Supabase wins on date conflict, seed fills gaps.
// Source: Salesforce "New Online Patients THIS MONTH" + "Hybrid Screenings" exports, June 17, 2026
const DAILY_SUBMISSIONS_SEED: DailySubmission[] = [
  // June 2026 (online from New Online Patients, hybrid from Hybrid Screenings, income = online * 5)
  {date:'2026-06-01',online:77,hybrid:13,prime:0,visitors:0,income:385},
  {date:'2026-06-02',online:61,hybrid:12,prime:0,visitors:0,income:305},
  {date:'2026-06-03',online:46,hybrid:18,prime:0,visitors:0,income:230},
  {date:'2026-06-04',online:52,hybrid:8,prime:0,visitors:0,income:260},
  {date:'2026-06-05',online:46,hybrid:3,prime:0,visitors:0,income:230},
  {date:'2026-06-06',online:45,hybrid:1,prime:0,visitors:0,income:225},
  {date:'2026-06-07',online:24,hybrid:0,prime:0,visitors:0,income:120},
  {date:'2026-06-08',online:61,hybrid:3,prime:0,visitors:0,income:305},
  {date:'2026-06-09',online:64,hybrid:9,prime:0,visitors:0,income:320},
  {date:'2026-06-10',online:66,hybrid:12,prime:0,visitors:0,income:330},
  {date:'2026-06-11',online:63,hybrid:12,prime:0,visitors:0,income:315},
  {date:'2026-06-12',online:46,hybrid:8,prime:0,visitors:0,income:230},
  {date:'2026-06-13',online:29,hybrid:0,prime:0,visitors:0,income:145},
  {date:'2026-06-14',online:27,hybrid:0,prime:0,visitors:0,income:135},
  {date:'2026-06-15',online:37,hybrid:12,prime:0,visitors:0,income:185},
  {date:'2026-06-16',online:34,hybrid:10,prime:0,visitors:0,income:170},
];

function filterSeedByYearMonth(year?: number, month?: number): DailySubmission[] {
  return DAILY_SUBMISSIONS_SEED.filter(s => {
    const [y, m] = s.date.split('-').map(Number);
    if (year && y !== year) return false;
    if (month && m !== month) return false;
    return true;
  });
}

function mergeSubmissionsWithSeed(apiData: DailySubmission[], year?: number, month?: number): DailySubmission[] {
  const byDate = new Map<string, DailySubmission>();
  // Seed first (lower priority), filtered to requested year/month
  filterSeedByYearMonth(year, month).forEach(s => byDate.set(s.date, s));
  // API data overwrites seed on date conflict
  apiData.forEach(a => byDate.set(a.date, a));
  return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));
}

export async function fetchSubmissions(year?: number, month?: number): Promise<DailySubmission[]> {
    const params = new URLSearchParams();
    if (year) params.set('year', String(year));
    if (month) params.set('month', String(month));
    try {
        const res = await fetch(`${BASE}/api/submissions?${params}`);
        if (!res.ok) throw new Error(await res.text());
        const apiData: DailySubmission[] = await res.json();
        return mergeSubmissionsWithSeed(apiData, year, month);
    } catch {
        // API unreachable — return seed data only so dashboard still works
        return filterSeedByYearMonth(year, month);
    }
}

export async function upsertSubmission(entry: Partial<DailySubmission>): Promise<DailySubmission[]> {
    const res = await fetch(`${BASE}/api/submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

// ---- Google Ads Daily ----

export async function fetchGoogleAds(year?: number, month?: number): Promise<GoogleAdsDaily[]> {
    const params = new URLSearchParams();
    if (year) params.set('year', String(year));
    if (month) params.set('month', String(month));
    const res = await fetch(`${BASE}/api/google-ads?${params}`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

export async function upsertGoogleAds(entry: Partial<GoogleAdsDaily>): Promise<GoogleAdsDaily[]> {
    const res = await fetch(`${BASE}/api/google-ads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

// ---- Monthly Summaries ----

export async function fetchAnnualSummaries(year?: number): Promise<MonthlySummary[]> {
    const params = new URLSearchParams();
    if (year) params.set('year', String(year));
    const res = await fetch(`${BASE}/api/annual?${params}`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

export async function upsertMonthlySummary(entry: Partial<MonthlySummary>): Promise<MonthlySummary[]> {
    const res = await fetch(`${BASE}/api/annual`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

// ---- Audit Patients ----

export async function fetchAuditPatients(status?: string): Promise<AuditPatient[]> {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    const res = await fetch(`${BASE}/api/audit?${params}`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

export async function upsertAuditPatient(entry: Partial<AuditPatient> & { name: string }): Promise<AuditPatient[]> {
    const res = await fetch(`${BASE}/api/audit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

export async function deleteAuditPatient(id: number): Promise<void> {
    const res = await fetch(`${BASE}/api/audit?id=${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(await res.text());
}

// ---- Utility (all dates in Central Time) ----

/** Returns a Date object representing "now" in US Central time */
function centralNow(): Date {
    // Intl gives us the Central-time components regardless of server TZ
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Chicago',
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: false,
    }).formatToParts(new Date());
    const get = (t: string) => parts.find(p => p.type === t)?.value ?? '0';
    return new Date(+get('year'), +get('month') - 1, +get('day'),
                    +get('hour'), +get('minute'), +get('second'));
}

export function todayStr(): string {
    const d = centralNow();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function currentMonth(): number {
    return centralNow().getMonth() + 1;
}

export function currentYear(): number {
    return centralNow().getFullYear();
}

// ---- Monthly Goals (Settings) ----

export async function fetchMonthlyGoals(): Promise<MonthGoal[]> {
    try {
        const res = await fetch(`${BASE}/api/settings?key=monthly_goals_2026`);
        if (!res.ok) return MONTHLY_GOALS_2026;
        const data = await res.json();
        if (data && data.length > 0 && data[0].value) {
            return JSON.parse(data[0].value) as MonthGoal[];
        }
        return MONTHLY_GOALS_2026;
    } catch {
        return MONTHLY_GOALS_2026;
    }
}

export async function saveMonthlyGoals(goals: MonthGoal[]): Promise<void> {
    const res = await fetch(`${BASE}/api/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'monthly_goals_2026', value: JSON.stringify(goals) }),
    });
    if (!res.ok) throw new Error(await res.text());
}
